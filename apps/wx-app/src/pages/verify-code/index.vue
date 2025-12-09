<template>
  <view class="verify-page">
    <view class="background">
      <image class="bg-main" src="/static/pages/profile/bg-main.png" mode="scaleToFill" />
      <!-- <image class="bg-overlay" src="/static/pages/profile/rectangle-9.png" mode="scaleToFill" /> -->
      <view class="backdrop" />
    </view>

    <view class="content">
      <text class="title"> 验证码登录/注册 </text>
      <text class="subtitle"> 未注册的手机号将自动注册并登录 </text>

      <view class="field">
        <view class="input-bg" />
        <image class="field-icon" src="/static/pages/profile/phone-icon.png" mode="aspectFit" />
        <input
          v-model="phone"
          class="input"
          type="number"
          :placeholder="'请输入手机号'"
          placeholder-style="color: rgba(255, 255, 255, 0.5); line-height: 96rpx;"
          placeholder-class="verify-input-placeholder"
          maxlength="11"
        />
      </view>

      <view class="field code-field">
        <view class="input-bg" />
        <image class="field-icon" src="/static/pages/profile/code-icon.png" mode="aspectFit" />
        <input
          v-model="code"
          class="input"
          type="number"
          :placeholder="'请输入验证码'"
          placeholder-style="color: rgba(255, 255, 255, 0.5); line-height: 96rpx;"
          placeholder-class="verify-input-placeholder"
          maxlength="6"
        />
        <view class="send-btn" :class="{ disabled: countdown > 0 }" @tap="startCountdown">
          <text>{{ countdown > 0 ? `${countdown}s 后重发` : '发送验证码' }}</text>
        </view>
      </view>

      <view class="submit-btn" @tap="handleSubmit">
        <text class="submit-text"> 登 录 </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { authService, setAuthToken } from '@/api/auth';
import { fortuneService } from '@/api/fortune';
import { useAuthStore } from '@/stores/auth';
import { useFortuneStore } from '@/stores/fortune';

const authStore = useAuthStore();
const fortuneStore = useFortuneStore();

const phone = ref('');
const code = ref('');
const countdown = ref(0);
const currentNfcId = ref('');
const isLoading = ref(false);
const isSending = ref(false);
let timer: number | undefined;

onLoad(options => {
  if (options?.nfcId) {
    currentNfcId.value = String(options.nfcId);
    uni.setStorageSync('currentNfcId', currentNfcId.value);
  }
});

// 验证手机号格式
const validatePhone = (phoneNumber: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phoneNumber);
};

// 发送验证码
const startCountdown = async () => {
  if (countdown.value > 0 || isSending.value) return;

  // 验证手机号
  if (!phone.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }
  if (!validatePhone(phone.value)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' });
    return;
  }

  isSending.value = true;

  try {
    const response = await authService.sendCode(phone.value);

    if (response.success) {
      uni.showToast({ title: '验证码已发送', icon: 'success' });

      // 开始倒计时
      countdown.value = 60;
      timer = setInterval(() => {
        if (countdown.value <= 1) {
          countdown.value = 0;
          if (timer) {
            clearInterval(timer);
            timer = undefined;
          }
          return;
        }
        countdown.value -= 1;
      }, 1000) as unknown as number;
    } else {
      uni.showToast({ title: response.message || '发送失败', icon: 'none' });
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error);
    uni.showToast({ title: error.message || '发送失败，请稍后重试', icon: 'none' });
  } finally {
    isSending.value = false;
  }
};

// 登录
const handleSubmit = async () => {
  // 验证输入
  if (!phone.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }
  if (!validatePhone(phone.value)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' });
    return;
  }
  if (!code.value) {
    uni.showToast({ title: '请输入验证码', icon: 'none' });
    return;
  }
  if (code.value.length !== 6) {
    uni.showToast({ title: '验证码必须是6位数字', icon: 'none' });
    return;
  }

  if (isLoading.value) return;
  isLoading.value = true;

  try {
    const response = await authService.phoneLogin(
      phone.value,
      code.value,
      currentNfcId.value || undefined
    );

    if (response.success && response.data) {
      const { accessToken, user, profileComplete, hasBindings, nfcStatus } = response.data;

      console.log('[VerifyCode] 登录成功:', {
        profileComplete,
        hasBindings,
        nfcStatus,
        nfcId: currentNfcId.value,
      });

      // 保存token和用户信息到authStore
      setAuthToken(accessToken);
      authStore.setUser(user);

      // 判断NFC是否有效（可用于绑定）
      const nfcValid = nfcStatus === 'available' || nfcStatus === 'bound_to_self';

      // 根据条件判断跳转目标
      let targetUrl = '';

      if (!nfcValid && !hasBindings) {
        // 场景：无效NFC + 用户从未绑定过手链 → 访客模式
        console.log('[VerifyCode] 访客模式：NFC无效且用户未绑定过手链');
        targetUrl = '/pages/fortune/index?mode=visitor';
        authStore.setUserType('visitor');
      } else if (nfcValid && !profileComplete) {
        // 场景：有效NFC + 资料不完整 → 个人信息页
        console.log('[VerifyCode] 跳转个人信息页：NFC有效但资料不完整');
        targetUrl = `/pages/profile/index?nfcId=${currentNfcId.value}`;
      } else if (nfcValid && profileComplete && nfcStatus === 'available') {
        // 场景：有效NFC + 资料完整 + NFC未绑定 → 个人信息页（需要绑定新手链）
        console.log('[VerifyCode] 跳转个人信息页：需要绑定新手链');
        targetUrl = `/pages/profile/index?nfcId=${currentNfcId.value}`;
      } else if (hasBindings && profileComplete) {
        // 场景：已有绑定 + 资料完整 → 检查运势
        console.log('[VerifyCode] 已绑定用户，检查今日运势');
        authStore.setUserType('bound');
        targetUrl = await determineFortuneTarget();
      } else {
        // 兜底：访客模式
        console.log('[VerifyCode] 兜底：访客模式');
        targetUrl = '/pages/fortune/index?mode=visitor';
        authStore.setUserType('visitor');
      }

      uni.showToast({ title: '登录成功', icon: 'success' });

      setTimeout(() => {
        console.log('[VerifyCode] 跳转到:', targetUrl);
        uni.redirectTo({ url: targetUrl });
      }, 500);
    } else {
      uni.showToast({ title: response.message || '登录失败', icon: 'none' });
    }
  } catch (error: any) {
    console.error('登录失败:', error);
    uni.showToast({ title: error.message || '登录失败，请稍后重试', icon: 'none' });
  } finally {
    isLoading.value = false;
  }
};

// 根据今日运势决定跳转目标
async function determineFortuneTarget(): Promise<string> {
  try {
    const checkResponse = await fortuneService.checkTodayFortuneExists();

    if (checkResponse.success && checkResponse.data?.exists) {
      // 已有今日运势，获取数据并跳转到运势页面
      console.log('[VerifyCode] 检测到已有今日运势，获取数据');
      const fortuneResponse = await fortuneService.getTodayFortune();
      if (fortuneResponse.success && fortuneResponse.data) {
        fortuneStore.setFortune(fortuneResponse.data);
        return '/pages/fortune/index?preloaded=true';
      }
    }

    // 没有今日运势或获取失败，跳转到AI生成页面
    console.log('[VerifyCode] 没有今日运势，跳转到AI生成页面');
    return '/pages/ai-generation/index';
  } catch (error) {
    console.error('[VerifyCode] 检查今日运势失败:', error);
    return '/pages/ai-generation/index';
  }
}

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style lang="scss" scoped>
.verify-page {
  position: relative;
  min-height: 100vh;
  background: #0b0b1a;
  overflow: hidden;
}

.background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-main {
  position: absolute;
  top: -5.69%;
  left: -52.38%;
  width: 159.69%;
  height: 107.94%;
  opacity: 0.4;
  z-index: 1;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.95;
  z-index: 2;
}

.backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(120, 96, 255, 0.4), transparent 45%),
    radial-gradient(circle at 80% 30%, rgba(255, 120, 255, 0.25), transparent 40%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.6) 100%);
  z-index: 3;
}

.content {
  position: relative;
  z-index: 4;
  padding: 200rpx 60rpx 80rpx;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  color: #fff;
}

.title {
  text-align: center;
  font-size: 44rpx;
  font-weight: 700;
}

.subtitle {
  text-align: center;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.field {
  position: relative;
  height: 96rpx;
  border-radius: 48rpx;
  overflow: hidden;
}

.input-bg {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 48rpx;
}

.field-icon {
  position: absolute;
  left: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  z-index: 2;
}

.input {
  position: absolute;
  inset: 0;
  padding: 0 30rpx 0 110rpx;
  font-size: 26rpx;
  color: #fff;
  line-height: 96rpx !important;
  height: 96rpx;
}

:deep(.verify-input-placeholder) {
  line-height: 96rpx !important;
  height: 96rpx;
  display: block;
}

.code-field {
  display: flex;
  align-items: center;
}

.send-btn {
  position: absolute;
  right: 18rpx;
  top: 18rpx;
  height: 60rpx;
  padding: 0 26rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #fff;
  z-index: 2;
}

.send-btn.disabled {
  opacity: 0.65;
}

.submit-btn {
  margin-top: 10rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #7c5df8 0%, #5c5cf8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
  letter-spacing: 6rpx;
}
</style>

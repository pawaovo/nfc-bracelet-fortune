<template>
  <view class="profile-container">
    <!-- 主背景容器 -->
    <view class="main-background" :class="{ 'background-ready': backgroundReady }">
      <!-- 主背景图片 -->
      <image
        class="bg-main"
        :src="config.images.mainBackground"
        mode="scaleToFill"
        @load="handleBackgroundComplete"
        @error="handleBackgroundComplete"
      />

      <!-- 星空背景图片 -->
      <image
        class="bg-stars"
        :src="config.images.starsBackground"
        mode="scaleToFill"
        @load="handleBackgroundComplete"
        @error="handleBackgroundComplete"
      />

      <!-- 星空卡片淡暗色遮罩层 -->
      <view class="stars-overlay" />
    </view>

    <!-- 头像占位图 -->
    <image class="avatar-placeholder" :src="config.images.avatarPlaceholder" mode="aspectFill" />

    <!-- 引导文字区域 -->
    <view class="guide-text-container">
      <text class="guide-title">
        {{ config.texts.mainTitle }}
      </text>
      <text class="guide-subtitle">
        {{ config.texts.subtitle }}
      </text>
    </view>

    <!-- 用户名显示区域 - 只在用户填写名称后显示 -->
    <view v-if="displayUsername" class="username-container">
      <!-- 头像图标 - 暂时隐藏，保留代码便于后续恢复 -->
      <image v-if="false" class="avatar-icon" :src="config.images.avatarIcon" mode="aspectFit" />
      <!-- 用户名文字 -->
      <text class="username-text">
        {{ displayUsername }}
      </text>
    </view>

    <!-- 称呼标签 -->
    <text class="name-label">
      {{ config.texts.nameLabel }}
    </text>

    <!-- 称呼输入框 -->
    <view class="name-input-container">
      <view class="input-bg" />
      <input
        v-model="formData.name"
        class="name-input"
        type="nickname"
        :placeholder="config.texts.namePlaceholder"
        placeholder-style="color: rgba(255, 255, 255, 0.5);"
        maxlength="20"
      />
    </view>

    <!-- 密码标签 -->
    <text class="password-label">
      {{ config.texts.passwordLabel }}
    </text>

    <!-- 密码输入框 -->
    <view class="password-input-container">
      <view class="input-bg" />
      <input
        v-model="formData.password"
        class="password-input"
        type="text"
        password
        :placeholder="config.texts.passwordPlaceholder"
        placeholder-style="color: rgba(255, 255, 255, 0.5);"
        maxlength="64"
      />
    </view>

    <!-- 生日标签 -->
    <text class="birthday-label">
      {{ config.texts.birthdayLabel }}
    </text>

    <!-- 生日输入框 -->
    <view class="birthday-input-container">
      <view class="input-bg" />
      <picker
        mode="date"
        :value="formData.birthday"
        class="birthday-picker"
        @change="onBirthdayChange"
      >
        <text class="birthday-input" :class="{ placeholder: !formData.birthday }">
          {{ formData.birthday || config.texts.birthdayPlaceholder }}
        </text>
      </picker>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-button-container" @click="handleSubmitClick">
      <image class="button-bg" :src="config.images.buttonBackground" mode="aspectFit" />
      <view v-if="isLoading" class="button-loading">
        <view class="button-loading-spinner" />
        <text class="button-text"> 保存中... </text>
      </view>
      <text v-else class="button-text">
        {{ config.texts.submitButton }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { profileService, validateName, validateBirthday } from '@/api/profile';
import { useAuthStore } from '@/stores/auth';
import { useFortuneStore } from '@/stores/fortune';
import { getTheme } from './config';
import type { ProfilePageTheme } from './config';
import { generateDevJWT } from '@/utils/devToken';
import type { UserPartial } from '@shared/types';
import { preloadPagFile } from '@/utils/pagPreloader';

const config = ref<ProfilePageTheme>(getTheme('default'));
const authStore = useAuthStore();
const fortuneStore = useFortuneStore();

const formData = reactive({
  name: '',
  password: '',
  birthday: '',
});

const isLoading = ref(false);
const currentNfcId = ref('');
const isH5Platform = process.env.UNI_PLATFORM === 'h5';

// 背景图片加载状态
const backgroundReady = ref(false);
let loadedCount = 0;

/**
 * 处理背景图片加载完成或失败
 */
function handleBackgroundComplete() {
  loadedCount++;
  if (loadedCount >= 2) {
    backgroundReady.value = true;
  }
}
const isDevMode = import.meta.env.MODE !== 'production';
const enableDevWebAuth = isH5Platform && isDevMode;
const FORCE_RELOAD_FLAG_KEY = 'fortuneForceReload';

const displayUsername = computed(() => {
  return authStore.user?.name || formData.name || '';
});

const formatDateForInput = (value: Date | string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const initFormFromUser = () => {
  if (!authStore.user) return;
  formData.name = authStore.user.name || authStore.user.username || '';
  formData.birthday = formatDateForInput(authStore.user.birthday || null);
};

const syncNfcId = (options?: Record<string, unknown>) => {
  const fromQuery = (options?.nfcId as string) || '';
  const stored = uni.getStorageSync('currentNfcId') || '';
  const nextId = fromQuery || stored || '';
  if (fromQuery) {
    uni.setStorageSync('currentNfcId', fromQuery);
  }
  currentNfcId.value = nextId;
};

const onBirthdayChange = (event: { detail: { value: string } }) => {
  formData.birthday = event.detail.value;
};

const validateForm = (): boolean => {
  if (!validateName(formData.name)) {
    if (!formData.name.trim()) {
      uni.showToast({ title: '请输入用户名称', icon: 'none', duration: 2000 });
    } else {
      uni.showToast({ title: '用户名称格式不正确', icon: 'none', duration: 2000 });
    }
    return false;
  }

  const trimmedPassword = formData.password.trim();
  if (trimmedPassword.length < 6) {
    uni.showToast({ title: '密码长度需至少 6 位', icon: 'none', duration: 2000 });
    return false;
  }

  if (!validateBirthday(formData.birthday)) {
    if (!formData.birthday) {
      uni.showToast({ title: '请选择生日', icon: 'none', duration: 2000 });
    } else {
      uni.showToast({ title: '生日格式不正确', icon: 'none', duration: 2000 });
    }
    return false;
  }

  return true;
};

const navigateAfterProfileSave = () => {
  const resolvedNfcId = currentNfcId.value || uni.getStorageSync('currentNfcId');
  if (!resolvedNfcId) {
    uni.redirectTo({ url: '/pages/fortune/index?mode=visitor' });
    return;
  }

  uni.redirectTo({
    url: '/pages/ai-generation/index?fromProfile=true',
  });
};

const buildSubmitPayload = () => {
  const trimmedName = formData.name.trim();
  const trimmedPassword = formData.password.trim();

  // 网页版：使用表单输入的用户名（formData.name）
  // 小程序版：使用已登录用户的username，如果没有则使用表单输入
  const username = isH5Platform
    ? trimmedName // 网页版直接使用表单输入的昵称作为用户名
    : authStore.user?.username?.trim() || authStore.user?.name?.trim() || trimmedName;

  const payload: {
    username: string;
    password: string;
    name: string;
    birthday: string;
    nfcId?: string;
  } = {
    username,
    password: trimmedPassword,
    name: trimmedName,
    birthday: formData.birthday,
  };

  if (currentNfcId.value) {
    payload.nfcId = currentNfcId.value;
  }

  return payload;
};

const ensureDevWebAuth = (user: UserPartial) => {
  if (!enableDevWebAuth || authStore.isAuthenticated) {
    return;
  }
  const openid = user.wechatOpenId || `web_${user.username || user.id}`;
  const token = generateDevJWT(user.id, openid);
  authStore.login(token, user);
};

const handleProfileSuccess = async (message: string, user?: UserPartial) => {
  if (user) {
    if (enableDevWebAuth) {
      ensureDevWebAuth(user);
    } else {
      authStore.setUser(user);
    }
  }
  fortuneStore.clearFortune();
  uni.setStorageSync(FORCE_RELOAD_FLAG_KEY, '1');

  uni.showToast({ title: message, icon: 'success', duration: 1500 });
  setTimeout(async () => {
    navigateAfterProfileSave();
  }, 1500);
};

const submitAsWeb = async () => {
  if (!currentNfcId.value) {
    uni.showToast({ title: '未获取到NFC信息', icon: 'none', duration: 2000 });
    throw new Error('missing_nfc');
  }

  const payload = buildSubmitPayload();

  const response = await profileService.registerWeb(payload);
  if (!response.success || !response.data) {
    throw new Error(response.message || '绑定失败');
  }

  await handleProfileSuccess('绑定成功', response.data);
};

const submitWithAuth = async () => {
  if (!authStore.isAuthenticated) {
    uni.showToast({ title: '请先完成绑定', icon: 'none', duration: 2000 });
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/bind/index' });
    }, 1500);
    throw new Error('unauthorized');
  }

  const response = await profileService.updateProfile(buildSubmitPayload());
  if (!response.success || !response.data) {
    throw new Error(response.message || '保存失败');
  }

  await handleProfileSuccess('信息保存成功', response.data);
};

const handleSubmitClick = async () => {
  if (isLoading.value) return;
  if (!validateForm()) return;

  try {
    isLoading.value = true;
    if (isH5Platform) {
      await submitAsWeb();
    } else {
      await submitWithAuth();
    }
  } catch (error) {
    if (error instanceof Error && ['missing_nfc', 'unauthorized'].includes(error.message)) {
      return;
    }

    // 根据错误类型显示友好提示
    let errorMessage = '保存失败，请重试';

    if (error instanceof Error && error.message) {
      const message = error.message;

      if (message.includes('网络') || message.includes('network')) {
        errorMessage = '网络连接失败，请检查网络';
      } else if (message.includes('超时') || message.includes('timeout')) {
        errorMessage = '请求超时，请重试';
      } else if (message.includes('验证') || message.includes('validate')) {
        errorMessage = '信息格式不正确，请检查';
      } else {
        // 其他错误直接使用原始错误信息
        errorMessage = message;
      }
    }

    uni.showToast({ title: errorMessage, icon: 'none', duration: 2000 });
  } finally {
    isLoading.value = false;
  }
};

onLoad(options => {
  console.log('个人信息页加载', options);
  authStore.initFromStorage();
  syncNfcId(options);
  initFormFromUser();

  if (!isH5Platform && !authStore.isAuthenticated) {
    uni.redirectTo({ url: '/pages/bind/index' });
    return;
  }

  // 预下载PAG文件（后台下载，不阻塞用户操作）
  preloadPagFile()
    .then(success => {
      if (success) {
        console.log('✅ PAG文件预下载成功');
      } else {
        console.warn('⚠️ PAG文件预下载失败，将在AI生成页面重新下载');
      }
    })
    .catch(error => {
      console.error('❌ PAG文件预下载异常:', error);
    });
});
</script>

<style lang="scss" scoped>
/**
 * 个人信息页面样式
 * 设计图基准尺寸: 402.118px × 874.026px
 * 转换比例: 750 / 402.118 ≈ 1.865
 */

/* 页面容器 - 始终显示渐变背景色 */
.profile-container {
  position: relative;
  min-height: 100vh;
  height: 1627rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* 主背景容器 - 初始状态透明 */
.main-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.4s ease-in;

  .bg-main {
    position: absolute;
    top: -5.69%;
    left: -52.38%;
    width: 159.69%;
    height: 107.94%;
    z-index: 1;
  }

  .bg-stars {
    position: absolute;
    top: 200rpx;
    left: 30rpx;
    width: 690rpx;
    height: 1140rpx;
    z-index: 100;
  }

  /* 星空卡片淡暗色遮罩层 */
  .stars-overlay {
    position: absolute;
    top: 200rpx;
    left: 30rpx;
    width: 690rpx;
    height: 1140rpx;
    background: rgba(0, 0, 0, 0.2);
    z-index: 101;
    pointer-events: none;
  }
}

/* 背景图片加载完成 - 淡入显示 */
.main-background.background-ready {
  opacity: 1;
}

/* 头像占位图 */
.avatar-placeholder {
  position: absolute;
  top: 29.5%;
  left: 10.27%;
  width: 78.53%;
  height: 49.04%;
  z-index: 150;
}

/* 引导文字容器 */
.guide-text-container {
  position: absolute;
  top: 19.03%;
  left: 14.8%;
  right: 14.8%;
  z-index: 200;
}

/* 引导标题 "仅需一步" */
.guide-title {
  display: block;
  font-family: 'PingFang SC', sans-serif;
  font-size: 48rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: normal;
  text-align: center;
  margin-bottom: 10rpx;
}

/* 引导副标题 "为你的专属运势注入灵魂" */
.guide-subtitle {
  display: block;
  font-family: 'PingFang SC', sans-serif;
  font-size: 48rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: normal;
  text-align: center;
}

/* 用户名容器 - 隐藏头像后调整为左对齐 */
.username-container {
  position: absolute;
  top: 32.5%;
  left: 20%;
  right: 20%;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 头像图标 - 暂时隐藏，保留样式便于后续恢复 */
.avatar-icon {
  width: 77rpx;
  height: 77rpx;
  margin-right: 22rpx;
  flex-shrink: 0;
}

/* 用户名文字 - 隐藏头像后无需调整，自动左对齐 */
.username-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 36.625rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: normal;
  text-align: center;
}

/* 称呼标签 */
.name-label {
  position: absolute;
  top: 38.5%;
  left: 21.87%;
  font-family: 'PingFang SC', sans-serif;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: normal;
  z-index: 200;
}

/* 称呼输入框容器 */
.name-input-container {
  position: absolute;
  top: 41.5%;
  left: 20%;
  right: 20.53%;
  height: 82rpx;
  z-index: 200;
}

/* 输入框背景 */
.password-label {
  position: absolute;
  top: 48.5%;
  left: 21.87%;
  font-family: 'PingFang SC', sans-serif;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: normal;
  z-index: 200;
}

.password-input-container {
  position: absolute;
  top: 51.5%;
  left: 20%;
  right: 20.53%;
  height: 82rpx;
  z-index: 200;
}

.password-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0 30rpx;
  font-family: 'PingFang SC', sans-serif;
  font-size: 25rpx;
  color: #ffffff;
  line-height: 82rpx;
}
.input-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 48rpx;
}

/* 称呼输入框 */
.name-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0 30rpx;
  font-family: 'PingFang SC', sans-serif;
  font-size: 25rpx;
  color: #ffffff;
  background: transparent;
  box-sizing: border-box;
}

/* 生日标签 */
.birthday-label {
  position: absolute;
  top: 58.5%;
  left: 21.87%;
  font-family: 'PingFang SC', sans-serif;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: normal;
  z-index: 200;
}

/* 生日输入框容器 */
.birthday-input-container {
  position: absolute;
  top: 61.5%;
  left: 20%;
  right: 20.53%;
  height: 82rpx;
  z-index: 200;
}

/* 生日选择器 */
.birthday-picker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 生日输入框 */
.birthday-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0 30rpx;
  font-family: 'PingFang SC', sans-serif;
  font-size: 25rpx;
  color: #ffffff;
  line-height: 82rpx;
  display: flex;
  align-items: center;

  &.placeholder {
    opacity: 0.5;
  }
}

/* 提交按钮容器 */
.submit-button-container {
  position: absolute;
  top: 1140rpx;
  left: 143rpx;
  width: 458rpx;
  height: 115rpx;
  z-index: 200;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 按钮背景 */
.button-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 按钮文字 */
.button-text {
  position: relative;
  z-index: 2;
  font-family: 'PingFang SC', sans-serif;
  font-size: 36rpx;
  font-weight: 400; /* 从600改为400，使用正常粗细 */
  color: #ffffff;
  line-height: 115rpx;
  text-align: center;
}

/* 按钮loading状态 */
.button-loading {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.button-loading-spinner {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.3);
  border-top: 3rpx solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

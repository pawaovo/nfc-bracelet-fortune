<template>
  <view class="profile-container">
    <!-- 背景装饰 -->
    <view class="background-decoration">
      <view class="decoration-circle decoration-circle-1" />
      <view class="decoration-circle decoration-circle-2" />
      <view class="decoration-circle decoration-circle-3" />
    </view>

    <!-- 主要内容 -->
    <view class="content">
      <!-- 标题区域 -->
      <view class="header">
        <view class="title"> 完善个人信息 </view>
        <view class="subtitle"> 让我们为你生成专属运势 </view>
      </view>

      <!-- 表单区域 -->
      <view class="form-container">
        <!-- 称呼输入框 -->
        <view class="form-item">
          <view class="form-label"> 称呼 </view>
          <input
            v-model="formData.name"
            class="form-input"
            type="text"
            placeholder="请输入你的常用称呼"
            maxlength="20"
          />
        </view>

        <!-- 生日选择器 -->
        <view class="form-item">
          <view class="form-label"> 生日 </view>
          <picker
            mode="date"
            :value="formData.birthday"
            class="birthday-picker"
            @change="onBirthdayChange"
          >
            <view class="picker-display">
              <text class="picker-text" :class="{ placeholder: !formData.birthday }">
                {{ formData.birthday || '请选择你的生日' }}
              </text>
              <view class="calendar-icon"> 📅 </view>
            </view>
          </picker>
        </view>

        <!-- 提交按钮 -->
        <button
          class="submit-button"
          :class="{ loading: isLoading }"
          :disabled="isLoading"
          @click="handleSubmitClick"
        >
          <text v-if="!isLoading"> 开启我的好运 </text>
          <text v-else> 保存中... </text>
        </button>
      </view>

      <!-- 底部提示 -->
      <view class="footer-tip">
        <text class="tip-text"> 你的信息将用于生成个性化运势，我们会严格保护你的隐私 </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { profileService, validateName, validateBirthday } from '@/api/profile';
import { useAuthStore } from '@/stores/auth';

// 表单数据
const formData = reactive({
  name: '',
  birthday: '',
});

// 加载状态
const isLoading = ref(false);

/**
 * 生日选择器变化事件
 */
const onBirthdayChange = (event: { detail: { value: string } }) => {
  formData.birthday = event.detail.value;
};

/**
 * 表单验证
 */
const validateForm = (): boolean => {
  // 验证称呼
  if (!validateName(formData.name)) {
    if (!formData.name.trim()) {
      uni.showToast({
        title: '请输入你的称呼',
        icon: 'none',
        duration: 2000,
      });
    } else if (formData.name.trim().length < 1 || formData.name.trim().length > 20) {
      uni.showToast({
        title: '称呼长度应在1-20个字符之间',
        icon: 'none',
        duration: 2000,
      });
    } else {
      uni.showToast({
        title: '称呼格式不正确，请使用中文、英文或数字',
        icon: 'none',
        duration: 2000,
      });
    }
    return false;
  }

  // 验证生日
  if (!validateBirthday(formData.birthday)) {
    if (!formData.birthday) {
      uni.showToast({
        title: '请选择你的生日',
        icon: 'none',
        duration: 2000,
      });
    } else {
      uni.showToast({
        title: '生日格式不正确，请重新选择',
        icon: 'none',
        duration: 2000,
      });
    }
    return false;
  }

  return true;
};

/**
 * 提交按钮点击事件
 */
const handleSubmitClick = async () => {
  // 表单验证
  if (!validateForm()) {
    return;
  }

  try {
    isLoading.value = true;

    // 验证登录状态
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      console.error('用户未登录，需要重新登录');
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
      });
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/bind/index',
        });
      }, 2000);
      return;
    }

    // 调用API更新用户信息
    console.log('提交表单数据:', formData);

    const response = await profileService.updateProfile({
      name: formData.name.trim(),
      birthday: formData.birthday,
    });

    if (response.success) {
      console.log('用户信息更新成功:', response.data);

      // 更新 authStore 中的用户信息
      const authStore = useAuthStore();
      authStore.setUser(response.data);

      // 显示成功提示
      uni.showToast({
        title: '信息保存成功',
        icon: 'success',
        duration: 1500,
      });

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        // 检查用户是否通过NFC绑定流程进入
        const currentNfcId = uni.getStorageSync('currentNfcId');

        if (currentNfcId) {
          // NFC绑定用户，跳转到完整版运势页面
          uni.redirectTo({
            url: '/pages/fortune/index?fromProfile=true',
          });
        } else {
          // 新访客用户，跳转到访客版运势页面
          uni.redirectTo({
            url: '/pages/fortune/index?mode=visitor',
          });
        }
      }, 1500);
    } else {
      throw new Error(response.message || '保存失败');
    }
  } catch (error) {
    console.error('提交失败:', error);

    let errorMessage = '保存失败，请重试';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    uni.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 2000,
    });
  } finally {
    isLoading.value = false;
  }
};

// 页面生命周期
onLoad(() => {
  console.log('个人信息补全页面加载');

  // 初始化 auth store
  const authStore = useAuthStore();
  authStore.initFromStorage();

  // 验证登录状态
  if (!authStore.isAuthenticated) {
    console.warn('用户未登录，跳转到绑定页面');
    uni.redirectTo({
      url: '/pages/bind/index',
    });
  }
});
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);

  &.decoration-circle-1 {
    width: 200rpx;
    height: 200rpx;
    top: 10%;
    right: -50rpx;
    animation: float 6s ease-in-out infinite;
  }

  &.decoration-circle-2 {
    width: 150rpx;
    height: 150rpx;
    top: 60%;
    left: -30rpx;
    animation: float 8s ease-in-out infinite reverse;
  }

  &.decoration-circle-3 {
    width: 100rpx;
    height: 100rpx;
    top: 30%;
    left: 20%;
    animation: float 10s ease-in-out infinite;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.content {
  position: relative;
  z-index: 1;
  padding: 120rpx 60rpx 60rpx;
}

.header {
  text-align: center;
  margin-bottom: 80rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.form-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.form-item {
  margin-bottom: 40rpx;

  &:last-of-type {
    margin-bottom: 60rpx;
  }
}

.form-label {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: #333333;
  box-sizing: border-box;

  &:focus {
    border-color: #667eea;
    background: #ffffff;
  }
}

.birthday-picker {
  width: 100%;
}

.picker-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.picker-text {
  font-size: 30rpx;
  color: #333333;

  &.placeholder {
    color: #999999;
  }
}

.calendar-icon {
  font-size: 32rpx;
  color: #667eea;
}

.submit-button {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 48rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
  }

  &.loading {
    opacity: 0.7;
    transform: none;
  }

  &[disabled] {
    opacity: 0.7;
  }
}

.footer-tip {
  margin-top: 60rpx;
  text-align: center;
}

.tip-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}
</style>

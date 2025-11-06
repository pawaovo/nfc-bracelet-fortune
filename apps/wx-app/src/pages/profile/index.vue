<template>
  <view class="profile-container">
    <!-- 主背景容器 -->
    <view class="main-background">
      <!-- 主背景图片 -->
      <image class="bg-main" :src="config.images.mainBackground" mode="scaleToFill" />

      <!-- 星空背景图片 -->
      <image class="bg-stars" :src="config.images.starsBackground" mode="scaleToFill" />

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
      <!-- 头像图标 -->
      <image class="avatar-icon" :src="config.images.avatarIcon" mode="aspectFit" />
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
      <text v-if="!isLoading" class="button-text">
        {{ config.texts.submitButton }}
      </text>
      <text v-else class="button-text"> 保存中... </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { profileService, validateName, validateBirthday } from '@/api/profile';
import { useAuthStore } from '@/stores/auth';
import { getTheme } from './config';
import type { ProfilePageTheme } from './config';

// 页面配置
const config = ref<ProfilePageTheme>(getTheme('default'));

// 表单数据
const formData = reactive({
  name: '',
  birthday: '',
});

// 加载状态
const isLoading = ref(false);

// 显示的用户名（只有在用户已有名称或填写了名称时才显示）
const displayUsername = computed(() => {
  const authStore = useAuthStore();
  // 优先显示已保存的用户名，其次显示当前输入的名称
  return authStore.user?.name || formData.name || '';
});

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

    if (response.success && response.data) {
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
/**
 * 个人信息页面样式
 * 设计图基准尺寸: 402.118px × 874.026px
 * 转换比例: 750 / 402.118 ≈ 1.865
 */

.profile-container {
  position: relative;
  min-height: 100vh;
  height: 1627rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* 主背景容器 */
.main-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;

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

/* 用户名容器 */
.username-container {
  position: absolute;
  top: 38.24%;
  left: 26.53%;
  right: 27.07%;
  z-index: 200;
  display: flex;
  align-items: center;
}

/* 头像图标 */
.avatar-icon {
  width: 77rpx;
  height: 77rpx;
  margin-right: 22rpx;
  flex-shrink: 0;
}

/* 用户名文字 */
.username-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 36.625rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: normal;
}

/* 称呼标签 */
.name-label {
  position: absolute;
  top: 46.98%;
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
  top: 50.68%;
  left: 20%;
  right: 20.53%;
  height: 82rpx;
  z-index: 200;
}

/* 输入框背景 */
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
  top: 59.17%;
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
  top: 62.93%;
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
  font-weight: 600;
  color: #ffffff;
  line-height: 115rpx;
  text-align: center;
}
</style>

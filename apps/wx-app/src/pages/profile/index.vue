<template>
  <view class="profile-container">
    <!-- 主背景容器 -->
    <view class="main-background">
      <!-- 主背景图片 -->
      <image class="bg-main" :src="config.images.mainBackground" mode="scaleToFill" />

      <!-- 星空背景图片 -->
      <image class="bg-stars" :src="config.images.starsBackground" mode="scaleToFill" />
    </view>

    <!-- 状态栏区域（日期时间显示） -->
    <view class="status-bar">
      <!-- 状态栏图标 -->
      <image class="status-icon" :src="config.images.calendarIcon" mode="aspectFit" />
      <!-- 时间显示 -->
      <view class="time-display">
        <text class="date-text">
          {{ currentDate }}
        </text>
        <text class="weekday-text">
          {{ currentWeekday }}
        </text>
      </view>
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

    <!-- 用户名显示区域 -->
    <view class="username-container">
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
      <image class="input-bg" :src="config.images.inputNameBackground" mode="scaleToFill" />
      <input
        v-model="formData.name"
        class="name-input"
        type="text"
        :placeholder="config.texts.namePlaceholder"
        maxlength="20"
      />
    </view>

    <!-- 生日标签 -->
    <text class="birthday-label">
      {{ config.texts.birthdayLabel }}
    </text>

    <!-- 生日输入框 -->
    <view class="birthday-input-container">
      <image class="input-bg" :src="config.images.inputBirthdayBackground" mode="scaleToFill" />
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
      <image class="button-bg" :src="config.images.buttonBackground" mode="scaleToFill" />
      <text v-if="!isLoading" class="button-text">
        {{ config.texts.submitButton }}
      </text>
      <text v-else class="button-text"> 保存中... </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { profileService, validateName, validateBirthday } from '@/api/profile';
import { useAuthStore } from '@/stores/auth';
import { getTheme, getCurrentDate, getCurrentWeekday } from './config';
import type { ProfilePageTheme } from './config';

// 页面配置
const config = ref<ProfilePageTheme>(getTheme('default'));

// 当前日期和星期
const currentDate = ref<string>(getCurrentDate());
const currentWeekday = ref<string>(getCurrentWeekday());

// 表单数据
const formData = reactive({
  name: '',
  birthday: '',
});

// 加载状态
const isLoading = ref(false);

// 显示的用户名（如果已有用户信息则显示，否则显示配置的默认值）
const displayUsername = computed(() => {
  const authStore = useAuthStore();
  return authStore.user?.name || config.value.texts.username;
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

// 组件挂载时更新日期和星期
onMounted(() => {
  currentDate.value = getCurrentDate();
  currentWeekday.value = getCurrentWeekday();
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
    top: 120rpx;
    left: 20rpx;
    width: 720rpx;
    height: 1280rpx;
    z-index: 100;
  }
}

/* 状态栏区域 */
.status-bar {
  position: absolute;
  top: 120rpx;
  left: 200rpx;
  width: 322rpx;
  height: 48rpx;
  z-index: 200;
  display: flex;
  align-items: center;

  .status-icon {
    width: 322rpx;
    height: 48rpx;
  }

  .time-display {
    position: absolute;
    left: 70rpx;
    top: 6rpx;
    display: flex;
    gap: 35rpx;

    .date-text {
      font-family: 'ABeeZee', sans-serif;
      font-size: 22rpx;
      color: #ffffff;
      font-weight: 400;
    }

    .weekday-text {
      font-family: 'ABeeZee', 'Noto Sans JP', sans-serif;
      font-size: 22rpx;
      color: #ffffff;
      font-weight: 400;
    }
  }
}

/* 头像占位图 */
.avatar-placeholder {
  position: absolute;
  top: 480rpx;
  left: 77rpx;
  width: 588rpx;
  height: 796rpx;
  z-index: 150;
}

/* 引导文字容器 - 复用绑定页面的欢迎文案样式 */
.guide-text-container {
  position: absolute;
  top: 279rpx;
  left: 151rpx;
  width: 420rpx;
  z-index: 200;
}

/* 引导标题 - 对应绑定页面的 welcome-title */
.guide-title {
  display: block;
  font-family: 'ABeeZee', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
  font-size: 35rpx;
  color: #ffffff;
  font-weight: 400;
  line-height: 51rpx;
  margin-bottom: 17rpx;
}

/* 引导副标题 - 对应绑定页面的 welcome-subtitle */
.guide-subtitle {
  display: block;
  font-family: 'ABeeZee', 'Noto Sans JP', 'Noto Sans SC', sans-serif;
  font-size: 35rpx;
  color: #ffffff;
  font-weight: 400;
  line-height: 51rpx;
  margin-bottom: 70rpx;
}

/* 用户名容器 */
.username-container {
  position: absolute;
  top: 560rpx;
  left: 185rpx;
  z-index: 200;
  display: flex;
  align-items: center;
}

/* 头像图标 */
.avatar-icon {
  width: 77rpx;
  height: 77rpx;
  margin-right: 22rpx;
}

/* 用户名文字 */
.username-text {
  font-family: 'ABeeZee', 'Noto Sans JP', sans-serif;
  font-size: 37rpx;
  color: #ffffff;
  line-height: 99rpx;
}

/* 称呼标签 */
.name-label {
  position: absolute;
  top: 700rpx;
  left: 157rpx;
  font-family: 'ABeeZee', 'Noto Sans JP', sans-serif;
  font-size: 37rpx;
  color: #ffffff;
  line-height: 95rpx;
  z-index: 200;
}

/* 称呼输入框容器 */
.name-input-container {
  position: absolute;
  top: 772rpx;
  left: 143rpx;
  width: 458rpx;
  height: 81rpx;
  z-index: 200;
}

/* 输入框背景图片 */
.input-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.4;
}

/* 称呼输入框 */
.name-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0 19rpx; // 10 × 1.865
  font-family: 'ABeeZee', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
  font-size: 28rpx; // 15 × 1.865
  color: #ffffff;
  background: transparent;
  box-sizing: border-box;
}

/* 生日标签 */
.birthday-label {
  position: absolute;
  top: 903rpx;
  left: 157rpx;
  font-family: 'ABeeZee', 'Noto Sans JP', sans-serif;
  font-size: 37rpx;
  color: #ffffff;
  line-height: 95rpx;
  z-index: 200;
}

/* 生日输入框容器 */
.birthday-input-container {
  position: absolute;
  top: 975rpx;
  left: 143rpx;
  width: 458rpx;
  height: 81rpx;
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
  padding: 0 19rpx;
  font-family: 'ABeeZee', 'Noto Sans SC', 'Noto Sans JP', sans-serif;
  font-size: 28rpx;
  color: #ffffff;
  line-height: 81rpx;
  display: flex;
  align-items: center;

  &.placeholder {
    opacity: 0.7;
  }
}

/* 提交按钮容器 */
.submit-button-container {
  position: absolute;
  top: 1140rpx;
  left: 195rpx;
  width: 360rpx;
  height: 68rpx;
  z-index: 200;
  cursor: pointer;
}

/* 按钮背景图片 */
.button-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 按钮文字 */
.button-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'ABeeZee', 'Noto Sans JP', sans-serif;
  font-size: 28rpx;
  color: #ffffff;
  line-height: 84rpx;
}
</style>

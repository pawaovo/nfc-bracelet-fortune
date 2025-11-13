<template>
  <view class="profile-container">
    <image class="bg-main" :src="config.images.mainBackground" mode="aspectFill" />
    <image class="bg-stars" :src="config.images.starsBackground" mode="aspectFill" />

    <view class="profile-content">
      <view class="header">
        <image
          class="avatar-placeholder"
          :src="config.images.avatarPlaceholder"
          mode="aspectFill"
        />
        <text class="title">
          {{ config.texts.mainTitle }}
        </text>
        <text class="subtitle">
          {{ config.texts.subtitle }}
        </text>
      </view>

      <view class="form-card">
        <view class="form-field">
          <text class="field-label">
            {{ config.texts.usernameLabel }}
          </text>
          <input
            v-model="formData.username"
            class="field-input"
            type="text"
            :placeholder="config.texts.usernamePlaceholder"
            placeholder-style="color: rgba(255, 255, 255, 0.5);"
            maxlength="32"
          />
        </view>

        <view class="form-field">
          <text class="field-label">
            {{ config.texts.passwordLabel }}
          </text>
          <input
            v-model="formData.password"
            class="field-input"
            type="text"
            password
            :placeholder="config.texts.passwordPlaceholder"
            placeholder-style="color: rgba(255, 255, 255, 0.5);"
            maxlength="64"
          />
        </view>

        <view class="form-field">
          <text class="field-label">
            {{ config.texts.nameLabel }}
          </text>
          <input
            v-model="formData.name"
            class="field-input"
            type="text"
            :placeholder="config.texts.namePlaceholder"
            placeholder-style="color: rgba(255, 255, 255, 0.5);"
            maxlength="20"
          />
        </view>

        <view class="form-field">
          <text class="field-label">
            {{ config.texts.birthdayLabel }}
          </text>
          <picker mode="date" :value="formData.birthday" @change="onBirthdayChange">
            <view class="picker-display" :class="{ placeholder: !formData.birthday }">
              {{ formData.birthday || config.texts.birthdayPlaceholder }}
            </view>
          </picker>
        </view>

        <view v-if="currentNfcId" class="nfc-tip"> NFC ID：{{ currentNfcId }} </view>
      </view>

      <view class="submit-button" :class="{ loading: isLoading }" @click="handleSubmitClick">
        <image class="button-bg" :src="config.images.buttonBackground" mode="aspectFit" />
        <text class="button-text">
          {{ isLoading ? '保存中...' : config.texts.submitButton }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { profileService, validateName, validateBirthday } from '@/api/profile';
import { useAuthStore } from '@/stores/auth';
import { getTheme, type ProfilePageTheme } from './config';
import { preloadPagFile } from '@/utils/pagPreloader';

const config = ref<ProfilePageTheme>(getTheme('default'));
const authStore = useAuthStore();

const formData = reactive({
  username: '',
  password: '',
  name: '',
  birthday: '',
});

const currentNfcId = ref('');
const isLoading = ref(false);
const isH5Platform = process.env.UNI_PLATFORM === 'h5';
let pagPreloadPromise: Promise<boolean> | null = null;

const formatDateForInput = (value: Date | string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const initFormFromUser = () => {
  if (!authStore.user) return;
  formData.username = authStore.user.username || '';
  formData.name = authStore.user.name || '';
  formData.birthday = formatDateForInput(authStore.user.birthday || null);
};

const syncNfcId = (options?: Record<string, any>) => {
  const fromQuery = (options?.nfcId as string) || '';
  const stored = uni.getStorageSync('currentNfcId') || '';
  const nextId = fromQuery || stored || '';
  if (fromQuery) {
    uni.setStorageSync('currentNfcId', fromQuery);
  }
  currentNfcId.value = nextId;
};

const showToast = (title: string) => {
  uni.showToast({
    title,
    icon: 'none',
    duration: 2000,
  });
};

const validateUsername = () => {
  const value = formData.username.trim();
  if (!value) {
    showToast('请输入账户名');
    return false;
  }
  if (value.length < 4 || value.length > 32) {
    showToast('账户名需为4-32位字符');
    return false;
  }
  return true;
};

const validatePasswordField = () => {
  const value = formData.password.trim();
  if (!value) {
    showToast('请输入密码');
    return false;
  }
  if (value.length < 6) {
    showToast('密码至少6位');
    return false;
  }
  return true;
};

const validateForm = () => {
  if (!validateUsername()) return false;
  if (!validatePasswordField()) return false;

  if (!validateName(formData.name)) {
    showToast(formData.name ? '昵称格式不正确' : '请输入昵称');
    return false;
  }

  if (!validateBirthday(formData.birthday)) {
    showToast(formData.birthday ? '生日格式不正确' : '请选择生日');
    return false;
  }

  return true;
};

const onBirthdayChange = (event: { detail: { value: string } }) => {
  formData.birthday = event.detail.value;
};

const navigateToFortune = () => {
  if (currentNfcId.value) {
    uni.redirectTo({
      url: '/pages/fortune/index?fromProfile=true',
    });
  } else {
    uni.redirectTo({
      url: '/pages/fortune/index?mode=visitor',
    });
  }
};

const checkPagAndNavigate = () => {
  if (pagPreloadPromise) {
    pagPreloadPromise.catch(() => false).finally(() => navigateToFortune());
  } else {
    navigateToFortune();
  }
};

const handleSubmitClick = async () => {
  if (isLoading.value) return;
  if (!validateForm()) return;

  if (isH5Platform) {
    if (!currentNfcId.value) {
      showToast('δ��ȡ�� NFC ��Ϣ�����ֶ����롣');
      return;
    }

    try {
      isLoading.value = true;
      const response = await profileService.registerWeb({
        username: formData.username.trim(),
        password: formData.password.trim(),
        name: formData.name.trim(),
        birthday: formData.birthday,
        nfcId: currentNfcId.value,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || '����ʧ��');
      }

      uni.showToast({
        title: '��Ϣ��������',
        icon: 'success',
        duration: 1500,
      });

      setTimeout(() => {
        uni.redirectTo({ url: '/pages/fortune/index?mode=visitor' });
      }, 1500);
    } catch (error) {
      showToast(error instanceof Error ? error.message : '����ʧ��');
    } finally {
      isLoading.value = false;
    }
    return;
  }

  try {
    isLoading.value = true;

    if (!authStore.isAuthenticated) {
      console.error('�û�δ��¼����Ҫ���µ�¼');
      uni.showToast({
        title: '��¼�ѹ��ڣ������µ�¼',
        icon: 'none',
      });
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/bind/index' });
      }, 2000);
      return;
    }

    const response = await profileService.updateProfile({
      username: formData.username.trim(),
      password: formData.password.trim(),
      name: formData.name.trim(),
      birthday: formData.birthday,
      nfcId: currentNfcId.value || undefined,
    });

    if (response.success && response.data) {
      authStore.setUser(response.data);
      uni.showToast({ title: '��Ϣ����ɹ�', icon: 'success', duration: 1500 });
      setTimeout(() => {
        checkPagAndNavigate();
      }, 1500);
    } else {
      throw new Error(response.message || '����ʧ��');
    }
  } catch (error) {
    console.error('�ύʧ��:', error);
    const errorMessage = error instanceof Error ? error.message : '����ʧ�ܣ�������';
    uni.showToast({ title: errorMessage, icon: 'none', duration: 2000 });
  } finally {
    isLoading.value = false;
  }
};

onLoad(options => {
  authStore.initFromStorage();
  syncNfcId(options);

  if (!isH5Platform && !authStore.isAuthenticated) {
    showToast('请先完成绑定');
    uni.redirectTo({ url: '/pages/bind/index' });
    return;
  }

  initFormFromUser();
  pagPreloadPromise = preloadPagFile();
});
</script>

<style lang="scss" scoped>
.profile-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  padding: 64rpx 32rpx 120rpx;
  box-sizing: border-box;
}

.bg-main,
.bg-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  z-index: 0;
}

.bg-stars {
  opacity: 0.6;
}

.profile-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.header {
  text-align: center;
  color: #fff;

  .avatar-placeholder {
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    margin: 0 auto 24rpx;
    opacity: 0.9;
  }

  .title {
    font-size: 44rpx;
    font-weight: 600;
    display: block;
  }

  .subtitle {
    font-size: 28rpx;
    opacity: 0.8;
    display: block;
    margin-top: 8rpx;
  }
}

.form-card {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  backdrop-filter: blur(8px);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .field-label {
    font-size: 28rpx;
    color: #fff;
    font-weight: 600;
  }

  .field-input,
  .picker-display {
    width: 100%;
    height: 84rpx;
    border-radius: 48rpx;
    border: 1px solid rgba(255, 255, 255, 0.35);
    padding: 0 32rpx;
    color: #fff;
    font-size: 28rpx;
    background: rgba(255, 255, 255, 0.06);
    box-sizing: border-box;
  }

  .picker-display {
    display: flex;
    align-items: center;

    &.placeholder {
      opacity: 0.6;
    }
  }
}

.nfc-tip {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  word-break: break-all;
}

.submit-button {
  position: relative;
  height: 110rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16rpx;
  opacity: 1;
  transition: opacity 0.2s;

  &.loading {
    opacity: 0.7;
  }

  .button-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border-radius: 999px;
  }

  .button-text {
    position: relative;
    z-index: 1;
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
  }
}
</style>

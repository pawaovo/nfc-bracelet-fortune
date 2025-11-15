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
import { fortuneService } from '@/api/fortune';
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
const pageHint = ref(''); // 页面提示信息（用于场景B）

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
// H5 平台始终启用 Web 认证（开发和生产环境都需要）
const enableDevWebAuth = isH5Platform;
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
  let fromQuery = (options?.nfcId as string) || '';

  // H5环境：优先从 URL 查询参数获取（因为 hash 路由的问题）
  if (isH5Platform && !fromQuery) {
    const urlParams = new URLSearchParams(window.location.search);
    const nfcIdFromUrl = urlParams.get('nfcId');
    if (nfcIdFromUrl) {
      fromQuery = nfcIdFromUrl;
      console.log('[Profile] 从 URL 获取 nfcId:', nfcIdFromUrl);
    }
  }

  const stored = uni.getStorageSync('currentNfcId') || '';
  const nextId = fromQuery || stored || '';

  if (fromQuery) {
    uni.setStorageSync('currentNfcId', fromQuery);
  }

  currentNfcId.value = nextId;
  console.log('[Profile] syncNfcId 结果:', { fromQuery, stored, nextId });
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

const handleProfileSuccess = async (
  message: string,
  user?: UserPartial,
  userType?: 'bound' | 'visitor',
  isNewUser: boolean = false // 新增参数：是否为新用户（首次注册/绑定）
) => {
  if (user) {
    if (enableDevWebAuth) {
      ensureDevWebAuth(user);
    } else {
      authStore.setUser(user);
    }

    // 保存用户类型
    if (userType) {
      authStore.setUserType(userType);
    }

    // 保存nfcId（如果是绑定用户）
    if (userType === 'bound' && currentNfcId.value) {
      authStore.setNfcId(currentNfcId.value);
    }
  }
  fortuneStore.clearFortune();
  uni.setStorageSync(FORCE_RELOAD_FLAG_KEY, '1');

  // 先检查跳转目标，再显示提示和跳转
  const finalUserType = userType || 'visitor';
  let targetUrl = '';

  if (finalUserType === 'visitor') {
    // 访客用户：直接跳转到访客版运势页面
    targetUrl = '/pages/fortune/index?mode=visitor';
  } else {
    // 绑定用户
    if (isNewUser) {
      // 新用户（首次注册/绑定）：直接跳转到AI生成页面，不检查今日运势
      console.log('[Profile] 新用户，直接跳转到AI生成页面');
      targetUrl = '/pages/ai-generation/index?fromProfile=true';
    } else {
      // 老用户（登录）：检查是否已有今日运势
      console.log('[Profile] 老用户登录，检查是否已有今日运势');
      try {
        // 使用新的 checkTodayFortuneExists API，只检查不生成
        const checkResponse = await fortuneService.checkTodayFortuneExists();

        if (checkResponse.success && checkResponse.data?.exists) {
          // 已有今日运势：获取运势数据并跳转到运势页面
          console.log('[Profile] 检测到已有今日运势，获取数据并跳转到运势页面');
          const fortuneResponse = await fortuneService.getTodayFortune();
          if (fortuneResponse.success && fortuneResponse.data) {
            fortuneStore.setFortune(fortuneResponse.data);
            targetUrl = '/pages/fortune/index?preloaded=true';
          } else {
            // 获取失败，跳转到AI生成页面
            console.log('[Profile] 获取运势数据失败，跳转到AI生成页面');
            targetUrl = '/pages/ai-generation/index?fromProfile=true';
          }
        } else {
          // 没有今日运势：跳转到AI生成页面
          console.log('[Profile] 没有今日运势，跳转到AI生成页面');
          targetUrl = '/pages/ai-generation/index?fromProfile=true';
        }
      } catch (error) {
        console.log('[Profile] 检查今日运势失败，跳转到AI生成页面:', error);
        targetUrl = '/pages/ai-generation/index?fromProfile=true';
      }
    }
  }

  // 显示成功提示，然后跳转
  uni.showToast({ title: message, icon: 'success', duration: 1500 });
  setTimeout(() => {
    console.log('[Profile] 跳转到:', targetUrl);
    uni.redirectTo({ url: targetUrl });
  }, 1500);
};

const submitAsWeb = async () => {
  const nfcId = currentNfcId.value;
  const payload = buildSubmitPayload();

  console.log('[submitAsWeb] nfcId:', nfcId);
  console.log('[submitAsWeb] payload:', { ...payload, password: '***' });

  // 场景判断：检查是否需要登录验证
  // 如果有nfcId，先尝试登录验证（场景B）
  if (nfcId) {
    try {
      // 尝试登录验证（同时更新昵称和生日）
      const loginResponse = await profileService.loginWeb({
        username: payload.username,
        password: payload.password,
        name: payload.name,
        birthday: payload.birthday,
        nfcId: nfcId,
      });

      if (loginResponse.success && loginResponse.data) {
        // 登录成功（场景B：已绑定nfcId的用户登录）
        console.log('[submitAsWeb] 登录成功，用户类型:', loginResponse.data.userType);

        // 生成开发环境JWT token
        if (enableDevWebAuth) {
          const openid = loginResponse.data.wechatOpenId || `web_${loginResponse.data.username}`;
          const token = generateDevJWT(loginResponse.data.id, openid);
          authStore.login(token, loginResponse.data, nfcId, loginResponse.data.userType);
        }

        // 登录成功：老用户，isNewUser = false
        await handleProfileSuccess(
          '登录成功',
          loginResponse.data,
          loginResponse.data.userType,
          false
        );
        return;
      }
    } catch (loginError) {
      // 登录失败，可能是：
      // 1. 该nfcId未绑定任何用户（场景A）
      // 2. 用户名或密码错误
      // 3. 该nfcId不存在（虚假nfcId，场景C）
      console.log('[submitAsWeb] 登录验证失败，尝试注册:', loginError);

      // 继续执行注册流程
    }
  }

  // 场景A或C：注册/绑定流程
  const registerPayload = {
    ...payload,
    nfcId: nfcId || undefined, // 如果没有nfcId，传undefined
  };

  const response = await profileService.registerWeb(registerPayload);
  if (!response.success || !response.data) {
    throw new Error(response.message || '绑定失败');
  }

  console.log('[submitAsWeb] 注册成功，用户类型:', response.data.userType);

  // 生成开发环境JWT token
  if (enableDevWebAuth) {
    const openid = response.data.wechatOpenId || `web_${response.data.username}`;
    const token = generateDevJWT(response.data.id, openid);
    authStore.login(token, response.data, nfcId, response.data.userType);
  }

  // 注册成功：新用户，isNewUser = true
  await handleProfileSuccess('绑定成功', response.data, response.data.userType, true);
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

  // 更新个人信息：老用户，isNewUser = false
  await handleProfileSuccess('信息保存成功', response.data, undefined, false);
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

  // H5平台：检查是否需要显示登录提示
  if (isH5Platform && currentNfcId.value) {
    // 如果有nfcId，可能是场景B（需要登录）
    // 这里可以添加一个API调用来检查nfcId的绑定状态
    // 暂时不实现，让用户直接填写表单，后端会自动判断
    console.log('[Profile] H5平台，nfcId:', currentNfcId.value);
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

/* 页面容器 - 使用固定高度，防止键盘弹出时被挤压 */
.profile-container {
  position: relative;
  /* 使用固定高度，不使用vh单位，避免键盘弹出时重新计算 */
  min-height: 100vh;
  height: 1627rpx; /* 调整为与bind页面一致的高度，确保所有内容都能正确显示 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* 禁止容器本身滚动 */
  overflow: visible;
}

/* 主背景容器 - 改为绝对定位，随页面一起滚动 */
.main-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.4s ease-in;
  /* 确保背景覆盖整个容器 */
  min-height: 1627rpx;

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

/* 头像占位图（卡片背景） - 使用固定rpx值，避免键盘弹出时位置变化 */
.avatar-placeholder {
  position: absolute;
  top: 480rpx; /* 向下移动，增加与顶部引导文字的间距 */
  left: 10.27%;
  width: 78.53%;
  height: 798rpx; /* 使用固定高度，确保卡片在所有设备上高度一致 */
  z-index: 150;
  /* 添加圆角，确保在所有设备上显示圆角 */
  border-radius: 30rpx;
  overflow: hidden; /* 确保图片内容不会超出圆角边界 */
}

/* 引导文字容器 - 使用固定rpx值 */
.guide-text-container {
  position: absolute;
  top: 310rpx; /* 调整位置，确保与卡片有合理的间距 */
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

/* 用户名容器 - 使用固定rpx值 */
.username-container {
  position: absolute;
  top: 530rpx; /* 调整位置，位于卡片顶部内侧 */
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

/* 称呼标签 - 使用固定rpx值 */
.name-label {
  position: absolute;
  top: 625rpx; /* 调整位置，位于卡片内部，与卡片顶部有合理间距 */
  left: 21.87%;
  font-family: 'PingFang SC', sans-serif;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: normal;
  z-index: 200;
}

/* 称呼输入框容器 - 使用固定rpx值 */
.name-input-container {
  position: absolute;
  top: 675rpx; /* 标签下方50rpx，确保有足够的间距 */
  left: 20%;
  right: 20.53%;
  height: 82rpx;
  z-index: 200;
}

/* 密码标签 - 使用固定rpx值 */
.password-label {
  position: absolute;
  top: 800rpx; /* 与昵称输入框间距约43rpx（800 - 675 - 82 = 43） */
  left: 21.87%;
  font-family: 'PingFang SC', sans-serif;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: normal;
  z-index: 200;
}

/* 密码输入框容器 - 使用固定rpx值 */
.password-input-container {
  position: absolute;
  top: 850rpx; /* 标签下方50rpx */
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

/* 生日标签 - 使用固定rpx值 */
.birthday-label {
  position: absolute;
  top: 975rpx; /* 与密码输入框间距约43rpx（975 - 850 - 82 = 43） */
  left: 21.87%;
  font-family: 'PingFang SC', sans-serif;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: normal;
  z-index: 200;
}

/* 生日输入框容器 - 使用固定rpx值 */
.birthday-input-container {
  position: absolute;
  top: 1025rpx; /* 标签下方50rpx */
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

/* 提交按钮容器 - 与绑定页面按钮保持一致的样式 */
.submit-button-container {
  position: absolute;
  top: 1380rpx; /* 与绑定页面按钮位置一致 */
  /* 卡片顶部480rpx + 卡片高度798rpx = 1278rpx（卡片底部） */
  /* 按钮顶部1380rpx，按钮高度115rpx，按钮底部1495rpx */
  /* 按钮顶部距离卡片底部：1380 - 1278 = 102rpx（合理的间距） */
  left: 42rpx; /* 与绑定页面按钮左边距一致 */
  width: 668rpx; /* 与绑定页面按钮宽度一致 */
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

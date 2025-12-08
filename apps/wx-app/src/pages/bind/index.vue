<template>
  <view class="bind-container">
    <!-- 全屏背景，未就绪时展示预览与加载 -->
    <view class="pag-background-overlay">
      <image
        v-if="showPagLoading"
        class="pag-preview-bg"
        src="/static/pages/bind/preview.png"
        mode="aspectFill"
      />
      <view v-if="showPagLoading" class="pag-loading-mask">
        <view class="pag-loading-dot" />
        <text class="pag-loading-text"> 加载中 </text>
      </view>
      <PagLoadingCDN
        :fill-width="true"
        :auto-play="true"
        :loop="true"
        :pag-file-url="pagBackgroundUrl"
        @ready="onPagBackgroundReady"
      />
    </view>

    <!-- 蝴蝶 PAG 动画 - 位置在按钮上方 -->
    <view v-if="showButterfly" class="pag-butterfly-container">
      <PagLoadingCDN
        ref="pagButterflyRef"
        :width="400"
        :height="400"
        :auto-play="true"
        :loop="true"
        :scale-mode="2"
        :pag-file-url="pagButtonUrl"
        @ready="onPagButtonReady"
      />
    </view>

    <!-- 欢迎文案区域 -->
    <view v-if="pagReady" class="welcome-section">
      <text class="welcome-title"> 嗨！我是你的专属运势手链 </text>
      <text class="welcome-title"> 绑定我，每天为你分析运势！ </text>
      <!-- <text class="welcome-subtitle"> 在这里，每天为你开启好运 </text> -->
    </view>

    <!-- 绑定按钮区域 -->
    <view v-if="pagReady" class="bind-section">
      <view class="bind-button-container" @click="handleBindClick">
        <image class="button-bg" src="/static/pages/bind/button-bg.png" mode="aspectFit" />
        <view v-if="isBinding" class="button-loading">
          <view class="button-loading-spinner" />
          <text class="button-text"> 绑定中... </text>
        </view>
        <text v-else class="button-text"> 开始绑定 </text>
      </view>

      <!-- 授权勾选框 -->
      <view class="agreement-section">
        <view class="checkbox-wrapper" @click="toggleAgreement">
          <view :class="['checkbox', { checked: agreed }]">
            <text v-if="agreed" class="checkbox-icon"> ✓ </text>
          </view>
        </view>
        <text class="agreement-text">
          注册/登录即表示同意
          <text class="agreement-link" @click.stop="showUserAgreement"> 用户协议 </text>
          和
          <text class="agreement-link" @click.stop="showPrivacyPolicy"> 隐私政策 </text>
        </text>
      </view>
    </view>

    <!-- 用户协议弹窗 -->
    <view v-if="agreementModalVisible" class="modal-overlay" @click="hideAgreementModal">
      <view class="modal-container" @click.stop>
        <view class="modal-header">
          <text class="modal-title">用户协议</text>
          <text class="modal-close" @click="hideAgreementModal">✕</text>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <text class="modal-content">{{ userAgreementContent }}</text>
        </scroll-view>
      </view>
    </view>

    <!-- 隐私政策弹窗 -->
    <view v-if="privacyModalVisible" class="modal-overlay" @click="hidePrivacyModal">
      <view class="modal-container" @click.stop>
        <view class="modal-header">
          <text class="modal-title">隐私政策</text>
          <text class="modal-close" @click="hidePrivacyModal">✕</text>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <text class="modal-content">{{ privacyPolicyContent }}</text>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { authService } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';
import PagLoadingCDN from '@/components/PagLoadingCDN.vue';

const authStore = useAuthStore();
const pagBackgroundRef = ref<InstanceType<typeof PagLoadingCDN>>();
const pagButterflyRef = ref<InstanceType<typeof PagLoadingCDN>>();

// 响应式状态
const isBinding = ref(false);
const nfcId = ref('');
const agreed = ref(false); // 用户是否同意授权
const isH5Platform = process.env.UNI_PLATFORM === 'h5';
const pagBackgroundUrl = '/static/pag/Bind_animation.pag';
const pagButtonUrl = '/static/pag/Bind_button.pag';
const pagBackgroundReady = ref(false);
const pagButtonReady = ref(false);
const pagReady = computed(() => pagBackgroundReady.value && pagButtonReady.value);
const showPagLoading = computed(() => !pagReady.value);

// 控制蝴蝶动画的显示
const showButterfly = ref(false);

// 用户协议同意状态
const agreedToTerms = ref(false);

// 弹窗状态
const agreementModalVisible = ref(false);
const privacyModalVisible = ref(false);

// 用户协议内容
const userAgreementContent = `欢迎使用本产品。本产品由【请填写公司名称】（以下简称"我们"或"本平台"）提供与运营。用户在使用本产品前，请务必仔细阅读并充分理解本协议。当您点击"同意""开始绑定""登录"等按钮或实际使用本产品，即视为您已阅读并同意本协议的全部内容。

一、服务内容

本平台向用户提供基于生日、出生地、性别、昵称等信息生成的运势分析、运势记录、手链绑定、历史数据展示等服务。具体服务内容以实际提供为准，我们有权根据业务情况对服务进行调整。

二、用户行为规范

1. 合法使用

用户不得利用本平台进行任何违法、侵权或不当行为，包括但不限于：

• 传播违法、骚扰、诽谤、暴力等内容；
• 侵害他人隐私或信息安全；
• 破坏本平台系统安全；
• 未经许可进行商业使用。

2. 信息真实性

用户需保证所填写及提交的信息真实准确，不得冒充他人或编造虚假资料。

三、账户管理

用户通过手机号+验证码的方式使用本服务。用户应妥善保管自己的手机验证码，不向他人泄露。若发现账号异常使用，用户应及时联系我们。

我们有权在以下情况暂停或终止向用户提供服务：

• 用户违反本协议；
• 用户提交虚假信息；
• 依据法律法规或监管部门要求。

四、服务变更、中断与终止

我们可能因系统维护、升级、经营策略调整等原因变更或暂停服务。对于服务的调整，我们会通过公告等方式进行提示。

若因不可抗力（如自然灾害、政策调整、基础设施故障等）导致服务中断，我们不承担责任，但会尽力恢复服务。

五、知识产权

本平台提供的所有内容，包括但不限于界面设计、功能逻辑、文本、图像、音频、视频、代码等，均受版权法及相关法律保护，未经授权不得复制、传播、用于商业用途或进行逆向工程。

六、免责声明

用户理解并同意：

• 本服务的运势预测、能量解析等内容仅供娱乐或辅助参考，不构成专业建议；
• 我们无法保证服务的绝对准确性与连续性；
• 用户应自行判断并承担使用本产品可能产生的风险。

七、适用法律与争议解决

本协议的解释、适用及争议解决均适用中华人民共和国法律。

如因本协议发生争议，双方应友好协商；协商不成的，任何一方可向本平台所在地人民法院提起诉讼。

八、协议的变更

我们有权根据运营需要更新本协议内容。更新后的协议将在本平台公示，用户继续使用服务即视为同意。

九、联系我们

如您有任何疑问、投诉或建议，请通过以下方式联系我们：

邮箱：_______
电话：_______
地址：_______`;

// 隐私政策内容
const privacyPolicyContent = `我们非常重视用户的隐私和个人信息保护。本政策将说明我们如何收集、使用、存储、共享和保护您的个人信息。

请您仔细阅读本政策，点击"同意并继续"或使用服务即表示您已充分理解并同意全部内容。

一、我们收集哪些个人信息

在您使用本产品过程中，我们可能会收集以下类型的信息：

1. 您主动提供的信息

• 手机号码（用于登录、账号管理）
• 验证码（用于身份验证）
• 昵称、姓名（用于定制化展示）
• 性别、生日、出生地（用于运势分析）
• 手链绑定信息（如适用）

2. 系统自动收集的信息

• 设备信息：设备型号、系统版本、浏览器类型等；
• 日志信息：访问时间、点击记录、使用时长等；
• 网络信息：IP 地址、运营商信息。

3. Cookies / 本地存储

用于维持登录状态、个性化展示、使用分析等。

二、信息使用目的

我们会将上述信息用于以下用途：

• 提供"运势分析、能量解读、手链绑定"等核心功能；
• 推荐内容、生成用户专属报告；
• 提供客户支持；
• 优化产品体验、进行数据统计；
• 履行法律法规要求（如实名注册要求等）。

我们承诺不会超出必要范围收集与使用您的信息。

三、我们如何共享您的信息

我们不会向任何第三方出售您的个人信息。

仅在以下场景可能共享您的信息：

1. 第三方服务支持（如短信服务商）

例如用于发送验证码；仅共享最必要的数据。

2. 依法披露

如法院、监管部门依法要求，我们可能按规定提供相关信息。

3. 业务变更

如发生合并、分立、收购等情况，我们会要求新的持有方继续履行本隐私政策。

四、个人信息的存储

• 存储地点： 信息存储在中国境内服务器；
• 存储期限： 在实现服务目的所需的最短期限内保存；
• 账号信息将在您注销账号后依法删除或匿名化；
• 历史记录可由您自行删除。

五、您的权利

根据法律规定，您享有以下权利：

✔ 访问权
查看我们收集的您个人信息内容。

✔ 更正权
纠正错误或不完整的个人信息。

✔ 删除权
在不影响服务安全的前提下，您可请求删除部分个人信息。

✔ 撤回授权
例如关闭定位、撤回对消息推送的授权。

✔ 注销账号
我们将删除或匿名化处理您的信息。

如需行使以上权利，请联系我们。

六、未成年人保护

若用户年龄未满14周岁，我们会要求监护人提供授权。未成年人使用本产品应由监护人指导。

七、隐私政策的更新

我们可能根据业务变化或法律要求更新本政策。更新后会在平台公示，重大变动会再次征求您的同意。

八、联系我们

若您对本政策有任何问题或希望行使个人信息相关权利，请联系我们：

邮箱：_______
电话：_______
地址：_______`;

// 页面加载时获取NFC ID
onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = (currentPage as any).options || {};

  // 获取 NFC ID
  // H5环境：优先从 URL 查询参数获取（因 hash 路由的问题）
  if (isH5Platform) {
    const urlParams = new URLSearchParams(window.location.search);
    const nfcIdFromUrl = urlParams.get('nfcId');
    if (nfcIdFromUrl) {
      nfcId.value = nfcIdFromUrl;
      console.log('[Bind] 从 URL 获取 nfcId:', nfcIdFromUrl);
    } else {
      // 再从 localStorage 获取
      const storedNfcId = uni.getStorageSync('currentNfcId');
      if (storedNfcId) {
        nfcId.value = storedNfcId;
        console.log('[Bind] 从 localStorage 获取 nfcId:', storedNfcId);
      }
    }
  } else {
    // 小程序环境从 options 获取
    if (options.nfcId) {
      nfcId.value = options.nfcId;
    }
  }

  // 延迟1s显示蝴蝶动画，确保背景和DOM先完成渲染
  setTimeout(async () => {
    showButterfly.value = true;
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));
  }, 1000);
});

const onPagBackgroundReady = () => {
  pagBackgroundReady.value = true;
};

const onPagButtonReady = () => {
  pagButtonReady.value = true;
};

// 切换授权勾选状态
const toggleAgreement = () => {
  agreed.value = !agreed.value;
};

/**
 * 显示用户协议弹窗
 */
function showUserAgreement() {
  agreementModalVisible.value = true;
}

/**
 * 隐藏用户协议弹窗
 */
function hideAgreementModal() {
  agreementModalVisible.value = false;
}

/**
 * 显示隐私政策弹窗
 */
function showPrivacyPolicy() {
  privacyModalVisible.value = true;
}

/**
 * 隐藏隐私政策弹窗
 */
function hidePrivacyModal() {
  privacyModalVisible.value = false;
}

const handleBindClick = async () => {
  if (isBinding.value) return;

  // 检查是否已勾选授权
  if (!agreed.value) {
    uni.showToast({
      title: '请先同意用户协议和隐私政策',
      icon: 'none',
      duration: 2000,
    });
    return;
  }

  if (nfcId.value) {
    uni.setStorageSync('currentNfcId', nfcId.value);
  }

  if (isH5Platform) {
    const target = nfcId.value
      ? `/pages/verify-code/index?nfcId=${nfcId.value}`
      : '/pages/verify-code/index';
    uni.navigateTo({ url: target });
    return;
  }

  try {
    isBinding.value = true;

    const loginResult = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      });
    });

    if (!loginResult.code) {
      throw new Error('微信登录授权失败');
    }

    const response = await authService.login(loginResult.code, nfcId.value || undefined);

    if (response.success) {
      const { status, token, user, previewScore, recommendation } = response.data;

      if (token) {
        authStore.login(token, user || {});
      }

      if (status === 'PROFILE_INCOMPLETE') {
        uni.redirectTo({ url: '/pages/profile/index' });
      } else if (status === 'AUTHENTICATED') {
        uni.redirectTo({ url: '/pages/fortune/index' });
      } else if (status === 'VISITOR_PREVIEW') {
        if (previewScore && recommendation) {
          uni.setStorageSync('previewData', { score: previewScore, recommendation });
        }
        uni.showToast({ title: '该手链已绑定，为你展示游客预览', icon: 'none', duration: 2000 });
        uni.redirectTo({ url: '/pages/fortune/index?mode=visitor&preview=true' });
      }
    } else {
      throw new Error(response.message || '登录失败');
    }
  } catch (error) {
    console.error('绑定流程异常:', error);
    let errorMessage = '绑定失败，请重试';
    if (error instanceof Error && error.message) {
      const message = error.message;
      if (message.includes('网络') || message.includes('network')) {
        errorMessage = '网络连接失败，请检查网络';
      } else if (message.includes('超时') || message.includes('timeout')) {
        errorMessage = '请求超时，请重试';
      } else if (message.includes('授权') || message.includes('auth')) {
        errorMessage = '微信授权失败，请重试';
      } else {
        errorMessage = message;
      }
    }
    uni.showToast({ title: errorMessage, icon: 'none', duration: 2500 });
  } finally {
    isBinding.value = false;
  }
};
</script>

<style lang="scss" scoped>
.bind-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(180deg, #1a0f2e 0%, #2d1b4e 100%);
}

/* 全屏背景PAG容器 */
.pag-background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #1a0f2e 0%, #2d1b4e 100%);
  /* 防止动画加载时闪烁 */
  isolation: isolate;

  .pag-preview-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }

  :deep(.pag-loading-container) {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent !important;
    min-height: 100%;
  }

  :deep(.pag-canvas) {
    max-width: 100%;
    max-height: 100%;
    background: transparent !important;
  }
}

/* 蝴蝶PAG动画容器 - 叠加在底部 */
.pag-butterfly-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 200;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  :deep(.pag-loading-container) {
    width: 400px;
    height: 400px;
    min-height: auto;
    margin-bottom: -30px;
  }

  :deep(.pag-canvas) {
    width: 400px !important;
    height: 400px !important;
  }
}

/* 欢迎文案区域 - 位置在按钮上方 */
.welcome-section {
  position: fixed;
  bottom: 250rpx;
  left: 50%;
  padding-left: 30rpx;
  transform: translateX(-50%);
  width: 650rpx;
  z-index: 100;
  margin-bottom: 50rpx;

  .welcome-title {
    display: block;
    font-family: "Alimama ShuHeiTi";
    font-size: 42rpx;
    color: #ffffff;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 20rpx;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .welcome-subtitle {
    display: block;
    font-family: 'PingFang SC', sans-serif;
    font-size: 36rpx;
    color: #ffffff;
    line-height: 1.4;
    opacity: 0.85;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  }
}

/* 绑定按钮区域 */
.bind-section {
  position: fixed;
  bottom: 60rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 668rpx;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

.bind-button-container {
  position: relative;
  width: 668rpx;
  height: 115rpx;
  z-index: 2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.button-text {
  position: relative;
  z-index: 2;
  font-family: 'PingFang SC', sans-serif;
  font-size: 36rpx;
  font-weight: 400;
  color: #ffffff;
  line-height: 115rpx;
  text-align: center;
}

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

/* 用户协议同意区域 */
.agreement-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 20rpx 40rpx;
  cursor: pointer;
}

.checkbox {
  width: 28rpx;
  height: 28rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.6);
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: transparent;
  transition: all 0.3s ease;

  &.checked {
    background: transparent;
    border-color: #ffffff;
  }
}

.checkbox-icon {
  font-size: 20rpx;
  color: #ffffff;
  font-weight: bold;
  line-height: 1;
}

.agreement-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 24rpx;
  color: #fff;
  line-height: 1.5;
  user-select: none;
}

.agreement-link {
  color: #A68BFF;
  font-weight: 500;

}

/* PAG 加载占位 */
.pag-loading-mask {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 500;
  pointer-events: none;
  background: radial-gradient(circle at 50% 30%, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.55));
}

.pag-loading-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  animation: pag-bounce 1s ease-in-out infinite;
  margin-bottom: 12rpx;
}

.pag-loading-text {
  font-size: 28rpx;
  color: #ffffff;
  opacity: 0.9;
}

@keyframes pag-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12rpx);
  }
}

/* 授权勾选区域 */
.agreement-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 0 24rpx;
  cursor: pointer;
}

.checkbox-wrapper {
  flex-shrink: 0;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.6);
  border-radius: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition: all 0.3s ease;
}

.checkbox.checked {
  background: #ffffff;
  border-color: #ffffff;
}

.checkbox-icon {
  font-size: 24rpx;
  color: #1a1a2e;
  font-weight: bold;
  line-height: 1;
}

.agreement-text {
  font-weight: 600;
  font-size: 24rpx;
  color: #FFF;
  line-height: 1.5;
}

.agreement-link {
  color: #A68BFF;
  cursor: pointer;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  background: linear-gradient(135deg, rgba(30, 20, 50, 0.98) 0%, rgba(20, 15, 40, 0.98) 100%);
  border-radius: 24rpx;
  border: 2rpx solid rgba(166, 139, 255, 0.3);
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    transform: translateY(100rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 32rpx 32rpx 24rpx;
  border-bottom: 1rpx solid rgba(166, 139, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.modal-title {
  font-family: 'PingFang SC', sans-serif;
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
}

.modal-close {
  font-size: 44rpx;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  line-height: 1;
  padding: 0 8rpx;
  transition: color 0.2s;
}

.modal-close:active {
  color: #ffffff;
}

.modal-body {
  flex: 1;
  padding: 32rpx;
  overflow-y: scroll;
}

.modal-content {
  font-family: 'PingFang SC', sans-serif;
  font-size: 28rpx;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>

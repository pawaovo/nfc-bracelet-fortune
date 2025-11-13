<template>
  <view class="pag-loading-container">
    <!-- 下载进度提示 -->
    <view v-if="isDownloading" class="download-progress">
      <text class="progress-text"> 下载资源中... </text>
    </view>

    <!-- 加载失败提示 -->
    <view v-if="loadError" class="error-container">
      <text class="error-text"> 动画加载失败 </text>
      <text class="error-detail">
        {{ errorMessage }}
      </text>
      <button class="retry-btn" @tap="retryLoad">重试</button>
    </view>

    <!-- PAG Canvas -->
    <!-- libpag-miniprogram 基于 WebAssembly + WebGL，必须使用 type="webgl" -->
    <!-- 使用动态ID避免冲突 -->
    <canvas :id="canvasId" type="webgl" class="pag-canvas" :style="canvasStyle" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, getCurrentInstance } from 'vue';
import { PAGInit } from 'libpag-miniprogram';
import { loadPagFromCache, downloadPagFileWithProgress } from '@/utils/pagPreloader';

interface Props {
  width?: number;
  height?: number;
  autoPlay?: boolean;
  loop?: boolean;
  fillWidth?: boolean; // 是否横向填充屏幕
  manualControl?: boolean; // 是否手动控制播放（用于自定义循环逻辑）
}

const props = withDefaults(defineProps<Props>(), {
  width: 300,
  height: 300,
  autoPlay: true,
  loop: true,
  fillWidth: false,
  manualControl: false,
});

// 定义事件
const emit = defineEmits<{
  downloadComplete: []; // PAG文件下载完成事件
  ready: []; // PAG组件完全就绪事件（Canvas初始化完成）
}>();

// 生成唯一的canvas ID，避免多个组件实例冲突
const canvasId = `pagCanvas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const isDownloading = ref(false);
const loadError = ref(false);
const errorMessage = ref('');

// 获取屏幕尺寸
const screenWidth = ref(375); // 默认值
const screenHeight = ref(667); // 默认值

// Canvas样式 - 使用px单位（官方示例推荐）
const canvasStyle = computed(() => {
  if (props.fillWidth) {
    // 全屏填充
    const width = screenWidth.value;
    const height = screenHeight.value;
    return `width: ${width}px; height: ${height}px;`;
  }
  return `width: ${props.width}px; height: ${props.height}px;`;
});

// 计算实际的 canvas 尺寸
const actualWidth = computed(() => {
  return props.fillWidth ? screenWidth.value : props.width;
});

const actualHeight = computed(() => {
  return props.fillWidth ? screenHeight.value : props.height;
});

// 获取组件实例，用于正确的canvas查询作用域
const instance = getCurrentInstance();

let PAG: any = null;
let pagView: any = null;
let pagFile: any = null;
let pagBuffer: ArrayBuffer | null = null;

// 手动控制播放相关
let animationTimer: ReturnType<typeof setInterval> | null = null;
let progressCheckTimer: ReturnType<typeof setInterval> | null = null; // 进度检查定时器
const isLoopingMiddle = ref(false); // 是否正在循环中间段
const currentProgress = ref(0); // 当前播放进度
const isReady = ref(false); // PAG 组件是否已就绪
const isLoading = ref(false); // 是否正在加载中（防止重复加载）

/**
 * 初始化PAG SDK
 * 使用本地WASM文件
 *
 * 注意：uni-app编译时会自动复制static目录下的文件到编译输出目录
 * 官方示例使用 /utils/ 路径，但在uni-app中需要使用 /static/ 路径
 * 参考：https://github.com/Tencent/libpag/blob/main/web/demo/wechat-miniprogram/pages/index/index.js
 */
async function initPAGSDK() {
  if (PAG) return PAG;

  try {
    console.log('🔧 初始化PAG SDK (WASM: /static/libpag.wasm.br)');

    // uni-app编译时只会复制static目录下的文件
    // WASM文件必须放在static目录，路径格式：/static/ + file
    PAG = await PAGInit({
      locateFile: (file: string) => '/static/' + file,
    });
    console.log('✅ PAG SDK初始化成功');
    return PAG;
  } catch (error) {
    console.error('❌ PAG SDK初始化失败:', error);
    errorMessage.value = `SDK初始化失败: ${error instanceof Error ? error.message : String(error)}`;
    throw error;
  }
}

/**
 * 加载并播放PAG动画
 * 优先从缓存加载，缓存未命中时从网络下载
 */
async function loadAndPlayPAG() {
  // 防止重复加载
  if (isLoading.value) {
    console.warn('⚠️ PAG 正在加载中，跳过重复调用');
    return;
  }

  // 防止重复初始化
  if (isReady.value) {
    console.warn('⚠️ PAG 已初始化完成，跳过重复调用');
    return;
  }

  try {
    isLoading.value = true;
    loadError.value = false;
    errorMessage.value = '';

    console.log('🎬 开始加载PAG动画...');

    // 1. 初始化PAG SDK
    await initPAGSDK();

    // 2. 尝试从缓存加载 PAG 文件
    const cachedBuffer = await loadPagFromCache();

    if (cachedBuffer) {
      console.log('✅ 从缓存加载成功 (', (cachedBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB)');
      pagBuffer = cachedBuffer;
      // 触发下载完成事件（缓存命中也算下载完成）
      emit('downloadComplete');
    } else {
      // 3. 缓存未命中，从网络下载并缓存
      console.log('⚠️ 缓存未命中，开始下载...');
      isDownloading.value = true;

      // 使用带缓存的下载函数（会自动保存到缓存）
      pagBuffer = await downloadPagFileWithProgress();

      isDownloading.value = false;

      if (!pagBuffer) {
        throw new Error('PAG文件下载失败');
      }

      console.log('✅ 下载并缓存成功 (', (pagBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB)');
      // 触发下载完成事件
      emit('downloadComplete');
    }

    // 3. 等待DOM更新
    await nextTick();

    // 4. 查询canvas节点（使用动态ID）
    // 增加延迟确保canvas已完全渲染
    setTimeout(() => {
      // 检查组件实例
      if (!instance) {
        console.error('❌ 无法获取组件实例');
        errorMessage.value = '组件实例获取失败';
        loadError.value = true;
        return;
      }

      // 使用官方推荐的查询方式：wx.createSelectorQuery()
      // 参考：https://github.com/Tencent/libpag/blob/main/web/demo/wechat-miniprogram/pages/index/index.js
      const query = uni.createSelectorQuery().in(instance.proxy);
      query
        .select(`#${canvasId}`)
        .node()
        .exec(async res => {
          // 验证查询结果
          if (!res || !res[0] || !res[0].node) {
            console.error('❌ Canvas节点查询失败');
            errorMessage.value = 'Canvas节点查询失败，请检查canvas是否正确渲染';
            loadError.value = true;
            return;
          }

          const canvas = res[0].node;

          // 设置canvas的实际渲染尺寸（物理像素）
          const dpr = uni.getSystemInfoSync().pixelRatio || 2;
          canvas.width = actualWidth.value * dpr;
          canvas.height = actualHeight.value * dpr;
          console.log(`🎨 Canvas尺寸: ${canvas.width}x${canvas.height} (dpr: ${dpr})`);

          try {
            // 5. 加载PAG文件（从ArrayBuffer）
            console.log('🔄 开始加载PAG文件...');
            pagFile = await PAG.PAGFile.load(pagBuffer);
            console.log('✅ PAG文件加载成功:', pagFile.width(), 'x', pagFile.height());

            // 6. 初始化PAGView（绑定canvas）
            console.log('🔄 开始初始化PAGView...');
            pagView = await PAG.PAGView.init(pagFile, canvas);
            console.log('✅ PAGView初始化成功');

            // 7. 设置缩放模式 - 让 PAG 内容填充整个 Canvas
            // ScaleMode: 0=None, 1=Stretch, 2=LetterBox, 3=Zoom
            if (props.fillWidth) {
              pagView.setScaleMode(3); // Zoom 模式：等比缩放并裁剪，填充整个画布
              console.log('✅ 设置缩放模式: Zoom');
            }

            // 8. 设置循环播放（仅在非手动控制模式下）
            if (props.loop && !props.manualControl) {
              pagView.setRepeatCount(0); // 0表示无限循环
              console.log('✅ 设置循环播放');
            }

            // 9. 播放动画（仅在非手动控制模式下自动播放）
            if (props.autoPlay && !props.manualControl) {
              await pagView.play();
              console.log('▶️ PAG动画开始播放');
            }

            // 10. 标记组件已就绪
            isReady.value = true;
            console.log('✅ PAG 组件已就绪');

            // 验证状态
            console.log('🔍 验证状态:', {
              pagFile: !!pagFile,
              pagView: !!pagView,
              isReady: isReady.value,
            });

            // 触发就绪事件
            emit('ready');
            console.log('📢 已触发ready事件');

            // 标记加载完成
            isLoading.value = false;
          } catch (error) {
            console.error('❌ PAG渲染失败:', error);
            errorMessage.value = `渲染失败: ${error instanceof Error ? error.message : String(error)}`;
            loadError.value = true;
            isLoading.value = false;
          }
        });
    }, 800); // 增加延迟到800ms，确保canvas完全渲染
  } catch (error) {
    console.error('❌ PAG加载失败:', error);
    errorMessage.value = `加载失败: ${error instanceof Error ? error.message : String(error)}`;
    loadError.value = true;
    isLoading.value = false;
  }
}

/**
 * 重试加载
 */
function retryLoad() {
  loadError.value = false;
  loadAndPlayPAG();
}

// 组件挂载时初始化
onMounted(() => {
  // 获取屏幕尺寸
  if (props.fillWidth) {
    const systemInfo = uni.getSystemInfoSync();
    screenWidth.value = systemInfo.windowWidth;
    screenHeight.value = systemInfo.windowHeight;
    console.log(
      '📱 屏幕尺寸:',
      screenWidth.value,
      'x',
      screenHeight.value,
      '(dpr:',
      systemInfo.pixelRatio + ')'
    );
  }

  setTimeout(() => {
    loadAndPlayPAG();
  }, 100);
});

/**
 * 开始播放初始动画（0 到指定进度）
 * @param endProgress 播放到的进度 (0.0 - 1.0)，例如 0.8 表示播放到 80%
 */
function playInitialAnimation(endProgress: number = 1.0) {
  if (!pagView || !pagFile) {
    console.error('❌ PAG 未初始化');
    return;
  }

  // 清除之前的进度检查定时器
  if (progressCheckTimer) {
    clearInterval(progressCheckTimer);
    progressCheckTimer = null;
  }

  console.log(`🎬 播放初始动画: 0% -> ${(endProgress * 100).toFixed(0)}%`);

  try {
    // 从头开始播放
    pagView.setProgress(0);
    pagView.setRepeatCount(1); // 只播放一次
    pagView.play();

    // 监听播放进度，到达指定进度时停止
    progressCheckTimer = setInterval(() => {
      if (!pagView) {
        clearInterval(progressCheckTimer!);
        progressCheckTimer = null;
        return;
      }

      try {
        const progress = pagView.getProgress();
        if (progress >= endProgress) {
          clearInterval(progressCheckTimer!);
          progressCheckTimer = null;
          pagView.pause();
          console.log(`⏸️ 初始动画播放完成，停在 ${(progress * 100).toFixed(0)}%`);
        }
      } catch (error) {
        console.error('❌ 检查播放进度失败:', error);
        clearInterval(progressCheckTimer!);
        progressCheckTimer = null;
      }
    }, 100); // 每100ms检查一次
  } catch (error) {
    console.error('❌ 播放初始动画失败:', error);
    if (progressCheckTimer) {
      clearInterval(progressCheckTimer);
      progressCheckTimer = null;
    }
  }
}

/**
 * 开始循环播放中间段
 * @param startProgress 开始进度 (0.0 - 1.0)，例如 0.8 表示 80%
 * @param endProgress 结束进度 (0.0 - 1.0)，例如 0.88 表示 88%
 */
function startMiddleLoop(startProgress: number, endProgress: number) {
  if (!pagView || !pagFile) {
    console.error('❌ PAG 未初始化');
    return;
  }

  // 停止之前的定时器
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }

  isLoopingMiddle.value = true;

  const frameRate = pagFile.frameRate();
  const duration = pagFile.duration() / 1000000; // 转换为秒
  const frameDuration = 1000 / frameRate; // 每帧的毫秒数

  // 计算循环段的总帧数
  const loopDuration = (endProgress - startProgress) * duration;
  const totalFrames = Math.floor(loopDuration * frameRate);
  const progressStep = (endProgress - startProgress) / totalFrames;

  currentProgress.value = startProgress;

  console.log(
    `🔄 开始循环中间段: ${(startProgress * 100).toFixed(0)}% - ${(endProgress * 100).toFixed(0)}%, 帧率: ${frameRate}fps, 循环时长: ${loopDuration.toFixed(2)}s`
  );

  // 使用定时器手动控制每一帧
  animationTimer = setInterval(() => {
    // 检查循环状态
    if (!isLoopingMiddle.value) {
      clearInterval(animationTimer!);
      animationTimer = null;
      return;
    }

    // 检查 PAG 对象是否仍然有效
    if (!pagView || !pagFile) {
      console.warn('⚠️ PAG 对象已销毁，停止循环');
      clearInterval(animationTimer!);
      animationTimer = null;
      isLoopingMiddle.value = false;
      return;
    }

    currentProgress.value += progressStep;

    // 循环回到起点
    if (currentProgress.value >= endProgress) {
      currentProgress.value = startProgress;
    }

    try {
      pagView.setProgress(currentProgress.value);
      pagView.flush(); // 刷新渲染当前帧
    } catch (error) {
      console.error('❌ PAG 循环播放失败:', error);
      clearInterval(animationTimer!);
      animationTimer = null;
      isLoopingMiddle.value = false;
    }
  }, frameDuration);
}

/**
 * 播放结束动画
 * @param startProgress 结束动画开始进度，例如 0.92 表示 92%
 */
function playEnding(startProgress: number) {
  if (!pagView) {
    console.error('❌ PAG 未初始化');
    return;
  }

  // 停止中间段循环
  isLoopingMiddle.value = false;
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }

  // 清除进度检查定时器
  if (progressCheckTimer) {
    clearInterval(progressCheckTimer);
    progressCheckTimer = null;
  }

  console.log(`🎬 播放结束动画，从进度 ${(startProgress * 100).toFixed(0)}% 开始`);

  try {
    // 设置进度并播放到结束
    pagView.setProgress(startProgress);
    pagView.setRepeatCount(1); // 只播放一次
    pagView.play();
  } catch (error) {
    console.error('❌ 播放结束动画失败:', error);
  }
}

/**
 * 获取 PAG 文件信息
 */
function getPagInfo() {
  // 必须同时检查 pagFile、pagView 和 isReady
  console.log('🔍 getPagInfo检查:', {
    pagFile: !!pagFile,
    pagView: !!pagView,
    isReady: isReady.value,
  });

  if (!pagFile || !pagView || !isReady.value) {
    console.warn('⚠️ getPagInfo返回null，原因:', {
      noPagFile: !pagFile,
      noPagView: !pagView,
      notReady: !isReady.value,
    });
    return null;
  }

  return {
    duration: pagFile.duration() / 1000000, // 转换为秒
    frameRate: pagFile.frameRate(),
    width: pagFile.width(),
    height: pagFile.height(),
  };
}

/**
 * 检查 PAG 组件是否已就绪
 */
function checkReady() {
  return isReady.value;
}

// 清理资源
onBeforeUnmount(() => {
  console.log('🧹 PagLoadingCDN 组件卸载，清理资源');

  // 1. 先停止循环标志，防止定时器继续执行
  isLoopingMiddle.value = false;

  // 2. 清理所有定时器
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }
  if (progressCheckTimer) {
    clearInterval(progressCheckTimer);
    progressCheckTimer = null;
  }

  // 3. 停止并销毁 PAG 资源
  if (pagView) {
    try {
      pagView.stop();
      pagView.destroy();
    } catch (error) {
      console.error('❌ 销毁 PAGView 失败:', error);
    }
  }
  if (pagFile) {
    try {
      pagFile.destroy();
    } catch (error) {
      console.error('❌ 销毁 PAGFile 失败:', error);
    }
  }

  // 4. 重置状态
  isReady.value = false;
  isLoading.value = false;
});

// 暴露方法给父组件
defineExpose({
  // 基础控制方法
  play: () => pagView?.play(),
  pause: () => pagView?.pause(),
  stop: () => pagView?.stop(),
  retry: retryLoad,

  // 手动控制方法（用于自定义循环逻辑）
  playInitialAnimation, // 播放初始动画
  startMiddleLoop, // 开始循环中间段
  playEnding, // 播放结束动画
  getPagInfo, // 获取 PAG 文件信息
  checkReady, // 检查组件是否已就绪
  setProgress: (progress: number) => pagView?.setProgress(progress), // 设置播放进度
  getProgress: () => pagView?.getProgress(), // 获取当前播放进度
  flush: () => pagView?.flush(), // 刷新渲染当前帧
});
</script>

<style scoped lang="scss">
.pag-loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 400rpx;
}

.download-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.progress-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
  font-weight: 500;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  padding: 40rpx;
}

.error-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  font-weight: 500;
}

.error-detail {
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  text-align: center;
  max-width: 500rpx;
  word-break: break-all;
}

.retry-btn {
  padding: 10rpx 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20rpx;
  color: #ffffff;
  font-size: 26rpx;
  margin-top: 20rpx;
}

.pag-canvas {
  display: block;
  background: transparent;
  /* 确保canvas可见 */
  opacity: 1;
  visibility: visible;
}
</style>

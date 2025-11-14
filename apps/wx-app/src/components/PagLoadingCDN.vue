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
import { loadPagFromCache, downloadPagFileWithProgress } from '@/utils/pagPreloader';

interface GlobalWithWx {
  wx?: {
    getFileSystemManager?: () => unknown;
  };
  libpag?: {
    PAGInit: (config: { locateFile: (file: string) => string }) => Promise<unknown>;
  };
}

const globalAny =
  typeof globalThis !== 'undefined' ? (globalThis as GlobalWithWx) : ({} as GlobalWithWx);
const isMiniProgram = !!globalAny.wx?.getFileSystemManager;
// H5环境使用CDN的WASM文件，小程序使用本地WASM文件
const H5_WASM_URL = 'https://cdn.jsdelivr.net/npm/libpag@4.5.1/lib/libpag.wasm';
const MINIPROGRAM_WASM_URL = '/static/libpag.wasm';

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
 *
 * 小程序环境：使用 libpag-miniprogram npm包
 * H5环境：使用 CDN加载的全局变量 window.libpag
 *
 * 注意：uni-app编译时会自动复制static目录下的文件到编译输出目录
 * 官方示例使用 /utils/ 路径，但在uni-app中需要使用 /static/ 路径
 * 参考：https://github.com/Tencent/libpag/blob/main/web/demo/wechat-miniprogram/pages/index/index.js
 */
async function initPAGSDK() {
  if (PAG) return PAG;

  try {
    if (isMiniProgram) {
      // 小程序环境：使用npm包
      const { PAGInit } = await import('libpag-miniprogram');
      PAG = await PAGInit({
        locateFile: (file: string) => `/static/${file}`,
      });
      console.log('✅ PAG SDK初始化成功（小程序）');
    } else {
      // H5环境：使用CDN加载的全局变量
      const windowWithLibpag = window as typeof window & { libpag?: GlobalWithWx['libpag'] };
      console.log('🔍 检查 window.libpag:', typeof windowWithLibpag.libpag);

      // 等待CDN脚本加载完成
      let retryCount = 0;
      const maxRetries = 50; // 最多等待5秒
      while (!windowWithLibpag.libpag && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retryCount++;
      }

      if (!windowWithLibpag.libpag) {
        throw new Error('PAG SDK CDN加载失败，请检查网络连接');
      }

      console.log('✅ 找到 window.libpag');

      // 使用全局变量初始化，WASM文件也从CDN加载
      PAG = await windowWithLibpag.libpag.PAGInit({
        locateFile: (file: string) => {
          // H5环境：所有文件都从CDN加载，确保版本一致
          if (file.endsWith('.wasm')) {
            console.log(`📦 加载WASM文件: ${H5_WASM_URL}`);
            return H5_WASM_URL;
          }
          return `https://cdn.jsdelivr.net/npm/libpag@4.5.1/lib/${file}`;
        },
      });
      console.log('✅ PAG SDK初始化成功（H5）');
    }
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
  if (isLoading.value) {
    console.warn('⚠️ PAG 正在加载中，跳过重复请求');
    return;
  }

  if (isReady.value) {
    console.warn('⚠️ PAG 已准备就绪，跳过重复初始化');
    return;
  }

  try {
    isLoading.value = true;
    loadError.value = false;
    errorMessage.value = '';

    console.log('🚀 开始加载PAG资源...');

    await initPAGSDK();

    const cachedBuffer = await loadPagFromCache();

    if (cachedBuffer) {
      console.log('📦 命中缓存 PAG (', (cachedBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB)');
      pagBuffer = cachedBuffer;
      emit('downloadComplete');
    } else {
      console.log('📭 缓存未命中，开始下载...');
      isDownloading.value = true;
      pagBuffer = await downloadPagFileWithProgress();
      isDownloading.value = false;

      if (!pagBuffer) {
        throw new Error('PAG文件下载失败');
      }

      console.log('✅ 下载并缓存成功 (', (pagBuffer.byteLength / 1024 / 1024).toFixed(2), 'MB)');
      emit('downloadComplete');
    }

    const canvas = await resolveCanvasNode();

    try {
      const dpr = uni.getSystemInfoSync().pixelRatio || 2;
      canvas.width = actualWidth.value * dpr;
      canvas.height = actualHeight.value * dpr;
      console.log(`🎯 Canvas尺寸: ${canvas.width}x${canvas.height} (dpr: ${dpr})`);

      if (!isMiniProgram && typeof (canvas as any).style !== 'undefined') {
        (canvas as HTMLCanvasElement).style.width = `${actualWidth.value}px`;
        (canvas as HTMLCanvasElement).style.height = `${actualHeight.value}px`;
      }

      console.log('📥 开始加载PAG文件...');
      pagFile = await PAG.PAGFile.load(pagBuffer);
      console.log('✅ PAG文件加载成功:', pagFile.width(), 'x', pagFile.height());

      console.log('🎬 初始化PAGView...');
      console.log('Canvas信息:', {
        id: canvas.id,
        width: canvas.width,
        height: canvas.height,
        tagName: canvas.tagName,
        hasWebGL: !!(canvas.getContext('webgl') || canvas.getContext('webgl2')),
      });

      pagView = await PAG.PAGView.init(pagFile, canvas);
      console.log('✅ PAGView初始化成功');

      if (props.fillWidth) {
        pagView.setScaleMode(3);
        console.log('🖼️ 设置缩放模式: Zoom');
      }

      if (props.loop && !props.manualControl) {
        pagView.setRepeatCount(0);
        console.log('🔁 已开启循环播放');
      }

      if (props.autoPlay && !props.manualControl) {
        await pagView.play();
        console.log('▶️ PAG动画开始播放');
      }

      isReady.value = true;
      console.log('✨ PAG 已就绪');

      emit('ready');
      console.log('📢 已触发 ready 事件');

      isLoading.value = false;
    } catch (error) {
      console.error('⚠️ PAG渲染失败:', error);
      errorMessage.value = `渲染失败: ${error instanceof Error ? error.message : String(error)}`;
      loadError.value = true;
      isLoading.value = false;
    }
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

async function resolveCanvasNode(): Promise<any> {
  await nextTick();

  if (isMiniProgram) {
    await new Promise(resolve => setTimeout(resolve, 800));

    return new Promise((resolve, reject) => {
      if (!instance) {
        reject(new Error('组件实例未就绪'));
        return;
      }

      const query = uni.createSelectorQuery().in(instance.proxy);
      query
        .select(`#${canvasId}`)
        .node()
        .exec((res: Array<{ node?: HTMLCanvasElement }>) => {
          if (!res || !res[0] || !res[0].node) {
            reject(new Error('Canvas节点查询失败'));
            return;
          }
          resolve(res[0].node);
        });
    });
  }

  // H5环境：创建原生canvas元素（不使用uni-app封装的canvas）
  // 原因：uni-app的canvas组件在H5环境下可能不支持WebGL上下文
  // 参考：https://ask.dcloud.net.cn/question/88998
  if (typeof document === 'undefined') {
    throw new Error('Document 不可用');
  }

  console.log('🎨 H5环境：创建原生canvas元素');

  // 获取uni-app的canvas容器
  let wrapper: HTMLElement | null = null;
  let retryCount = 0;
  const maxRetries = 20;

  while (!wrapper && retryCount < maxRetries) {
    wrapper = document.getElementById(canvasId);
    if (!wrapper) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retryCount++;
    }
  }

  if (!wrapper) {
    throw new Error(`Canvas容器查询失败: #${canvasId}`);
  }

  console.log('🔍 找到canvas容器:', wrapper.tagName, wrapper.className);

  // 清空容器内容
  wrapper.innerHTML = '';

  // 创建原生canvas元素
  const canvasElement = document.createElement('canvas');
  canvasElement.id = `${canvasId}-native`;
  canvasElement.className = 'pag-native-canvas';

  // 设置canvas尺寸（稍后会在loadAndPlayPAG中设置实际尺寸）
  canvasElement.width = 100;
  canvasElement.height = 100;

  // 设置样式
  canvasElement.style.width = '100%';
  canvasElement.style.height = '100%';
  canvasElement.style.display = 'block';

  // 添加到容器
  wrapper.appendChild(canvasElement);

  console.log('✅ 原生canvas创建成功:', canvasElement.id);

  // 验证canvas是否支持WebGL
  const gl =
    canvasElement.getContext('webgl', {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    }) ||
    canvasElement.getContext('webgl2', {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });

  if (!gl) {
    throw new Error('Canvas不支持WebGL，请检查浏览器兼容性');
  }

  console.log('✅ WebGL上下文创建成功:', gl.constructor.name);
  return canvasElement;
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

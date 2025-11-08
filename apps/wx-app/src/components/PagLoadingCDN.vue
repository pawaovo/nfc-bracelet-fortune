<template>
  <view class="pag-loading-container">
    <!-- 下载进度提示 -->
    <view v-if="isDownloading" class="download-progress">
      <text class="progress-text"> 下载资源中... </text>
    </view>

    <!-- 加载失败提示 -->
    <view v-if="loadError" class="error-container">
      <text class="error-text"> 动画加载失败 </text>
      <button class="retry-btn" @tap="retryLoad">重试</button>
    </view>

    <!-- PAG Canvas -->
    <!-- libpag-miniprogram 基于 WebAssembly + WebGL，必须使用 type="webgl" -->
    <canvas
      id="pagCanvas"
      type="webgl"
      class="pag-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, getCurrentInstance } from 'vue';
import { PAGInit } from 'libpag-miniprogram';
import { loadPagFromCache, downloadPagFileWithProgress } from '@/utils/pagPreloader';

interface Props {
  width?: number;
  height?: number;
  autoPlay?: boolean;
  loop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  width: 300,
  height: 300,
  autoPlay: true,
  loop: true,
});

const canvasWidth = ref(props.width);
const canvasHeight = ref(props.height);
const isDownloading = ref(false);
const loadError = ref(false);

// 获取组件实例，用于正确的canvas查询作用域
const instance = getCurrentInstance();

let PAG: any = null;
let pagView: any = null;
let pagFile: any = null;
let pagBuffer: ArrayBuffer | null = null;

/**
 * 初始化PAG SDK
 * 使用CDN加载，减少小程序包体积
 */
async function initPAGSDK() {
  if (PAG) return PAG;

  try {
    PAG = await PAGInit({
      locateFile: (file: string) => {
        if (file.endsWith('.wasm') || file.endsWith('.wasm.br')) {
          // 使用jsDelivr CDN加载PAG SDK文件，减少小程序包体积
          return `https://cdn.jsdelivr.net/npm/libpag-miniprogram@4.5.1/lib/${file}`;
        }
        return file;
      },
    });
    console.log('PAG SDK初始化成功（从CDN加载）');
    return PAG;
  } catch (error) {
    console.error('PAG SDK初始化失败:', error);
    throw error;
  }
}

/**
 * 加载并播放PAG动画
 */
async function loadAndPlayPAG() {
  try {
    loadError.value = false;

    // 1. 初始化PAG SDK
    await initPAGSDK();

    // 2. 优先从缓存加载
    pagBuffer = await loadPagFromCache();

    if (!pagBuffer) {
      // 缓存不存在，需要下载
      console.log('PAG文件未缓存，开始下载...');
      isDownloading.value = true;

      pagBuffer = await downloadPagFileWithProgress();

      isDownloading.value = false;

      if (!pagBuffer) {
        throw new Error('PAG文件下载失败');
      }
    } else {
      console.log('从缓存加载PAG文件成功');
    }

    // 3. 等待DOM更新后获取canvas实例
    await nextTick();

    // 使用延迟确保canvas已渲染
    setTimeout(() => {
      console.log('开始查询canvas...');

      // 检查组件实例是否存在
      if (!instance) {
        console.error('无法获取组件实例');
        loadError.value = true;
        return;
      }

      // 使用uni.createSelectorQuery().in(proxy)在组件作用域内查询canvas
      // 这是在Vue组件中查询canvas的正确方式
      uni
        .createSelectorQuery()
        .in(instance.proxy)
        .select('#pagCanvas')
        .fields({ node: true, size: true })
        .exec(async res => {
          console.log('Canvas查询结果:', res);

          if (!res || !res[0] || !res[0].node) {
            console.error('获取canvas失败，查询结果:', res);
            loadError.value = true;
            return;
          }

          const canvas = res[0].node;
          console.log('获取canvas成功，canvas对象:', canvas);

          try {
            // 4. 从ArrayBuffer加载PAG文件
            pagFile = await PAG.PAGFile.load(pagBuffer);
            console.log('PAG文件加载成功');

            // 5. 创建PAGView
            pagView = await PAG.PAGView.init(pagFile, canvas);
            console.log('PAGView创建成功');

            // 6. 设置循环播放
            if (props.loop) {
              pagView.setRepeatCount(0);
            }

            // 7. 自动播放
            if (props.autoPlay) {
              await pagView.play();
              console.log('PAG动画开始播放');
            }
          } catch (error) {
            console.error('PAG渲染失败:', error);
            loadError.value = true;
          }
        });
    }, 1000);
  } catch (error) {
    console.error('PAG加载失败:', error);
    loadError.value = true;
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
  console.log('PagLoadingCDN组件挂载');
  setTimeout(() => {
    loadAndPlayPAG();
  }, 100);
});

// 清理资源
onBeforeUnmount(() => {
  if (pagView) {
    pagView.stop();
    pagView.destroy();
  }
  if (pagFile) {
    pagFile.destroy();
  }
  console.log('PAG资源已清理');
});

// 暴露方法给父组件
defineExpose({
  play: () => pagView?.play(),
  pause: () => pagView?.pause(),
  stop: () => pagView?.stop(),
  retry: retryLoad,
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
}

.error-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 28rpx;
}

.retry-btn {
  padding: 10rpx 40rpx;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20rpx;
  color: #ffffff;
  font-size: 26rpx;
}

.pag-canvas {
  display: block;
  background: transparent;
}
</style>

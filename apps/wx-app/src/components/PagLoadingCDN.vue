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
    // ⚠️ 根据lime-pag插件实践经验（DCloud插件市场ID: 11745）
    // uni-app编译时只会复制static目录下的文件
    // WASM文件必须放在static目录，路径格式：/static/ + file
    PAG = await PAGInit({
      locateFile: (file: string) => '/static/' + file,
    });
    console.log('✅ PAG SDK初始化成功（从本地加载）');
    return PAG;
  } catch (error) {
    console.error('❌ PAG SDK初始化失败:', error);
    throw error;
  }
}

/**
 * 加载并播放PAG动画
 * 根据官方文档标准流程：https://pag.io/docs/sdk-miniprogram.html
 */
async function loadAndPlayPAG() {
  try {
    loadError.value = false;

    // 1. 初始化PAG SDK
    await initPAGSDK();

    // 2. 优先从缓存加载PAG文件
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

    // 3. 等待DOM更新
    await nextTick();

    // 4. 查询canvas节点（官方标准方式）
    // 使用延迟确保canvas已完全渲染
    setTimeout(() => {
      console.log('开始查询canvas节点...');

      // 检查组件实例
      if (!instance) {
        console.error('无法获取组件实例');
        loadError.value = true;
        return;
      }

      // 使用官方推荐的查询方式：wx.createSelectorQuery()
      // 注意：在uni-app中使用uni.createSelectorQuery()
      const query = uni.createSelectorQuery().in(instance.proxy);
      query
        .select('#pagCanvas')
        .node()
        .exec(async res => {
          console.log('Canvas查询结果:', res);

          // 验证查询结果
          if (!res || !res[0] || !res[0].node) {
            console.error('Canvas节点查询失败，结果:', res);
            loadError.value = true;
            return;
          }

          const canvas = res[0].node;
          console.log('Canvas节点获取成功');

          try {
            // 5. 加载PAG文件（从ArrayBuffer）
            console.log('开始加载PAG文件...');
            pagFile = await PAG.PAGFile.load(pagBuffer);
            console.log('✅ PAG文件加载成功');

            // 6. 初始化PAGView（绑定canvas）
            console.log('开始初始化PAGView...');
            pagView = await PAG.PAGView.init(pagFile, canvas);
            console.log('✅ PAGView初始化成功');

            // 7. 设置循环播放
            if (props.loop) {
              pagView.setRepeatCount(0); // 0表示无限循环
              console.log('✅ 已设置循环播放');
            }

            // 8. 播放动画
            if (props.autoPlay) {
              await pagView.play();
              console.log('✅ PAG动画开始播放');
            }
          } catch (error) {
            console.error('❌ PAG渲染失败:', error);
            loadError.value = true;
          }
        });
    }, 500); // 减少延迟时间到500ms
  } catch (error) {
    console.error('❌ PAG加载失败:', error);
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

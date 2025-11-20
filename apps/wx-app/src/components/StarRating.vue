<template>
  <view class="star-rating" :data-size="size">
    <view v-for="star in stars" :key="star.index" class="star-wrapper">
      <view class="star-container" :style="getStarStyle(star)">
        <image class="star-icon" src="@/static/pages/fortune/star.png" mode="aspectFit" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  score?: number; // 0-100的分数（兼容旧版）
  stars?: number; // 0-5的星数（新版，支持小数如4.5）
  maxStars?: number; // 最大星星数，默认5
  size?: 'small' | 'medium' | 'large'; // 星星大小
  color?: string; // 星星颜色
}

const props = withDefaults(defineProps<Props>(), {
  maxStars: 5,
  size: 'medium',
  color: '#ffd700', // 默认金色
});

// 获取星星的样式 - 添加渐变效果（从原色到白色）
const getStarStyle = (star: { filled: boolean; half: boolean }) => {
  const baseStyle: Record<string, any> = {};

  if (star.half) {
    // 半星：使用clip-path裁剪左半边，添加渐变效果（从原色到白色）
    baseStyle.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)';
    baseStyle.background = `linear-gradient(to bottom, ${props.color}, #ffffff)`;
  } else if (star.filled) {
    // 满星：应用渐变颜色（从顶部原色到底部白色）
    baseStyle.background = `linear-gradient(to bottom, ${props.color}, #ffffff)`;
  } else {
    // 空星：灰色半透明
    baseStyle.backgroundColor = '#e0e0e0';
    baseStyle.opacity = 0.3;
  }

  return baseStyle;
};

// 计算星星状态（支持直接传入星数或分数）
const stars = computed(() => {
  const starArray = [];

  // 优先使用stars属性，如果没有则从score转换
  let rating: number;
  if (props.stars !== undefined && props.stars !== null) {
    // 新版：直接使用星数（0-5，支持小数）
    rating = Number(props.stars); // 强制转换为数字，防止字符串
  } else if (props.score !== undefined && props.score !== null) {
    // 旧版兼容：将0-100分数转换为0-5星级
    rating = (Number(props.score) / 100) * props.maxStars;
  } else {
    rating = 0;
  }

  for (let i = 1; i <= props.maxStars; i++) {
    const diff = rating - (i - 1); // 计算当前位置与rating的差值

    if (diff >= 1) {
      // 满星：差值>=1，显示满星
      starArray.push({
        index: i,
        filled: true,
        half: false,
      });
    } else if (diff >= 0.5 && diff < 1) {
      // 半星：差值在0.5-1之间，显示半星
      starArray.push({
        index: i,
        filled: false,
        half: true,
      });
    } else {
      // 空星：差值<0.5，显示空星
      starArray.push({
        index: i,
        filled: false,
        half: false,
      });
    }
  }

  return starArray;
});
</script>

<style lang="scss" scoped>
.star-rating {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rpx;
  width: 100%;
}

.star-wrapper {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}

.star-container {
  position: relative;
  width: 32rpx;
  height: 32rpx;
  display: block;
  -webkit-mask: url('@/static/pages/fortune/star.png') no-repeat center / contain;
  mask: url('@/static/pages/fortune/star.png') no-repeat center / contain;
}

.star-icon {
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0;
}

// 根据size属性调整星星大小
.star-rating[data-size='small'] .star-container {
  width: 36rpx; /* 从32rpx放大到36rpx */
  height: 36rpx;
}

.star-rating[data-size='medium'] .star-container {
  width: 40rpx; /* 从36rpx放大到40rpx */
  height: 40rpx;
}

.star-rating[data-size='large'] .star-container {
  width: 52rpx; /* 从48rpx放大到52rpx */
  height: 52rpx;
}
</style>

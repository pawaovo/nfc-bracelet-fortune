<template>
  <view class="star-rating" :data-size="size">
    <view v-for="star in stars" :key="star.index" class="star">
      <text class="star-icon">
        {{ star.icon }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  score: number; // 0-100的分数
  maxStars?: number; // 最大星星数，默认5
  size?: 'small' | 'medium' | 'large'; // 星星大小
  color?: string; // 星星颜色
}

const props = withDefaults(defineProps<Props>(), {
  maxStars: 5,
  size: 'medium',
  color: '#ffd700', // 默认金色
});

// 根据颜色选择星星图标
const getStarIcon = (filled: boolean) => {
  // 根据不同颜色返回不同的星星emoji
  if (props.color === '#4CAF50') {
    // 绿色 - 事业运 - 使用绿色系emoji
    return filled ? '💚' : '🤍';
  } else if (props.color === '#FFD700') {
    // 金色 - 财富运 - 使用金色星星
    return filled ? '⭐' : '☆';
  } else if (props.color === '#FF69B4') {
    // 粉色 - 爱情运 - 使用粉色系emoji
    return filled ? '💗' : '🤍';
  } else {
    // 默认金色星星
    return filled ? '⭐' : '☆';
  }
};

// 计算星星状态
const stars = computed(() => {
  const starArray = [];
  const rating = (props.score / 100) * props.maxStars; // 将0-100分数转换为0-5星级

  for (let i = 1; i <= props.maxStars; i++) {
    const diff = rating - i + 1;

    if (diff >= 1) {
      // 满星
      starArray.push({
        index: i,
        filled: true,
        half: false,
        icon: getStarIcon(true),
      });
    } else if (diff >= 0.5) {
      // 半星
      starArray.push({
        index: i,
        filled: false,
        half: true,
        icon: getStarIcon(true),
      });
    } else {
      // 空星
      starArray.push({
        index: i,
        filled: false,
        half: false,
        icon: getStarIcon(false),
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
  gap: 4rpx;
}

.star-icon {
  font-size: 32rpx;
}

// 根据size属性调整星星大小
.star-rating[data-size='small'] .star-icon {
  font-size: 20rpx;
}

.star-rating[data-size='medium'] .star-icon {
  font-size: 32rpx;
}

.star-rating[data-size='large'] .star-icon {
  font-size: 44rpx;
}
</style>

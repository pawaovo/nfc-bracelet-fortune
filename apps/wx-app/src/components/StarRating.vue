<template>
  <view class="star-rating">
    <view 
      v-for="star in stars" 
      :key="star.index"
      class="star"
      :class="{ 'star-filled': star.filled, 'star-half': star.half }"
    >
      <text class="star-icon">{{ star.icon }}</text>
    </view>
    <text class="rating-text">{{ ratingText }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  score: number  // 0-100的分数
  maxStars?: number  // 最大星星数，默认5
  showText?: boolean  // 是否显示文字，默认true
}

const props = withDefaults(defineProps<Props>(), {
  maxStars: 5,
  showText: true
})

// 计算星星状态
const stars = computed(() => {
  const starArray = []
  const rating = (props.score / 100) * props.maxStars  // 将0-100分数转换为0-5星级
  
  for (let i = 1; i <= props.maxStars; i++) {
    const diff = rating - i + 1
    
    if (diff >= 1) {
      // 满星
      starArray.push({
        index: i,
        filled: true,
        half: false,
        icon: '⭐'
      })
    } else if (diff >= 0.5) {
      // 半星
      starArray.push({
        index: i,
        filled: false,
        half: true,
        icon: '⭐'
      })
    } else {
      // 空星
      starArray.push({
        index: i,
        filled: false,
        half: false,
        icon: '☆'
      })
    }
  }
  
  return starArray
})

// 计算评级文字
const ratingText = computed(() => {
  if (!props.showText) return ''
  
  if (props.score >= 90) return '极佳'
  if (props.score >= 80) return '很好'
  if (props.score >= 70) return '良好'
  if (props.score >= 60) return '一般'
  if (props.score >= 50) return '较差'
  return '不佳'
})
</script>

<style lang="scss" scoped>
.star-rating {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.star {
  position: relative;
  
  .star-icon {
    font-size: 32rpx;
    color: #ddd;
    transition: color 0.3s ease;
  }
  
  &.star-filled .star-icon {
    color: #ffd700;
  }
  
  &.star-half .star-icon {
    background: linear-gradient(90deg, #ffd700 50%, #ddd 50%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.rating-text {
  font-size: 24rpx;
  color: #666;
  margin-left: 12rpx;
}
</style>

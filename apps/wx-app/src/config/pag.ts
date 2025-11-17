/**
 * PAG动画配置文件
 * 集中管理PAG动画相关的常量和配置
 */

/**
 * PAG动画时间轴配置
 * 基于25秒的总时长
 */
export const PAG_CONFIG = {
  /** 总时长（秒） */
  totalDuration: 25,

  /** 循环段开始时间（秒） - 40% */
  loopStart: 10,

  /** 循环段结束时间（秒） - 48% */
  loopEnd: 12,

  /** 结束动画开始时间（秒） - 80% */
  endingStart: 20,

  /** 结束动画结束时间（秒） - 88% */
  endingEnd: 22,

  /** 结束动画缓冲时间（毫秒） */
  endingBufferMs: 500,

  /** 组件状态检查间隔（毫秒） */
  componentCheckIntervalMs: 100,

  /** 组件初始化延迟（毫秒） */
  componentInitDelayMs: 300,
} as const;

/**
 * 加载提示文案
 * 用于在PAG动画播放时轮播显示
 */
export const LOADING_MESSAGES = [
  '星象正在传递信号...',
  '捕捉今日星运轨迹...',
  '正在整合星盘信息...',
  '运势分析正在完成...',
  '马上就好...',
] as const;

/**
 * 加载文案轮播间隔（毫秒）
 */
export const LOADING_MESSAGE_INTERVAL = 1500;

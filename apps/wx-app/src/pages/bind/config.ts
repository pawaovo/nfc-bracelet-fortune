/**
 * 绑定页面配置文件
 * 支持多主题配置，可灵活切换不同的页面展示效果
 */

/**
 * 页面主题配置接口
 */
export interface BindPageTheme {
  // 主题名称
  name: string;

  // 图片资源配置
  images: {
    // 主背景图片
    mainBackground: string;
    // 星空背景卡片图片
    starsBackground: string;
    // 手链图标（装饰性）
    braceletIcon: string;
    // 手链星星装饰
    braceletStar: string;
    // 手链详情图片
    detailImage2: string;
    // 按钮背景图片
    buttonBackground: string;
  };

  // 文字内容配置
  texts: {
    // 欢迎区域
    welcome: {
      title: string; // 欢迎标题，如："欢迎！"
      subtitle: string; // 欢迎副标题，如："即将绑定你的专属开运手链"
      description: string; // 欢迎描述，如："这是你的专属运势···"（新增）
    };

    // 手链信息
    bracelet: {
      name: string; // 手链名称，如："蓝宝石手链"
      description: string; // 手链描述，如："五行属水，完美契合·······"
    };

    // 按钮文字
    button: {
      normal: string; // 正常状态，如："微信授权并绑定"
      loading: string; // 加载状态，如："绑定中..."
    };
  };
}

/**
 * 默认主题配置
 */
export const defaultTheme: BindPageTheme = {
  name: '默认主题',

  images: {
    mainBackground: 'https://i.postimg.cc/MX248bmL/bg-main.png',
    starsBackground: 'https://i.postimg.cc/tTpjfJkk/Group-13.png',
    braceletIcon: '../../static/pages/bind/bracelet-icon.png',
    braceletStar: '../../static/pages/bind/bracelet-star.png',
    detailImage2: '../../static/pages/bind/detail-image-2.png',
    buttonBackground: '../../static/pages/bind/button-bg.png',
  },

  texts: {
    welcome: {
      title: '欢迎！',
      subtitle: '即将绑定你的专属开运手链',
      description: '这是你的专属运势···', // 新增描述文字
    },

    bracelet: {
      name: '蓝宝石手链',
      description: '五行属水，完美契合·······',
    },

    button: {
      normal: '微信授权并绑定',
      loading: '绑定中...',
    },
  },
};

/**
 * 主题配置映射
 * 可以添加更多主题配置
 */
export const themes: Record<string, BindPageTheme> = {
  default: defaultTheme,

  // 示例：紫水晶主题（可以根据需要添加）
  // amethyst: {
  //   name: '紫水晶主题',
  //   images: {
  //     mainBackground: '../../static/themes/amethyst/bg-main.png',
  //     starsBackground: '../../static/themes/amethyst/bg-stars.png',
  //     // ... 其他图片配置
  //   },
  //   texts: {
  //     welcome: {
  //       title: '欢迎！',
  //       subtitle: '即将绑定你的紫水晶开运手链',
  //       description: '这是你的专属紫水晶手链',
  //     },
  //     bracelet: {
  //       name: '紫水晶手链',
  //       description: '提升灵性，增强直觉力',
  //     },
  //     button: {
  //       normal: '微信授权并绑定',
  //       loading: '绑定中...',
  //     },
  //   },
  // },
};

/**
 * 获取主题配置
 * @param themeName 主题名称，默认为 'default'
 * @returns 主题配置对象
 */
export function getTheme(themeName: string = 'default'): BindPageTheme {
  return themes[themeName] || defaultTheme;
}

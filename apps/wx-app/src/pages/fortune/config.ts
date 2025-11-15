/**
 * 运势页面配置文件
 * 支持多主题配置，可灵活切换不同的页面展示效果
 */

/**
 * 页面主题配置接口
 */
export interface FortunePageTheme {
  // 主题名称
  name: string;

  // 图片资源配置
  images: {
    // 背景图片
    mainBackground: string; // 主背景图片
    starsBackground: string; // 星空背景图片

    // 其他
    shopIcon: string; // 店铺图标
  };

  // 文字内容配置
  texts: {
    // 页面标题
    pageTitle: string; // 如："每日运势"

    // 欢迎语模板
    welcome: {
      authenticated: string; // 已认证用户，如："{name}，这是你的专属运势"
      visitor: string; // 访客模式，如："{name}，这是你的运势预览"
      preview: string; // 预览模式，如："这是运势预览"
      history: string; // 历史模式，如："{name}，这是你的历史运势"
      default: string; // 默认，如："这是你的专属运势"
    };

    // 综合分数
    scoreSection: {
      title: string; // 如："综合分数"
      unit: string; // 如："分"
    };

    // 运势点评
    commentSection: {
      placeholder: string; // 如："正在为你生成专属运势..."
    };

    // 分项运势
    luckSections: {
      career: string; // 如："事业运"
      wealth: string; // 如："财富运"
      love: string; // 如："爱情运"
      health: string; // 如："健康运"
      study: string; // 如："学业运"
    };

    // 开运提示
    tipsSection: {
      title: string; // 如："今日开运提示"
      luckyElement: string; // 如："幸运元素"
      luckyColor: string; // 如："幸运色"
      luckyNumber: string; // 如："幸运数字"
      suitable: string; // 如："宜"
      avoid: string; // 如："避免"
      suggestion: string; // 如："建议"
      suggestionPlaceholder: string; // 如："保持积极心态，好运自然来"
    };

    // 访客解锁引导
    unlockGuide: {
      icon: string; // 如："🔒"
      title: string; // 如："解锁完整运势"
      description: string; // 如："购买专属NFC手链，即可解锁全部运势、历史记录和更多专属功能！"
      buttonText: string; // 如："前往解锁"
    };

    // 商品推荐
    recommendation: {
      title: string; // 如："今日开运手链推荐"
      cardTitle: string; // 如："今日开运手链"
      shopButtonNormal: string; // 如："去抖音店铺看看"
      shopButtonVisitor: string; // 如："购买手链，解锁完整运势"
    };

    // 手链信息
    bracelet: {
      name: string; // 如："蓝宝石手链"
      description: string; // 如："五行属水，完美契合·······"
    };

    // 历史记录
    history: {
      viewButton: string; // 如："查看历史运势"
      backButton: string; // 如："返回列表"
      entryText: string; // 如："快来查看你的历史记录吧！"
    };

    // 加载和错误提示
    loading: {
      default: string; // 如："加载中..."
      fortune: string; // 如："正在获取你的专属运势..."
      retry: string; // 如："重新分析中..."
    };

    error: {
      default: string; // 如："加载失败，请重试"
      network: string; // 如："网络连接失败，请检查网络后重试"
      retry: string; // 如："重新获取"
    };
  };

  // 颜色配置（可选，用于未来扩展）
  colors?: {
    primary?: string;
    secondary?: string;
    text?: string;
    background?: string;
  };
}

/**
 * 默认主题配置
 */
export const defaultTheme: FortunePageTheme = {
  name: '默认主题',

  images: {
    // 背景图片 - 使用本地资源
    mainBackground: '../../static/pages/fortune/bg-main.png',
    starsBackground: '../../static/pages/fortune/bg-stars.png',

    // 其他
    shopIcon: '../../static/pages/fortune/shop-icon.png',
  },

  texts: {
    pageTitle: '每日运势',

    welcome: {
      authenticated: '{name}，这是你的专属运势',
      visitor: '{name}，这是你的运势预览',
      preview: '这是运势预览',
      history: '{name}，这是你的历史运势',
      default: '这是你的专属运势',
    },

    scoreSection: {
      title: '综合分数',
      unit: '分',
    },

    commentSection: {
      placeholder: '正在为你生成专属运势...',
    },

    luckSections: {
      career: '事业运',
      wealth: '财富运',
      love: '爱情运',
      health: '健康运',
      study: '学业运',
    },

    tipsSection: {
      title: '今日开运提示',
      luckyElement: '幸运元素',
      luckyColor: '幸运色',
      luckyNumber: '幸运数字',
      suitable: '宜',
      avoid: '避免',
      suggestion: '建议',
      suggestionPlaceholder: '保持积极心态，好运自然来',
    },

    unlockGuide: {
      icon: '🔒',
      title: '解锁完整运势',
      description: '购买专属NFC手链，即可解锁全部运势、历史记录和更多专属功能！',
      buttonText: '前往解锁',
    },

    recommendation: {
      title: '今日开运手链推荐',
      cardTitle: '今日开运手链',
      shopButtonNormal: '去抖音店铺看看',
      shopButtonVisitor: '购买手链，解锁完整运势',
    },

    bracelet: {
      name: '蓝宝石手链',
      description: '五行属水，完美契合·······',
    },

    history: {
      viewButton: '查看历史运势',
      backButton: '返回列表',
      entryText: '快来查看你的历史记录吧！',
    },

    loading: {
      default: '加载中...',
      fortune: '正在获取你的专属运势...',
      retry: '重新分析中...',
    },

    error: {
      default: '加载失败，请重试',
      network: '网络连接失败，请检查网络后重试',
      retry: '重新获取',
    },
  },

  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    text: '#ffffff',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
};

/**
 * 主题配置映射
 */
export const themes: Record<string, FortunePageTheme> = {
  default: defaultTheme,
};

/**
 * 获取主题配置
 * @param themeName 主题名称，默认为 'default'
 * @returns 主题配置对象
 */
export function getTheme(themeName: string = 'default'): FortunePageTheme {
  return themes[themeName] || defaultTheme;
}

/**
 * 获取所有可用主题名称
 * @returns 主题名称数组
 */
export function getAvailableThemes(): string[] {
  return Object.keys(themes);
}

/**
 * 个人信息页面配置文件
 *
 * 本文件集中管理页面的所有可配置内容，包括：
 * - 图片资源路径
 * - 文字内容
 * - 颜色配置（可选）
 *
 * 修改此文件即可轻松更新页面内容，无需修改页面代码
 */

/**
 * 页面主题配置接口
 */
export interface ProfilePageTheme {
  /** 主题名称 */
  name: string;

  /** 图片资源配置 */
  images: {
    /** 主背景图片 */
    mainBackground: string;
    /** 星空背景图片 */
    starsBackground: string;
    /** 头像占位图 */
    avatarPlaceholder: string;
    /** 提交按钮背景 */
    buttonBackground: string;
    /** 头像图标 */
    avatarIcon: string;
  };

  /** 文字内容配置 */
  texts: {
    /** 主标题 */
    mainTitle: string;
    /** 副标题 */
    subtitle: string;
    /** 用户名显示 */
    username: string;
    /** 称呼标签 */
    nameLabel: string;
    /** 称呼输入框占位符 */
    namePlaceholder: string;
    /** 生日标签 */
    birthdayLabel: string;
    /** 生日输入框占位符 */
    birthdayPlaceholder: string;
    /** 提交按钮文字 */
    submitButton: string;
  };

  /** 颜色配置（可选） */
  colors?: {
    /** 主文字颜色 */
    primaryText?: string;
    /** 次要文字颜色 */
    secondaryText?: string;
    /** 输入框文字颜色 */
    inputText?: string;
  };
}

/**
 * 默认主题配置
 */
export const defaultTheme: ProfilePageTheme = {
  name: '默认主题',

  images: {
    mainBackground: 'https://i.postimg.cc/MX248bmL/bg-main.png',
    starsBackground: 'https://i.postimg.cc/76bYZf8D/Group-15.png',
    avatarPlaceholder: '../../static/pages/profile/avatar-placeholder.png',
    buttonBackground: '../../static/pages/profile/button-bg.png',
    avatarIcon: '../../static/pages/profile/icon-avatar.svg',
  },

  texts: {
    mainTitle: '仅需一步',
    subtitle: '为你的专属运势注入灵魂',
    username: 'YANG阳有点瘦',
    nameLabel: '称呼*',
    namePlaceholder: '输入名称',
    birthdayLabel: '生日*',
    birthdayPlaceholder: '输入日期',
    submitButton: '开启我的好运',
  },

  colors: {
    primaryText: '#FFFFFF',
    secondaryText: '#FFFFFF',
    inputText: '#FFFFFF',
  },
};

/**
 * 所有可用主题
 */
const themes: Record<string, ProfilePageTheme> = {
  default: defaultTheme,
  // 可以在这里添加更多主题
};

/**
 * 获取指定主题配置
 * @param themeName 主题名称，默认为 'default'
 * @returns 主题配置对象
 */
export function getTheme(themeName: string = 'default'): ProfilePageTheme {
  return themes[themeName] || defaultTheme;
}

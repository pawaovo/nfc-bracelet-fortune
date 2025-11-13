/**
 * 个人信息页主题配置
 */

export interface ProfilePageTheme {
  name: string;
  images: {
    mainBackground: string;
    starsBackground: string;
    avatarPlaceholder: string;
    buttonBackground: string;
    avatarIcon: string;
  };
  texts: {
    mainTitle: string;
    subtitle: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    birthdayLabel: string;
    birthdayPlaceholder: string;
    submitButton: string;
  };
  colors?: {
    primaryText?: string;
    secondaryText?: string;
    inputText?: string;
  };
}

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
    mainTitle: '欢迎来到灵感之境',
    subtitle: '完成信息以解锁今日能量',
    usernameLabel: '账户名*',
    usernamePlaceholder: '请设置 4-32 位账户名',
    passwordLabel: '密码*',
    passwordPlaceholder: '请设置至少 6 位密码',
    nameLabel: '昵称*',
    namePlaceholder: '请输入昵称',
    birthdayLabel: '生日*',
    birthdayPlaceholder: '请选择生日',
    submitButton: '保存并查看运势',
  },
  colors: {
    primaryText: '#FFFFFF',
    secondaryText: '#FFFFFF',
    inputText: '#FFFFFF',
  },
};

const themes: Record<string, ProfilePageTheme> = {
  default: defaultTheme,
};

export function getTheme(themeName: string = 'default'): ProfilePageTheme {
  return themes[themeName] || defaultTheme;
}

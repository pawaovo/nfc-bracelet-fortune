# 运势页面使用说明

本文档说明如何使用和修改运势页面（`pages/fortune/index.vue`）。

---

## 📋 页面概述

运势页面是小程序的核心功能页面，用于展示用户的每日运势信息，包括：

- 综合分数
- 运势点评
- 分项运势（事业、财富、爱情）
- 开运提示（幸运色、幸运数字、建议）
- 商品推荐
- 历史记录入口

---

## 🎨 页面结构

### 1. 背景层

页面使用与其他页面（bind、profile）一致的背景结构：

- **主背景图片**：`bg-main.png`（复用 bind 页面）
- **星空背景图片**：`bg-stars.png`（复用 bind 页面）

### 2. 内容层

- 日期显示
- 欢迎语
- 综合分数圆圈
- 运势详情卡片
- 商品推荐卡片
- 历史记录按钮

---

## 📝 如何修改文字内容

所有文字内容都在 `config.ts` 配置文件中管理，修改步骤：

### 1. 打开配置文件

```
apps/wx-app/src/pages/fortune/config.ts
```

### 2. 修改对应的文字

例如，修改欢迎语：

```typescript
texts: {
  welcome: {
    authenticated: '{name}，这是你的专属运势', // 已认证用户
    visitor: '{name}，这是你的运势预览',      // 访客模式
    preview: '这是运势预览',                  // 预览模式
    history: '{name}，这是你的历史运势',      // 历史模式
    default: '这是你的专属运势',              // 默认
  },
  // ... 其他文字配置
}
```

### 3. 保存文件

修改后保存文件，小程序会自动重新编译。

---

## 🖼️ 如何替换图片资源

所有图片资源都在配置文件中引用，替换步骤：

### 1. 准备新图片

将新图片放到对应目录：

```
apps/wx-app/src/static/pages/fortune/
```

### 2. 使用规范的文件名

建议使用描述性的文件名，例如：

- `bg-main.png` - 主背景
- `card-main-bg.svg` - 运势卡片背景
- `icon-career.svg` - 事业运图标

### 3. 更新配置文件

在 `config.ts` 中更新图片路径：

```typescript
images: {
  mainBackground: '../../static/pages/fortune/bg-main.png',
  cardMainBg: '../../static/pages/fortune/card-main-bg.svg',
  // ... 其他图片配置
}
```

---

## 🎭 支持的页面模式

运势页面支持多种显示模式：

### 1. 已认证用户模式（默认）

- 显示完整运势信息
- 可查看历史记录
- 欢迎语包含用户名

### 2. 访客模式

- 显示综合分数
- 其他信息模糊处理
- 显示解锁引导
- URL 参数：`?mode=visitor`

### 3. 预览模式

- 用于登录后的首次预览
- 显示预览数据
- URL 参数：`?preview=true`

### 4. 历史模式

- 查看历史日期的运势
- 显示返回按钮
- URL 参数：`?date=2025-01-15`

---

## 🔧 配置文件详解

### FortunePageTheme 接口

```typescript
export interface FortunePageTheme {
  name: string;              // 主题名称
  images: { ... };           // 图片资源配置
  texts: { ... };            // 文字内容配置
  colors?: { ... };          // 颜色配置（可选）
}
```

### 图片资源配置

```typescript
images: {
  // 背景图片
  mainBackground: string;
  starsBackground: string;
  bottomDecoration: string;

  // 运势卡片相关
  cardMainBg: string;
  decorationPhone: string;
  // ... 更多图片

  // 分项运势图标
  iconCareer: string;
  iconWealth: string;
  iconLove: string;
  // ... 更多图标
}
```

### 文字内容配置

```typescript
texts: {
  pageTitle: string;         // 页面标题
  welcome: { ... };          // 欢迎语模板
  scoreSection: { ... };     // 综合分数
  luckSections: { ... };     // 分项运势
  tipsSection: { ... };      // 开运提示
  unlockGuide: { ... };      // 访客解锁引导
  recommendation: { ... };   // 商品推荐
  history: { ... };          // 历史记录
  loading: { ... };          // 加载提示
  error: { ... };            // 错误提示
}
```

---

## 🎨 如何添加新主题

### 1. 创建新主题配置

在 `config.ts` 中添加新主题：

```typescript
export const purpleTheme: FortunePageTheme = {
  name: '紫色主题',
  images: {
    mainBackground: '../../static/themes/purple/bg-main.png',
    // ... 其他图片
  },
  texts: {
    // ... 文字配置（可以与默认主题相同）
  },
  colors: {
    primary: '#9b59b6',
    secondary: '#8e44ad',
  },
};
```

### 2. 注册主题

```typescript
export const themes: Record<string, FortunePageTheme> = {
  default: defaultTheme,
  purple: purpleTheme, // 添加新主题
};
```

### 3. 使用新主题

在页面中切换主题：

```typescript
// 通过 URL 参数
const config = ref<FortunePageTheme>(getTheme('purple'));

// 或者动态切换
config.value = getTheme('purple');
```

---

## 📊 数据流程

### 1. 页面加载

```
onLoad → checkAuthStatus → loadFortune
```

### 2. 加载运势数据

```
loadFortune →
  - 历史模式：loadHistoryFortune
  - 预览模式：loadPreviewFortune
  - 访客模式：loadVisitorFortune
  - 已认证：loadAuthenticatedFortune
```

### 3. 数据存储

```
fortuneService.getTodayFortune → fortuneStore.setFortune → 本地缓存
```

---

## 🐛 常见问题

### Q1: 修改文字后没有生效？

**A**: 确保修改的是 `config.ts` 文件，并且保存后重新编译小程序。

### Q2: 图片显示不出来？

**A**: 检查以下几点：

1. 图片路径是否正确
2. 图片文件是否存在
3. 图片格式是否支持（PNG、JPG、SVG）

### Q3: 如何调试页面？

**A**:

1. 使用微信开发者工具的调试功能
2. 查看控制台日志
3. 检查网络请求

### Q4: 访客模式如何测试？

**A**: 在 URL 中添加参数：

```
/pages/fortune/index?mode=visitor
```

---

## 📚 相关文档

- [Figma 转小程序指南](../../docs/figma-to-miniprogram-guide.md)
- [Figma 转小程序检查清单](../../docs/figma-to-miniprogram-checklist.md)
- [资源映射文档](./RESOURCE_MAPPING.md)

---

## 🔄 更新日志

### v1.0 (2025-01-15)

- ✅ 创建配置文件系统
- ✅ 实现多模式支持（已认证、访客、预览、历史）
- ✅ 统一背景容器样式
- ✅ 配置化所有文字和图片资源
- ✅ 添加完整的文档说明

---

**维护团队**: 开发团队  
**最后更新**: 2025-01-15

# 个人信息页面使用说明

## 📁 文件结构

```
apps/wx-app/src/pages/profile/
├── index.vue          # 页面主文件
├── config.ts          # 页面配置文件（主题、文字、图片等）
└── README.md          # 使用说明文档
```

---

## 🎨 配置化设计

该页面已完全配置化，支持灵活修改所有内容，包括：

### **1. 图片资源配置**

所有图片路径都在 `config.ts` 中统一管理，可以轻松切换不同的图片资源：

- **主背景图片** (`mainBackground`)
- **星空背景图片** (`starsBackground`)
- **头像占位图** (`avatarPlaceholder`)
- **称呼输入框背景** (`inputNameBackground`)
- **生日输入框背景** (`inputBirthdayBackground`)
- **提交按钮背景** (`buttonBackground`)
- **日历图标** (`calendarIcon`)
- **头像图标** (`avatarIcon`)

### **2. 文字内容配置**

所有文字内容都以代码形式写入，可随时修改，**不是图片形式**：

#### **引导文字**

- `mainTitle` - 主标题（默认："仅需一步"）
- `subtitle` - 副标题（默认："为你的专属运势注入灵魂"）

#### **用户信息文字**

- `username` - 用户名显示（默认："YANG阳有点瘦"）

#### **表单文字**

- `nameLabel` - 称呼标签（默认："称呼\*"）
- `namePlaceholder` - 称呼输入框占位符（默认："输入名称"）
- `birthdayLabel` - 生日标签（默认："生日\*"）
- `birthdayPlaceholder` - 生日输入框占位符（默认："输入日期"）
- `submitButton` - 提交按钮文字（默认："开启我的好运 ···"）

#### **日期时间显示**

日期和星期通过 `getCurrentDate()` 和 `getCurrentWeekday()` 函数动态生成，无需配置。

### **3. 颜色配置（可选）**

- `primaryText` - 主文字颜色
- `secondaryText` - 次要文字颜色
- `inputText` - 输入框文字颜色

---

## 📝 如何修改文字内容

### **方法 1：修改配置文件（推荐）**

打开 `config.ts` 文件，找到 `defaultTheme` 对象，修改对应的文字内容：

```typescript
export const defaultTheme: ProfilePageTheme = {
  name: '默认主题',

  texts: {
    mainTitle: '仅需一步', // 修改主标题
    subtitle: '为你的专属运势注入灵魂', // 修改副标题
    username: 'YANG阳有点瘦', // 修改用户名
    nameLabel: '称呼*', // 修改称呼标签
    namePlaceholder: '输入名称', // 修改称呼占位符
    birthdayLabel: '生日*', // 修改生日标签
    birthdayPlaceholder: '输入日期', // 修改生日占位符
    submitButton: '开启我的好运 ···', // 修改按钮文字
  },
};
```

### **方法 2：创建新主题**

在 `config.ts` 中添加新的主题配置：

```typescript
const customTheme: ProfilePageTheme = {
  name: '自定义主题',
  images: {
    // ... 自定义图片路径
  },
  texts: {
    // ... 自定义文字内容
  },
};

const themes: Record<string, ProfilePageTheme> = {
  default: defaultTheme,
  custom: customTheme, // 添加新主题
};
```

然后在页面中使用新主题：

```typescript
const config = ref<ProfilePageTheme>(getTheme('custom'));
```

---

## 🖼️ 如何替换图片资源

### **步骤 1：准备新图片**

将新的图片文件放入 `apps/wx-app/src/static/pages/profile/` 目录中。

**推荐的文件命名规范**：

- `bg-main.png` - 主背景图片
- `bg-stars.png` - 星空背景图片
- `avatar-placeholder.png` - 头像占位图
- `input-bg-name.png` - 称呼输入框背景
- `input-bg-birthday.png` - 生日输入框背景
- `button-bg.png` - 提交按钮背景
- `icon-calendar.svg` - 日历图标
- `icon-avatar.svg` - 头像图标

### **步骤 2：更新配置文件**

在 `config.ts` 中更新对应的图片路径：

```typescript
images: {
  mainBackground: '../../static/pages/profile/bg-main.png',
  starsBackground: '../../static/pages/profile/bg-stars.png',
  avatarPlaceholder: '../../static/pages/profile/avatar-placeholder.png',
  inputNameBackground: '../../static/pages/profile/input-bg-name.png',
  inputBirthdayBackground: '../../static/pages/profile/input-bg-birthday.png',
  buttonBackground: '../../static/pages/profile/button-bg.png',
  calendarIcon: '../../static/pages/profile/icon-calendar.svg',
  avatarIcon: '../../static/pages/profile/icon-avatar.svg',
}
```

### **步骤 3：验证效果**

在微信开发者工具中预览页面，确认图片显示正确。

---

## 🎯 页面布局说明

### **设计图基准尺寸**

- **宽度**: 402.118px
- **高度**: 874.026px
- **转换比例**: 750 / 402.118 ≈ 1.865

### **布局特点**

1. **绝对定位布局**：所有元素使用绝对定位，精确还原设计图
2. **层级关系**：
   - z-index: 1 - 主背景图片
   - z-index: 2 - 星空背景图片
   - z-index: 3 - 头像占位图
   - z-index: 100 - 所有交互元素（文字、输入框、按钮）

3. **响应式单位**：所有尺寸使用 rpx 单位，自动适配不同屏幕

---

## 🔧 功能说明

### **1. 日期时间显示**

页面会自动显示当前日期和星期，格式如下：

- 日期：`2025.10.27`
- 星期：`星期一`

这些信息在页面加载时自动生成，无需手动配置。

### **2. 用户名显示**

- 如果用户已登录并有用户名，显示用户的真实姓名
- 如果用户未登录或没有用户名，显示配置文件中的默认用户名

### **3. 表单验证**

- **称呼验证**：
  - 必填项
  - 长度限制：1-20 个字符
  - 支持中文、英文、数字

- **生日验证**：
  - 必填项
  - 格式：YYYY-MM-DD

### **4. 提交流程**

1. 用户填写称呼和生日
2. 点击"开启我的好运"按钮
3. 前端验证表单数据
4. 调用后端 API 保存用户信息
5. 保存成功后跳转到运势页面

---

## 📦 资源文件清单

| 文件名                   | 用途           | 格式 | 配置键                           |
| ------------------------ | -------------- | ---- | -------------------------------- |
| `bg-main.png`            | 主背景图片     | PNG  | `images.mainBackground`          |
| `bg-stars.png`           | 星空背景图片   | PNG  | `images.starsBackground`         |
| `avatar-placeholder.png` | 头像占位图     | PNG  | `images.avatarPlaceholder`       |
| `input-bg-name.png`      | 称呼输入框背景 | PNG  | `images.inputNameBackground`     |
| `input-bg-birthday.png`  | 生日输入框背景 | PNG  | `images.inputBirthdayBackground` |
| `button-bg.png`          | 提交按钮背景   | PNG  | `images.buttonBackground`        |
| `icon-calendar.svg`      | 日历图标       | SVG  | `images.calendarIcon`            |
| `icon-avatar.svg`        | 头像图标       | SVG  | `images.avatarIcon`              |

---

## ⚠️ 注意事项

1. **不要硬编码**：所有图片路径和文字内容都应该通过配置文件管理
2. **保持命名规范**：资源文件使用 kebab-case 命名，便于识别和管理
3. **图片格式**：背景图片使用 PNG 格式，图标使用 SVG 格式
4. **尺寸转换**：修改布局时，使用转换比例 1.865 将设计图的 px 值转换为 rpx
5. **层级关系**：修改元素时注意 z-index 值，避免遮挡问题

---

## 🚀 快速开始

### **修改主标题**

```typescript
// 在 config.ts 中
texts: {
  mainTitle: '你的新标题',  // 修改这里
}
```

### **替换背景图片**

```typescript
// 在 config.ts 中
images: {
  mainBackground: '../../static/pages/profile/your-new-bg.png',  // 修改这里
}
```

### **添加新主题**

```typescript
// 在 config.ts 中
const nightTheme: ProfilePageTheme = {
  name: '夜间主题',
  images: {
    /* ... */
  },
  texts: {
    /* ... */
  },
  colors: {
    primaryText: '#000000', // 黑色文字
  },
};
```

---

## 📚 相关文档

- [Figma 转小程序完整指南](../../../docs/figma-to-miniprogram-guide.md)
- [Figma 转小程序检查清单](../../../docs/figma-to-miniprogram-checklist.md)
- [资源文件映射表](../../static/pages/RESOURCE_MAP.md)

---

**文档版本**: v1.0  
**最后更新**: 2025-10-27  
**页面路径**: `apps/wx-app/src/pages/profile/index.vue`  
**配置文件**: `apps/wx-app/src/pages/profile/config.ts`

# 绑定页面（欢迎及微信授权登录页面）使用说明

## 📁 文件结构

```
apps/wx-app/src/pages/bind/
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
- **星空背景卡片图片** (`starsBackground`)
- **状态栏图标** (`statusIcon`)
- **手链图标** (`braceletIcon`) - 装饰性图片
- **手链星星装饰** (`braceletStar`)
- **手链详情图片1** (`detailImage1`)
- **手链详情图片2** (`detailImage2`)
- **按钮背景图片** (`buttonBackground`)

### **2. 文字内容配置**

所有文字内容都以代码形式写入，可随时修改，**不是图片形式**：

#### **欢迎区域文字**

- `welcome.title` - 欢迎标题（默认："欢迎！"）
- `welcome.subtitle` - 欢迎副标题（默认："即将绑定你的专属开运手链"）
- `welcome.description` - 欢迎描述（默认："这是你的专属开运手链"）

#### **手链信息文字**

- `bracelet.name` - 手链名称（默认："蓝宝石手链"）
- `bracelet.description` - 手链描述（默认："五行属水，完美契合·······"）

#### **按钮文字**

- `button.normal` - 正常状态（默认："微信授权并绑定"）
- `button.loading` - 加载状态（默认："绑定中..."）

### **3. 颜色配置（可选）**

预留了颜色配置接口，用于未来扩展：

- `colors.primary` - 主色调
- `colors.secondary` - 辅助色
- `colors.text` - 文字颜色

---

## 📝 如何修改内容

### **方法 1：修改默认主题配置**

打开 `config.ts` 文件，找到 `defaultTheme` 对象，直接修改对应的值：

```typescript
export const defaultTheme: BindPageTheme = {
  name: '默认主题',

  images: {
    mainBackground: '../../static/0a490b57ea4c0b85e385f68c706eb0260d4c8e12.png',
    starsBackground: '../../static/303865ecaba62a8941d65278e8da7db93ccbfbe0.png',
    // ... 修改图片路径
  },

  texts: {
    welcome: {
      title: '欢迎！', // 修改欢迎标题
      subtitle: '即将绑定你的专属开运手链', // 修改欢迎副标题
      description: '这是你的专属开运手链', // 修改欢迎描述
    },

    bracelet: {
      name: '蓝宝石手链', // 修改手链名称
      description: '五行属水，完美契合·······', // 修改手链描述
    },

    button: {
      normal: '微信授权并绑定', // 修改按钮文字
      loading: '绑定中...', // 修改加载文字
    },
  },
};
```

### **方法 2：添加新主题**

在 `config.ts` 的 `themes` 对象中添加新主题：

```typescript
export const themes: Record<string, BindPageTheme> = {
  default: defaultTheme,

  // 添加紫水晶主题
  amethyst: {
    name: '紫水晶主题',
    images: {
      mainBackground: '../../static/themes/amethyst/bg-main.png',
      starsBackground: '../../static/themes/amethyst/bg-stars.png',
      statusIcon: '../../static/themes/amethyst/status-icon.svg',
      braceletIcon: '../../static/themes/amethyst/bracelet-icon.png',
      braceletStar: '../../static/themes/amethyst/bracelet-star.png',
      detailImage1: '../../static/themes/amethyst/detail-1.png',
      detailImage2: '../../static/themes/amethyst/detail-2.png',
      buttonBackground: '../../static/themes/amethyst/button-bg.png',
    },
    texts: {
      welcome: {
        title: '欢迎！',
        subtitle: '即将绑定你的紫水晶开运手链',
        description: '这是你的专属紫水晶手链',
      },
      bracelet: {
        name: '紫水晶手链',
        description: '提升灵性，增强直觉力',
      },
      button: {
        normal: '微信授权并绑定',
        loading: '绑定中...',
      },
    },
  },
};
```

### **方法 3：通过 URL 参数切换主题**

在跳转到绑定页面时，通过 URL 参数指定主题：

```typescript
// 使用默认主题
uni.navigateTo({
  url: '/pages/bind/index',
});

// 使用紫水晶主题
uni.navigateTo({
  url: '/pages/bind/index?theme=amethyst',
});
```

---

## 🖼️ 如何添加新图片资源

### **步骤 1：准备图片文件**

将新的图片文件放入 `apps/wx-app/src/static/pages/bind/` 目录中。

**标准的目录结构：**

```
apps/wx-app/src/static/
├── pages/
│   ├── bind/             # 绑定页面资源
│   │   ├── bg-main.png
│   │   ├── bg-stars.png
│   │   ├── status-icon.svg
│   │   ├── bracelet-icon.png
│   │   ├── bracelet-star.png
│   │   ├── detail-image-1.png
│   │   ├── detail-image-2.png
│   │   └── button-bg.png
│   ├── profile/          # 个人信息页面资源（预留）
│   ├── fortune/          # 运势页面资源（预留）
│   └── history/          # 历史记录页面资源（预留）
├── fonts/                # 字体文件
└── logo.png              # 全局Logo
```

### **步骤 2：更新配置文件**

在 `config.ts` 中更新对应的图片路径：

```typescript
images: {
  mainBackground: '../../static/pages/bind/bg-main.png',
  // ... 其他图片路径
}
```

**注意**：所有 bind 页面的图片资源都应该放在 `static/pages/bind/` 目录下，使用规范的文件名。

### **步骤 3：测试效果**

在微信开发者工具中预览页面，确认图片显示正常。

---

## ✅ 优化效果总结

### **优化前的问题**

- ❌ 图片路径硬编码在模板中，难以维护
- ❌ 部分文字内容是图片形式，无法修改
- ❌ 不支持主题切换
- ❌ 配置分散，缺少统一管理

### **优化后的优势**

- ✅ 所有配置集中在 `config.ts` 文件中，易于管理
- ✅ 所有文字都是代码形式，可随时修改
- ✅ 支持多主题配置和动态切换
- ✅ 图片资源路径统一管理，易于替换
- ✅ 代码结构清晰，可维护性高
- ✅ 预留扩展接口，支持未来功能扩展

---

## 📋 当前使用的图片资源

所有图片资源统一存放在 `apps/wx-app/src/static/pages/bind/` 目录下：

| 配置项             | 文件名               | 完整路径                               | 说明             |
| ------------------ | -------------------- | -------------------------------------- | ---------------- |
| `mainBackground`   | `bg-main.png`        | `static/pages/bind/bg-main.png`        | 主背景图片       |
| `starsBackground`  | `bg-stars.png`       | `static/pages/bind/bg-stars.png`       | 星空背景卡片     |
| `statusIcon`       | `status-icon.svg`    | `static/pages/bind/status-icon.svg`    | 状态栏图标       |
| `braceletIcon`     | `bracelet-icon.png`  | `static/pages/bind/bracelet-icon.png`  | 手链图标（装饰） |
| `braceletStar`     | `bracelet-star.png`  | `static/pages/bind/bracelet-star.png`  | 手链星星装饰     |
| `detailImage1`     | `detail-image-1.png` | `static/pages/bind/detail-image-1.png` | 手链详情图片1    |
| `detailImage2`     | `detail-image-2.png` | `static/pages/bind/detail-image-2.png` | 手链详情图片2    |
| `buttonBackground` | `button-bg.png`      | `static/pages/bind/button-bg.png`      | 按钮背景图片     |

---

## 🔧 常见问题

### **Q1：如何修改欢迎文字？**

A：打开 `config.ts`，找到 `defaultTheme.texts.welcome`，修改对应的文字内容即可。

### **Q2：如何替换背景图片？**

A：将新的背景图片放入 `static` 目录，然后在 `config.ts` 中更新 `images.mainBackground` 或 `images.starsBackground` 的路径。

### **Q3：如何添加新主题？**

A：在 `config.ts` 的 `themes` 对象中添加新的主题配置，然后通过 URL 参数 `?theme=主题名` 来使用。

### **Q4：文字内容是图片还是代码？**

A：所有文字内容都是代码形式（`<text>` 组件），不是图片，可以随时修改。

### **Q5：如何确保修改后的效果正确？**

A：修改配置后，在微信开发者工具中刷新页面，检查文字和图片是否正确显示。

---

## 📞 技术支持

如有任何问题或建议，请联系开发团队。

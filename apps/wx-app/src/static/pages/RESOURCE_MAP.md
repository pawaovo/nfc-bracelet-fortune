# 静态资源文件映射表

本文档记录了各个页面使用的静态资源文件，便于管理和维护。

---

## 📁 目录结构

```
apps/wx-app/src/static/
├── pages/                    # 各页面专属资源
│   ├── bind/                 # 绑定页面（欢迎及微信授权登录）
│   ├── profile/              # 个人信息页面（预留）
│   ├── fortune/              # 运势页面（预留）
│   └── history/              # 历史记录页面（预留）
├── fonts/                    # 全局字体文件
└── logo.png                  # 全局Logo
```

---

## 📋 各页面资源清单

### **1. 绑定页面 (bind)**

**路径**: `apps/wx-app/src/static/pages/bind/`

| 文件名               | 用途             | 尺寸/格式 | 配置项                    |
| -------------------- | ---------------- | --------- | ------------------------- |
| `bg-main.png`        | 主背景图片       | PNG       | `images.mainBackground`   |
| `bg-stars.png`       | 星空背景卡片     | PNG       | `images.starsBackground`  |
| `status-icon.svg`    | 状态栏图标       | SVG       | `images.statusIcon`       |
| `bracelet-icon.png`  | 手链图标（装饰） | PNG       | `images.braceletIcon`     |
| `bracelet-star.png`  | 手链星星装饰     | PNG       | `images.braceletStar`     |
| `detail-image-1.png` | 手链详情图片1    | PNG       | `images.detailImage1`     |
| `detail-image-2.png` | 手链详情图片2    | PNG       | `images.detailImage2`     |
| `button-bg.png`      | 按钮背景图片     | PNG       | `images.buttonBackground` |

**配置文件**: `apps/wx-app/src/pages/bind/config.ts`

---

### **2. 个人信息页面 (profile)**

**路径**: `apps/wx-app/src/static/pages/profile/`

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

**配置文件**: `apps/wx-app/src/pages/profile/config.ts`

---

### **3. 运势页面 (fortune)**

**路径**: `apps/wx-app/src/static/pages/fortune/`

| 文件名                        | 用途               | 格式 | 配置键                         |
| ----------------------------- | ------------------ | ---- | ------------------------------ |
| `bg-main.png`                 | 主背景图片（复用） | PNG  | `images.mainBackground`        |
| `bg-stars.png`                | 星空背景（复用）   | PNG  | `images.starsBackground`       |
| `bg-bottom-decoration.png`    | 底部装饰图片       | PNG  | `images.bottomDecoration`      |
| `card-main-bg.svg`            | 运势卡片主背景     | SVG  | `images.cardMainBg`            |
| `decoration-phone.png`        | 手机装饰图片       | PNG  | `images.decorationPhone`       |
| `decoration-element-1.png`    | 装饰元素1          | PNG  | `images.decorationElement1`    |
| `decoration-element-2.png`    | 装饰元素2          | PNG  | `images.decorationElement2`    |
| `decoration-element-3.png`    | 装饰元素3          | PNG  | `images.decorationElement3`    |
| `icon-career-mask.svg`        | 事业运遮罩         | SVG  | `images.iconCareerMask`        |
| `icon-career.svg`             | 事业运图标         | SVG  | `images.iconCareer`            |
| `icon-career-detail.svg`      | 事业运详情图标     | SVG  | `images.iconCareerDetail`      |
| `icon-wealth.svg`             | 财富运图标         | SVG  | `images.iconWealth`            |
| `icon-love.svg`               | 爱情运图标         | SVG  | `images.iconLove`              |
| `icon-health.svg`             | 健康运图标         | SVG  | `images.iconHealth`            |
| `icon-study.svg`              | 学业运图标         | SVG  | `images.iconStudy`             |
| `icon-star-group.svg`         | 星级组合图标       | SVG  | `images.iconStarGroup`         |
| `icon-star-1.svg`             | 星星图标1          | SVG  | `images.iconStar1`             |
| `icon-star-2.svg`             | 星星图标2          | SVG  | `images.iconStar2`             |
| `icon-star-3.svg`             | 星星图标3          | SVG  | `images.iconStar3`             |
| `icon-lucky-element.svg`      | 幸运元素图标       | SVG  | `images.iconLuckyElement`      |
| `icon-lucky-color.svg`        | 幸运色图标         | SVG  | `images.iconLuckyColor`        |
| `icon-suitable.svg`           | 宜图标             | SVG  | `images.iconSuitable`          |
| `detail-image-1.png`          | 详情图片1          | PNG  | `images.detailImage1`          |
| `detail-image-2.png`          | 详情图片2          | PNG  | `images.detailImage2`          |
| `detail-image-3.png`          | 详情图片3          | PNG  | `images.detailImage3`          |
| `detail-image-4.png`          | 详情图片4          | PNG  | `images.detailImage4`          |
| `detail-image-5.png`          | 详情图片5          | PNG  | `images.detailImage5`          |
| `detail-image-6.png`          | 详情图片6          | PNG  | `images.detailImage6`          |
| `detail-image-7.png`          | 详情图片7          | PNG  | `images.detailImage7`          |
| `detail-image-8.png`          | 详情图片8          | PNG  | `images.detailImage8`          |
| `shop-icon.png`               | 店铺图标           | PNG  | `images.shopIcon`              |
| `decoration-phone-detail.png` | 手机详情装饰       | PNG  | `images.decorationPhoneDetail` |
| `decoration-bottom-line.svg`  | 底部装饰线         | SVG  | `images.decorationBottomLine`  |

**配置文件**: `apps/wx-app/src/pages/fortune/config.ts`

**说明**：

- 背景图片复用了 bind 页面的资源，保持视觉一致性
- 包含大量装饰性图标和详情图片
- 支持多种运势类型的图标展示

---

### **4. 历史记录页面 (history)** - 预留

**路径**: `apps/wx-app/src/static/pages/history/`

_待添加资源文件_

---

## 🔄 资源文件命名规范

### **命名原则**

1. 使用小写字母和连字符（kebab-case）
2. 名称要具有描述性，能清楚表达用途
3. 同类资源使用统一前缀

### **命名示例**

- ✅ `bg-main.png` - 主背景
- ✅ `bg-stars.png` - 星空背景
- ✅ `button-bg.png` - 按钮背景
- ✅ `detail-image-1.png` - 详情图片1
- ❌ `0a490b57ea4c0b85e385f68c706eb0260d4c8e12.png` - 哈希命名（不推荐）
- ❌ `image1.png` - 名称不明确（不推荐）

### **常用前缀**

- `bg-` - 背景图片
- `icon-` - 图标
- `button-` - 按钮相关
- `detail-` - 详情图片
- `avatar-` - 头像
- `banner-` - 横幅

---

## 📝 添加新资源的步骤

### **步骤 1：确定资源所属页面**

确认资源文件属于哪个页面，放入对应的目录。

### **步骤 2：使用规范命名**

按照命名规范给文件命名，确保名称清晰易懂。

### **步骤 3：更新配置文件**

在对应页面的 `config.ts` 文件中添加资源路径配置。

### **步骤 4：更新本文档**

在本文档中记录新添加的资源文件信息。

---

## 🗑️ 删除资源的步骤

### **步骤 1：确认资源未被使用**

检查代码中是否还有引用该资源的地方。

### **步骤 2：删除文件**

从对应目录中删除资源文件。

### **步骤 3：更新配置**

从配置文件中移除相关配置项。

### **步骤 4：更新本文档**

在本文档中删除该资源的记录。

---

## ✅ 资源管理最佳实践

1. **按页面分类存放**：每个页面的资源放在独立目录中
2. **使用规范命名**：避免使用哈希值或无意义的名称
3. **及时清理**：删除不再使用的资源文件
4. **文档同步**：添加或删除资源时同步更新本文档
5. **版本控制**：重要资源文件的修改要有版本记录

---

## 📊 资源统计

| 页面    | 资源数量  | 总大小 | 状态      |
| ------- | --------- | ------ | --------- |
| bind    | 8 个文件  | -      | ✅ 已整理 |
| profile | 8 个文件  | -      | ✅ 已整理 |
| fortune | 33 个文件 | -      | ✅ 已整理 |
| history | 0 个文件  | -      | ⏳ 待添加 |

---

## 🔍 常见问题

### **Q1：为什么要按页面分类存放资源？**

A：便于管理和维护，避免资源文件混乱，也方便后续优化和清理。

### **Q2：可以在多个页面共用同一个资源文件吗？**

A：可以，但建议将共用资源放在 `static/common/` 目录下，而不是某个页面的专属目录。

### **Q3：如何确保资源文件名不重复？**

A：使用页面专属目录可以避免不同页面的资源文件名冲突。

### **Q4：资源文件可以使用中文命名吗？**

A：不建议，使用英文命名更规范，也避免编码问题。

---

**最后更新时间**: 2025-01-15
**维护人员**: 开发团队

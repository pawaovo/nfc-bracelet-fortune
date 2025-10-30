# 小程序上架部署检查清单

## 一、代码修改清单

### ✅ 已完成的修改

1. **隐私保护相关**
   - ✅ 创建隐私政策页面：`apps/wx-app/src/pages/privacy/index.vue`
   - ✅ 创建用户协议页面：`apps/wx-app/src/pages/agreement/index.vue`
   - ✅ 创建设置页面：`apps/wx-app/src/pages/settings/index.vue`
   - ✅ 创建隐私授权弹窗组件：`apps/wx-app/src/components/PrivacyModal.vue`
   - ✅ 在 App.vue 中集成隐私授权逻辑
   - ✅ 在首页添加设置入口和免责声明

2. **开发模式配置**
   - ✅ 关闭开发模式：`apps/wx-app/src/config/dev-scenarios.ts` 中 `DEV_CONFIG.enabled = false`

3. **页面配置**
   - ✅ 在 `pages.json` 中添加新页面路由

---

## 二、需要手动配置的内容

### 1. 生产环境API地址配置

**文件位置：** `apps/wx-app/src/api/config.ts`

**需要修改：**

```typescript
export const API_CONFIG = {
  // 开发环境API地址
  DEV_BASE_URL: 'http://localhost:3000',
  // 生产环境API地址
  PROD_BASE_URL: 'https://your-api-domain.com', // ⚠️ 替换为您的实际域名
  TIMEOUT: 30000,
  VERSION: 'v1',
};
```

**修改为：**

```typescript
PROD_BASE_URL: 'https://api.yourdomain.com', // 您的实际后端API域名
```

### 2. 环境判断逻辑

**文件位置：** `apps/wx-app/src/api/config.ts`

**当前代码：**

```typescript
export function getBaseURL(): string {
  // 在实际项目中，可以根据环境变量或其他方式判断环境
  // 这里简单使用开发环境地址
  return API_CONFIG.DEV_BASE_URL;
}
```

**建议修改为：**

```typescript
export function getBaseURL(): string {
  // 根据编译环境判断
  // @ts-ignore
  if (process.env.NODE_ENV === 'production') {
    return API_CONFIG.PROD_BASE_URL;
  }
  return API_CONFIG.DEV_BASE_URL;
}
```

### 3. 后端环境变量配置

**文件位置：** `apps/api/.env`

**需要配置的内容：**

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@your-db-host:5432/nfc_bracelet_fortune?schema=public"

# JWT配置
JWT_SECRET="your-production-jwt-secret-key-change-this"
JWT_EXPIRES_IN="7d"

# 微信小程序配置
WECHAT_APP_ID="wx7ba4129d919fdf01"  # 您的小程序AppID
WECHAT_APP_SECRET="your-wechat-app-secret"  # 您的小程序AppSecret
WECHAT_DEV_MODE="false"  # 生产环境必须设置为false

# AI服务配置（可选）
OPENAI_API_KEY="your-api-key-here"
OPENAI_BASE_URL="https://ark.cn-beijing.volces.com/api/v3"
OPENAI_MODEL="doubao-seed-1-6-lite-251015"

# 服务器配置
PORT=3000
NODE_ENV="production"

# 日志配置
LOG_LEVEL="info"
```

---

## 三、域名和服务器准备

### 1. 域名准备

**需要准备：**

- [ ] 购买域名（建议使用 .com 或 .cn）
- [ ] 完成域名ICP备案（必须）
- [ ] 配置SSL证书（必须HTTPS）

**推荐服务商：**

- 阿里云：https://www.aliyun.com
- 腾讯云：https://cloud.tencent.com
- 华为云：https://www.huaweicloud.com

### 2. SSL证书配置

**免费证书：**

- Let's Encrypt（推荐）
- 阿里云免费SSL证书
- 腾讯云免费SSL证书

### 3. 服务器部署

**需要部署的服务：**

- [ ] PostgreSQL数据库
- [ ] Node.js后端API服务
- [ ] Nginx反向代理（推荐）

**推荐配置：**

- 服务器：2核4G内存起步
- 数据库：独立部署或使用云数据库
- 备份：定期备份数据库

---

## 四、微信公众平台配置

### 1. 服务器域名配置

**入口：** 开发 > 开发管理 > 开发设置 > 服务器域名

**需要配置：**

```
request合法域名：
- https://api.yourdomain.com  （您的后端API域名）
- https://ark.cn-beijing.volces.com  （如果使用火山引擎AI）
```

### 2. 隐私保护指引填写

**入口：** 设置 > 服务内容声明 > 用户隐私保护指引

**详细填写说明：** 参考 `docs/privacy-guide.md`

### 3. 小程序基本信息

**需要设置：**

- [ ] 小程序名称（避免"算命"、"占卜"等敏感词）
- [ ] 小程序简介（10-120字）
- [ ] 小程序头像（清晰、符合规范）
- [ ] 服务类目（建议：生活服务 > 综合生活服务）

---

## 五、ICP备案流程

### 1. 备案类型选择

**个人备案：**

- 需要：身份证、手机号、实际地址
- 审核时间：3-20个工作日
- 限制：不能涉及商业交易

**企业备案：**

- 需要：营业执照、法人身份证、负责人身份证
- 审核时间：1-20个工作日
- 优势：可以开展商业活动

### 2. 备案步骤

1. 在微信公众平台提交备案申请
2. 平台初审（1-2工作日）
3. 工信部短信核验（24小时内完成）
4. 通管局审核（1-20工作日）
5. 获得ICP备案号

**详细流程：** 参考微信官方文档
https://developers.weixin.qq.com/minigame/product/record/record_guidelines.html

---

## 六、提交审核前检查

### 代码检查

- [ ] 开发模式已关闭（DEV_CONFIG.enabled = false）
- [ ] 生产环境API地址已配置
- [ ] 所有console.log已清理或保留必要的
- [ ] 代码已编译打包无错误

### 功能检查

- [ ] 微信登录功能正常
- [ ] NFC绑定功能正常
- [ ] 个人信息填写功能正常
- [ ] 内容生成功能正常
- [ ] 历史记录功能正常
- [ ] 隐私授权弹窗正常显示
- [ ] 设置页面功能正常

### 内容检查

- [ ] 所有页面无敏感词汇
- [ ] 免责声明已添加
- [ ] 隐私政策内容完整
- [ ] 用户协议内容完整

### 平台配置检查

- [ ] ICP备案已完成
- [ ] 服务器域名已配置
- [ ] 隐私保护指引已填写
- [ ] 小程序基本信息已完善
- [ ] 服务类目已选择

---

## 七、编译和提交

### 1. 编译小程序

```bash
# 进入小程序目录
cd apps/wx-app

# 编译生产版本
npm run build:mp-weixin
```

### 2. 上传代码

1. 打开微信开发者工具
2. 导入项目（选择编译后的 dist/build/mp-weixin 目录）
3. 点击"上传"按钮
4. 填写版本号和版本描述
5. 上传成功

### 3. 提交审核

1. 登录微信公众平台
2. 进入：管理 > 版本管理
3. 选择开发版本，点击"提交审核"
4. 填写审核信息：
   - 版本描述
   - 测试账号（如需要）
   - 隐私保护指引确认
5. 提交审核

---

## 八、审核后处理

### 审核通过

1. 发布上线
2. 监控服务运行状态
3. 收集用户反馈

### 审核被拒

1. 仔细阅读拒绝原因
2. 针对性修改代码或配置
3. 重新提交审核

---

## 九、常见问题

### Q1: 如何测试生产环境配置？

A: 可以在微信开发者工具中切换为"体验版"进行测试。

### Q2: 域名备案需要多久？

A: 通常需要1-20个工作日，建议提前准备。

### Q3: SSL证书如何配置？

A: 可以使用Nginx配置SSL证书，或使用云服务商提供的负载均衡服务。

### Q4: 如何处理审核被拒？

A: 根据拒绝原因修改，常见原因包括：

- 涉及封建迷信（修改文案）
- 缺少隐私政策（已添加）
- 域名未备案（完成备案）
- 功能无法使用（检查服务器）

---

## 十、联系支持

**微信官方：**

- 微信公众平台：https://mp.weixin.qq.com
- 微信开放社区：https://developers.weixin.qq.com/community/

**技术文档：**

- 小程序开发文档：https://developers.weixin.qq.com/miniprogram/dev/
- 小程序备案指引：https://developers.weixin.qq.com/minigame/product/record/

---

**祝您顺利上架！** 🎉

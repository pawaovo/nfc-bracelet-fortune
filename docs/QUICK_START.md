# 🚀 小程序上架快速指南

## 📌 必须完成的3件事

### 1️⃣ 修改生产环境API地址

**文件：** `apps/wx-app/src/api/config.ts`

```typescript
// 第8行，修改这里：
PROD_BASE_URL: 'https://your-api-domain.com',  // ❌ 改成你的域名
```

### 2️⃣ 完成ICP备案

- 登录微信公众平台
- 进入：设置 > 小程序备案
- 按流程完成备案（需要1-20个工作日）

### 3️⃣ 配置服务器域名

- 登录微信公众平台
- 进入：开发 > 开发管理 > 开发设置 > 服务器域名
- 添加你的API域名（必须HTTPS）

---

## ✅ 已经帮你完成的

- ✅ 隐私政策页面
- ✅ 用户协议页面
- ✅ 隐私授权弹窗
- ✅ 设置页面
- ✅ 关闭开发模式
- ✅ 免责声明

---

## 📋 提交审核前检查

```bash
# 1. 确认开发模式已关闭
# 文件：apps/wx-app/src/config/dev-scenarios.ts
# 第112行：enabled: false ✅

# 2. 编译小程序
cd apps/wx-app
npm run build:mp-weixin

# 3. 用微信开发者工具上传代码

# 4. 在微信公众平台提交审核
```

---

## 📚 详细文档

- **隐私保护配置：** `docs/privacy-guide.md`
- **部署检查清单：** `docs/deployment-checklist.md`
- **改造总结：** `docs/privacy-compliance-summary.md`

---

## ⚠️ 重要提醒

1. **域名必须备案** - 没有备案无法通过审核
2. **必须使用HTTPS** - HTTP不被允许
3. **避免敏感词汇** - 不要使用"算命"、"占卜"等词

---

## 🆘 遇到问题？

查看详细文档或联系微信官方客服。

**祝您顺利上架！** 🎉

# 专属NFC手链运势微信小程序

一款基于NFC技术的微信小程序，将实体手链与个性化运势服务结合，用户通过手机触碰NFC手链即可快速获取专属运势。

## 🎯 项目简介

本项目采用前后端分离架构，通过NFC技术实现手链与用户的绑定，为用户提供个性化的每日运势服务，并引导用户前往抖音店铺购买手链商品。

## 🏗️ 技术栈

### 前端 (微信小程序)

- **框架**: uni-app (Vue 3 + Vite + TypeScript)
- **状态管理**: Pinia
- **UI组件**: uView UI 2.x
- **构建工具**: Vite
- **测试**: Vitest

### 后端 (API服务)

- **框架**: NestJS (Node.js + TypeScript)
- **数据库**: PostgreSQL (自建)
- **ORM**: Prisma
- **认证**: JWT + 手机号验证码登录
- **短信服务**: 腾讯云短信
- **日志**: Pino
- **测试**: Jest

### 开发工具

- **包管理**: pnpm workspaces (Monorepo)
- **代码规范**: ESLint + Prettier
- **Git钩子**: husky + lint-staged
- **容器化**: Docker Compose (本地开发)

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose (用于本地数据库)

### 外部服务凭证准备

在开始开发前，请准备以下服务凭证：

1. **腾讯云短信服务** (必需，用于手机号验证码登录)
   - SecretId / SecretKey: 从腾讯云控制台获取
   - SDK AppID: 短信应用ID
   - 签名名称: 已审核通过的短信签名
   - 模板ID: 验证码短信模板ID

2. **微信小程序** (可选，H5版本不需要)
   - AppID: 从微信公众平台获取
   - AppSecret: 从微信公众平台获取

3. **OpenAI兼容API** (可选，用于AI运势生成)
   - API Key: 从OpenAI或其他兼容服务商获取
   - Base URL: API服务地址

### 安装依赖

```bash
# 安装所有依赖
pnpm install
```

### 启动本地数据库

```bash
# 启动PostgreSQL数据库
docker-compose up -d

# 等待数据库启动完成
docker-compose logs -f postgres
```

### 配置环境变量

```bash
# 复制后端环境变量模板
cp apps/api/.env.example apps/api/.env

# 编辑环境变量文件，填入实际的服务凭证
# 特别注意配置：
# - DATABASE_URL: PostgreSQL连接字符串
# - JWT_SECRET: JWT密钥
# - TENCENT_SMS_SECRET_ID: 腾讯云SecretId
# - TENCENT_SMS_SECRET_KEY: 腾讯云SecretKey
# - TENCENT_SMS_SDK_APP_ID: 短信应用ID
# - TENCENT_SMS_SIGN_NAME: 短信签名名称
# - TENCENT_SMS_TEMPLATE_ID: 短信模板ID
# - OPENAI_API_KEY: OpenAI API密钥 (可选)
```

### 初始化数据库

```bash
# 生成Prisma客户端
pnpm --filter api prisma:generate

# 运行数据库迁移
pnpm --filter api prisma:migrate

# 填充种子数据
pnpm --filter api db:seed
```

### 启动开发服务器

```bash
# 同时启动前后端开发服务器
pnpm dev

# 或者分别启动
pnpm dev:wx    # 启动微信小程序开发服务器
pnpm dev:api   # 启动后端API开发服务器
```

### 微信开发者工具配置

1. 打开微信开发者工具
2. 导入项目，选择 `apps/wx-app` 目录
3. 配置AppID为你的微信小程序AppID
4. 开始开发和调试

## 📁 项目结构

```
├── apps/
│   ├── wx-app/          # uni-app前端应用
│   │   ├── src/
│   │   │   ├── api/     # API请求服务
│   │   │   ├── components/ # 可复用组件
│   │   │   ├── pages/   # 页面文件
│   │   │   ├── stores/  # Pinia状态管理
│   │   │   └── utils/   # 工具函数
│   │   └── ...
│   └── api/             # NestJS后端应用
│       ├── src/
│       │   ├── auth/    # 认证模块 (手机号验证码登录)
│       │   ├── fortunes/ # 运势模块
│       │   ├── users/   # 用户模块
│       │   ├── profile/ # 用户资料模块
│       │   ├── bracelets/ # 手链管理模块
│       │   └── common/  # 共享模块 (短信服务等)
│       ├── prisma/      # 数据库Schema和种子数据
│       └── ...
├── packages/
│   └── shared-types/    # 前后端共享类型定义
├── docs/                # 项目文档
├── docker-compose.yml   # 本地开发数据库
└── ...
```

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行前端测试
pnpm test:wx

# 运行后端测试
pnpm test:api
```

## 🔧 代码规范

```bash
# 代码检查
pnpm lint

# 自动修复代码规范问题
pnpm lint:fix

# 代码格式化
pnpm format
```

## 📦 构建

```bash
# 构建所有应用
pnpm build

# 构建微信小程序
pnpm build:wx

# 构建后端API
pnpm build:api
```

## 🚀 部署

### 微信小程序部署

1. 使用 `pnpm build:wx` 构建小程序
2. 使用微信开发者工具上传代码包
3. 在微信公众平台提交审核

### 后端API部署

1. 配置生产环境变量
2. 使用 `pnpm build:api` 构建应用
3. 部署到服务器并启动服务
4. 运行 `pnpm --filter api prisma:deploy` 应用数据库迁移

## 📚 开发文档

- [架构设计文档](./architecture.md)
- [产品需求文档](./prd.md)
- [详细开发文档](./docs/storie/)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

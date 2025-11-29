# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

专属NFC手链运势微信小程序 - 基于NFC技术的微信小程序，将实体手链与个性化运势服务结合。采用 pnpm workspaces 的 Monorepo 架构，前后端分离。

**当前分支**: `feature/h5-web` - H5移动端网页版本，所有功能基于 Web 端实现，非微信小程序原生。

## 技术栈

- **前端**: uni-app (Vue 3 + Vite + TypeScript) + Pinia + uView UI - **编译为 H5 网页**
- **后端**: NestJS + PostgreSQL + Prisma ORM + JWT认证
- **包管理**: pnpm workspaces (需要 pnpm >= 8.0.0)

## 常用命令

### 开发环境

```bash
# 同时启动前后端开发服务器 (H5 + API)
pnpm dev

# 分别启动
pnpm dev:wx    # H5网页开发服务器 (实际运行 uni dev:h5)
pnpm dev:api   # 后端API (默认端口3000)

# 直接启动H5
pnpm --filter wx-app dev:h5
```

### 数据库操作

```bash
# 生成Prisma客户端 (修改schema后必须执行)
pnpm --filter api prisma:generate

# 创建并应用数据库迁移
pnpm --filter api prisma:migrate

# 生产环境应用迁移 (不创建新迁移)
pnpm --filter api prisma:deploy

# 填充种子数据
pnpm --filter api db:seed
```

### 测试

```bash
# 运行所有测试
pnpm test

# 分别测试
pnpm test:wx   # 前端单元测试 (Vitest)
pnpm test:api  # 后端测试 (Jest)

# 后端测试选项
pnpm --filter api test:watch    # 监听模式
pnpm --filter api test:cov      # 生成覆盖率报告
pnpm --filter api test:e2e      # E2E测试
```

### 代码质量

```bash
# 代码检查
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化
pnpm format
```

### 构建

```bash
# 构建所有应用
pnpm build

# 分别构建
pnpm build:wx   # H5网页 -> apps/wx-app/dist/build/h5
pnpm build:api  # 后端API -> apps/api/dist
```

## 架构设计

### Monorepo 结构

```
apps/
├── wx-app/          # uni-app前端 (H5移动端网页)
│   ├── src/
│   │   ├── api/         # API请求服务层
│   │   ├── components/  # 可复用组件
│   │   ├── pages/       # 页面 (见下方页面流程)
│   │   ├── stores/      # Pinia状态管理
│   │   └── utils/       # 工具函数
│   └── dist/build/h5/   # H5构建输出
│
├── api/             # NestJS后端
│   ├── src/
│   │   ├── auth/        # 认证模块 (JWT + 微信登录)
│   │   ├── users/       # 用户管理
│   │   ├── bracelets/   # 手链管理 (NFC绑定)
│   │   ├── fortunes/    # 运势生成与查询
│   │   ├── profile/     # 用户资料
│   │   └── common/      # 共享模块 (guards, interceptors, etc.)
│   ├── prisma/
│   │   ├── schema.prisma  # 数据库Schema
│   │   ├── migrations/    # 数据库迁移历史
│   │   └── seed.ts        # 种子数据
│   └── dist/              # 构建输出
│
packages/
└── shared-types/    # 前后端共享TypeScript类型定义
```

### 数据库模型关系

**核心实体**:

- `User`: 用户 (微信OpenID + 个人信息)
- `Bracelet`: 手链 (NFC ID + 绑定关系)
- `DailyFortune`: 每日运势 (包含详细运势分析)
- `Product`: 商品推荐 (抖音店铺链接)

**关系**:

- User 1:N Bracelet (一个用户可绑定多个手链)
- User 1:N DailyFortune (一个用户有多条运势记录)
- DailyFortune N:1 Product (运势可关联商品推荐)

### 用户流程

1. **NFC扫描** → `pages/bind/index` (绑定手链)
2. **微信登录** → `pages/verify-code/index` (验证码登录)
3. **完善信息** → `pages/profile/index` (生日、出生时辰、出生地)
4. **AI生成** → `pages/ai-generation/index` (生成运势动画)
5. **查看运势** → `pages/fortune/index` (每日运势详情)
6. **历史记录** → `pages/history/index` (运势足迹)

### 认证流程 (H5 Web版)

1. H5页面通过手机号验证码登录或微信授权
2. 后端验证后返回 JWT token
3. 前端存储 token (localStorage) 并在请求头中携带
4. 所有API请求通过 HTTP 标准认证，非微信小程序专有API

### 运势生成逻辑

位于 `apps/api/src/fortunes/` 模块:

- 基于用户生日、出生时辰、出生地生成个性化运势
- 支持 OpenAI 兼容 API (火山引擎 Doubao / DeepSeek / OpenAI)
- 每日运势包含: 总体评分、事业/财富/爱情运势、幸运元素、建议等
- 运势数据缓存在数据库，同一天不重复生成

## 开发注意事项

### 环境变量配置

后端需要配置 `apps/api/.env`:

- `DATABASE_URL`: PostgreSQL连接字符串
- `WECHAT_APP_ID` / `WECHAT_APP_SECRET`: 微信凭证 (H5可选)
- `JWT_SECRET`: JWT密钥 (生产环境必须修改)
- `OPENAI_API_KEY` / `OPENAI_BASE_URL`: AI服务配置 (可选)

H5前端配置 (如需要):

- API Base URL 在 `apps/wx-app/src/config/` 配置

### Prisma 工作流

修改数据库Schema后的标准流程:

1. 编辑 `apps/api/prisma/schema.prisma`
2. 运行 `pnpm --filter api prisma:migrate` 创建迁移
3. 运行 `pnpm --filter api prisma:generate` 更新客户端
4. 重启开发服务器

### 共享类型定义

前后端共享的类型定义在 `packages/shared-types/src/`:

- `bracelet.ts`: 手链相关类型
- `dailyFortune.ts`: 运势相关类型
- 修改后需重启开发服务器以生效

### uni-app H5 特性

- 使用 `uni.` API 编译为标准 Web API (H5模式)
- 页面路由在 `apps/wx-app/src/pages.json` 配置
- 自定义导航栏: `navigationStyle: "custom"`
- H5条件编译: `#ifdef H5` / `#endif`
- 在浏览器中运行，支持移动端触摸事件

### NestJS 模块规范

- 使用构造器注入 (避免 `@Autowired` 字段注入)
- 全局异常过滤器在 `common/filters/`
- 全局守卫 (如 JWT Guard) 在 `common/guards/`
- DTO 验证使用 `class-validator` + `@Validated`

### 代码风格

- 变量/函数名: 英文 (camelCase)
- 注释: 中文
- 提交前自动运行 lint-staged (husky钩子)
- 遵循 ESLint + Prettier 配置

## 调试技巧

### H5 Web 调试

1. 启动开发服务器: `pnpm dev:wx`
2. 在浏览器打开 (通常是 `http://localhost:5173`)
3. 使用浏览器开发者工具 (F12)
4. 移动端调试: 使用 Chrome DevTools 设备模拟或真机远程调试

### 后端调试

- 日志使用 Pino (结构化日志)
- 开发环境日志级别: `info` (可在 `.env` 修改)
- 使用 `nest start --debug --watch` 启用调试模式

### 数据库调试

```bash
# 查看数据库状态
pnpm --filter api prisma:studio  # 打开Prisma Studio GUI

# 查看迁移历史
pnpm --filter api prisma migrate status
```

## 部署

### H5 网页

1. `pnpm build:wx` 构建 (输出到 `apps/wx-app/dist/build/h5`)
2. 将构建产物部署到静态服务器或CDN
3. 配置 CORS 和 API 域名

### 后端API

1. 配置生产环境 `.env`
2. `pnpm build:api` 构建
3. `pnpm --filter api prisma:deploy` 应用迁移
4. `pnpm --filter api start:prod` 启动服务

## 故障排查

### 常见问题

**Prisma 客户端未生成**:

```bash
pnpm --filter api prisma:generate
```

**数据库连接失败**:

- 检查 `DATABASE_URL` 配置
- 确认 PostgreSQL 服务运行中
- 使用 `docker-compose up -d` 启动本地数据库

**H5跨域问题**:

- 开发环境配置代理 (vite.config.ts)
- 生产环境后端配置 CORS

**pnpm 命令失败**:

- 确认使用 pnpm >= 8.0.0
- 在项目根目录执行命令
- 使用 `--filter` 指定子包: `pnpm --filter api <command>`

**HTTP 524 错误 (生产环境)**:

- 524 是 CDN 超时错误（腾讯云 EdgeOne 或 Cloudflare）
- AI 生成 API 耗时较长，可能超过 CDN 默认超时（100秒）
- 解决方案：在 CDN 控制台增加回源超时时间，或对 `/api/*` 路径禁用 CDN 代理

## 生产环境配置

- **域名**: `https://yunshi.autopia.chat`
- **CDN**: 腾讯云 EdgeOne
- **API 超时**: 前端 120 秒，需确保 CDN 回源超时 >= 120 秒
- **AI 服务**: 火山引擎 Doubao（API Key 在 `.env` 配置）
- **生产环境配置模板**: `deployment/.env.production.template`

## PAG 动画

- PAG 文件位于 `apps/wx-app/src/static/pag/`
- 已改为本地加载，不再使用外部 CDN
- libpag SDK: `libpag.min.js` 和 `libpag.wasm` 在 static 目录
- ESLint 已配置忽略 `**/static/libpag*.js`

# 部署状态检查脚本使用说明

## 📋 脚本说明

本目录包含两个检查脚本，帮助您快速验证H5部署前的所有准备工作：

1. **check-deployment-status.ps1** - 本地环境检查脚本（Windows PowerShell）
2. **check-server-status.sh** - 服务器端检查脚本（Linux Bash）

---

## 🖥️ 本地检查（Windows）

### 使用方法

在项目根目录打开PowerShell，运行：

```powershell
cd "D:\ai\手链运势"
.\deployment\check-deployment-status.ps1
```

### 检查项目

- ✅ Git分支是否正确（feature/h5-web）
- ✅ Node.js和pnpm是否安装
- ✅ 项目依赖是否安装
- ✅ API配置是否正确（PROD_BASE_URL）
- ✅ H5是否已构建
- ✅ 构建产物是否完整

### 输出示例

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 H5部署前状态检查
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ 检查本地环境
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Git分支正确: feature/h5-web
✅ Node.js版本: v18.17.0
✅ pnpm版本: 8.6.12
✅ 依赖已安装

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣ 检查本地API配置
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ 生产环境API地址未配置: https://your-api-domain.com
ℹ️ 建议修改为: http://47.239.179.9:43122 或 https://xiaoweigezzz.xyz

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 待办事项
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
还有 2 项待办事项:
  1. 修改 apps\wx-app\src\api\config.ts 中的 PROD_BASE_URL
  2. 运行: cd apps\wx-app && pnpm build:h5
```

---

## 🌐 服务器检查（Linux）

### 使用方法

#### 方法1：直接在服务器上运行

```bash
# SSH连接到服务器
ssh xiaoyi-dev1@47.239.179.9 -p 43122

# 如果脚本已上传到服务器
cd ~/bracelet-fortune
chmod +x deployment/check-server-status.sh
./deployment/check-server-status.sh
```

#### 方法2：从本地上传并运行

```powershell
# 在本地Windows上传脚本
scp -P 43122 deployment\check-server-status.sh xiaoyi-dev1@47.239.179.9:~/

# SSH连接并运行
ssh xiaoyi-dev1@47.239.179.9 -p 43122
chmod +x ~/check-server-status.sh
./check-server-status.sh
```

### 检查项目

- ✅ 1Panel是否安装和运行
- ✅ PostgreSQL数据库是否运行
- ✅ 数据库Schema是否包含username和password字段
- ✅ 后端API是否运行（PM2状态）
- ✅ API是否响应正常
- ✅ H5部署目录是否存在

### 输出示例

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 服务器端状态检查
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣ 检查1Panel状态
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 1Panel已安装
✅ 1Panel服务运行正常
ℹ️ 1Panel访问端口: 8090
ℹ️ 访问地址: http://47.239.179.9:8090

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣ 检查PostgreSQL数据库
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PostgreSQL容器运行中: 1Panel-postgresql-0i7g
✅ 数据库连接正常
❌ users表缺少username字段 - 需要执行数据库迁移
❌ users表缺少password字段 - 需要执行数据库迁移

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 待办事项
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
还有 1 项待办事项:
  1. 执行数据库迁移: cd ~/bracelet-fortune/apps/api && pnpm prisma migrate deploy
```

---

## 🔧 根据检查结果修复问题

### 常见问题及解决方案

#### 1. PROD_BASE_URL未配置

**问题**：`apps\wx-app\src\api\config.ts` 中的 `PROD_BASE_URL` 还是默认值

**解决**：

```powershell
# 编辑配置文件
code apps\wx-app\src\api\config.ts

# 修改第18行为：
PROD_BASE_URL: 'http://47.239.179.9:43122',
# 或者（如果域名已备案）：
PROD_BASE_URL: 'https://xiaoweigezzz.xyz',
```

#### 2. H5未构建

**问题**：`apps\wx-app\dist\build\h5` 目录不存在或不完整

**解决**：

```powershell
cd apps\wx-app
pnpm build:h5
```

#### 3. 数据库缺少字段

**问题**：users表缺少username或password字段

**解决**：

```bash
# SSH连接到服务器
ssh xiaoyi-dev1@47.239.179.9 -p 43122

# 执行数据库迁移
cd ~/bracelet-fortune/apps/api
pnpm prisma migrate deploy
```

#### 4. 后端API未运行

**问题**：PM2进程状态不是online

**解决**：

```bash
# 重启后端
pm2 restart bracelet-api

# 如果进程不存在，启动它
cd ~/bracelet-fortune/apps/api
pm2 start npm --name bracelet-api -- run start:prod
```

---

## 📊 完整检查流程

### 推荐执行顺序

1. **本地检查**

   ```powershell
   .\deployment\check-deployment-status.ps1
   ```

2. **修复本地问题**（根据脚本输出）

3. **服务器检查**

   ```bash
   ssh xiaoyi-dev1@47.239.179.9 -p 43122
   ./check-server-status.sh
   ```

4. **修复服务器问题**（根据脚本输出）

5. **确认所有检查通过**后，开始1Panel部署

---

## ✅ 检查通过标准

当两个脚本都显示 **"✨ 所有准备工作已完成！"** 时，表示可以开始1Panel部署了。

---

## 🆘 需要帮助？

如果检查脚本报错或输出不清楚，请：

1. 复制完整的脚本输出
2. 告诉我具体哪一步出现问题
3. 我会帮您分析并提供解决方案

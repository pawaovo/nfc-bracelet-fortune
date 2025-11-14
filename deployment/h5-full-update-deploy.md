# H5网页版 - 完整更新部署方案

> **策略**: 全部使用最新代码，一次性更新数据库、后端、前端
> **当前cpolar地址**: https://5be590b8.cpolar.io
> **时间**: 约30-40分钟

---

## 📋 部署概览

```
步骤1: 本地准备（打包最新代码）
步骤2: 上传到服务器
步骤3: 备份旧数据
步骤4: 更新数据库
步骤5: 更新后端API
步骤6: 部署H5前端
步骤7: 配置cpolar
步骤8: 测试验证
```

---

## 步骤1: 本地准备（Windows电脑）

### 1.1 确认当前分支

```powershell
cd "D:\ai\手链运势"

# 确认在H5分支
git status
# 应该显示: On branch feature/h5-web

# 如果不是，切换分支
git checkout feature/h5-web
```

### 1.2 更新cpolar地址

打开文件: `apps\wx-app\src\api\config.ts`

修改第16行:

```typescript
TUNNEL_BASE_URL: 'https://5be590b8.cpolar.io',  // ← 改成当前cpolar地址
```

### 1.3 构建H5版本

```powershell
# 安装依赖（确保最新）
pnpm install

# 构建H5
cd apps\wx-app
pnpm build:h5

# 等待构建完成...
```

### 1.4 打包所有需要的文件

```powershell
# 回到项目根目录
cd "D:\ai\手链运势"

# 打包后端代码
Compress-Archive -Path apps\api\* -DestinationPath backend-latest.zip -Force

# 打包H5前端
Compress-Archive -Path apps\wx-app\dist\build\h5\* -DestinationPath h5-latest.zip -Force

# 检查文件
Get-Item backend-latest.zip, h5-latest.zip | Select-Object Name, Length
```

---

## 步骤2: 上传到服务器

### 2.1 上传文件

```powershell
# 上传后端
scp -P 43122 backend-latest.zip xiaoyi-dev1@47.239.179.9:~/

# 上传H5前端
scp -P 43122 h5-latest.zip xiaoyi-dev1@47.239.179.9:~/

# 等待上传完成...
```

---

## 步骤3: 服务器端操作 - 备份旧数据

### 3.1 SSH连接到服务器

```bash
ssh xiaoyi-dev1@47.239.179.9 -p 43122
# 密码: n6pCTKmpXDGVSjhfMzbX
```

### 3.2 备份数据库

```bash
# 备份数据库（重要！）
cd ~/bracelet-fortune/apps/api

# 使用Prisma导出数据
pnpm prisma db pull

# 或者使用pg_dump备份
# 需要知道数据库连接信息
cat .env | grep DATABASE_URL

# 备份整个数据库（可选）
# docker exec -t <postgres容器ID> pg_dump -U bracelet-fortune bracelet-fortune > ~/db-backup-$(date +%Y%m%d).sql
```

### 3.3 备份旧代码

```bash
# 备份旧的后端代码
cd ~
cp -r bracelet-fortune/apps/api bracelet-fortune/apps/api.backup.$(date +%Y%m%d_%H%M%S)

# 备份旧的H5代码（如果存在）
if [ -d "h5-web" ]; then
    cp -r h5-web h5-web.backup.$(date +%Y%m%d_%H%M%S)
fi

echo "✅ 备份完成"
```

---

## 步骤4: 更新后端代码

### 4.1 停止后端服务

```bash
# 停止PM2进程
pm2 stop bracelet-api

# 确认已停止
pm2 list
```

### 4.2 解压新代码

```bash
# 进入后端目录
cd ~/bracelet-fortune/apps/api

# 删除旧的node_modules和dist
rm -rf node_modules dist

# 解压新代码
unzip -o ~/backend-latest.zip

# 删除压缩包
rm ~/backend-latest.zip
```

### 4.3 安装依赖

```bash
# 安装依赖
pnpm install

# 等待安装完成...
```

### 4.4 更新数据库Schema

```bash
# 生成Prisma客户端
pnpm prisma generate

# 执行数据库迁移
pnpm prisma migrate deploy

# 如果上面命令失败，使用开发模式
# pnpm prisma migrate dev --name update-to-h5-version
```

**预期输出**:

```
✔ Generated Prisma Client
✔ Applied 1 migration(s)
```

### 4.5 构建后端

```bash
# 构建
pnpm build

# 检查构建产物
ls -la dist/
```

### 4.6 重启后端服务

```bash
# 重启
pm2 restart bracelet-api

# 查看日志
pm2 logs bracelet-api --lines 30
```

**预期日志**:

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [NestApplication] Nest application successfully started
```

### 4.7 测试后端API

```bash
# 测试本地
curl http://localhost:3000/api/v1

# 测试cpolar
curl https://5be590b8.cpolar.io/api/v1

# 预期返回:
# {"message":"NFC Bracelet Fortune API","version":"1.0.0"}
```

---

## 步骤5: 部署H5前端

### 5.1 解压H5文件

```bash
# 创建/清空H5目录
rm -rf ~/h5-web
mkdir -p ~/h5-web

# 解压
cd ~/h5-web
unzip -o ~/h5-latest.zip

# 删除压缩包
rm ~/h5-latest.zip

# 检查文件
ls -la

# 应该看到: index.html, static/, assets/ 等
```

### 5.2 设置文件权限

```bash
chmod -R 755 ~/h5-web
```

### 5.3 配置Nginx

```bash
# 检查Nginx是否已安装
nginx -v

# 如果未安装
# sudo apt update && sudo apt install nginx -y

# 创建Nginx配置
sudo nano /etc/nginx/sites-available/h5-bracelet
```

**粘贴以下内容**:

```nginx
server {
    listen 8080;
    server_name _;

    root /home/xiaoyi-dev1/h5-web;
    index index.html;

    access_log /var/log/nginx/h5-bracelet-access.log;
    error_log /var/log/nginx/h5-bracelet-error.log;

    # 支持uni-app Hash路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}
```

**保存**: `Ctrl+X` → `Y` → `Enter`

### 5.4 启用Nginx配置

```bash
# 如果配置已存在，先删除
sudo rm -f /etc/nginx/sites-enabled/h5-bracelet

# 创建软链接
sudo ln -s /etc/nginx/sites-available/h5-bracelet /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 检查状态
sudo systemctl status nginx
```

### 5.5 开放防火墙端口

```bash
# 开放8080端口
sudo ufw allow 8080/tcp

# 查看状态
sudo ufw status
```

---

## 步骤6: 配置cpolar多隧道

### 6.1 停止当前cpolar

```bash
# 停止PM2管理的cpolar
pm2 stop cpolar

# 或直接杀死进程
pkill cpolar
```

### 6.2 配置cpolar

```bash
# 编辑配置文件
nano ~/.cpolar/cpolar.yml
```

**修改为以下内容**:

```yaml
version: '2'
authtoken: MjU0NTFiYmItM2Y0Ni00NzU0LTlmNGEtZTg5ZjkyMDA3ZDM4
region: cn
tunnels:
  api:
    proto: http
    addr: 3000
    inspect: false
  h5:
    proto: http
    addr: 8080
    inspect: false
```

**保存**: `Ctrl+X` → `Y` → `Enter`

### 6.3 启动cpolar

```bash
# 直接启动查看地址
cpolar start-all
```

**你会看到类似输出**:

```
cpolar by @bestexpresser                                    (Ctrl+C to quit)

Tunnel Status                 online
Account                       pawaovo (Plan: Free)
Version                       2.62/3.18
Web Interface                 127.0.0.1:4040

Forwarding (api)              https://5be590b8.cpolar.io -> http://localhost:3000
Forwarding (h5)               https://abc123.cpolar.io -> http://localhost:8080
                              ^^^^^^^^^^^^^^^^^^^^^^^^
                              ⚠️ 记录这个H5地址！
```

**⚠️ 重要**:

1. 记录H5的cpolar地址（例如: `https://abc123.cpolar.io`）
2. 按 `Ctrl+C` 停止

### 6.4 使用PM2管理cpolar

```bash
# 使用PM2启动
pm2 delete cpolar  # 删除旧的
pm2 start cpolar --name cpolar -- start-all

# 保存配置
pm2 save

# 查看进程
pm2 list
```

### 6.5 获取cpolar地址

```bash
# 查看cpolar日志获取地址
pm2 logs cpolar --lines 20

# 或访问Web界面
curl http://127.0.0.1:4040/api/tunnels | grep public_url
```

---

## 步骤7: 测试验证

### 7.1 测试本地访问

```bash
# 测试Nginx
curl http://localhost:8080

# 应该返回HTML内容（包含<!DOCTYPE html>）
```

### 7.2 测试cpolar访问

```bash
# 替换为你的H5 cpolar地址
curl https://abc123.cpolar.io

# 应该返回HTML内容
```

### 7.3 浏览器测试（在本地Windows电脑）

打开浏览器，访问:

```
https://abc123.cpolar.io
```

**应该看到**: H5绑定页面

**测试完整URL**:

```
https://abc123.cpolar.io/#/pages/bind/index?nfcId=TEST001
```

### 7.4 功能测试

1. **打开开发者工具**（F12）
2. **切换到Network标签**
3. **填写表单**:
   - 用户名: testuser001
   - 密码: 123456
   - 生日: 1990-01-01
4. **点击"绑定我的手链"**
5. **检查Network**:
   - 应该有API请求发送到: `https://5be590b8.cpolar.io/api/v1/auth/h5-login`
   - 状态码: 200 或 201
6. **检查Console**:
   - 不应该有红色错误
   - 应该有 `[API]` 开头的日志

---

## 步骤8: 验证数据库

### 8.1 使用Prisma Studio

```bash
# 在服务器上
cd ~/bracelet-fortune/apps/api

# 启动Prisma Studio（后台运行）
nohup pnpm prisma studio > ~/prisma-studio.log 2>&1 &

# 记录进程ID
echo $! > ~/prisma-studio.pid
```

### 8.2 访问Prisma Studio

在本地浏览器访问:

```
http://47.239.179.9:5555
```

### 8.3 检查数据

1. 点击 **User** 表
2. 查看是否有新增的测试用户
3. 确认字段:
   - `username`: testuser001
   - `password`: (加密后的密码)
   - `name`: 应该有值
   - `birthday`: 1990-01-01

4. 点击 **Bracelet** 表
5. 查看是否有 `nfcId: TEST001` 的记录
6. 确认 `userId` 字段关联到刚才的用户

---

## 🎉 部署完成！

### ✅ 检查清单

- [ ] 后端API运行正常（PM2显示online）
- [ ] 数据库Schema已更新（包含username和password字段）
- [ ] H5静态文件已部署
- [ ] Nginx配置正确
- [ ] cpolar双隧道运行正常
- [ ] 浏览器可以访问H5页面
- [ ] 表单可以提交
- [ ] 数据保存到数据库

### 📝 重要信息

**API cpolar地址**: https://5be590b8.cpolar.io
**H5 cpolar地址**: https://abc123.cpolar.io （替换为实际地址）

**测试URL**:

```
https://abc123.cpolar.io/#/pages/bind/index?nfcId=TEST001
```

---

## 🔄 如果cpolar地址变化

cpolar免费版重启后地址会变，需要：

### 方案A: 重新构建H5（推荐）

1. 获取新的cpolar地址
2. 修改本地 `apps/wx-app/src/api/config.ts`
3. 重新构建: `pnpm build:h5`
4. 重新上传部署

### 方案B: 购买cpolar付费版

- 价格: 10元/月
- 固定域名
- 更高带宽
- 购买地址: https://dashboard.cpolar.com/get-started

---

## 🐛 常见问题

### Q1: 数据库迁移失败？

```bash
# 查看详细错误
pnpm prisma migrate deploy --verbose

# 如果提示冲突，重置迁移历史
pnpm prisma migrate resolve --applied <migration_name>
```

### Q2: 后端启动失败？

```bash
# 查看详细日志
pm2 logs bracelet-api --lines 100

# 检查环境变量
cat ~/bracelet-fortune/apps/api/.env

# 重新安装依赖
cd ~/bracelet-fortune/apps/api
rm -rf node_modules
pnpm install
```

### Q3: Nginx 404错误？

```bash
# 检查文件路径
ls -la /home/xiaoyi-dev1/h5-web/

# 检查Nginx配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/h5-bracelet-error.log
```

### Q4: cpolar无法启动？

```bash
# 检查配置文件
cat ~/.cpolar/cpolar.yml

# 检查端口占用
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :8080

# 重新启动
pm2 restart cpolar
pm2 logs cpolar
```

---

## 📞 下一步

部署完成后，你可以：

1. ✅ **充分测试**: 测试所有功能流程
2. ✅ **邀请内测**: 分享cpolar地址给朋友测试
3. ✅ **收集反馈**: 记录问题和改进建议
4. ✅ **准备上线**: 完成域名备案后切换到正式域名

---

**祝部署顺利！** 🚀

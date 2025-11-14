# H5网页版 - cpolar快速部署方案

> **策略**: 先用cpolar快速验证功能 → 再切换到1Panel正式域名
> **优势**: 快速测试、降低风险、无需等待备案
> **时间**: 约30分钟完成部署和测试

---

## 📊 三阶段部署策略

```
阶段1: cpolar临时环境 (1-2天)
  ├─ 快速搭建H5访问环境
  ├─ 验证所有功能
  ├─ 发现并修复问题
  └─ 确保流程完整可用

阶段2: 1Panel IP访问 (可选, 1天)
  ├─ 在1Panel部署静态网站
  ├─ 使用IP地址访问
  ├─ 验证1Panel配置
  └─ 确保伪静态等配置正确

阶段3: 1Panel正式域名 (长期)
  ├─ 绑定已备案域名
  ├─ 配置SSL证书
  ├─ 开启HTTPS
  └─ 正式上线
```

---

## 🎯 阶段1: cpolar临时环境部署

### 一、服务器端配置

#### 1.1 连接服务器

```bash
ssh xiaoyi-dev1@47.239.179.9 -p 43122
# 密码: n6pCTKmpXDGVSjhfMzbX
```

#### 1.2 检查cpolar是否已安装

```bash
# 检查cpolar
cpolar version

# 如果未安装，执行安装脚本
cd ~/bracelet-fortune/deployment
chmod +x setup-cpolar.sh
./setup-cpolar.sh
```

**预期输出**:

```
cpolar version 3.x.x
```

#### 1.3 启动cpolar内网穿透

**方法A: 使用systemd服务（推荐，开机自启）**

```bash
# 检查cpolar服务状态
sudo systemctl status cpolar

# 如果未运行，启动服务
sudo systemctl start cpolar

# 查看cpolar日志，获取公网地址
sudo journalctl -u cpolar -f

# 你会看到类似输出:
# Forwarding: https://abc123.cpolar.cn -> http://localhost:3000
#             ^^^^^^^^^^^^^^^^^^^^^^^^
#             这就是你的公网地址！
```

**方法B: 手动启动（临时测试）**

```bash
# 直接启动cpolar
cpolar http 3000

# 会显示:
# Forwarding: https://abc123.cpolar.cn -> http://localhost:3000
```

**⚠️ 重要**: 复制这个HTTPS地址，例如: `https://abc123.cpolar.cn`

#### 1.4 验证后端API可访问

```bash
# 测试本地API
curl http://localhost:3000/api/v1

# 测试cpolar公网地址（替换为你的地址）
curl https://abc123.cpolar.cn/api/v1

# 预期返回:
# {"message":"NFC Bracelet Fortune API","version":"1.0.0"}
```

---

### 二、本地H5构建配置

#### 2.1 修改API配置

**在本地Windows电脑上操作**:

打开文件: `apps/wx-app/src/api/config.ts`

找到H5相关配置，修改为cpolar地址:

```typescript
// apps/wx-app/src/api/config.ts

export const API_CONFIG = {
  // 开发环境
  DEV_BASE_URL: 'http://localhost:3000',

  // 生产环境 - 使用cpolar地址
  PROD_BASE_URL: 'https://abc123.cpolar.cn', // ← 修改这里

  TIMEOUT: 30000,
  VERSION: 'v1',
};
```

**或者使用快速更新脚本**:

```powershell
# 在项目根目录
node scripts/update-cpolar-url.js https://abc123.cpolar.cn
```

#### 2.2 构建H5版本

```powershell
# 在本地Windows电脑上
cd "D:\ai\手链运势"

# 进入wx-app目录
cd apps\wx-app

# 构建H5版本
pnpm build:h5

# 等待构建完成...
# 构建产物在: dist\build\h5\
```

#### 2.3 本地预览测试（可选）

```powershell
# 使用serve预览
npx serve dist\build\h5

# 在浏览器访问: http://localhost:3000
# 测试URL: http://localhost:3000/#/pages/bind/index?nfcId=TEST
```

---

### 三、部署H5到服务器

#### 3.1 上传H5文件到服务器

**方法A: 使用SCP（推荐）**

```powershell
# 在本地Windows电脑上（PowerShell）
cd "D:\ai\手链运势\apps\wx-app\dist\build"

# 压缩h5目录
Compress-Archive -Path h5\* -DestinationPath h5-web.zip -Force

# 上传到服务器
scp -P 43122 h5-web.zip xiaoyi-dev1@47.239.179.9:~/
```

**方法B: 使用XFTP/WinSCP**

1. 连接服务器: 47.239.179.9:43122
2. 上传整个 `h5` 目录到 `/home/xiaoyi-dev1/h5-web/`

#### 3.2 在服务器上解压文件

```bash
# SSH连接到服务器
ssh xiaoyi-dev1@47.239.179.9 -p 43122

# 创建目录并解压
mkdir -p ~/h5-web
cd ~/h5-web
unzip -o ~/h5-web.zip

# 检查文件
ls -la
# 应该看到: index.html, static/, assets/ 等
```

#### 3.3 使用Nginx部署静态网站

**步骤1: 安装Nginx（如果未安装）**

```bash
# 检查Nginx是否已安装
nginx -v

# 如果未安装
sudo apt update
sudo apt install nginx -y
```

**步骤2: 创建Nginx配置文件**

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/h5-web
```

**粘贴以下配置**:

```nginx
server {
    listen 8080;
    server_name _;

    root /home/xiaoyi-dev1/h5-web;
    index index.html;

    # 日志
    access_log /var/log/nginx/h5-web-access.log;
    error_log /var/log/nginx/h5-web-error.log;

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
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**步骤3: 启用配置并重启Nginx**

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/h5-web /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 检查状态
sudo systemctl status nginx
```

#### 3.4 配置防火墙

```bash
# 开放8080端口
sudo ufw allow 8080/tcp

# 查看防火墙状态
sudo ufw status
```

---

### 四、测试H5网页访问

#### 4.1 使用cpolar访问H5

**步骤1: 创建新的cpolar隧道（用于H5）**

```bash
# 在服务器上
cpolar http 8080

# 会显示新的地址:
# Forwarding: https://def456.cpolar.cn -> http://localhost:8080
#             ^^^^^^^^^^^^^^^^^^^^^^^^
#             这是H5的公网地址！
```

**或者配置多隧道**:

编辑cpolar配置文件:

```bash
nano ~/.cpolar/cpolar.yml
```

添加以下内容:

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

启动所有隧道:

```bash
cpolar start-all

# 会显示两个地址:
# api: https://abc123.cpolar.cn -> http://localhost:3000
# h5:  https://def456.cpolar.cn -> http://localhost:8080
```

#### 4.2 浏览器测试

```
访问H5网页: https://def456.cpolar.cn
测试绑定页面: https://def456.cpolar.cn/#/pages/bind/index?nfcId=TEST001
```

**检查项**:

- [ ] 页面正常显示
- [ ] 样式加载正常
- [ ] URL参数正确传递
- [ ] 点击按钮可以跳转

#### 4.3 测试API连接

1. 打开浏览器开发者工具（F12）
2. 切换到 **Network** 标签
3. 在H5页面中填写表单并提交
4. 查看API请求是否发送到 `https://abc123.cpolar.cn/api/v1/...`
5. 确认请求返回正常（状态码200）

---

### 五、完整功能测试

#### 5.1 测试流程

1. **访问绑定页面**

   ```
   https://def456.cpolar.cn/#/pages/bind/index?nfcId=TEST001
   ```

2. **填写用户信息**
   - 用户名: testuser
   - 密码: 123456
   - 生日: 1990-01-01

3. **提交表单**
   - 检查Network中的API请求
   - 确认数据保存成功

4. **测试运势生成**
   - 等待AI生成运势
   - 查看运势详情页面

5. **测试历史记录**
   - 查看历史运势
   - 测试日期切换

#### 5.2 数据库验证

```bash
# 在服务器上
cd ~/bracelet-fortune/apps/api
pnpm prisma studio

# 在浏览器访问: http://47.239.179.9:5555
# 查看User表，确认新增的用户数据
```

---

## 🔄 阶段2: 切换到1Panel IP访问（可选）

### 为什么需要这个阶段？

- 验证1Panel配置是否正确
- 测试Nginx伪静态规则
- 确保切换域名时不会出问题

### 操作步骤

1. **在1Panel中创建静态网站**（参考完整部署指南第五章）
2. **使用IP访问**: `http://47.239.179.9`
3. **测试所有功能**
4. **确认无误后进入阶段3**

---

## 🎯 阶段3: 切换到1Panel正式域名

### 前提条件

- [ ] 域名已完成ICP备案
- [ ] DNS已解析到服务器IP
- [ ] 1Panel静态网站已配置

### 操作步骤

详见: `docs/H5网页版完整部署指南.md` 第六章

简要步骤:

1. **域名解析**: 添加A记录指向 47.239.179.9
2. **1Panel绑定域名**: 修改网站主域名
3. **申请SSL证书**: 使用Let's Encrypt
4. **开启HTTPS**: 强制HTTPS跳转
5. **测试访问**: `https://xiaoweigezzz.xyz`

---

## 📝 cpolar地址变化处理

### 问题

cpolar免费版每次重启后，域名会变化（如 `abc123.cpolar.cn` → `xyz789.cpolar.cn`）

### 解决方案

**方案A: 购买cpolar付费版（推荐）**

- 价格: 约10元/月
- 固定域名: 不会变化
- 更高带宽: 访问更快
- 购买地址: https://dashboard.cpolar.com/get-started

**方案B: 每次更新配置（免费）**

```bash
# 1. 在服务器上重启cpolar
cpolar start-all

# 2. 复制新的地址
# api: https://新地址1.cpolar.cn
# h5:  https://新地址2.cpolar.cn

# 3. 在本地更新API配置
# 修改 apps/wx-app/src/api/config.ts
# PROD_BASE_URL: 'https://新地址1.cpolar.cn'

# 4. 重新构建H5
cd apps/wx-app
pnpm build:h5

# 5. 重新上传到服务器
# 使用SCP或XFTP上传
```

**方案C: 尽快切换到正式域名**

- 完成域名备案
- 切换到阶段3
- 不再依赖cpolar

---

## ✅ 部署检查清单

### 服务器端

- [ ] cpolar已安装并配置authtoken
- [ ] 后端API运行正常（PM2）
- [ ] cpolar隧道已启动（api + h5）
- [ ] Nginx已安装并配置
- [ ] H5静态文件已上传
- [ ] 防火墙已开放8080端口

### 本地端

- [ ] API配置已更新为cpolar地址
- [ ] H5已成功构建
- [ ] 构建产物已上传到服务器

### 功能测试

- [ ] H5页面可以访问
- [ ] URL参数正确传递
- [ ] API请求正常
- [ ] 表单可以提交
- [ ] 数据保存到数据库
- [ ] 完整流程测试通过

---

## 🆚 cpolar vs 1Panel域名对比

| 对比项       | cpolar临时环境    | 1Panel正式域名    |
| ------------ | ----------------- | ----------------- |
| **部署速度** | ⚡ 极快（30分钟） | 🐢 较慢（需备案） |
| **访问速度** | 🐢 较慢（有代理） | ⚡ 极快（直连）   |
| **稳定性**   | ⚠️ 依赖cpolar服务 | ✅ 非常稳定       |
| **URL变化**  | ❌ 免费版每天变   | ✅ 固定不变       |
| **HTTPS**    | ✅ 自动提供       | ✅ Let's Encrypt  |
| **成本**     | 💰 免费/10元月    | 💰 域名+备案      |
| **适用场景** | 🧪 测试、开发     | 🚀 生产、正式     |

---

## 💡 最佳实践建议

### 1. 渐进式部署

```
第1-2天: cpolar环境
  ├─ 快速验证功能
  ├─ 发现并修复问题
  └─ 确保流程完整

第3天: 1Panel IP访问（可选）
  ├─ 验证1Panel配置
  └─ 测试Nginx规则

第4天起: 1Panel正式域名
  ├─ 绑定已备案域名
  ├─ 配置SSL证书
  └─ 正式上线
```

### 2. 并行操作

- 在使用cpolar测试的同时，可以并行准备1Panel环境
- 在测试期间，可以同时申请SSL证书
- 确保切换时无缝过渡

### 3. 备份策略

- 每次部署前备份数据库
- 保留cpolar环境作为备用
- 记录所有配置变更

---

## 🐛 常见问题

### Q1: cpolar地址访问不了？

```bash
# 检查cpolar服务
sudo systemctl status cpolar

# 查看日志
sudo journalctl -u cpolar -f

# 重启cpolar
sudo systemctl restart cpolar
```

### Q2: H5页面404？

```bash
# 检查Nginx配置
sudo nginx -t

# 检查文件权限
ls -la /home/xiaoyi-dev1/h5-web/

# 修改权限
sudo chmod -R 755 /home/xiaoyi-dev1/h5-web/
```

### Q3: API请求CORS错误？

检查后端CORS配置:

```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: '*', // 允许所有来源
  credentials: true,
});
```

### Q4: cpolar免费版限速？

- 购买付费版（10元/月）
- 或尽快切换到正式域名

---

## 📞 下一步

完成cpolar部署后，你可以：

1. ✅ **充分测试**: 在cpolar环境测试所有功能
2. ✅ **收集反馈**: 邀请用户内测
3. ✅ **修复问题**: 发现并解决所有bug
4. ✅ **准备上线**: 完成域名备案
5. ✅ **切换域名**: 按照完整部署指南切换到正式域名

---

**祝部署顺利！** 🚀

有任何问题随时问我。

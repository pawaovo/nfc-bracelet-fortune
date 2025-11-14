# 1Panel部署H5静态网站详细操作指南

> **文档版本**: v1.0  
> **更新时间**: 2025-11-14  
> **适用项目**: NFC手链运势H5网页版  
> **服务器**: 47.239.179.9:43122

---

## 📋 目录

1. [部署前确认](#一部署前确认)
2. [访问1Panel面板](#二访问1panel面板)
3. [创建静态网站](#三创建静态网站)
4. [配置伪静态规则](#四配置伪静态规则)
5. [配置反向代理（可选）](#五配置反向代理可选)
6. [测试验证](#六测试验证)
7. [常见问题](#七常见问题)

---

## 一、部署前确认

### ✅ 检查清单

在开始1Panel部署前，请确认以下项目已完成：

- [x] 本地H5已构建（apps/wx-app/dist/build/h5）
- [x] API配置正确（PROD_BASE_URL: http://47.239.179.9:43122）
- [x] H5文件已上传到服务器（/home/xiaoyi-dev1/h5-web）
- [x] 数据库Schema已更新（包含username和password字段）
- [x] 后端API运行正常（PM2状态：online）

### 📂 服务器文件位置

```
H5部署目录: /home/xiaoyi-dev1/h5-web
文件数量: 125个
目录大小: 6.3MB
关键文件:
  - index.html
  - assets/
  - static/
```

---

## 二、访问1Panel面板

### 步骤1：打开浏览器

推荐使用 **Chrome** 或 **Edge** 浏览器

### 步骤2：访问1Panel

在地址栏输入：

```
http://47.239.179.9:8090
```

**常用端口**：

- 8090（最常用）
- 8888
- 9999

如果不确定端口，可以SSH到服务器查询：

```bash
ssh xiaoyi-dev1@47.239.179.9 -p 43122
sudo 1pctl status
```

### 步骤3：登录1Panel

1. 输入管理员账号
2. 输入管理员密码
3. 点击「登录」

**忘记密码？**

```bash
# SSH连接到服务器
ssh xiaoyi-dev1@47.239.179.9 -p 43122
# 查看用户信息
sudo 1pctl user-info
```

---

## 三、创建静态网站

### 步骤1：确认OpenResty已安装

1Panel使用OpenResty作为Web服务器。如果是首次使用，需要先安装：

1. 在1Panel左侧菜单点击 **「应用商店」**
2. 搜索 **「OpenResty」** 或 **「Nginx」**
3. 如果未安装，点击 **「安装」** 按钮
4. 等待安装完成（通常1-2分钟）

**注意**：如果OpenResty已安装，可以跳过此步骤。

### 步骤2：进入网站管理

1. 登录1Panel后，在左侧菜单栏找到 **「网站」**
2. 点击进入网站管理页面

### 步骤3：创建新网站

1. 点击页面右上角的 **「创建网站」** 按钮
2. 在弹出的对话框中选择网站类型

### 步骤4：选择静态网站

1. 选择 **「静态网站」** 选项
2. 点击 **「下一步」** 或 **「确定」**

### 步骤5：配置网站基本信息

填写以下信息：

#### 主域名

```
47.239.179.9
```

或者（如果域名已备案）：

```
xiaoweigezzz.xyz
```

#### 网站别名（可选）

```
www.xiaoweigezzz.xyz
```

#### 网站目录

```
/home/xiaoyi-dev1/h5-web
```

**重要提示**：

- 路径必须是**绝对路径**
- 确保路径正确，可以点击「浏览」按钮选择
- 目录中必须包含 `index.html` 文件

#### 默认文档

```
index.html
```

#### 备注（可选）

```
NFC手链运势H5网页版
```

### 步骤5：高级设置

#### 开启Gzip压缩

- [x] **启用Gzip压缩**
- 作用：减少传输数据量，提升加载速度

#### 开启访问日志

- [x] **启用访问日志**
- 作用：记录访问情况，便于调试和分析

#### HTTPS设置

- [ ] **暂不开启HTTPS**
- 说明：域名备案后再配置SSL证书

### 步骤6：确认创建

1. 检查所有配置信息是否正确
2. 点击 **「确定」** 或 **「创建」** 按钮
3. 等待网站创建完成（通常几秒钟）

### 步骤7：通过1Panel上传文件（可选方法）

如果您还没有通过SSH上传H5文件，也可以直接在1Panel中上传：

1. 在网站列表中找到刚创建的网站
2. 点击网站目录图标（文件夹图标）
3. 进入文件管理界面
4. 点击 **「上传」** 按钮
5. 选择本地的H5文件（可以先压缩成zip）
6. 上传完成后，如果是zip文件，右键选择 **「解压」**
7. 确保 `index.html` 在网站根目录

**提示**：

- 支持拖拽上传
- 支持批量上传
- 建议先压缩成zip再上传，速度更快

---

## 四、配置伪静态规则

### 为什么需要配置伪静态？

uni-app H5使用Hash路由（如 `/#/pages/bind/index`），需要配置伪静态规则确保所有路由都能正确访问。

### 步骤1：进入网站设置

1. 在网站列表中找到刚创建的网站
2. 点击网站右侧的 **「设置」** 按钮（或齿轮图标）

### 步骤2：打开伪静态配置

1. 在网站设置页面，点击左侧的 **「伪静态」** 选项卡
2. 进入伪静态配置页面

### 步骤3：添加伪静态规则

在配置框中输入以下内容：

```nginx
# 支持uni-app Hash路由
location / {
    try_files $uri $uri/ /index.html;
}

# 静态资源缓存优化
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# Gzip压缩配置
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
```

### 步骤4：保存配置

1. 检查配置是否正确（注意分号、括号）
2. 点击 **「保存」** 按钮
3. 等待配置生效（通常立即生效）

---

## 五、配置反向代理（可选）

### 什么时候需要配置反向代理？

如果H5网页需要通过相对路径访问后端API（如 `/api/v1/...`），需要配置反向代理。

**当前配置**：H5直接访问 `http://47.239.179.9:43122/api/v1/...`，**不需要**配置反向代理。

### 如果需要配置（可跳过）

#### 步骤1：进入反向代理设置

1. 在网站设置页面，点击 **「反向代理」** 选项卡
2. 点击 **「添加」** 按钮

#### 步骤2：配置代理规则

```
代理名称: api-proxy
代理路径: /api
目标地址: http://localhost:3000/api
```

#### 步骤3：添加CORS配置（如果需要）

在「自定义配置」中添加：

```nginx
# CORS配置
add_header Access-Control-Allow-Origin * always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

# 处理OPTIONS预检请求
if ($request_method = 'OPTIONS') {
    return 204;
}
```

---

## 六、测试验证

### 测试1：访问首页

在浏览器中访问：

```
http://47.239.179.9/
```

**预期结果**：

- ✅ 页面正常显示
- ✅ 样式加载正常
- ✅ 没有404错误

### 测试2：测试NFC参数传递

访问带参数的URL：

```
http://47.239.179.9/#/pages/bind/index?nfcId=TEST001
```

**预期结果**：

- ✅ 页面正常加载
- ✅ nfcId参数正确传递
- ✅ 可以看到绑定页面

### 测试3：测试API连接

1. 打开浏览器开发者工具（按F12）
2. 切换到 **「Network」** 标签
3. 在H5页面中进行操作（如填写表单）
4. 观察Network中的请求

**预期结果**：

- ✅ 可以看到发送到 `http://47.239.179.9:43122/api/v1/...` 的请求
- ✅ 请求返回状态码 200
- ✅ 没有CORS错误

### 测试4：完整流程测试

1. 访问绑定页面：`http://47.239.179.9/#/pages/bind/index?nfcId=TEST002`
2. 点击「绑定我的手链」
3. 填写个人信息（用户名、密码、生日）
4. 提交表单
5. 观察是否成功跳转

**预期结果**：

- ✅ 表单提交成功
- ✅ 数据保存到数据库
- ✅ 页面正常跳转

---

## 七、常见问题

### 问题1：访问网站显示404

**原因**：

- 网站目录配置错误
- 文件权限问题
- 伪静态规则未配置

**解决方案**：

1. 检查网站目录是否正确

   ```bash
   ls -la /home/xiaoyi-dev1/h5-web/
   # 应该看到 index.html
   ```

2. 检查文件权限

   ```bash
   chmod -R 755 /home/xiaoyi-dev1/h5-web/
   ```

3. 确认伪静态规则已配置并保存

### 问题2：页面显示但样式错乱

**原因**：

- 静态资源路径错误
- 缓存问题

**解决方案**：

1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 强制刷新页面（Ctrl+F5）
3. 检查开发者工具Console是否有资源加载错误

### 问题3：API请求失败（CORS错误）

**原因**：

- 后端CORS配置问题
- API地址配置错误

**解决方案**：

1. 检查后端CORS配置（apps/api/src/main.ts）

   ```typescript
   app.enableCors({
     origin: '*',
     credentials: true,
   });
   ```

2. 检查H5的API配置（已配置为 http://47.239.179.9:43122）

3. 重启后端API
   ```bash
   pm2 restart bracelet-api
   ```

### 问题4：无法访问1Panel面板

**原因**：

- 端口号错误
- 防火墙阻止
- 1Panel服务未运行
- 云服务器安全组未开放端口

**解决方案**：

1. 确认1Panel端口

   ```bash
   sudo 1pctl status
   ```

2. 检查服务器防火墙

   ```bash
   sudo ufw status
   sudo ufw allow 8090/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **检查云服务器安全组**（重要！）

   如果使用阿里云/腾讯云/华为云等云服务器：
   - 登录云服务商控制台
   - 找到「安全组」或「防火墙」设置
   - 添加入站规则：
     - 端口：8090（1Panel面板）
     - 端口：80（HTTP）
     - 端口：443（HTTPS）
     - 端口：43122（后端API，如果需要外部访问）
   - 协议：TCP
   - 来源：0.0.0.0/0（允许所有IP访问）

4. 重启1Panel
   ```bash
   sudo 1pctl restart
   ```

### 问题5：域名无法访问网站

**原因**：

- DNS解析未生效
- 域名未备案（中国大陆服务器）
- 安全组端口未开放

**解决方案**：

1. **检查DNS解析**

   ```bash
   # 在本地电脑测试
   ping xiaoweigezzz.xyz
   # 应该解析到 47.239.179.9
   ```

2. **等待DNS生效**
   - DNS解析通常需要5-10分钟生效
   - 最长可能需要24-48小时
   - 可以使用在线工具检查：https://www.whatsmydns.net/

3. **检查域名备案**（中国大陆服务器必须）
   - 访问工信部备案查询：https://beian.miit.gov.cn
   - 输入域名查询备案状态
   - 未备案的域名无法在中国大陆服务器使用

4. **临时使用IP访问**
   ```
   http://47.239.179.9/
   ```

### 问题6：网站文件上传后无法访问

**原因**：

- 文件路径不正确
- index.html不在根目录
- 文件权限问题

**解决方案**：

1. **检查文件结构**

   ```bash
   cd /home/xiaoyi-dev1/h5-web
   ls -la
   # 应该直接看到 index.html，而不是在子目录中
   ```

2. **如果index.html在子目录中**

   ```bash
   # 假设在 dist 子目录中
   mv dist/* .
   rm -rf dist
   ```

3. **检查文件权限**
   ```bash
   chmod -R 755 /home/xiaoyi-dev1/h5-web/
   chown -R xiaoyi-dev1:xiaoyi-dev1 /home/xiaoyi-dev1/h5-web/
   ```

---

## 八、部署完成检查清单

部署完成后，请确认以下所有项目：

- [ ] 1Panel中成功创建了静态网站
- [ ] 网站目录指向正确（/home/xiaoyi-dev1/h5-web）
- [ ] 伪静态规则已配置
- [ ] 可以通过IP访问网站首页
- [ ] NFC参数可以正确传递
- [ ] API请求正常（无CORS错误）
- [ ] 完整流程测试通过

---

## 九、端口和安全组配置

### 必须开放的端口

为了确保网站和1Panel正常访问，需要开放以下端口：

| 端口  | 用途                    | 协议 | 是否必须 |
| ----- | ----------------------- | ---- | -------- |
| 80    | HTTP网站访问            | TCP  | ✅ 必须  |
| 443   | HTTPS网站访问           | TCP  | ⭐ 推荐  |
| 8090  | 1Panel管理面板          | TCP  | ✅ 必须  |
| 43122 | SSH连接                 | TCP  | ✅ 必须  |
| 43122 | 后端API（如需外部访问） | TCP  | ⚠️ 可选  |

### 云服务器安全组配置

#### 阿里云

1. 登录阿里云控制台
2. 进入「云服务器ECS」→「实例」
3. 点击实例ID进入详情页
4. 点击「安全组」标签
5. 点击「配置规则」
6. 添加入方向规则：
   - 授权策略：允许
   - 优先级：1
   - 协议类型：TCP
   - 端口范围：80/80（分别添加80、443、8090、43122）
   - 授权对象：0.0.0.0/0

#### 腾讯云

1. 登录腾讯云控制台
2. 进入「云服务器」→「安全组」
3. 找到对应的安全组，点击「修改规则」
4. 点击「入站规则」→「添加规则」
5. 添加规则：
   - 类型：自定义
   - 来源：0.0.0.0/0
   - 协议端口：TCP:80（分别添加各端口）
   - 策略：允许

#### 华为云

1. 登录华为云控制台
2. 进入「弹性云服务器」→「安全组」
3. 点击安全组名称进入详情
4. 点击「入方向规则」→「添加规则」
5. 配置规则：
   - 协议：TCP
   - 端口：80（分别添加各端口）
   - 源地址：0.0.0.0/0

### 服务器防火墙配置

如果使用UFW防火墙：

```bash
# 检查防火墙状态
sudo ufw status

# 开放必要端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8090/tcp
sudo ufw allow 43122/tcp

# 重新加载防火墙
sudo ufw reload

# 查看规则
sudo ufw status numbered
```

如果使用firewalld：

```bash
# 检查防火墙状态
sudo firewall-cmd --state

# 开放端口
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=8090/tcp
sudo firewall-cmd --permanent --add-port=43122/tcp

# 重新加载
sudo firewall-cmd --reload

# 查看规则
sudo firewall-cmd --list-all
```

---

## 十、下一步（可选）

### 配置域名（如果域名已备案）

1. 在域名服务商添加DNS解析

   ```
   类型: A
   主机记录: @
   记录值: 47.239.179.9
   ```

2. 在1Panel中修改网站域名
   - 进入网站设置
   - 修改主域名为：xiaoweigezzz.xyz

3. 申请SSL证书
   - 在网站设置中点击「HTTPS」
   - 选择「Let's Encrypt」
   - 申请免费证书

---

**部署完成！** 🎉

如有问题，请参考常见问题章节或联系技术支持。

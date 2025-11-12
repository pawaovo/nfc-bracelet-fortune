# 脚本工具说明

本目录包含项目常用的实用脚本工具。

## 📋 脚本列表

### 1. `get-cpolar-info.sh`

**用途**：获取当前 cpolar 隧道地址

**使用场景**：

- 在服务器上运行，快速查看当前 cpolar 地址
- 用于配置小程序 API 地址

**使用方法**：

```bash
# 在服务器上执行
./scripts/get-cpolar-info.sh
```

**输出示例**：

```
✅ 检测到 cpolar 隧道
  API 地址: https://41412356.cpolar.io

📋 下一步操作：
1️⃣  更新小程序 API 配置
2️⃣  配置微信公众平台域名
3️⃣  重新编译小程序
4️⃣  上传体验版测试
```

---

### 2. `update-cpolar-url.js`

**用途**：快速更新小程序中的 cpolar URL 配置

**使用场景**：

- cpolar 地址变更后，快速更新配置文件
- 自动修改 `apps/wx-app/src/api/config.ts`

**使用方法**：

```bash
# 在项目根目录执行
node scripts/update-cpolar-url.js https://新的cpolar地址.cpolar.io
```

**示例**：

```bash
node scripts/update-cpolar-url.js https://41412356.cpolar.io
```

**输出示例**：

```
✅ 配置更新成功！

📝 已更新:
   TUNNEL_BASE_URL: 'https://41412356.cpolar.io'
   CURRENT_ENV: 'tunnel'

🔄 下一步:
   1. 编译小程序: cd apps/wx-app && pnpm build:mp-weixin
   2. 上传体验版
```

---

### 3. `test-pag-download.js`

**用途**：测试 PAG 文件下载是否正常

**使用场景**：

- 诊断 PAG 文件下载问题
- 检查 CDN 是否可访问
- 测试下载速度

**使用方法**：

```bash
# 在项目根目录执行
node scripts/test-pag-download.js
```

**输出示例**：

```
🔍 开始测试PAG文件下载...
📍 URL: https://cdn.jsdelivr.net/gh/pawaovo/pag-files@main/loading_bmp.pag

📊 响应信息:
  状态码: 200
  Content-Type: application/octet-stream
  Content-Length: 6806528 bytes

📥 下载进度: 100.00% (6806528/6806528 bytes)

✅ 下载完成！
  总大小: 6806528 bytes
  耗时: 2345 ms
  速度: 2834.56 KB/s

🎉 PAG文件可以正常下载！
```

---

## 🔧 常见使用流程

### 场景 1：cpolar 地址变更

```bash
# 1. 在服务器上获取新地址
ssh user@server './scripts/get-cpolar-info.sh'

# 2. 在本地更新配置
node scripts/update-cpolar-url.js https://新地址.cpolar.io

# 3. 重新编译
cd apps/wx-app
pnpm build:mp-weixin

# 4. 上传体验版
```

### 场景 2：PAG 动画加载问题

```bash
# 测试 PAG 文件下载
node scripts/test-pag-download.js

# 如果下载失败，检查：
# - 网络连接
# - CDN 是否可访问
# - 防火墙设置
```

---

## 📝 注意事项

1. **get-cpolar-info.sh**：
   - 需要在服务器上执行
   - 需要 cpolar 正在运行
   - 需要 curl 命令

2. **update-cpolar-url.js**：
   - 需要在项目根目录执行
   - 会自动修改配置文件
   - 修改后需要重新编译小程序

3. **test-pag-download.js**：
   - 需要网络连接
   - 测试的是 CDN 地址，不是服务器地址
   - 仅用于诊断，不会保存文件

---

## 🗑️ 已删除的脚本

以下脚本已删除（不再需要）：

- `check-server-main.ps1` - 检查服务器文件（已过时）
- `deploy-pag-backend.ps1` - 部署 PAG 后端（已过时）
- `restart-backend-*.ps1` - 重启后端脚本（重复，已过时）
- `setup-pag-*.ps1` / `setup-pag-*.sh` - PAG 部署脚本（已过时，现使用 CDN）
- `upload-pag-*.ps1` - PAG 上传脚本（已过时，现使用 CDN）
- `test-pag-server.ps1` - 测试 PAG 服务器（已过时）

**原因**：

- PAG 文件现在使用 CDN 镜像（https://ghproxy.com），不需要部署到服务器
- 后端重启脚本重复且已过时
- 配置脚本已整合到更简单的工具中

---

## 📚 相关文档

- [PAG 真机测试指南](../docs/PAG真机测试指南.md)
- [PAG 动效调试指南](../docs/PAG动效调试指南.md)

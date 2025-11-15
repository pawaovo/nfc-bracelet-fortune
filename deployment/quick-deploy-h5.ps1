# ========================================
# H5 快速部署脚本
# 用于修复生产环境 API 配置问题
# ========================================

$ErrorActionPreference = "Stop"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "H5 快速部署脚本" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# ========================================
# 步骤1: 检查构建产物
# ========================================
Write-Host "步骤 1/4: 检查构建产物" -ForegroundColor Yellow
Write-Host ""

$h5Path = "apps\wx-app\dist\build\h5"
if (-not (Test-Path "$h5Path\index.html")) {
    Write-Host "❌ H5构建产物不存在，请先运行: cd apps\wx-app && pnpm build:h5" -ForegroundColor Red
    exit 1
}

Write-Host "✅ H5构建产物存在" -ForegroundColor Green
Write-Host ""

# ========================================
# 步骤2: 压缩H5文件
# ========================================
Write-Host "步骤 2/4: 压缩H5文件" -ForegroundColor Yellow
Write-Host ""

$zipFile = "h5-latest.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

Write-Host "📦 正在压缩..." -ForegroundColor Cyan
Compress-Archive -Path "$h5Path\*" -DestinationPath $zipFile -Force

$zipSize = (Get-Item $zipFile).Length / 1MB
Write-Host "✅ 压缩完成: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Green
Write-Host ""

# ========================================
# 步骤3: 上传到服务器
# ========================================
Write-Host "步骤 3/4: 上传到服务器" -ForegroundColor Yellow
Write-Host ""

Write-Host "📤 正在上传..." -ForegroundColor Cyan
scp -P 43122 $zipFile xiaoyi-dev1@47.239.179.9:~/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 上传失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 上传完成" -ForegroundColor Green
Write-Host ""

# ========================================
# 步骤4: 在服务器上部署
# ========================================
Write-Host "步骤 4/4: 在服务器上部署" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 正在部署..." -ForegroundColor Cyan

$deployScript = @"
#!/bin/bash
set -e

echo 'Cleaning old files...'
rm -rf ~/h5-web
mkdir -p ~/h5-web

echo 'Extracting new files...'
cd ~/h5-web
unzip -o ~/h5-latest.zip

echo 'Setting permissions...'
chmod -R 755 ~/h5-web

echo 'Reloading Nginx...'
sudo systemctl reload nginx

echo 'Deployment complete!'
echo ''
echo 'URL: https://yunshi.autopia.chat'
"@

# 将脚本保存到临时文件
$tempScript = "temp-deploy.sh"
$deployScript | Out-File -FilePath $tempScript -Encoding UTF8

# 上传并执行脚本
scp -P 43122 $tempScript xiaoyi-dev1@47.239.179.9:~/
ssh -p 43122 xiaoyi-dev1@47.239.179.9 "bash ~/temp-deploy.sh && rm ~/temp-deploy.sh"

# 清理本地临时文件
Remove-Item $tempScript -Force

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📍 访问地址: https://yunshi.autopia.chat" -ForegroundColor Cyan
Write-Host "🧪 测试URL: https://yunshi.autopia.chat/#/?nfcId=LOCAL_TEST1000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 提示: 请清除浏览器缓存后再测试" -ForegroundColor Yellow
Write-Host ""


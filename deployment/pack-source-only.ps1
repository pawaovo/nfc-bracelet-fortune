# 仅打包源代码（不包含 node_modules）
# 用途：在本地Windows电脑上执行，打包源代码并上传到服务器

param(
    [string]$CpolarUrl = "https://5be590b8.cpolar.io"
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Blue
Write-Host "📦 源代码打包和上传" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

# 服务器信息
$SERVER = "47.239.179.9"
$PORT = "43122"
$USER = "xiaoyi-dev1"

# ========================================
# 步骤1: 检查环境
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 1/4: 检查环境" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "apps\wx-app")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 项目目录正确" -ForegroundColor Green
Write-Host ""

# ========================================
# 步骤2: 创建临时目录并复制源代码
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 2/4: 准备源代码" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$tempDir = "temp-source-code"

# 删除旧的临时目录
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

# 创建临时目录结构
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
New-Item -ItemType Directory -Path "$tempDir\apps\api" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempDir\packages\shared-types" -Force | Out-Null

Write-Host "📋 复制后端源代码..." -ForegroundColor Yellow

# 复制后端源代码（排除 node_modules 和 dist）
$apiExclude = @("node_modules", "dist", ".env.local.backup")
Get-ChildItem "apps\api" -Exclude $apiExclude | ForEach-Object {
    Copy-Item $_.FullName -Destination "$tempDir\apps\api\" -Recurse -Force
}

Write-Host "📋 复制 shared-types 源代码..." -ForegroundColor Yellow

# 复制 shared-types 源代码
$sharedExclude = @("node_modules", "dist")
Get-ChildItem "packages\shared-types" -Exclude $sharedExclude | ForEach-Object {
    Copy-Item $_.FullName -Destination "$tempDir\packages\shared-types\" -Recurse -Force
}

Write-Host "📋 复制根目录配置文件..." -ForegroundColor Yellow

# 复制根目录必要文件
Copy-Item "package.json" -Destination $tempDir -Force
Copy-Item "pnpm-workspace.yaml" -Destination $tempDir -Force -ErrorAction SilentlyContinue
Copy-Item "pnpm-lock.yaml" -Destination $tempDir -Force -ErrorAction SilentlyContinue
Copy-Item "tsconfig.base.json" -Destination $tempDir -Force -ErrorAction SilentlyContinue

Write-Host "✅ 源代码准备完成" -ForegroundColor Green
Write-Host ""

# ========================================
# 步骤3: 打包源代码
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 3/4: 打包源代码" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 删除旧的压缩包
if (Test-Path "source-code.zip") {
    Remove-Item "source-code.zip" -Force
}

Write-Host "📦 压缩源代码..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath "source-code.zip" -Force

# 清理临时目录
Remove-Item $tempDir -Recurse -Force

$sourceSize = (Get-Item "source-code.zip").Length / 1MB
Write-Host "✅ 打包完成: $([math]::Round($sourceSize, 2)) MB" -ForegroundColor Green
Write-Host ""

# ========================================
# 步骤4: 上传到服务器
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 4/4: 上传到服务器" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "📤 上传源代码..." -ForegroundColor Yellow
scp -P $PORT "source-code.zip" "${USER}@${SERVER}:~/"

Write-Host "📤 上传部署脚本..." -ForegroundColor Yellow
scp -P $PORT "deployment\deploy-source-only.sh" "${USER}@${SERVER}:~/"

Write-Host "✅ 上传完成" -ForegroundColor Green
Write-Host ""

# ========================================
# 完成
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🎉 源代码打包和上传完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

Write-Host "📝 下一步操作：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. SSH连接到服务器：" -ForegroundColor Cyan
Write-Host "   ssh ${USER}@${SERVER} -p ${PORT}" -ForegroundColor White
Write-Host ""
Write-Host "2. 执行部署脚本：" -ForegroundColor Cyan
Write-Host "   chmod +x ~/deploy-source-only.sh" -ForegroundColor White
Write-Host "   ~/deploy-source-only.sh" -ForegroundColor White
Write-Host ""

Write-Host "✨ 全部完成！" -ForegroundColor Green


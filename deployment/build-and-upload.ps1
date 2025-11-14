# H5网页版 - 本地构建和上传脚本
# 用途：在本地Windows电脑上执行，自动构建并上传到服务器

param(
    [string]$CpolarUrl = "https://5be590b8.cpolar.io"
)

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Blue
Write-Host "🚀 H5网页版 - 本地构建和上传" -ForegroundColor Blue
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
Write-Host "步骤 1/5: 检查环境" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 检查是否在项目根目录
if (-not (Test-Path "apps\wx-app")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    Write-Host "当前目录: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 项目目录正确" -ForegroundColor Green

# 检查Git分支
try {
    $branch = git branch --show-current
    Write-Host "📌 当前分支: $branch" -ForegroundColor Yellow
    
    if ($branch -ne "feature/h5-web") {
        Write-Host "⚠️  警告: 当前不在 feature/h5-web 分支" -ForegroundColor Yellow
        $continue = Read-Host "是否继续? (y/n)"
        if ($continue -ne "y") {
            exit 0
        }
    }
} catch {
    Write-Host "⚠️  无法检测Git分支" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# 步骤2: 更新API配置
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 2/5: 更新API配置" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 cpolar地址: $CpolarUrl" -ForegroundColor Yellow

$configFile = "apps\wx-app\src\api\config.ts"
$configContent = Get-Content $configFile -Raw

# 备份配置文件
Copy-Item $configFile "$configFile.backup" -Force
Write-Host "✅ 已备份配置文件" -ForegroundColor Green

# 更新TUNNEL_BASE_URL
$configContent = $configContent -replace "TUNNEL_BASE_URL: '[^']*'", "TUNNEL_BASE_URL: '$CpolarUrl'"
Set-Content $configFile $configContent -NoNewline

Write-Host "✅ API配置已更新" -ForegroundColor Green
Write-Host ""

# ========================================
# 步骤3: 构建H5和后端
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 3/5: 构建H5和后端" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 安装依赖
Write-Host "📥 安装依赖..." -ForegroundColor Yellow
pnpm install

# 构建H5
Write-Host "🔨 构建H5..." -ForegroundColor Yellow
Set-Location "apps\wx-app"
pnpm build:h5
Set-Location "..\..\"

if (-not (Test-Path "apps\wx-app\dist\build\h5\index.html")) {
    Write-Host "❌ H5构建失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ H5构建成功" -ForegroundColor Green
Write-Host ""

# ========================================
# 步骤4: 打包文件
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 4/5: 打包文件" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 删除旧的压缩包
if (Test-Path "backend-latest.zip") {
    Remove-Item "backend-latest.zip" -Force
}
if (Test-Path "h5-latest.zip") {
    Remove-Item "h5-latest.zip" -Force
}

# 打包后端（排除 node_modules 和 dist）
Write-Host "📦 打包后端代码..." -ForegroundColor Yellow
$backendFiles = Get-ChildItem "apps\api" -Exclude "node_modules","dist",".env.local.backup"
Compress-Archive -Path $backendFiles.FullName -DestinationPath "backend-latest.zip" -Force

# 打包H5
Write-Host "📦 打包H5前端..." -ForegroundColor Yellow
Compress-Archive -Path "apps\wx-app\dist\build\h5\*" -DestinationPath "h5-latest.zip" -Force

# 显示文件大小
$backendSize = (Get-Item "backend-latest.zip").Length / 1MB
$h5Size = (Get-Item "h5-latest.zip").Length / 1MB

Write-Host "✅ 打包完成" -ForegroundColor Green
Write-Host "  backend-latest.zip: $([math]::Round($backendSize, 2)) MB" -ForegroundColor Cyan
Write-Host "  h5-latest.zip: $([math]::Round($h5Size, 2)) MB" -ForegroundColor Cyan
Write-Host ""

# ========================================
# 步骤5: 上传到服务器
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "步骤 5/5: 上传到服务器" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "📤 上传后端代码..." -ForegroundColor Yellow
scp -P $PORT "backend-latest.zip" "${USER}@${SERVER}:~/"

Write-Host "📤 上传H5前端..." -ForegroundColor Yellow
scp -P $PORT "h5-latest.zip" "${USER}@${SERVER}:~/"

Write-Host "📤 上传部署脚本..." -ForegroundColor Yellow
scp -P $PORT "deployment\update-h5-server.sh" "${USER}@${SERVER}:~/"

Write-Host "✅ 上传完成" -ForegroundColor Green
Write-Host ""

# ========================================
# 完成
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🎉 本地构建和上传完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

Write-Host "📝 下一步操作：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. SSH连接到服务器：" -ForegroundColor Cyan
Write-Host "   ssh ${USER}@${SERVER} -p ${PORT}" -ForegroundColor White
Write-Host ""
Write-Host "2. 执行部署脚本：" -ForegroundColor Cyan
Write-Host "   chmod +x ~/update-h5-server.sh" -ForegroundColor White
Write-Host "   ~/update-h5-server.sh" -ForegroundColor White
Write-Host ""
Write-Host "3. 查看cpolar地址：" -ForegroundColor Cyan
Write-Host "   pm2 logs cpolar --lines 20" -ForegroundColor White
Write-Host ""

# 恢复配置文件
Write-Host "🔄 恢复配置文件..." -ForegroundColor Yellow
Move-Item "$configFile.backup" $configFile -Force
Write-Host "✅ 配置文件已恢复" -ForegroundColor Green
Write-Host ""

Write-Host "✨ 全部完成！" -ForegroundColor Green


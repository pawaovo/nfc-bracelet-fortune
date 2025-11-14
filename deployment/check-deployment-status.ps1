# ========================================
# H5部署前状态检查脚本
# ========================================

$ErrorActionPreference = "Continue"

# 颜色输出函数
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Title { param($msg) Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan; Write-Host "$msg" -ForegroundColor Cyan; Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan }

$SERVER = "47.239.179.9"
$PORT = "43122"
$USER = "xiaoyi-dev1"
$PASSWORD = "n6pCTKmpXDGVSjhfMzbX"

$checkResults = @{
    "本地环境" = @()
    "服务器连接" = @()
    "数据库状态" = @()
    "后端API" = @()
    "H5构建" = @()
}

Write-Title "📋 H5部署前状态检查"

# ========================================
# 1. 检查本地环境
# ========================================
Write-Title "1️⃣ 检查本地环境"

# 检查Git分支
try {
    $branch = git branch --show-current
    if ($branch -eq "feature/h5-web") {
        Write-Success "Git分支正确: $branch"
        $checkResults["本地环境"] += "✅ Git分支: $branch"
    } else {
        Write-Warning "当前分支: $branch (建议切换到 feature/h5-web)"
        $checkResults["本地环境"] += "⚠️ Git分支: $branch (建议: feature/h5-web)"
    }
} catch {
    Write-Error "无法检查Git分支"
    $checkResults["本地环境"] += "❌ Git分支检查失败"
}

# 检查Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js版本: $nodeVersion"
    $checkResults["本地环境"] += "✅ Node.js: $nodeVersion"
} catch {
    Write-Error "Node.js未安装"
    $checkResults["本地环境"] += "❌ Node.js未安装"
}

# 检查pnpm
try {
    $pnpmVersion = pnpm --version
    Write-Success "pnpm版本: $pnpmVersion"
    $checkResults["本地环境"] += "✅ pnpm: $pnpmVersion"
} catch {
    Write-Error "pnpm未安装"
    $checkResults["本地环境"] += "❌ pnpm未安装"
}

# 检查依赖是否安装
if (Test-Path "node_modules") {
    Write-Success "依赖已安装"
    $checkResults["本地环境"] += "✅ 依赖已安装"
} else {
    Write-Warning "依赖未安装，需要运行: pnpm install"
    $checkResults["本地环境"] += "⚠️ 依赖未安装"
}

# ========================================
# 2. 检查服务器连接
# ========================================
Write-Title "2️⃣ 检查服务器连接"

Write-Info "正在测试SSH连接到 ${USER}@${SERVER}:${PORT} ..."

# 创建临时SSH测试脚本
$sshTestScript = @"
echo '===SERVER_INFO==='
hostname
uname -a
echo '===END_SERVER_INFO==='
"@

try {
    # 使用plink测试SSH连接（如果有）
    $sshTest = echo y | plink -ssh -P $PORT -pw $PASSWORD "${USER}@${SERVER}" "echo 'SSH_OK'" 2>&1
    if ($sshTest -match "SSH_OK") {
        Write-Success "SSH连接成功"
        $checkResults["服务器连接"] += "✅ SSH连接正常"
    } else {
        Write-Warning "SSH连接测试失败，请手动验证"
        $checkResults["服务器连接"] += "⚠️ SSH连接需要手动验证"
    }
} catch {
    Write-Warning "无法自动测试SSH（可能需要安装PuTTY/plink），请手动验证"
    $checkResults["服务器连接"] += "⚠️ SSH连接需要手动验证"
}

# ========================================
# 3. 检查本地API配置
# ========================================
Write-Title "3️⃣ 检查本地API配置"

$apiConfigPath = "apps\wx-app\src\api\config.ts"
if (Test-Path $apiConfigPath) {
    $apiConfig = Get-Content $apiConfigPath -Raw

    # 检查生产环境API地址
    if ($apiConfig -match 'PROD_BASE_URL:\s*[''"]([^''"]+)[''"]') {
        $prodUrl = $matches[1]
        if ($prodUrl -eq "https://your-api-domain.com") {
            Write-Warning "生产环境API地址未配置: $prodUrl"
            Write-Info "建议修改为: http://47.239.179.9:43122 或 https://xiaoweigezzz.xyz"
            $checkResults["H5构建"] += "⚠️ PROD_BASE_URL需要配置"
        } else {
            Write-Success "生产环境API地址: $prodUrl"
            $checkResults["H5构建"] += "✅ PROD_BASE_URL: $prodUrl"
        }
    }

    # 检查TUNNEL地址
    if ($apiConfig -match 'TUNNEL_BASE_URL:\s*[''"]([^''"]+)[''"]') {
        $tunnelUrl = $matches[1]
        Write-Info "内网穿透地址: $tunnelUrl"
        $checkResults["H5构建"] += "ℹ️ TUNNEL_BASE_URL: $tunnelUrl"
    }
} else {
    Write-Error "找不到API配置文件: $apiConfigPath"
    $checkResults["H5构建"] += "❌ API配置文件不存在"
}

# ========================================
# 4. 检查H5构建产物
# ========================================
Write-Title "4️⃣ 检查H5构建产物"

$h5BuildPath = "apps\wx-app\dist\build\h5"
if (Test-Path $h5BuildPath) {
    if (Test-Path "$h5BuildPath\index.html") {
        $buildTime = (Get-Item "$h5BuildPath\index.html").LastWriteTime
        Write-Success "H5已构建 (构建时间: $buildTime)"
        $checkResults["H5构建"] += "✅ H5构建产物存在 ($buildTime)"
        
        # 检查构建产物大小
        $h5Size = (Get-ChildItem -Path $h5BuildPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Info "构建产物大小: $([math]::Round($h5Size, 2)) MB"
        $checkResults["H5构建"] += "ℹ️ 构建产物大小: $([math]::Round($h5Size, 2)) MB"
    } else {
        Write-Warning "H5构建目录存在但缺少index.html"
        $checkResults["H5构建"] += "⚠️ H5构建不完整"
    }
} else {
    Write-Warning "H5未构建，需要运行: cd apps\wx-app && pnpm build:h5"
    $checkResults["H5构建"] += "⚠️ H5未构建"
}

# ========================================
# 5. 生成检查报告
# ========================================
Write-Title "📊 检查报告汇总"

foreach ($category in $checkResults.Keys) {
    Write-Host "`n【$category】" -ForegroundColor Yellow
    foreach ($item in $checkResults[$category]) {
        Write-Host "  $item"
    }
}

# ========================================
# 6. 生成待办事项
# ========================================
Write-Title "📝 待办事项"

$todos = @()

# 检查是否需要配置API
if ($checkResults["H5构建"] -match "PROD_BASE_URL需要配置") {
    $todos += "修改 apps\wx-app\src\api\config.ts 中的 PROD_BASE_URL"
}

# 检查是否需要构建H5
if ($checkResults["H5构建"] -match "H5未构建") {
    $todos += "运行: cd apps\wx-app && pnpm build:h5"
}

# 检查是否需要安装依赖
if ($checkResults["本地环境"] -match "依赖未安装") {
    $todos += "运行: pnpm install"
}

if ($todos.Count -eq 0) {
    Write-Success "`n✨ 所有本地准备工作已完成！"
    Write-Info "`n下一步: 需要检查服务器端状态（数据库、后端API）"
    Write-Info "请运行服务器检查脚本或手动SSH连接到服务器检查"
} else {
    Write-Warning "`n还有 $($todos.Count) 项待办事项:"
    for ($i = 0; $i -lt $todos.Count; $i++) {
        Write-Host "  $($i + 1). $($todos[$i])" -ForegroundColor Yellow
    }
}

Write-Host "`n"


@echo off
chcp 65001 >nul
echo ========================================
echo   NFC 手链运势小程序 - cpolar 测试环境
echo ========================================
echo.

REM 检查是否安装了必要的工具
echo [检查] 检查必要工具...
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Docker，请先安装 Docker Desktop
    echo 下载地址: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

where cpolar >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 cpolar，请先安装 cpolar
    echo 下载地址: https://www.cpolar.com/
    pause
    exit /b 1
)

echo [成功] 所有必要工具已安装
echo.

REM 启动数据库
echo ========================================
echo [1/3] 启动数据库...
echo ========================================
docker-compose up -d
if %errorlevel% neq 0 (
    echo [错误] 数据库启动失败
    pause
    exit /b 1
)
echo [成功] 数据库已启动
timeout /t 3 >nul
echo.

REM 启动后端服务
echo ========================================
echo [2/3] 启动后端服务...
echo ========================================
echo [提示] 后端服务将在新窗口中启动
start "NFC手链运势 - 后端服务" cmd /k "cd /d %~dp0apps\api && echo [启动] 正在启动后端服务... && pnpm start:dev"
timeout /t 5 >nul
echo [成功] 后端服务已启动
echo.

REM 启动 cpolar 内网穿透
echo ========================================
echo [3/3] 启动 cpolar 内网穿透...
echo ========================================
echo [提示] cpolar 将在新窗口中启动
echo [重要] 请从 cpolar 窗口复制 HTTPS 地址！
echo.
start "NFC手链运势 - cpolar 内网穿透" cmd /k "echo [启动] 正在启动 cpolar... && echo. && cpolar http 3000"
timeout /t 3 >nul
echo.

REM 显示下一步操作
echo ========================================
echo   所有服务已启动！
echo ========================================
echo.
echo [下一步操作]
echo.
echo 1. 从 cpolar 窗口复制 HTTPS 地址
echo    例如: https://abc123.cpolar.cn
echo.
echo 2. 修改小程序配置文件:
echo    文件: apps\wx-app\src\api\config.ts
echo    第10行: PROD_BASE_URL: 'https://abc123.cpolar.cn'
echo.
echo 3. 关闭开发模式:
echo    文件: apps\wx-app\src\config\dev-scenarios.ts
echo    第112行: enabled: false
echo.
echo 4. 编译小程序:
echo    cd apps\wx-app
echo    pnpm build:mp-weixin
echo.
echo 5. 用微信开发者工具打开:
echo    目录: apps\wx-app\dist\build\mp-weixin
echo.
echo 6. 上传并设为体验版
echo.
echo ========================================
echo   详细教程请查看: docs\cpolar-testing-guide.md
echo ========================================
echo.
pause


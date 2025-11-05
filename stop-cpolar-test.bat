@echo off
chcp 65001 >nul
echo ========================================
echo   停止 cpolar 测试环境
echo ========================================
echo.

echo [1/2] 停止数据库...
docker-compose down
if %errorlevel% equ 0 (
    echo [成功] 数据库已停止
) else (
    echo [警告] 数据库停止失败或未运行
)
echo.

echo [2/2] 停止其他服务...
echo [提示] 请手动关闭以下窗口:
echo   - NFC手链运势 - 后端服务
echo   - NFC手链运势 - cpolar 内网穿透
echo.

echo ========================================
echo   所有服务已停止！
echo ========================================
echo.
pause


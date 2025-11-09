@echo off
chcp 65001 >nul
echo =========================================
echo 🚀 上传部署文件到服务器
echo =========================================
echo.

REM 设置服务器信息
set SERVER_HOST=47.239.179.9
set SERVER_PORT=43122
set SERVER_USER=xiaoyi-dev1
set SERVER_PASS=n6pCTKmpXDGVSjhfMzbX

echo 📝 服务器信息：
echo    地址：%SERVER_HOST%
echo    端口：%SERVER_PORT%
echo    用户：%SERVER_USER%
echo.

echo 1️⃣ 上传部署脚本...
echo.

REM 上传deployment目录
scp -P %SERVER_PORT% -r deployment %SERVER_USER%@%SERVER_HOST%:~/

if %ERRORLEVEL% EQU 0 (
    echo ✅ 部署脚本上传成功
) else (
    echo ❌ 部署脚本上传失败
    pause
    exit /b 1
)

echo.
echo =========================================
echo 🎉 上传完成！
echo =========================================
echo.
echo 📝 下一步：
echo 1. 连接到服务器：
echo    ssh %SERVER_USER%@%SERVER_HOST% -p %SERVER_PORT%
echo.
echo 2. 运行部署脚本：
echo    cd ~/deployment
echo    chmod +x *.sh
echo    ./deploy-all.sh
echo.
pause


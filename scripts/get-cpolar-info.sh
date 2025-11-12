#!/bin/bash
# 获取 cpolar 隧道信息
# 用途：快速查看当前 cpolar 地址，用于配置小程序

echo "========================================="
echo "📡 获取 cpolar 隧道信息"
echo "========================================="
echo ""

# 检查 cpolar 是否运行
if ! curl -s http://127.0.0.1:4040/api/tunnels > /dev/null 2>&1; then
    echo "❌ cpolar 未运行或 API 不可访问"
    echo ""
    echo "请先启动 cpolar："
    echo "  方法1: cpolar http 3000"
    echo "  方法2: sudo systemctl start cpolar"
    echo ""
    exit 1
fi

# 获取隧道信息
echo "正在获取隧道信息..."
TUNNELS=$(curl -s http://127.0.0.1:4040/api/tunnels)

if [ -z "$TUNNELS" ]; then
    echo "❌ 无法获取隧道信息"
    exit 1
fi

# 解析地址（只需要一个隧道）
API_URL=$(echo "$TUNNELS" | grep -o '"public_url":"https://[^"]*"' | grep -o 'https://[^"]*' | head -n 1)

if [ -z "$API_URL" ]; then
    echo "❌ 未检测到 HTTPS 隧道"
    echo ""
    echo "请确保 cpolar 配置了 HTTPS 隧道："
    echo "  cpolar http 3000"
    echo ""
    exit 1
fi

echo "✅ 检测到 cpolar 隧道"
echo "  API 地址: $API_URL"

echo ""
echo "========================================="
echo "📝 配置信息"
echo "========================================="
echo ""
echo "当前 cpolar 地址: $API_URL"
echo ""
echo "📋 下一步操作："
echo ""
echo "1️⃣  更新小程序 API 配置："
echo "   文件: apps/wx-app/src/api/config.ts"
echo "   修改: TUNNEL_BASE_URL: '$API_URL'"
echo ""
echo "   或使用快速更新脚本："
echo "   node scripts/update-cpolar-url.js $API_URL"
echo ""
echo "2️⃣  配置微信公众平台域名："
echo "   登录: https://mp.weixin.qq.com"
echo "   开发 → 开发管理 → 开发设置 → 服务器域名"
echo ""
echo "   request 合法域名:"
echo "     - $API_URL"
echo "     - https://ark.cn-beijing.volces.com"
echo ""
echo "   downloadFile 合法域名:"
echo "     - https://ghproxy.com"
echo ""
echo "3️⃣  重新编译小程序："
echo "   cd apps/wx-app"
echo "   pnpm build:mp-weixin"
echo ""
echo "4️⃣  上传体验版测试"
echo ""
echo "🎉 完成！"


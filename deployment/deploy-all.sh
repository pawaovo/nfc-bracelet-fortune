#!/bin/bash

# 一键部署脚本
# 用途：自动完成所有部署步骤

echo "========================================="
echo "🚀 手链运势小程序 - 一键部署脚本"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 脚本目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo -e "${BLUE}📋 部署清单：${NC}"
echo "1. 检查服务器环境"
echo "2. 安装必要依赖"
echo "3. 配置环境变量"
echo "4. 部署后端API"
echo "5. 安装配置 cpolar"
echo "6. 测试服务"
echo ""

read -p "是否继续？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "部署已取消"
    exit 0
fi
echo ""

# ========================================
# 步骤1：检查环境
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 1/6: 检查服务器环境${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

bash "$SCRIPT_DIR/check-server-env.sh"

read -p "环境检查完成，是否继续？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "部署已取消"
    exit 0
fi
echo ""

# ========================================
# 步骤2：安装依赖
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 2/6: 安装必要依赖${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查是否需要安装
NEED_INSTALL=false

if ! command -v node &> /dev/null; then
    NEED_INSTALL=true
fi

if ! command -v pnpm &> /dev/null; then
    NEED_INSTALL=true
fi

if ! command -v pm2 &> /dev/null; then
    NEED_INSTALL=true
fi

if [ "$NEED_INSTALL" = true ]; then
    bash "$SCRIPT_DIR/install-dependencies.sh"
else
    echo -e "${GREEN}✅ 所有依赖已安装，跳过此步骤${NC}"
fi
echo ""

# ========================================
# 步骤3：配置环境变量
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 3/6: 配置环境变量${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PROJECT_DIR="$HOME/bracelet-fortune"
API_DIR="$PROJECT_DIR/apps/api"
ENV_FILE="$API_DIR/.env"

if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  环境变量文件已存在${NC}"
    echo ""
    echo "当前配置："
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    grep -E "^(DATABASE_URL|JWT_SECRET|WECHAT_APP_ID|WECHAT_APP_SECRET|OPENAI_API_KEY)" "$ENV_FILE" | sed 's/=.*/=***/' || echo "无法读取配置"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    read -p "是否覆盖为生产环境配置？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✅ 保留现有配置${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  请确认以下配置是否正确：${NC}"
        echo "1. DATABASE_URL - 数据库连接（应该是生产数据库）"
        echo "2. JWT_SECRET - JWT密钥（应该是随机字符串）"
        echo "3. WECHAT_APP_SECRET - 小程序密钥"
        echo "4. OPENAI_API_KEY - AI服务密钥（可选）"
        echo "5. NODE_ENV - 应该是 production"
        echo ""
        read -p "按回车键继续..."
    else
        # 备份现有配置
        cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ 已备份现有配置${NC}"

        # 复制模板
        cp "$SCRIPT_DIR/.env.production.template" "$ENV_FILE"
        echo -e "${GREEN}✅ 环境变量模板已复制${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  请编辑环境变量文件：${NC}"
        echo "   nano $ENV_FILE"
        echo ""
        echo "必须修改的配置："
        echo "1. JWT_SECRET - 生成随机字符串"
        echo "   命令：node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
        echo "2. WECHAT_APP_SECRET - 填写小程序密钥"
        echo "3. OPENAI_API_KEY - 填写AI服务密钥（可选）"
        echo ""
        read -p "是否现在编辑？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            nano "$ENV_FILE"
        fi
    fi
else
    mkdir -p "$API_DIR"
    cp "$SCRIPT_DIR/.env.production.template" "$ENV_FILE"
    echo -e "${GREEN}✅ 环境变量模板已创建${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  请编辑环境变量文件：${NC}"
    echo "   nano $ENV_FILE"
    echo ""
    echo "必须修改的配置："
    echo "1. JWT_SECRET - 生成随机字符串"
    echo "   命令：node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    echo "2. WECHAT_APP_SECRET - 填写小程序密钥"
    echo "3. OPENAI_API_KEY - 填写AI服务密钥（可选）"
    echo ""
    read -p "是否现在编辑？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        nano "$ENV_FILE"
    fi
fi
echo ""

# ========================================
# 步骤4：部署后端
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 4/6: 部署后端API${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ 项目目录不存在: $PROJECT_DIR${NC}"
    echo ""
    echo "请先上传项目代码到服务器："
    echo "1. 使用 git clone"
    echo "2. 或使用 scp 上传"
    echo ""
    exit 1
fi

bash "$SCRIPT_DIR/deploy-backend.sh"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 后端部署失败${NC}"
    exit 1
fi
echo ""

# ========================================
# 步骤5：配置 cpolar
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 5/6: 安装配置 cpolar${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

bash "$SCRIPT_DIR/setup-cpolar.sh"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ cpolar 配置失败${NC}"
    exit 1
fi
echo ""

# ========================================
# 步骤6：测试服务
# ========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}步骤 6/6: 测试服务${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "1️⃣ 测试本地API..."
sleep 2
curl -s http://localhost:3000 > /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 本地API响应正常${NC}"
else
    echo -e "${RED}❌ 本地API无响应${NC}"
fi
echo ""

echo "2️⃣ 获取 cpolar 公网地址..."
CPOLAR_URL=$(cat ~/cpolar-url.txt 2>/dev/null)

if [ -z "$CPOLAR_URL" ]; then
    CPOLAR_URL=$(cpolar status 2>/dev/null | grep -oP 'https://[a-z0-9]+\.r\d+\.cpolar\.(top|cn)' | head -n 1)
fi

if [ ! -z "$CPOLAR_URL" ]; then
    echo -e "${GREEN}✅ cpolar 地址: $CPOLAR_URL${NC}"
    echo ""
    echo "3️⃣ 测试公网访问..."
    sleep 2
    curl -s "$CPOLAR_URL" > /dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 公网API响应正常${NC}"
    else
        echo -e "${YELLOW}⚠️  公网API无响应，可能需要等待几秒${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  无法获取 cpolar 地址${NC}"
    echo "请运行: cpolar status"
fi
echo ""

# ========================================
# 部署完成
# ========================================
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ ! -z "$CPOLAR_URL" ]; then
    echo -e "${BLUE}📝 重要信息：${NC}"
    echo ""
    echo -e "${YELLOW}你的 API 公网地址：${NC}"
    echo -e "${GREEN}$CPOLAR_URL${NC}"
    echo ""
    echo "请将此地址配置到小程序中："
    echo "文件: apps/wx-app/src/api/config.ts"
    echo "修改: TUNNEL_BASE_URL: '$CPOLAR_URL'"
    echo ""
fi

echo -e "${BLUE}📋 下一步操作：${NC}"
echo "1. 修改小程序配置（使用上面的 cpolar 地址）"
echo "2. 关闭开发模式"
echo "3. 编译小程序: cd apps/wx-app && pnpm build:mp-weixin"
echo "4. 在微信公众平台配置域名"
echo "5. 上传体验版测试"
echo ""

echo -e "${BLUE}📚 查看详细文档：${NC}"
echo "deployment/README.md"
echo ""


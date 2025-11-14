#!/bin/bash

# ========================================
# 服务器端状态检查脚本
# ========================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 输出函数
success() { echo -e "${GREEN}✅ $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
title() { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${CYAN}$1${NC}"; echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

title "📋 服务器端状态检查"

# ========================================
# 1. 检查基本信息
# ========================================
title "1️⃣ 服务器基本信息"

info "主机名: $(hostname)"
info "系统: $(uname -s) $(uname -r)"
info "当前用户: $(whoami)"
info "当前目录: $(pwd)"

# ========================================
# 2. 检查1Panel
# ========================================
title "2️⃣ 检查1Panel状态"

if command -v 1pctl &> /dev/null; then
    success "1Panel已安装"
    info "1Panel需要管理员权限检查，跳过详细检查"
    info "建议访问地址: http://47.239.179.9:8090 (常用端口)"
else
    warning "1Panel未安装或不在PATH中"
fi

# ========================================
# 3. 检查PostgreSQL数据库
# ========================================
title "3️⃣ 检查PostgreSQL数据库"

# 检查PostgreSQL容器
if docker ps | grep -q "1Panel-postgresql"; then
    CONTAINER_NAME=$(docker ps | grep "1Panel-postgresql" | awk '{print $NF}')
    success "PostgreSQL容器运行中: $CONTAINER_NAME"
    
    # 检查数据库连接
    DB_URL="postgresql://bracelet-fortune:HvXFmwEwfntnScWZRJyB@${CONTAINER_NAME}:5432/bracelet-fortune"
    
    # 尝试连接数据库
    if docker exec $CONTAINER_NAME psql -U bracelet-fortune -d bracelet-fortune -c "SELECT 1;" &> /dev/null; then
        success "数据库连接正常"
        
        # 检查users表结构
        info "检查users表结构..."
        HAS_USERNAME=$(docker exec $CONTAINER_NAME psql -U bracelet-fortune -d bracelet-fortune -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='username';" 2>/dev/null | xargs)
        HAS_PASSWORD=$(docker exec $CONTAINER_NAME psql -U bracelet-fortune -d bracelet-fortune -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='password';" 2>/dev/null | xargs)
        
        if [ "$HAS_USERNAME" = "username" ]; then
            success "users表包含username字段"
        else
            error "users表缺少username字段 - 需要执行数据库迁移"
        fi
        
        if [ "$HAS_PASSWORD" = "password" ]; then
            success "users表包含password字段"
        else
            error "users表缺少password字段 - 需要执行数据库迁移"
        fi
    else
        error "无法连接到数据库"
    fi
else
    error "PostgreSQL容器未运行"
fi

# ========================================
# 4. 检查后端API
# ========================================
title "4️⃣ 检查后端API状态"

# 检查项目目录
if [ -d "$HOME/bracelet-fortune/apps/api" ]; then
    success "后端项目目录存在"
    
    # 检查PM2进程
    if command -v pm2 &> /dev/null; then
        success "PM2已安装"
        
        # 检查后端进程
        if pm2 list | grep -q "bracelet-api"; then
            PM2_STATUS=$(pm2 list | grep "bracelet-api" | awk '{print $10}')
            if [ "$PM2_STATUS" = "online" ]; then
                success "后端API运行中 (状态: online)"
            else
                warning "后端API状态异常: $PM2_STATUS"
            fi
        else
            warning "未找到bracelet-api进程"
        fi
    else
        warning "PM2未安装"
    fi
    
    # 测试API响应
    info "测试API响应..."
    API_RESPONSE=$(curl -s http://localhost:3000/api/v1 2>/dev/null)
    if [ -n "$API_RESPONSE" ]; then
        success "API响应正常: $API_RESPONSE"
    else
        error "API无响应"
    fi
    
    # 检查.env文件
    if [ -f "$HOME/bracelet-fortune/apps/api/.env" ]; then
        success ".env配置文件存在"
        
        # 检查关键配置
        if grep -q "DATABASE_URL" "$HOME/bracelet-fortune/apps/api/.env"; then
            info "DATABASE_URL已配置"
        else
            warning "DATABASE_URL未配置"
        fi
    else
        error ".env配置文件不存在"
    fi
else
    error "后端项目目录不存在: $HOME/bracelet-fortune/apps/api"
fi

# ========================================
# 5. 检查H5部署目录
# ========================================
title "5️⃣ 检查H5部署目录"

H5_DIR="$HOME/h5-web"
if [ -d "$H5_DIR" ]; then
    if [ -f "$H5_DIR/index.html" ]; then
        success "H5部署目录存在且包含index.html"
        
        # 检查文件数量
        FILE_COUNT=$(find "$H5_DIR" -type f | wc -l)
        info "文件数量: $FILE_COUNT"
        
        # 检查目录大小
        DIR_SIZE=$(du -sh "$H5_DIR" | awk '{print $1}')
        info "目录大小: $DIR_SIZE"
        
        # 检查最后修改时间
        LAST_MODIFIED=$(stat -c %y "$H5_DIR/index.html" 2>/dev/null || stat -f "%Sm" "$H5_DIR/index.html" 2>/dev/null)
        info "最后更新: $LAST_MODIFIED"
    else
        warning "H5部署目录存在但缺少index.html"
    fi
else
    warning "H5部署目录不存在: $H5_DIR"
    info "建议创建目录: mkdir -p $H5_DIR"
fi

# ========================================
# 6. 生成检查报告
# ========================================
title "📊 检查报告汇总"

echo ""
echo "【待办事项】"

TODOS=()

# 检查数据库迁移
if [ "$HAS_USERNAME" != "username" ] || [ "$HAS_PASSWORD" != "password" ]; then
    TODOS+=("执行数据库迁移: cd ~/bracelet-fortune/apps/api && pnpm prisma migrate deploy")
fi

# 检查后端状态
if [ "$PM2_STATUS" != "online" ]; then
    TODOS+=("启动/重启后端API: pm2 restart bracelet-api")
fi

# 检查H5目录
if [ ! -d "$H5_DIR" ]; then
    TODOS+=("创建H5部署目录: mkdir -p $H5_DIR")
fi

if [ ${#TODOS[@]} -eq 0 ]; then
    success "✨ 所有服务器端准备工作已完成！"
    info "可以开始在1Panel中部署静态网站了"
else
    warning "还有 ${#TODOS[@]} 项待办事项:"
    for i in "${!TODOS[@]}"; do
        echo "  $((i+1)). ${TODOS[$i]}"
    done
fi

echo ""


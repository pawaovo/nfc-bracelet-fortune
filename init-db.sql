-- 初始化数据库脚本
-- 创建UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建pgcrypto扩展（用于数据加密）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

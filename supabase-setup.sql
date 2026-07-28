-- ============================================================
-- 代运营数字化平台 - Supabase 数据库初始化脚本
-- ============================================================
-- 使用方法：
-- 1. 登录 https://supabase.com 进入你的项目
-- 2. 点击左侧 "SQL Editor"
-- 3. 将本文件全部内容粘贴进去，点击 "Run" 执行
-- ============================================================

-- ====== 1. 创建数据表 ======
-- 使用 key-value 结构存储所有应用数据
-- 每个 localStorage 的 key 对应一行记录
CREATE TABLE IF NOT EXISTS app_data (
    key         TEXT PRIMARY KEY,
    value       TEXT,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_app_data_updated ON app_data;
CREATE TRIGGER trg_app_data_updated
    BEFORE UPDATE ON app_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ====== 2. 行级安全策略 (RLS) ======
-- 启用 RLS
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- 允许所有用户读取（anon key 需要）
DROP POLICY IF EXISTS "允许读取" ON app_data;
CREATE POLICY "允许读取" ON app_data
    FOR SELECT USING (true);

-- 允许所有用户插入
DROP POLICY IF EXISTS "允许插入" ON app_data;
CREATE POLICY "允许插入" ON app_data
    FOR INSERT WITH CHECK (true);

-- 允许所有用户更新
DROP POLICY IF EXISTS "允许更新" ON app_data;
CREATE POLICY "允许更新" ON app_data
    FOR UPDATE USING (true);

-- 允许所有用户删除
DROP POLICY IF EXISTS "允许删除" ON app_data;
CREATE POLICY "允许删除" ON app_data
    FOR DELETE USING (true);

-- ====== 3. 创建索引（提升查询性能） ======
CREATE INDEX IF NOT EXISTS idx_app_data_updated_at ON app_data(updated_at DESC);

-- ====== 完成 ======
-- 执行完毕后，回到代码中填写 js/supabase-config.js 的配置信息即可

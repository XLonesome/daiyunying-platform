/* ============================================================
   Supabase 配置文件
   ============================================================

   使用步骤：
   1. 访问 https://supabase.com 注册并创建新项目
   2. 在项目设置 → Settings → API 中找到：
      - Project URL（项目地址）
      - anon public key（公钥）
   3. 将下方两个变量替换为你自己的值
   4. 在 Supabase 的 SQL Editor 中执行 supabase-setup.sql
   ============================================================ */

const SUPABASE_URL = 'https://hlneyegdsecutlwhnwen.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsbmV5ZWdkc2VjdXRsd2hud2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4Mzg3MjUsImV4cCI6MjEwMDQxNDcyNX0.G11R_ypNrY8MBWXGGvPTCIyer54GIIceGJ6pOCvE37U';

/* 检查是否已配置 */
const SUPABASE_CONFIGURED =
    SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
    SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY' &&
    SUPABASE_URL.startsWith('https://');

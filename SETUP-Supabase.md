Supabase 云端数据同步 - 配置指南
======================================

本指南将帮助你把代运营数字化平台的数据从浏览器本地存储迁移到 Supabase 云数据库，
实现多设备、多用户数据共享。


一、创建 Supabase 项目
-----------------------

1. 访问 https://supabase.com ，用 GitHub 账号注册登录
2. 点击 "New Project" 创建新项目
   - Name: 随意填，如 daiyunying-platform
   - Database Password: 设一个强密码，记好
   - Region: 选择离你最近的区域（如 Southeast Asia (Singapore)）
3. 等待项目创建完成（约 1-2 分钟）


二、创建数据库表
-----------------

1. 进入项目后，点击左侧 "SQL Editor"
2. 点击 "New query"
3. 打开项目中的 supabase-setup.sql 文件
4. 将全部内容复制粘贴到 SQL Editor 中
5. 点击 "Run" 执行
6. 看到绿色 "Success" 提示即表示建表成功


三、获取 API 密钥
------------------

1. 点击左侧 "Settings"（齿轮图标）→ "API"
2. 找到以下两项：
   - Project URL  （形如 https://xxxxxxxxxxxx.supabase.co）
   - Project API Keys → anon public  （一长串字符）
3. 复制这两个值


四、填写配置文件
-----------------

1. 打开 js/supabase-config.js
2. 将 SUPABASE_URL 替换为你的 Project URL
3. 将 SUPABASE_ANON_KEY 替换为你的 anon public key

   示例：
   const SUPABASE_URL = 'https://abcd1234.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6...';


五、部署验证
-------------

1. 部署整个项目到任意静态托管服务
2. 打开登录页面，用 admin / admin123 登录
3. 添加一个测试员工
4. 换一个浏览器（或无痕模式）打开同一网址
5. 如果能看到刚添加的员工，说明云端同步生效了


六、工作原理
-------------

- 页面加载时：先从 Supabase 拉取所有数据写入 localStorage，再初始化应用
- 数据变更时：每次 localStorage.setItem 自动同步到 Supabase
- 登录会话（platform_session）不同步，每个设备独立登录
- 首次使用时：自动将现有 localStorage 数据上传到云端
- 未配置 Supabase 时：自动降级为纯本地存储，不影响使用


七、常见问题
-------------

Q: 数据加载变慢了？
A: 首次加载需要从云端拉取数据，之后浏览器会缓存。正常情况下延迟在 200-500ms。

Q: 多人同时编辑会冲突吗？
A: 采用"最后写入胜出"策略。小团队同时使用问题不大，但不建议两人同时编辑同一条数据。

Q: 数据安全吗？
A: 当前配置允许匿名读写（方便部署）。如需更安全，可在 Supabase 中启用 Auth 认证，
   并修改 RLS 策略限制只有登录用户才能操作数据。

Q: 免费额度够用吗？
A: Supabase 免费版包含 500MB 数据库、5GB 带宽，对小型团队完全够用。

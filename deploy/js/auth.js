/* ============================================================
   代运营数字化平台 - 认证模块 (Auth Module)
   职责：登录验证、会话管理、权限控制、员工数据管理
   ============================================================ */

/* ====== 认证模拟数据（实际部署替换为后端API） ====== */

// 员工可被授权的功能模块列表
const EMPLOYEE_FEATURES = [
    { id: 'dashboard', name: '数据仪表板' },
    { id: 'tencent-docs', name: '文案库' },
    { id: 'my-requests', name: '我的申请' },
    { id: 'video-downloader', name: '视频解析下载' },
    { id: 'copy-downloader', name: '文案解析下载' },
    { id: 'auto-browser', name: '自动化浏览器' },
    { id: 'salary', name: '工资明细' },
    { id: 'short-video-alert', name: '短视频预警' },
    { id: 'apps', name: '常用应用' },
    { id: 'folder-manager', name: '子账号文件夹管理' },
    { id: 'leave', name: '请假申请' },
    { id: 'meal', name: '每日报餐' },
];

const MOCK_AUTH_DATA = {
    admin: {
        account: 'admin',
        password: 'admin123',
        name: '管理员',
    },
    employees: [],  // 默认无员工，由管理员手动添加；数据持久化到 yuangongguanli/
};

// 从 localStorage 加载持久化的管理员账号密码
(function loadPersistedAdmin() {
    try {
        const adminData = localStorage.getItem('platform_admin');
        if (adminData) {
            const parsed = JSON.parse(adminData);
            if (parsed.account) MOCK_AUTH_DATA.admin.account = parsed.account;
            if (parsed.password) MOCK_AUTH_DATA.admin.password = parsed.password;
        }
    } catch (e) { /* 使用默认 */ }
})();

// 从 localStorage 加载持久化的员工数据
// login.html 不加载 app.js（DataStore），所以必须在 auth.js 中独立加载
(function loadPersistedEmployees() {
    try {
        const empData = localStorage.getItem('yuangongguanli/_index');
        if (empData) {
            MOCK_AUTH_DATA.employees = JSON.parse(empData);
        }
    } catch (e) { /* 使用默认空数组 */ }
})();

/* ====== Auth 认证模块 ====== */
const Auth = {
    session: null,

    /* 初始化：在主页加载时检查会话 */
    init() {
        const stored = localStorage.getItem('platform_session');
        if (!stored) {
            // 未登录 → 跳转登录页（仅在主页执行）
            const path = window.location.pathname;
            if (path.endsWith('index.html') || path.endsWith('/') || path === '') {
                window.location.href = 'login.html';
            }
            return false;
        }
        try {
            this.session = JSON.parse(stored);
        } catch (e) {
            localStorage.removeItem('platform_session');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    /* 获取当前登录用户 */
    getCurrentUser() {
        if (!this.session) {
            const stored = localStorage.getItem('platform_session');
            if (stored) {
                try { this.session = JSON.parse(stored); } catch (e) { return null; }
            }
        }
        return this.session;
    },

    /* 是否管理员 */
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    /* 是否有剪辑工作表访问权限：管理员，或岗位含剪辑/运营 */
    canAccessClipWorksheet() {
        const user = this.getCurrentUser();
        if (!user) return false;
        if (user.role === 'admin') return true;
        const positions = user.positions || [];
        return positions.includes('剪辑') || positions.includes('运营');
    },

    /* 重新从 localStorage 加载员工/管理员数据（云端同步完成后刷新内存） */
    reloadPersistedData() {
        try {
            const empData = localStorage.getItem('yuangongguanli/_index');
            if (empData) {
                MOCK_AUTH_DATA.employees = JSON.parse(empData);
            }
        } catch (e) { console.error('[Auth] 加载员工数据失败:', e); }
        try {
            const adminData = localStorage.getItem('platform_admin');
            if (adminData) {
                const parsed = JSON.parse(adminData);
                if (parsed.account) MOCK_AUTH_DATA.admin.account = parsed.account;
                if (parsed.password) MOCK_AUTH_DATA.admin.password = parsed.password;
            }
        } catch (e) { console.error('[Auth] 加载管理员数据失败:', e); }
    },

    /* 登录验证 */
    login(account, password, type) {
        if (type === 'admin') {
            const admin = MOCK_AUTH_DATA.admin;
            if (account === admin.account && password === admin.password) {
                const session = {
                    account: admin.account,
                    name: admin.name,
                    position: '超级管理员',
                    role: 'admin',
                    loginTime: Date.now(),
                };
                localStorage.setItem('platform_session', JSON.stringify(session));
                this.session = session;
                return { success: true, user: session };
            }
            return { success: false, message: '管理员账号或密码错误' };
        }

        // 员工登录
        const emp = MOCK_AUTH_DATA.employees.find(
            e => e.account === account && e.password === password
        );
        if (emp) {
            if (emp.status !== 'active') {
                return { success: false, message: '该账号已被禁用，请联系管理员' };
            }
            const session = {
                id: emp.id,
                account: emp.account,
                name: emp.name,
                positions: emp.positions || [],
                position: (emp.positions && emp.positions.length) ? emp.positions.join('、') : (emp.role || ''),
                subAccounts: emp.subAccounts || [],
                features: emp.features || [],
                status: emp.status,
                role: 'employee',
                loginTime: Date.now(),
            };
            localStorage.setItem('platform_session', JSON.stringify(session));
            this.session = session;
            return { success: true, user: session };
        }
        return { success: false, message: '员工账号或密码错误' };
    },

    /* 退出登录 */
    logout() {
        localStorage.removeItem('platform_session');
        this.session = null;
        window.location.href = 'login.html';
    },

    /* 修改管理员账号密码（双重验证：旧密码 + 新密码 + 确认新密码） */
    changeAdminCredentials(oldPassword, newAccount, newPassword, confirmPassword) {
        const admin = MOCK_AUTH_DATA.admin;
        if (oldPassword !== admin.password) {
            return { success: false, message: '旧密码不正确' };
        }
        if (!newAccount || !newAccount.trim()) {
            return { success: false, message: '管理员账号不能为空' };
        }
        if (!newPassword) {
            return { success: false, message: '新密码不能为空' };
        }
        if (newPassword !== confirmPassword) {
            return { success: false, message: '两次输入的新密码不一致' };
        }
        if (newPassword === oldPassword) {
            return { success: false, message: '新密码不能与旧密码相同' };
        }

        admin.account = newAccount.trim();
        admin.password = newPassword;
        localStorage.setItem('platform_admin', JSON.stringify({
            account: admin.account,
            password: admin.password,
        }));

        // 同步更新当前会话
        const stored = localStorage.getItem('platform_session');
        if (stored) {
            try {
                const session = JSON.parse(stored);
                if (session.role === 'admin') {
                    session.account = admin.account;
                    localStorage.setItem('platform_session', JSON.stringify(session));
                    this.session = session;
                }
            } catch (e) { /* ignore */ }
        }

        return { success: true, message: '管理员账号密码已修改' };
    },

    /* 根据登录用户更新UI */
    updateUI() {
        const user = this.getCurrentUser();
        if (!user) return;

        // 更新侧边栏用户信息
        const avatar = document.getElementById('user-avatar');
        const nameTextEl = document.getElementById('user-name-text');
        const nameSepEl = document.getElementById('user-name-sep');
        const positionEl = document.getElementById('user-position');
        const roleEl = document.getElementById('user-role');

        if (avatar) avatar.textContent = user.name.charAt(0);
        if (nameTextEl) nameTextEl.textContent = user.name;
        if (roleEl) {
            roleEl.textContent = user.role === 'admin'
                ? '超级管理员'
                : (user.role || '员工');
        }

        // 岗位显示：管理员显示"超级管理员"，员工显示其岗位
        if (positionEl) {
            let position = '';
            if (user.role === 'admin') {
                position = '超级管理员';
            } else if (Array.isArray(user.positions) && user.positions.length) {
                position = user.positions.join('、');
            } else if (user.position && user.position.trim()) {
                position = user.position;
            } else {
                position = '未设置岗位';
            }
            positionEl.textContent = position;
        }
        if (nameSepEl) nameSepEl.textContent = '—';

        if (this.isAdmin()) {
            // 管理员：显示全部导航项
            document.querySelectorAll('.nav-item').forEach(item => {
                item.style.display = 'flex';
            });
            // 管理员工资导航显示"工资管理"
            const salaryNavText = document.querySelector('.nav-item[data-view="salary"] span');
            if (salaryNavText) salaryNavText.textContent = '工资管理';
        } else {
            // 员工：根据 features 权限过滤导航项
            const enabledFeatures = (user.features && user.features.length)
                ? user.features
                : EMPLOYEE_FEATURES.map(f => f.id);
            // 始终对员工可见的功能模块（不依赖 features 配置）
            const alwaysVisibleViews = ['dashboard', 'salary', 'apps', 'my-requests', 'folder-manager', 'short-video-alert', 'leave', 'meal'];
            // 剪辑工作表仅对剪辑/运营岗位开放
            if (this.canAccessClipWorksheet()) {
                alwaysVisibleViews.push('clip-worksheet');
            }
            document.querySelectorAll('.nav-item').forEach(item => {
                const view = item.dataset.view;
                if (item.classList.contains('nav-admin-only')) {
                    // 管理员专属功能，员工一律不可见
                    item.style.display = 'none';
                } else if (alwaysVisibleViews.includes(view) || enabledFeatures.includes(view)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });

            // 员工端工资导航显示"工资明细"
            const salaryNavText = document.querySelector('.nav-item[data-view="salary"] span');
            if (salaryNavText) salaryNavText.textContent = '工资明细';

            // 如果当前视图不在允许列表中，自动切到首个可用视图
            if (state && state.currentView &&
                !enabledFeatures.includes(state.currentView) &&
                !alwaysVisibleViews.includes(state.currentView)) {
                const firstEnabled = enabledFeatures[0] || alwaysVisibleViews[0] || 'dashboard';
                if (typeof Navigation !== 'undefined') {
                    Navigation.switchView(firstEnabled);
                }
            }

            // 切换管理员/员工视图内容（短视频预警双视图）
            if (typeof ShortVideoAlert !== 'undefined') {
                ShortVideoAlert.render();
            }
        }
    },

    /* 获取员工已启用的功能列表 */
    getEnabledFeatures() {
        const user = this.getCurrentUser();
        if (!user) return [];
        if (user.role === 'admin') return EMPLOYEE_FEATURES.map(f => f.id);
        return (user.features && user.features.length)
            ? user.features
            : EMPLOYEE_FEATURES.map(f => f.id);
    },

    /* 获取当前用户可访问的子账号ID列表 */
    getAccessibleSubAccounts() {
        const user = this.getCurrentUser();
        if (!user) return [];
        if (user.role === 'admin') return MOCK_DATA.subAccounts.map(a => a.id);
        return user.subAccounts || [];
    },
};

/* ====== 页面加载时自动检查会话 ====== */
document.addEventListener('DOMContentLoaded', async () => {
    // 等待 Supabase 云端同步完成
    if (typeof SupabaseSync !== 'undefined') {
        await SupabaseSync.ready();
    }

    // 只在主页（index.html）执行会话检查和UI更新
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path.endsWith('/') || path === '') {
        if (!Auth.init()) return;
        // 延迟更新UI，等待DOM完全加载
        setTimeout(() => Auth.updateUI(), 50);
    }
});

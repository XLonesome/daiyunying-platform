/* ============================================================
   代运营数字化平台 - 核心逻辑
   架构：模块化组织，每个功能模块独立管理
   ============================================================ */

/* ====== 全局配置 ====== */
const CONFIG = {
    chartColors: {
        primary: '#6366f1',
        blue: '#3b82f6',
        green: '#10b981',
        orange: '#f59e0b',
        purple: '#8b5cf6',
        pink: '#ec4899',
        cyan: '#06b6d4',
    },
    chartTextColor: '#64748b',
    chartGridColor: 'rgba(226, 232, 240, 0.6)',
};

/* ====== 模拟数据 ====== */
const MOCK_DATA = {
    // 一级分类 → 二级分类 → 子账号（默认为空，管理员手动添加；持久化到 zizhanghao/）
    subAccountCategories: {
        level1: [],
        level2: {},
    },
    subAccounts: [],
    // 运营成本自定义项（默认为空，管理员自行添加）
    operatingCostItems: [],
    operatingCost: {
        monthlyBudget: 50000,
    },
    monthlyTrend: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
        copy: [85, 92, 78, 110, 95, 130, 120],
        video: [60, 70, 55, 80, 72, 95, 85],
    },
    platformData: [
        { name: '小红书', value: 320, color: '#ff2442' },
        { name: '抖音', value: 280, color: '#000000' },
        { name: '哔哩哔哩', value: 190, color: '#00a1d6' },
        { name: '微信公众号', value: 110, color: '#07c160' },
    ],
    videoHistory: [
        { platform: '小红书', title: '夏日防晒霜推荐TOP5', time: '2026-07-22 14:30', status: 'completed' },
        { platform: '抖音', title: '2026新款手机开箱测评', time: '2026-07-21 19:15', status: 'completed' },
        { platform: '哔哩哔哩', title: '探店城市美食合集', time: '2026-07-20 11:00', status: 'completed' },
    ],
    salaryData: [],
    // 工资字段配置（管理员可自定义每个绩效项的名称）
    salaryFieldConfig: [
        { key: 'base', name: '基本工资', type: 'income' },
        { key: 'bonus', name: '绩效奖金', type: 'income' },
        { key: 'overtime', name: '加班补贴', type: 'income' },
        { key: 'social', name: '社保扣款', type: 'deduction' },
        { key: 'other', name: '其他扣款', type: 'deduction' },
    ],
    // 工资历史快照（每月自动保存）
    salaryHistory: [],
    // 预警阈值配置（管理员可自定义，最大30）
    alertThresholds: {},
    // 常用应用数据（管理员可增删改查，分配给员工）
    apps: [],
    // 短视频预警数据（员工手动填写，每日每子账号一条记录）
    shortVideoAlerts: [],
    // 子账号文件夹管理中的视频数量缓存（从云端同步）
    folderVideoCounts: {},
    // 文案库数据（员工添加，管理员可查看全部）
    copyLibrary: [],
    // 剪辑工作表（员工每日自填剪辑产量）
    editingWorksheet: [],
    // 剪辑工作表配置：时长区间（每个区间有名称与基数）+ 每日工作量，由管理员工资管理下的"剪辑员工工资管理"设置
    clipWorkSettings: {
        // durations: 每个时间段一条，baseValue 用于计算今日剪辑数（数量 × 基数）
        durations: [
            { label: '<15s', baseValue: 0.25 },
            { label: '15-30s', baseValue: 0.5 },
            { label: '30-45s', baseValue: 0.75 },
            { label: '45-60s', baseValue: 1 },
            { label: '1-2min', baseValue: 1.5 },
            { label: '2-3min', baseValue: 2.5 },
            { label: '3-4min', baseValue: 3.5 },
            { label: '4-5min', baseValue: 4.5 },
            { label: '>5min', baseValue: 6 },
        ],
        // 每日工作量：显示在员工剪辑工作表，用于参考目标
        dailyWorkload: 20,
    },
    // 年度工作日历：用户新增的法定节假日 / 调休上班日 / 删除的内置节假日
    workCalendar: { holidays: [], workdays: [], removedHolidays: [] },
    // 子账号绩效基数配置：询盘绩效（留资数）+ 爆款绩效（播放量阈值）
    subAccountSalaryConfig: {
        // 询盘绩效：按子账号设置 { max: 最大值, min: 最小值, amount: 金额 }
        inquiry: {},
        // 爆款绩效：按播放量阈值设置 { name, views, amount }
        viral: [
            { name: '7万爆款', views: 70000, amount: 10 },
            { name: '10万爆款', views: 100000, amount: 20 },
            { name: '20万爆款', views: 200000, amount: 40 },
            { name: '50万爆款', views: 500000, amount: 100 },
            { name: '100万爆款', views: 1000000, amount: 150 },
        ],
    },
    // 文案库筛选选项（管理员配置）
    copyLibraryFilterOptions: {
        category: ['种草', '测评', '教程', '开箱', 'Vlog', '合集', '探店'],
        isPublished: ['已发布', '未发布'],
        editor: [],
    },
    // 员工岗位预设（管理员可配置）
    employeePositions: ['剪辑', '文案', '运营', '拍摄', '设计'],
    // 请假申请数据（员工提交，管理员审核）
    leaveRequests: [],
    // 每日报餐数据（员工报餐，按 员工+日期 唯一）
    mealReports: [],
    // 报餐/提醒配置
    mealConfig: {
        standardAmount: 25,        // 每日餐标金额
        promptEnabled: true,       // 是否启用每日提醒推送
        promptText: '亲爱的同事，请记得今天报餐哦～', // 提醒提示词
    },
    // 微信绑定配置（当前用户维度）
    wechatConfig: {
        bound: false,
        nickname: '',
    },
    // 消息通知数据（管理员操作时生成，员工端实时接收）
    notifications: [],
    // 文案库申请数据（帮剪/帮写）
    copyLibraryRequests: [],
};

/* ====== 全局状态 ====== */
let state = {
    currentView: 'dashboard',
    charts: {},
    selectedPlatform: 'xiaohongshu',
    currentFilter: 'all',
    salaryData: [...MOCK_DATA.salaryData],
    salaryFieldConfig: [...MOCK_DATA.salaryFieldConfig.map(f => ({ ...f }))],
    salarySelectedName: null,  // 员工视图选中的姓名
    copyLibraryFilter: {},    // 当前文案库筛选条件
    copyLibraryTodayFirst: true,  // 文案库排序：当天优先显示
};

/* ============================================================
   数据持久化层 (DataStore)
   模拟项目文件夹结构，所有数据保存在 localStorage
   - yuangongguanli/  → 员工数据（每新增一个员工生成一个"文件夹"）
   - zizhanghao/       → 子账号与分类数据
   ============================================================ */
const DataStore = {
    PREFIX_EMP: 'yuangongguanli',
    PREFIX_SUB: 'zizhanghao',

    /* 初始化：从 localStorage 加载所有持久化数据 */
    init() {
        // 加载员工列表
        const empData = localStorage.getItem(`${this.PREFIX_EMP}/_index`);
        if (empData) {
            try {
                MOCK_AUTH_DATA.employees = JSON.parse(empData);
            } catch (e) { /* 使用默认空数组 */ }
        }

        // 加载子账号和分类
        const subData = localStorage.getItem(`${this.PREFIX_SUB}/_index`);
        if (subData) {
            try {
                const parsed = JSON.parse(subData);
                MOCK_DATA.subAccounts = parsed.subAccounts || [];
                MOCK_DATA.subAccountCategories = parsed.categories || { level1: [], level2: {} };
            } catch (e) { /* 使用默认空 */ }
        }

    // 加载子账号文件夹管理的视频数量数据
    const folderData = localStorage.getItem(`${this.PREFIX_EMP}/_folderData`);
    if (folderData) {
        try {
            const parsed = JSON.parse(folderData);
            // 兼容旧数据：可能是 { id: { name, count } } 结构
            MOCK_DATA.folderVideoCounts = {};
            Object.keys(parsed).forEach(id => {
                const numId = parseInt(id);
                const val = parsed[id];
                MOCK_DATA.folderVideoCounts[numId] = (val && typeof val === 'object') ? (val.count || 0) : (parseInt(val) || 0);
            });
        } catch (e) { /* 使用默认空 */ }
    }

        // 加载短视频预警数据
        const alertData = localStorage.getItem(`${this.PREFIX_EMP}/_alerts`);
        if (alertData) {
            try {
                MOCK_DATA.shortVideoAlerts = JSON.parse(alertData);
            } catch (e) { /* 使用默认空 */ }
        }

        // 加载常用应用
        const appData = localStorage.getItem(`${this.PREFIX_EMP}/_apps`);
        if (appData) {
            try {
                MOCK_DATA.apps = JSON.parse(appData);
            } catch (e) { /* 使用默认空 */ }
        }

        // 加载工资数据 + 字段配置
        const salaryData = localStorage.getItem(`${this.PREFIX_EMP}/_salary`);
        if (salaryData) {
            try {
                const parsed = JSON.parse(salaryData);
                MOCK_DATA.salaryData = parsed.data || [];
                if (parsed.fieldConfig && parsed.fieldConfig.length > 0) {
                    MOCK_DATA.salaryFieldConfig = parsed.fieldConfig;
                }
            } catch (e) { /* 使用默认空 */ }
        }

        // 加载运营成本
        const costData = localStorage.getItem(`${this.PREFIX_EMP}/_operatingCost`);
        if (costData) {
            try {
                const parsed = JSON.parse(costData);
                // 数据迁移：如果包含旧版预置的默认成本项，清空它们
                const oldDefaults = ['平台会员费', '工具订阅', '广告投放', '素材采购'];
                const hasOldDefaults = parsed.length === 4 && parsed.every(item => oldDefaults.includes(item.name));
                if (hasOldDefaults) {
                    MOCK_DATA.operatingCostItems = [];
                    localStorage.setItem(`${this.PREFIX_EMP}/_operatingCost`, JSON.stringify([]));
                } else {
                    MOCK_DATA.operatingCostItems = parsed;
                }
            } catch (e) { /* 使用默认空 */ }
        }

        // 加载工资历史快照
        const histData = localStorage.getItem(`${this.PREFIX_EMP}/_salaryHistory`);
        if (histData) {
            try {
                MOCK_DATA.salaryHistory = JSON.parse(histData);
            } catch (e) { /* 使用默认空 */ }
        }

        // 加载文案库数据
        const copyLibData = localStorage.getItem(`${this.PREFIX_EMP}/_copyLibrary`);
        if (copyLibData) {
            try {
                MOCK_DATA.copyLibrary = JSON.parse(copyLibData) || [];
            } catch (e) { /* 使用默认空 */ }
        }

        // 加载文案库筛选选项配置
        const copyLibFilterOptions = localStorage.getItem(`${this.PREFIX_EMP}/_copyLibraryFilterOptions`);
        if (copyLibFilterOptions) {
            try {
                const parsed = JSON.parse(copyLibFilterOptions);
                MOCK_DATA.copyLibraryFilterOptions = { ...MOCK_DATA.copyLibraryFilterOptions, ...parsed };
            } catch (e) { /* 使用默认 */ }
        }

        // 加载员工岗位预设
        const employeePositions = localStorage.getItem(`${this.PREFIX_EMP}/_employeePositions`);
        if (employeePositions) {
            try {
                const parsed = JSON.parse(employeePositions);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    MOCK_DATA.employeePositions = parsed;
                }
            } catch (e) { /* 使用默认 */ }
        }

        // 加载预警阈值
        const threshData = localStorage.getItem(`${this.PREFIX_SUB}/_thresholds`);
        if (threshData) {
            try {
                MOCK_DATA.alertThresholds = JSON.parse(threshData);
            } catch (e) { /* 使用默认空 */ }
        }

        // 加载请假申请数据
        const leaveData = localStorage.getItem(`${this.PREFIX_EMP}/_leaveRequests`);
        if (leaveData) {
            try { MOCK_DATA.leaveRequests = JSON.parse(leaveData); } catch (e) {}
        }

        // 加载每日报餐数据
        const mealData = localStorage.getItem(`${this.PREFIX_EMP}/_mealReports`);
        if (mealData) {
            try { MOCK_DATA.mealReports = JSON.parse(mealData); } catch (e) {}
        }

        // 加载报餐配置
        const mealCfg = localStorage.getItem(`${this.PREFIX_EMP}/_mealConfig`);
        if (mealCfg) {
            try {
                const parsed = JSON.parse(mealCfg);
                MOCK_DATA.mealConfig = { ...MOCK_DATA.mealConfig, ...parsed };
            } catch (e) {}
        }

        // 加载通知数据
        const notifData = localStorage.getItem(`${this.PREFIX_EMP}/_notifications`);
        if (notifData) {
            try { MOCK_DATA.notifications = JSON.parse(notifData); } catch (e) {}
        }

        // 加载文案库申请数据
        const copyReqData = localStorage.getItem(`${this.PREFIX_EMP}/_copyLibraryRequests`);
        if (copyReqData) {
            try { MOCK_DATA.copyLibraryRequests = JSON.parse(copyReqData) || []; } catch (e) {}
        }

        // 加载剪辑工作表数据
        const editingWorksheetData = localStorage.getItem(`${this.PREFIX_EMP}/_editingWorksheet`);
        if (editingWorksheetData) {
            try { MOCK_DATA.editingWorksheet = JSON.parse(editingWorksheetData) || []; } catch (e) {}
        }

        // 加载年度工作日历（法定节假日 / 调休上班日）
        const workCalendarData = localStorage.getItem(`${this.PREFIX_EMP}/_workCalendar`);
        if (workCalendarData) {
            try {
                const parsed = JSON.parse(workCalendarData) || {};
                MOCK_DATA.workCalendar = {
                    holidays: Array.isArray(parsed.holidays) ? parsed.holidays : [],
                    workdays: Array.isArray(parsed.workdays) ? parsed.workdays : [],
                    removedHolidays: Array.isArray(parsed.removedHolidays) ? parsed.removedHolidays : [],
                };
            } catch (e) {}
        }

        // 加载子账号绩效基数配置（询盘绩效 + 爆款绩效）
        this.loadSubAccountSalaryConfig();

        // 关键：同步 state 对象（state 在文件加载时就从 MOCK_DATA 复制了，此时 MOCK_DATA 已更新）
        this.syncState();
    },

    /* ====== 员工数据 ====== */

    saveEmployeeIndex() {
        localStorage.setItem(`${this.PREFIX_EMP}/_index`, JSON.stringify(MOCK_AUTH_DATA.employees));
    },

    // 新增员工时创建"文件夹"（数据结构）
    createEmployeeFolder(empId, empName) {
        const folderKey = `${this.PREFIX_EMP}/${empId}`;
        const folderData = {
            info: { id: empId, name: empName, createdAt: new Date().toISOString() },
            shortVideoAlerts: [],
            copywritingData: [],
            autoBrowserData: [],
            salaryData: {},
            log: [],
        };
        localStorage.setItem(folderKey, JSON.stringify(folderData));
    },

    // 删除员工时删除"文件夹"
    deleteEmployeeFolder(empId) {
        const folderKey = `${this.PREFIX_EMP}/${empId}`;
        localStorage.removeItem(folderKey);
    },

    // 读取员工"文件夹"数据
    getEmployeeFolder(empId) {
        const data = localStorage.getItem(`${this.PREFIX_EMP}/${empId}`);
        return data ? JSON.parse(data) : null;
    },

    // 保存员工"文件夹"数据
    setEmployeeFolder(empId, data) {
        localStorage.setItem(`${this.PREFIX_EMP}/${empId}`, JSON.stringify(data));
    },

    // 追加员工日志
    appendEmployeeLog(empId, logEntry) {
        const folder = this.getEmployeeFolder(empId);
        if (folder) {
            folder.log = folder.log || [];
            folder.log.push({ time: new Date().toISOString(), entry: logEntry });
            this.setEmployeeFolder(empId, folder);
        }
    },

    /* ====== 短视频预警数据 ====== */
    saveAlerts() {
        localStorage.setItem(`${this.PREFIX_EMP}/_alerts`, JSON.stringify(MOCK_DATA.shortVideoAlerts));
    },

    /* ====== 常用应用 ====== */
    saveApps() {
        localStorage.setItem(`${this.PREFIX_EMP}/_apps`, JSON.stringify(MOCK_DATA.apps));
    },

    /* ====== 工资数据 + 字段配置 ====== */
    saveSalary() {
        localStorage.setItem(`${this.PREFIX_EMP}/_salary`, JSON.stringify({
            data: state.salaryData,
            fieldConfig: state.salaryFieldConfig,
        }));
    },

    /* ====== 运营成本 ====== */
    saveOperatingCost() {
        localStorage.setItem(`${this.PREFIX_EMP}/_operatingCost`, JSON.stringify(MOCK_DATA.operatingCostItems));
    },

    /* ====== 工资历史快照 ====== */
    saveSalaryHistory() {
        localStorage.setItem(`${this.PREFIX_EMP}/_salaryHistory`, JSON.stringify(MOCK_DATA.salaryHistory));
    },

    /* ====== 文案库数据 ====== */
    saveCopyLibrary() {
        localStorage.setItem(`${this.PREFIX_EMP}/_copyLibrary`, JSON.stringify(MOCK_DATA.copyLibrary));
    },

    saveCopyLibraryFilterOptions() {
        localStorage.setItem(`${this.PREFIX_EMP}/_copyLibraryFilterOptions`, JSON.stringify(MOCK_DATA.copyLibraryFilterOptions));
    },

    saveCopyLibraryRequests() {
        localStorage.setItem(`${this.PREFIX_EMP}/_copyLibraryRequests`, JSON.stringify(MOCK_DATA.copyLibraryRequests));
    },

    saveEditingWorksheet() {
        localStorage.setItem(`${this.PREFIX_EMP}/_editingWorksheet`, JSON.stringify(MOCK_DATA.editingWorksheet));
    },

    saveClipWorkSettings() {
        localStorage.setItem(`${this.PREFIX_EMP}/_clipWorkSettings`, JSON.stringify(MOCK_DATA.clipWorkSettings));
    },

    saveWorkCalendar() {
        localStorage.setItem(`${this.PREFIX_EMP}/_workCalendar`, JSON.stringify(MOCK_DATA.workCalendar || { holidays: [], workdays: [], removedHolidays: [] }));
    },

    saveSubAccountSalaryConfig() {
        localStorage.setItem(`${this.PREFIX_EMP}/_subAccountSalaryConfig`, JSON.stringify(MOCK_DATA.subAccountSalaryConfig || { inquiry: {}, viral: [] }));
    },

    loadSubAccountSalaryConfig() {
        const data = localStorage.getItem(`${this.PREFIX_EMP}/_subAccountSalaryConfig`);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                if (parsed && typeof parsed === 'object') {
                    MOCK_DATA.subAccountSalaryConfig = {
                        inquiry: parsed.inquiry || {},
                        viral: Array.isArray(parsed.viral) && parsed.viral.length > 0
                            ? parsed.viral
                            : MOCK_DATA.subAccountSalaryConfig.viral,
                    };
                }
            } catch (e) { /* 使用默认配置 */ }
        }
    },

    saveEmployeePositions() {
        localStorage.setItem(`${this.PREFIX_EMP}/_employeePositions`, JSON.stringify(MOCK_DATA.employeePositions));
    },

    /* ====== 请假申请 ====== */
    saveLeaveRequests() {
        localStorage.setItem(`${this.PREFIX_EMP}/_leaveRequests`, JSON.stringify(MOCK_DATA.leaveRequests));
    },

    /* ====== 每日报餐 ====== */
    saveMealReports() {
        localStorage.setItem(`${this.PREFIX_EMP}/_mealReports`, JSON.stringify(MOCK_DATA.mealReports));
    },

    /* ====== 报餐配置 ====== */
    saveMealConfig() {
        localStorage.setItem(`${this.PREFIX_EMP}/_mealConfig`, JSON.stringify(MOCK_DATA.mealConfig));
    },

    /* ====== 微信绑定（按用户存储） ====== */
    saveWechatConfig(userId, cfg) {
        localStorage.setItem(`${this.PREFIX_EMP}/_wechat_${userId}`, JSON.stringify(cfg));
    },

    getWechatConfig(userId) {
        const data = localStorage.getItem(`${this.PREFIX_EMP}/_wechat_${userId}`);
        if (data) {
            try { return JSON.parse(data); } catch (e) {}
        }
        return { bound: false, nickname: '' };
    },

    /* ====== 预警阈值 ====== */
    saveThresholds() {
        localStorage.setItem(`${this.PREFIX_SUB}/_thresholds`, JSON.stringify(MOCK_DATA.alertThresholds));
    },

    /* ====== 子账号文件夹视频数量 ====== */
    saveFolderVideoCounts() {
        localStorage.setItem(`${this.PREFIX_EMP}/_folderData`, JSON.stringify(MOCK_DATA.folderVideoCounts));
    },

    /* ====== 子账号与分类 ====== */
    saveSubAccountIndex() {
        localStorage.setItem(`${this.PREFIX_SUB}/_index`, JSON.stringify({
            subAccounts: MOCK_DATA.subAccounts,
            categories: MOCK_DATA.subAccountCategories,
        }));
    },

    /* 同步 state 中的数据（在 init 加载完 MOCK_DATA 后调用） */
    syncState() {
        state.salaryData = [...MOCK_DATA.salaryData];
        state.salaryFieldConfig = MOCK_DATA.salaryFieldConfig.map(f => ({ ...f }));
    },

    /* 重新从 localStorage 加载所有数据（用于实时同步） */
    reloadAll() {
        // 员工列表
        const empData = localStorage.getItem(`${this.PREFIX_EMP}/_index`);
        if (empData) {
            try { MOCK_AUTH_DATA.employees = JSON.parse(empData); } catch (e) {}
        }
        // 子账号和分类
        const subData = localStorage.getItem(`${this.PREFIX_SUB}/_index`);
        if (subData) {
            try {
                const parsed = JSON.parse(subData);
                MOCK_DATA.subAccounts = parsed.subAccounts || [];
                MOCK_DATA.subAccountCategories = parsed.categories || { level1: [], level2: {} };
            } catch (e) {}
        }
        // 文件夹视频数量
        const folderData = localStorage.getItem(`${this.PREFIX_EMP}/_folderData`);
        if (folderData) {
            try {
                const parsed = JSON.parse(folderData);
                MOCK_DATA.folderVideoCounts = {};
                Object.keys(parsed).forEach(id => {
                    const numId = parseInt(id);
                    const val = parsed[id];
                    MOCK_DATA.folderVideoCounts[numId] = (val && typeof val === 'object') ? (val.count || 0) : (parseInt(val) || 0);
                });
            } catch (e) {}
        }
        // 短视频预警
        const alertData = localStorage.getItem(`${this.PREFIX_EMP}/_alerts`);
        if (alertData) { try { MOCK_DATA.shortVideoAlerts = JSON.parse(alertData); } catch (e) {} }
        // 常用应用
        const appData = localStorage.getItem(`${this.PREFIX_EMP}/_apps`);
        if (appData) { try { MOCK_DATA.apps = JSON.parse(appData); } catch (e) {} }
        // 工资数据
        const salaryData = localStorage.getItem(`${this.PREFIX_EMP}/_salary`);
        if (salaryData) {
            try {
                const parsed = JSON.parse(salaryData);
                MOCK_DATA.salaryData = parsed.data || [];
                if (parsed.fieldConfig && parsed.fieldConfig.length > 0) MOCK_DATA.salaryFieldConfig = parsed.fieldConfig;
            } catch (e) {}
        }
        // 运营成本
        const costData = localStorage.getItem(`${this.PREFIX_EMP}/_operatingCost`);
        if (costData) { try { MOCK_DATA.operatingCostItems = JSON.parse(costData); } catch (e) {} }
        // 文案库数据
        const copyLibData = localStorage.getItem(`${this.PREFIX_EMP}/_copyLibrary`);
        if (copyLibData) { try { MOCK_DATA.copyLibrary = JSON.parse(copyLibData) || []; } catch (e) {} }
        // 文案库筛选选项
        const copyFilterOpts = localStorage.getItem(`${this.PREFIX_EMP}/_copyLibraryFilterOptions`);
        if (copyFilterOpts) {
            try { MOCK_DATA.copyLibraryFilterOptions = { ...MOCK_DATA.copyLibraryFilterOptions, ...JSON.parse(copyFilterOpts) }; } catch (e) {}
        }
        // 剪辑工作表
        const editingWorksheetData = localStorage.getItem(`${this.PREFIX_EMP}/_editingWorksheet`);
        if (editingWorksheetData) { try { MOCK_DATA.editingWorksheet = JSON.parse(editingWorksheetData) || []; } catch (e) {} }
        // 剪辑工作表配置（时长区间、基数、每日工作量）
        const clipWS = localStorage.getItem(`${this.PREFIX_EMP}/_clipWorkSettings`);
        if (clipWS) {
            try {
                const p = JSON.parse(clipWS);
                if (p) {
                    // 兼容旧结构：durationHeaders 字符串数组 => durations 对象数组
                    if (Array.isArray(p.durationHeaders)) {
                        MOCK_DATA.clipWorkSettings.durations = p.durationHeaders.map(label => ({
                            label: String(label),
                            baseValue: 1
                        }));
                    }
                    // 兼容旧结构：baseValue => dailyWorkload
                    if (p.baseValue !== undefined) {
                        MOCK_DATA.clipWorkSettings.dailyWorkload = Number(p.baseValue) || 0;
                    }
                    // 新结构：durations 对象数组
                    if (Array.isArray(p.durations)) {
                        MOCK_DATA.clipWorkSettings.durations = p.durations.map(d => ({
                            label: String(d.label || '').trim(),
                            baseValue: parseFloat(d.baseValue) || 0
                        })).filter(d => d.label);
                    }
                    if (p.dailyWorkload !== undefined) {
                        MOCK_DATA.clipWorkSettings.dailyWorkload = Number(p.dailyWorkload) || 0;
                    }
                }
            } catch (e) {}
        }
        // 年度工作日历
        const workCalendarData = localStorage.getItem(`${this.PREFIX_EMP}/_workCalendar`);
        if (workCalendarData) {
            try {
                const parsed = JSON.parse(workCalendarData) || {};
                MOCK_DATA.workCalendar = {
                    holidays: Array.isArray(parsed.holidays) ? parsed.holidays : [],
                    workdays: Array.isArray(parsed.workdays) ? parsed.workdays : [],
                    removedHolidays: Array.isArray(parsed.removedHolidays) ? parsed.removedHolidays : [],
                };
            } catch (e) {}
        }
        // 员工岗位预设
        const empPositions = localStorage.getItem(`${this.PREFIX_EMP}/_employeePositions`);
        if (empPositions) { try { const p = JSON.parse(empPositions); if (Array.isArray(p) && p.length > 0) MOCK_DATA.employeePositions = p; } catch (e) {} }
        // 请假申请
        const leaveData = localStorage.getItem(`${this.PREFIX_EMP}/_leaveRequests`);
        if (leaveData) { try { MOCK_DATA.leaveRequests = JSON.parse(leaveData); } catch (e) {} }
        // 每日报餐
        const mealData = localStorage.getItem(`${this.PREFIX_EMP}/_mealReports`);
        if (mealData) { try { MOCK_DATA.mealReports = JSON.parse(mealData); } catch (e) {} }
        // 报餐配置
        const mealCfg = localStorage.getItem(`${this.PREFIX_EMP}/_mealConfig`);
        if (mealCfg) { try { MOCK_DATA.mealConfig = { ...MOCK_DATA.mealConfig, ...JSON.parse(mealCfg) }; } catch (e) {} }
        // 通知数据
        const notifData = localStorage.getItem(`${this.PREFIX_EMP}/_notifications`);
        if (notifData) { try { MOCK_DATA.notifications = JSON.parse(notifData); } catch (e) {} }
        // 文案库申请数据
        const copyReqData = localStorage.getItem(`${this.PREFIX_EMP}/_copyLibraryRequests`);
        if (copyReqData) { try { MOCK_DATA.copyLibraryRequests = JSON.parse(copyReqData) || []; } catch (e) {} }
        // 工资历史
        const histData = localStorage.getItem(`${this.PREFIX_EMP}/_salaryHistory`);
        if (histData) { try { MOCK_DATA.salaryHistory = JSON.parse(histData); } catch (e) {} }
        // 预警阈值
        const threshData = localStorage.getItem(`${this.PREFIX_SUB}/_thresholds`);
        if (threshData) { try { MOCK_DATA.alertThresholds = JSON.parse(threshData); } catch (e) {} }
        // 子账号绩效基数配置
        this.loadSubAccountSalaryConfig();

        this.syncState();
    },

    /* ====== 通知数据 ====== */
    saveNotifications() {
        localStorage.setItem(`${this.PREFIX_EMP}/_notifications`, JSON.stringify(MOCK_DATA.notifications));
    },
};

/* ============================================================
   模块一：导航控制
   ============================================================ */
const Navigation = {
    init() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                // 客户端无刷新切换，避免侧边栏折叠/闪烁
                this.switchView(view);
                // 同步更新 URL，刷新后可恢复目标板块
                const url = new URL(window.location.href);
                url.searchParams.set('view', view);
                window.history.replaceState({}, '', url.toString());
                // 移动端切换后关闭侧边栏
                document.querySelector('.sidebar')?.classList.remove('open');
            });
        });

        // 移动端菜单切换
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('open');
            });
        }

        // 根据 URL 参数切换视图（刷新后恢复目标板块）
        const params = new URLSearchParams(window.location.search);
        const targetView = params.get('view');
        if (targetView) {
            this.switchView(targetView);
        }
    },

    switchView(viewName) {
        // 权限校验：员工只能访问启用功能，管理员可访问全部
        const isAdmin = Auth.isAdmin();
        const enabledFeatures = Auth.getEnabledFeatures();
        let allowedViews = isAdmin
            ? Object.keys(this._getTitleMap())
            : [...enabledFeatures, 'dashboard', 'salary', 'apps', 'my-requests', 'folder-manager', 'short-video-alert', 'leave', 'meal'];
        // 剪辑工作表仅对管理员或剪辑/运营岗位开放
        if (Auth.canAccessClipWorksheet()) {
            allowedViews.push('clip-worksheet');
        }

        const targetView = document.getElementById(`view-${viewName}`);
        if (!targetView || !allowedViews.includes(viewName)) {
            viewName = 'dashboard';
        }

        // 更新导航高亮
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // 切换视图显示
        document.querySelectorAll('.view').forEach(view => {
            view.classList.toggle('active', view.id === `view-${viewName}`);
        });

        // 更新标题
        const titleMap = this._getTitleMap();
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = titleMap[viewName] || '';
        state.currentView = viewName;

        // 延迟初始化对应模块的图表
        if (viewName === 'dashboard') {
            setTimeout(() => {
                Dashboard.initCharts();
                Dashboard.updateStatCards();
                Dashboard.renderTable();
            }, 100);
        }

        // 切换到文案库时重新渲染（保持数据最新，当天优先显示）
        if (viewName === 'tencent-docs' && typeof CopyLibrary !== 'undefined') {
            state.copyLibraryTodayFirst = true;
            CopyLibrary.render();
        }

        // 切换到我的申请时重新渲染申请列表
        if (viewName === 'my-requests' && typeof CopyLibraryRequest !== 'undefined') {
            CopyLibraryRequest.render();
        }

        // 切换到剪辑工作表时重新渲染（配置或数据可能已变更）
        if (viewName === 'clip-worksheet' && typeof EditingWorksheet !== 'undefined') {
            EditingWorksheet.render();
        }

        // 切换到文件夹管理时重新渲染（子账号可能已变更）
        if (viewName === 'folder-manager' && typeof FolderManager !== 'undefined') {
            FolderManager.render();
        }

        // 切换到工资视图时重新渲染（确保数据最新）
        if (viewName === 'salary' && typeof SalaryManager !== 'undefined') {
            SalaryManager.renderView();
            if (typeof ClipWorkSettings !== 'undefined') ClipWorkSettings.render();
        }

        // 切换到请假申请时重新渲染
        if (viewName === 'leave' && typeof LeaveManager !== 'undefined') {
            LeaveManager.render();
        }

        // 切换到每日报餐时重新渲染
        if (viewName === 'meal' && typeof MealManager !== 'undefined') {
            MealManager.render();
        }

        // 切换到常用应用时重新渲染
        if (viewName === 'apps' && typeof CommonApps !== 'undefined') {
            CommonApps.render();
        }
    },

    _getTitleMap() {
        return {
            'dashboard': '数据查看仪表板',
            'tencent-docs': '文案库',
            'my-requests': '我的申请',
            'video-downloader': '视频解析下载器',
            'copy-downloader': '文案解析下载器',
            'auto-browser': '自动化浏览器',
            'salary': Auth.isAdmin() ? '工资管理' : '工资明细',
            'employee': '员工管理',
            'sub-account': '子账号管理',
            'folder-manager': '子账号文件夹管理',
            'video-monitor': '视频数据监控',
            'copy-monitor': '文案监控',
            'short-video-alert': '短视频预警',
            'app-management': '应用管理',
            'apps': '常用应用',
            'leave': '请假申请',
            'meal': '每日报餐',
            'clip-worksheet': '剪辑工作表',
            'settings': '平台设置',
        };
    },
};

/* ============================================================
   模块二：数据仪表板
   ============================================================ */
const Dashboard = {
    videoDirHandle: null,   // 选中的视频文件夹句柄
    videoRefreshTimer: null, // 自动刷新定时器

    init() {
        this.populateFilter();
        this.updateStatCards();
        this.renderTable();
        this.initCharts();
        this.bindEvents();
    },

    // 填充子账号筛选下拉框
    populateFilter() {
        const select = document.getElementById('sub-account-filter');
        // 根据登录用户权限过滤可见子账号
        const accessibleIds = Auth.getAccessibleSubAccounts();
        const visibleAccounts = MOCK_DATA.subAccounts.filter(acc =>
            accessibleIds.includes(acc.id)
        );
        visibleAccounts.forEach(acc => {
            const option = document.createElement('option');
            option.value = acc.id;
            option.textContent = acc.name;
            select.appendChild(option);
        });
    },

    // 获取筛选后的数据（先按用户权限过滤，再按筛选条件过滤）
    getFilteredData() {
        const accessibleIds = Auth.getAccessibleSubAccounts();
        let data = MOCK_DATA.subAccounts.filter(acc =>
            accessibleIds.includes(acc.id)
        );
        if (state.currentFilter !== 'all') {
            data = data.filter(acc => acc.id === parseInt(state.currentFilter));
        }
        return data;
    },

    // 从文件夹管理获取子账号的实时视频数量
    getFolderVideoCount(subAccId) {
        const val = MOCK_DATA.folderVideoCounts?.[subAccId];
        if (val && typeof val === 'object') return parseInt(val.count) || 0;
        return parseInt(val) || 0;
    },

    // 更新统计卡片
    updateStatCards() {
        const data = this.getFilteredData();
        const accessibleIds = data.map(acc => acc.id);

        // 文案统计改为从文案库实时计算
        const copyItems = Auth.isAdmin()
            ? MOCK_DATA.copyLibrary
            : MOCK_DATA.copyLibrary.filter(item => accessibleIds.includes(item.subAccountId));
        const copyTotal = copyItems.length;
        const copyEdited = copyItems.filter(item => item.isEdited).length;
        const copyRemaining = copyTotal - copyEdited;

        // 视频总数量从子账号汇总
        const videoTotal = data.reduce((sum, item) => sum + item.videoTotal, 0);
        // 视频剩余数量以文件夹管理的实时数量为准
        const videoRemaining = data.reduce((sum, item) => sum + this.getFolderVideoCount(item.id), 0);

        document.getElementById('stat-copy-total').textContent = copyTotal;
        document.getElementById('stat-copy-remaining').textContent = copyRemaining;
        document.getElementById('stat-video-total').textContent = videoTotal;
        document.getElementById('stat-video-remaining').textContent = videoRemaining;

        // 管理员专属卡片：员工工资总额 + 运营成本
        const salaryTotalEl = document.getElementById('stat-salary-total');
        const operatingCostEl = document.getElementById('stat-operating-cost');
        const calcNet = (row) => {
            const fields = state.salaryFieldConfig || MOCK_DATA.salaryFieldConfig;
            return fields.reduce((sum, f) => {
                const v = parseFloat(row[f.key]) || 0;
                return f.type === 'deduction' ? sum - v : sum + v;
            }, 0);
        };
        if (salaryTotalEl) {
            const salarySum = state.salaryData.reduce((sum, row) => sum + calcNet(row), 0);
            salaryTotalEl.textContent = `¥${salarySum.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (operatingCostEl) {
            const salarySum = state.salaryData.reduce((sum, row) => sum + calcNet(row), 0);
            const costItemsTotal = MOCK_DATA.operatingCostItems.reduce((sum, item) => sum + item.amount, 0);
            const totalCost = salarySum + costItemsTotal;
            operatingCostEl.textContent = `¥${totalCost.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    },

    // 渲染数据表格
    renderTable() {
        const tbody = document.getElementById('dashboard-table-body');
        const data = this.getFilteredData();
        tbody.innerHTML = '';

        // 判断当前用户是否为剪辑岗（仅有剪辑岗，且无文案/运营岗）
        const user = Auth.getCurrentUser();
        const isClipperOnly = !Auth.isAdmin() && user && user.positions &&
            user.positions.includes('剪辑') &&
            !user.positions.includes('文案') &&
            !user.positions.includes('运营');

        data.forEach(acc => {
            // 视频剩余数量以文件夹管理的实时数量为准
            const videoRemaining = this.getFolderVideoCount(acc.id);

            // 文案统计从文案库实时计算
            const copyItems = MOCK_DATA.copyLibrary.filter(item => item.subAccountId === acc.id);
            const copyTotal = copyItems.length;
            const copyEdited = copyItems.filter(item => item.isEdited).length;
            const copyRemaining = copyTotal - copyEdited;

            // 综合文案和视频计算完成率（非剪辑岗）
            const copyRate = copyTotal > 0
                ? Math.round((copyEdited / copyTotal) * 100)
                : null;
            const videoRate = acc.videoTotal > 0
                ? Math.round(((acc.videoTotal - videoRemaining) / acc.videoTotal) * 100)
                : null;
            // 取两者平均值，若只有一项有数据则用该项
            let completionRate;
            let completionDisplay;
            if (copyRate !== null && videoRate !== null) {
                completionRate = Math.round((copyRate + videoRate) / 2);
                completionDisplay = completionRate + '%';
            } else if (copyRate !== null) {
                completionRate = copyRate;
                completionDisplay = copyRate + '%';
            } else if (videoRate !== null) {
                completionRate = videoRate;
                completionDisplay = videoRate + '%';
            } else {
                completionRate = 0;
                completionDisplay = '—';
            }
            const statusTag = completionRate >= 70
                ? '<span class="tag tag-success">正常</span>'
                : completionRate >= 40
                    ? '<span class="tag tag-warning">跟进中</span>'
                    : '<span class="tag tag-danger">待处理</span>';

            tbody.innerHTML += `
                <tr>
                    <td>${acc.name}</td>
                    <td>${copyTotal}</td>
                    <td>${copyRemaining}</td>
                    <td>${acc.videoTotal}</td>
                    <td>${videoRemaining}</td>
                    <td>
                        ${isClipperOnly ? `
                            <span style="font-weight:600;">${copyEdited}</span>
                            <span style="font-size:12px;color:var(--color-text-light);">（已剪视频数量）</span>
                        ` : `
                            <div style="display:flex;align-items:center;gap:8px;">
                                <div style="width:60px;height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
                                    <div style="width:${completionRate}%;height:100%;background:${completionRate>=70?'#10b981':completionRate>=40?'#f59e0b':'#ef4444'};"></div>
                                </div>
                                <span>${completionDisplay}</span>
                            </div>
                        `}
                    </td>
                    <td>${statusTag}</td>
                </tr>
            `;
        });
    },

    // 初始化图表
    initCharts() {
        if (!state.charts.line) this.renderLineChart();
        if (!state.charts.pie) this.renderPieChart();
        if (!state.charts.bar) this.renderBarChart();
        if (!state.charts.remaining) this.renderRemainingChart();
    },

    // 获取当前用户可见的文案库数据
    getAccessibleCopyData() {
        const accessibleIds = Auth.getAccessibleSubAccounts();
        return Auth.isAdmin()
            ? MOCK_DATA.copyLibrary
            : MOCK_DATA.copyLibrary.filter(item => accessibleIds.includes(item.subAccountId));
    },

    // 折线图：内容产出趋势（从文案库按月统计）
    renderLineChart() {
        const ctx = document.getElementById('line-chart');
        if (!ctx) return;

        // 按月统计最近7个月的文案产出
        const copyData = this.getAccessibleCopyData();
        const now = new Date();
        const labels = [];
        const copyCounts = [];
        const videoCounts = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = `${d.getMonth() + 1}月`;
            labels.push(monthLabel);

            // 文案产出：按 createdAt 月份统计
            const copyCount = copyData.filter(item => {
                if (!item.createdAt) return false;
                return item.createdAt.startsWith(monthKey);
            }).length;
            copyCounts.push(copyCount);

            // 视频产出：按 videoHistory 月份统计
            const videoCount = MOCK_DATA.videoHistory.filter(v => {
                if (!v.time) return false;
                return v.time.startsWith(monthKey);
            }).length;
            videoCounts.push(videoCount);
        }

        state.charts.line = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '文案产出',
                        data: copyCounts,
                        borderColor: CONFIG.chartColors.primary,
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                    {
                        label: '视频产出',
                        data: videoCounts,
                        borderColor: CONFIG.chartColors.green,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: CONFIG.chartTextColor, font: { size: 12 } },
                    },
                },
                scales: {
                    x: {
                        ticks: { color: CONFIG.chartTextColor },
                        grid: { color: CONFIG.chartGridColor },
                    },
                    y: {
                        ticks: { color: CONFIG.chartTextColor },
                        grid: { color: CONFIG.chartGridColor },
                        beginAtZero: true,
                    },
                },
            },
        });
    },

    // 饼图：文案分类分布（从文案库实时统计）
    renderPieChart() {
        const ctx = document.getElementById('pie-chart');
        if (!ctx) return;

        const copyData = this.getAccessibleCopyData();
        const categoryMap = {};
        copyData.forEach(item => {
            const cat = item.category || '未分类';
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        const palette = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#3b82f6', '#ef4444', '#84cc16', '#f97316'];
        const labels = Object.keys(categoryMap);
        const values = Object.values(categoryMap);
        const colors = labels.map((_, i) => palette[i % palette.length]);

        // 无数据时显示占位
        if (labels.length === 0) {
            labels.push('暂无数据');
            values.push(1);
            colors.push('#e2e8f0');
        }

        state.charts.pie = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff',
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: CONFIG.chartTextColor, font: { size: 12 }, padding: 12 },
                    },
                },
            },
        });
    },

    // 条形图：子账号对比（从文案库实时统计）
    renderBarChart() {
        const ctx = document.getElementById('bar-chart');
        if (!ctx) return;

        const data = this.getFilteredData();
        // 从文案库实时计算各子账号文案数
        const copyTotals = data.map(acc =>
            MOCK_DATA.copyLibrary.filter(item => item.subAccountId === acc.id).length
        );

        state.charts.bar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.name),
                datasets: [
                    {
                        label: '文案总数',
                        data: copyTotals,
                        backgroundColor: CONFIG.chartColors.primary,
                        borderRadius: 6,
                    },
                    {
                        label: '视频总数',
                        data: data.map(d => d.videoTotal),
                        backgroundColor: CONFIG.chartColors.green,
                        borderRadius: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: CONFIG.chartTextColor, font: { size: 12 } },
                    },
                },
                scales: {
                    x: {
                        ticks: { color: CONFIG.chartTextColor, font: { size: 11 } },
                        grid: { display: false },
                    },
                    y: {
                        ticks: { color: CONFIG.chartTextColor },
                        grid: { color: CONFIG.chartGridColor },
                        beginAtZero: true,
                    },
                },
            },
        });
    },

    // 折线图：各子账号文案/视频剩余数量趋势
    renderRemainingChart() {
        const ctx = document.getElementById('remaining-chart');
        if (!ctx) return;

        const data = this.getFilteredData();
        const copyRemainings = data.map(acc => {
            const items = MOCK_DATA.copyLibrary.filter(item => item.subAccountId === acc.id);
            return items.length - items.filter(item => item.isEdited).length;
        });
        const videoRemainings = data.map(acc => this.getFolderVideoCount(acc.id));

        state.charts.remaining = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.name),
                datasets: [
                    {
                        label: '文案剩余',
                        data: copyRemainings,
                        borderColor: CONFIG.chartColors.primary,
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                    {
                        label: '视频剩余',
                        data: videoRemainings,
                        borderColor: CONFIG.chartColors.orange || '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: CONFIG.chartTextColor, font: { size: 12 } },
                    },
                },
                scales: {
                    x: {
                        ticks: { color: CONFIG.chartTextColor, font: { size: 11 } },
                        grid: { color: CONFIG.chartGridColor },
                    },
                    y: {
                        ticks: { color: CONFIG.chartTextColor },
                        grid: { color: CONFIG.chartGridColor },
                        beginAtZero: true,
                    },
                },
            },
        });
    },

    // 绑定事件
    bindEvents() {
        // 子账号筛选
        document.getElementById('sub-account-filter').addEventListener('change', (e) => {
            state.currentFilter = e.target.value;
            this.updateStatCards();
            this.renderTable();
        });

        // 视频剩余数量卡片 - 打开本地文件夹
        document.getElementById('stat-video-remaining-card').addEventListener('click', () => {
            this.openLocalFolder();
        });

        // 刷新数据
        document.getElementById('refresh-dashboard').addEventListener('click', () => {
            this.updateStatCards();
            this.renderTable();
            this.refreshCharts();
            showToast('数据已刷新', 'success');
        });

        // 导出表格
        document.getElementById('export-table-btn').addEventListener('click', () => {
            showToast('正在导出Excel...', 'info');
            setTimeout(() => showToast('数据导出完成（演示）', 'success'), 1500);
        });
    },

    // 打开本地文件夹（选择视频文件夹后每3秒自动刷新视频数量）
    async openLocalFolder() {
        // 尝试使用 File System Access API（现代浏览器）
        if (window.showDirectoryPicker) {
            try {
                const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
                this.videoDirHandle = dirHandle;
                showToast(`已选择文件夹：${dirHandle.name}，视频数量将每3秒自动刷新`, 'success');

                // 更新提示文字
                const hintEl = document.querySelector('#stat-video-remaining-card .stat-hint');
                if (hintEl) hintEl.textContent = `实时监控：${dirHandle.name}（每3秒刷新）`;

                // 立即刷新一次
                await this.refreshVideoCount();

                // 清除旧的定时器
                if (this.videoRefreshTimer) clearInterval(this.videoRefreshTimer);
                // 每3秒自动刷新
                this.videoRefreshTimer = setInterval(() => {
                    this.refreshVideoCount();
                }, 3000);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    showToast('无法访问文件夹', 'warning');
                }
            }
        } else {
            showToast('当前浏览器不支持文件夹访问，建议使用Chrome/Edge浏览器', 'warning');
        }
    },

    // 刷新视频文件夹中的视频文件数量
    async refreshVideoCount() {
        if (!this.videoDirHandle) return;
        try {
            const videoExts = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm', '.m4v', '.ts', '.rmvb'];
            let count = 0;
            for await (const entry of this.videoDirHandle.values()) {
                if (entry.kind === 'file') {
                    const name = entry.name.toLowerCase();
                    if (videoExts.some(ext => name.endsWith(ext))) {
                        count++;
                    }
                }
            }
            // 更新仪表板视频剩余数量显示
            const videoEl = document.getElementById('stat-video-remaining');
            if (videoEl) {
                videoEl.textContent = count;
                // 添加动画效果
                videoEl.style.transition = 'transform 0.3s, color 0.3s';
                videoEl.style.transform = 'scale(1.15)';
                videoEl.style.color = '#f59e0b';
                setTimeout(() => {
                    videoEl.style.transform = 'scale(1)';
                    videoEl.style.color = '';
                }, 300);
            }
        } catch (err) {
            // 文件夹可能已被关闭或权限丢失
            if (this.videoRefreshTimer) {
                clearInterval(this.videoRefreshTimer);
                this.videoRefreshTimer = null;
            }
            this.videoDirHandle = null;
            const hintEl = document.querySelector('#stat-video-remaining-card .stat-hint');
            if (hintEl) hintEl.textContent = '点击打开本地文件夹';
            showToast('文件夹访问中断，请重新选择', 'warning');
        }
    },

    // 刷新图表（销毁后重建，使用最新数据）
    refreshCharts() {
        if (state.charts.line) { state.charts.line.destroy(); state.charts.line = null; }
        if (state.charts.pie) { state.charts.pie.destroy(); state.charts.pie = null; }
        if (state.charts.bar) { state.charts.bar.destroy(); state.charts.bar = null; }
        if (state.charts.remaining) { state.charts.remaining.destroy(); state.charts.remaining = null; }
        this.renderLineChart();
        this.renderPieChart();
        this.renderBarChart();
        this.renderRemainingChart();
    },
};

/* ============================================================
   模块三：文案库（替代原腾讯文档接入）
   员工：可新增/删除/修改/筛选，只能看见自己分配的子账号的文案
   管理员：可查看所有员工文案，并增加负责人列（红/绿色块）
   ============================================================ */
const CopyLibrary = {
    editingId: null,

    // 表头配置：key 对应数据字段，filterable 是否可筛选，type 筛选类型
    columns: [
        { key: 'publishDate', label: '发布时期', filterable: true, type: 'date' },
        { key: 'dayOfWeek', label: '星期', filterable: true, type: 'select' },
        { key: 'subAccountId', label: '子账号', filterable: true, type: 'select' },
        { key: 'category', label: '分类', filterable: true, type: 'select' },
        { key: 'benchmark', label: '对标', filterable: true, type: 'text' },
        { key: 'title', label: '标题', filterable: true, type: 'text' },
        { key: 'content', label: '文案', filterable: true, type: 'text' },
        { key: 'editor', label: '剪辑人', filterable: true, type: 'select', autoBound: true },
        { key: 'copywriter', label: '文案专员', filterable: true, type: 'select', autoBound: true },
        { key: 'isPublished', label: '是否发布', filterable: true, type: 'select' },
        { key: 'isEdited', label: '剪辑状态', filterable: true, type: 'select' },
        { key: 'remark', label: '备注', filterable: true, type: 'text' },
        { key: 'createdAt', label: '新增时间', filterable: true, type: 'date' },
    ],

    adminExtraColumns: [
        { key: 'copyTitleContent', label: '复制', action: 'copy' },
    ],

    init() {
        this.bindEvents();
        this.render();
    },

    // 判断当前是否管理员
    isAdmin() {
        return Auth.isAdmin();
    },

    // 剪辑岗位只能查看，不能增删改；文案岗位和运营岗位和管理员可以编辑
    canEdit() {
        if (this.isAdmin()) return true;
        const user = Auth.getCurrentUser();
        if (!user || !user.positions) return true; // 未设置岗位默认允许
        const positions = user.positions;
        // 仅有剪辑岗位、没有文案和运营 → 只读
        if (positions.includes('剪辑') && !positions.includes('文案') && !positions.includes('运营')) return false;
        return true;
    },

    // 文案岗位和运营岗位和管理员可以发布视频（切换发布状态）
    canPublish() {
        if (this.isAdmin()) return true;
        const user = Auth.getCurrentUser();
        if (!user || !user.positions) return true;
        return user.positions.includes('文案') || user.positions.includes('运营');
    },

    // 剪辑岗位和运营岗位和管理员可以标记已剪辑
    canMarkEdited() {
        if (this.isAdmin()) return true;
        const user = Auth.getCurrentUser();
        if (!user || !user.positions) return true;
        return user.positions.includes('剪辑') || user.positions.includes('运营');
    },

    // 获取当前用户可访问的子账号 ID 列表
    getAccessibleSubAccountIds() {
        return Auth.getAccessibleSubAccounts();
    },

    // 获取子账号名称（兼容 id 为字符串/数字的历史数据）
    getSubAccountName(id) {
        const acc = MOCK_DATA.subAccounts.find(a => String(a.id) === String(id));
        return acc ? acc.name : '未知账号';
    },

    // 自动绑定剪辑人：查找分配到该子账号且有「剪辑」或「运营」岗位的员工
    getAutoEditorName(subAccountId) {
        if (!subAccountId) return '';
        const employees = MOCK_AUTH_DATA.employees.filter(emp => {
            if (emp.status !== 'active') return false;
            const subAccounts = emp.subAccounts || [];
            if (!subAccounts.includes(subAccountId)) return false;
            const positions = emp.positions || [];
            return positions.includes('剪辑') || positions.includes('运营');
        });
        return employees.map(e => e.name).join('、') || '';
    },

    // 自动绑定文案专员：查找分配到该子账号且有「文案」或「运营」岗位的员工
    getAutoCopywriterName(subAccountId) {
        if (!subAccountId) return '';
        const employees = MOCK_AUTH_DATA.employees.filter(emp => {
            if (emp.status !== 'active') return false;
            const subAccounts = emp.subAccounts || [];
            if (!subAccounts.includes(subAccountId)) return false;
            const positions = emp.positions || [];
            return positions.includes('文案') || positions.includes('运营');
        });
        return employees.map(e => e.name).join('、') || '';
    },

    // 获取所有可选项（含自动从数据提取 + 管理员配置）
    getFilterOptions(key) {
        const config = MOCK_DATA.copyLibraryFilterOptions || {};
        let configured = [];
        if (key === 'category') configured = config.category || [];
        if (key === 'isPublished') configured = config.isPublished || [];
        if (key === 'editor') configured = config.editor || [];

        // 自动从现有数据中提取（去重）
        const extracted = new Set();
        if (key === 'subAccountId') {
            const accessibleIds = this.getAccessibleSubAccountIds();
            MOCK_DATA.subAccounts.forEach(a => {
                if (this.isAdmin() || accessibleIds.includes(a.id)) extracted.add(a.name);
            });
        } else if (key === 'dayOfWeek') {
            ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'].forEach(v => extracted.add(v));
        } else if (key === 'editor') {
            // 从所有子账号的自动绑定中提取剪辑人名
            MOCK_DATA.copyLibrary.forEach(item => {
                const name = this.getAutoEditorName(item.subAccountId);
                if (name) name.split('、').forEach(n => extracted.add(n));
            });
            configured.forEach(v => extracted.add(v));
        } else if (key === 'copywriter') {
            // 从所有子账号的自动绑定中提取文案专员名
            MOCK_DATA.copyLibrary.forEach(item => {
                const name = this.getAutoCopywriterName(item.subAccountId);
                if (name) name.split('、').forEach(n => extracted.add(n));
            });
        } else if (key === 'isPublished') {
            extracted.add('已发布');
            extracted.add('未发布');
        } else if (key === 'isEdited') {
            extracted.add('已剪辑');
            extracted.add('未剪辑');
        } else if (key === 'category') {
            MOCK_DATA.copyLibrary.forEach(item => {
                if (item.category) extracted.add(item.category);
            });
            configured.forEach(v => extracted.add(v));
        } else {
            configured.forEach(v => extracted.add(v));
        }

        // 合并配置项和自动提取项，保持配置项在前
        const result = [];
        configured.forEach(v => { if (!result.includes(v)) result.push(v); });
        extracted.forEach(v => { if (!result.includes(v)) result.push(v); });
        return result.filter(v => v !== undefined && v !== null && v !== '');
    },

    // 获取已筛选 + 权限过滤后的数据
    getFilteredData() {
        const isAdmin = this.isAdmin();
        const accessibleIds = this.getAccessibleSubAccountIds();
        const user = Auth.getCurrentUser();
        const currentUserId = user && user.id;
        const filter = state.copyLibraryFilter || {};

        const filtered = MOCK_DATA.copyLibrary.filter(item => {
            // 权限过滤：非管理员只能看分配的子账号，或被转交/归属给自己的文案
            if (!isAdmin) {
                const accessible = accessibleIds.includes(item.subAccountId);
                const isOwner = item.ownerId && String(item.ownerId) === String(currentUserId);
                if (!accessible && !isOwner) return false;
            }

            // 逐列筛选
            for (const col of this.columns) {
                if (!filter[col.key]) continue;
                const value = this.getDisplayValue(item, col.key);
                const filterValue = filter[col.key].toString().trim().toLowerCase();
                if (!filterValue) continue;
                if (col.type === 'text') {
                    if (!value.toLowerCase().includes(filterValue)) return false;
                } else if (col.type === 'date') {
                    if (value !== filterValue) return false;
                } else {
                    if (value !== filterValue) return false;
                }
            }
            return true;
        });

        // 排序：当天优先，其余按日期升序（从之前到现在）
        const today = new Date().toISOString().slice(0, 10);
        filtered.sort((a, b) => {
            if (state.copyLibraryTodayFirst) {
                const aToday = (a.publishDate === today) ? 0 : 1;
                const bToday = (b.publishDate === today) ? 0 : 1;
                if (aToday !== bToday) return aToday - bToday;
            }
            // 日期升序：从之前到现在
            const dateA = new Date(a.publishDate || '1970-01-01');
            const dateB = new Date(b.publishDate || '1970-01-01');
            return dateA - dateB;
        });

        return filtered;
    },

    // 显示值转换
    getDisplayValue(item, key) {
        if (key === 'subAccountId') return this.getSubAccountName(item.subAccountId);
        if (key === 'isPublished') return item.isPublished ? '已发布' : '未发布';
        if (key === 'isEdited') return item.isEdited ? '已剪辑' : '未剪辑';
        if (key === 'dayOfWeek') return item.dayOfWeek || this.calcDayOfWeek(item.publishDate);
        if (key === 'editor') {
            // 自动绑定：优先显示子账号对应的剪辑/运营岗位员工
            const autoName = this.getAutoEditorName(item.subAccountId);
            return autoName || item.editor || '';
        }
        if (key === 'copywriter') {
            // 自动绑定：显示子账号对应的文案/运营岗位员工
            return this.getAutoCopywriterName(item.subAccountId);
        }
        if (key === 'benchmark') {
            return item.benchmark || '';
        }
        return item[key] || '';
    },

    // 根据日期计算星期
    calcDayOfWeek(dateStr) {
        if (!dateStr) return '';
        const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return days[d.getDay()];
    },

    // 获取剪辑负责人姓名：仅当创建者被标注为「剪辑」岗位时返回其姓名
    getEditorInChargeName(item) {
        if (!item.createdBy) return '';
        const empId = typeof item.createdBy === 'number' ? item.createdBy : parseInt(item.createdBy);
        const emp = MOCK_AUTH_DATA.employees.find(e => e.id === empId);
        if (emp && (emp.positions || []).includes('剪辑')) {
            return emp.name;
        }
        return '';
    },

    // 渲染整个模块
    render() {
        this.renderToolbar();
        this.renderFilterArea();
        this.renderTable();
        this.renderSummary();
    },

    renderToolbar() {
        const configBtn = document.getElementById('copy-filter-config-btn');
        if (configBtn) configBtn.style.display = this.isAdmin() ? 'inline-block' : 'none';

        // 剪辑岗位隐藏新增/批量按钮
        const canEdit = this.canEdit();
        const addBtn = document.getElementById('copy-add-btn');
        const batchBtn = document.getElementById('copy-batch-btn');
        const batchDelBtn = document.getElementById('copy-batch-delete-btn');
        if (addBtn) addBtn.style.display = canEdit ? 'inline-block' : 'none';
        if (batchBtn) batchBtn.style.display = canEdit ? 'inline-block' : 'none';
        if (batchDelBtn) batchDelBtn.style.display = canEdit ? 'inline-block' : 'none';
        this.updateBatchDeleteBtn();
    },

    renderFilterArea() {
        const grid = document.getElementById('copy-filter-grid');
        if (!grid) return;
        grid.innerHTML = '';

        const filter = state.copyLibraryFilter || {};
        this.columns.forEach(col => {
            if (!col.filterable) return;
            let inputHtml = '';
            if (col.type === 'select') {
                const options = this.getFilterOptions(col.key);
                inputHtml = `<select class="form-select copy-filter-input" data-key="${col.key}">
                    <option value="">全部</option>
                    ${options.map(opt => `<option value="${this.escapeHtml(opt)}" ${filter[col.key] === opt ? 'selected' : ''}>${this.escapeHtml(opt)}</option>`).join('')}
                </select>`;
            } else if (col.type === 'date') {
                inputHtml = `<input type="date" class="form-input copy-filter-input" data-key="${col.key}" value="${filter[col.key] || ''}" />`;
            } else {
                inputHtml = `<input type="text" class="form-input copy-filter-input" data-key="${col.key}" value="${filter[col.key] || ''}" placeholder="输入关键词" />`;
            }
            grid.innerHTML += `
                <div class="copy-filter-item">
                    <label>${col.label}</label>
                    ${inputHtml}
                </div>
            `;
        });
    },

    renderTable() {
        const thead = document.getElementById('copy-library-thead');
        const tbody = document.getElementById('copy-library-tbody');
        if (!thead || !tbody) return;

        const isAdmin = this.isAdmin();
        const canEdit = this.canEdit();
        let headerRow = '<tr>';
        if (canEdit) headerRow += '<th style="width:36px;text-align:center;"><input type="checkbox" id="copy-select-all" title="全选" /></th>';
        this.columns.forEach(col => {
            headerRow += `<th>${col.label}</th>`;
        });
        if (isAdmin) {
            this.adminExtraColumns.forEach(col => {
                headerRow += `<th class="copy-admin-extra-header">${col.label}</th>`;
            });
        }
        headerRow += '<th style="min-width:160px;">操作</th></tr>';
        thead.innerHTML = headerRow;

        const data = this.getFilteredData();
        tbody.innerHTML = '';

        if (data.length === 0) {
            const colCount = this.columns.length + (isAdmin ? this.adminExtraColumns.length : 0) + 1 + (canEdit ? 1 : 0);
            const emptyMsg = this.canEdit()
                ? '暂无文案，点击上方"+ 新增文案"添加'
                : '暂无文案';
            tbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center;padding:40px;color:var(--color-text-light);">${emptyMsg}</td></tr>`;
            return;
        }

        const canPublish = this.canPublish();
        const canMarkEdited = this.canMarkEdited();

        data.forEach(item => {
            let tr = '<tr>';
            if (canEdit) tr += `<td style="text-align:center;"><input type="checkbox" class="copy-row-check" data-id="${item.id}" /></td>`;
            this.columns.forEach(col => {
                let value = this.getDisplayValue(item, col.key);
                let cellContent = this.escapeHtml(value.toString());
                if (col.key === 'isPublished') {
                    cellContent = item.isPublished
                        ? '<span class="tag tag-success">已发布</span>'
                        : '<span class="tag tag-info">未发布</span>';
                }
                if (col.key === 'isEdited') {
                    cellContent = item.isEdited
                        ? '<span class="tag tag-primary">已剪辑</span>'
                        : '<span class="tag tag-light">未剪辑</span>';
                }
                if (col.key === 'content') {
                    cellContent = `<div class="copy-content-cell" title="${this.escapeHtml(value)}">${this.escapeHtml(value.length > 80 ? value.substring(0, 80) + '...' : value)}</div>`;
                }
                if (col.key === 'title') {
                    cellContent = `<strong>${this.escapeHtml(value)}</strong>`;
                }
                if (col.key === 'benchmark') {
                    if (value && value.toString().trim()) {
                        const url = this.escapeHtml(value.toString().trim());
                        cellContent = `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:var(--color-primary);text-decoration:underline;word-break:break-all;">${url}</a>`;
                    } else {
                        cellContent = '<span style="color:var(--color-text-light);">—</span>';
                    }
                }
                if (col.key === 'editor' || col.key === 'copywriter') {
                    cellContent = value
                        ? `<span style="font-size:12px;">${this.escapeHtml(value)}</span>`
                        : '<span style="color:var(--color-text-light);">—</span>';
                }
                tr += `<td>${cellContent}</td>`;
            });

            // 操作列：按岗位显示不同按钮
            let actions = '';
            // 复制标题和文案（所有角色可见）
            actions += `<button class="btn btn-sm btn-outline" onclick="CopyLibrary.copyTitleContent(${item.id})" title="复制标题和文案">复制</button>`;
            // 申请帮剪/帮写按钮（按当前用户岗位）
            const reqTypes = CopyLibraryRequest.getAvailableRequestTypes();
            if (reqTypes.length > 0) {
                if (reqTypes.includes('edit')) {
                    actions += `<button class="btn btn-sm btn-outline" onclick="CopyLibraryRequest.quickApply(${item.id}, 'edit')" title="申请帮剪">申请帮剪</button>`;
                }
                if (reqTypes.includes('write')) {
                    actions += ` <button class="btn btn-sm btn-outline" onclick="CopyLibraryRequest.quickApply(${item.id}, 'write')" title="申请帮写">申请帮写</button>`;
                }
            }
            if (canEdit) {
                actions += ` <button class="btn btn-sm btn-outline" onclick="CopyLibrary.edit(${item.id})">编辑</button>`;
            }
            if (canPublish) {
                actions += ` <button class="btn btn-sm ${item.isPublished ? 'btn-outline' : 'btn-success'}" onclick="CopyLibrary.togglePublish(${item.id})" title="${item.isPublished ? '取消发布' : '发布'}">${item.isPublished ? '取消发布' : '发布'}</button>`;
            }
            if (canMarkEdited) {
                actions += ` <button class="btn btn-sm ${item.isEdited ? 'btn-outline' : 'btn-primary'}" onclick="CopyLibrary.toggleEdited(${item.id})" title="${item.isEdited ? '取消剪辑' : '已剪辑'}">${item.isEdited ? '取消剪辑' : '已剪辑'}</button>`;
            }
            if (canEdit) {
                actions += ` <button class="btn-icon" onclick="CopyLibrary.delete(${item.id})" title="删除">✕</button>`;
            }
            if (!actions) {
                actions = '<span style="color:var(--color-text-light);">—</span>';
            }
            tr += `<td>${actions}</td>`;
            tr += '</tr>';
            tbody.innerHTML += tr;
        });
        this.updateBatchDeleteBtn();
    },

    renderSummary() {
        const total = this.getFilteredData().length;
        const edited = this.getFilteredData().filter(item => item.isEdited).length;
        const countEl = document.getElementById('copy-count');
        const pubEl = document.getElementById('copy-published-count');
        if (countEl) countEl.textContent = total;
        if (pubEl) pubEl.textContent = edited;
    },

    // 生成今日工作报告文本（用于一键复制）
    generateDailyReport() {
        const user = Auth.getCurrentUser();
        if (!user) return '';
        const today = new Date().toISOString().slice(0, 10);
        const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][new Date().getDay()];
        const userId = user.id;
        const isAdmin = user.role === 'admin';

        // 1. 今日文案撰写：当前用户今日新增的文案，按子账号统计
        const todayCopies = MOCK_DATA.copyLibrary.filter(c => {
            const created = c.createdAt ? c.createdAt.slice(0, 10) : '';
            return created === today && (isAdmin || String(c.createdBy) === String(userId));
        });
        const copyCountBySub = {};
        todayCopies.forEach(c => {
            const sid = String(c.subAccountId);
            copyCountBySub[sid] = (copyCountBySub[sid] || 0) + 1;
        });

        // 2. 今日视频发布情况：按子账号统计今日是否有已发布文案
        const accessibleIds = Auth.getAccessibleSubAccounts().map(id => String(id));
        const todayPublished = MOCK_DATA.copyLibrary.filter(c =>
            c.publishDate === today && c.isPublished &&
            (isAdmin || accessibleIds.includes(String(c.subAccountId)))
        );
        const pubStatusBySub = {};
        MOCK_DATA.subAccounts.forEach(acc => {
            if (isAdmin || accessibleIds.includes(String(acc.id))) {
                const hasPublished = todayPublished.some(c => String(c.subAccountId) === String(acc.id));
                pubStatusBySub[acc.id] = hasPublished ? '已发布' : '未发布';
            }
        });

        // 3. 今日短视频预警：当前用户可访问子账号的今日记录
        const todayAlerts = MOCK_DATA.shortVideoAlerts.filter(a =>
            a.date === today && (isAdmin || accessibleIds.includes(String(a.subAccountId)))
        );
        const alertBySub = {};
        todayAlerts.forEach(a => {
            const sid = String(a.subAccountId);
            if (!alertBySub[sid]) alertBySub[sid] = { views: 0, comments: 0, messages: 0, leads: 0, count: 0 };
            alertBySub[sid].views += parseInt(a.views) || 0;
            alertBySub[sid].comments += parseInt(a.comments) || 0;
            alertBySub[sid].messages += parseInt(a.messages) || 0;
            alertBySub[sid].leads += parseInt(a.leads) || 0;
            alertBySub[sid].count += 1;
        });

        // 组装文本
        let lines = [];
        lines.push(`${today} ${weekday} 工作日报`);
        lines.push(`汇报人：${user.name}`);
        lines.push('');

        // 文案
        lines.push('【文案工作】');
        if (todayCopies.length === 0) {
            lines.push('今日未新增文案。');
        } else {
            lines.push(`今日共新增 ${todayCopies.length} 条文案：`);
            Object.entries(copyCountBySub).forEach(([sid, count]) => {
                const name = this.getSubAccountName(sid);
                lines.push(`- ${name}：${count} 条`);
            });
        }
        lines.push('');

        // 今日视频发布情况
        lines.push('【今日视频发布情况】');
        const pubSubIds = Object.keys(pubStatusBySub);
        if (pubSubIds.length === 0) {
            lines.push('今日暂无子账号数据。');
        } else {
            pubSubIds.forEach(sid => {
                lines.push(`- ${this.getSubAccountName(sid)}，今日状态：${pubStatusBySub[sid]}`);
            });
        }
        lines.push('');

        // 短视频预警
        lines.push('【短视频预警·今日上传情况】');
        if (todayAlerts.length === 0) {
            lines.push('今日暂无短视频预警记录。');
        } else {
            lines.push(`今日共 ${todayAlerts.length} 条记录：`);
            Object.entries(alertBySub).forEach(([sid, data]) => {
                const name = this.getSubAccountName(sid);
                lines.push(`- ${name}（${data.count} 条）：播放量 ${data.views}，评论 ${data.comments}，私信 ${data.messages}，留资 ${data.leads}`);
            });
        }

        return lines.join('\n');
    },

    // 一键复制今日报告到剪贴板
    copyDailyReport() {
        const text = this.generateDailyReport();
        if (!text) {
            showToast('无法生成报告，请确认已登录', 'error');
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('今日报告已复制到剪贴板', 'success');
            }).catch(() => {
                this._fallbackCopy(text);
            });
        } else {
            this._fallbackCopy(text);
        }
    },

    _fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('今日报告已复制到剪贴板', 'success');
        } catch (e) {
            showToast('复制失败，请手动复制', 'error');
        }
        document.body.removeChild(ta);
    },

    bindEvents() {
        // 新增按钮
        const addBtn = document.getElementById('copy-add-btn');
        if (addBtn) addBtn.addEventListener('click', () => this.showForm());

        // 筛选区开关
        const filterToggle = document.getElementById('copy-filter-toggle-btn');
        const filterArea = document.getElementById('copy-filter-area');
        if (filterToggle && filterArea) {
            filterToggle.addEventListener('click', () => {
                filterArea.style.display = filterArea.style.display === 'none' ? 'block' : 'none';
            });
        }

        // 应用筛选 / 重置
        const applyBtn = document.getElementById('copy-filter-apply-btn');
        const resetBtn = document.getElementById('copy-filter-reset-btn');
        if (applyBtn) applyBtn.addEventListener('click', () => this.applyFilter());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetFilter());

        // 导出
        const exportBtn = document.getElementById('copy-export-btn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportExcel());

        // 每日报告
        const dailyReportBtn = document.getElementById('copy-daily-report-btn');
        if (dailyReportBtn) dailyReportBtn.addEventListener('click', () => this.copyDailyReport());

        // 批量删除 + 行勾选
        const batchDelBtn = document.getElementById('copy-batch-delete-btn');
        if (batchDelBtn) batchDelBtn.addEventListener('click', () => this.batchDelete());
        const table = document.getElementById('copy-library-table');
        if (table) {
            table.addEventListener('change', (e) => {
                if (e.target && e.target.id === 'copy-select-all') {
                    const checked = e.target.checked;
                    table.querySelectorAll('.copy-row-check').forEach(cb => { cb.checked = checked; });
                    this.updateBatchDeleteBtn();
                } else if (e.target && e.target.classList && e.target.classList.contains('copy-row-check')) {
                    const all = table.querySelectorAll('.copy-row-check');
                    const sel = table.querySelectorAll('.copy-row-check:checked');
                    const sa = document.getElementById('copy-select-all');
                    if (sa) sa.checked = all.length > 0 && all.length === sel.length;
                    this.updateBatchDeleteBtn();
                }
            });
        }

        // 表单保存/取消
        const saveBtn = document.getElementById('copy-form-save-btn');
        const cancelBtn = document.getElementById('copy-form-cancel-btn');
        const closeBtn = document.getElementById('copy-form-close-btn');
        const modal = document.getElementById('copy-form-modal');
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveForm());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideForm());
        if (closeBtn) closeBtn.addEventListener('click', () => this.hideForm());
        if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) this.hideForm(); });

        // 批量添加
        const batchBtn = document.getElementById('copy-batch-btn');
        if (batchBtn) batchBtn.addEventListener('click', () => this.showBatchForm());
        const batchSaveBtn = document.getElementById('copy-batch-save-btn');
        const batchCancelBtn = document.getElementById('copy-batch-cancel-btn');
        const batchCloseBtn = document.getElementById('copy-batch-close-btn');
        const batchModal = document.getElementById('copy-batch-modal');
        if (batchSaveBtn) batchSaveBtn.addEventListener('click', () => this.saveBatchForm());
        if (batchCancelBtn) batchCancelBtn.addEventListener('click', () => this.hideBatchForm());
        if (batchCloseBtn) batchCloseBtn.addEventListener('click', () => this.hideBatchForm());
        if (batchModal) batchModal.addEventListener('click', (e) => { if (e.target === batchModal) this.hideBatchForm(); });

        // 发布日期联动星期
        const dateInput = document.getElementById('copy-form-publish-date');
        if (dateInput) {
            dateInput.addEventListener('change', () => {
                const dayInput = document.getElementById('copy-form-day-of-week');
                if (dayInput) dayInput.value = this.calcDayOfWeek(dateInput.value);
            });
        }

        // 子账号选择联动剪辑人自动填充
        const subAccountSelect = document.getElementById('copy-form-sub-account');
        if (subAccountSelect) {
            subAccountSelect.addEventListener('change', () => {
                const subId = parseInt(subAccountSelect.value) || 0;
                const editorInput = document.getElementById('copy-form-editor');
                if (editorInput && subId) {
                    const autoEditor = this.getAutoEditorName(subId);
                    if (autoEditor) editorInput.value = autoEditor;
                }
            });
        }

        // 管理员筛选配置
        const configBtn = document.getElementById('copy-filter-config-btn');
        const configModal = document.getElementById('copy-filter-config-modal');
        const configClose = document.getElementById('copy-filter-config-close-btn');
        const configSave = document.getElementById('copy-filter-config-save-btn');
        const configCancel = document.getElementById('copy-filter-config-cancel-btn');
        if (configBtn) configBtn.addEventListener('click', () => this.showFilterConfig());
        if (configClose) configClose.addEventListener('click', () => this.hideFilterConfig());
        if (configCancel) configCancel.addEventListener('click', () => this.hideFilterConfig());
        if (configSave) configSave.addEventListener('click', () => this.saveFilterConfig());
        if (configModal) configModal.addEventListener('click', (e) => { if (e.target === configModal) this.hideFilterConfig(); });
    },

    applyFilter() {
        const inputs = document.querySelectorAll('.copy-filter-input');
        state.copyLibraryFilter = {};
        inputs.forEach(input => {
            const key = input.dataset.key;
            const value = input.value.trim();
            if (value) state.copyLibraryFilter[key] = value;
        });
        this.renderTable();
        this.renderSummary();
        showToast('筛选已应用', 'success');
    },

    resetFilter() {
        state.copyLibraryFilter = {};
        this.renderFilterArea();
        this.renderTable();
        this.renderSummary();
    },

    // 填充表单下拉选项
    populateFormOptions() {
        const subSelect = document.getElementById('copy-form-sub-account');
        const categorySelect = document.getElementById('copy-form-category');
        const isPublishedSelect = document.getElementById('copy-form-is-published');
        const editorInput = document.getElementById('copy-form-editor');
        if (!subSelect || !categorySelect) return;

        const isAdmin = this.isAdmin();
        const accessibleIds = this.getAccessibleSubAccountIds();

        // 子账号选项
        let subOptions = '<option value="">请选择子账号</option>';
        MOCK_DATA.subAccounts.forEach(acc => {
            if (isAdmin || accessibleIds.includes(acc.id)) {
                subOptions += `<option value="${acc.id}">${this.escapeHtml(acc.name)}</option>`;
            }
        });
        subSelect.innerHTML = subOptions;

        // 分类选项
        const categories = this.getFilterOptions('category');
        let catOptions = '<option value="">请选择分类</option>';
        categories.forEach(cat => {
            catOptions += `<option value="${this.escapeHtml(cat)}">${this.escapeHtml(cat)}</option>`;
        });
        categorySelect.innerHTML = catOptions;

        // 是否发布
        if (isPublishedSelect) {
            isPublishedSelect.innerHTML = `
                <option value="false">未发布</option>
                <option value="true">已发布</option>
            `;
        }

        // 剪辑人自动补全选项（datalist）
        if (editorInput) {
            const editors = this.getFilterOptions('editor');
            let datalist = document.getElementById('copy-editor-datalist');
            if (!datalist) {
                datalist = document.createElement('datalist');
                datalist.id = 'copy-editor-datalist';
                document.body.appendChild(datalist);
            }
            datalist.innerHTML = editors.map(e => `<option value="${this.escapeHtml(e)}">`).join('');
            editorInput.setAttribute('list', 'copy-editor-datalist');
        }
    },

    showForm(itemId = null) {
        this.editingId = itemId;
        this.populateFormOptions();
        const modal = document.getElementById('copy-form-modal');
        const title = document.getElementById('copy-form-title');
        if (!modal) return;

        modal.style.display = 'flex';
        title.textContent = itemId ? '编辑文案' : '新增文案';

        const user = Auth.getCurrentUser();
        // 管理员专属字段显示
        const adminFields = document.querySelectorAll('.admin-only-copy-fields');
        adminFields.forEach(el => el.style.display = this.isAdmin() ? 'block' : 'none');

        if (itemId) {
            const item = MOCK_DATA.copyLibrary.find(i => i.id === itemId);
            if (!item) return;
            document.getElementById('copy-form-publish-date').value = item.publishDate || '';
            document.getElementById('copy-form-day-of-week').value = item.dayOfWeek || this.calcDayOfWeek(item.publishDate);
            document.getElementById('copy-form-sub-account').value = item.subAccountId || '';
            document.getElementById('copy-form-category').value = item.category || '';
            document.getElementById('copy-form-title-input').value = item.title || '';
            document.getElementById('copy-form-benchmark').value = item.benchmark || '';
            document.getElementById('copy-form-content').value = item.content || '';
            document.getElementById('copy-form-editor').value = item.editor || '';
            document.getElementById('copy-form-is-published').value = item.isPublished ? 'true' : 'false';
            document.getElementById('copy-form-remark').value = item.remark || '';
        } else {
            document.getElementById('copy-form-publish-date').value = '';
            document.getElementById('copy-form-day-of-week').value = '';
            document.getElementById('copy-form-sub-account').value = '';
            document.getElementById('copy-form-category').value = '';
            document.getElementById('copy-form-title-input').value = '';
            document.getElementById('copy-form-benchmark').value = '';
            document.getElementById('copy-form-content').value = '';
            document.getElementById('copy-form-editor').value = '';
            document.getElementById('copy-form-is-published').value = 'false';
            document.getElementById('copy-form-remark').value = '';
        }
    },

    hideForm() {
        const modal = document.getElementById('copy-form-modal');
        if (modal) modal.style.display = 'none';
        this.editingId = null;
    },

    // ===== 批量添加 =====

    showBatchForm() {
        if (!this.canEdit()) {
            showToast('您没有添加文案的权限', 'error');
            return;
        }
        // 填充子账号和分类选项
        const subSelect = document.getElementById('copy-batch-sub-account');
        const categorySelect = document.getElementById('copy-batch-category');
        const isAdmin = this.isAdmin();
        const accessibleIds = this.getAccessibleSubAccountIds();

        if (subSelect) {
            let subOptions = '<option value="">请选择子账号</option>';
            MOCK_DATA.subAccounts.forEach(acc => {
                if (isAdmin || accessibleIds.includes(acc.id)) {
                    subOptions += `<option value="${acc.id}">${this.escapeHtml(acc.name)}</option>`;
                }
            });
            subSelect.innerHTML = subOptions;
        }
        if (categorySelect) {
            const categories = this.getFilterOptions('category');
            let catOptions = '<option value="">请选择分类</option>';
            categories.forEach(cat => {
                catOptions += `<option value="${this.escapeHtml(cat)}">${this.escapeHtml(cat)}</option>`;
            });
            categorySelect.innerHTML = catOptions;
        }

        // 默认日期为今天
        const dateInput = document.getElementById('copy-batch-date');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().slice(0, 10);
        }
        document.getElementById('copy-batch-content').value = '';
        document.getElementById('copy-batch-published').value = 'false';

        const modal = document.getElementById('copy-batch-modal');
        if (modal) modal.style.display = 'flex';
    },

    hideBatchForm() {
        const modal = document.getElementById('copy-batch-modal');
        if (modal) modal.style.display = 'none';
    },

    saveBatchForm() {
        const date = document.getElementById('copy-batch-date').value.trim();
        const subAccountId = parseInt(document.getElementById('copy-batch-sub-account').value) || 0;
        const category = document.getElementById('copy-batch-category').value.trim();
        const isPublished = document.getElementById('copy-batch-published').value === 'true';
        const content = document.getElementById('copy-batch-content').value.trim();

        if (!date || !subAccountId) {
            showToast('请选择发布日期和子账号', 'warning');
            return;
        }
        if (!content) {
            showToast('请输入文案内容', 'warning');
            return;
        }

        // 权限校验
        const accessibleIds = this.getAccessibleSubAccountIds();
        if (!this.isAdmin() && !accessibleIds.includes(subAccountId)) {
            showToast('您没有权限操作该子账号', 'error');
            return;
        }

        const user = Auth.getCurrentUser();
        const dayOfWeek = this.calcDayOfWeek(date);
        const now = new Date().toISOString();
        let nextId = Math.max(...MOCK_DATA.copyLibrary.map(i => i.id), 0) + 1;
        let added = 0;

        // 逐行解析：标题 | 内容
        const lines = content.split('\n');
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            const sepIdx = trimmed.indexOf('|');
            let title, copyContent;
            if (sepIdx > 0) {
                title = trimmed.substring(0, sepIdx).trim();
                copyContent = trimmed.substring(sepIdx + 1).trim();
            } else {
                title = trimmed;
                copyContent = trimmed;
            }
            if (!title) return;

            MOCK_DATA.copyLibrary.push({
                id: nextId++,
                publishDate: date,
                dayOfWeek,
                subAccountId,
                category: category || '',
                title,
                content: copyContent,
                editor: user && user.name ? user.name : '',
                isPublished,
                isEdited: false,
                remark: '',
                createdAt: now,
                createdBy: user && user.id ? user.id : (user && user.role === 'admin' ? 'admin' : 0),
                createdByName: user ? user.name : '',
            });
            added++;
        });

        if (added > 0) {
            DataStore.saveCopyLibrary();
            this.hideBatchForm();
            this.render();
            showToast(`成功添加 ${added} 条文案`, 'success');
        } else {
            showToast('未解析到有效文案，请检查格式', 'warning');
        }
    },

    saveForm() {
        const publishDate = document.getElementById('copy-form-publish-date').value.trim();
        const subAccountId = parseInt(document.getElementById('copy-form-sub-account').value) || 0;
        const category = document.getElementById('copy-form-category').value.trim();
        const title = document.getElementById('copy-form-title-input').value.trim();
        const benchmark = document.getElementById('copy-form-benchmark').value.trim();
        const content = document.getElementById('copy-form-content').value.trim();
        const editor = document.getElementById('copy-form-editor').value.trim();
        const isPublished = document.getElementById('copy-form-is-published').value === 'true';
        const remark = document.getElementById('copy-form-remark').value.trim();

        if (!publishDate || !subAccountId || !category || !title || !content) {
            showToast('请填写必填项（发布时期、子账号、分类、标题、文案）', 'warning');
            return;
        }

        const user = Auth.getCurrentUser();
        const accessibleIds = this.getAccessibleSubAccountIds();
        const editingItem = this.editingId ? MOCK_DATA.copyLibrary.find(i => i.id === this.editingId) : null;
        const isOwner = editingItem && editingItem.ownerId && String(editingItem.ownerId) === String(user && user.id);
        if (!this.isAdmin() && !accessibleIds.includes(subAccountId) && !isOwner) {
            showToast('您没有权限操作该子账号', 'error');
            return;
        }

        const dayOfWeek = this.calcDayOfWeek(publishDate);
        const now = new Date().toISOString();

        if (this.editingId) {
            const item = MOCK_DATA.copyLibrary.find(i => i.id === this.editingId);
            if (!item) return;
            item.publishDate = publishDate;
            item.dayOfWeek = dayOfWeek;
            item.subAccountId = subAccountId;
            item.category = category;
            item.title = title;
            item.benchmark = benchmark;
            item.content = content;
            item.editor = editor;
            item.isPublished = isPublished;
            item.remark = remark;
            showToast('文案已更新', 'success');
        } else {
            const newId = Math.max(...MOCK_DATA.copyLibrary.map(i => i.id), 0) + 1;
            MOCK_DATA.copyLibrary.push({
                id: newId,
                publishDate,
                dayOfWeek,
                subAccountId,
                category,
                title,
                benchmark,
                content,
                editor,
                isPublished,
                isEdited: false,
                remark,
                createdAt: now,
                createdBy: user && user.id ? user.id : (user && user.role === 'admin' ? 'admin' : 0),
                createdByName: user ? user.name : '',
                // 归属员工：普通员工新建的文案归属自己，管理员新建的不专属
                ownerId: (user && user.role !== 'admin' && user.id) ? user.id : 0,
            });
            // 新增文案后，当天优先显示
            state.copyLibraryTodayFirst = true;
            showToast('文案已新增', 'success');
        }

        DataStore.saveCopyLibrary();
        this.hideForm();
        this.render();
    },

    edit(id) {
        const item = MOCK_DATA.copyLibrary.find(i => i.id === id);
        if (!item) return;
        if (!this.canEdit()) {
            showToast('您没有编辑权限', 'error');
            return;
        }
        const user = Auth.getCurrentUser();
        const currentUserId = user && user.id;
        const isOwner = item.ownerId && String(item.ownerId) === String(currentUserId);
        if (!this.isAdmin() && !this.getAccessibleSubAccountIds().includes(item.subAccountId) && !isOwner) {
            showToast('您没有权限编辑该文案', 'error');
            return;
        }
        this.showForm(id);
    },

    delete(id) {
        const item = MOCK_DATA.copyLibrary.find(i => i.id === id);
        if (!item) return;
        const user = Auth.getCurrentUser();
        const currentUserId = user && user.id;
        const isOwner = item.ownerId && String(item.ownerId) === String(currentUserId);
        if (!this.isAdmin() && !this.getAccessibleSubAccountIds().includes(item.subAccountId) && !isOwner) {
            showToast('您没有权限删除该文案', 'error');
            return;
        }
        if (!this.canEdit()) {
            showToast('您没有编辑权限', 'error');
            return;
        }
        if (!confirm('确定要删除该文案吗？')) return;
        const index = MOCK_DATA.copyLibrary.findIndex(i => i.id === id);
        if (index >= 0) {
            MOCK_DATA.copyLibrary.splice(index, 1);
            DataStore.saveCopyLibrary();
            this.render();
            showToast('文案已删除', 'info');
        }
    },

    // 更新「批量删除」按钮状态（无勾选时禁用并显示数量）
    updateBatchDeleteBtn() {
        const btn = document.getElementById('copy-batch-delete-btn');
        if (!btn) return;
        const n = document.querySelectorAll('.copy-row-check:checked').length;
        btn.disabled = n === 0;
        btn.textContent = n > 0 ? `批量删除 (${n})` : '批量删除';
    },

    // 批量删除：删除所有勾选的文案（遵循单条删除的权限规则）
    batchDelete() {
        if (!this.canEdit()) {
            showToast('您没有编辑权限', 'error');
            return;
        }
        const table = document.getElementById('copy-library-table');
        if (!table) return;
        const checked = Array.from(table.querySelectorAll('.copy-row-check:checked'));
        if (checked.length === 0) {
            showToast('请先勾选要删除的文案', 'warning');
            return;
        }
        const ids = checked.map(c => parseInt(c.dataset.id, 10));
        const user = Auth.getCurrentUser();
        const currentUserId = user && user.id;
        const accessible = this.getAccessibleSubAccountIds();
        const deletable = [];
        const skipped = [];
        ids.forEach(id => {
            const item = MOCK_DATA.copyLibrary.find(i => i.id === id);
            if (!item) return;
            const isOwner = item.ownerId && String(item.ownerId) === String(currentUserId);
            if (this.isAdmin() || accessible.includes(item.subAccountId) || isOwner) {
                deletable.push(id);
            } else {
                skipped.push(item.title || id);
            }
        });
        if (deletable.length === 0) {
            showToast('所选文案均无删除权限', 'error');
            return;
        }
        const msg = skipped.length > 0
            ? `确定删除选中的 ${deletable.length} 条文案吗？\n（另有 ${skipped.length} 条无权限，将自动跳过）\n此操作不可撤销。`
            : `确定删除选中的 ${deletable.length} 条文案吗？此操作不可撤销。`;
        if (!confirm(msg)) return;
        const before = (MOCK_DATA.copyLibrary || []).length;
        MOCK_DATA.copyLibrary = (MOCK_DATA.copyLibrary || []).filter(i => !deletable.includes(i.id));
        const removed = before - (MOCK_DATA.copyLibrary || []).length;
        DataStore.saveCopyLibrary();
        this.render();
        showToast(`已删除 ${removed} 条文案` + (skipped.length ? `，${skipped.length} 条无权限已跳过` : ''), 'success');
    },

    // 快速切换发布状态（文案岗位和运营岗位和管理员可用）
    togglePublish(id) {
        const item = MOCK_DATA.copyLibrary.find(i => i.id === id);
        if (!item) return;
        if (!this.canPublish()) {
            showToast('您没有发布权限', 'error');
            return;
        }
        if (!this.isAdmin() && !this.getAccessibleSubAccountIds().includes(item.subAccountId)) {
            showToast('您没有权限操作该文案', 'error');
            return;
        }
        item.isPublished = !item.isPublished;
        DataStore.saveCopyLibrary();
        this.render();
        showToast(item.isPublished ? '已发布' : '已取消发布', 'success');
    },

    // 复制标题和文案到剪贴板
    copyTitleContent(id) {
        const item = MOCK_DATA.copyLibrary.find(i => i.id === id);
        if (!item) return;
        const text = `${item.title || ''}\n${item.content || ''}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('已复制标题和文案', 'success');
            }).catch(() => {
                this._fallbackCopy(text);
            });
        } else {
            this._fallbackCopy(text);
        }
    },

    _fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast('已复制标题和文案', 'success');
        } catch (e) {
            showToast('复制失败，请手动复制', 'error');
        }
        document.body.removeChild(textarea);
    },

    // 快速切换剪辑状态（剪辑岗位和运营岗位和管理员可用）
    toggleEdited(id) {
        const item = MOCK_DATA.copyLibrary.find(i => i.id === id);
        if (!item) return;
        if (!this.canMarkEdited()) {
            showToast('您没有标记剪辑权限', 'error');
            return;
        }
        if (!this.isAdmin() && !this.getAccessibleSubAccountIds().includes(item.subAccountId)) {
            showToast('您没有权限操作该文案', 'error');
            return;
        }
        item.isEdited = !item.isEdited;
        DataStore.saveCopyLibrary();
        this.render();
        showToast(item.isEdited ? '已标记为已剪辑' : '已取消剪辑', 'success');
    },

    exportExcel() {
        const data = this.getFilteredData();
        const headers = this.columns.map(c => c.label);
        const rows = data.map(item => {
            return this.columns.map(c => this.getDisplayValue(item, c.key));
        });
        const csv = [headers, ...rows].map(r => r.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `文案库_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
        link.click();
        showToast('文案库已导出', 'success');
    },

    // 管理员筛选配置
    showFilterConfig() {
        if (!this.isAdmin()) return;
        const config = MOCK_DATA.copyLibraryFilterOptions;
        document.getElementById('copy-config-category').value = (config.category || []).join('\n');
        document.getElementById('copy-config-is-published').value = (config.isPublished || []).join('\n');
        document.getElementById('copy-config-editor').value = (config.editor || []).join('\n');
        const modal = document.getElementById('copy-filter-config-modal');
        if (modal) modal.style.display = 'flex';
    },

    hideFilterConfig() {
        const modal = document.getElementById('copy-filter-config-modal');
        if (modal) modal.style.display = 'none';
    },

    saveFilterConfig() {
        const category = document.getElementById('copy-config-category').value.split('\n').map(s => s.trim()).filter(s => s);
        const isPublished = document.getElementById('copy-config-is-published').value.split('\n').map(s => s.trim()).filter(s => s);
        const editor = document.getElementById('copy-config-editor').value.split('\n').map(s => s.trim()).filter(s => s);
        MOCK_DATA.copyLibraryFilterOptions = { category, isPublished, editor };
        DataStore.saveCopyLibraryFilterOptions();
        this.hideFilterConfig();
        this.renderFilterArea();
        showToast('筛选选项配置已保存', 'success');
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return str.toString().replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
    },
};

/* ============================================================
   模块：剪辑工作表
   员工每日自填剪辑产量、时长分布、各子账号发布数
   ============================================================ */
/* ============================================================
   模块：剪辑员工工资管理（剪辑工作表的时长区间、基数、每日工作量配置）
   ============================================================ */
const ClipWorkSettings = {
    init() {
        if (!Auth.isAdmin()) return;
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        const saveBtn = document.getElementById('clip-ws-save');
        if (saveBtn) saveBtn.addEventListener('click', () => this.save());
        const addBtn = document.getElementById('clip-ws-add-duration');
        if (addBtn) addBtn.addEventListener('click', () => this.addDuration());
    },

    getSettings() {
        const s = MOCK_DATA.clipWorkSettings;
        if (!s.durations) s.durations = [];
        if (!s.dailyWorkload) s.dailyWorkload = 0;
        return s;
    },

    render() {
        const s = this.getSettings();
        const workloadEl = document.getElementById('clip-ws-daily-workload');
        if (workloadEl) workloadEl.value = s.dailyWorkload;

        const listEl = document.getElementById('clip-ws-duration-list');
        if (!listEl) return;

        let html = `
            <table class="data-table" style="max-width:520px;">
                <thead>
                    <tr><th>时间段</th><th>基数</th><th style="width:60px;">操作</th></tr>
                </thead>
                <tbody>`;
        s.durations.forEach((d, i) => {
            html += `
                <tr data-dur-index="${i}">
                    <td><input type="text" class="form-input" data-dur-label="${i}" value="${this.escapeHtml(d.label)}" style="width:160px;" /></td>
                    <td><input type="number" class="form-input" data-dur-base="${i}" value="${d.baseValue}" step="0.01" style="width:110px;" /></td>
                    <td><button class="btn-icon" data-del-dur="${i}" title="删除">✕</button></td>
                </tr>`;
        });
        html += '</tbody></table>';
        listEl.innerHTML = html;

        listEl.querySelectorAll('input[data-dur-label]').forEach(inp => {
            inp.addEventListener('input', () => {
                const idx = parseInt(inp.dataset.durLabel);
                s.durations[idx].label = inp.value;
            });
        });
        listEl.querySelectorAll('input[data-dur-base]').forEach(inp => {
            inp.addEventListener('input', () => {
                const idx = parseInt(inp.dataset.durBase);
                s.durations[idx].baseValue = parseFloat(inp.value) || 0;
            });
        });
        listEl.querySelectorAll('button[data-del-dur]').forEach(btn => {
            btn.addEventListener('click', () => {
                s.durations.splice(parseInt(btn.dataset.delDur), 1);
                this.render();
            });
        });
    },

    addDuration() {
        const s = this.getSettings();
        s.durations.push({ label: '新区间', baseValue: 1 });
        this.render();
    },

    save() {
        const s = this.getSettings();
        const workloadEl = document.getElementById('clip-ws-daily-workload');
        if (workloadEl) {
            s.dailyWorkload = parseFloat(workloadEl.value) || 0;
        }
        // 过滤空时间段名称，保留有效基数
        s.durations = s.durations
            .map(d => ({ label: String(d.label || '').trim(), baseValue: parseFloat(d.baseValue) || 0 }))
            .filter(d => d.label);
        DataStore.saveClipWorkSettings();
        if (typeof EditingWorksheet !== 'undefined') {
            try { EditingWorksheet.render(); } catch (e) { console.error('[ClipWorkSettings] 刷新剪辑工作表失败:', e); }
        }
        this.render();
        showToast('剪辑工作表配置已保存', 'success');
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return str.toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    },
};

/* ============================================================
   工具：年度工作日历（法定节假日 + 调休上班日）
   用于剪辑工作表「实际工作天数」等场景
   ============================================================ */
const WorkCalendar = {
    // 内置法定节假日（YYYY-MM-DD），按年分组；若国务院发布新安排，可在此更新
    BUILTIN_HOLIDAYS: {
        2024: [
            '2024-01-01',
            '2024-02-10','2024-02-11','2024-02-12','2024-02-13','2024-02-14','2024-02-15','2024-02-16','2024-02-17',
            '2024-04-04','2024-04-05','2024-04-06',
            '2024-05-01','2024-05-02','2024-05-03','2024-05-04','2024-05-05',
            '2024-06-08','2024-06-09','2024-06-10',
            '2024-09-15','2024-09-16','2024-09-17',
            '2024-10-01','2024-10-02','2024-10-03','2024-10-04','2024-10-05','2024-10-06','2024-10-07',
        ],
        2025: [
            '2025-01-01',
            '2025-01-28','2025-01-29','2025-01-30','2025-01-31','2025-02-01','2025-02-02','2025-02-03','2025-02-04',
            '2025-04-04','2025-04-05','2025-04-06',
            '2025-05-01','2025-05-02','2025-05-03','2025-05-04','2025-05-05',
            '2025-05-31','2025-06-01','2025-06-02',
            '2025-10-01','2025-10-02','2025-10-03','2025-10-04','2025-10-05','2025-10-06','2025-10-07','2025-10-08',
        ],
        2026: [
            '2026-01-01','2026-01-02','2026-01-03',
            '2026-02-15','2026-02-16','2026-02-17','2026-02-18','2026-02-19','2026-02-20','2026-02-21','2026-02-22','2026-02-23',
            '2026-04-04','2026-04-05','2026-04-06',
            '2026-05-01','2026-05-02','2026-05-03','2026-05-04','2026-05-05',
            '2026-06-19','2026-06-20','2026-06-21',
            '2026-09-25','2026-09-26','2026-09-27',
            '2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05','2026-10-06','2026-10-07',
        ],
        2027: [
            '2027-01-01',
            '2027-02-05','2027-02-06','2027-02-07','2027-02-08','2027-02-09','2027-02-10','2027-02-11',
            '2027-04-05',
            '2027-05-01','2027-05-02',
            '2027-06-07','2027-06-08','2027-06-09',
            '2027-09-15','2027-09-16','2027-09-17',
            '2027-10-01','2027-10-02','2027-10-03','2027-10-04','2027-10-05','2027-10-06','2027-10-07',
        ],
    },
    // 内置调休上班日（原本是周末，但因调休需要上班）
    BUILTIN_WORKDAYS: {
        2024: ['2024-02-04','2024-02-18','2024-04-07','2024-04-28','2024-05-11','2024-09-14','2024-09-29','2024-10-12'],
        2025: ['2025-01-26','2025-02-08','2025-04-27','2025-09-28','2025-10-11'],
        2026: ['2026-01-04','2026-02-14','2026-02-28','2026-05-09','2026-09-20','2026-10-10'],
        2027: [],
    },

    ensureCalendar() {
        if (!MOCK_DATA.workCalendar) {
            MOCK_DATA.workCalendar = { holidays: [], workdays: [], removedHolidays: [] };
        }
        if (!Array.isArray(MOCK_DATA.workCalendar.holidays)) MOCK_DATA.workCalendar.holidays = [];
        if (!Array.isArray(MOCK_DATA.workCalendar.workdays)) MOCK_DATA.workCalendar.workdays = [];
        if (!Array.isArray(MOCK_DATA.workCalendar.removedHolidays)) MOCK_DATA.workCalendar.removedHolidays = [];
        return MOCK_DATA.workCalendar;
    },

    // 获取某年的节假日集合（内置 + 用户新增 - 用户删除）
    getHolidays(year) {
        const cal = this.ensureCalendar();
        const set = new Set(this.BUILTIN_HOLIDAYS[year] || []);
        (cal.holidays || []).forEach(d => { if (String(d).startsWith(String(year))) set.add(d); });
        (cal.removedHolidays || []).forEach(d => set.delete(d));
        return set;
    },

    // 获取某年的调休上班日集合
    getWorkdays(year) {
        const cal = this.ensureCalendar();
        const set = new Set(this.BUILTIN_WORKDAYS[year] || []);
        (cal.workdays || []).forEach(d => { if (String(d).startsWith(String(year))) set.add(d); });
        return set;
    },

    isHoliday(dateStr) {
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const holidays = this.getHolidays(year);
        const workdays = this.getWorkdays(year);
        if (workdays.has(dateStr)) return false;
        if (holidays.has(dateStr)) return true;
        return d.getDay() === 0; // 周日默认休息
    },

    isWorkday(dateStr) {
        return !this.isHoliday(dateStr);
    },

    getWorkingDays(year, month) {
        let count = 0;
        const date = new Date(year, month - 1, 1);
        while (date.getMonth() === month - 1) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;
            if (this.isWorkday(dateStr)) count++;
            date.setDate(date.getDate() + 1);
        }
        return count;
    },
};

const EditingWorksheet = {
    // 当前显示的年份/月份（1-12）
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,

    init() {
        this.migrateOldData();
        this.bindEvents();
        this.render();
        // 兜底：如果员工数据尚未从云端同步完成，3 秒后再尝试渲染一次
        if (!this.getEditingEmployees().length) {
            setTimeout(() => {
                if (this.getEditingEmployees().length) {
                    this.render();
                }
            }, 3000);
        }
        // 云端/跨设备数据变更后，若当前正在查看剪辑工作表，则实时刷新（避免数据到达后表格仍为空白）
        if (typeof SupabaseSync !== 'undefined' && typeof SupabaseSync.onChange === 'function') {
            SupabaseSync.onChange((changedKey) => {
                try {
                    const view = document.getElementById('view-clip-worksheet');
                    if (view && view.classList.contains('active')) {
                        this.render();
                    }
                } catch (e) { /* 忽略渲染异常 */ }
            });
        }
    },

    // 迁移旧版剪辑工作表数据（employeeId/subAccounts → empId/subCounts）
    migrateOldData() {
        let changed = false;
        MOCK_DATA.editingWorksheet = (MOCK_DATA.editingWorksheet || []).map(row => {
            if (row.employeeId !== undefined && row.empId === undefined) {
                changed = true;
                const newRow = { ...row, empId: row.employeeId };
                delete newRow.employeeId;
                delete newRow.employeeName;
                delete newRow.id;
                delete newRow.totalCount;
                delete newRow.diffCount;
                delete newRow.leftSum;
                delete newRow.rightSum;
                delete newRow.dayOfWeek;
                if (row.subAccounts !== undefined && row.subCounts === undefined) {
                    newRow.subCounts = row.subAccounts;
                    delete newRow.subAccounts;
                }
                return newRow;
            }
            return row;
        });
        if (changed) {
            DataStore.saveEditingWorksheet();
            console.log('[EditingWorksheet] 已迁移旧版数据到新结构');
        }
    },

    isAdmin() {
        return Auth.isAdmin();
    },

    // 获取完整时间段配置（含基数）
    getDurations() {
        const s = MOCK_DATA.clipWorkSettings;
        if (s && Array.isArray(s.durations) && s.durations.length) {
            return s.durations.filter(d => String(d.label || '').trim());
        }
        return [{ label: '<15s', baseValue: 1 }];
    },

    // 时长区间表头（仅名称）
    getDurationHeaders() {
        return this.getDurations().map(d => d.label);
    },

    // 根据时间段名称获取基数
    getBaseValueForLabel(label) {
        const d = this.getDurations().find(d => d.label === label);
        return d ? (parseFloat(d.baseValue) || 0) : 0;
    },

    // 每日工作量（管理员设置，每行只读展示）
    getDailyWorkload() {
        const s = MOCK_DATA.clipWorkSettings;
        return (s && s.dailyWorkload) ? Number(s.dailyWorkload) || 0 : 0;
    },

    // 计算今日剪辑数：Σ（数量 × 基数）
    calcClipCount(row) {
        const b = row.buckets || {};
        return Object.entries(b).reduce((sum, [label, v]) => {
            return sum + (parseFloat(v) || 0) * this.getBaseValueForLabel(label);
        }, 0);
    },

    // 左求和：时间段数量之和（不带基数）
    sumBuckets(row) {
        const b = row.buckets || {};
        return Object.values(b).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    },

    sumSubs(row) {
        const s = row.subCounts || {};
        return Object.values(s).reduce((s2, v) => s2 + (parseFloat(v) || 0), 0);
    },

    // 获取指定年月的所有日期字符串（YYYY-MM-DD）
    getMonthDays(year, month) {
        const days = [];
        const date = new Date(year, month - 1, 1);
        while (date.getMonth() === month - 1) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            days.push(`${y}-${m}-${d}`);
            date.setDate(date.getDate() + 1);
        }
        return days;
    },

    // 获取星期几中文名（剪辑工作表自身实现，避免依赖其他模块）
    getWeekday(dateStr) {
        const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const d = new Date(dateStr);
        return days[d.getDay()];
    },

    // 查找某员工某日的剪辑记录
    getRow(empId, dateStr) {
        return (MOCK_DATA.editingWorksheet || []).find(r =>
            String(r.empId) === String(empId) && r.date === dateStr
        );
    },

    // 获取或创建某员工某日的剪辑记录
    ensureRow(empId, dateStr) {
        let row = this.getRow(empId, dateStr);
        if (!row) {
            row = { empId: empId, date: dateStr, buckets: {}, subCounts: {} };
            MOCK_DATA.editingWorksheet.push(row);
        }
        return row;
    },

    // 获取指定年月的工作日天数：周一到周五 + 周六（非法定节假日）+ 调休上班日
    getWorkingDays(year, month) {
        return WorkCalendar.getWorkingDays(year, month);
    },

    // 根据员工对象从工资表获取基本工资（按姓名匹配，未找到返回 0）
    getEmployeeBaseSalary(emp) {
        if (!emp || !emp.name) return 0;
        const row = (MOCK_DATA.salaryData || []).find(s => s.name === emp.name);
        return row ? (parseFloat(row.base) || 0) : 0;
    },

    // 金额格式化
    formatMoney(num) {
        const n = parseFloat(num) || 0;
        return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },

    // 渲染单员工统计卡片（7 张）
    renderStats(emp) {
        const statsEl = document.getElementById('clip-ws-stats');
        if (!statsEl) return;

        const subAccounts = emp && Array.isArray(emp.subAccounts) ? emp.subAccounts : [];
        const workingDays = this.getWorkingDays(this.year, this.month);
        const dailyWorkload = this.getDailyWorkload();
        const monthlyClipTarget = dailyWorkload * workingDays;
        const baseSalary = this.getEmployeeBaseSalary(emp);
        const dailyAmount = workingDays > 0 ? baseSalary / workingDays : 0;
        const perClipAmount = monthlyClipTarget > 0 ? baseSalary / monthlyClipTarget : 0;

        const inquiryAmount = this.calculateInquiryPerformance(this.year, this.month, subAccounts);
        const viralAmount = this.calculateViralHitPerformance(this.year, this.month, subAccounts);

        const cards = [
            { label: '账号数量', value: subAccounts.length, unit: '个' },
            { label: '实际工作天数', value: workingDays, unit: '天' },
            { label: '月剪辑量', value: monthlyClipTarget, unit: '条' },
            { label: '每天金额', value: this.formatMoney(dailyAmount), unit: '元', money: true },
            { label: '单条金额', value: this.formatMoney(perClipAmount), unit: '元', money: true },
            { label: '爆款绩效', value: this.formatMoney(viralAmount), unit: '元', money: true },
            { label: '询盘绩效', value: this.formatMoney(inquiryAmount), unit: '元', money: true },
        ];

        statsEl.innerHTML = cards.map(c => `
            <div class="ws-stat-card">
                <div class="ws-stat-label">${this.escapeHtml(c.label)}</div>
                <div class="ws-stat-value ${c.money ? 'money' : ''}">${this.escapeHtml(String(c.value))}${c.unit ? `<span class="ws-stat-unit">${this.escapeHtml(c.unit)}</span>` : ''}</div>
            </div>
        `).join('');
    },

    // 渲染管理员视角的聚合统计卡片
    renderAggregateStats(emps) {
        const statsEl = document.getElementById('clip-ws-stats');
        if (!statsEl) return;

        const workingDays = this.getWorkingDays(this.year, this.month);
        const dailyWorkload = this.getDailyWorkload();
        const totalAccountCount = emps.reduce((sum, e) => sum + (Array.isArray(e.subAccounts) ? e.subAccounts.length : 0), 0);
        const totalBaseSalary = emps.reduce((sum, e) => sum + this.getEmployeeBaseSalary(e), 0);
        const monthlyClipTarget = dailyWorkload * workingDays * emps.length;
        const dailyAmount = workingDays > 0 ? totalBaseSalary / workingDays : 0;
        const perClipAmount = monthlyClipTarget > 0 ? totalBaseSalary / monthlyClipTarget : 0;

        const inquiryAmount = this.calculateInquiryPerformance(this.year, this.month);
        const viralAmount = this.calculateViralHitPerformance(this.year, this.month);

        const cards = [
            { label: '账号数量', value: totalAccountCount, unit: '个' },
            { label: '实际工作天数', value: workingDays, unit: '天' },
            { label: '月剪辑量', value: monthlyClipTarget, unit: '条' },
            { label: '每天金额', value: this.formatMoney(dailyAmount), unit: '元', money: true },
            { label: '单条金额', value: this.formatMoney(perClipAmount), unit: '元', money: true },
            { label: '爆款绩效', value: this.formatMoney(viralAmount), unit: '元', money: true },
            { label: '询盘绩效', value: this.formatMoney(inquiryAmount), unit: '元', money: true },
        ];

        statsEl.innerHTML = cards.map(c => `
            <div class="ws-stat-card">
                <div class="ws-stat-label">${this.escapeHtml(c.label)}</div>
                <div class="ws-stat-value ${c.money ? 'money' : ''}">${this.escapeHtml(String(c.value))}${c.unit ? `<span class="ws-stat-unit">${this.escapeHtml(c.unit)}</span>` : ''}</div>
            </div>
        `).join('');
    },

    // 剪辑员工：非管理员、状态正常，且岗位含「剪辑」或「运营」
    getEditingEmployees() {
        return (MOCK_AUTH_DATA.employees || []).filter(e => {
            if (e.role === 'admin' || e.status === 'inactive') return false;
            const positions = e.positions || [];
            return positions.includes('剪辑') || positions.includes('运营');
        });
    },

    // 获取指定年月、指定子账号列表的短视频预警记录（不传 subIds 则不限子账号）
    getMonthAlerts(year, month, subIds = null) {
        const start = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0);
        const end = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        return (MOCK_DATA.shortVideoAlerts || []).filter(a => {
            if (!a.date || a.date < start || a.date > end) return false;
            if (subIds && !subIds.includes(a.subAccountId)) return false;
            return true;
        });
    },

    // 计算询盘绩效：短视频预警留资数 × 子账号配置基数
    // 规则：达到 max 拿 amount；超过 max 仍按 max 算；低于 min 为 0；中间按 amount * (leads / max)
    calculateInquiryPerformance(year, month, subIds = null) {
        const config = (MOCK_DATA.subAccountSalaryConfig || {}).inquiry || {};
        const alerts = this.getMonthAlerts(year, month, subIds);
        const leadsBySub = {};
        alerts.forEach(a => {
            const sid = a.subAccountId;
            leadsBySub[sid] = (leadsBySub[sid] || 0) + (parseInt(a.leads) || 0);
        });
        let total = 0;
        Object.keys(leadsBySub).forEach(sid => {
            const cfg = config[sid];
            if (!cfg || !cfg.max || cfg.max <= 0) return;
            const leads = leadsBySub[sid];
            const min = parseFloat(cfg.min) || 0;
            if (leads < min) return;
            const effective = Math.min(leads, cfg.max);
            total += (parseFloat(cfg.amount) || 0) * (effective / cfg.max);
        });
        return total;
    },

    // 计算爆款绩效：按播放量阈值取最高档位奖励，每条视频只取一次
    calculateViralHitPerformance(year, month, subIds = null) {
        const tiers = ((MOCK_DATA.subAccountSalaryConfig || {}).viral || []).slice()
            .sort((a, b) => (b.views || 0) - (a.views || 0));
        if (!tiers.length) return 0;
        const alerts = this.getMonthAlerts(year, month, subIds);
        let total = 0;
        alerts.forEach(a => {
            const views = parseInt(a.views) || 0;
            for (const tier of tiers) {
                if (views >= (tier.views || 0)) {
                    total += parseFloat(tier.amount) || 0;
                    break;
                }
            }
        });
        return total;
    },

    bindEvents() {
        const prev = document.getElementById('clip-ws-prev-month');
        if (prev) prev.addEventListener('click', () => {
            this.month--;
            if (this.month < 1) { this.month = 12; this.year--; }
            this.render();
        });
        const next = document.getElementById('clip-ws-next-month');
        if (next) next.addEventListener('click', () => {
            this.month++;
            if (this.month > 12) { this.month = 1; this.year++; }
            this.render();
        });
        const exp = document.getElementById('clip-ws-export-btn');
        if (exp) exp.addEventListener('click', () => this.exportExcel());

        const container = document.getElementById('clip-worksheet-container');
        if (container) {
            const handler = (e) => {
                const t = e.target;
                if (t && t.dataset && t.dataset.cell) this.onCellInput(t);
            };
            container.addEventListener('input', handler);
            container.addEventListener('change', handler);
        }
    },

    render() {
        const container = document.getElementById('clip-worksheet-container');
        if (!container) return;
        const label = document.getElementById('clip-ws-month-label');
        if (label) label.textContent = `${this.year}年${this.month}月`;
        const user = Auth.getCurrentUser();
        if (!user) return;

        // 权限校验：仅管理员或剪辑/运营岗位可查看
        if (user.role !== 'admin' && !Auth.canAccessClipWorksheet()) {
            container.innerHTML = `<div class="ws-empty-state" style="padding:40px;text-align:center;background:var(--color-bg-soft,#f6f8fa);border:1px dashed var(--color-border);border-radius:var(--radius-md);margin:20px 0;">
                <p style="font-size:15px;color:var(--color-text);font-weight:600;margin-bottom:8px;">无权限访问</p>
                <p style="font-size:13px;color:var(--color-text-light);margin:0;">剪辑工作表仅对「剪辑」或「运营」岗位开放，请联系管理员调整岗位。</p>
            </div>`;
            return;
        }

        let html = '';
        if (user.role === 'admin') {
            const emps = this.getEditingEmployees();
            this.renderAggregateStats(emps);
            if (emps.length === 0) {
                html = `<div class="ws-empty-state" style="padding:40px;text-align:center;background:var(--color-bg-soft,#f6f8fa);border:1px dashed var(--color-border);border-radius:var(--radius-md);margin:20px 0;">
                    <p style="font-size:15px;color:var(--color-text);font-weight:600;margin-bottom:8px;">暂无剪辑/运营岗位员工</p>
                    <p style="font-size:13px;color:var(--color-text-light);margin:0;">请在左侧「员工管理」中添加岗位为「剪辑」或「运营」、状态为「在职」的员工。数据同步完成后，这里会自动出现每个人的剪辑工作表。</p>
                </div>`;
            } else {
                emps.forEach(emp => {
                    try {
                        html += `<div class="ws-emp-block"><h4 class="ws-emp-title">${this.escapeHtml(emp.name)} 的剪辑工作表</h4>`;
                        html += this.buildTable(emp, emp.subAccounts || []);
                        html += '</div>';
                    } catch (e) {
                        console.error('[EditingWorksheet] 渲染员工', emp && emp.name, '的表格失败:', e);
                        html += `<div class="ws-empty-state" style="padding:24px;text-align:center;background:var(--color-bg-soft,#f6f8fa);border:1px dashed var(--color-border);border-radius:var(--radius-md);margin:12px 0;">
                            <p style="font-size:13px;color:var(--color-danger,#e74c3c);margin:0;">员工「${this.escapeHtml(emp.name || '?')}」的表格渲染失败，已跳过该员工</p>
                        </div>`;
                    }
                });
            }
        } else {
            this.renderStats(user);
            html = this.buildTable(user, user.subAccounts || []);
        }
        container.innerHTML = html;
        this.updateReconcileHint();
    },

    // 为某个员工构建整月表格；subIds 为该员工可见的子账号 id 数组
    buildTable(emp, subIds) {
        const headers = this.getDurationHeaders();
        const durations = this.getDurations();
        const workload = this.getDailyWorkload();
        const subs = (MOCK_DATA.subAccounts || []).filter(a => subIds.includes(a.id));
        const days = this.getMonthDays(this.year, this.month);
        const empId = emp.id || emp.account;

        let thead = '<thead><tr>';
        thead += '<th>日期</th><th>星期</th><th>今日剪辑数</th><th>每日工作量</th>';
        headers.forEach(h => thead += `<th>${this.escapeHtml(h)}</th>`);
        thead += '<th>左求和</th><th>右求和</th>';
        subs.forEach(a => thead += `<th>${this.escapeHtml(a.name)}</th>`);
        thead += '</tr></thead>';

        let tbody = '<tbody>';
        days.forEach(dateStr => {
            const row = this.getRow(empId, dateStr) ||
                { empId: empId, date: dateStr, buckets: {}, subCounts: {} };
            const clipCount = this.calcClipCount(row);
            const left = this.sumBuckets(row);
            const right = this.sumSubs(row);
            const mismatch = Math.abs(left - right) > 0.001;
            tbody += `<tr data-emp="${this.escapeHtml(String(empId))}" data-date="${dateStr}" class="${mismatch ? 'ws-mismatch' : ''}">`;
            tbody += `<td>${dateStr.slice(5)}</td>`;
            tbody += `<td>${this.getWeekday(dateStr)}</td>`;
            tbody += `<td class="ws-auto">${clipCount.toFixed(2)}</td>`;
            tbody += `<td class="ws-auto">${workload}</td>`;
            headers.forEach(h => {
                const v = (row.buckets && row.buckets[h]) || 0;
                tbody += `<td><input type="number" class="ws-cell" data-cell="bucket" data-key="${this.escapeHtml(h)}" value="${v}" style="width:62px" /></td>`;
            });
            tbody += `<td class="ws-auto">${left}</td>`;
            tbody += `<td class="ws-auto ${mismatch ? 'ws-mismatch-num' : ''}">${right}</td>`;
            subs.forEach(a => {
                const v = (row.subCounts && row.subCounts[String(a.id)]) || 0;
                tbody += `<td><input type="number" class="ws-cell" data-cell="sub" data-key="${this.escapeHtml(String(a.id))}" value="${v}" style="width:62px" /></td>`;
            });
            tbody += '</tr>';
        });
        tbody += '</tbody>';
        return `<div class="table-wrapper"><table class="data-table copy-library-table ws-table">${thead}${tbody}</table></div>`;
    },

    onCellInput(input) {
        const tr = input.closest('tr');
        if (!tr) return;
        const empId = tr.dataset.emp;
        const date = tr.dataset.date;
        const user = Auth.getCurrentUser();
        if (!user) return;
        if (user.role !== 'admin' && String(user.id) !== String(empId)) {
            showToast('只能填写自己的剪辑工作表', 'error');
            this.render();
            return;
        }
        const row = this.ensureRow(empId, date);
        if (input.dataset.cell === 'bucket') {
            if (!row.buckets) row.buckets = {};
            row.buckets[input.dataset.key] = parseFloat(input.value) || 0;
        } else if (input.dataset.cell === 'sub') {
            if (!row.subCounts) row.subCounts = {};
            row.subCounts[input.dataset.key] = parseFloat(input.value) || 0;
        }
        // 实时重算该行自动列
        const clipCount = this.calcClipCount(row);
        const left = this.sumBuckets(row);
        const right = this.sumSubs(row);
        const mismatch = Math.abs(left - right) > 0.001;
        const autoTds = tr.querySelectorAll('td.ws-auto');
        // autoTds 顺序：今日剪辑数(0)、每日工作量(1)、左求和(2)、右求和(3)
        if (autoTds[0]) autoTds[0].textContent = clipCount.toFixed(2);
        if (autoTds[2]) autoTds[2].textContent = left;
        if (autoTds[3]) {
            autoTds[3].textContent = right;
            autoTds[3].classList.toggle('ws-mismatch-num', mismatch);
        }
        tr.classList.toggle('ws-mismatch', mismatch);
        this.updateReconcileHint();
        DataStore.saveEditingWorksheet();
    },

    updateReconcileHint() {
        const hint = document.getElementById('clip-ws-reconcile-hint');
        const container = document.getElementById('clip-worksheet-container');
        if (!hint || !container) return;
        const mismatches = container.querySelectorAll('tr.ws-mismatch').length;
        if (mismatches > 0) {
            hint.innerHTML = `<span style="color:var(--color-danger,#e74c3c);font-weight:600;">⚠ 有 ${mismatches} 行左右求和不一致（需对账）</span>`;
        } else {
            hint.innerHTML = `<span style="color:var(--color-success,#27ae60);font-weight:600;">✓ 左右求和一致</span>`;
        }
    },

    exportExcel() {
        showToast('正在导出剪辑工作表...', 'info');
        setTimeout(() => {
            const user = Auth.getCurrentUser();
            if (!user) return;
            const rows = user.role === 'admin'
                ? MOCK_DATA.editingWorksheet
                : MOCK_DATA.editingWorksheet.filter(r => String(r.empId) === String(user.id));
            const headers = ['员工', '日期', '星期', '今日剪辑数', '每日工作量',
                ...this.getDurationHeaders(), '左求和', '右求和',
                ...(MOCK_DATA.subAccounts || []).map(a => a.name)];
            const subIds = (MOCK_DATA.subAccounts || []).map(a => String(a.id));
            const data = rows.map(r => {
                const left = this.sumBuckets(r);
                const right = this.sumSubs(r);
                const clipCount = this.calcClipCount(r);
                const emp = (MOCK_AUTH_DATA.employees || []).find(e => String(e.id) === String(r.empId));
                return [
                    emp ? emp.name : r.empId,
                    r.date,
                    this.getWeekday(r.date),
                    clipCount.toFixed(2),
                    this.getDailyWorkload(),
                    ...this.getDurationHeaders().map(h => (r.buckets && r.buckets[h]) || 0),
                    left, right,
                    ...subIds.map(sid => (r.subCounts && r.subCounts[sid]) || 0),
                ];
            });
            const csv = [headers, ...data]
                .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
                .join('\n');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `剪辑工作表_${this.year}-${String(this.month).padStart(2, '0')}.csv`;
            link.click();
            showToast('剪辑工作表导出完成', 'success');
        }, 400);
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return str.toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    },
};

/* ============================================================
   模块三原：腾讯文档接入（已停用，保留空壳避免旧引用报错）
   ============================================================ */
const TencentDocs = {
    init() {},
};

/* ============================================================
   模块四：视频解析下载器
   ============================================================ */
const VideoDownloader = {
    init() {
        // 平台切换
        document.querySelectorAll('.platform-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.platform-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                state.selectedPlatform = tab.dataset.platform;
                document.getElementById('video-url-input').placeholder = this.getPlaceholder(state.selectedPlatform);
            });
        });

        // 解析
        document.getElementById('parse-video-btn').addEventListener('click', () => this.parseVideo());
        // 下载
        document.getElementById('download-video-btn').addEventListener('click', () => this.downloadVideo());

        this.renderHistory();
    },

    getPlaceholder(platform) {
        const map = {
            xiaohongshu: '粘贴小红书视频链接，例如：https://www.xiaohongshu.com/explore/...',
            douyin: '粘贴抖音视频链接，例如：https://www.douyin.com/video/...',
            bilibili: '粘贴哔哩哔哩视频链接，例如：https://www.bilibili.com/video/...',
        };
        return map[platform] || '粘贴视频链接...';
    },

    parseVideo() {
        const urlInput = document.getElementById('video-url-input');
        const url = urlInput.value.trim();

        if (!url) {
            showToast('请先粘贴视频链接', 'warning');
            return;
        }

        const platformNames = { xiaohongshu: '小红书', douyin: '抖音', bilibili: '哔哩哔哩' };
        showToast(`正在解析${platformNames[state.selectedPlatform]}视频...`, 'info');

        // 模拟解析
        setTimeout(() => {
            const mockInfo = this.generateMockVideoInfo(state.selectedPlatform);
            document.getElementById('video-title').textContent = mockInfo.title;
            document.getElementById('video-author').textContent = mockInfo.author;
            document.getElementById('video-duration').textContent = mockInfo.duration;
            document.getElementById('video-resolution').textContent = mockInfo.resolution;
            document.getElementById('video-parse-result').style.display = 'block';
            document.getElementById('download-video-btn').disabled = false;
            showToast('解析成功！可以下载了', 'success');
        }, 1500);
    },

    generateMockVideoInfo(platform) {
        const data = {
            xiaohongshu: { title: '夏日防晒霜推荐TOP5 | 干货满满', author: '美妆精选号', duration: '02:35', resolution: '1080P' },
            douyin: { title: '2026新款手机开箱测评 | 速看不亏', author: '数码评测君', duration: '03:48', resolution: '4K' },
            bilibili: { title: '探店城市美食合集 | 吃货必看', author: '美食探店日记', duration: '05:12', resolution: '1080P' },
        };
        return data[platform] || data.xiaohongshu;
    },

    downloadVideo() {
        showToast('开始下载视频...', 'info');
        const platformNames = { xiaohongshu: '小红书', douyin: '抖音', bilibili: '哔哩哔哩' };

        setTimeout(() => {
            const title = document.getElementById('video-title').textContent;
            // 添加到历史
            MOCK_DATA.videoHistory.unshift({
                platform: platformNames[state.selectedPlatform],
                title: title,
                time: new Date().toLocaleString('zh-CN'),
                status: 'completed',
            });
            this.renderHistory();
            showToast('视频下载完成！', 'success');
        }, 2000);
    },

    renderHistory() {
        const tbody = document.getElementById('video-history-body');
        tbody.innerHTML = '';

        if (MOCK_DATA.videoHistory.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--color-text-light);padding:24px;">暂无下载记录</td></tr>';
            return;
        }

        MOCK_DATA.videoHistory.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td><span class="tag tag-info">${item.platform}</span></td>
                    <td>${item.title}</td>
                    <td>${item.time}</td>
                    <td><span class="tag tag-success">已完成</span></td>
                    <td><button class="btn btn-sm btn-outline">打开文件夹</button></td>
                </tr>
            `;
        });
    },
};

/* ============================================================
   模块五：文案解析下载器
   ============================================================ */
const CopyDownloader = {
    init() {
        document.getElementById('parse-copy-btn').addEventListener('click', () => this.parseCopy());
        document.getElementById('download-copy-btn').addEventListener('click', () => this.downloadCopy());
    },

    parseCopy() {
        const urlInput = document.getElementById('copy-url-input');
        const url = urlInput.value.trim();

        if (!url) {
            showToast('请先粘贴文案链接', 'warning');
            return;
        }

        showToast('正在解析文案...', 'info');

        setTimeout(() => {
            const mockCopy = {
                title: '夏日防晒霜推荐TOP5，让你白到发光！',
                platform: '小红书',
                author: '美妆精选号',
                date: '2026-07-22',
                content: `姐妹们！夏天来了，防晒真的太重要了！\n\n今天给大家推荐5款亲测好用的防晒霜：\n\n1. 安热沙小金瓶 - SPF50+ PA++++，防水防汗，户外必备\n2. 碧柔水活防晒 - 质地轻薄，日常通勤首选\n3. 资生堂蓝胖子 - 含护肤成分，养肤防晒两不误\n4. 珂润润浸防晒 - 敏感肌友好，温和不刺激\n5. 理肤泉大哥大 - 高倍防护，军训海边都hold住\n\n💡小tips：\n- 出门前15分钟涂抹\n- 每2-3小时补涂一次\n- 用量要够，一枚硬币大小涂全脸\n\n赶紧安排上，一起白到发光！✨\n\n#防晒推荐 #夏日护肤 #美妆好物`,
            };

            document.getElementById('copy-title').textContent = mockCopy.title;
            document.getElementById('copy-platform-badge').textContent = mockCopy.platform;
            document.getElementById('copy-content-box').textContent = mockCopy.content;
            document.getElementById('copy-word-count').textContent = mockCopy.content.replace(/\s/g, '').length;
            document.getElementById('copy-author').textContent = mockCopy.author;
            document.getElementById('copy-date').textContent = mockCopy.date;
            document.getElementById('copy-result-area').style.display = 'block';
            document.getElementById('download-copy-btn').disabled = false;
            showToast('文案解析成功！', 'success');
        }, 1200);
    },

    downloadCopy() {
        showToast('正在下载文案...', 'info');
        setTimeout(() => {
            showToast('文案已保存到本地文件夹', 'success');
        }, 1000);
    },
};

/* ============================================================
   模块六：自动化浏览器
   ============================================================ */
const AutoBrowser = {
    automationTimer: null,

    init() {
        document.getElementById('browser-go').addEventListener('click', () => this.navigate());
        document.getElementById('browser-refresh').addEventListener('click', () => this.refresh());
        document.getElementById('browser-back').addEventListener('click', () => this.back());
        document.getElementById('browser-forward').addEventListener('click', () => this.forward());

        document.getElementById('run-automation').addEventListener('click', () => this.runScript());
        document.getElementById('stop-automation').addEventListener('click', () => this.stopScript());

        // 初始导航
        this.navigate();
    },

    navigate() {
        const url = document.getElementById('browser-url').value.trim();
        if (!url) return;

        const iframe = document.getElementById('browser-iframe');
        const notice = document.getElementById('browser-blocked-notice');

        // 尝试加载
        if (!url.startsWith('http')) {
            iframe.src = 'https://' + url;
        } else {
            iframe.src = url;
        }

        // 检测是否被阻止（大部分网站会阻止iframe嵌入）
        iframe.onerror = () => {
            notice.style.display = 'flex';
        };

        // 超时检测
        setTimeout(() => {
            try {
                if (iframe.contentWindow && iframe.contentWindow.location.href === 'about:blank') {
                    // 可能被阻止
                }
            } catch (e) {
                // 跨域访问，正常
            }
        }, 3000);
    },

    refresh() {
        const iframe = document.getElementById('browser-iframe');
        const src = iframe.src;
        iframe.src = 'about:blank';
        setTimeout(() => { iframe.src = src; }, 100);
        this.log('页面已刷新', 'info');
    },

    back() {
        const iframe = document.getElementById('browser-iframe');
        try { iframe.contentWindow.history.back(); } catch (e) { this.log('无法后退', 'warn'); }
    },

    forward() {
        const iframe = document.getElementById('browser-iframe');
        try { iframe.contentWindow.history.forward(); } catch (e) { this.log('无法前进', 'warn'); }
    },

    runScript() {
        const editor = document.getElementById('script-editor');
        const code = editor.value.trim();

        if (!code) {
            showToast('请先输入自动化脚本', 'warning');
            return;
        }

        this.log('开始执行自动化脚本...', 'info');
        showToast('自动化脚本运行中', 'info');

        // 解析脚本命令并模拟执行
        const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
        let step = 0;

        if (this.automationTimer) clearInterval(this.automationTimer);

        this.automationTimer = setInterval(() => {
            if (step >= lines.length) {
                clearInterval(this.automationTimer);
                this.automationTimer = null;
                this.log('✅ 脚本执行完成', 'success');
                showToast('自动化任务完成', 'success');
                return;
            }

            const line = lines[step].trim();
            this.executeCommand(line);
            step++;
        }, 1200);
    },

    stopScript() {
        if (this.automationTimer) {
            clearInterval(this.automationTimer);
            this.automationTimer = null;
            this.log('⏹ 脚本已停止', 'warn');
            showToast('脚本已停止', 'warning');
        } else {
            showToast('当前没有运行中的脚本', 'info');
        }
    },

    executeCommand(cmd) {
        // 模拟命令解析
        if (cmd.startsWith('navigate(')) {
            const url = cmd.match(/\(([^)]+)\)/)?.[1]?.replace(/['"]/g, '');
            this.log(`→ 导航到: ${url}`, 'info');
            if (url) {
                document.getElementById('browser-url').value = url;
                this.navigate();
            }
        } else if (cmd.startsWith('click(')) {
            const selector = cmd.match(/\(([^)]+)\)/)?.[1] || '';
            this.log(`→ 点击元素: ${selector}`, 'success');
        } else if (cmd.startsWith('type(')) {
            const text = cmd.match(/\(([^)]+)\)/)?.[1]?.replace(/['"]/g, '') || '';
            this.log(`→ 输入文本: "${text}"`, 'success');
        } else if (cmd.startsWith('wait(')) {
            const ms = cmd.match(/\(([^)]+)\)/)?.[1] || '0';
            this.log(`→ 等待 ${ms}ms`, 'info');
        } else if (cmd.startsWith('screenshot')) {
            this.log('→ 截图已保存', 'success');
        } else if (cmd.startsWith('scroll(')) {
            this.log(`→ 滚动页面`, 'info');
        } else {
            this.log(`→ 执行: ${cmd}`, 'info');
        }
    },

    log(message, type = 'info') {
        const output = document.getElementById('console-output');
        const time = new Date().toLocaleTimeString('zh-CN');
        const line = document.createElement('div');
        line.className = `console-line console-${type}`;
        line.textContent = `[${time}] ${message}`;
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    },
};

/* ============================================================
   模块七：工资管理
   ============================================================ */
const SalaryManager = {
    init() {
        // 根据角色渲染不同视图
        this.renderView();

        // 管理员绑定事件
        if (Auth.isAdmin()) {
            const addBtn = document.getElementById('add-salary-row');
            if (addBtn) addBtn.addEventListener('click', () => this.addRow());
            const exportBtn = document.getElementById('export-salary-btn');
            if (exportBtn) exportBtn.addEventListener('click', () => this.exportExcel());
            const saveFieldBtn = document.getElementById('save-field-config-btn');
            if (saveFieldBtn) saveFieldBtn.addEventListener('click', () => this.saveFieldConfig());
            const snapshotBtn = document.getElementById('save-snapshot-btn');
            if (snapshotBtn) snapshotBtn.addEventListener('click', () => this.saveSnapshot());
            const saveSubAccountSalaryConfigBtn = document.getElementById('save-subaccount-salary-config-btn');
            if (saveSubAccountSalaryConfigBtn) saveSubAccountSalaryConfigBtn.addEventListener('click', () => this.saveSubAccountSalaryConfig());
            const addViralTierBtn = document.getElementById('add-viral-tier-btn');
            if (addViralTierBtn) addViralTierBtn.addEventListener('click', () => this.addViralTier());
        }

        // 员工导出按钮
        const empExportBtn = document.getElementById('emp-export-salary-btn');
        if (empExportBtn) empExportBtn.addEventListener('click', () => this.exportExcel());
        // 员工保存快照按钮
        const empSnapshotBtn = document.getElementById('emp-save-snapshot-btn');
        if (empSnapshotBtn) empSnapshotBtn.addEventListener('click', () => this.saveSnapshot());
    },

    // 获取字段配置
    getFields() {
        return state.salaryFieldConfig;
    },

    // 计算实发工资
    calculateNet(row) {
        return this.getFields().reduce((sum, f) => {
            const val = parseFloat(row[f.key]) || 0;
            return f.type === 'deduction' ? sum - val : sum + val;
        }, 0);
    },

    // 根据角色渲染视图
    renderView() {
        const adminSection = document.getElementById('salary-admin-content');
        const employeeSection = document.getElementById('salary-employee-content');

        if (Auth.isAdmin()) {
            if (adminSection) adminSection.style.display = 'block';
            if (employeeSection) employeeSection.style.display = 'none';
            this.renderTable();
            this.renderFieldConfig();
            this.renderSubAccountSalaryConfig();
            this.renderHistory();
        } else {
            if (adminSection) adminSection.style.display = 'none';
            if (employeeSection) employeeSection.style.display = 'block';
            this.renderEmployeeView();
            this.renderHistory('emp');
        }
    },

    renderTable() {
        const thead = document.querySelector('#salary-table thead tr');
        const tbody = document.getElementById('salary-table-body');
        if (!thead || !tbody) return;

        // 动态表头：姓名 + 岗位 + 各字段 + 实发工资 + 操作
        const fields = this.getFields();
        thead.innerHTML = '<th>姓名</th><th>岗位</th>' +
            fields.map(f => `<th>${f.name}</th>`).join('') +
            '<th>实发工资</th><th>操作</th>';

        tbody.innerHTML = '';
        state.salaryData.forEach((row, index) => {
            const net = this.calculateNet(row);
            const fieldInputs = fields.map(f =>
                `<td><input type="number" value="${row[f.key]}" data-field="${f.key}" /></td>`
            ).join('');

            tbody.innerHTML += `
                <tr data-index="${index}">
                    <td class="col-name"><input type="text" value="${row.name}" data-field="name" /></td>
                    <td><input type="text" value="${row.role}" data-field="role" style="width:80px;text-align:left;" /></td>
                    ${fieldInputs}
                    <td class="col-salary">${net.toFixed(2)}</td>
                    <td><button class="btn-icon" onclick="SalaryManager.removeRow(${index})" title="删除">✕</button></td>
                </tr>
            `;
        });

        // 绑定输入变化事件
        tbody.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => this.updateRow(input));
        });

        this.updateSummary();
    },

    addRow() {
        const newRow = { name: '新员工', role: '待分配' };
        this.getFields().forEach(f => { newRow[f.key] = 0; });
        state.salaryData.push(newRow);
        DataStore.saveSalary();
        this.renderTable();
        showToast('已添加一行', 'success');
    },

    removeRow(index) {
        state.salaryData.splice(index, 1);
        DataStore.saveSalary();
        this.renderTable();
        showToast('已删除该行', 'info');
    },

    updateRow(input) {
        const row = input.closest('tr');
        const index = parseInt(row.dataset.index);
        const field = input.dataset.field;
        let value = input.value;

        const fieldConfig = this.getFields().find(f => f.key === field);
        if (fieldConfig) {
            value = parseFloat(value) || 0;
        }

        state.salaryData[index][field] = value;
        DataStore.saveSalary();

        // 更新实发工资
        const net = this.calculateNet(state.salaryData[index]);
        row.querySelector('.col-salary').textContent = net.toFixed(2);

        this.updateSummary();
    },

    updateSummary() {
        const count = state.salaryData.length;
        const total = state.salaryData.reduce((sum, row) => sum + this.calculateNet(row), 0);

        const countEl = document.getElementById('salary-count');
        const totalEl = document.getElementById('salary-total');
        if (countEl) countEl.textContent = count;
        if (totalEl) totalEl.textContent = `¥${total.toFixed(2)}`;

        // 员工视图汇总
        const empTotalEl = document.getElementById('emp-salary-total');
        const empCountEl = document.getElementById('emp-salary-count');
        if (empTotalEl) empTotalEl.textContent = `¥${total.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (empCountEl) empCountEl.textContent = `${count} 人`;

        // 联动运营成本管理和仪表板
        if (typeof OperatingCostManager !== 'undefined') {
            OperatingCostManager.updateSummary();
        }
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateStatCards();
        }
    },

    exportExcel() {
        showToast('正在导出工资表...', 'info');
        const fields = this.getFields();
        setTimeout(() => {
            // 生成CSV（使用动态字段名）
            const headers = ['姓名', '岗位', ...fields.map(f => f.name), '实发工资'];
            const rows = state.salaryData.map(d => {
                const net = this.calculateNet(d);
                return [d.name, d.role, ...fields.map(f => d[f.key]), net.toFixed(2)];
            });
            const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

            // 下载
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `工资表_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
            link.click();
            showToast('工资表导出完成', 'success');
        }, 500);
    },

    // 从员工管理模块同步：新增的员工自动加入工资表，删除的员工自动移除
    syncFromEmployees() {
        const employees = MOCK_AUTH_DATA.employees;
        const existingNames = state.salaryData.map(r => r.name);

        // 添加新增的员工（工资默认为0）
        employees.forEach(emp => {
            if (!existingNames.includes(emp.name)) {
                const newRow = { name: emp.name, role: emp.role || '待分配' };
                this.getFields().forEach(f => { newRow[f.key] = 0; });
                state.salaryData.push(newRow);
            }
        });

        // 移除已删除的员工
        const empNames = employees.map(e => e.name);
        state.salaryData = state.salaryData.filter(r =>
            empNames.includes(r.name) || !existingNames.includes(r.name) // 保留手动添加的非员工行
        );

        // 同步岗位信息
        state.salaryData.forEach(row => {
            const emp = employees.find(e => e.name === row.name);
            if (emp && emp.role && row.role === '待分配') {
                row.role = emp.role;
            }
        });

        DataStore.saveSalary();
        this.renderTable();

        // 联动运营成本和仪表板
        if (typeof OperatingCostManager !== 'undefined') {
            OperatingCostManager.updateSummary();
        }
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateStatCards();
        }
    },

    // ===== 员工视图：三栏布局 =====
    renderEmployeeView() {
        // 员工只能查看自己的工资：按登录用户名过滤
        const currentUser = Auth.getCurrentUser();
        const myName = currentUser ? currentUser.name : '';
        const mySalary = state.salaryData.filter(row => row.name === myName);

        // 只显示自己的工资，自动选中
        state.salarySelectedName = mySalary.length > 0 ? mySalary[0].name : null;

        const listEl = document.getElementById('emp-salary-list');
        const detailEl = document.getElementById('emp-salary-detail');

        if (!listEl || !detailEl) return;

        // 第二栏：只显示自己的姓名
        listEl.innerHTML = '';
        if (mySalary.length === 0) {
            listEl.innerHTML = '<div class="emp-detail-empty">暂无您的工资数据</div>';
            detailEl.innerHTML = '<div class="emp-detail-empty">暂无工资数据，请联系管理员</div>';
            // 更新第一栏汇总
            const totalEl = document.getElementById('emp-salary-total');
            const countEl = document.getElementById('emp-salary-count');
            if (totalEl) totalEl.textContent = '¥0.00';
            if (countEl) countEl.textContent = '0 条记录';
            return;
        }

        mySalary.forEach(row => {
            const net = this.calculateNet(row);
            const isActive = row.name === state.salarySelectedName;
            listEl.innerHTML += `
                <div class="emp-salary-item ${isActive ? 'active' : ''}">
                    <div class="emp-salary-name">
                        <span class="emp-salary-avatar">${row.name.charAt(0)}</span>
                        <div>
                            <strong>${row.name}</strong>
                            <small>${row.role || '—'}</small>
                        </div>
                    </div>
                    <span class="emp-salary-amount">¥${net.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
            `;
        });

        // 更新第一栏汇总（只显示自己的）
        const myNet = this.calculateNet(mySalary[0]);
        const totalEl = document.getElementById('emp-salary-total');
        const countEl = document.getElementById('emp-salary-count');
        if (totalEl) totalEl.textContent = `¥${myNet.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
        if (countEl) countEl.textContent = '我的工资明细';

        // 第三栏：工资构成详情
        this.renderEmployeeDetail();
    },

    // 员工视图：选中某人的工资构成
    renderEmployeeDetail() {
        const detailEl = document.getElementById('emp-salary-detail');
        if (!detailEl) return;

        const row = state.salaryData.find(r => r.name === state.salarySelectedName);
        if (!row) {
            detailEl.innerHTML = '<div class="emp-detail-empty">请从左侧选择员工查看工资构成</div>';
            return;
        }

        const fields = this.getFields();
        const net = this.calculateNet(row);
        const incomeItems = fields.filter(f => f.type === 'income');
        const deductionItems = fields.filter(f => f.type === 'deduction');
        const totalIncome = incomeItems.reduce((s, f) => s + (parseFloat(row[f.key]) || 0), 0);
        const totalDeduction = deductionItems.reduce((s, f) => s + (parseFloat(row[f.key]) || 0), 0);

        let html = `
            <div class="emp-detail-header">
                <div class="emp-detail-avatar">${row.name.charAt(0)}</div>
                <div>
                    <h4>${row.name}</h4>
                    <span class="emp-detail-role">${row.role || '未设置岗位'}</span>
                </div>
            </div>
            <div class="emp-detail-net">
                <span>实发工资</span>
                <strong>¥${net.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>
            <div class="emp-detail-section">
                <div class="emp-detail-section-title">
                    <span>收入项</span>
                    <span class="emp-detail-sub">合计 ¥${totalIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
        `;

        incomeItems.forEach(f => {
            const val = parseFloat(row[f.key]) || 0;
            html += `
                <div class="emp-detail-row income">
                    <span>${f.name}</span>
                    <span>¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
            `;
        });

        html += `
            </div>
            <div class="emp-detail-section">
                <div class="emp-detail-section-title">
                    <span>扣除项</span>
                    <span class="emp-detail-sub">合计 -¥${totalDeduction.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
        `;

        deductionItems.forEach(f => {
            const val = parseFloat(row[f.key]) || 0;
            html += `
                <div class="emp-detail-row deduction">
                    <span>${f.name}</span>
                    <span>-¥${val.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
            `;
        });

        html += `
            </div>
            <div class="emp-detail-summary">
                <div class="emp-detail-summary-row">
                    <span>应发合计</span>
                    <span>¥${totalIncome.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="emp-detail-summary-row">
                    <span>扣款合计</span>
                    <span>-¥${totalDeduction.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="emp-detail-summary-row total">
                    <span>实发工资</span>
                    <strong>¥${net.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</strong>
                </div>
            </div>
        `;

        detailEl.innerHTML = html;
    },

    // 员工视图：点击选择某人
    selectEmployee(name) {
        state.salarySelectedName = name;
        this.renderEmployeeView();
    },

    // ===== 管理员：绩效项名称配置 =====
    renderFieldConfig() {
        const container = document.getElementById('field-config-list');
        if (!container) return;

        container.innerHTML = '';
        this.getFields().forEach((field, index) => {
            container.innerHTML += `
                <div class="field-config-item">
                    <div class="field-config-type ${field.type}">
                        ${field.type === 'income' ? '收入' : '扣除'}
                    </div>
                    <input type="text" class="form-input field-config-input"
                           value="${field.name}"
                           data-key="${field.key}"
                           data-index="${index}"
                           placeholder="输入${field.type === 'income' ? '收入项' : '扣除项'}名称" />
                </div>
            `;
        });
    },

    // ===== 管理员：子账号绩效基数配置 =====
    renderSubAccountSalaryConfig() {
        const inquiryContainer = document.getElementById('inquiry-config-list');
        const viralContainer = document.getElementById('viral-config-list');
        if (!inquiryContainer || !viralContainer) return;

        const config = MOCK_DATA.subAccountSalaryConfig || { inquiry: {}, viral: [] };
        const inquiry = config.inquiry || {};
        const subs = MOCK_DATA.subAccounts || [];

        // 询盘绩效：按子账号配置最大值 / 最小值 / 金额
        let inquiryHtml = '';
        if (subs.length === 0) {
            inquiryHtml = '<p style="color:var(--color-text-light);font-size:13px;">暂无子账号，请先在「子账号管理」中添加</p>';
        } else {
            inquiryHtml = `
                <table class="data-table" style="max-width:720px;">
                    <thead><tr><th>子账号</th><th>最大值（留资数）</th><th>最小值（留资数）</th><th>金额（元）</th></tr></thead>
                    <tbody>`;
            subs.forEach(sub => {
                const cfg = inquiry[sub.id] || { max: '', min: '', amount: '' };
                inquiryHtml += `
                    <tr data-sub-id="${sub.id}">
                        <td>${this.escapeHtml(sub.name)}</td>
                        <td><input type="number" class="form-input inquiry-max" value="${cfg.max !== undefined && cfg.max !== '' ? cfg.max : ''}" placeholder="如100" style="width:120px;" /></td>
                        <td><input type="number" class="form-input inquiry-min" value="${cfg.min !== undefined && cfg.min !== '' ? cfg.min : ''}" placeholder="如20" style="width:120px;" /></td>
                        <td><input type="number" class="form-input inquiry-amount" value="${cfg.amount !== undefined && cfg.amount !== '' ? cfg.amount : ''}" placeholder="如50" style="width:120px;" /></td>
                    </tr>`;
            });
            inquiryHtml += '</tbody></table>';
        }
        inquiryContainer.innerHTML = inquiryHtml;

        // 爆款绩效：按播放量阈值配置名称 / 阈值 / 金额
        const viral = config.viral || [];
        let viralHtml = '';
        if (viral.length === 0) {
            viralHtml = '<p style="color:var(--color-text-light);font-size:13px;">暂无阈值，点击「添加阈值」创建</p>';
        } else {
            viralHtml = `
                <table class="data-table" style="max-width:720px;">
                    <thead><tr><th>名称</th><th>播放量阈值</th><th>奖励金额（元）</th><th>操作</th></tr></thead>
                    <tbody>`;
            viral.forEach((tier, idx) => {
                viralHtml += `
                    <tr data-viral-index="${idx}">
                        <td><input type="text" class="form-input viral-name" value="${this.escapeHtml(tier.name || '')}" style="width:140px;" /></td>
                        <td><input type="number" class="form-input viral-views" value="${tier.views !== undefined && tier.views !== '' ? tier.views : ''}" style="width:120px;" /></td>
                        <td><input type="number" class="form-input viral-amount" value="${tier.amount !== undefined && tier.amount !== '' ? tier.amount : ''}" style="width:120px;" /></td>
                        <td><button class="btn-icon" onclick="SalaryManager.removeViralTier(${idx})" title="删除">✕</button></td>
                    </tr>`;
            });
            viralHtml += '</tbody></table>';
        }
        viralContainer.innerHTML = viralHtml;
    },

    addViralTier() {
        if (!MOCK_DATA.subAccountSalaryConfig) MOCK_DATA.subAccountSalaryConfig = { inquiry: {}, viral: [] };
        if (!Array.isArray(MOCK_DATA.subAccountSalaryConfig.viral)) MOCK_DATA.subAccountSalaryConfig.viral = [];
        MOCK_DATA.subAccountSalaryConfig.viral.push({ name: '新阈值', views: 100000, amount: 10 });
        this.renderSubAccountSalaryConfig();
    },

    removeViralTier(index) {
        if (!MOCK_DATA.subAccountSalaryConfig || !Array.isArray(MOCK_DATA.subAccountSalaryConfig.viral)) return;
        MOCK_DATA.subAccountSalaryConfig.viral.splice(index, 1);
        DataStore.saveSubAccountSalaryConfig();
        this.renderSubAccountSalaryConfig();
        showToast('已删除阈值', 'info');
    },

    saveSubAccountSalaryConfig() {
        if (!MOCK_DATA.subAccountSalaryConfig) MOCK_DATA.subAccountSalaryConfig = { inquiry: {}, viral: [] };
        const config = MOCK_DATA.subAccountSalaryConfig;
        config.inquiry = {};

        // 收集询盘绩效配置
        document.querySelectorAll('#inquiry-config-list tbody tr[data-sub-id]').forEach(tr => {
            const sid = tr.dataset.subId;
            const max = parseFloat(tr.querySelector('.inquiry-max').value) || 0;
            const min = parseFloat(tr.querySelector('.inquiry-min').value) || 0;
            const amount = parseFloat(tr.querySelector('.inquiry-amount').value) || 0;
            if (max > 0) {
                config.inquiry[sid] = { max, min, amount };
            }
        });

        // 收集爆款绩效配置
        const viral = [];
        document.querySelectorAll('#viral-config-list tbody tr[data-viral-index]').forEach(tr => {
            const name = tr.querySelector('.viral-name').value.trim() || '未命名';
            const views = parseFloat(tr.querySelector('.viral-views').value) || 0;
            const amount = parseFloat(tr.querySelector('.viral-amount').value) || 0;
            if (views > 0 && amount > 0) viral.push({ name, views, amount });
        });
        // 按播放量降序，保证计算时取最高档位
        config.viral = viral.sort((a, b) => (b.views || 0) - (a.views || 0));

        DataStore.saveSubAccountSalaryConfig();
        showToast('子账号绩效配置已保存', 'success');

        // 刷新剪辑工作表（若当前可见），使绩效卡片实时更新
        if (typeof EditingWorksheet !== 'undefined') {
            try { EditingWorksheet.render(); } catch (e) {}
        }
    },

    // 保存字段配置
    saveFieldConfig() {
        const inputs = document.querySelectorAll('.field-config-input');
        let changed = 0;
        inputs.forEach(input => {
            const key = input.dataset.key;
            const newName = input.value.trim();
            if (!newName) return;
            const field = state.salaryFieldConfig.find(f => f.key === key);
            if (field && field.name !== newName) {
                field.name = newName;
                changed++;
            }
        });

        if (changed > 0) {
            DataStore.saveSalary();
            this.renderTable();
            this.renderEmployeeView();
            this.renderHistory();
            showToast(`已更新 ${changed} 个绩效项名称`, 'success');
        } else {
            showToast('未检测到名称变更', 'info');
        }
    },

    // ===== 工资历史快照 =====
    saveSnapshot() {
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        // 检查是否已存在该月快照
        const existing = MOCK_DATA.salaryHistory.findIndex(s => s.month === monthKey);
        const snapshot = {
            id: Date.now(),
            month: monthKey,
            savedAt: now.toISOString(),
            data: JSON.parse(JSON.stringify(state.salaryData)),
            fieldConfig: JSON.parse(JSON.stringify(state.salaryFieldConfig)),
        };

        if (existing >= 0) {
            MOCK_DATA.salaryHistory[existing] = snapshot;
            DataStore.saveSalaryHistory();
            showToast(`${monthKey} 工资明细已更新保存`, 'success');
        } else {
            MOCK_DATA.salaryHistory.push(snapshot);
            DataStore.saveSalaryHistory();
            showToast(`${monthKey} 工资明细已保存`, 'success');
        }

        this.renderHistory(Auth.isAdmin() ? 'admin' : 'emp');
    },

    // 渲染历史记录列表
    renderHistory(scope = 'admin') {
        const containerId = scope === 'emp' ? 'emp-salary-history' : 'salary-history-list';
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (MOCK_DATA.salaryHistory.length === 0) {
            container.innerHTML = '<div class="history-empty">暂无历史工资记录</div>';
            return;
        }

        const currentUser = Auth.getCurrentUser();
        const myName = currentUser ? currentUser.name : '';
        const isAdmin = Auth.isAdmin();

        // 按时间倒序
        const sorted = [...MOCK_DATA.salaryHistory].sort((a, b) => b.savedAt.localeCompare(a.savedAt));

        // 员工端：仅展示包含自己工资数据的快照
        const visibleSnaps = isAdmin ? sorted : sorted.map(snap => {
            const myRows = snap.data.filter(row => row.name === myName);
            if (myRows.length === 0) return null;
            return { ...snap, data: myRows };
        }).filter(Boolean);

        if (visibleSnaps.length === 0) {
            container.innerHTML = '<div class="history-empty">暂无您的历史工资记录</div>';
            return;
        }

        visibleSnaps.forEach(snap => {
            const total = snap.data.reduce((sum, row) => {
                return sum + snap.fieldConfig.reduce((s, f) => {
                    const v = parseFloat(row[f.key]) || 0;
                    return f.type === 'deduction' ? s - v : s + v;
                }, 0);
            }, 0);
            const date = new Date(snap.savedAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const clickAttr = isAdmin ? `onclick="SalaryManager.loadSnapshot(${snap.id})" style="cursor:pointer;"` : '';
            const peopleLabel = isAdmin ? `${snap.data.length}人` : '我的工资';

            container.innerHTML += `
                <div class="history-item" ${clickAttr}>
                    <div class="history-item-info">
                        <strong>${snap.month} 工资明细</strong>
                        <small>保存于 ${date} · ${peopleLabel} · 合计 ¥${total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</small>
                    </div>
                    ${isAdmin ? `<button class="btn-icon" onclick="event.stopPropagation();SalaryManager.deleteSnapshot(${snap.id})" title="删除">✕</button>` : ''}
                </div>
            `;
        });
    },

    // 加载历史快照
    loadSnapshot(id) {
        const snap = MOCK_DATA.salaryHistory.find(s => s.id === id);
        if (!snap) return;

        if (!confirm(`确定要加载 ${snap.month} 的工资明细吗？当前数据将被替换。`)) return;

        state.salaryData = JSON.parse(JSON.stringify(snap.data));
        state.salaryFieldConfig = JSON.parse(JSON.stringify(snap.fieldConfig));
        DataStore.saveSalary();

        if (Auth.isAdmin()) {
            this.renderTable();
            this.renderFieldConfig();
        } else {
            this.renderEmployeeView();
        }
        this.renderHistory(Auth.isAdmin() ? 'admin' : 'emp');
        showToast(`已加载 ${snap.month} 工资明细`, 'success');
    },

    // 删除历史快照
    deleteSnapshot(id) {
        if (!confirm('确定要删除此历史记录吗？')) return;
        const index = MOCK_DATA.salaryHistory.findIndex(s => s.id === id);
        if (index >= 0) {
            const snap = MOCK_DATA.salaryHistory[index];
            MOCK_DATA.salaryHistory.splice(index, 1);
            DataStore.saveSalaryHistory();
            this.renderHistory(Auth.isAdmin() ? 'admin' : 'emp');
            showToast(`${snap.month} 工资明细已删除`, 'info');
        }
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return str.toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    },
};

/* ============================================================
   模块七B：运营成本管理（与工资管理互通）
   ============================================================ */
const OperatingCostManager = {
    editingId: null,

    init() {
        document.getElementById('add-cost-item-btn').addEventListener('click', () => this.showForm());
        document.getElementById('save-cost-item-btn').addEventListener('click', () => this.saveItem());
        document.getElementById('cancel-cost-item-btn').addEventListener('click', () => this.hideForm());
        this.renderTable();
        this.updateSummary();
    },

    // 渲染成本项表格
    renderTable() {
        const tbody = document.getElementById('cost-table-body');
        tbody.innerHTML = '';

        MOCK_DATA.operatingCostItems.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td><span class="badge badge-cat">${item.category}</span></td>
                    <td class="col-amount">¥${item.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</td>
                    <td>${item.remark || '—'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="OperatingCostManager.showForm(${item.id})">编辑</button>
                        <button class="btn-icon" onclick="OperatingCostManager.deleteItem(${item.id})" title="删除">✕</button>
                    </td>
                </tr>
            `;
        });

        this.updateSummary();
    },

    // 显示添加/编辑表单
    showForm(itemId = null) {
        this.editingId = itemId;
        const area = document.getElementById('cost-form-area');
        const title = document.getElementById('cost-form-title');

        if (itemId) {
            const item = MOCK_DATA.operatingCostItems.find(i => i.id === itemId);
            if (!item) return;
            title.textContent = `编辑成本项：${item.name}`;
            document.getElementById('cost-form-name').value = item.name;
            document.getElementById('cost-form-category').value = item.category;
            document.getElementById('cost-form-amount').value = item.amount;
            document.getElementById('cost-form-remark').value = item.remark || '';
        } else {
            title.textContent = '添加运营成本项';
            document.getElementById('cost-form-name').value = '';
            document.getElementById('cost-form-category').value = '';
            document.getElementById('cost-form-amount').value = '0';
            document.getElementById('cost-form-remark').value = '';
        }

        area.style.display = 'block';
        area.scrollIntoView({ behavior: 'smooth' });
    },

    hideForm() {
        document.getElementById('cost-form-area').style.display = 'none';
        this.editingId = null;
    },

    // 保存成本项
    saveItem() {
        const name = document.getElementById('cost-form-name').value.trim();
        const category = document.getElementById('cost-form-category').value.trim();
        const amount = parseFloat(document.getElementById('cost-form-amount').value) || 0;
        const remark = document.getElementById('cost-form-remark').value.trim();

        if (!name || !category) {
            showToast('请填写必填项（名称、分类）', 'warning');
            return;
        }

        if (this.editingId) {
            const item = MOCK_DATA.operatingCostItems.find(i => i.id === this.editingId);
            if (item) {
                item.name = name;
                item.category = category;
                item.amount = amount;
                item.remark = remark;
                DataStore.saveOperatingCost();
                showToast(`成本项「${name}」已更新`, 'success');
            }
        } else {
            const newId = Math.max(...MOCK_DATA.operatingCostItems.map(i => i.id), 0) + 1;
            MOCK_DATA.operatingCostItems.push({ id: newId, name, category, amount, remark });
            DataStore.saveOperatingCost();
            showToast(`成本项「${name}」已添加`, 'success');
        }

        this.hideForm();
        this.renderTable();

        // 同步仪表板运营成本卡片
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateStatCards();
        }
    },

    // 删除成本项
    deleteItem(id) {
        const item = MOCK_DATA.operatingCostItems.find(i => i.id === id);
        if (!item) return;
        if (!confirm(`确定要删除成本项「${item.name}」吗？`)) return;

        const index = MOCK_DATA.operatingCostItems.findIndex(i => i.id === id);
        MOCK_DATA.operatingCostItems.splice(index, 1);
        DataStore.saveOperatingCost();
        this.renderTable();
        showToast(`成本项「${item.name}」已删除`, 'info');

        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateStatCards();
        }
    },

    // 更新汇总（含员工工资联动）
    updateSummary() {
        const costItemsTotal = MOCK_DATA.operatingCostItems.reduce((sum, item) => sum + item.amount, 0);
        const fields = state.salaryFieldConfig || MOCK_DATA.salaryFieldConfig;
        const calcNet = (row) => fields.reduce((sum, f) => {
            const v = parseFloat(row[f.key]) || 0;
            return f.type === 'deduction' ? sum - v : sum + v;
        }, 0);
        const salaryTotal = state.salaryData.reduce((sum, row) => sum + calcNet(row), 0);
        const grandTotal = costItemsTotal + salaryTotal;

        const itemCountEl = document.getElementById('cost-item-count');
        const itemsTotalEl = document.getElementById('cost-items-total');
        const salaryTotalEl = document.getElementById('cost-salary-total');
        const grandTotalEl = document.getElementById('cost-grand-total');

        if (itemCountEl) itemCountEl.textContent = MOCK_DATA.operatingCostItems.length;
        if (itemsTotalEl) itemsTotalEl.textContent = `¥${costItemsTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
        if (salaryTotalEl) salaryTotalEl.textContent = `¥${salaryTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
        if (grandTotalEl) grandTotalEl.textContent = `¥${grandTotal.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
    },
};

/* ============================================================
   模块八：设置管理
   ============================================================ */
const Settings = {
    defaults: {
        'setting-tencent-key': '',
        'setting-tencent-secret': '',
        'setting-video-api': '',
        'setting-video-token': '',
        'setting-copy-api': '',
        'setting-copy-token': '',
        'setting-browser-path': '',
        'setting-proxy-api': '',
        'setting-video-folder': 'D:\\Videos\\代运营视频',
        'setting-copy-folder': 'D:\\Documents\\代运营文案',
        'setting-wecom-webhook': '',
        'setting-push-time': '18:00',
        'setting-login-title': '代运营数字化平台',
        'setting-login-logo': 'OP',
        'setting-login-subtitle': '一站式代运营数据管理与自动化平台',
        'setting-login-welcome': '欢迎登录',
        'setting-login-bgimage': '',
        'setting-login-desc': '一站式代运营数据管理与自动化平台',
        'setting-login-features': '多账号数据实时监控与可视化\n视频/文案自动解析与下载\n内嵌自动化浏览器操作\n团队协作与权限分级管理',
        'setting-login-emp-hint': '员工账号由管理员在后台添加后生成',
        'setting-login-admin-hint': '请输入管理员账号和密码',
    },

    init() {
        document.getElementById('save-settings-btn').addEventListener('click', () => this.save());
        document.getElementById('reset-settings-btn').addEventListener('click', () => this.reset());
        const securityBtn = document.getElementById('save-admin-security-btn');
        if (securityBtn) securityBtn.addEventListener('click', () => this.saveAdminSecurity());
        const workCalendarBtn = document.getElementById('save-work-calendar-btn');
        if (workCalendarBtn) workCalendarBtn.addEventListener('click', () => this.saveWorkCalendar());
        this.setupBackupListeners();
        this.load();
    },

    save() {
        const settings = {};
        Object.keys(this.defaults).forEach(key => {
            const el = document.getElementById(key);
            if (el) settings[key] = el.value;
        });
        localStorage.setItem('platform_settings', JSON.stringify(settings));
        showToast('设置已保存', 'success');
    },

    // 保存管理员账号密码（双重验证）
    saveAdminSecurity() {
        const accountEl = document.getElementById('setting-admin-account');
        const oldPassEl = document.getElementById('setting-admin-old-password');
        const newPassEl = document.getElementById('setting-admin-new-password');
        const confirmPassEl = document.getElementById('setting-admin-confirm-password');

        if (!accountEl || !oldPassEl || !newPassEl || !confirmPassEl) return;

        const result = Auth.changeAdminCredentials(
            oldPassEl.value,
            accountEl.value,
            newPassEl.value,
            confirmPassEl.value
        );

        if (result.success) {
            showToast(result.message, 'success');
            oldPassEl.value = '';
            newPassEl.value = '';
            confirmPassEl.value = '';
            // 更新顶部显示的管理员名称/账号
            Auth.updateUI();
        } else {
            showToast(result.message, 'warning');
        }
    },

    // 解析 textarea 中的日期列表（每行一个，过滤无效格式）
    _parseDateList(textareaId) {
        const el = document.getElementById(textareaId);
        if (!el) return [];
        return el.value.split('\n')
            .map(s => s.trim())
            .filter(s => /^\d{4}-\d{2}-\d{2}$/.test(s));
    },

    // 保存年度工作日历
    saveWorkCalendar() {
        const holidays = this._parseDateList('setting-work-calendar-holidays');
        const workdays = this._parseDateList('setting-work-calendar-workdays');
        const removed = this._parseDateList('setting-work-calendar-removed');
        MOCK_DATA.workCalendar = { holidays, workdays, removedHolidays: removed };
        DataStore.saveWorkCalendar();
        // 刷新剪辑工作表（若当前正在该视图）
        if (typeof EditingWorksheet !== 'undefined') {
            try { EditingWorksheet.render(); } catch (e) { console.error('[Settings] 刷新剪辑工作表失败:', e); }
        }
        showToast('年度工作日历已保存，剪辑工作表将按新规则计算', 'success');
    },

    load() {
        const saved = localStorage.getItem('platform_settings');
        if (saved) {
            const settings = JSON.parse(saved);
            Object.keys(settings).forEach(key => {
                const el = document.getElementById(key);
                if (el) el.value = settings[key];
            });
        } else {
            // 加载默认值
            Object.keys(this.defaults).forEach(key => {
                const el = document.getElementById(key);
                if (el) el.value = this.defaults[key];
            });
        }

        // 加载当前管理员账号到安全设置区域
        const adminAccountEl = document.getElementById('setting-admin-account');
        if (adminAccountEl) {
            adminAccountEl.value = MOCK_AUTH_DATA.admin.account;
        }

        // 管理员账号安全设置仅管理员可见
        const securityCard = document.getElementById('admin-security-card');
        if (securityCard) {
            securityCard.style.display = Auth.isAdmin() ? 'block' : 'none';
        }

        // 数据备份恢复仅管理员可见
        const backupCard = document.getElementById('data-backup-card');
        if (backupCard) {
            backupCard.style.display = Auth.isAdmin() ? 'block' : 'none';
        }
    },

    reset() {
        if (!confirm('确定要恢复默认设置吗？')) return;
        localStorage.removeItem('platform_settings');
        Object.keys(this.defaults).forEach(key => {
            const el = document.getElementById(key);
            if (el) el.value = this.defaults[key];
        });
        showToast('已恢复默认设置', 'info');
    },

    setupBackupListeners() {
        const exportBtn = document.getElementById('export-data-btn');
        const importBtn = document.getElementById('import-data-btn');
        const importFile = document.getElementById('import-data-file');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportAllData());
        if (importBtn) importBtn.addEventListener('click', () => importFile && importFile.click());
        if (importFile) importFile.addEventListener('change', (e) => this.importAllData(e.target.files[0]));
    },

    exportAllData() {
        const payload = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            payload[key] = localStorage.getItem(key);
        }
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daiyunying-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`已导出 ${Object.keys(payload).length} 条数据`, 'success');
    },

    importAllData(file) {
        const preview = document.getElementById('import-preview');
        if (!file) {
            if (preview) preview.style.display = 'none';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data || typeof data !== 'object') throw new Error('文件格式不正确');
                const keys = Object.keys(data);
                if (keys.length === 0) throw new Error('备份文件为空');
                if (!confirm(`确定要恢复备份吗？这将覆盖当前 ${keys.length} 条本地数据，且无法撤销。`)) {
                    if (preview) preview.style.display = 'none';
                    return;
                }
                // 先清空（保留会话，避免被踢出）
                const session = localStorage.getItem('platform_session');
                localStorage.clear();
                if (session) localStorage.setItem('platform_session', session);
                keys.forEach(key => {
                    localStorage.setItem(key, data[key]);
                });
                showToast(`已恢复 ${keys.length} 条数据，页面即将刷新`, 'success');
                setTimeout(() => location.reload(), 1200);
            } catch (err) {
                showToast('恢复失败：' + err.message, 'error');
                if (preview) {
                    preview.style.display = 'block';
                    preview.textContent = '恢复失败：' + err.message;
                    preview.style.color = 'var(--color-danger)';
                }
            }
        };
        reader.onerror = () => showToast('读取文件失败', 'error');
        reader.readAsText(file);
    },
};

/* ============================================================
   模块九：员工管理（管理员专用）
   ============================================================ */
const EmployeeManager = {
    editingId: null,

    init() {
        document.getElementById('add-employee-btn').addEventListener('click', () => this.showForm());
        document.getElementById('save-employee-btn').addEventListener('click', () => this.saveEmployee());
        document.getElementById('cancel-employee-btn').addEventListener('click', () => this.hideForm());
        this.bindPositionManagement();
        this.renderTable();
    },

    // 绑定岗位管理事件
    bindPositionManagement() {
        const manageBtn = document.getElementById('manage-positions-btn');
        const closeBtn = document.getElementById('close-positions-btn');
        const addBtn = document.getElementById('add-position-btn');
        const input = document.getElementById('new-position-name');

        if (manageBtn) manageBtn.addEventListener('click', () => this.togglePositionsArea());
        if (closeBtn) closeBtn.addEventListener('click', () => this.togglePositionsArea(false));
        if (addBtn) addBtn.addEventListener('click', () => this.addPosition());
        if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.addPosition(); });
    },

    // 显示/隐藏岗位管理区域
    togglePositionsArea(show) {
        const area = document.getElementById('positions-management-area');
        if (!area) return;
        const willShow = show === undefined ? area.style.display === 'none' : show;
        area.style.display = willShow ? 'block' : 'none';
        if (willShow) {
            this.renderPositionsList();
            const input = document.getElementById('new-position-name');
            if (input) input.focus();
        }
    },

    // 渲染岗位列表
    renderPositionsList() {
        const list = document.getElementById('positions-list');
        if (!list) return;
        if (MOCK_DATA.employeePositions.length === 0) {
            list.innerHTML = '<span style="color:var(--color-text-light);font-size:13px;">暂无岗位，请在上方输入框添加</span>';
            return;
        }
        list.innerHTML = MOCK_DATA.employeePositions.map(p =>
            `<span class="position-chip" data-pos="${this.escapeHtml(p)}">${this.escapeHtml(p)} <button class="position-del" onclick="EmployeeManager.deletePosition('${this.escapeHtml(p)}')" title="删除">×</button></span>`
        ).join('');
    },

    // 添加岗位
    addPosition() {
        const input = document.getElementById('new-position-name');
        if (!input) return;
        const name = input.value.trim();
        if (!name) {
            showToast('请输入岗位名称', 'warning');
            return;
        }
        if (MOCK_DATA.employeePositions.includes(name)) {
            showToast('该岗位已存在', 'warning');
            return;
        }
        MOCK_DATA.employeePositions.push(name);
        DataStore.saveEmployeePositions();
        input.value = '';
        this.renderPositionsList();
        showToast(`岗位「${name}」已添加`, 'success');
    },

    // 删除岗位
    deletePosition(name) {
        const idx = MOCK_DATA.employeePositions.indexOf(name);
        if (idx >= 0) MOCK_DATA.employeePositions.splice(idx, 1);
        // 同步从各员工中移除该岗位
        MOCK_AUTH_DATA.employees.forEach(emp => {
            if (emp.positions) emp.positions = emp.positions.filter(p => p !== name);
            if (emp.role === name) emp.role = (emp.positions && emp.positions[0]) || '';
        });
        DataStore.saveEmployeePositions();
        DataStore.saveEmployeeIndex();
        this.renderPositionsList();
        this.renderTable();
        showToast(`岗位「${name}」已删除`, 'info');
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return str.toString().replace(/[&<>"']/g, function (m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
    },

    // 渲染员工列表
    renderTable() {
        const tbody = document.getElementById('employee-table-body');
        tbody.innerHTML = '';

        MOCK_AUTH_DATA.employees.forEach((emp, index) => {
            // 获取分配的子账号名称
            const subAccountNames = (emp.subAccounts || []).map(id => {
                const acc = MOCK_DATA.subAccounts.find(a => a.id === id);
                return acc ? `<span class="tag tag-info">${acc.name}</span>` : '';
            }).join(' ');

            const statusTag = emp.status === 'active'
                ? '<span class="tag tag-success">启用</span>'
                : '<span class="tag tag-danger">禁用</span>';

            // 岗位角色标签
            const positionTags = (emp.positions || []).map(p =>
                `<span class="tag tag-info">${this.escapeHtml(p)}</span>`
            ).join(' ');

            // 功能权限标签
            const featureNames = (emp.features || []).map(fid => {
                const feat = EMPLOYEE_FEATURES.find(f => f.id === fid);
                return feat ? `<span class="tag tag-info">${feat.name}</span>` : '';
            }).join(' ');

            tbody.innerHTML += `
                <tr>
                    <td>${this.escapeHtml(emp.name)}</td>
                    <td><code style="font-family:monospace;font-size:12px;">${this.escapeHtml(emp.account)}</code></td>
                    <td><code style="font-family:monospace;font-size:12px;">${this.escapeHtml(emp.password)}</code></td>
                    <td><div class="employee-positions">${positionTags || '<span style="color:var(--color-text-light);">未设置</span>'}</div></td>
                    <td><div class="employee-sub-accounts">${subAccountNames || '<span style="color:var(--color-text-light);">未分配</span>'}</div></td>
                    <td><div class="employee-features">${featureNames || '<span style="color:var(--color-text-light);">无</span>'}</div></td>
                    <td>${statusTag}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="EmployeeManager.showForm(${emp.id})">编辑</button>
                        <button class="btn-icon" onclick="EmployeeManager.deleteEmployee(${emp.id})" title="删除">✕</button>
                    </td>
                </tr>
            `;
        });

        this.updateSummary();
    },

    // 显示添加/编辑表单
    showForm(empId = null) {
        this.editingId = empId;
        const area = document.getElementById('employee-form-area');
        const title = document.getElementById('employee-form-title');

        if (empId) {
            // 编辑模式
            const emp = MOCK_AUTH_DATA.employees.find(e => e.id === empId);
            if (!emp) return;
            title.textContent = `编辑员工：${emp.name}`;
            document.getElementById('emp-form-name').value = emp.name;
            document.getElementById('emp-form-account').value = emp.account;
            document.getElementById('emp-form-password').value = emp.password;
            document.getElementById('emp-form-status').value = emp.status || 'active';

            // 核心岗位互斥：若存在多个核心岗位，只保留第一个
            const corePositions = ['剪辑', '文案', '运营'];
            const empPositions = emp.positions || [];
            const selectedCores = corePositions.filter(p => empPositions.includes(p));
            const activeCore = selectedCores.length > 0 ? selectedCores[0] : null;
            const normalizedPositions = activeCore
                ? [...empPositions.filter(p => !corePositions.includes(p)), activeCore]
                : empPositions;

            this.renderPositionCheckboxes(normalizedPositions, empId);
            this.renderSubAccountCheckboxes(emp.subAccounts || [], empId, activeCore ? [activeCore] : []);
            this.renderFeatureCheckboxes(emp.features || []);
        } else {
            // 添加模式
            title.textContent = '添加新员工';
            document.getElementById('emp-form-name').value = '';
            document.getElementById('emp-form-account').value = '';
            document.getElementById('emp-form-password').value = '';
            document.getElementById('emp-form-status').value = 'active';
            this.renderPositionCheckboxes([], null);
            this.renderSubAccountCheckboxes([], null, []);
            this.renderFeatureCheckboxes(['dashboard', 'salary', 'short-video-alert', 'apps']); // 默认开启常用功能
        }

        area.style.display = 'block';
        area.scrollIntoView({ behavior: 'smooth' });
    },

    // 隐藏表单
    hideForm() {
        document.getElementById('employee-form-area').style.display = 'none';
        this.editingId = null;
    },

    // 渲染子账号复选框
    // 仅依据核心岗位（剪辑/文案/运营）分配子账号，三个核心岗位互斥
    renderSubAccountCheckboxes(selectedIds = [], editingId = null, currentPositions = null) {
        const container = document.getElementById('emp-sub-accounts');
        if (!container) return;
        container.innerHTML = '';

        const corePositions = ['剪辑', '文案', '运营'];

        // 未传岗位时，从当前表单读取核心岗位
        if (!currentPositions) {
            const checkedPositions = Array.from(document.querySelectorAll('#emp-positions input:checked')).map(cb => cb.value);
            const activeCore = checkedPositions.find(p => corePositions.includes(p));
            currentPositions = activeCore ? [activeCore] : [];
        }

        const activeCore = currentPositions.find(p => corePositions.includes(p));
        if (!activeCore) {
            container.innerHTML = '<span style="color:var(--color-text-light);font-size:13px;">请先选择岗位角色（剪辑/文案/运营）</span>';
            return;
        }

        // 收集同一核心岗位下其他员工已占用的子账号
        const occupiedBySameRole = new Set();
        MOCK_AUTH_DATA.employees.forEach(emp => {
            if (editingId !== null && emp.id === editingId) return; // 当前编辑的员工自身不算占用
            const empPositions = emp.positions || [];
            if (empPositions.includes(activeCore)) {
                (emp.subAccounts || []).forEach(id => occupiedBySameRole.add(id));
            }
        });

        // 当前员工已选中的账号始终保留
        selectedIds.forEach(id => occupiedBySameRole.delete(id));

        const available = MOCK_DATA.subAccounts.filter(acc => !occupiedBySameRole.has(acc.id));
        if (available.length === 0) {
            container.innerHTML = '<span style="color:var(--color-text-light);font-size:13px;">暂无可分配的子账号（当前岗位账号已被其他员工分配完）</span>';
            return;
        }

        available.forEach(acc => {
            const isChecked = selectedIds.includes(acc.id);
            container.innerHTML += `
                <label class="sub-account-checkbox ${isChecked ? 'checked' : ''}" data-id="${acc.id}">
                    <input type="checkbox" value="${acc.id}" ${isChecked ? 'checked' : ''} />
                    <span>${this.escapeHtml(acc.name)}</span>
                </label>
            `;
        });

        // 复选框状态切换
        container.querySelectorAll('.sub-account-checkbox').forEach(label => {
            const checkbox = label.querySelector('input');
            checkbox.addEventListener('change', () => {
                label.classList.toggle('checked', checkbox.checked);
            });
        });
    },

    // 渲染岗位复选框
    renderPositionCheckboxes(selectedPositions = [], editingId = null) {
        const container = document.getElementById('emp-positions');
        if (!container) return;
        container.innerHTML = '';

        if (MOCK_DATA.employeePositions.length === 0) {
            container.innerHTML = '<span style="color:var(--color-text-light);font-size:13px;">暂无岗位，请点击上方「岗位管理」添加</span>';
            return;
        }

        const corePositions = ['剪辑', '文案', '运营'];
        // 若同时存在多个核心岗位，只保留第一个（按 corePositions 顺序），保证互斥
        let normalizedPositions = [...selectedPositions];
        const selectedCores = corePositions.filter(p => normalizedPositions.includes(p));
        if (selectedCores.length > 1) {
            const keep = selectedCores[0];
            normalizedPositions = normalizedPositions.filter(p => !corePositions.includes(p) || p === keep);
        }

        MOCK_DATA.employeePositions.forEach(pos => {
            const isChecked = normalizedPositions.includes(pos);
            container.innerHTML += `
                <label class="sub-account-checkbox ${isChecked ? 'checked' : ''}" data-pos="${this.escapeHtml(pos)}">
                    <input type="checkbox" value="${this.escapeHtml(pos)}" ${isChecked ? 'checked' : ''} />
                    <span>${this.escapeHtml(pos)}</span>
                </label>
            `;
        });

        container.querySelectorAll('.sub-account-checkbox').forEach(label => {
            const checkbox = label.querySelector('input');
            checkbox.addEventListener('change', () => {
                const value = checkbox.value;
                const isCore = corePositions.includes(value);

                if (isCore && checkbox.checked) {
                    // 核心岗位互斥：取消其他核心岗位
                    container.querySelectorAll('.sub-account-checkbox').forEach(otherLabel => {
                        const otherCb = otherLabel.querySelector('input');
                        if (otherCb !== checkbox && corePositions.includes(otherCb.value)) {
                            otherCb.checked = false;
                            otherLabel.classList.remove('checked');
                        }
                    });
                }
                label.classList.toggle('checked', checkbox.checked);

                // 岗位变化时清空已分配子账号，并按新岗位重新渲染可选子账号
                const currentPositions = Array.from(document.querySelectorAll('#emp-positions input:checked')).map(cb => cb.value);
                const currentCore = currentPositions.find(p => corePositions.includes(p));
                this.renderSubAccountCheckboxes([], editingId, currentCore ? [currentCore] : []);
            });
        });
    },

    // 渲染功能权限复选框
    renderFeatureCheckboxes(selectedFeatures = []) {
        const container = document.getElementById('emp-features');
        container.innerHTML = '';

        EMPLOYEE_FEATURES.forEach(feat => {
            const isChecked = selectedFeatures.includes(feat.id);
            container.innerHTML += `
                <label class="sub-account-checkbox ${isChecked ? 'checked' : ''}" data-id="${feat.id}">
                    <input type="checkbox" value="${feat.id}" ${isChecked ? 'checked' : ''} />
                    <span>${feat.name}</span>
                </label>
            `;
        });

        container.querySelectorAll('.sub-account-checkbox').forEach(label => {
            const checkbox = label.querySelector('input');
            checkbox.addEventListener('change', () => {
                label.classList.toggle('checked', checkbox.checked);
            });
        });
    },

    // 保存员工
    saveEmployee() {
        const name = document.getElementById('emp-form-name').value.trim();
        const account = document.getElementById('emp-form-account').value.trim();
        const password = document.getElementById('emp-form-password').value.trim();
        const status = document.getElementById('emp-form-status').value;

        if (!name || !account || !password) {
            showToast('请填写必填项（姓名、账号、密码）', 'warning');
            return;
        }

        // 获取选中的子账号
        const selectedSubAccounts = [];
        document.querySelectorAll('#emp-sub-accounts input:checked').forEach(cb => {
            selectedSubAccounts.push(parseInt(cb.value));
        });

        // 获取选中的岗位角色
        const selectedPositions = [];
        document.querySelectorAll('#emp-positions input:checked').forEach(cb => {
            selectedPositions.push(cb.value);
        });

        // 获取选中的功能权限
        const selectedFeatures = [];
        document.querySelectorAll('#emp-features input:checked').forEach(cb => {
            selectedFeatures.push(cb.value);
        });

        if (this.editingId) {
            // 编辑现有员工
            const emp = MOCK_AUTH_DATA.employees.find(e => e.id === this.editingId);
            if (emp) {
                // 检查账号唯一性（排除自己）
                const duplicate = MOCK_AUTH_DATA.employees.find(e =>
                    e.account === account && e.id !== this.editingId
                );
                if (duplicate) {
                    showToast('该账号已存在，请使用其他账号', 'error');
                    return;
                }
                const oldName = emp.name;
                emp.name = name;
                emp.account = account;
                emp.password = password;
                emp.role = (selectedPositions[0] || '');
                emp.positions = selectedPositions;
                emp.subAccounts = selectedSubAccounts;
                emp.features = selectedFeatures;
                emp.status = status;
                DataStore.saveEmployeeIndex();

                // 同步更新工资表中的员工姓名（防止姓名不匹配导致员工端看不到工资）
                if (oldName !== name) {
                    const salaryRow = state.salaryData.find(r => r.name === oldName);
                    if (salaryRow) {
                        salaryRow.name = name;
                        DataStore.saveSalary();
                        if (typeof SalaryManager !== 'undefined' && SalaryManager.renderTable) {
                            SalaryManager.renderTable();
                        }
                    }
                }
                // 更新员工文件夹中的名称
                DataStore.appendEmployeeLog(this.editingId, `员工信息已更新`);
                showToast(`员工「${name}」信息已更新`, 'success');
            }
        } else {
            // 添加新员工
            const duplicate = MOCK_AUTH_DATA.employees.find(e => e.account === account);
            if (duplicate) {
                showToast('该账号已存在，请使用其他账号', 'error');
                return;
            }
            const newId = Math.max(...MOCK_AUTH_DATA.employees.map(e => e.id), 0) + 1;
            MOCK_AUTH_DATA.employees.push({
                id: newId,
                name,
                account,
                password,
                role: (selectedPositions[0] || ''),
                positions: selectedPositions,
                subAccounts: selectedSubAccounts,
                features: selectedFeatures,
                status,
            });
            // 创建员工"文件夹"
            DataStore.createEmployeeFolder(newId, name);
            DataStore.saveEmployeeIndex();
            showToast(`员工「${name}」已添加，数据文件夹已创建`, 'success');
        }

        this.hideForm();
        this.renderTable();

        // 同步工资管理：新员工自动加入工资表，删除的员工自动移除
        if (typeof SalaryManager !== 'undefined' && SalaryManager.syncFromEmployees) {
            SalaryManager.syncFromEmployees();
        }
        // 同步仪表板统计卡片（工资总额/运营成本可能变化）
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateStatCards();
        }
    },

    // 删除员工（同时删除文件夹和所有数据）
    deleteEmployee(id) {
        const emp = MOCK_AUTH_DATA.employees.find(e => e.id === id);
        if (!emp) return;

        if (!confirm(`确定要删除员工「${emp.name}」吗？\n该员工的所有数据（短视频预警、文案、自动化浏览器数据、日志等）将同时删除，此操作不可撤销。`)) return;

        const index = MOCK_AUTH_DATA.employees.findIndex(e => e.id === id);
        MOCK_AUTH_DATA.employees.splice(index, 1);

        // 删除员工"文件夹"及所有数据
        DataStore.deleteEmployeeFolder(id);
        DataStore.saveEmployeeIndex();

        // 同时从工资数据中移除
        const salIdx = state.salaryData.findIndex(r => r.name === emp.name);
        if (salIdx >= 0) state.salaryData.splice(salIdx, 1);

        this.renderTable();
        showToast(`员工「${emp.name}」及所有数据已删除`, 'info');

        // 同步工资管理：移除已删除员工的工资行
        if (typeof SalaryManager !== 'undefined' && SalaryManager.syncFromEmployees) {
            SalaryManager.syncFromEmployees();
        }
        // 同步仪表板统计卡片
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateStatCards();
        }
    },

    // 更新统计
    updateSummary() {
        const total = MOCK_AUTH_DATA.employees.length;
        const active = MOCK_AUTH_DATA.employees.filter(e => e.status === 'active').length;
        document.getElementById('employee-count').textContent = total;
        document.getElementById('employee-active-count').textContent = active;
    },
};

/* ============================================================
   模块十：子账号管理（管理员专用）- 三级分类体系
   一级分类 → 二级分类（平台） → 三级分类（子账号）
   ============================================================ */
const SubAccountManager = {
    editingId: null,
    expandedCategories: new Set(),

    init() {
        document.getElementById('add-subaccount-btn').addEventListener('click', () => this.showForm());
        document.getElementById('save-subaccount-btn').addEventListener('click', () => this.saveSubAccount());
        document.getElementById('cancel-subaccount-btn').addEventListener('click', () => this.hideForm());

        // 一级分类下拉变化 → 联动二级分类
        document.getElementById('sub-cat-level1').addEventListener('change', (e) => {
            this.populateLevel2(e.target.value);
        });

        // 分类管理按钮
        document.getElementById('add-cat1-btn').addEventListener('click', () => this.addCategory1());
        document.getElementById('add-cat2-btn').addEventListener('click', () => this.addCategory2());

        this.renderTreeView();
        this.renderTable();
        this.renderCategoryManagement();
        this.updateSummary();
    },

    // 填充一级分类下拉
    populateLevel1(selected = null) {
        const select = document.getElementById('sub-cat-level1');
        select.innerHTML = '<option value="">请选择一级分类</option>';
        MOCK_DATA.subAccountCategories.level1.forEach(cat => {
            select.innerHTML += `<option value="${cat.id}" ${selected === cat.id ? 'selected' : ''}>${cat.name}</option>`;
        });
    },

    // 联动填充二级分类
    populateLevel2(level1Id, selected = null) {
        const select = document.getElementById('sub-cat-level2');
        const level2List = MOCK_DATA.subAccountCategories.level2[level1Id] || [];
        select.innerHTML = '<option value="">请选择二级分类</option>';
        level2List.forEach(cat => {
            select.innerHTML += `<option value="${cat.id}" ${selected === cat.id ? 'selected' : ''}>${cat.name}</option>`;
        });
    },

    // 获取分类名称
    getCategoryName(level1Id) {
        const cat = MOCK_DATA.subAccountCategories.level1.find(c => c.id === level1Id);
        return cat ? cat.name : '未分类';
    },

    getPlatformName(level1Id, level2Id) {
        const level2List = MOCK_DATA.subAccountCategories.level2[level1Id] || [];
        const plat = level2List.find(p => p.id === level2Id);
        return plat ? plat.name : '未分类';
    },

    // 渲染树形视图（三级分类展开/折叠）
    renderTreeView() {
        const container = document.getElementById('subaccount-tree');
        container.innerHTML = '';

        MOCK_DATA.subAccountCategories.level1.forEach(cat1 => {
            const level2List = MOCK_DATA.subAccountCategories.level2[cat1.id] || [];
            const subAccountsInCat = MOCK_DATA.subAccounts.filter(a => a.category1 === cat1.id);
            const isExpanded = this.expandedCategories.has(cat1.id);

            // 一级分类节点
            container.innerHTML += `
                <div class="tree-node tree-level1">
                    <div class="tree-header" onclick="SubAccountManager.toggleCategory('${cat1.id}')">
                        <span class="tree-toggle">${isExpanded ? '▼' : '▶'}</span>
                        <span class="tree-icon">📂</span>
                        <span class="tree-label">${cat1.name}</span>
                        <span class="tree-count">${subAccountsInCat.length} 个子账号</span>
                    </div>
                    <div class="tree-children" style="display:${isExpanded ? 'block' : 'none'};" id="tree-children-${cat1.id}">
            `;

            // 二级分类
            level2List.forEach(cat2 => {
                const subAccountsInPlat = subAccountsInCat.filter(a => a.category2 === cat2.id);

                container.innerHTML += `
                    <div class="tree-node tree-level2">
                        <div class="tree-header" onclick="SubAccountManager.toggleCategory('${cat1.id}-${cat2.id}')">
                            <span class="tree-toggle">${this.expandedCategories.has(cat1.id + '-' + cat2.id) ? '▼' : '▶'}</span>
                            <span class="tree-icon">📱</span>
                            <span class="tree-label">${cat2.name}</span>
                            <span class="tree-count">${subAccountsInPlat.length} 个</span>
                        </div>
                        <div class="tree-children" style="display:${this.expandedCategories.has(cat1.id + '-' + cat2.id) ? 'block' : 'none'};">
                `;

                // 三级分类（子账号列表）
                subAccountsInPlat.forEach(acc => {
                    const statusTag = acc.status === 'active'
                        ? '<span class="tag tag-success">正常</span>'
                        : '<span class="tag tag-warning">预警</span>';
                    container.innerHTML += `
                        <div class="tree-node tree-level3">
                            <div class="tree-header tree-leaf">
                                <span class="tree-icon-dot"></span>
                                <span class="tree-label">${acc.name}</span>
                                <span class="tree-meta">文案${acc.copyTotal}/${acc.copyRemaining} 视频${acc.videoTotal}/${acc.videoRemaining}</span>
                                ${statusTag}
                                <div class="tree-actions">
                                    <button class="btn btn-sm btn-outline" onclick="SubAccountManager.showForm(${acc.id}); event.stopPropagation();">编辑</button>
                                    <button class="btn-icon" onclick="SubAccountManager.deleteSubAccount(${acc.id}); event.stopPropagation();" title="删除">✕</button>
                                </div>
                            </div>
                        </div>
                    `;
                });

                if (subAccountsInPlat.length === 0) {
                    container.innerHTML += `<div class="tree-empty">暂无子账号，点击上方"添加子账号"创建</div>`;
                }

                container.innerHTML += `</div></div>`;
            });

            container.innerHTML += `</div></div>`;
        });
    },

    // 展开/折叠分类
    toggleCategory(catId) {
        if (this.expandedCategories.has(catId)) {
            this.expandedCategories.delete(catId);
        } else {
            this.expandedCategories.add(catId);
        }
        this.renderTreeView();
    },

    // 渲染表格视图
    renderTable() {
        const tbody = document.getElementById('subaccount-table-body');
        tbody.innerHTML = '';

        MOCK_DATA.subAccounts.forEach(acc => {
            const cat1Name = this.getCategoryName(acc.category1);
            const cat2Name = this.getPlatformName(acc.category1, acc.category2);
            const statusTag = acc.status === 'active'
                ? '<span class="tag tag-success">正常</span>'
                : '<span class="tag tag-warning">预警</span>';

            tbody.innerHTML += `
                <tr>
                    <td><span class="badge badge-cat">${cat1Name}</span></td>
                    <td><span class="badge badge-plat">${cat2Name}</span></td>
                    <td><strong>${acc.name}</strong></td>
                    <td>${acc.copyTotal}</td>
                    <td>${acc.copyRemaining}</td>
                    <td>${acc.videoTotal}</td>
                    <td>${acc.videoRemaining}</td>
                    <td>${statusTag}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="SubAccountManager.showForm(${acc.id})">编辑</button>
                        <button class="btn-icon" onclick="SubAccountManager.deleteSubAccount(${acc.id})" title="删除">✕</button>
                    </td>
                </tr>
            `;
        });
    },

    // 显示添加/编辑表单
    showForm(accId = null) {
        this.editingId = accId;
        const area = document.getElementById('subaccount-form-area');
        const title = document.getElementById('subaccount-form-title');

        if (accId) {
            const acc = MOCK_DATA.subAccounts.find(a => a.id === accId);
            if (!acc) return;
            title.textContent = `编辑子账号：${acc.name}`;
            this.populateLevel1(acc.category1);
            this.populateLevel2(acc.category1, acc.category2);
            document.getElementById('sub-form-name').value = acc.name;
            document.getElementById('sub-form-copy-total').value = acc.copyTotal;
            document.getElementById('sub-form-copy-remaining').value = acc.copyRemaining;
            document.getElementById('sub-form-video-total').value = acc.videoTotal;
            document.getElementById('sub-form-video-remaining').value = acc.videoRemaining;
            document.getElementById('sub-form-status').value = acc.status;
        } else {
            title.textContent = '添加新子账号';
            this.populateLevel1();
            this.populateLevel2('');
            document.getElementById('sub-form-name').value = '';
            document.getElementById('sub-form-copy-total').value = '0';
            document.getElementById('sub-form-copy-remaining').value = '0';
            document.getElementById('sub-form-video-total').value = '0';
            document.getElementById('sub-form-video-remaining').value = '0';
            document.getElementById('sub-form-status').value = 'active';
        }

        area.style.display = 'block';
        area.scrollIntoView({ behavior: 'smooth' });
    },

    // 隐藏表单
    hideForm() {
        document.getElementById('subaccount-form-area').style.display = 'none';
        this.editingId = null;
    },

    // 保存子账号
    saveSubAccount() {
        const name = document.getElementById('sub-form-name').value.trim();
        const category1 = document.getElementById('sub-cat-level1').value;
        const category2 = document.getElementById('sub-cat-level2').value;
        const copyTotal = parseInt(document.getElementById('sub-form-copy-total').value) || 0;
        const copyRemaining = parseInt(document.getElementById('sub-form-copy-remaining').value) || 0;
        const videoTotal = parseInt(document.getElementById('sub-form-video-total').value) || 0;
        const videoRemaining = parseInt(document.getElementById('sub-form-video-remaining').value) || 0;
        const status = document.getElementById('sub-form-status').value;

        if (!name || !category1 || !category2) {
            showToast('请填写必填项（名称、一级分类、二级分类）', 'warning');
            return;
        }

        if (this.editingId) {
            const acc = MOCK_DATA.subAccounts.find(a => a.id === this.editingId);
            if (acc) {
                acc.name = name;
                acc.category1 = category1;
                acc.category2 = category2;
                acc.copyTotal = copyTotal;
                acc.copyRemaining = copyRemaining;
                acc.videoTotal = videoTotal;
                acc.videoRemaining = videoRemaining;
                acc.status = status;
                DataStore.saveSubAccountIndex();
                showToast(`子账号「${name}」已更新`, 'success');
            }
        } else {
            const newId = Math.max(...MOCK_DATA.subAccounts.map(a => a.id), 0) + 1;
            MOCK_DATA.subAccounts.push({
                id: newId,
                name,
                category1,
                category2,
                copyTotal,
                copyRemaining,
                videoTotal,
                videoRemaining,
                status,
            });
            DataStore.saveSubAccountIndex();
            showToast(`子账号「${name}」已添加`, 'success');
        }

        this.hideForm();
        this.renderTreeView();
        this.renderTable();
        this.updateSummary();

        // 同步所有关联模块（仪表板 + 员工管理）
        this.syncAll();
    },

    // 删除子账号
    deleteSubAccount(id) {
        const acc = MOCK_DATA.subAccounts.find(a => a.id === id);
        if (!acc) return;

        if (!confirm(`确定要删除子账号「${acc.name}」吗？此操作不可撤销。`)) return;

        const index = MOCK_DATA.subAccounts.findIndex(a => a.id === id);
        MOCK_DATA.subAccounts.splice(index, 1);
        DataStore.saveSubAccountIndex();
        this.renderTreeView();
        this.renderTable();
        this.updateSummary();
        showToast(`子账号「${acc.name}」已删除`, 'info');

        // 同步所有关联模块
        this.syncAll();
    },

    // 更新统计
    updateSummary() {
        const total = MOCK_DATA.subAccounts.length;
        const active = MOCK_DATA.subAccounts.filter(a => a.status === 'active').length;
        const cat1Count = MOCK_DATA.subAccountCategories.level1.length;
        const cat2Count = Object.values(MOCK_DATA.subAccountCategories.level2).flat().length;

        document.getElementById('subaccount-count').textContent = total;
        document.getElementById('subaccount-active-count').textContent = active;
        document.getElementById('subaccount-cat1-count').textContent = cat1Count;
        document.getElementById('subaccount-cat2-count').textContent = cat2Count;
    },

    // ====== 分类管理 ======

    // 渲染分类管理区域
    renderCategoryManagement() {
        // 一级分类列表
        const cat1List = document.getElementById('cat1-list');
        cat1List.innerHTML = '';
        MOCK_DATA.subAccountCategories.level1.forEach(cat => {
            const childCount = (MOCK_DATA.subAccountCategories.level2[cat.id] || []).length;
            const subAccCount = MOCK_DATA.subAccounts.filter(a => a.category1 === cat.id).length;
            cat1List.innerHTML += `
                <div class="cat-mgmt-item">
                    <span class="cat-icon">📂</span>
                    <span class="cat-name">${cat.name}</span>
                    <span class="cat-meta">${childCount}个二级 / ${subAccCount}个子账号</span>
                    <button class="btn-icon" onclick="SubAccountManager.deleteCategory1('${cat.id}')" title="删除">✕</button>
                </div>
            `;
        });
        if (MOCK_DATA.subAccountCategories.level1.length === 0) {
            cat1List.innerHTML = '<div class="cat-empty">暂无一级分类，请在下方添加</div>';
        }

        // 二级分类列表（按一级分类分组）
        const cat2List = document.getElementById('cat2-list');
        cat2List.innerHTML = '';
        MOCK_DATA.subAccountCategories.level1.forEach(cat1 => {
            const level2List = MOCK_DATA.subAccountCategories.level2[cat1.id] || [];
            cat2List.innerHTML += `<div class="cat2-group"><div class="cat2-group-title">${cat1.name}</div>`;
            level2List.forEach(cat2 => {
                const subAccCount = MOCK_DATA.subAccounts.filter(a => a.category2 === cat2.id).length;
                cat2List.innerHTML += `
                    <div class="cat-mgmt-item">
                        <span class="cat-icon">📱</span>
                        <span class="cat-name">${cat2.name}</span>
                        <span class="cat-meta">${subAccCount}个子账号</span>
                        <button class="btn-icon" onclick="SubAccountManager.deleteCategory2('${cat1.id}', '${cat2.id}')" title="删除">✕</button>
                    </div>
                `;
            });
            if (level2List.length === 0) {
                cat2List.innerHTML += '<div class="cat-empty">暂无二级分类</div>';
            }
            cat2List.innerHTML += '</div>';
        });

        // 更新二级分类管理的一级分类下拉
        const cat1Select = document.getElementById('cat2-parent');
        cat1Select.innerHTML = '<option value="">请选择一级分类</option>';
        MOCK_DATA.subAccountCategories.level1.forEach(cat => {
            cat1Select.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
    },

    // 添加一级分类
    addCategory1() {
        const input = document.getElementById('new-cat1-name');
        const name = input.value.trim();
        if (!name) {
            showToast('请输入一级分类名称', 'warning');
            return;
        }

        // 检查重名
        const duplicate = MOCK_DATA.subAccountCategories.level1.find(c => c.name === name);
        if (duplicate) {
            showToast('该一级分类已存在', 'error');
            return;
        }

        const newId = 'cat-' + Date.now();
        MOCK_DATA.subAccountCategories.level1.push({ id: newId, name });
        MOCK_DATA.subAccountCategories.level2[newId] = [];
        DataStore.saveSubAccountIndex();

        input.value = '';
        this.renderCategoryManagement();
        this.renderTreeView();
        this.updateSummary();
        showToast(`一级分类「${name}」已添加`, 'success');
    },

    // 删除一级分类（级联删除：所有二级分类 + 所有子账号）
    deleteCategory1(catId) {
        const cat = MOCK_DATA.subAccountCategories.level1.find(c => c.id === catId);
        if (!cat) return;

        const level2List = MOCK_DATA.subAccountCategories.level2[catId] || [];
        const subAccCount = MOCK_DATA.subAccounts.filter(a => a.category1 === catId).length;

        if (!confirm(`确定要删除一级分类「${cat.name}」吗？\n该分类下有 ${level2List.length} 个二级分类和 ${subAccCount} 个子账号，\n所有二级分类和子账号将同时被删除！此操作不可撤销。`)) return;

        // 级联删除：删除该一级分类下所有子账号
        MOCK_DATA.subAccounts = MOCK_DATA.subAccounts.filter(a => a.category1 !== catId);
        // 删除该一级分类下所有二级分类
        delete MOCK_DATA.subAccountCategories.level2[catId];
        // 删除一级分类本身
        const index = MOCK_DATA.subAccountCategories.level1.findIndex(c => c.id === catId);
        MOCK_DATA.subAccountCategories.level1.splice(index, 1);

        DataStore.saveSubAccountIndex();
        this.renderCategoryManagement();
        this.renderTreeView();
        this.renderTable();
        this.updateSummary();
        showToast(`一级分类「${cat.name}」及其下所有二级分类和子账号已删除`, 'info');

        // 同步仪表板和员工管理
        this.syncAll();
    },

    // 添加二级分类
    addCategory2() {
        const parentCat1 = document.getElementById('cat2-parent').value;
        const name = document.getElementById('new-cat2-name').value.trim();

        if (!parentCat1) {
            showToast('请先选择一级分类', 'warning');
            return;
        }
        if (!name) {
            showToast('请输入二级分类名称', 'warning');
            return;
        }

        const level2List = MOCK_DATA.subAccountCategories.level2[parentCat1] || [];
        const duplicate = level2List.find(c => c.name === name);
        if (duplicate) {
            showToast('该二级分类已存在', 'error');
            return;
        }

        const newId = 'plat-' + Date.now();
        if (!MOCK_DATA.subAccountCategories.level2[parentCat1]) {
            MOCK_DATA.subAccountCategories.level2[parentCat1] = [];
        }
        MOCK_DATA.subAccountCategories.level2[parentCat1].push({ id: newId, name });
        DataStore.saveSubAccountIndex();

        document.getElementById('new-cat2-name').value = '';
        this.renderCategoryManagement();
        this.renderTreeView();
        this.updateSummary();
        showToast(`二级分类「${name}」已添加`, 'success');
    },

    // 删除二级分类（级联删除：其下所有子账号）
    deleteCategory2(cat1Id, cat2Id) {
        const cat1 = MOCK_DATA.subAccountCategories.level1.find(c => c.id === cat1Id);
        const level2List = MOCK_DATA.subAccountCategories.level2[cat1Id] || [];
        const cat2 = level2List.find(c => c.id === cat2Id);
        if (!cat2) return;

        const subAccCount = MOCK_DATA.subAccounts.filter(a => a.category2 === cat2Id).length;

        if (!confirm(`确定要删除二级分类「${cat2.name}」吗？\n该分类下有 ${subAccCount} 个子账号，将同时被删除！此操作不可撤销。`)) return;

        // 级联删除：删除该二级分类下所有子账号
        MOCK_DATA.subAccounts = MOCK_DATA.subAccounts.filter(a => a.category2 !== cat2Id);
        // 删除二级分类本身
        const index = level2List.findIndex(c => c.id === cat2Id);
        level2List.splice(index, 1);

        DataStore.saveSubAccountIndex();
        this.renderCategoryManagement();
        this.renderTreeView();
        this.renderTable();
        this.updateSummary();
        showToast(`二级分类「${cat2.name}」及其下所有子账号已删除`, 'info');

        this.syncAll();
    },

    // 统步同步所有关联模块
    syncAll() {
        if (typeof Dashboard !== 'undefined') {
            Dashboard.populateFilter();
            Dashboard.updateStatCards();
            Dashboard.renderTable();
            Dashboard.refreshCharts();
        }
        if (typeof EmployeeManager !== 'undefined') {
            EmployeeManager.renderTable();
        }
        if (typeof VideoMonitor !== 'undefined') {
            VideoMonitor.render();
        }
        if (typeof CopyMonitor !== 'undefined') {
            CopyMonitor.render();
        }
        if (typeof ShortVideoAlert !== 'undefined') {
            ShortVideoAlert.render();
        }
    },
};

/* ============================================================
   模块：子账号文件夹管理
   管理员：绑定/解绑本地文件夹、查看视频数量
   员工：查看管理员同步的文件夹信息，可打开本地文件夹统计
   ============================================================ */
const FolderManager = {
    // 运行时句柄（不可序列化）{ subAccId: { handle, name, count, timer } }
    folderHandles: {},

    init() {
        this.loadFolderData();
        this.render();
        // 启动已绑定文件夹的自动刷新（Electron 使用真实路径，Web 使用 File System Access handle）
        Object.keys(this.folderHandles).forEach(id => {
            const info = this.folderHandles[id];
            if (this.canMonitor(info)) {
                this.startMonitoring(parseInt(id));
            }
        });
    },

    // 判断文件夹信息是否具备自动/手动刷新条件
    canMonitor(info) {
        if (!info) return false;
        if (window.electronAPI) return !!(info.handle || info.path);
        return !!info.handle;
    },

    // 从 localStorage / 云端恢复文件夹元数据（不含 handle）
    loadFolderData() {
        // 元数据保存在独立 key，避免与 Dashboard 的纯数字映射冲突
        let saved = localStorage.getItem('yuangongguanli/_folderHandles');
        // 兼容旧数据：老版本使用 _folderData 同时保存元数据
        if (!saved) {
            saved = localStorage.getItem('yuangongguanli/_folderData');
        }
        if (!saved) return;
        try {
            const data = JSON.parse(saved);
            Object.keys(data).forEach(id => {
                const numId = parseInt(id);
                const item = data[id];
                // 兼容旧数据：旧版保存的是 { name, count } 对象
                const count = (item && typeof item === 'object') ? item.count : item;
                this.folderHandles[numId] = {
                    handle: null,
                    name: item.name || '—',
                    path: item.path || '',
                    count: typeof count === 'number' ? count : '—',
                    timer: null,
                };
                // 同时写入 MOCK_DATA 供 Dashboard 使用
                if (!MOCK_DATA.folderVideoCounts) MOCK_DATA.folderVideoCounts = {};
                MOCK_DATA.folderVideoCounts[numId] = count || 0;
            });
        } catch (e) { /* ignore */ }
    },

    // 保存文件夹元数据到 localStorage / 云端
    saveFolderData() {
        const data = {};
        Object.keys(this.folderHandles).forEach(id => {
            const info = this.folderHandles[id];
            if (info?.name || info?.path) {
                const numId = parseInt(id);
                const count = typeof info.count === 'number' ? info.count : 0;
                data[numId] = { name: info.name || '', path: info.path || '', count: count };
                if (!MOCK_DATA.folderVideoCounts) MOCK_DATA.folderVideoCounts = {};
                MOCK_DATA.folderVideoCounts[numId] = count;
            }
        });
        localStorage.setItem('yuangongguanli/_folderHandles', JSON.stringify(data));
        // 同步保存 Dashboard 需要的纯数字映射
        DataStore.saveFolderVideoCounts();
    },

    render() {
        const container = document.getElementById('folder-manager-content');
        if (!container) return;

        const subAccounts = MOCK_DATA.subAccounts;
        const isAdmin = Auth.isAdmin();

        if (subAccounts.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align:center;padding:60px 20px;color:var(--color-text-light);">
                    <div style="font-size:48px;margin-bottom:12px;">&#128193;</div>
                    <p>暂无子账号，请先在"子账号管理"中添加子账号</p>
                </div>
            `;
            return;
        }

        const hintText = isAdmin
            ? '点击"选择文件夹"直接选取本地视频文件夹，绑定后每3秒自动刷新视频数量。首次点击"打开文件夹"时需补录完整路径，之后会自动按路径调用文件资源管理器。'
            : '此处显示管理员绑定的子账号文件夹路径及视频数量。管理员设置完整路径后，才可点击"打开文件夹"调用本地文件资源管理器；未设置时无法操作。';

        let html = `
            <div class="folder-manager-info" style="background:var(--color-bg-secondary);border-radius:12px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:12px;">
                <span style="font-size:24px;">&#128161;</span>
                <div>
                    <strong>使用说明</strong>
                    <p style="margin:4px 0 0;font-size:13px;color:var(--color-text-light);">${hintText}</p>
                </div>
            </div>
            <div class="table-header" style="margin-bottom:16px;">
                <h3>文件夹列表</h3>
                <div style="display:flex;gap:12px;align-items:center;">
                    <button class="btn btn-primary btn-sm" onclick="FolderManager.refreshAll()">
                        <span style="margin-right:4px;">&#128260;</span>全部刷新
                    </button>
                    <span id="folder-last-refresh" style="font-size:12px;color:var(--color-text-light);"></span>
                </div>
            </div>
            <div class="table-wrapper">
                <table class="data-table" id="folder-manager-table">
                    <thead>
                        <tr>
                            <th style="width:40px;">#</th>
                            <th>子账号名称</th>
                            <th>分类</th>
                            <th>绑定文件夹路径</th>
                            <th>视频数量</th>
                            <th>状态</th>
                            <th style="width:220px;">操作</th>
                        </tr>
                    </thead>
                    <tbody id="folder-manager-tbody">
        `;

        subAccounts.forEach((acc, idx) => {
            const cat1Name = this.getCat1Name(acc.category1);
            const cat2Name = this.getCat2Name(acc.category1, acc.category2);
            const catText = [cat1Name, cat2Name].filter(Boolean).join(' / ') || '未分类';
            const handleInfo = this.folderHandles[acc.id];
            const folderPath = handleInfo?.path || handleInfo?.name || '—';
            const videoCount = handleInfo?.count ?? '—';
            const isBound = !!(handleInfo?.path || handleInfo?.name);

            html += `
                <tr id="folder-row-${acc.id}">
                    <td>${idx + 1}</td>
                    <td><strong>${acc.name}</strong></td>
                    <td><span class="badge badge-cat">${catText}</span></td>
                    <td id="folder-name-${acc.id}" title="${this.escapeHtml(folderPath)}">${this.escapeHtml(folderPath)}</td>
                    <td>
                        <span id="folder-count-${acc.id}" style="font-size:18px;font-weight:700;color:${isBound ? '#f59e0b' : 'var(--color-text-light)'};">${videoCount}</span>
                        ${isBound ? '<span class="folder-count-unit" style="font-size:12px;color:var(--color-text-light);"> 个</span>' : ''}
                    </td>
                    <td id="folder-status-${acc.id}">
                        ${isBound
                            ? '<span class="badge badge-active">已绑定</span>'
                            : '<span class="badge" style="background:#f1f5f9;color:var(--color-text-light);">未绑定</span>'}
                    </td>
                    <td id="folder-actions-${acc.id}">
                        ${this.renderActions(acc.id, isBound, isAdmin)}
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    },

    // 根据角色渲染操作按钮
    renderActions(subAccId, isBound, isAdmin) {
        if (isAdmin) {
            if (isBound) {
                return `
                    <button class="btn btn-sm btn-primary" onclick="FolderManager.refreshRow(${subAccId})" style="margin-right:6px;" title="刷新该文件夹视频数量">刷新</button>
                    <button class="btn btn-sm btn-primary" onclick="FolderManager.selectFolder(${subAccId})" style="margin-right:6px;">重新选择</button>
                    <button class="btn btn-sm btn-success" onclick="FolderManager.openFolder(${subAccId})" style="margin-right:6px;">打开文件夹</button>
                    <button class="btn btn-sm btn-danger" onclick="FolderManager.unbindFolder(${subAccId})">解绑</button>
                `;
            }
            return `
                <button class="btn btn-sm btn-primary" onclick="FolderManager.selectFolder(${subAccId})" style="margin-right:6px;">选择文件夹</button>
                <button class="btn btn-sm btn-success" onclick="FolderManager.openFolder(${subAccId})">打开文件夹</button>
            `;
        }
        // 员工：只有管理员已设置完整路径时才可打开/刷新，否则提示
        const info = this.folderHandles[subAccId];
        const hasPath = !!(info && info.path);
        if (hasPath) {
            return `
                <button class="btn btn-sm btn-primary" onclick="FolderManager.refreshRow(${subAccId})" style="margin-right:6px;" title="刷新该文件夹视频数量">刷新</button>
                <button class="btn btn-sm btn-success" onclick="FolderManager.openFolder(${subAccId})">打开文件夹</button>
            `;
        }
        return `<span style="color:var(--color-text-light);font-size:13px;">待管理员设置文件路径</span>`;
    },

    // 选择并绑定本地文件夹（管理员）：选择文件夹后同时补录完整路径
    async selectFolder(subAccId) {
        // Electron 桌面版：用原生对话框选择文件夹，直接拿到真实完整路径
        if (window.electronAPI && window.electronAPI.selectFolder) {
            await this.electronSelectFolder(subAccId);
            return;
        }

        if (!window.showDirectoryPicker) {
            showToast('当前浏览器不支持文件夹访问，请使用Chrome/Edge', 'warning');
            return;
        }

        try {
            const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
            const count = await this.countVideos(dirHandle);

            // 保留旧路径（重新选择时不用再次输入）
            const oldInfo = this.folderHandles[subAccId] || {};

            // 浏览器无法直接返回完整路径，首次绑定时提示用户补录
            let folderPath = oldInfo.path || '';
            if (!folderPath) {
                const inputPath = prompt(`已选择文件夹“${dirHandle.name}”。\n请粘贴该文件夹的完整路径（例如 D:\\Videos\\账号名），以便“打开文件夹”和路径展示：`, folderPath);
                if (inputPath && inputPath.trim()) {
                    folderPath = inputPath.trim();
                }
            }

            this.stopMonitoring(subAccId);
            this.folderHandles[subAccId] = {
                handle: dirHandle,
                name: dirHandle.name,
                path: folderPath,
                count: count,
                timer: null,
            };

            this.saveFolderData();
            this.updateRow(subAccId);
            this.startMonitoring(subAccId);

            showToast(`已绑定文件夹：${dirHandle.name}${folderPath ? '（' + folderPath + '）' : ''}，视频数量每3秒自动刷新`, 'success');
        } catch (err) {
            if (err.name !== 'AbortError') {
                showToast('无法访问文件夹', 'warning');
            }
        }
    },

    // 打开本地文件夹（管理员/员工均可）：优先使用已绑定路径打开文件资源管理器
    async openFolder(subAccId) {
        // Electron 桌面版：直接调起系统资源管理器打开真实路径
        if (window.electronAPI && window.electronAPI.openFolder) {
            const info = this.folderHandles[subAccId] || {};
            let folderPath = info.path || '';
            if (!folderPath) {
                folderPath = await this.electronSelectFolder(subAccId);
                if (!folderPath) return;
            }
            const ok = await window.electronAPI.openFolder(folderPath);
            showToast(ok ? `已在资源管理器中打开：${folderPath}` : `无法打开：${folderPath}`, ok ? 'success' : 'warning');
            if (ok) {
                this.refreshSingle(subAccId).then(() => this.updateLastRefreshTime());
            }
            return;
        }

        let info = this.folderHandles[subAccId];
        let folderPath = info?.path || '';

        // 浏览器无法通过选择器获取真实完整路径，首次打开时补录
        if (!folderPath) {
            const inputPath = prompt('浏览器无法自动获取文件夹完整路径，请粘贴该文件夹的完整路径（例如 D:\\Videos\\账号名）：');
            if (!inputPath || !inputPath.trim()) {
                showToast('未输入文件夹路径，已取消打开', 'info');
                return;
            }
            folderPath = inputPath.trim();
            // 保存路径供后续使用
            if (!info) {
                this.folderHandles[subAccId] = { handle: null, name: '', path: folderPath, count: '—', timer: null };
            } else {
                info.path = folderPath;
            }
            this.saveFolderData();
            this.updateRow(subAccId);
        }

        // 尝试调用系统文件资源管理器打开该路径
        try {
            const fileUrl = folderPath.startsWith('file:') ? folderPath : 'file:///' + folderPath.replace(/\\/g, '/');
            // 使用锚点点击提高浏览器放行概率
            const a = document.createElement('a');
            a.href = fileUrl;
            a.target = '_blank';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();

            // 短暂延迟后检测是否被拦截（弹窗通常立即打开，closed 仍为 true 表示被拦截或未成功）
            setTimeout(() => {
                showToast(`请在文件资源管理器中打开：${folderPath}`, 'info');
            }, 300);
            showToast(`正在打开文件夹：${folderPath}`, 'success');

            // 打开文件夹后顺手刷新该账号视频数量
            this.refreshSingle(subAccId).then(() => {
                this.updateLastRefreshTime();
            });
        } catch (e) {
            // 被拦截时复制路径到剪贴板，方便用户手动打开
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(folderPath).then(() => {
                    showToast(`路径已复制到剪贴板，请手动打开：${folderPath}`, 'info');
                }).catch(() => {
                    showToast(`请在文件资源管理器中打开：${folderPath}`, 'info');
                });
            } else {
                showToast(`请在文件资源管理器中打开：${folderPath}`, 'info');
            }
        }
    },

    // 统计文件夹中的视频文件数量
    async countVideos(dirHandle) {
        const videoExts = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm', '.m4v', '.ts', '.rmvb'];
        let count = 0;
        try {
            for await (const entry of dirHandle.values()) {
                if (entry.kind === 'file') {
                    const name = entry.name.toLowerCase();
                    if (videoExts.some(ext => name.endsWith(ext))) {
                        count++;
                    }
                }
            }
        } catch (e) { /* 权限丢失 */ }
        return count;
    },

    // 启动自动监控
    startMonitoring(subAccId) {
        const info = this.folderHandles[subAccId];
        if (!info || info.timer || !this.canMonitor(info)) return;
        info.timer = setInterval(() => {
            this.refreshSingle(subAccId);
        }, 3000);
    },

    // Electron 桌面版：用原生对话框选择文件夹并拿到真实完整路径
    async electronSelectFolder(subAccId) {
        const p = await window.electronAPI.selectFolder();
        if (!p) return null;
        const name = (p.split(/[\\/]/).pop()) || p;
        const count = window.electronAPI.countVideos ? await window.electronAPI.countVideos(p) : '—';
        this.stopMonitoring(subAccId);
        this.folderHandles[subAccId] = { handle: null, name, path: p, count, timer: null };
        this.saveFolderData();
        this.updateRow(subAccId);
        this.startMonitoring(subAccId);
        return p;
    },

    // 刷新单个子账号的视频数量
    async refreshSingle(subAccId) {
        const info = this.folderHandles[subAccId];
        // Electron 桌面版：通过真实路径统计（handle 为 null 时）
        if (window.electronAPI && info && info.path && !info.handle) {
            try {
                const count = await window.electronAPI.countVideos(info.path);
                info.count = count;
                this.saveFolderData();
                this.updateRow(subAccId);
            } catch (err) {
                this.stopMonitoring(subAccId);
            }
            return;
        }

        if (!info?.handle) return;

        try {
            const count = await this.countVideos(info.handle);
            info.count = count;
            this.saveFolderData();
            this.updateRow(subAccId);
        } catch (err) {
            this.stopMonitoring(subAccId);
            showToast(`子账号文件夹访问失败，已停止监控`, 'warning');
        }
    },

    // 刷新所有监控中的文件夹
    async refreshAll() {
        const ids = Object.keys(this.folderHandles).filter(id => this.canMonitor(this.folderHandles[id]));
        if (ids.length === 0) {
            showToast('暂无已绑定的文件夹', 'info');
            return;
        }

        for (const id of ids) {
            await this.refreshSingle(parseInt(id));
        }

        this.updateLastRefreshTime();
        showToast(`已刷新 ${ids.length} 个文件夹`, 'success');
    },

    // 更新顶部最后刷新时间显示
    updateLastRefreshTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const el = document.getElementById('folder-last-refresh');
        if (el) el.textContent = `最后刷新：${timeStr}`;
    },

    // 手动刷新单个子账号（带权限提示，供操作列按钮调用）
    async refreshRow(subAccId) {
        const info = this.folderHandles[subAccId];
        if (!this.canMonitor(info)) {
            showToast('暂无文件夹访问权限，无法刷新', 'info');
            return;
        }
        await this.refreshSingle(subAccId);
        this.updateLastRefreshTime();
        showToast('已刷新视频数量', 'success');
    },

    // 解绑文件夹
    unbindFolder(subAccId) {
        this.stopMonitoring(subAccId);
        delete this.folderHandles[subAccId];
        if (MOCK_DATA.folderVideoCounts) {
            delete MOCK_DATA.folderVideoCounts[subAccId];
        }
        this.saveFolderData();
        this.updateRow(subAccId);
        showToast('已解绑文件夹', 'info');
    },

    // 停止监控（清除定时器）
    stopMonitoring(subAccId) {
        const info = this.folderHandles[subAccId];
        if (info?.timer) {
            clearInterval(info.timer);
            info.timer = null;
        }
    },

    // 更新单行UI
    updateRow(subAccId) {
        const info = this.folderHandles[subAccId];
        const nameEl = document.getElementById(`folder-name-${subAccId}`);
        const countEl = document.getElementById(`folder-count-${subAccId}`);
        const statusEl = document.getElementById(`folder-status-${subAccId}`);
        const actionsEl = document.getElementById(`folder-actions-${subAccId}`);

        if (!nameEl) return;

        const displayPath = info?.path || info?.name || '—';
        const isBound = !!(info?.path || info?.name);
        if (isBound) {
            nameEl.textContent = displayPath;
            nameEl.title = displayPath;
            if (countEl) {
                countEl.textContent = info.count;
                countEl.style.color = '#f59e0b';
                countEl.style.fontWeight = '700';
            }
            if (statusEl) {
                statusEl.innerHTML = '<span class="badge badge-active">已绑定</span>';
            }
        } else {
            nameEl.textContent = '—';
            if (countEl) {
                countEl.textContent = '—';
                countEl.style.color = 'var(--color-text-light)';
                countEl.style.fontWeight = '400';
            }
            if (statusEl) {
                statusEl.innerHTML = '<span class="badge" style="background:#f1f5f9;color:var(--color-text-light);">未绑定</span>';
            }
        }

        // 处理数量单位
        if (countEl) {
            const parent = countEl.parentElement;
            let unitEl = parent.querySelector('.folder-count-unit');
            if (isBound) {
                if (!unitEl) {
                    unitEl = document.createElement('span');
                    unitEl.className = 'folder-count-unit';
                    unitEl.style.cssText = 'font-size:12px;color:var(--color-text-light);';
                    unitEl.textContent = ' 个';
                    parent.appendChild(unitEl);
                }
            } else if (unitEl) {
                unitEl.remove();
            }
        }

        // 更新操作按钮
        if (actionsEl) {
            actionsEl.innerHTML = this.renderActions(subAccId, isBound, Auth.isAdmin());
        }
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return str.toString().replace(/[&<>"']/g, m =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    },

    getCat1Name(catId) {
        const cat = MOCK_DATA.subAccountCategories.level1.find(c => c.id === catId);
        return cat ? cat.name : '';
    },

    getCat2Name(cat1Id, cat2Id) {
        const list = MOCK_DATA.subAccountCategories.level2[cat1Id] || [];
        const cat = list.find(c => c.id === cat2Id);
        return cat ? cat.name : '';
    },

    // 页面切换离开时清理所有定时器
    destroy() {
        Object.keys(this.folderHandles).forEach(id => {
            this.stopMonitoring(parseInt(id));
        });
    },
};

/* ============================================================
   模块十：视频数据监控（管理员专用）
   ============================================================ */
const VideoMonitor = {
    init() {
        this.render();
    },

    // 获取子账号的视频预警状态
    getStatus(acc) {
        const threshold = MOCK_DATA.alertThresholds[acc.id]?.video || 40;
        if (acc.videoRemaining <= 0) return 'danger';
        if (acc.videoRemaining <= threshold) return 'warning';
        return 'normal';
    },

    render() {
        const container = document.getElementById('video-monitor-content');
        if (!container) return;
        container.innerHTML = '';

        const cardsRow = document.createElement('div');
        cardsRow.className = 'monitor-summary-cards';

        const totalAccounts = MOCK_DATA.subAccounts.length;
        const warningCount = MOCK_DATA.subAccounts.filter(a => this.getStatus(a) === 'warning').length;
        const dangerCount = MOCK_DATA.subAccounts.filter(a => this.getStatus(a) === 'danger').length;
        const totalRemaining = MOCK_DATA.subAccounts.reduce((s, a) => s + a.videoRemaining, 0);

        cardsRow.innerHTML = `
            <div class="monitor-card mc-blue">
                <div class="mc-icon">&#127909;</div>
                <div class="mc-info"><span class="mc-label">监控账号数</span><span class="mc-value">${totalAccounts}</span></div>
            </div>
            <div class="monitor-card mc-green">
                <div class="mc-icon">&#128230;</div>
                <div class="mc-info"><span class="mc-label">视频剩余总量</span><span class="mc-value">${totalRemaining}</span></div>
            </div>
            <div class="monitor-card mc-orange">
                <div class="mc-icon">&#9888;</div>
                <div class="mc-info"><span class="mc-label">预警账号</span><span class="mc-value">${warningCount}</span></div>
            </div>
            <div class="monitor-card mc-red">
                <div class="mc-icon">&#128680;</div>
                <div class="mc-info"><span class="mc-label">报警账号</span><span class="mc-value">${dangerCount}</span></div>
            </div>
        `;
        container.appendChild(cardsRow);

        // 预警阈值设置区
        const thresholdSection = document.createElement('div');
        thresholdSection.className = 'cost-section';
        thresholdSection.innerHTML = `
            <div class="sub-section-header">
                <h4>预警阈值设置</h4>
                <span class="chart-badge">视频剩余低于此值时显示预警（最大30）</span>
            </div>
            <p class="form-hint" style="margin-bottom:12px;">设置每个子账号的视频剩余数量预警值，当存量低于该值时自动标红提醒</p>
            <div class="monitor-threshold-list" id="video-threshold-list"></div>
            <div class="form-actions" style="margin-top:12px;">
                <button class="btn btn-primary btn-sm" id="save-video-threshold-btn">保存阈值设置</button>
            </div>
        `;
        container.appendChild(thresholdSection);

        // 详细监控表格
        const tableSection = document.createElement('div');
        tableSection.className = 'data-table-card';
        tableSection.style.marginTop = '20px';
        tableSection.innerHTML = `
            <div class="table-header"><h3>视频数据监控详情</h3></div>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>子账号名称</th>
                            <th>视频总数</th>
                            <th>视频剩余</th>
                            <th>已发布</th>
                            <th>完成率</th>
                            <th>预警阈值</th>
                            <th>状态</th>
                        </tr>
                    </thead>
                    <tbody id="video-monitor-tbody"></tbody>
                </table>
            </div>
        `;
        container.appendChild(tableSection);

        // 渲染阈值列表
        this.renderThresholdList();
        // 渲染监控表格
        this.renderTable();
        // 绑定保存按钮
        const saveBtn = document.getElementById('save-video-threshold-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveThresholds());
    },

    renderThresholdList() {
        const list = document.getElementById('video-threshold-list');
        if (!list) return;
        list.innerHTML = '';
        MOCK_DATA.subAccounts.forEach(acc => {
            const threshold = MOCK_DATA.alertThresholds[acc.id]?.video ?? 40;
            list.innerHTML += `
                <div class="threshold-item">
                    <span class="threshold-name">${acc.name}</span>
                    <input type="number" class="form-input threshold-input" data-acc="${acc.id}" data-type="video"
                        value="${threshold}" min="0" max="30" />
                    <span class="threshold-unit">条</span>
                </div>
            `;
        });
    },

    renderTable() {
        const tbody = document.getElementById('video-monitor-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        MOCK_DATA.subAccounts.forEach(acc => {
            const threshold = MOCK_DATA.alertThresholds[acc.id]?.video ?? 40;
            const published = acc.videoTotal - acc.videoRemaining;
            const rate = acc.videoTotal > 0 ? ((published / acc.videoTotal) * 100).toFixed(1) : '0';
            const status = this.getStatus(acc);
            const statusTag = status === 'danger'
                ? '<span class="tag tag-danger">报警</span>'
                : status === 'warning'
                ? '<span class="tag tag-warning">预警</span>'
                : '<span class="tag tag-success">正常</span>';
            const rowClass = status !== 'normal' ? ' class="row-warning"' : '';

            tbody.innerHTML += `
                <tr${rowClass}>
                    <td><strong>${acc.name}</strong></td>
                    <td>${acc.videoTotal}</td>
                    <td style="font-weight:600;color:${status !== 'normal' ? '#ef4444' : 'inherit'};">${acc.videoRemaining}</td>
                    <td>${published}</td>
                    <td>${rate}%</td>
                    <td>${threshold} 条</td>
                    <td>${statusTag}</td>
                </tr>
            `;
        });
    },

    saveThresholds() {
        document.querySelectorAll('.threshold-input[data-type="video"]').forEach(input => {
            const accId = parseInt(input.dataset.acc);
            let val = parseInt(input.value) || 0;
            if (val > 30) { val = 30; input.value = 30; }
            if (val < 0) { val = 0; input.value = 0; }
            if (!MOCK_DATA.alertThresholds[accId]) MOCK_DATA.alertThresholds[accId] = {};
            MOCK_DATA.alertThresholds[accId].video = val;
        });
        DataStore.saveThresholds();
        this.renderTable();
        showToast('视频预警阈值已保存（最大30条）', 'success');
    },
};

/* ============================================================
   模块十一：文案监控（管理员专用）
   ============================================================ */
const CopyMonitor = {
    init() {
        this.render();
    },

    getStatus(acc) {
        const threshold = MOCK_DATA.alertThresholds[acc.id]?.copy || 50;
        if (acc.copyRemaining <= 0) return 'danger';
        if (acc.copyRemaining <= threshold) return 'warning';
        return 'normal';
    },

    render() {
        const container = document.getElementById('copy-monitor-content');
        if (!container) return;
        container.innerHTML = '';

        const cardsRow = document.createElement('div');
        cardsRow.className = 'monitor-summary-cards';

        const totalAccounts = MOCK_DATA.subAccounts.length;
        const warningCount = MOCK_DATA.subAccounts.filter(a => this.getStatus(a) === 'warning').length;
        const dangerCount = MOCK_DATA.subAccounts.filter(a => this.getStatus(a) === 'danger').length;
        const totalRemaining = MOCK_DATA.subAccounts.reduce((s, a) => s + a.copyRemaining, 0);

        cardsRow.innerHTML = `
            <div class="monitor-card mc-blue">
                <div class="mc-icon">&#128221;</div>
                <div class="mc-info"><span class="mc-label">监控账号数</span><span class="mc-value">${totalAccounts}</span></div>
            </div>
            <div class="monitor-card mc-green">
                <div class="mc-icon">&#128230;</div>
                <div class="mc-info"><span class="mc-label">文案剩余总量</span><span class="mc-value">${totalRemaining}</span></div>
            </div>
            <div class="monitor-card mc-orange">
                <div class="mc-icon">&#9888;</div>
                <div class="mc-info"><span class="mc-label">预警账号</span><span class="mc-value">${warningCount}</span></div>
            </div>
            <div class="monitor-card mc-red">
                <div class="mc-icon">&#128680;</div>
                <div class="mc-info"><span class="mc-label">报警账号</span><span class="mc-value">${dangerCount}</span></div>
            </div>
        `;
        container.appendChild(cardsRow);

        // 阈值设置
        const thresholdSection = document.createElement('div');
        thresholdSection.className = 'cost-section';
        thresholdSection.innerHTML = `
            <div class="sub-section-header">
                <h4>预警阈值设置</h4>
                <span class="chart-badge">文案剩余低于此值时显示预警（最大30）</span>
            </div>
            <p class="form-hint" style="margin-bottom:12px;">设置每个子账号的文案剩余数量预警值，当存量低于该值时自动标红提醒</p>
            <div class="monitor-threshold-list" id="copy-threshold-list"></div>
            <div class="form-actions" style="margin-top:12px;">
                <button class="btn btn-primary btn-sm" id="save-copy-threshold-btn">保存阈值设置</button>
            </div>
        `;
        container.appendChild(thresholdSection);

        // 详细表格
        const tableSection = document.createElement('div');
        tableSection.className = 'data-table-card';
        tableSection.style.marginTop = '20px';
        tableSection.innerHTML = `
            <div class="table-header"><h3>文案数据监控详情</h3></div>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>子账号名称</th>
                            <th>文案总数</th>
                            <th>文案剩余</th>
                            <th>已发布</th>
                            <th>完成率</th>
                            <th>预警阈值</th>
                            <th>状态</th>
                        </tr>
                    </thead>
                    <tbody id="copy-monitor-tbody"></tbody>
                </table>
            </div>
        `;
        container.appendChild(tableSection);

        this.renderThresholdList();
        this.renderTable();
        const saveBtn = document.getElementById('save-copy-threshold-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveThresholds());
    },

    renderThresholdList() {
        const list = document.getElementById('copy-threshold-list');
        if (!list) return;
        list.innerHTML = '';
        MOCK_DATA.subAccounts.forEach(acc => {
            const threshold = MOCK_DATA.alertThresholds[acc.id]?.copy ?? 50;
            list.innerHTML += `
                <div class="threshold-item">
                    <span class="threshold-name">${acc.name}</span>
                    <input type="number" class="form-input threshold-input" data-acc="${acc.id}" data-type="copy"
                        value="${threshold}" min="0" max="30" />
                    <span class="threshold-unit">条</span>
                </div>
            `;
        });
    },

    renderTable() {
        const tbody = document.getElementById('copy-monitor-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        MOCK_DATA.subAccounts.forEach(acc => {
            const threshold = MOCK_DATA.alertThresholds[acc.id]?.copy ?? 50;
            const published = acc.copyTotal - acc.copyRemaining;
            const rate = acc.copyTotal > 0 ? ((published / acc.copyTotal) * 100).toFixed(1) : '0';
            const status = this.getStatus(acc);
            const statusTag = status === 'danger'
                ? '<span class="tag tag-danger">报警</span>'
                : status === 'warning'
                ? '<span class="tag tag-warning">预警</span>'
                : '<span class="tag tag-success">正常</span>';
            const rowClass = status !== 'normal' ? ' class="row-warning"' : '';

            tbody.innerHTML += `
                <tr${rowClass}>
                    <td><strong>${acc.name}</strong></td>
                    <td>${acc.copyTotal}</td>
                    <td style="font-weight:600;color:${status !== 'normal' ? '#ef4444' : 'inherit'};">${acc.copyRemaining}</td>
                    <td>${published}</td>
                    <td>${rate}%</td>
                    <td>${threshold} 条</td>
                    <td>${statusTag}</td>
                </tr>
            `;
        });
    },

    saveThresholds() {
        document.querySelectorAll('.threshold-input[data-type="copy"]').forEach(input => {
            const accId = parseInt(input.dataset.acc);
            let val = parseInt(input.value) || 0;
            if (val > 30) { val = 30; input.value = 30; }
            if (val < 0) { val = 0; input.value = 0; }
            if (!MOCK_DATA.alertThresholds[accId]) MOCK_DATA.alertThresholds[accId] = {};
            MOCK_DATA.alertThresholds[accId].copy = val;
        });
        DataStore.saveThresholds();
        this.renderTable();
        showToast('文案预警阈值已保存（最大30条）', 'success');
    },
};

/* ============================================================
   模块十二：短视频预警（管理员+员工双视图）
   ============================================================ */
const ShortVideoAlert = {
    _pollTimer: null,
    currentFilter: 'week', // 默认本周

    // 预警条件默认配置：指标 -> { operator: 'gt'/'eq'/'lt', value: number }
    getDefaultSettings() {
        return {
            views: { operator: 'gt', value: 0 },
            comments: { operator: 'gt', value: 0 },
            messages: { operator: 'gt', value: 0 },
            leads: { operator: 'gt', value: 0 }
        };
    },

    // 获取当前预警条件（兼容旧数据）
    getSettings() {
        const s = MOCK_DATA.shortVideoAlertSettings;
        if (!s) return this.getDefaultSettings();
        const defaults = this.getDefaultSettings();
        const merged = {};
        Object.keys(defaults).forEach(key => {
            merged[key] = {
                operator: (s[key] && ['gt', 'eq', 'lt'].includes(s[key].operator)) ? s[key].operator : defaults[key].operator,
                value: (s[key] && typeof s[key].value === 'number' && !isNaN(s[key].value)) ? s[key].value : defaults[key].value
            };
        });
        return merged;
    },

    // 保存预警条件
    saveSettingsToStore() {
        MOCK_DATA.shortVideoAlertSettings = this.getSettings();
        localStorage.setItem(`${DataStore.PREFIX_EMP}/_shortVideoAlertSettings`, JSON.stringify(MOCK_DATA.shortVideoAlertSettings));
    },

    // 加载预警条件
    loadSettings() {
        const data = localStorage.getItem(`${DataStore.PREFIX_EMP}/_shortVideoAlertSettings`);
        if (data) {
            try { MOCK_DATA.shortVideoAlertSettings = JSON.parse(data); } catch (e) {}
        }
    },

    init() {
        this.loadSettings();
        this.render();
        this._startPolling();
    },

    // 启动轮询刷新，保持数据实时更新
    _startPolling() {
        if (this._pollTimer) return;
        this._pollTimer = setInterval(() => {
            if (state.currentView !== 'short-video-alert') return;
            // 若员工正在填写表单，跳过刷新以免丢失输入
            const formArea = document.getElementById('alert-form-area');
            if (formArea && formArea.style.display !== 'none') return;
            this.render();
        }, 5000);
    },

    _stopPolling() {
        if (this._pollTimer) {
            clearInterval(this._pollTimer);
            this._pollTimer = null;
        }
    },

    // 获取星期几中文名
    getWeekday(dateStr) {
        const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const d = new Date(dateStr);
        return days[d.getDay()];
    },

    // 状态标签
    getStatusTag(status) {
        if (status === 'alert') return '<span class="tag tag-danger">报警</span>';
        if (status === 'warning') return '<span class="tag tag-warning">预警</span>';
        return '<span class="tag tag-success">正常</span>';
    },

    // 获取子账号名称
    getSubAccountName(id) {
        const acc = MOCK_DATA.subAccounts.find(a => a.id === id);
        return acc ? acc.name : '未知';
    },

    // 获取负责该子账号的员工名称
    getEmployeeBySubAccount(subAccId) {
        const emp = MOCK_AUTH_DATA.employees.find(e => (e.subAccounts || []).includes(subAccId));
        return emp ? emp.name : '未分配';
    },

    // 获取今天的日期字符串
    getToday() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    // 切换年月周筛选
    setFilter(type) {
        if (!['year', 'month', 'week'].includes(type)) return;
        this.currentFilter = type;
        this.render();
    },

    // 根据筛选类型返回起止日期字符串
    getFilterRange(type) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        if (type === 'year') {
            return {
                start: `${year}-01-01`,
                end: `${year}-12-31`,
                label: '本年'
            };
        }
        if (type === 'month') {
            const m = String(month + 1).padStart(2, '0');
            const lastDay = new Date(year, month + 1, 0).getDate();
            return {
                start: `${year}-${m}-01`,
                end: `${year}-${m}-${String(lastDay).padStart(2, '0')}`,
                label: '本月'
            };
        }
        // week：按周一开始计算
        const dayOfWeek = now.getDay() || 7; // 周日视为7
        const monday = new Date(now);
        monday.setDate(now.getDate() - dayOfWeek + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return {
            start: fmt(monday),
            end: fmt(sunday),
            label: '本周'
        };
    },

    // 按日期范围筛选预警记录
    filterAlertsByRange(alerts, range) {
        if (!range) return alerts;
        return alerts.filter(a => a.date >= range.start && a.date <= range.end);
    },

    // 渲染筛选标签
    renderFilterTabs() {
        const types = [
            { key: 'week', label: '本周' },
            { key: 'month', label: '本月' },
            { key: 'year', label: '本年' }
        ];
        return `
            <div class="short-video-filter-tabs" style="display:flex;gap:8px;margin-bottom:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;">
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    ${types.map(t => `
                        <button class="btn btn-sm ${this.currentFilter === t.key ? 'btn-primary' : 'btn-outline'}"
                            onclick="ShortVideoAlert.setFilter('${t.key}')">${t.label}</button>
                    `).join('')}
                </div>
                <button class="btn btn-sm btn-outline" onclick="ShortVideoAlert.openSettings()">预警设置</button>
            </div>
        `;
    },

    render() {
        if (Auth.isAdmin()) {
            this.renderAdmin();
        } else {
            this.renderEmployee();
        }
    },

    // 判断单条记录是否报警（任一指标不满足设定条件即报警）
    isAlert(alert) {
        const settings = this.getSettings();
        const fields = { views: 'views', comments: 'comments', messages: 'messages', leads: 'leads' };
        for (const key of Object.keys(fields)) {
            const setting = settings[key];
            const val = parseFloat(alert[fields[key]]) || 0;
            if (setting.operator === 'lt' && val < setting.value) return true;
            if (setting.operator === 'gt' && val <= setting.value) return true; // 不满足“大于”即异常
            if (setting.operator === 'eq' && val !== setting.value) return true; // 不满足“等于”即异常
        }
        return false;
    },

    // 打开预警设置弹窗
    openSettings() {
        const settings = this.getSettings();
        document.getElementById('alert-settings-views-op').value = settings.views.operator;
        document.getElementById('alert-settings-views-value').value = settings.views.value;
        document.getElementById('alert-settings-comments-op').value = settings.comments.operator;
        document.getElementById('alert-settings-comments-value').value = settings.comments.value;
        document.getElementById('alert-settings-messages-op').value = settings.messages.operator;
        document.getElementById('alert-settings-messages-value').value = settings.messages.value;
        document.getElementById('alert-settings-leads-op').value = settings.leads.operator;
        document.getElementById('alert-settings-leads-value').value = settings.leads.value;
        const modal = document.getElementById('short-video-alert-settings-modal');
        if (modal) modal.style.display = 'flex';
    },

    // 关闭预警设置弹窗
    closeSettings() {
        const modal = document.getElementById('short-video-alert-settings-modal');
        if (modal) modal.style.display = 'none';
    },

    // 保存预警设置并重新计算状态
    saveSettings() {
        const ops = ['views', 'comments', 'messages', 'leads'];
        const settings = {};
        ops.forEach(key => {
            const operator = document.getElementById(`alert-settings-${key}-op`).value;
            const value = parseFloat(document.getElementById(`alert-settings-${key}-value`).value) || 0;
            settings[key] = { operator, value };
        });
        MOCK_DATA.shortVideoAlertSettings = settings;
        this.saveSettingsToStore();
        showToast('预警条件已保存', 'success');
        this.closeSettings();
        this.render();
    },
    renderAdmin() {
        const container = document.getElementById('short-video-alert-content');
        if (!container) return;
        container.innerHTML = '';

        // 筛选控件
        const filterSection = document.createElement('div');
        filterSection.innerHTML = this.renderFilterTabs();
        container.appendChild(filterSection);

        // 按当前筛选维度过滤数据
        const range = this.getFilterRange(this.currentFilter);
        const allAlerts = MOCK_DATA.shortVideoAlerts;
        // 根据预警条件重新计算状态
        allAlerts.forEach(a => a.status = this.isAlert(a) ? 'alert' : 'normal');
        const filteredAlerts = this.filterAlertsByRange(allAlerts, range);

        // 第一栏：汇总统计卡片（基于筛选后的数据，实时随新增/删除变化）
        const alertCount = filteredAlerts.filter(a => a.status === 'alert').length;
        const viewCount = filteredAlerts.reduce((s, a) => s + (a.views || 0), 0);
        const commentCount = filteredAlerts.reduce((s, a) => s + a.comments, 0);
        const messageCount = filteredAlerts.reduce((s, a) => s + a.messages, 0);
        const leadCount = filteredAlerts.reduce((s, a) => s + a.leads, 0);

        const summarySection = document.createElement('div');
        summarySection.className = 'monitor-summary-cards';
        summarySection.innerHTML = `
            <div class="monitor-card mc-red">
                <div class="mc-icon">&#128680;</div>
                <div class="mc-info"><span class="mc-label">报警数量</span><span class="mc-value">${alertCount}</span></div>
            </div>
            <div class="monitor-card mc-orange">
                <div class="mc-icon">&#9658;</div>
                <div class="mc-info"><span class="mc-label">播放量</span><span class="mc-value">${viewCount.toLocaleString('zh-CN')}</span></div>
            </div>
            <div class="monitor-card mc-blue">
                <div class="mc-icon">&#128172;</div>
                <div class="mc-info"><span class="mc-label">评论数量</span><span class="mc-value">${commentCount}</span></div>
            </div>
            <div class="monitor-card mc-purple">
                <div class="mc-icon">&#128231;</div>
                <div class="mc-info"><span class="mc-label">私信数量</span><span class="mc-value">${messageCount}</span></div>
            </div>
            <div class="monitor-card mc-green">
                <div class="mc-icon">&#128203;</div>
                <div class="mc-info"><span class="mc-label">留资数量</span><span class="mc-value">${leadCount}</span></div>
            </div>
        `;
        container.appendChild(summarySection);

        // 第二栏：各员工负责的短视频预警数据
        const tableSection = document.createElement('div');
        tableSection.className = 'data-table-card';
        tableSection.style.marginTop = '20px';
        tableSection.innerHTML = `
            <div class="table-header">
                <h3>各员工短视频预警数据</h3>
                <div style="display:flex;gap:8px;align-items:center;">
                    <span class="chart-badge">${range.label}数据 · 显示每个子账号的预警数据及负责员工</span>
                    <button class="btn btn-outline btn-sm" onclick="ShortVideoAlert.exportCSV('admin')">导出表格</button>
                </div>
            </div>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>日期</th>
                            <th>子账号名称</th>
                            <th>负责员工</th>
                            <th>发布时间</th>
                            <th>星期</th>
                            <th>播放量</th>
                            <th>评论数</th>
                            <th>私信数</th>
                            <th>留资数</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="alert-admin-tbody"></tbody>
                </table>
            </div>
        `;
        container.appendChild(tableSection);
        this.renderAdminTable(filteredAlerts);
    },

    renderAdminTable(alerts) {
        const tbody = document.getElementById('alert-admin-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        // 按日期倒序排列
        const sorted = [...alerts].sort((a, b) => b.date.localeCompare(a.date));
        sorted.forEach(alert => {
            const accName = this.getSubAccountName(alert.subAccountId);
            const empName = this.getEmployeeBySubAccount(alert.subAccountId);
            const weekday = this.getWeekday(alert.date);
            const rowClass = alert.status === 'alert' ? ' class="row-warning"' : '';

            tbody.innerHTML += `
                <tr${rowClass}>
                    <td>${alert.date}</td>
                    <td><strong>${accName}</strong></td>
                    <td><span class="badge badge-cat">${empName}</span></td>
                    <td>${alert.publishTime}</td>
                    <td>${weekday}</td>
                    <td>${alert.views.toLocaleString()}</td>
                    <td>${alert.comments}</td>
                    <td>${alert.messages}</td>
                    <td>${alert.leads}</td>
                    <td>${this.getStatusTag(alert.status)}</td>
                    <td><button class="btn-icon" onclick="ShortVideoAlert.deleteAlert(${alert.id})" title="删除">✕</button></td>
                </tr>
            `;
        });
    },

    // ===== 员工视图（与管理员同款，仅看自己数据） =====
    renderEmployee() {
        const container = document.getElementById('short-video-alert-content');
        if (!container) return;
        container.innerHTML = '';

        // 获取当前员工负责的子账号
        const user = Auth.getCurrentUser();
        const accessibleIds = Auth.getAccessibleSubAccounts();

        // 筛选控件
        const filterSection = document.createElement('div');
        filterSection.innerHTML = this.renderFilterTabs();
        container.appendChild(filterSection);

        // 筛选该员工可见的预警数据，再按当前年月周维度过滤
        const range = this.getFilterRange(this.currentFilter);
        // 根据预警条件重新计算状态
        MOCK_DATA.shortVideoAlerts.forEach(a => a.status = this.isAlert(a) ? 'alert' : 'normal');
        const myAlerts = MOCK_DATA.shortVideoAlerts.filter(a =>
            accessibleIds.includes(a.subAccountId)
        );
        const filteredAlerts = this.filterAlertsByRange(myAlerts, range);

        // 汇总统计（基于筛选后的数据，实时随新增/删除变化）
        const alertCount = filteredAlerts.filter(a => a.status === 'alert').length;
        const viewCount = filteredAlerts.reduce((s, a) => s + (a.views || 0), 0);
        const commentCount = filteredAlerts.reduce((s, a) => s + a.comments, 0);
        const messageCount = filteredAlerts.reduce((s, a) => s + a.messages, 0);
        const leadCount = filteredAlerts.reduce((s, a) => s + a.leads, 0);

        // 汇总卡片
        const summarySection = document.createElement('div');
        summarySection.className = 'monitor-summary-cards';
        summarySection.innerHTML = `
            <div class="monitor-card mc-red">
                <div class="mc-icon">&#128680;</div>
                <div class="mc-info"><span class="mc-label">报警数量</span><span class="mc-value">${alertCount}</span></div>
            </div>
            <div class="monitor-card mc-orange">
                <div class="mc-icon">&#9658;</div>
                <div class="mc-info"><span class="mc-label">播放量</span><span class="mc-value">${viewCount.toLocaleString('zh-CN')}</span></div>
            </div>
            <div class="monitor-card mc-blue">
                <div class="mc-icon">&#128172;</div>
                <div class="mc-info"><span class="mc-label">评论数量</span><span class="mc-value">${commentCount}</span></div>
            </div>
            <div class="monitor-card mc-purple">
                <div class="mc-icon">&#128231;</div>
                <div class="mc-info"><span class="mc-label">私信数量</span><span class="mc-value">${messageCount}</span></div>
            </div>
            <div class="monitor-card mc-green">
                <div class="mc-icon">&#128203;</div>
                <div class="mc-info"><span class="mc-label">留资数量</span><span class="mc-value">${leadCount}</span></div>
            </div>
        `;
        container.appendChild(summarySection);

        // 可用子账号下拉选项
        const subAccOptions = accessibleIds.map(id => {
            const acc = MOCK_DATA.subAccounts.find(a => a.id === id);
            return acc ? `<option value="${id}">${acc.name}</option>` : '';
        }).join('');

        const tableSection = document.createElement('div');
        tableSection.className = 'data-table-card';
        tableSection.style.marginTop = '20px';
        tableSection.innerHTML = `
            <div class="table-header">
                <h3>我的短视频预警</h3>
                <div style="display:flex;gap:8px;align-items:center;">
                    <span class="chart-badge">${range.label} · ${user ? user.name : ''} 负责的子账号数据</span>
                    <button class="btn btn-primary btn-sm" onclick="ShortVideoAlert.toggleForm()">+ 添加记录</button>
                    <button class="btn btn-outline btn-sm" onclick="ShortVideoAlert.exportCSV('employee')">导出表格</button>
                </div>
            </div>

            <!-- 手动填写表单 -->
            <div class="employee-form-area" id="alert-form-area" style="display:none;margin-bottom:16px;">
                <h4>添加预警数据</h4>
                <div class="form-grid-3">
                    <div class="form-group">
                        <label>日期 <span class="required">*</span></label>
                        <input type="date" class="form-input" id="alert-form-date" />
                    </div>
                    <div class="form-group">
                        <label>子账号 <span class="required">*</span></label>
                        <select class="form-input" id="alert-form-subaccount">
                            ${subAccOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>发布时间 <span class="required">*</span></label>
                        <input type="time" class="form-input" id="alert-form-time" />
                    </div>
                </div>
                <div class="form-grid-3">
                    <div class="form-group">
                        <label>播放量</label>
                        <input type="number" class="form-input" id="alert-form-views" placeholder="如 12000" />
                    </div>
                    <div class="form-group">
                        <label>评论数</label>
                        <input type="number" class="form-input" id="alert-form-comments" placeholder="如 85" />
                    </div>
                    <div class="form-group">
                        <label>私信数</label>
                        <input type="number" class="form-input" id="alert-form-messages" placeholder="如 23" />
                    </div>
                </div>
                <div class="form-grid-3">
                    <div class="form-group">
                        <label>留资数</label>
                        <input type="number" class="form-input" id="alert-form-leads" placeholder="如 12" />
                    </div>
                    <div class="form-group">
                        <label>状态</label>
                        <select class="form-input" id="alert-form-status">
                            <option value="normal">正常</option>
                            <option value="warning">预警</option>
                            <option value="alert">报警</option>
                        </select>
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="ShortVideoAlert.saveAlert()">保存记录</button>
                    <button class="btn btn-outline" onclick="ShortVideoAlert.toggleForm()">取消</button>
                </div>
            </div>

            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>日期</th>
                            <th>子账号名称</th>
                            <th>负责员工</th>
                            <th>发布时间</th>
                            <th>星期</th>
                            <th>播放量</th>
                            <th>评论数</th>
                            <th>私信数</th>
                            <th>留资数</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="alert-employee-tbody"></tbody>
                </table>
            </div>
        `;
        container.appendChild(tableSection);
        this.renderEmployeeTable(filteredAlerts);
    },

    // 显示/隐藏填写表单
    toggleForm() {
        const formArea = document.getElementById('alert-form-area');
        if (!formArea) return;
        if (formArea.style.display === 'none') {
            formArea.style.display = 'block';
            // 默认填入今天日期
            const dateInput = document.getElementById('alert-form-date');
            if (dateInput && !dateInput.value) dateInput.value = this.getToday();
        } else {
            formArea.style.display = 'none';
        }
    },

    // 保存手动填写的预警数据
    saveAlert() {
        const date = document.getElementById('alert-form-date').value;
        const subAccountId = parseInt(document.getElementById('alert-form-subaccount').value);
        const publishTime = document.getElementById('alert-form-time').value;
        const views = parseInt(document.getElementById('alert-form-views').value) || 0;
        const comments = parseInt(document.getElementById('alert-form-comments').value) || 0;
        const messages = parseInt(document.getElementById('alert-form-messages').value) || 0;
        const leads = parseInt(document.getElementById('alert-form-leads').value) || 0;
        const status = document.getElementById('alert-form-status').value;

        if (!date || !subAccountId || !publishTime) {
            showToast('请填写日期、子账号和发布时间', 'warning');
            return;
        }

        // 员工只能添加自己负责的子账号
        const accessibleIds = Auth.getAccessibleSubAccounts();
        if (Auth.getCurrentUser().role !== 'admin' && !accessibleIds.includes(subAccountId)) {
            showToast('您只能添加自己负责的子账号数据', 'warning');
            return;
        }

        const newId = MOCK_DATA.shortVideoAlerts.length > 0
            ? Math.max(...MOCK_DATA.shortVideoAlerts.map(a => a.id)) + 1 : 1;
        const newAlert = {
            id: newId, subAccountId, date, publishTime,
            views, comments, messages, leads, status
        };
        newAlert.status = this.isAlert(newAlert) ? 'alert' : 'normal';
        MOCK_DATA.shortVideoAlerts.push(newAlert);

        showToast('预警数据已保存', 'success');
        DataStore.saveAlerts();

        // 清空表单
        document.getElementById('alert-form-date').value = '';
        document.getElementById('alert-form-time').value = '';
        document.getElementById('alert-form-views').value = '';
        document.getElementById('alert-form-comments').value = '';
        document.getElementById('alert-form-messages').value = '';
        document.getElementById('alert-form-leads').value = '';
        document.getElementById('alert-form-status').value = 'normal';

        // 隐藏表单并重新渲染
        document.getElementById('alert-form-area').style.display = 'none';
        this.render();
    },

    // 删除预警记录
    deleteAlert(id) {
        if (!confirm('确定要删除该条预警数据吗？')) return;
        const idx = MOCK_DATA.shortVideoAlerts.findIndex(a => a.id === id);
        if (idx >= 0) {
            MOCK_DATA.shortVideoAlerts.splice(idx, 1);
            showToast('已删除', 'success');
            DataStore.saveAlerts();
            this.render();
        }
    },

    // 导出CSV表格
    exportCSV(view) {
        let data, filename;
        if (view === 'admin') {
            data = [...MOCK_DATA.shortVideoAlerts].sort((a, b) => b.date.localeCompare(a.date));
            filename = '短视频预警数据_管理员.csv';
        } else {
            const accessibleIds = Auth.getAccessibleSubAccounts();
            data = MOCK_DATA.shortVideoAlerts
                .filter(a => accessibleIds.includes(a.subAccountId))
                .sort((a, b) => b.date.localeCompare(a.date));
            filename = '短视频预警数据_我的.csv';
        }

        if (data.length === 0) {
            showToast('暂无数据可导出', 'warning');
            return;
        }

        // 构建CSV
        const headers = view === 'admin'
            ? ['日期', '子账号名称', '负责员工', '发布时间', '星期', '播放量', '评论数', '私信数', '留资数', '状态']
            : ['日期', '子账号名称', '发布时间', '星期', '播放量', '评论数', '私信数', '留资数', '状态'];

        const rows = data.map(a => {
            const accName = this.getSubAccountName(a.subAccountId);
            const weekday = this.getWeekday(a.date);
            const statusText = a.status === 'alert' ? '报警' : (a.status === 'warning' ? '预警' : '正常');
            const base = [a.date, accName];
            if (view === 'admin') {
                const empName = this.getEmployeeBySubAccount(a.subAccountId);
                base.push(empName);
            }
            base.push(a.publishTime, weekday, a.views, a.comments, a.messages, a.leads, statusText);
            return base;
        });

        const csvContent = '\uFEFF' + [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        // 下载
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        showToast('表格已导出', 'success');
    },

    renderEmployeeTable(alerts) {
        const tbody = document.getElementById('alert-employee-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (alerts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;color:var(--color-text-light);padding:40px;">暂无预警数据，请点击"添加记录"手动填写</td></tr>';
            return;
        }

        // 按日期倒序排列
        const sorted = [...alerts].sort((a, b) => b.date.localeCompare(a.date));
        sorted.forEach(alert => {
            const accName = this.getSubAccountName(alert.subAccountId);
            const empName = this.getEmployeeBySubAccount(alert.subAccountId);
            const weekday = this.getWeekday(alert.date);
            const rowClass = alert.status === 'alert' ? ' class="row-warning"' : '';

            tbody.innerHTML += `
                <tr${rowClass}>
                    <td>${alert.date}</td>
                    <td><strong>${accName}</strong></td>
                    <td><span class="badge badge-cat">${empName}</span></td>
                    <td>${alert.publishTime}</td>
                    <td>${weekday}</td>
                    <td>${alert.views.toLocaleString()}</td>
                    <td>${alert.comments}</td>
                    <td>${alert.messages}</td>
                    <td>${alert.leads}</td>
                    <td>${this.getStatusTag(alert.status)}</td>
                    <td><button class="btn-icon" onclick="ShortVideoAlert.deleteAlert(${alert.id})" title="删除">✕</button></td>
                </tr>
            `;
        });
    },
};

/* ============================================================
   工具函数
   ============================================================ */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'all 0.3s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ============================================================
   模块：应用管理（管理员专用）
   管理员可以新增、修改、删除常用应用，并分配给员工
   ============================================================ */
const AppManager = {
    editingId: null,

    init() {
        this.renderTable();
        this.renderEmployeeCheckboxes();
        this.bindEvents();
    },

    bindEvents() {
        const addBtn = document.getElementById('add-app-btn');
        if (addBtn) addBtn.addEventListener('click', () => this.showForm());

        const saveBtn = document.getElementById('save-app-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => this.save());

        const cancelBtn = document.getElementById('cancel-app-btn');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideForm());
    },

    // 渲染员工复选框列表
    renderEmployeeCheckboxes() {
        const container = document.getElementById('app-assign-employees');
        if (!container) return;
        const employees = MOCK_AUTH_DATA.employees.filter(e => e.status === 'active');
        container.innerHTML = employees.map(emp => `
            <label class="checkbox-item">
                <input type="checkbox" value="${emp.id}" />
                <span>${emp.name}（${emp.role || '员工'}）</span>
            </label>
        `).join('');
    },

    // 渲染应用列表表格
    renderTable() {
        const tbody = document.getElementById('app-management-table-body');
        if (!tbody) return;
        const apps = MOCK_DATA.apps;
        tbody.innerHTML = apps.map(app => {
            const empNames = (app.assignedTo || []).map(id => {
                const emp = MOCK_AUTH_DATA.employees.find(e => e.id === id);
                return emp ? emp.name : '';
            }).filter(n => n).join('、') || '<span style="color:#999;">未分配</span>';

            return `
                <tr>
                    <td style="font-size:24px;text-align:center;">${app.icon || '🔗'}</td>
                    <td><strong>${app.name}</strong></td>
                    <td><a href="${app.url}" target="_blank" style="color:var(--primary);text-decoration:none;">${app.url}</a></td>
                    <td>${empNames}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="AppManager.edit(${app.id})">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="AppManager.delete(${app.id})">删除</button>
                    </td>
                </tr>
            `;
        }).join('');

        const countEl = document.getElementById('app-count');
        if (countEl) countEl.textContent = apps.length;
    },

    showForm(app = null) {
        document.getElementById('app-form-area').style.display = 'block';
        document.getElementById('app-form-title').textContent = app ? '编辑应用' : '添加应用';
        document.getElementById('app-form-name').value = app ? app.name : '';
        document.getElementById('app-form-url').value = app ? app.url : '';
        document.getElementById('app-form-icon').value = app ? (app.icon || '') : '';
        // 勾选已分配的员工
        const checkboxes = document.querySelectorAll('#app-assign-employees input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = app && (app.assignedTo || []).includes(parseInt(cb.value));
        });
        this.editingId = app ? app.id : null;
    },

    hideForm() {
        document.getElementById('app-form-area').style.display = 'none';
        this.editingId = null;
    },

    save() {
        const name = document.getElementById('app-form-name').value.trim();
        const url = document.getElementById('app-form-url').value.trim();
        const icon = document.getElementById('app-form-icon').value.trim() || '🔗';
        if (!name || !url) {
            showToast('请填写应用名称和链接', 'warning');
            return;
        }
        // 收集勾选的员工
        const assignedTo = [];
        document.querySelectorAll('#app-assign-employees input[type="checkbox"]:checked').forEach(cb => {
            assignedTo.push(parseInt(cb.value));
        });

        if (this.editingId) {
            // 修改
            const app = MOCK_DATA.apps.find(a => a.id === this.editingId);
            if (app) {
                app.name = name;
                app.url = url;
                app.icon = icon;
                app.assignedTo = assignedTo;
            }
            showToast('应用修改成功', 'success');
        } else {
            // 新增
            const newId = MOCK_DATA.apps.length > 0 ? Math.max(...MOCK_DATA.apps.map(a => a.id)) + 1 : 1;
            MOCK_DATA.apps.push({ id: newId, name, url, icon, assignedTo });
            showToast('应用添加成功', 'success');
        }
        DataStore.saveApps();
        this.hideForm();
        this.renderTable();
        // 同步员工端
        if (typeof CommonApps !== 'undefined') CommonApps.render();
    },

    edit(id) {
        const app = MOCK_DATA.apps.find(a => a.id === id);
        if (app) this.showForm(app);
    },

    delete(id) {
        if (!confirm('确定要删除该应用吗？')) return;
        const idx = MOCK_DATA.apps.findIndex(a => a.id === id);
        if (idx >= 0) {
            MOCK_DATA.apps.splice(idx, 1);
            showToast('应用已删除', 'success');
            DataStore.saveApps();
            this.renderTable();
            if (typeof CommonApps !== 'undefined') CommonApps.render();
        }
    },
};

/* ============================================================
   模块：常用应用（员工端）
   以按钮形式展示管理员分配的应用，点击跳转
   ============================================================ */
const CommonApps = {
    init() {
        this.render();
    },

    render() {
        const container = document.getElementById('apps-grid');
        if (!container) return;

        const user = Auth.getCurrentUser();
        if (!user) return;

        let apps;
        if (user.role === 'admin') {
            // 管理员可看到所有应用
            apps = MOCK_DATA.apps;
        } else {
            // 员工只能看到分配给自己的应用
            apps = MOCK_DATA.apps.filter(a => (a.assignedTo || []).includes(user.id));
        }

        if (apps.length === 0) {
            container.innerHTML = `
                <div class="apps-empty">
                    <div class="apps-empty-icon">🔗</div>
                    <p>暂无常用应用</p>
                    <span>请联系管理员分配应用</span>
                </div>
            `;
            return;
        }

        container.innerHTML = apps.map(app => `
            <a href="${app.url}" target="_blank" class="app-btn-card" title="点击打开：${app.name}">
                <div class="app-btn-icon">${app.icon || '🔗'}</div>
                <span class="app-btn-name">${app.name}</span>
            </a>
        `).join('');
    },
};

function updateHeaderDate() {
    const now = new Date();
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`;
    document.getElementById('header-date').textContent = dateStr;
}

/* ============================================================
   模块：请假申请（员工提交 + 管理员审核）
   ============================================================ */
const LeaveManager = {
    filterStatus: 'all',

    init() {
        // 员工端提交
        const submitBtn = document.getElementById('leave-submit-btn');
        const resetBtn = document.getElementById('leave-reset-btn');
        if (submitBtn) submitBtn.addEventListener('click', () => this.submit());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetForm());

        // 员工申请表单仅对员工显示，管理员只负责审核
        const employeeCard = document.getElementById('leave-employee-card');
        if (employeeCard) employeeCard.style.display = Auth.isAdmin() ? 'none' : 'block';

        // 管理员审核卡片可见性
        const adminCard = document.getElementById('leave-admin-card');
        if (adminCard) adminCard.style.display = Auth.isAdmin() ? 'block' : 'none';

        // 初始渲染
        this.render();

        // 管理员筛选标签
        document.querySelectorAll('.leave-filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.leave-filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterStatus = tab.dataset.status;
                this.renderAdminList();
            });
        });
    },

    getCurrentEmployee() {
        const user = Auth.getCurrentUser();
        if (!user) return null;
        return {
            id: user.id !== undefined ? user.id : (user.role === 'admin' ? 'admin' : 0),
            name: user.name || '',
        };
    },

    submit() {
        const type = document.getElementById('leave-form-type').value;
        const start = document.getElementById('leave-form-start').value;
        const end = document.getElementById('leave-form-end').value;
        const reason = document.getElementById('leave-form-reason').value.trim();

        if (!start || !end || !reason) {
            showToast('请填写开始日期、结束日期和请假事由', 'warning');
            return;
        }
        if (new Date(end) < new Date(start)) {
            showToast('结束日期不能早于开始日期', 'warning');
            return;
        }

        const emp = this.getCurrentEmployee();
        if (!emp || !emp.name) {
            showToast('无法获取当前员工信息，请重新登录', 'error');
            return;
        }

        const newId = MOCK_DATA.leaveRequests.length
            ? Math.max(...MOCK_DATA.leaveRequests.map(r => r.id)) + 1
            : 1;

        MOCK_DATA.leaveRequests.push({
            id: newId,
            employeeId: emp.id,
            employeeName: emp.name,
            type,
            start,
            end,
            reason,
            status: 'pending',
            createdAt: new Date().toISOString(),
            reviewedAt: null,
        });
        DataStore.saveLeaveRequests();
        this.resetForm();
        this.render();
        showToast('请假申请已提交，等待管理员审核', 'success');
    },

    resetForm() {
        document.getElementById('leave-form-start').value = '';
        document.getElementById('leave-form-end').value = '';
        document.getElementById('leave-form-reason').value = '';
        document.getElementById('leave-form-type').selectedIndex = 0;
    },

    approve(id) {
        const req = MOCK_DATA.leaveRequests.find(r => r.id === id);
        if (!req) return;
        req.status = 'approved';
        req.reviewedAt = new Date().toISOString();
        DataStore.saveLeaveRequests();
        this.render();
        // 发送通知给员工
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.create(
                'leave_approved',
                '请假申请已通过',
                `您的${req.type}申请（${req.start} 至 ${req.end}）已通过审核`,
                req.employeeId
            );
        }
        showToast(`已通过 ${req.employeeName} 的请假申请`, 'success');
    },

    reject(id) {
        const req = MOCK_DATA.leaveRequests.find(r => r.id === id);
        if (!req) return;
        req.status = 'rejected';
        req.reviewedAt = new Date().toISOString();
        DataStore.saveLeaveRequests();
        this.render();
        // 发送通知给员工
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.create(
                'leave_rejected',
                '请假申请已拒绝',
                `您的${req.type}申请（${req.start} 至 ${req.end}）已被拒绝`,
                req.employeeId
            );
        }
        showToast(`已拒绝 ${req.employeeName} 的请假申请`, 'info');
    },

    render() {
        this.renderMyList();
        if (Auth.isAdmin()) this.renderAdminList();
    },

    statusTag(status) {
        const map = {
            pending: '<span class="tag tag-warning">待审核</span>',
            approved: '<span class="tag tag-success">已通过</span>',
            rejected: '<span class="tag tag-danger">已拒绝</span>',
        };
        return map[status] || status;
    },

    renderMyList() {
        const list = document.getElementById('leave-my-list');
        if (!list) return;
        const emp = this.getCurrentEmployee();
        const myReqs = MOCK_DATA.leaveRequests
            .filter(r => r.employeeId === emp.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (myReqs.length === 0) {
            list.innerHTML = '<div class="empty-state"><p>暂无请假申请</p></div>';
            return;
        }

        list.innerHTML = myReqs.map(r => `
            <div class="leave-card">
                <div class="leave-card-top">
                    <span class="leave-type">${this.escapeHtml(r.type)}</span>
                    ${this.statusTag(r.status)}
                </div>
                <div class="leave-card-dates">${r.start} 至 ${r.end}</div>
                <div class="leave-card-reason">${this.escapeHtml(r.reason)}</div>
            </div>
        `).join('');
    },

    renderAdminList() {
        const tbody = document.getElementById('leave-admin-tbody');
        if (!tbody) return;
        const all = MOCK_DATA.leaveRequests
            .filter(r => this.filterStatus === 'all' || r.status === this.filterStatus)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 统计
        const counts = { pending: 0, approved: 0, rejected: 0 };
        MOCK_DATA.leaveRequests.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
        const pc = document.getElementById('leave-pending-count');
        const ac = document.getElementById('leave-approved-count');
        const rc = document.getElementById('leave-rejected-count');
        if (pc) pc.textContent = counts.pending || 0;
        if (ac) ac.textContent = counts.approved || 0;
        if (rc) rc.textContent = counts.rejected || 0;

        if (all.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--color-text-light);">暂无申请</td></tr>';
            return;
        }

        tbody.innerHTML = all.map(r => {
            const reviewActions = r.status === 'pending'
                ? `<button class="btn btn-sm btn-success" onclick="LeaveManager.approve(${r.id})">通过</button>
                   <button class="btn btn-sm btn-danger" onclick="LeaveManager.reject(${r.id})">拒绝</button>`
                : '<span style="color:var(--color-text-light);">—</span>';
            const actions = `${reviewActions}
                   <button class="btn btn-sm btn-outline" onclick="LeaveManager.deleteRequest(${r.id})" style="margin-left:4px;">删除</button>`;
            return `
                <tr>
                    <td>${this.escapeHtml(r.employeeName)}</td>
                    <td>${this.escapeHtml(r.type)}</td>
                    <td>${r.start}</td>
                    <td>${r.end}</td>
                    <td style="max-width:240px;white-space:normal;">${this.escapeHtml(r.reason)}</td>
                    <td>${new Date(r.createdAt).toLocaleString('zh-CN', { hour12: false })}</td>
                    <td>${this.statusTag(r.status)}</td>
                    <td>${actions}</td>
                </tr>
            `;
        }).join('');
    },

    // 管理员删除请假申请
    deleteRequest(id) {
        if (!Auth.isAdmin()) {
            showToast('无权限删除请假记录', 'error');
            return;
        }
        const req = MOCK_DATA.leaveRequests.find(r => r.id === id);
        if (!req) return;
        if (!confirm(`确定要删除 ${req.employeeName} 的「${req.type}」申请吗？此操作不可撤销。`)) return;
        const index = MOCK_DATA.leaveRequests.findIndex(r => r.id === id);
        if (index >= 0) {
            MOCK_DATA.leaveRequests.splice(index, 1);
            DataStore.saveLeaveRequests();
            this.render();
            showToast('请假申请已删除', 'info');
        }
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return str.toString().replace(/[&<>"']/g, m =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    },
};

/* ============================================================
   模块：每日报餐（员工报餐 + 管理员管理）
   ============================================================ */
const MealManager = {
    init() {
        const reportBtn = document.getElementById('meal-report-btn');
        const cancelBtn = document.getElementById('meal-cancel-btn');
        const datePicker = document.getElementById('meal-date-picker');
        const promptCheck = document.getElementById('meal-prompt-check');
        const saveCfgBtn = document.getElementById('meal-save-config-btn');

        if (reportBtn) reportBtn.addEventListener('click', () => this.reportMeal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancelMeal());
        if (datePicker) datePicker.addEventListener('change', () => this.updateMyCircles());
        if (promptCheck) promptCheck.addEventListener('change', () => this.toggleMyPrompt());
        if (saveCfgBtn) saveCfgBtn.addEventListener('click', () => this.saveConfig());

        // 管理员卡片可见性
        const adminCard = document.getElementById('meal-admin-card');
        if (adminCard) adminCard.style.display = Auth.isAdmin() ? 'block' : 'none';

        // 默认选中今天
        if (datePicker && !datePicker.value) {
            datePicker.value = this.todayStr();
        }

        // 初始渲染一次（防止从其他视图切换过来时数据未刷新）
        this.render();
    },

    todayStr() {
        const d = new Date();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${m}-${day}`;
    },

    monthKey(dateStr) {
        return dateStr ? dateStr.slice(0, 7) : this.todayStr().slice(0, 7);
    },

    getCurrentEmployee() {
        const user = Auth.getCurrentUser();
        if (!user) return null;
        return {
            id: user.id !== undefined ? user.id : (user.role === 'admin' ? 'admin' : 0),
            name: user.name || '',
        };
    },

    getMyMealsThisMonth() {
        const emp = this.getCurrentEmployee();
        if (!emp) return [];
        const mk = this.monthKey(this.todayStr());
        return MOCK_DATA.mealReports.filter(r => r.employeeId === emp.id && r.date.startsWith(mk));
    },

    isReported(dateStr) {
        const emp = this.getCurrentEmployee();
        if (!emp) return false;
        return MOCK_DATA.mealReports.some(r => r.employeeId === emp.id && r.date === dateStr);
    },

    reportMeal() {
        const datePicker = document.getElementById('meal-date-picker');
        const dateStr = datePicker.value;
        if (!dateStr) {
            showToast('请先选择报餐日期', 'warning');
            return;
        }
        if (this.isReported(dateStr)) {
            showToast('该日期已报餐，无需重复', 'warning');
            return;
        }
        const emp = this.getCurrentEmployee();
        if (!emp || !emp.name) {
            showToast('无法获取当前员工信息', 'error');
            return;
        }
        MOCK_DATA.mealReports.push({
            id: MOCK_DATA.mealReports.length
                ? Math.max(...MOCK_DATA.mealReports.map(r => r.id)) + 1 : 1,
            employeeId: emp.id,
            employeeName: emp.name,
            date: dateStr,
            amount: MOCK_DATA.mealConfig.standardAmount || 0,
            createdAt: new Date().toISOString(),
        });
        DataStore.saveMealReports();
        this.render();
        showToast(`已为 ${dateStr} 报餐`, 'success');
    },

    cancelMeal() {
        const datePicker = document.getElementById('meal-date-picker');
        const dateStr = datePicker.value;
        if (!dateStr) {
            showToast('请先选择报餐日期', 'warning');
            return;
        }
        const emp = this.getCurrentEmployee();
        const idx = MOCK_DATA.mealReports.findIndex(r => r.employeeId === emp.id && r.date === dateStr);
        if (idx < 0) {
            showToast('该日期尚未报餐', 'warning');
            return;
        }
        MOCK_DATA.mealReports.splice(idx, 1);
        DataStore.saveMealReports();
        this.render();
        showToast(`已取消 ${dateStr} 的报餐`, 'info');
    },

    toggleMyPrompt() {
        const check = document.getElementById('meal-prompt-check');
        const user = Auth.getCurrentUser();
        if (!user) return;
        const cfg = DataStore.getWechatConfig(user.id !== undefined ? user.id : 'admin');
        cfg.mealPrompt = check.checked;
        DataStore.saveWechatConfig(user.id !== undefined ? user.id : 'admin', cfg);
        showToast(check.checked ? '已开启报餐提醒' : '已关闭报餐提醒', 'info');
    },

    updateMyCircles() {
        const datePicker = document.getElementById('meal-date-picker');
        const reportBtn = document.getElementById('meal-report-btn');
        const cancelBtn = document.getElementById('meal-cancel-btn');
        const hint = document.getElementById('meal-status-hint');
        const dateStr = datePicker.value;
        if (!dateStr) {
            reportBtn.style.display = 'flex';
            cancelBtn.style.display = 'none';
            hint.textContent = '请选择日期后点击「报餐」';
            return;
        }
        if (this.isReported(dateStr)) {
            reportBtn.style.display = 'none';
            cancelBtn.style.display = 'flex';
            hint.textContent = `${dateStr} 已报餐，可点击取消`;
        } else {
            reportBtn.style.display = 'flex';
            cancelBtn.style.display = 'none';
            hint.textContent = `点击「报餐」确认 ${dateStr} 用餐`;
        }
    },

    saveConfig() {
        const amountEl = document.getElementById('meal-standard-amount');
        const enabledEl = document.getElementById('meal-prompt-enabled');
        const textEl = document.getElementById('meal-prompt-text');
        const amount = parseFloat(amountEl.value);
        if (isNaN(amount) || amount < 0) {
            showToast('请输入有效的餐标金额', 'warning');
            return;
        }
        MOCK_DATA.mealConfig.standardAmount = amount;
        MOCK_DATA.mealConfig.promptEnabled = enabledEl.checked;
        MOCK_DATA.mealConfig.promptText = textEl.value.trim() || '亲爱的同事，请记得今天报餐哦～';
        DataStore.saveMealConfig();
        this.render();
        showToast('报餐配置已保存', 'success');
    },

    render() {
        this.renderMyView();
        if (Auth.isAdmin()) this.renderAdminView();
    },

    renderMyView() {
        const emp = this.getCurrentEmployee();
        if (!emp) return;
        const myMeals = this.getMyMealsThisMonth();
        const countEl = document.getElementById('meal-my-count');
        const amountEl = document.getElementById('meal-my-amount');
        const promptCheck = document.getElementById('meal-prompt-check');
        if (countEl) countEl.textContent = myMeals.length;
        if (amountEl) {
            const sum = myMeals.reduce((s, r) => s + (r.amount || 0), 0);
            amountEl.textContent = '¥' + sum.toFixed(2);
        }
        if (promptCheck) {
            const user = Auth.getCurrentUser();
            const cfg = DataStore.getWechatConfig(user.id !== undefined ? user.id : 'admin');
            promptCheck.checked = cfg.mealPrompt !== false;
        }
        this.renderMyRecords();
        this.updateMyCircles();
    },

    // 渲染员工本月报餐记录列表
    renderMyRecords() {
        const tbody = document.getElementById('meal-records-tbody');
        if (!tbody) return;
        const emp = this.getCurrentEmployee();
        if (!emp) return;
        const myMeals = this.getMyMealsThisMonth().sort((a, b) => b.date.localeCompare(a.date));
        if (myMeals.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--color-text-light);">本月暂无报餐记录</td></tr>';
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        tbody.innerHTML = myMeals.map(r => {
            const canCancel = r.date >= todayStr;
            return `
                <tr>
                    <td>${r.date}</td>
                    <td>¥${(r.amount || 0).toFixed(2)}</td>
                    <td>
                        ${canCancel
                            ? `<button class="btn btn-sm btn-danger" onclick="MealManager.cancelRecord(${r.id})">取消报餐</button>`
                            : '<span style="color:var(--color-text-light);font-size:13px;">已过期</span>'}
                    </td>
                </tr>
            `;
        }).join('');
    },

    // 取消单条报餐记录
    cancelRecord(recordId) {
        const idx = MOCK_DATA.mealReports.findIndex(r => r.id === recordId);
        if (idx < 0) {
            showToast('记录不存在', 'warning');
            return;
        }
        const record = MOCK_DATA.mealReports[idx];
        const emp = this.getCurrentEmployee();
        if (!Auth.isAdmin() && record.employeeId !== emp.id) {
            showToast('无权取消该报餐记录', 'error');
            return;
        }
        // 已过去的报餐不允许取消（管理员除外）
        if (!Auth.isAdmin()) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayStr = today.toISOString().split('T')[0];
            if (record.date < todayStr) {
                showToast('已过去的报餐记录不能取消', 'warning');
                return;
            }
        }
        if (!confirm(`确定要取消 ${record.date} 的报餐吗？`)) return;
        MOCK_DATA.mealReports.splice(idx, 1);
        DataStore.saveMealReports();
        this.render();
        showToast(`已取消 ${record.date} 的报餐`, 'info');
    },

    renderAdminView() {
        const amountEl = document.getElementById('meal-standard-amount');
        const enabledEl = document.getElementById('meal-prompt-enabled');
        const textEl = document.getElementById('meal-prompt-text');
        if (amountEl) amountEl.value = MOCK_DATA.mealConfig.standardAmount;
        if (enabledEl) enabledEl.checked = !!MOCK_DATA.mealConfig.promptEnabled;
        if (textEl) textEl.value = MOCK_DATA.mealConfig.promptText;

        const mk = this.monthKey(this.todayStr());
        // 按员工聚合本月数据
        const map = {};
        MOCK_DATA.mealReports
            .filter(r => r.date.startsWith(mk))
            .forEach(r => {
                if (!map[r.employeeId]) {
                    map[r.employeeId] = { id: r.employeeId, name: r.employeeName, count: 0, amount: 0, last: r.date };
                }
                map[r.employeeId].count += 1;
                map[r.employeeId].amount += (r.amount || 0);
                if (r.date > map[r.employeeId].last) map[r.employeeId].last = r.date;
            });

        const rows = Object.values(map);
        const peopleEl = document.getElementById('meal-total-people');
        const countEl = document.getElementById('meal-total-count');
        const totalEl = document.getElementById('meal-total-amount');
        if (peopleEl) peopleEl.textContent = rows.length;
        if (countEl) countEl.textContent = rows.reduce((s, r) => s + r.count, 0);
        if (totalEl) totalEl.textContent = '¥' + rows.reduce((s, r) => s + r.amount, 0).toFixed(2);

        const tbody = document.getElementById('meal-admin-tbody');
        if (!tbody) return;
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--color-text-light);">本月暂无报餐记录</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(r => `
            <tr>
                <td>${this.escapeHtml(r.name)}</td>
                <td>${r.count}</td>
                <td>¥${r.amount.toFixed(2)}</td>
                <td>${r.last}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="MealManager.deleteEmployeeMeals(${r.id}, '${this.escapeHtml(r.name)}')">删除</button>
                </td>
            </tr>
        `).join('');
    },

    // 管理员删除某员工本月全部报餐记录
    deleteEmployeeMeals(employeeId, employeeName) {
        if (!Auth.isAdmin()) {
            showToast('无权限删除报餐记录', 'error');
            return;
        }
        if (!confirm(`确定要删除「${employeeName}」本月的全部报餐记录吗？此操作不可撤销。`)) return;
        const mk = this.monthKey(this.todayStr());
        const before = MOCK_DATA.mealReports.length;
        MOCK_DATA.mealReports = MOCK_DATA.mealReports.filter(r => !(r.employeeId == employeeId && r.date.startsWith(mk)));
        DataStore.saveMealReports();
        this.render();
        const deleted = before - MOCK_DATA.mealReports.length;
        showToast(`已删除 ${deleted} 条报餐记录`, 'info');
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return str.toString().replace(/[&<>"']/g, m =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    },
};

/* ============================================================
   模块：微信绑定 + 每晚 20:00 自动推送报餐提醒
   ============================================================ */
const WechatBinding = {
    timer: null,

    init() {
        const fab = document.getElementById('wechat-fab');
        const modal = document.getElementById('wechat-modal');
        const closeBtn = document.getElementById('wechat-modal-close');
        const bindBtn = document.getElementById('wechat-bind-btn');
        const unbindBtn = document.getElementById('wechat-unbind-btn');

        if (fab) fab.addEventListener('click', () => this.openModal());
        if (closeBtn) closeBtn.addEventListener('click', () => { if (modal) modal.style.display = 'none'; });
        if (bindBtn) bindBtn.addEventListener('click', () => this.bind());
        if (unbindBtn) unbindBtn.addEventListener('click', () => this.unbind());

        // 启动每晚 20:00 自动推送检查
        this.startScheduler();
    },

    currentUserId() {
        const user = Auth.getCurrentUser();
        if (!user) return null;
        return user.id !== undefined ? user.id : 'admin';
    },

    openModal() {
        const modal = document.getElementById('wechat-modal');
        const user = Auth.getCurrentUser();
        if (!user || !modal) return;
        const cfg = DataStore.getWechatConfig(this.currentUserId());
        const nicknameEl = document.getElementById('wechat-nickname');
        const bindBtn = document.getElementById('wechat-bind-btn');
        const unbindBtn = document.getElementById('wechat-unbind-btn');
        const statusEl = document.getElementById('wechat-status-text');

        if (nicknameEl) nicknameEl.value = cfg.nickname || '';
        if (cfg.bound) {
            if (bindBtn) bindBtn.style.display = 'none';
            if (unbindBtn) unbindBtn.style.display = 'inline-block';
            if (statusEl) statusEl.textContent = `已绑定微信「${cfg.nickname || ''}」，每晚 20:00 将自动推送报餐提醒。`;
        } else {
            if (bindBtn) bindBtn.style.display = 'inline-block';
            if (unbindBtn) unbindBtn.style.display = 'none';
            if (statusEl) statusEl.textContent = '绑定后，每晚 20:00 将自动把报餐提醒推送至你的微信。';
        }
        modal.style.display = 'flex';
    },

    bind() {
        const nicknameEl = document.getElementById('wechat-nickname');
        const nickname = nicknameEl ? nicknameEl.value.trim() : '';
        if (!nickname) {
            showToast('请填写微信昵称', 'warning');
            return;
        }
        const cfg = { bound: true, nickname, mealPrompt: true };
        DataStore.saveWechatConfig(this.currentUserId(), cfg);
        this.openModal();
        showToast('微信绑定成功', 'success');
    },

    unbind() {
        const cfg = { bound: false, nickname: '', mealPrompt: true };
        DataStore.saveWechatConfig(this.currentUserId(), cfg);
        this.openModal();
        showToast('已解除微信绑定', 'info');
    },

    // 每 30 秒检查一次，命中本地 20:00 即推送（演示用；实际部署由后端定时任务推送）
    startScheduler() {
        if (this.timer) return;
        this.timer = setInterval(() => {
            const now = new Date();
            if (now.getHours() === 20 && now.getMinutes() === 0) {
                this.pushReminder();
            }
        }, 30000);
    },

    pushReminder() {
        const enabled = MOCK_DATA.mealConfig.promptEnabled;
        const user = Auth.getCurrentUser();
        if (!enabled || !user) return;
        const cfg = DataStore.getWechatConfig(this.currentUserId());
        if (!cfg.bound || cfg.mealPrompt === false) return;
        const text = MOCK_DATA.mealConfig.promptText || '亲爱的同事，请记得今天报餐哦～';
        showToast(`【微信提醒】${text}`, 'info');
    },
};

/* ============================================================
   模块：文案库申请（帮剪 / 帮写）
   员工：可向对应岗位的员工发起申请，查看自己的申请记录
   被申请员工：收到通知，可同意 / 拒绝
   ============================================================ */
const CopyLibraryRequest = {
    editingId: null,

    // 申请类型配置
    requestTypes: {
        'edit': { label: '帮剪', needPos: '剪辑', desc: '申请该员工帮你剪辑' },
        'write': { label: '帮写', needPos: '文案', desc: '申请该员工帮你写文案' },
    },

    init() {
        this.bindEvents();
        this.render();
    },

    bindEvents() {
        // 发起申请按钮
        const applyBtn = document.getElementById('copy-request-apply-btn');
        if (applyBtn) applyBtn.addEventListener('click', () => this.showForm());

        // 弹窗关闭/取消
        const closeBtn = document.getElementById('copy-request-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', () => this.hideForm());
        const cancelBtn = document.getElementById('copy-request-cancel-btn');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideForm());

        // 保存申请
        const saveBtn = document.getElementById('copy-request-save-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => this.submit());

        // 子账号联动文案
        const subSel = document.getElementById('copy-request-sub-account');
        if (subSel) {
            subSel.addEventListener('change', () => this.renderCopyOptions(subSel.value));
        }

        // 申请类型联动可申请的员工
        const typeSel = document.getElementById('copy-request-type');
        if (typeSel) {
            typeSel.addEventListener('change', () => this.renderTargetEmployees(typeSel.value));
        }

        // 筛选标签
        document.querySelectorAll('.copy-req-filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.copy-req-filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                this.render();
            });
        });

        // 批量删除按钮
        const batchDeleteBtn = document.getElementById('copy-req-batch-delete-btn');
        if (batchDeleteBtn) batchDeleteBtn.addEventListener('click', () => this.batchDelete());

        // 全选 / 行选择（委托）
        const listContainer = document.getElementById('copy-request-list');
        if (listContainer) {
            listContainer.addEventListener('change', (e) => {
                const target = e.target;
                if (target.id === 'copy-req-select-all') {
                    listContainer.querySelectorAll('.copy-req-check').forEach(cb => cb.checked = target.checked);
                    this.updateBatchDeleteBtn();
                } else if (target.classList.contains('copy-req-check')) {
                    const selectAll = document.getElementById('copy-req-select-all');
                    if (selectAll) {
                        const allChecks = listContainer.querySelectorAll('.copy-req-check');
                        const checkedCount = listContainer.querySelectorAll('.copy-req-check:checked').length;
                        selectAll.checked = checkedCount === allChecks.length && allChecks.length > 0;
                        selectAll.indeterminate = checkedCount > 0 && checkedCount < allChecks.length;
                    }
                    this.updateBatchDeleteBtn();
                }
            });
        }
    },

    currentFilter: 'all',

    // 获取当前用户
    getCurrentUser() {
        return Auth.getCurrentUser();
    },

    // 当前用户能发起哪些申请类型
    getAvailableRequestTypes() {
        const user = this.getCurrentUser();
        if (!user) return [];
        if (user.role === 'admin') return ['edit', 'write'];
        const positions = user.positions || [];
        const types = [];
        if (positions.includes('剪辑')) types.push('edit');
        if (positions.includes('文案')) types.push('write');
        if (positions.includes('运营')) { types.push('edit', 'write'); }
        // 去重
        return [...new Set(types)];
    },

    // 获取可申请的员工（指定岗位的在职同事）
    getEligibleEmployees(type) {
        const user = this.getCurrentUser();
        if (!user) return [];
        const needPos = this.requestTypes[type]?.needPos;
        return MOCK_AUTH_DATA.employees.filter(emp => {
            if (emp.status !== 'active') return false;
            if (emp.id === user.id) return false;
            const positions = emp.positions || [];
            return positions.includes(needPos);
        });
    },

    // 渲染子账号下拉（仅当前用户可访问的）
    renderSubAccountOptions() {
        const sel = document.getElementById('copy-request-sub-account');
        if (!sel) return;
        const user = this.getCurrentUser();
        let subs = MOCK_DATA.subAccounts;
        if (user && user.role !== 'admin') {
            const accessible = Auth.getAccessibleSubAccounts();
            subs = subs.filter(s => accessible.includes(s.id));
        }
        sel.innerHTML = '<option value="">请选择子账号</option>' +
            subs.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    },

    // 渲染文案下拉（按子账号）
    renderCopyOptions(subAccountId) {
        const sel = document.getElementById('copy-request-copy');
        if (!sel) return;
        if (!subAccountId) {
            sel.innerHTML = '<option value="">（可选）选择具体文案</option>';
            return;
        }
        const copies = MOCK_DATA.copyLibrary.filter(c => String(c.subAccountId) === String(subAccountId));
        if (copies.length === 0) {
            sel.innerHTML = '<option value="">（该子账号暂无文案）</option>';
        } else {
            sel.innerHTML = '<option value="">（可选）选择具体文案</option>' +
                copies.map(c => `<option value="${c.id}">${c.title || '(无标题)'} - ${c.publishDate}</option>`).join('');
        }
    },

    // 渲染可申请员工下拉
    renderTargetEmployees(type) {
        const sel = document.getElementById('copy-request-target');
        if (!sel) return;
        if (!type) {
            sel.innerHTML = '<option value="">请先选择申请类型</option>';
            return;
        }
        const emps = this.getEligibleEmployees(type);
        if (emps.length === 0) {
            sel.innerHTML = '<option value="">无可申请的员工</option>';
            showToast('没有符合条件的员工（需同子账号且有对应岗位）', 'warning');
        } else {
            sel.innerHTML = '<option value="">请选择员工</option>' +
                emps.map(e => `<option value="${e.id}">${e.name}（${e.positions ? e.positions.join('、') : '员工'}）</option>`).join('');
        }
    },

    showForm() {
        const modal = document.getElementById('copy-request-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        // 重置表单
        const typeSel = document.getElementById('copy-request-type');
        const types = this.getAvailableRequestTypes();
        if (typeSel) {
            typeSel.innerHTML = '<option value="">请选择申请类型</option>' +
                Object.keys(this.requestTypes).filter(t => types.includes(t)).map(t =>
                    `<option value="${t}">${this.requestTypes[t].label}</option>`).join('');
        }
        this.renderSubAccountOptions();
        this.renderCopyOptions('');
        this.renderTargetEmployees('');
        const msgEl = document.getElementById('copy-request-message');
        if (msgEl) msgEl.value = '';
    },

    hideForm() {
        const modal = document.getElementById('copy-request-modal');
        if (modal) modal.style.display = 'none';
        this.editingId = null;
    },

    // 从文案库表格快捷发起申请（预填文案和类型）
    quickApply(copyId, type) {
        const copy = MOCK_DATA.copyLibrary.find(c => c.id === copyId);
        if (!copy) { showToast('文案不存在', 'error'); return; }
        this.showForm();
        const typeSel = document.getElementById('copy-request-type');
        if (typeSel) {
            typeSel.value = type;
            this.renderTargetEmployees(type);
        }
        const subSel = document.getElementById('copy-request-sub-account');
        if (subSel) {
            subSel.value = copy.subAccountId;
            this.renderCopyOptions(copy.subAccountId);
        }
        const copySel = document.getElementById('copy-request-copy');
        if (copySel) copySel.value = String(copyId);
    },

    // 提交申请
    submit() {
        const user = this.getCurrentUser();
        if (!user) return;
        const type = (document.getElementById('copy-request-type') || {}).value;
        const subId = parseInt((document.getElementById('copy-request-sub-account') || {}).value) || 0;
        const copyId = (document.getElementById('copy-request-copy') || {}).value;
        const targetId = parseInt((document.getElementById('copy-request-target') || {}).value);
        const message = (document.getElementById('copy-request-message') || {}).value || '';

        if (!type) { showToast('请选择申请类型', 'warning'); return; }
        if (!subId) { showToast('请选择子账号', 'warning'); return; }
        if (!targetId) { showToast('请选择申请的员工', 'warning'); return; }

        const targetEmp = MOCK_AUTH_DATA.employees.find(e => e.id === targetId);
        if (!targetEmp) { showToast('目标员工不存在', 'error'); return; }

        const copy = copyId ? MOCK_DATA.copyLibrary.find(c => c.id === parseInt(copyId)) : null;
        const subName = this.getSubAccountName(subId);

        const newId = MOCK_DATA.copyLibraryRequests.length
            ? Math.max(...MOCK_DATA.copyLibraryRequests.map(r => r.id)) + 1
            : 1;

        const req = {
            id: newId,
            type,
            typeLabel: this.requestTypes[type].label,
            subAccountId: subId,
            subAccountName: subName,
            copyId: copyId ? parseInt(copyId) : null,
            copyTitle: copy ? (copy.title || '') : '',
            requesterId: user.id,
            requesterName: user.name,
            requesterRole: user.role,
            targetEmployeeId: targetId,
            targetEmployeeName: targetEmp.name,
            status: 'pending',
            message,
            createdAt: new Date().toISOString(),
            updatedAt: null,
            responseMessage: '',
        };
        MOCK_DATA.copyLibraryRequests.push(req);
        DataStore.saveCopyLibraryRequests();

        // 生成通知给被申请员工
        NotificationManager.create(
            'copy_request',
            `新的${this.requestTypes[type].label}申请`,
            `${user.name} 申请你帮忙${this.requestTypes[type].label}（子账号：${subName}${copy ? '，文案：' + (copy.title || '') : ''}）${message ? '：' + message : ''}`,
            targetId
        );

        this.hideForm();
        this.render();
        showToast('申请已提交', 'success');
    },

    // 同意 / 拒绝
    respond(id, action, responseMsg) {
        const user = this.getCurrentUser();
        if (!user) return;
        const req = MOCK_DATA.copyLibraryRequests.find(r => r.id === id);
        if (!req) return;
        // 仅被申请员工本人可处理
        if (req.targetEmployeeId !== user.id && user.role !== 'admin') {
            showToast('无权处理该申请', 'error');
            return;
        }
        if (req.status !== 'pending') {
            showToast('该申请已处理', 'warning');
            return;
        }

        req.status = action === 'approve' ? 'approved' : 'rejected';
        req.updatedAt = new Date().toISOString();
        req.responseMessage = responseMsg || '';
        DataStore.saveCopyLibraryRequests();

        // 申请通过且关联了文案：自动把该文案的权限转移给受理人（B）
        let transferredTo = '';
        if (action === 'approve' && req.copyId) {
            const copy = MOCK_DATA.copyLibrary.find(c => c.id === req.copyId);
            if (copy) {
                copy.ownerId = req.targetEmployeeId;
                DataStore.saveCopyLibrary();
                transferredTo = req.targetEmployeeName;
            }
        }

        // 通知申请人
        const verb = action === 'approve' ? '同意' : '拒绝';
        const extra = transferredTo ? `（该文案已转交给 ${transferredTo}）` : '';
        NotificationManager.create(
            action === 'approve' ? 'copy_request_approved' : 'copy_request_rejected',
            `${user.name}${verb}了${req.requesterName}的${req.typeLabel}申请`,
            `${user.name}${verb}了${req.requesterName}的${req.typeLabel}申请（子账号：${this.getSubAccountName(req.subAccountId)}）${extra}${responseMsg ? '：' + responseMsg : ''}`,
            req.requesterId
        );

        this.render();
        if (typeof CopyLibrary !== 'undefined' && state.currentView === 'tencent-docs') CopyLibrary.render();
        showToast(`已${verb}该申请`, action === 'approve' ? 'success' : 'info');
    },

    // 更新批量删除按钮状态
    updateBatchDeleteBtn() {
        const btn = document.getElementById('copy-req-batch-delete-btn');
        if (!btn) return;
        const container = document.getElementById('copy-request-list');
        const count = container ? container.querySelectorAll('.copy-req-check:checked').length : 0;
        btn.textContent = `批量删除 (${count})`;
        btn.disabled = count === 0;
    },

    // 批量删除选中的申请
    batchDelete() {
        const container = document.getElementById('copy-request-list');
        if (!container) return;
        const checkedIds = Array.from(container.querySelectorAll('.copy-req-check:checked'))
            .map(cb => parseInt(cb.dataset.id));
        if (checkedIds.length === 0) return;

        const user = this.getCurrentUser();
        if (!user) return;

        // 权限：管理员可删除全部；普通员工只能删除自己发起的申请
        let allowedIds = checkedIds;
        if (user.role !== 'admin') {
            const userId = String(user.id);
            allowedIds = checkedIds.filter(id => {
                const req = MOCK_DATA.copyLibraryRequests.find(r => r.id === id);
                return req && String(req.requesterId) === userId;
            });
        }

        if (allowedIds.length === 0) {
            showToast('没有可删除的申请（只能删除自己发起的申请）', 'warning');
            return;
        }

        const skippedCount = checkedIds.length - allowedIds.length;
        const msg = skippedCount > 0
            ? `确定删除选中的 ${allowedIds.length} 条申请？（另有 ${skippedCount} 条无权限，将跳过）`
            : `确定删除选中的 ${allowedIds.length} 条申请？`;
        if (!confirm(msg)) return;

        MOCK_DATA.copyLibraryRequests = MOCK_DATA.copyLibraryRequests.filter(r => !allowedIds.includes(r.id));
        DataStore.saveCopyLibraryRequests();
        this.render();
        showToast(`已删除 ${allowedIds.length} 条申请`, 'success');
    },

    // 获取当前用户相关的申请
    getMyRequests() {
        const user = this.getCurrentUser();
        if (!user) return [];
        if (user.role === 'admin') {
            // 管理员看全部
            return MOCK_DATA.copyLibraryRequests;
        }
        const userId = String(user.id);
        return MOCK_DATA.copyLibraryRequests.filter(r =>
            String(r.requesterId) === userId || String(r.targetEmployeeId) === userId
        );
    },

    getSubAccountName(id) {
        const acc = MOCK_DATA.subAccounts.find(a => String(a.id) === String(id));
        return acc ? acc.name : '未知账号';
    },

    // 渲染申请列表
    render() {
        const container = document.getElementById('copy-request-list');
        if (!container) return;

        let reqs = this.getMyRequests();
        // 排序：待处理优先，其次按时间倒序
        reqs.sort((a, b) => {
            const aPend = a.status === 'pending' ? 0 : 1;
            const bPend = b.status === 'pending' ? 0 : 1;
            if (aPend !== bPend) return aPend - bPend;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // 筛选
        if (this.currentFilter === 'pending') reqs = reqs.filter(r => r.status === 'pending');
        else if (this.currentFilter === 'handled') reqs = reqs.filter(r => r.status !== 'pending');

        if (reqs.length === 0) {
            container.innerHTML = '<div class="copy-req-empty">暂无申请记录</div>';
            this.updateBatchDeleteBtn();
            return;
        }

        const user = this.getCurrentUser();
        const listHtml = reqs.map(r => {
            const isTarget = (user.role === 'admin') || (r.targetEmployeeId === user.id);
            const statusTag = r.status === 'pending'
                ? '<span class="tag tag-warning">待处理</span>'
                : (r.status === 'approved'
                    ? '<span class="tag tag-success">已同意</span>'
                    : '<span class="tag tag-danger">已拒绝</span>');
            const typeTag = `<span class="tag tag-primary">${r.typeLabel}</span>`;
            let actions = '';
            if (isTarget && r.status === 'pending') {
                actions = `
                    <button class="btn btn-sm btn-success" onclick="CopyLibraryRequest.respond(${r.id}, 'approve')">同意</button>
                    <button class="btn btn-sm btn-danger" onclick="CopyLibraryRequest.respond(${r.id}, 'reject')">拒绝</button>
                `;
            }
            const detail = `
                <div class="copy-req-detail">
                    子账号：${this.escapeHtml(this.getSubAccountName(r.subAccountId))}
                    ${r.copyTitle ? ' · 文案：' + this.escapeHtml(r.copyTitle) : ''}
                    <br>申请人：${this.escapeHtml(r.requesterName)} → 受理人：${this.escapeHtml(r.targetEmployeeName)}
                    ${r.message ? '<br>留言：' + this.escapeHtml(r.message) : ''}
                    ${r.responseMessage ? '<br>回复：' + this.escapeHtml(r.responseMessage) : ''}
                </div>
            `;
            return `
                <div class="copy-req-item ${r.status === 'pending' ? 'pending' : ''}" data-id="${r.id}">
                    <div class="copy-req-head">
                        <input type="checkbox" class="copy-req-check" data-id="${r.id}" title="选择" />
                        ${typeTag} ${statusTag}
                        <span class="copy-req-time">${this.formatTime(r.createdAt)}</span>
                    </div>
                    ${detail}
                    ${actions ? `<div class="copy-req-actions">${actions}</div>` : ''}
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="copy-req-select-all-bar">
                <label><input type="checkbox" id="copy-req-select-all" /> 全选</label>
            </div>
            ${listHtml}
        `;
        this.updateBatchDeleteBtn();
    },

    formatTime(isoStr) {
        const d = new Date(isoStr);
        const diff = new Date() - d;
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
        return d.toLocaleString('zh-CN', { hour12: false });
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return str.toString().replace(/[&<>"']/g, m =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    },
};

/* ============================================================
   实时同步：刷新当前视图（当其他标签页/设备数据变更时调用）
   ============================================================ */
function refreshCurrentView() {
    // 重新从 localStorage 加载数据到内存
    if (typeof DataStore !== 'undefined') {
        DataStore.reloadAll();
    }
    // 重新更新员工数据到 Auth
    if (typeof Auth !== 'undefined' && Auth.getCurrentUser() && Auth.getCurrentUser().role === 'employee') {
        const empData = localStorage.getItem('yuangongguanli/_index');
        if (empData) {
            try {
                const employees = JSON.parse(empData);
                const user = Auth.getCurrentUser();
                const emp = employees.find(e => e.id === user.id);
                if (emp) {
                    user.positions = emp.positions || [];
                    user.position = (emp.positions && emp.positions.length) ? emp.positions.join('、') : '';
                    user.subAccounts = emp.subAccounts || [];
                    user.features = emp.features || [];
                }
            } catch (e) {}
        }
    }

    const view = state.currentView;
    console.log('[实时同步] 刷新视图:', view);

    switch (view) {
        case 'dashboard':
            if (typeof Dashboard !== 'undefined') {
                Dashboard.updateStatCards();
                Dashboard.renderTable();
            }
            break;
        case 'tencent-docs':
            if (typeof CopyLibrary !== 'undefined') CopyLibrary.render();
            if (typeof CopyLibraryRequest !== 'undefined') CopyLibraryRequest.render();
            break;
        case 'leave':
            if (typeof LeaveManager !== 'undefined') LeaveManager.render();
            break;
        case 'meal':
            if (typeof MealManager !== 'undefined') MealManager.render();
            break;
        case 'folder-manager':
            if (typeof FolderManager !== 'undefined') FolderManager.render();
            break;
        case 'salary':
            if (typeof SalaryManager !== 'undefined') SalaryManager.renderView();
            break;
        case 'short-video-alert':
            if (typeof ShortVideoAlert !== 'undefined') ShortVideoAlert.render();
            break;
        case 'employee':
            if (typeof EmployeeManager !== 'undefined') EmployeeManager.render();
            break;
        case 'sub-account':
            if (typeof SubAccountManager !== 'undefined') SubAccountManager.render();
            break;
        case 'apps':
            if (typeof AppManager !== 'undefined') AppManager.render();
            if (typeof CommonApps !== 'undefined') CommonApps.render();
            break;
        case 'clip-worksheet':
            if (typeof EditingWorksheet !== 'undefined') EditingWorksheet.render();
            break;
    }

    // 刷新通知
    if (typeof NotificationManager !== 'undefined') {
        NotificationManager.refreshBadge();
    }
}

/* ============================================================
   模块：消息通知（管理员审批 → 员工端实时接收）
   ============================================================ */
const NotificationManager = {
    init() {
        this.bindEvents();
        this.refreshBadge();
    },

    bindEvents() {
        const bellBtn = document.getElementById('notification-bell-btn');
        const panel = document.getElementById('notification-panel');
        const closeBtn = document.getElementById('notification-panel-close');
        const clearBtn = document.getElementById('notification-clear-btn');

        if (bellBtn) {
            bellBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (panel) {
                    panel.classList.toggle('show');
                    if (panel.classList.contains('show')) {
                        this.renderList();
                    }
                }
            });
        }

        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (panel && panel.classList.contains('show')) {
                if (!panel.contains(e.target) && !bellBtn?.contains(e.target)) {
                    panel.classList.remove('show');
                }
            }
        });

        if (closeBtn) closeBtn.addEventListener('click', () => { panel?.classList.remove('show'); });
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearAll());
    },

    // 创建通知
    create(type, title, message, targetEmployeeId) {
        const newId = MOCK_DATA.notifications.length
            ? Math.max(...MOCK_DATA.notifications.map(n => n.id)) + 1
            : 1;
        const notif = {
            id: newId,
            type,           // 'leave_approved', 'leave_rejected', 'meal', 'system'
            title,
            message,
            targetEmployeeId,  // 目标员工 ID（null 表示所有员工）
            createdAt: new Date().toISOString(),
            read: false,
        };
        MOCK_DATA.notifications.push(notif);
        DataStore.saveNotifications();
        this.refreshBadge();
        return notif;
    },

    // 获取当前用户的通知
    getMyNotifications() {
        const user = Auth.getCurrentUser();
        if (!user) return [];
        const myId = user.id !== undefined ? user.id : (user.role === 'admin' ? 'admin' : 0);
        return MOCK_DATA.notifications
            .filter(n => {
                if (user.role === 'admin') return true; // 管理员看所有
                return n.targetEmployeeId === myId || n.targetEmployeeId === null || n.targetEmployeeId === undefined;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    // 获取未读数量
    getUnreadCount() {
        return this.getMyNotifications().filter(n => !n.read).length;
    },

    // 刷新角标
    refreshBadge() {
        const badge = document.getElementById('notification-badge');
        const count = this.getUnreadCount();
        if (badge) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    // 渲染通知列表
    renderList() {
        const list = document.getElementById('notification-list');
        if (!list) return;
        const notifs = this.getMyNotifications();

        if (notifs.length === 0) {
            list.innerHTML = '<div class="notif-empty">暂无消息通知</div>';
            return;
        }

        list.innerHTML = notifs.map(n => {
            const timeStr = this.formatTime(n.createdAt);
            const iconMap = {
                'leave_approved': '&#9989;',
                'leave_rejected': '&#10060;',
                'meal': '&#127869;',
                'copy_request': '&#128221;',
                'copy_request_approved': '&#9989;',
                'copy_request_rejected': '&#10060;',
                'system': '&#128276;',
            };
            const icon = iconMap[n.type] || '&#128276;';
            return `
                <div class="notif-item ${n.read ? '' : 'unread'}" onclick="NotificationManager.markRead(${n.id})">
                    <div class="notif-icon">${icon}</div>
                    <div class="notif-content">
                        <div class="notif-title">${this.escapeHtml(n.title)}</div>
                        <div class="notif-msg">${this.escapeHtml(n.message)}</div>
                        <div class="notif-time">${timeStr}</div>
                    </div>
                    ${!n.read ? '<div class="notif-dot"></div>' : ''}
                </div>
            `;
        }).join('');
    },

    // 标记已读
    markRead(id) {
        const n = MOCK_DATA.notifications.find(n => n.id === id);
        if (n) {
            n.read = true;
            DataStore.saveNotifications();
            this.refreshBadge();
            this.renderList();
        }
    },

    // 清空所有通知（仅管理员）
    clearAll() {
        if (!Auth.isAdmin()) {
            // 员工只标记自己的为已读
            const user = Auth.getCurrentUser();
            const myId = user.id !== undefined ? user.id : 0;
            MOCK_DATA.notifications.forEach(n => {
                if (n.targetEmployeeId === myId || n.targetEmployeeId === null || n.targetEmployeeId === undefined) n.read = true;
            });
        } else {
            MOCK_DATA.notifications = [];
        }
        DataStore.saveNotifications();
        this.refreshBadge();
        this.renderList();
        showToast('已清空通知', 'info');
    },

    formatTime(isoStr) {
        const d = new Date(isoStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
        if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
        return d.toLocaleString('zh-CN', { hour12: false });
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return str.toString().replace(/[&<>"']/g, m =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    },
};

/* ============================================================
   应用初始化
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 等待 Supabase 云端同步完成
        if (typeof SupabaseSync !== 'undefined') {
            await SupabaseSync.ready();
        }

        // 认证检查：未登录则跳转登录页
        if (!Auth.getCurrentUser()) {
            window.location.href = 'login.html';
            return;
        }

        // 更新日期
        updateHeaderDate();

        // 初始化数据持久化层（从 localStorage 加载所有数据）
        DataStore.init();

        // 关键：auth.js 在脚本解析时就加载了员工数据，如果此时云端数据尚未写入 localStorage，
        // 内存中的 MOCK_AUTH_DATA.employees 会是空数组。DataStore.init() 之后重新加载一次，
        // 确保员工/管理员数据与持久化层一致。
        if (typeof Auth !== 'undefined' && Auth.reloadPersistedData) {
            Auth.reloadPersistedData();
        }

        // 更新UI（用户信息、权限控制）
        Auth.updateUI();

        // 初始化所有模块（FolderManager 需在 Dashboard 之前，确保视频数量已加载）
        // 每个模块单独 try-catch，避免单个模块初始化失败导致整个应用中断
        const modules = [
            { name: 'Navigation', fn: () => Navigation.init() },
            { name: 'FolderManager', fn: () => FolderManager.init() },
            { name: 'Dashboard', fn: () => Dashboard.init() },
            { name: 'CopyLibrary', fn: () => CopyLibrary.init() },
            { name: 'CopyLibraryRequest', fn: () => CopyLibraryRequest.init() },
            { name: 'EditingWorksheet', fn: () => EditingWorksheet.init() },
            { name: 'TencentDocs', fn: () => TencentDocs.init() },
            { name: 'ClipWorkSettings', fn: () => { if (typeof ClipWorkSettings !== 'undefined') ClipWorkSettings.init(); } },
            { name: 'VideoDownloader', fn: () => VideoDownloader.init() },
            { name: 'CopyDownloader', fn: () => CopyDownloader.init() },
            { name: 'AutoBrowser', fn: () => AutoBrowser.init() },
            { name: 'SalaryManager', fn: () => SalaryManager.init() },
            { name: 'OperatingCostManager', fn: () => OperatingCostManager.init() },
            { name: 'EmployeeManager', fn: () => EmployeeManager.init() },
            { name: 'SubAccountManager', fn: () => SubAccountManager.init() },
            { name: 'VideoMonitor', fn: () => VideoMonitor.init() },
            { name: 'CopyMonitor', fn: () => CopyMonitor.init() },
            { name: 'ShortVideoAlert', fn: () => ShortVideoAlert.init() },
            { name: 'AppManager', fn: () => AppManager.init() },
            { name: 'CommonApps', fn: () => CommonApps.init() },
            { name: 'Settings', fn: () => Settings.init() },
            { name: 'LeaveManager', fn: () => LeaveManager.init() },
            { name: 'MealManager', fn: () => MealManager.init() },
            { name: 'NotificationManager', fn: () => NotificationManager.init() },
        ];
        modules.forEach(m => {
            try { m.fn(); } catch (e) { console.error(`[Init] ${m.name} 初始化失败:`, e); }
        });

        // 注册实时同步回调：当其他标签页/设备数据变更时，自动刷新当前视图
        if (typeof SupabaseSync !== 'undefined') {
            SupabaseSync.markAppInitialized();
            SupabaseSync.onChange((changedKey) => {
                // 延迟执行，避免频繁刷新
                clearTimeout(window._syncRefreshTimer);
                window._syncRefreshTimer = setTimeout(() => {
                    refreshCurrentView();
                }, 200);
            });
        }

        // 退出登录（主入口绑定）
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('确定要退出登录吗？')) {
                    Auth.logout();
                }
            });
        }

        // 暴露需要全局访问的对象
        window.SalaryManager = SalaryManager;
        window.OperatingCostManager = OperatingCostManager;
        window.EmployeeManager = EmployeeManager;
        window.SubAccountManager = SubAccountManager;
        window.FolderManager = FolderManager;
        window.CopyLibrary = CopyLibrary;
        window.CopyLibraryRequest = CopyLibraryRequest;
        window.VideoMonitor = VideoMonitor;
        window.CopyMonitor = CopyMonitor;
        window.ShortVideoAlert = ShortVideoAlert;
        window.AppManager = AppManager;
        window.CommonApps = CommonApps;
        window.LeaveManager = LeaveManager;
        window.MealManager = MealManager;
        window.NotificationManager = NotificationManager;
    } catch (e) {
        console.error('[AppInit] 应用初始化失败:', e);
        showToast('应用初始化失败：' + (e && e.message ? e.message : e), 'error');
    }
});

/* ============================================================
   说明：代码架构遵循以下原则
   1. 每个功能模块独立封装为对象，职责单一
   2. 状态集中在 state 对象管理
   3. 配置集中在 CONFIG 对象
   4. 模拟数据集中在 MOCK_DATA 对象
   5. 所有DOM操作在DOMContentLoaded后执行
   6. 图表实例统一存储，避免重复创建
   实际部署时：
   - MOCK_DATA 替换为真实API请求
   - 视频解析需后端服务（如 yt-dlp 等）
   - 文案库使用本地 localStorage 持久化（实际部署接入后端）
   - 自动化浏览器建议使用 Puppeteer/Playwright 后端方案
   ============================================================ */

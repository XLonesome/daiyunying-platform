/* ============================================================
   Supabase 同步层 (SupabaseSync)
   职责：将 localStorage 数据双向同步到 Supabase 云数据库
   原理：
   - 页面加载时从云端拉取所有数据写入 localStorage（覆盖本地）
   - 之后每次 localStorage.setItem 自动同步到云端
   - platform_session 不同步（设备级会话，不跨设备共享）
   - 实时同步：BroadcastChannel（跨标签页）+ 轮询（跨设备）
   ============================================================ */

const SupabaseSync = {
    client: null,
    initialized: false,
    _originalSetItem: null,
    _originalRemoveItem: null,
    _broadcastChannel: null,
    _isRemoteChange: false,      // 标记当前是否在处理远端变更（防止循环）
    _callbacks: [],               // 数据变更回调列表
    _pollTimer: null,             // 轮询定时器
    _lastCloudSync: 0,           // 上次云端同步时间戳
    _loadAbortController: null,  // 用于取消超时的初始加载
    _loadPromise: null,          // 后台加载 Promise
    _appInitialized: false,      // 应用主初始化是否已完成
    POLL_INTERVAL: 5000,         // 轮询间隔（5秒）
    syncStatus: 'pending',       // pending | success | error | no-cloud
    syncDetail: '',              // 状态详情文字

    // 这些 key 不参与云端同步（设备/浏览器级、调试日志、第三方埋点）
    EXCLUDE_KEYS: [
        'platform_session',
        'platform_current_user',
        'supabase_sync_status',
        'loglevel',
        'loglevel:webpack-dev-server',
    ],

    _isExcludedKey(key) {
        if (!key) return true;
        if (this.EXCLUDE_KEYS.includes(key)) return true;
        // 排除浏览器第三方埋点缓存
        if (key.startsWith('__BEACON_')) return true;
        if (key.startsWith('__tea_')) return true;
        if (key.startsWith('loglevel:')) return true;
        return false;
    },

    setStatus(status, detail) {
        this.syncStatus = status;
        this.syncDetail = detail || '';
        const el = document.getElementById('sync-status');
        if (!el) return;
        el.className = 'sync-status sync-' + status;
        const labels = {
            pending: '同步中',
            success: '已同步',
            error: '同步失败',
            'no-cloud': '未配置云端',
        };
        el.textContent = labels[status] || status;
        el.title = this.syncDetail || labels[status] || status;
        el.style.cursor = (status === 'error' || status === 'no-cloud') ? 'pointer' : 'default';
        el.onclick = (status === 'error' || status === 'no-cloud') ? () => this.forceResync() : null;
    },

    async forceResync() {
        this.setStatus('pending', '正在重新连接云端数据库...');
        try {
            if (!this.client) {
                if (typeof supabase === 'undefined') {
                    throw new Error('Supabase 客户端库未加载，请检查网络或 CDN 可访问性');
                }
                this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                this.initialized = true;
            }
            const result = await this._loadFromCloud();
            if (result === 'success') {
                this.setStatus('success', '已从云端加载数据');
                this._refreshApp();
            } else if (result === 'no-data') {
                this.setStatus('error', '云端暂无数据，当前显示为空。请从旧链接导出数据后导入');
            } else {
                this.setStatus('error', '重新同步失败，请检查网络');
            }
        } catch (e) {
            console.error('[SupabaseSync] 强制重新同步失败:', e);
            this.setStatus('error', '重新同步失败: ' + (e.message || e));
        }
    },

    /* 初始化 */
    async init() {
        this.setStatus('pending', '正在连接云端数据库...');
        // 先初始化跨标签页通信（即使没有 Supabase 也需要）
        this._initBroadcast();
        this._initStorageListener();

        // 始终 patch localStorage（即使没有 Supabase，也需要广播变更给其他标签页）
        this._patchLocalStorage();

        if (!SUPABASE_CONFIGURED) {
            console.warn('[SupabaseSync] 未配置 Supabase，仅使用本地存储 + 跨标签页同步');
            this.setStatus('no-cloud', '未配置 Supabase，数据仅在当前浏览器保存');
            this._resolveReady();
            this._hideLoadingOverlay();
            return;
        }

        if (typeof supabase === 'undefined') {
            const msg = 'Supabase 客户端库未加载（可能是 CDN 被拦截），请检查网络或刷新重试';
            console.error('[SupabaseSync]', msg);
            this.setStatus('error', msg);
            this._resolveReady();
            this._hideLoadingOverlay();
            return;
        }

        try {
            this.client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            this.initialized = true;
        } catch (e) {
            console.error('[SupabaseSync] 创建 Supabase 客户端失败:', e);
            this.setStatus('error', '创建 Supabase 客户端失败: ' + (e.message || e));
            this._resolveReady();
            this._hideLoadingOverlay();
            return;
        }

        // 后台启动初始加载，让它在超时后仍可继续完成
        this._loadPromise = this._loadFromCloud(true).then(result => {
            if (result === 'success') {
                this.setStatus('success', '已从云端加载数据');
                this._refreshApp();
            } else if (result === 'no-data') {
                this.setStatus('error', '云端暂无数据，当前显示为空。请从旧链接导出数据后导入');
            }
            return result;
        }).catch(e => {
            console.error('[SupabaseSync] 初始加载失败:', e);
            this.setStatus('error', '同步失败: ' + (e.message || e));
        });

        // 前台最多等待 60 秒；超过则继续展示「加载中」，后台仍会继续尝试
        const timeoutMs = 60000;
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve('timeout'), timeoutMs));

        try {
            const result = await Promise.race([this._loadPromise, timeoutPromise]);
            if (result === 'timeout') {
                console.warn('[SupabaseSync] 初始云端同步仍在后台进行，前台先使用本地数据继续');
                this.setStatus('pending', '云端数据仍在加载中，请稍候。若长时间未恢复，可点击此处重试');
            }
        } catch (e) {
            console.error('[SupabaseSync] 同步等待异常:', e);
            this.setStatus('error', '同步失败: ' + (e.message || e));
        } finally {
            this._resolveReady();
            this._hideLoadingOverlay();
        }

        // 启动轮询（跨设备实时同步）
        this._startPolling();
    },

    /* 应用完成主初始化后调用，便于后台数据到达时刷新 */
    markAppInitialized() {
        this._appInitialized = true;
    },

    _refreshApp() {
        try {
            if (typeof DataStore !== 'undefined' && DataStore.reloadAll) {
                DataStore.reloadAll();
            }
            if (typeof Auth !== 'undefined' && Auth.updateUI) {
                Auth.updateUI();
            }
            if (typeof Navigation !== 'undefined' && typeof Navigation.refreshCurrentView === 'function') {
                Navigation.refreshCurrentView();
            } else if (typeof refreshCurrentView === 'function') {
                refreshCurrentView();
            }
        } catch (e) {
            console.error('[SupabaseSync] 刷新应用失败:', e);
        }
    },

    /* ====== BroadcastChannel 跨标签页通信 ====== */
    _initBroadcast() {
        try {
            this._broadcastChannel = new BroadcastChannel('app_data_sync');
            this._broadcastChannel.onmessage = (e) => {
                if (e.data && e.data.type === 'data_updated' && !this._isRemoteChange) {
                    this._handleRemoteChange(e.data.key, 'broadcast');
                }
            };
            console.log('[SupabaseSync] BroadcastChannel 已就绪');
        } catch (e) {
            console.warn('[SupabaseSync] BroadcastChannel 不支持，仅使用 storage 事件');
        }
    },

    _broadcastChange(key) {
        if (this._broadcastChannel) {
            this._broadcastChannel.postMessage({ type: 'data_updated', key });
        }
    },

    /* ====== Storage 事件监听（跨标签页备用方案） ====== */
    _initStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key && !this._isExcludedKey(e.key) && !this._isRemoteChange) {
                // 跳过值未实际变化的事件
                if (e.oldValue === e.newValue) return;
                this._handleRemoteChange(e.key, 'storage');
            }
        });
    },

    /* ====== 处理远端数据变更 ====== */
    _handleRemoteChange(key, source) {
        if (this._isRemoteChange) return;
        this._isRemoteChange = true;

        try {
            // 通知所有注册的回调
            this._notifyCallbacks(key);
        } finally {
            setTimeout(() => { this._isRemoteChange = false; }, 100);
        }
    },

    /* ====== 注册数据变更回调 ====== */
    onChange(callback) {
        if (typeof callback === 'function') {
            this._callbacks.push(callback);
        }
    },

    _notifyCallbacks(key) {
        this._callbacks.forEach(cb => {
            try { cb(key); } catch (e) {
                console.error('[SupabaseSync] 回调执行异常:', e);
            }
        });
    },

    /* ====== 云端数据加载 ====== */
    async _loadFromCloud(allowSlow = false) {
        try {
            const controller = new AbortController();
            this._loadAbortController = controller;
            // 单次查询最多 60 秒
            const timeoutId = setTimeout(() => controller.abort(), 60000);

            const { data, error } = await this.client
                .from('app_data')
                .select('key, value')
                .abortSignal(controller.signal);

            clearTimeout(timeoutId);

            if (error) throw error;

            if (data && data.length > 0) {
                let loaded = 0;
                data.forEach(row => {
                    if (this._isExcludedKey(row.key)) return;
                    this._originalSetItem.call(localStorage, row.key, row.value);
                    loaded++;
                });
                console.log(`[SupabaseSync] 从云端加载了 ${loaded} 条数据`);
                return 'success';
            } else {
                console.log('[SupabaseSync] 云端无数据，使用本地数据');
                await this._uploadLocalData();
                return 'no-data';
            }
        } catch (e) {
            if (e.name === 'AbortError') {
                console.warn('[SupabaseSync] 加载云端数据超时');
                throw new Error('加载云端数据超时，请检查网络');
            }
            console.error('[SupabaseSync] 加载云端数据失败:', e);
            throw e;
        }
    },

    /* 将本地 localStorage 数据上传到云端（首次使用） */
    async _uploadLocalData() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !this._isExcludedKey(key)) {
                keys.push(key);
            }
        }

        if (keys.length === 0) return;

        const rows = keys.map(key => ({
            key: key,
            value: localStorage.getItem(key),
            updated_at: new Date().toISOString(),
        }));

        try {
            const { error } = await this.client
                .from('app_data')
                .upsert(rows);
            if (error) throw error;
            console.log(`[SupabaseSync] 上传了 ${rows.length} 条本地数据到云端`);
        } catch (e) {
            console.error('[SupabaseSync] 上传本地数据失败:', e);
        }
    },

    /* ====== localStorage 补丁 ====== */
    _patchLocalStorage() {
        const self = this;
        this._originalSetItem = localStorage.setItem.bind(localStorage);
        this._originalRemoveItem = localStorage.removeItem.bind(localStorage);

        // 拦截 setItem：写入本地 + 同步云端 + 广播
        localStorage.setItem = function (key, value) {
            self._originalSetItem.call(localStorage, key, value);
            if (!self._isExcludedKey(key) && !self._isRemoteChange) {
                self._syncToCloud(key, value);
                self._broadcastChange(key);
            }
        };

        // 拦截 removeItem：删除本地 + 删除云端 + 广播
        localStorage.removeItem = function (key) {
            self._originalRemoveItem.call(localStorage, key);
            if (!self._isExcludedKey(key) && !self._isRemoteChange) {
                self._removeFromCloud(key);
                self._broadcastChange(key);
            }
        };
    },

    /* ====== 云端写入 ====== */
    async _syncToCloud(key, value) {
        if (!this.initialized) return;
        try {
            const { error } = await this.client
                .from('app_data')
                .upsert({
                    key: key,
                    value: value,
                    updated_at: new Date().toISOString(),
                });
            if (error) console.error('[SupabaseSync] 同步失败:', key, error.message);
        } catch (e) {
            console.error('[SupabaseSync] 同步异常:', key, e);
        }
    },

    async _removeFromCloud(key) {
        if (!this.initialized) return;
        try {
            const { error } = await this.client
                .from('app_data')
                .delete()
                .eq('key', key);
            if (error) console.error('[SupabaseSync] 删除失败:', key, error.message);
        } catch (e) {
            console.error('[SupabaseSync] 删除异常:', key, e);
        }
    },

    /* ====== 轮询：定期从云端拉取数据（跨设备同步） ====== */
    _startPolling() {
        if (this._pollTimer) clearInterval(this._pollTimer);
        this._pollTimer = setInterval(() => this._pollCloud(), this.POLL_INTERVAL);
    },

    async _pollCloud() {
        if (!this.initialized) return;
        try {
            const { data, error } = await this.client
                .from('app_data')
                .select('key, value, updated_at');

            if (error || !data) return;

            let hasChanges = false;
            const changedKeys = [];

            data.forEach(row => {
                if (this._isExcludedKey(row.key)) return;
                const actualLocal = localStorage.getItem(row.key);
                if (actualLocal !== row.value) {
                    // 云端数据有变化，更新本地（使用原始 setItem 避免触发同步回云端）
                    this._originalSetItem.call(localStorage, row.key, row.value);
                    changedKeys.push(row.key);
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                console.log(`[SupabaseSync] 轮询检测到 ${changedKeys.length} 条数据变更`);
                this._isRemoteChange = true;
                this._notifyCallbacks(changedKeys.join(','));
                setTimeout(() => { this._isRemoteChange = false; }, 100);
            }
        } catch (e) {
            // 轮询失败静默处理，下次重试
        }
    },

    /* ====== 加载遮罩控制 ====== */
    _showLoadingOverlay() {
        if (!SUPABASE_CONFIGURED) return;
        let overlay = document.getElementById('cloud-sync-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'cloud-sync-overlay';
            overlay.style.cssText = [
                'position:fixed', 'top:0', 'left:0', 'width:100%', 'height:100%',
                'background:rgba(15,23,42,0.92)', 'z-index:99999',
                'display:flex', 'flex-direction:column',
                'align-items:center', 'justify-content:center',
                'color:#e2e8f0', 'font-family:system-ui,sans-serif',
                'transition:opacity 0.3s ease',
            ].join(';');
            overlay.innerHTML = `
                <div style="width:48px;height:48px;border:4px solid rgba(99,102,241,0.2);
                    border-top-color:#6366f1;border-radius:50%;
                    animation:cloudspin 0.8s linear infinite;margin-bottom:20px;"></div>
                <div style="font-size:16px;font-weight:600;margin-bottom:6px;">正在同步云端数据</div>
                <div style="font-size:13px;color:#94a3b8;">首次加载可能需要 10-60 秒，请稍候...</div>
                <style>
                    @keyframes cloudspin { to { transform: rotate(360deg); } }
                </style>
            `;
            document.body ? document.body.appendChild(overlay) : document.documentElement.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    },

    _hideLoadingOverlay() {
        const overlay = document.getElementById('cloud-sync-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; }, 300);
        }
    },

    /* ====== Ready Promise ====== */
    _readyResolve: null,
    _readyPromise: null,

    _initReady() {
        this._readyPromise = new Promise(resolve => {
            this._readyResolve = resolve;
        });
    },

    _resolveReady() {
        if (this._readyResolve) this._readyResolve();
    },

    ready() {
        return this._readyPromise || Promise.resolve();
    },
};

/* 初始化 Ready Promise */
SupabaseSync._initReady();

/* 在 DOM 就绪后启动同步 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SupabaseSync._showLoadingOverlay();
        SupabaseSync.init();
    });
} else {
    SupabaseSync._showLoadingOverlay();
    SupabaseSync.init();
}

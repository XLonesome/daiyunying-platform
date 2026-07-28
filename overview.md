# 子账号绩效配置功能完成

## 做了什么

新增「询盘绩效」与「爆款绩效」的自动计算与配置能力：

1. **数据结构**
   - `MOCK_DATA.subAccountSalaryConfig` 新增：
     - `inquiry`：按子账号配置留资数 `max`（最大值）、`min`（最小值）、`amount`（金额）。
     - `viral`：按播放量阈值配置 `name`（名称）、`views`（阈值）、`amount`（奖励金额）。
   - `DataStore` 增加 `loadSubAccountSalaryConfig` / `saveSubAccountSalaryConfig`，数据随 localStorage 持久化并通过 SupabaseSync 同步。

2. **剪辑工作表自动计算**
   - `EditingWorksheet.calculateInquiryPerformance(year, month, subIds)`
     - 汇总短视频预警的留资数。
     - 达到 `max` 拿满 `amount`；超出按 `max` 计；低于 `min` 为 0；中间按 `amount × (leads / max)` 计算。
   - `EditingWorksheet.calculateViralHitPerformance(year, month, subIds)`
     - 按播放量阈值取最高档位奖励，每条视频只计一次。
   - 剪辑工作表顶部的「爆款绩效」「询盘绩效」卡片从 `—` 改为实时金额。

3. **工资管理配置面板**
   - 管理员在「工资管理」新增「子账号绩效基数配置」区域：
     - 询盘绩效：每子账号可设最大值、最小值、金额。
     - 爆款绩效：可新增/删除/编辑阈值名称、播放量、奖励金额。
   - 保存后自动刷新剪辑工作表，绩效卡片实时更新。

## 验证结果

jsdom 测试：
- 子账号 1 留资 80，max=100、min=20、amount=50 → 40 元。
- 留资 100 → 50 元；留资 101 → 50 元；留资 10 → 0 元。
- 爆款 15 万播放 → 20 元；20 万播放 → 40 元；合计 60 元。

## 部署

- 新 CloudStudio 链接：https://8d47acbcdf3c4ee7bfd2212ee5b430c8.app.codebuddy.work
- 注意：`workbuddy_cloudstudio_deploy` 每次都会新建沙箱，无法复用之前的链接。如需稳定同一链接，建议迁移到 Vercel / Netlify / GitHub Pages / 腾讯云静态托管等平台。

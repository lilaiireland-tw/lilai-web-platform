# Production route safety

正式 Router 的 Dashboard route `lilaiireland.com/*`、兩條 Signup routes 與
`*.lilaiireland.com/*` 排除規則維持原狀。Router 設定必須省略 `route` 與 `routes`；
Platform 保持私有、`routes: []`、workers.dev / previews 關閉。

正式發布已改為成對更新 Platform 與 Signup Backend。以
[Unified Production Release](unified-production-release.md) 為現行操作手冊；
舊 Platform-only workflow 與 CLI 已移除。PR/push 只執行驗證，正式發布必須從
main 手動觸發，通過 production Environment 與同一個發布鎖。

發布使用 versions upload 與版本啟用，保留 Dashboard 管理的 Routes / exposure、
既有 Queue Consumer 與 Cron。Router 不重新部署；若發現需要更改正式 Routes，
立即停止並另行審核，不能讓此 CI/CD 自動修復。

`check:production-route-safety`、`check:production-routing` 與
`check-production-release-strategy.ts` 是本地契約檢查；線上漂移由 Production
Preflight 唯讀核對。Rollback 依相同手冊成對恢復 Worker Version，不變更資料或 Routes。

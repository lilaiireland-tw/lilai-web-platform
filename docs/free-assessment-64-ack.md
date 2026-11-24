# Issue #64：平台同網域 GAS ACK

基準：2026-11-24 最新 #64/#61/#62 與已合併 PR #73，`origin/develop` 為 `cefe7e59cdefcda3654e02390bf3fc8dfe3f5710`。本文件記錄平台實作；#61 舊文件 5.4/5.5 的必要 receiptToken、jobStatus、持久冪等要求不適用本次。沒有修改 GAS，也沒有正式部署或 Google 資源測試。

## 資料流與成功邊界

原本：Browser → GAS `no-cors` → opaque resolve → 完成 gate／結果／GA4／Ads；回饋先顯示感謝再送出。

現在：Browser → 同網域 API → 既有 Platform Worker／Next Route Handler → 固定 GAS POST → 至多一次受限 ContentService GET redirect → 解析真實 JSON → ACK 驗證 → Browser 再驗證 → `runConsultationSubmission` 完成 gate／結果／既有 GA4／Ads。

主提交成功只代表 GAS 確認接收，不代表 PDF 生成或 Email 寄送。回饋使用同一代理，僅在有效回應後顯示感謝；回饋有獨立防雙擊 gate，不觸發主提交轉換。原 analytics、Cookie Consent、UTM、廣告目的地與事件名稱不變；識別碼、問卷、授權與來源資料不進分析。

## API request / response contract

兩個精確路徑僅接受 POST：

| 路徑 | Request JSON | 成功 HTTP 200 |
| --- | --- | --- |
| `/api/consult/submissions` | 現有完整 #65/#66 平面 payload，含 UUID `submissionId`、兩個 boolean opt-in、版本、來源空值與評估結果；不接受其他 `type` 動作 | `{status:"ok",accepted:true,jobId,submissionId}` |
| `/api/consult/accuracy-feedback` | `type:"accuracy_feedback"`、原 `submissionId`、原 `jobId`、現有 name/nickname/email/stageName/leadQuality/accuracyAnswer/submittedAt | `{status:"ok"}` |

Browser 必須送 `Content-Type: application/json`、`X-Consult-Request: 1`；Origin 必須等於實際請求 origin，存在的 Sec-Fetch-Site 必須為 same-origin。不信任 X-Forwarded-Host；僅本機 HTTP localhost URL 對 127.0.0.1 同 port listener 的 Host 做等價比對，支援 Next custom server。主提交拒絕未知鍵／內部控制欄位，版本與來源選項沿用 `consult-content.ts` 單一來源；Feedback 僅接受固定欄位，拒絕 `urgentFollowUp`／client consent／其他動作。不提供 CORS。這些是基本跨站濫用防護，**不是身份驗證或分散式限流**；非瀏覽器可偽造 Origin。未新增基礎設施或持久狀態。

主 ACK 同時要求 HTTP 2xx、有效 JSON object、`status === "ok"`、`accepted === true`、UUID jobId（快照由 `Utilities.getUuid()` 產生）；如上游存在 submissionId，必須與此次完全一致。Proxy 回傳的 submissionId 是匹配後的本次關聯值；舊 GAS 未回傳時由 request 補入，不宣稱 GAS 已保存此欄位。

Feedback 沿用快照實際 `{status:"ok"}`；可選 submissionId 若存在也須匹配，accepted 若存在只接受 boolean true，拒絕 error 欄位。無須虛構 `success:true`／feedbackStatus／jobStatus。Proxy 僅回傳白名單 ACK 欄位，不反射上游 HTML、錯誤文字、redirect URL、Google 識別資料或客戶 payload。

錯誤為 `{error: code}`：400 無效 JSON／payload，403 Origin 拒絕，413 body 過大，415 請求格式不符，503 server endpoint 未設定／不合法，502 上游 HTTP／redirect／ACK／網路錯誤，504 `receipt_unconfirmed`。未支援方法由 Next 回 405。所有代理回應 `Cache-Control: no-store`；不記錄 body、個資、自由文字、憑證、上游錯誤或 redirect URL。

Request 限制 32 KiB、上游 ACK 16 KiB，皆以串流實際位元組計算，不只相信 Content-Length。15 秒 server deadline 包含讀 request、POST、redirect、讀 ACK；Abort 取消讀取及 fetch。Browser deadline 20 秒。沒有自動重試。固定 endpoint 只能是無 query／fragment／userinfo／非預設 port 的 `https://script.google.com/macros/s/<deployment>/exec`。

只允許第一次回應 302/303 導向 `https://script.googleusercontent.com/macros/echo?...`；使用新的 GET、manual redirect，不帶原 body、header、cookie 或憑證。拒絕其他 host／path／scheme／port／userinfo／fragment、307/308 或第二次 redirect。這符合 [Google ContentService redirect 說明](https://developers.google.com/apps-script/guides/content)；未向正式端點驗證。

## Retry 與記憶體狀態

- 同頁未修改內容的人工重試沿用原 submissionId **及完整原 payload（包括 submittedAt、版本、opt-in、來源）**。失敗／逾時保留所有填答，說明「尚未確認是否成功接收」，不保證未送達。
- 失敗後修改內容：送出前明確確認新 ID／新評估與可能重複的風險；取消不送、不換 ID，確認才建立新 ID。不是靜默換 ID 或自動重送。重新整理／關頁不保存記憶體狀態，也沒有建立持久冪等系統。
- 主提交成功後既有 gate 鎖定；同時／重複點擊只有一次請求。ACK 解析在 request Promise resolve 前完成。
- 回饋保留原 submissionId/jobId；失敗可人工重試，但舊 GAS 回饋沒有去重保證，文案明示可能重複記錄。這兩個 ID 與 client Email 都只是關聯資料，**不是操作或聯繫授權**。

## Routing ownership 與環境配置

檢查來源：`production-routing-policy.ts`、`production-router.ts`／`production-router-worker.ts`、`production-router.jsonc`、`production-platform-worker.ts`／`production-platform.jsonc`、`staging-worker.ts`、`wrangler.jsonc`、Next config 與既有 Route Handlers。一般 `/api/*` 原本 fallback WordPress；staging 原本除 Signup API 外拒絕 POST，單加 Route Handler 不夠。

- Production Router 僅新增上述兩個**精確 pathname** 給既有 PLATFORM Service Binding；在 WordPress query 判斷之前選擇，避免這兩個 API 的 query 將 POST 送至 WP。相鄰路徑、尾 slash、子路徑及其他 API 不納入。既有主機名檢查保留。
- Platform Wrapper 本來就將請求交給 OpenNext handler，使用既有 Node compatibility／ASSETS；無新增 Worker 或 binding。
- 已核對安裝的 `@opennextjs/cloudflare@1.20.1`：`dist/cli/templates/worker.js` 將 Request 交 middleware／default Next handler，`templates/init.js::populateProcessEnv` 載入字串 env／secrets，`build/patches/plugins/next-server.js::attachRequestMetaRule` 保留 Route Handler URL protocol；不需要新增 adapter 或用 Edge runtime。這是 installed code 檢查，不是完整生成 adapter 的遠端 runtime 驗證。
- Staging 僅這兩個精確 pathname 交給既有 OpenNext handler，放在 read-only guard 前；Signup forwarding 仍先處理，其他路徑／方法政策不變。未新增 Worker／D1／Cloudflare Routes。
- Repository ownership／Service Binding dispatch 測試證明政策選擇與原 Request method/body 保留；不等於已驗證 live Dashboard Routes。Router 的正式 Routes 由 Dashboard 管理，本 PR 不讀寫 Dashboard、不變更 Routes 配置，Platform 仍 `routes: []`。正式可用性必須在 #67 核對實際 Router 掛載、binding 及 endpoint 設定，不能以 Next 本機測試宣稱已上線。
- server-only `CONSULT_GAS_ENDPOINT` 沿用既有 runtime env／secret 管理；本機用已忽略的 `.env.local`，既有 staging／production Platform Worker 分別配置 runtime secret，不使用 NEXT_PUBLIC 或公開 vars，不提交 deployment URL。既有 `nodejs_compat` 與 2026-10-07 compatibility date 支援 [process.env secrets](https://developers.cloudflare.com/workers/configuration/secrets/)。未設定一律 503，無硬編碼 fallback。staging／local 只能配置隔離 GAS；本票測試一律 mock，Playwright 明確將 endpoint 設為空，漏掉 fixture 也不會送正式 GAS。

## GAS 快照證據與 #62 最小相容清單

唯讀本機未納版 `GAS.gs.txt` SHA-256：`b206bc35d5fb450128c0a89efd5aed20027a24c60759a066ff1d9ef2eba25d61`。未改寫／提交快照；不是 live deployment 驗證。

- `doPost` 83+：主提交 172+ 已回 `{status:'ok',accepted:true,jobId}`；回饋 91–100 呼叫 handler 後回 `{status:'ok'}`。去重命中 139+ 回 ok/accepted，但 IN_FLIGHT 時 jobId 省略，平台拒絕此假成功。
- `enqueueAssessmentJob` 244 產生 UUID。現有 Cache completed window 60 秒，IN_FLIGHT 20 秒；Lock 取得失敗、Cache 到期／淘汰、部分寫入及重開頁可能重複。不改 Cache／Lock／Queue／Retry／Fallback／Checkpoint，不宣稱 exactly-once 或跨重啟持久冪等。
- `handleAccuracyFeedback` 900+ 保存 client 欄位並以 urgentFollowUp 控制 Calendar，未見可信原提交查核。平台不再傳 urgent，但不能宣稱直接 GAS 入口安全或已有授權 gate。

#62 需要的最小項目（本票只交接，沒有修改 GAS）：

1. 沿用現有主 ACK 與回饋 ACK；在既有 Sheet／Queue 可查詢資料保存 submissionId ↔ jobId ↔ 原始／最新授權關聯。可最小 echo submissionId；不新增 receipt DB／job registry。無 jobId 的 IN_FLIGHT 不宣稱接收完成。
2. 在 doPost **所有分支之前** 驗證 server-only shared credential，包含 feedback、direct greeting、未來撤回／退訂更新。一般 Browser 不能自行拿到 credential；由平台 server runtime secret 注入固定上游 POST body 的專用欄位（Apps Script 入口按實際能力選欄位），不得接收／覆用 client 提供的 credential。此欄位名稱／版本、平台注入與 GAS 驗證須在 #62 同步定案並用隔離環境驗證；目前未送 credential，也未假裝 GAS 已驗證。
3. Feedback 的 client IDs／Email 不能視為可信授權：GAS 必須以受驗證入口查原提交及最新有效 contact，忽略 client urgent／consent，不因回饋產生新授權。若要求驗證回饋者對該筆提交的操作權，需最小用途限定的簽章證明／等價可信關聯，並協調 ACK 與平台轉交；目前**沒有** scoped proof／身份驗證，不能只因經過 Proxy 就允許改授權或任意寄信。無可信證據的副作用 fail closed，儲存回饋與授權動作分開。此相容設計不要求新持久 token 管理系統。
4. 沿用 #61/#65/#66 所列最小欄位驗證、false/null 儲存、後端 UTC 證據與 #63 最新授權 gate；不以 client 算分、followUp 或 server credential 代替有效聯繫／行銷權限。PDF／Email／文案差異仍依 #66 清單。

## 正式切換、防繞過與回復

在 #62 隔離副本完成所有入口 credential 驗證／可信授權查詢，再由 #67 驗證真實 ACK、四種 opt-in、feedback、舊任務 gate、PDF/Email。先備妥原腳本／部署及 runtime config 的受限備份，不操作正式服務。

正式切換須由 Alex 核准並協調：先具備可回復的受保護 GAS deployment、平台 server credential 注入及精確 Router ownership／binding／runtime secret，完成隔離驗收；同一切換窗口啟用新 Browser／Proxy 與 GAS 入口驗證，並停用／封鎖所有可繞過的舊公開 GAS deployments、WP 殘留表單及直接 greeting/feedback 入口。不能只隱藏 URL 或只在 Proxy 加憑證而讓舊 GAS 持續無驗證收件；舊頁快取／已開分頁需明確失敗並引導重新開頁，不能以 legacy 相容為由允許任意非必要副作用。

回復時優先暫停提交／顯示未確認、回復已驗證相容的平台與受保護 GAS 版本／config；不得自動重送未知請求，亦不得以復原公開無驗證入口作為快捷回復。實際部署版本、切換窗口與 owner 由 #67／Alex 記錄。本票不執行上述操作。

## 驗證與人工 QA

測試命令與最終結果見 PR 的 Tests executed。新增 `node --import tsx --test tests/consult-proxy/*.test.ts tests/consult-proxy/*.test.mjs`，受控 fetch fixture 驗證真實 ACK 形狀、HTTP 200 error／HTML／不完整 ACK、false／IN_FLIGHT、timeout／網路錯誤、安全 redirect、body 限制、Origin／動作限制、四種 opt-in 完整 payload、false／來源空值及精確 ownership。沿用既有 esbuild／Miniflare fixture 模式，在 workerd 載入實際 Router／Platform／staging wrappers 與真實 Route Handlers，僅替換 OpenNext 產生的 dispatcher，驗證 Service Binding、runtime process.env 與受控 ContentService redirect，不接觸遠端。

既有 Playwright 全程 mock：五步問卷／32 組結果矩陣／375、768、1024、1440px，另驗證 ACK 失敗後填答與相同 payload/ID、改答確認新提交、feedback 未回應／失敗／成功。production-build analytics fixture 攔截所有網路，驗證無效 ACK／504 不送 success／Ads，人工重試有效 ACK 才單次轉換，保留 UTM、consent 與無個資事件。

仍需 #67／人工：實際 Router runtime／Dashboard 掛載與 bindings、隔離 GAS ContentService redirect／ACK、可信授權與舊入口停用；四寬度真實圖片及連續捲動／長錯誤文字 overflow、鍵盤焦點與螢幕閱讀器 alert、Safari／Firefox／觸控、console／hydration、真實 LINE／Email 人工服務、實際 PDF／Email。Mock 不代表正式 Sheet／Queue／Google 完成。`npm run lint` 仍用 Next 16 移除的 `next lint`，不在本票修復；沒有新增 CI gate。

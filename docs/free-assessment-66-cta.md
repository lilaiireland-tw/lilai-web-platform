# Issue #66：前端 CTA 與 #62 文案交接

基準：PR #72 已於 2026-11-24 合併，`origin/develop` = `a11ff2cf3342b67fe45d5a783adcc447412e1bd4`。依最新 #61/#65/#66 及 `free-assessment-61-contract.md`；本票不修改或執行 GAS、Google 資源、提交 ACK、路由或部署。

## 前端行為及授權邊界

- `getAssessmentContent` 接收獨立的本次表單偏好，只有 boolean `true` 才呈現相應條件文案；預設、缺值及非 boolean 不視為同意。Stage、Lead、預算、維度、雙航線的計算函式與條件保持不變，來源調查不進結果文案。
- 四種 Stage 保留描述與階段建議，25+8 保留預算／時間整理特例；所有結果共用免費資源、手動重播及觀看後免費諮詢 CTA。保留既有 Stage CTA key 作為呈現識別，移除付費評估包／付費諮詢入口。
- 本次 contact=true 才顯示「若授權仍有效且未撤回，我們會在 1–2 個工作天內聯繫你」；週一至週五，不做假日計算。marketing=true 才顯示「若授權仍有效且未退訂，你會透過 Email 收到未來出發資訊與說明會邀請」。兩種選擇互不授權。
- 前端只保留本次提交時的選擇快照，**沒有查證後端最新撤回／退訂狀態**，因此明示條件，不宣稱已驗證有效授權。#64/#62/#63 必須做可信識別與最新授權 gate；本次條件文案不是發送授權，也不能直接作為內部聯繫指令。上線仍受 #67 與 Alex 核准限制。
- 不同意者可自行索取或預約；自行要求回覆所需的服務聯繫與非必要主動聯繫分開。選說明會主題、提供 IG/LINE、回饋結果皆不推定 opt-in。
- accuracy feedback 三個答案不新增授權；移除「不太準」的 client `urgentFollowUp`，感謝文案不承諾今日聯繫。其餘既有提交方式不變；不能據此宣稱 GAS 已停止由答案觸發聯繫。
- 成功區說明 PDF 由 Email 提供且不受 opt-in 限制，不聲稱正在寄送或已附檔；既有 no-cors resolve 不能證明後端收件／寄送，可靠 ACK 留 #64。

## Stage × opt-in 驗收矩陣

每格均涵蓋一般短期方案與 25+8，合計 32 組。R = 完整免費結果＋既有資源＋回信／LINE 手動索取重播＋觀看後免費諮詢；C = 有效且未撤回才履行 1–2 工作天聯繫；M = 有效且未退訂才發未來 Email／說明會邀請。無 C 時自行索取，不主動追蹤；無 M 時沒有未來通知承諾。

| Stage | contact=false / marketing=false | true / false | false / true | true / true |
| --- | --- | --- | --- | --- |
| 觀望 watch | R | R + C | R + M | R + C + M |
| 探索 explore | R | R + C | R + M | R + C + M |
| 準備 ready | R | R + C | R + M | R + C + M |
| 行動 action | R | R + C | R + M | R + C + M |

## 修改前後

| 位置 | 原文／原行為 | 本票 |
| --- | --- | --- |
| benefits／earlyBird／FAQ | 填完獲優先邀請資格、第一時間通知 | 免費資源及手動重播；希望未來通知可自願訂閱 |
| watch／explore CTA | 付費自主評估包及無條件說明會通知 | 免費重播，LINE／Email 自行索取；通知依 marketing 選擇並附有效條件 |
| ready／action CTA、nextSteps | NT$400 評估包、NT$800 諮詢、折抵與優惠 | 手動索取重播、觀看後免費諮詢，移除付費連結及價格 |
| 25+8 CTA／nextSteps | 無條件 1–2 工作天聯繫、確認需求後才開影片 | 免費資源人人可取；有效 contact 才依承諾協助，未同意自行索取 |
| 25+8 time anchor | 等團隊聯繫確認時程 | 可自行預約諮詢確認時程 |
| Stage followUp payload | nurturing、活動提醒、重點追蹤、24–48 小時主動聯繫 | 獨立 contact／marketing 條件文案；不影響計分 |
| 結果 Email 提示 | 完整報告與 PDF 正在寄到你的 Email | 說明 Email 交付方式、與兩項授權無關，未收到可詢問 |
| accuracy 不太準 | 今天會主動聯繫、urgentFollowUp=true | 改善評估、可自行預約；不送 urgentFollowUp，不新增 opt-in |

## 已有入口與核對限制

- LINE 沿用本機 GAS `buildUserEmailHtml` 的既有重播實際 href：`https://line.me/R/ti/p/@138pukoz`；顯示帳號為 `@lilaiireland`。活動內容另有 `@lilaiireland` URL 別名，本票選擇與現有報告信一致的 href，不猜新的影片或預約連結。
- Email 沿用前端與 GAS 已有 `lilaiireland@gmail.com`。使用者可直接回覆報告 Email；前端 mailto 僅開啟使用者信箱，不自動寄信。
- 免費諮詢使用同一 LINE 人工預約入口，提示觀看後預約；不把 `/language-school-signup` 付費流程改名為免費服務，也不建立新預約或影片系統。
- LINE 兩個 URL 的外部唯讀工具均無法取得頁面；本票核實的是現有程式來源與 href，不宣稱已在 LINE App 驗證帳號。人工 QA 須確認帳號及操作流程。

## #62 必須處理的 GAS／PDF／Email 文案及條件

證據：唯讀本機未納版 `GAS.gs.txt`，SHA-256 `b206bc35d5fb450128c0a89efd5aed20027a24c60759a066ff1d9ef2eba25d61`。只作本機快照定位，非 live deployment 證據；未複製完整腳本、正式資源 ID 或客戶資料到 repo。行號以此快照為準，#62 須核對完整專案／實際部署差異。

| 函式／位置 | 快照所見 | #62 修改／核對要求 |
| --- | --- | --- |
| `STAGE_INFO` 2696+、`FRONTEND_STAGE_INFO` 3488+ | 培育名單、寄重播連結／優先邀請、24–48 小時跟進 | 移除無條件對外承諾；本次 contact 與 Email marketing 分別查最新有效狀態，不能由 Stage／Hot 推定；保留分類與計分 |
| `getAssessmentContent` 3496+、`prepareAssessmentData` 3516+（followUp 3534） | 25+8 無條件聯繫，`stageCTAText` 主動聯繫 | 統一 R/C/M；未同意仍有完整報告，不能把 client followUp 當授權或可信內部指令 |
| `getTimeAnchor` 1525+ | 25+8 團隊聯繫時確認方向 | 改自行預約中性文案，或依有效 contact 呈現；時間／推薦條件保持 |
| `getPdfNextSteps` 3686+ | 25+8「等待我們聯繫」、確認後取得影片 | 全員可回信／LINE 免費索取，團隊手動開放；觀看後免費諮詢。有效 contact 者才安排 1–2 工作天協助，不以聯繫作為資源門檻 |
| `getRoutePlaceholders` 2284+、`createPdfReport` 1550+ | 評估與下一步帶入 PDF；2462 註記 Page 10 CTA 固定在模板 | 檢查 placeholder 及最終輸出每個 Stage／25+8；**實際 Slides 模板未取得，Page 10 固定文字及其他頁待 #62 核對**，不能只改 JS 宣稱模板完成 |
| `getStageCTAText` 1234+ | 全 Stage 回信／LINE 手動開放，觀看後提供免費諮詢預約 | 保留手動流程與免費服務；同步前端 wording，不自動寄影片、不混入未來訂閱、不恢復已下架付費 CTA |
| `buildUserEmailHtml` 2901+ | 2918+ 手動重播 CTA；PDF 區無條件稱已附檔 | HTML 與純文字同步 R/C/M；完整服務信不 gate。依實際 attachments 狀態說明已附檔或可從有效報告連結下載 |
| `sendEmailToUser` 3002+ | 附件失敗仍寄、純文字固定「PDF 已隨信附上」、空 pdfUrl fallback RESOURCE_LINK | 有有效 PDF 連結而附件失敗時如實說明；無有效 PDF 沿既有 Queue 錯誤／重試，不用資源頁冒充報告。保留附件＋該筆下載連結，所有 opt-in 均交付，不改 Queue／生成架構 |
| `sendTeam25plus8Alert` 1893+ | 1–2 工作天必聯繫、1 小時後寄問候信 | 未同意不給主動跟進指令；有 contact 且有效才安排。將舊「1 小時後」說明改為下一次台灣 18:11；不修改 `getNext1811TaipeiMs` 1945+ 或既有排程時間 |
| `send25plus8Greeting` 2103+ | 純文字 2135、HTML 2203 無條件主動聯繫、之後開影片 | 寄送當下 contact gate，撤回／unknown 不寄本次非必要問候；若含未來推廣另需 marketing＋#63 退訂連結。保留手動免費索取，不將問候寄送當真人首次聯繫 |
| `sendEmailToTeam` 3050+、`getContactSuggestion` 3547+ | 建議跟進日期／已加 Calendar、LINE／IG／Email 聯繫管道、lifeChange 作開場白 | 必要內部收件通知可保留，未授權標「僅評估／不主動聯繫」，去除日期／管道指令與主動開場提示；不能因有 LINE/IG、分數高而聯繫 |
| `getFollowUpDays`、Calendar／25+8 排程與執行、retry／fallback／人工匯出 | 既有優先次序不等於授權 | 有效 contact 首次任務依 1–2 工作天（週一至週五、既有台灣時區）；0/5/14 日只作合法後續排序。#63 於每個既有入口查最新授權；只做必要 gate 與文字修改，不重構排程／checkpoint／cache |
| `handleAccuracyFeedback`、`doPost` feedback 分支 | feedback 可帶出聯繫／今日提醒風險 | 可信原提交 lookup＋最新 contact gate，不信任 urgentFollowUp／Email／client consent；只回饋不產新授權。可信識別／可靠 ACK 在 #64/#62，實際 gate 在 #62/#63 驗證 |

所有 PDF 保留單檔 `ANYONE_WITH_LINK / VIEW`，不更動資料夾、Slides 模板分享、Queue／Retry／Fallback／Checkpoint／Cache。連結必須屬於該次收件者的正確報告；PDF 不含非必要 Email／電話／IG／LINE／證件或敏感自由填答原文。`lifeChange` 空白正常，不杜撰；來源調查不進報告／分析／PDF。行銷信須有 #63 可用退訂；服務資源索取不等於訂閱。

## 驗證與尚待 QA

既有 `scripts/check-consult.ts` 增加 32 組內容／評分隔離與缺值檢查；既有 Playwright `consult.spec.ts` 增加 32 組真實五步填表、結果／followUp payload、手動資源入口、免費諮詢、回饋非授權、鍵盤 focus-visible、overflow、console／page errors。測試以既有 local fixture 攔截所有外部服務，GAS 主提交及 feedback 都是 mock。

2026-11-24 本機結果：

- `npm.cmd ci`：通過，632 packages，未改依賴或 lockfile。
- `npx.cmd tsc --noEmit --incremental false`：通過（build 後再次執行亦通過）。
- `npm.cmd run check:consult`：通過，含新增 32 組與原分類／航線／預算／Ads／提交 guard。
- `npx.cmd tsx scripts/check-consult-analytics.ts`：通過。
- `npx.cmd tsx scripts/check-shared-layout.ts`、`npx.cmd tsx scripts/check-design-system.ts`：通過。
- `npx.cmd playwright test --config playwright.precutover.config.ts --project=chromium tests/precutover/consult.spec.ts`：47 passed（7.4m），其中 32 項結果矩陣；失敗提交測試的兩次 Failed to fetch 是預期 mock abort。
- `npm.cmd run build`：套用既有 `cloudflare/production-platform.jsonc` vars 做本機建置，通過，16/16 static pages；未封裝或部署 Cloudflare。
- `npx.cmd playwright test --config playwright.consult-analytics.config.ts`：3 passed（11.1s）；UTM、原 GA4 目的地／漏斗、同意及撤回、一次原 Ads conversion／無個資回歸通過，所有外部網路攔截。
- `git diff --check`：通過。另逐段比對 `origin/develop`，分類、Lead、卡點診斷、維度及航線計算原始碼相同。
- 已檢視四寬度的本機結果截圖；截圖使用外部圖片 fixture，長元素截圖會帶入既有 sticky shell，不能替代真實圖片／連續捲動人工 QA。

32 組結果測試輪替 375/768/1024/1440px，各寬度涵蓋所有 Stage／opt-in 選項與兩種方案；不是每組在四寬度全部交叉重跑。原 #65 問卷測試仍保留。

待人工／#67：四寬度的真實圖片、長內容視覺及觸控操作，Safari／Firefox 與螢幕閱讀器；LINE App 帳號、Email reply／mailto 及人工開通後免費預約流程。隔離環境實際 PDF、Slides 固定 CTA、Email HTML／純文字、附件失敗、撤回／退訂與既有舊任務 gate 均未驗證。不能以 mock 宣稱 GAS／Google 或可靠 ACK 已完成。

`npm run lint` 仍為 Next.js 16 已移除的 `next lint`，不在本票修復。未正式部署、未合併、未開始 #64。

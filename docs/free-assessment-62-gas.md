# Issue #62：GAS 最小相容修改交接

本 PR 僅供審核，未修改正式 GAS／Google 資源、未部署、未開始 #63。基準為最新 `origin/develop` `204e0b9a08500cce7ae474a5c332c9308afd49fa`，PR #74 已於 2026-11-24 合併。已讀 #61–#67 最新本文及留言；最新營運決策優先於 #61 舊 receipt／exactly-once 設計。

## 本地交付與完整性

完整腳本含正式設定，只保留於已被既有 `backups/` 規則忽略的本地 `backups/issue62-gas/`，不得以附件或 commit 上傳 GitHub。根目錄原始 `GAS.gs.txt` 未覆寫或刪除；使用者原有 `.gitignore` 修改未納入 PR。

| 本地檔案 | 用途 |
| --- | --- |
| `GAS.original.gs.txt` | 原始逐 byte 備份，167,721 bytes、3,830 行 |
| `GAS.modified.gs.txt` | 完整修改副本，含原正式設定；僅本機審核 |
| `GAS.private.diff` | 原始與新版差異，含可能敏感上下文；僅本機 |
| `GAS.sanitized.diff` | 相同邏輯差異，移除私人設定值；仍只留本機 |
| `GAS.before-round3.gs.txt`、`GAS.round3.{private,sanitized}.diff` | 第二輪審核時副本與本輪修正差異，不覆寫原始備份 |
| `function-impact-before.md` | 修改前建立的函式影響清單 |
| `modify.py`、`round3.py`、`options.json`、`structure.mjs`、`finalize.py` | 本地可重現修改、檢查及交付清單，非新部署工具 |
| `inventory.json`、`validation.txt` | 最終 hash／實際函式清單與測試紀錄 |

原始 SHA-256：`b206bc35d5fb450128c0a89efd5aed20027a24c60759a066ff1d9ef2eba25d61`，與 #64/#66 唯讀盤點一致。檔內規則版本 `index2-sync-2026-09-14-r2-two-routes`，含 V57 測試。新版 hash 見本地 `inventory.json`，避免更新副本後文件殘留舊值。

這是單檔快照完整性，不是完整 Apps Script 專案或正式部署證明。workspace 未找到其他 `.gs` 或 `appsscript.json`。缺 manifest（V8／scopes／timezone／libraries／advanced services）、正式專案所有檔案及版本對照、部署版本／owner、既有 triggers／properties、實際 Sheet headers／公式、Calendar owner／ACL、Slides 模板。未臆造缺失原始實作；安裝前必須由 Alex 補核。

## 修改函式與理由

原函式只改下列 16 個；完整逐行差異留本地。PR 的 `scripts/gas/assessment-compat.js` 是無秘密的新增支援函式，已附入完整本地副本；不是可單獨取代正式 GAS 的檔案。

| 函式 | 原行為 → 必要修改 |
| --- | --- |
| `doPost` | 無 server credential → 所有分支前驗證 `_serverCredential`；feedback 驗證用途簽章、讀原 Queue；direct greeting 查原資料；僅 trusted server 可撤回；主 ACK 增 submissionId，IN_FLIGHT 不回 accepted=true |
| `prepareAssessmentData` | 展開任意 client 內容 → 只選問卷欄位；驗證版本、長度、boolean、來源與 v1 選項；後端 UTC；原分類／評分重算 |
| `saveToSheet` | 原 name-based missing-header append → 同樣方式增 evidence/state 欄位；false 保留、來源 JSON、文字防公式；無有效本次授權不產跟進日期 |
| `handleAccuracyFeedback` | client urgent／Email 決定今日 Calendar，吞 Calendar 錯誤 → 可信原提交、答案及最新 contact gate；錯誤向外傳遞，不回假成功；不新增授權 |
| `sendTeam25plus8Alert` | 無條件優先聯繫 → 執行前最新 contact gate；說明改下一次台灣 18:11 |
| `schedule25plus8Greeting` | 無 gate → 排程前 gate，property 攜帶 submissionId；原排程／fallback 保留 |
| `send25plus8Greeting` | 無 gate／聯繫後才開影片 → 寄送前 gate、手動免費索取與觀看後免費諮詢；移除額外宣傳句 |
| `createCalendarEvent` | 一般／Hot 無條件跟進 → 每次建事件前 gate；首次日期為下一個台灣工作天 |
| `create25plus8CalendarEvent` | 當日無條件跟進 → gate、下一個台灣工作天 |
| `sendEmailToTeam` | 必要通知混入日期／聯繫指令 → 必要通知保留；未授權標僅評估，移除日期、主動開場、提問指令；不假稱已建立 Calendar |
| `getContactSuggestion` | 有 LINE／IG 即推薦 → 無有效 contact 不提供指令；純文案可重用當次已取得的可信判斷 |
| `getAssessmentContent` | Stage／25+8 無條件聯繫 → 預設中性手動索取；caller 可傳當次可信判斷；保留 `twentyfive_plus8` discriminator |
| `getTimeAnchor` | 等團隊聯繫 → 自行索取／預約；時間分類不改 |
| `getPdfNextSteps` | 等聯繫才給影片／優惠 → 中性手動索取、觀看後免費諮詢與確認申請，不為此純文案讀表 |
| `buildUserEmailHtml` | 固定已附 PDF、空值以資源頁替代 → 據附件狀態顯示說明；文字及連結 attribute escape，保留模板 HTML |
| `sendEmailToUser` | 空／不存在報告仍寄服務信 → 取得並核實該次 PDF 後才允許寄信；僅附件轉換失敗可 link-only；其餘錯誤走原 Queue |

另同步 `STAGE_INFO`／`FRONTEND_STAGE_INFO` 文案，移除舊自動重播／培育／優惠指令；`BOOKING_LINK` 使用腳本既有 LINE 手動入口，避免 PDF placeholder 連至付費報名。無變更資源 ID、評估權重及分類。

新增 helper 為 `assessmentCell/Input/Records/Consent/NewContact/Original/Credential/FeedbackProof/FollowUpDate/FollowUpText` 與 `withdrawAssessmentConsent`；分別負責純文字儲存、輸入篩選、Sheet 查詢、當前權限、可信 Queue 關聯、credential／簽章、工作天及條件文案。`ASSESSMENT_OPTIONS` 從現有 `consult-content.ts::options` 產生，本地測試逐值比對，未另創產品選項。

## Sheet 欄位及狀態

已核對的是原 `saveToSheet` 原始碼 mapping，未讀取或修改正式 Sheet。所有舊欄名／順序保留，既有 `時間` 繼續寫後端台灣時間；`used_discount`、`discount_outcome`、`final_outcome` 保留原樣。未新增／更動 Queue 八欄。

下表為追加欄名；第一次隔離提交經既有 missing-header 邏輯 append。正式實際 headers／公式須在 #67 人工比對，不能由此推定已完成 migration。

| 新 header | 值／規則 |
| --- | --- |
| `contractVersion` | v1 或 `legacy` |
| `submissionId` | v1 UUID v4；legacy 缺值由 GAS 產生；僅關聯 |
| `receivedAt` | 首次處理該次 payload 的 GAS UTC ISO；Queue 重試不重算 |
| `contactConsent`、`marketingConsent` | 原 boolean；legacy 缺值 null → Sheet 空白，不推定同意 |
| `privacyNoticeVersion` | v1 `agreement-reference.v1`；這不是核實完成的 WP revision |
| `consentTextVersion` | `free-assessment-consent.v1`，對應 `consult-content.ts` 告知及兩項 checkbox |
| `consentSource` | v1 `free_assessment`；legacy 空白 |
| `consentTimestamp` | v1 由 GAS 產 UTC ISO；client 同名欄位不作證據；legacy 空白 |
| `discoveryChannels` | JSON array；v1 未答 `[]`、明確不確定 `["unknown"]`、legacy 未蒐集空白；依現有選項順序儲存 |
| `discoveryOther` | 選填 ≤200 UTF-16 字元；須有 other；防公式注入 |
| `dcardExposure` | 既有四個 code 或空白；`no_recall` 與未答不同 |
| `contactConsentState`、`marketingConsentState` | `granted/declined/unknown/withdrawn`，與原證據分開 |
| `contactWithdrawnAt`、`marketingUnsubscribedAt` | trusted 撤回入口產 UTC；保留第一次時間，不覆寫原 consent／版本／時間 |

jobId 與 submissionId 透過既有 Queue 第 1 欄 jobId、第 5 欄 Data JSON 建立可信關聯，不新增 registry／receipt DB。查不到／重複 submissionId／讀取失敗皆不執行非必要副作用。無法回溯的舊任務沒有 ID 就略過，不以 Email 推造關聯。舊 prefix properties 仍由原 runner 處理，到期略過後按原流程清除，不增加 retry。

當前權限以 Sheet 證據和 state／撤回時間查詢；同一正規化 Email 任一歷史 withdrawal 抑制後續匿名重填的授權。原證據不改。`withdrawAssessmentConsent(submissionId, 'contact'|'marketing')` 僅撤回，不提供匿名重新訂閱／授權能力。GAS `type=withdraw_assessment_consent` 僅受 server credential 保護的內部入口，平台公用兩條 API 不轉送此 action；#63 才串接不可猜測／簽章退訂流程。

未成交保存仍從既有首次填表日起算 12 個曆月；不以 feedback／Queue retry／寄信／撤回重置。沒有批次刪除或延長保存。新 `receivedAt` 供明確 UTC 起點；舊資料仍沿用可信既有 `時間`，無日期者人工核對，不補造。

## 授權與副作用矩陣

以下 C/M 是有原證據、政策 registry 核准、目前 state 有效且無撤回／退訂的權限，不只是本次 client 勾選。

| contact / marketing | 完整結果、PDF、必要 Email／內部收件通知 | Calendar（一般／Hot／25+8）、25+8 alert／greeting、feedback 跟進 | Email 行銷資格 |
| --- | --- | --- | --- |
| false / false | 全部提供 | 略過 | 排除 |
| true / false | 全部提供 | C 有效才執行 | 排除 |
| false / true | 全部提供 | 略過 | M 有效才具資格 |
| true / true | 全部提供 | C 有效才執行 | M 有效才具資格 |
| legacy unknown／撤回／無證據 | 全部提供 | 略過、不觸發錯誤重試 | 排除 |

`assessmentConsent(data, 'marketing')` 提供最小名單查詢 gate；本票沒有 EDM／匯出實作，資格不代表可以立即寄送。#63 退訂能力與名單驗證完成前不得寄行銷。所有 contact entry 在實際 MailApp／Calendar 前重查；Retry／Fallback／舊 Properties 仍呼叫同一 gated 函式。授權讀取失敗安全略過，原 checkpoint 照原流程完成該步，不引發無限 retry。已建立 Calendar 的人工處置留 #63，不自動刪正式事件。

首次跟進一律排下一個台灣工作天（落於 1–2 工作天承諾）；週五→週一，無假日系統。Hot 不再要求當天，標題改「首次聯繫」，回饋改「回饋聯繫」；原 `getFollowUpDays` 保留供既有後續排序。`getNext1811TaipeiMs` 及問候信 retry 時間／次數逐函式比對未改。

## 平台與 GAS 入口

- `CONSULT_GAS_ENDPOINT` 維持 server-only runtime secret；新增同名共用 secret `CONSULT_GAS_CREDENTIAL`（至少 32 個隨機字元），平台 runtime 與 GAS Script Properties 必須相同。不要使用 NEXT_PUBLIC、public vars、URL、repo、client payload 或 logs。測試與正式各用獨立值。
- 專用 body 欄位 `_serverCredential` 只由 proxy 注入。client 傳此欄位／未知 key 被既有 allowlist 拒絕；缺 secret 回 503、不送上游；GAS 缺值／錯誤在所有分支前拒絕。Google ContentService redirect 仍只 GET，不轉送 body／secret。
- 舊 payload 衍生欄位保持可送，以相容已合併前端；proxy 丟棄 `teamEmail/resourceLink/stage/routeResult/blockerDiagnosis/stageName/stageDescription/nextSteps/followUp/leadQuality/discountPrice/originalPrice/submittedAt`，GAS 只選問卷欄位、以原設定與原評分重算。`wantWork` v1 由 workIntention 決定。
- 主 ACK 維持 `{status:'ok',accepted:true,jobId,submissionId}`。只有真實 Sheet、Queue 成功才 ACK；IN_FLIGHT 無 jobId 不成功；未新增自動重送。
- 首次正常 ACK 才設定每筆 `consult_feedback_<submissionId>` 的 HttpOnly／Secure／SameSite=Strict／Path=/api/consult cookie，瀏覽器保留 30 天。內容是 `HMAC-SHA256(secret, 'feedback.v1|submissionId|jobId')`，base64url 無 padding；不含 Email／個資。feedback 必須有該 cookie，proxy 與 GAS 各自驗證 `_feedbackProof`，再讀原 Queue；不相信 client 收件者／urgent／consent。
- **deduplicated ACK 不簽發新 cookie**：知道 submissionId 再撞 Cache 不得換取操作能力。若首次 ACK／cookie 遺失，人工重試仍能取得收件 ACK 與完整報告，但缺 cookie 的 feedback 回 403；不可透過 IDs 補發 capability。cookie 遺失／過期／secret 輪替須重新評估，不以 IDs／Email恢復。此用途憑證可重放 feedback，不是 once-only token，未新增 receipt DB；沒有變更撤回權限。
- GAS handler 發生持久化或 Calendar 錯誤即往外拋；ContentService 可能呈非 JSON，proxy 視為失敗，不宣稱回饋已儲存。若已寫回饋後 Calendar 失敗，既有部分成功仍可能造成重複回饋列，未擴大修復。

## 安裝／切換與回復（文件，未執行）

1. Alex 先私下比對完整 GAS 專案／manifest／部署與這份 hash；若任何函式或其他檔不同，停止套用，先審核本地 diff。備份原始全專案、部署版本、properties／trigger owner、Sheet schema／公式；不要執行檔內原 E2E 測試，它們會使用正式資源。
2. 建獨立測試 Apps Script 與 Sheet／Queue／Drive folder／Slides template／Calendar／收件人，使用原專案實際 manifest 與 advanced services 設定，不猜造。將本地完整修改副本套至隔離專案；替換所有正式資源設定與預設 Calendar 身分，確認不會寄正式團隊／客戶信。完整副本已含 helper／options，勿重複加入同名函式。
3. 隔離 Script Properties 設 `CONSULT_GAS_CREDENTIAL`；平台 staging runtime secret 設相同 credential 與隔離 `CONSULT_GAS_ENDPOINT`。保持正式平台／GAS 不動。以隔離提交 append headers，核對所有既有欄位順序、人工欄與公式、Queue 八欄；不要先手動移欄。
4. 公開政策核實前 **不設定** `CONSULT_APPROVED_POLICY_VERSION`，contact／marketing gate 關閉、必要報告照常。Alex 核對 `/agreement/` 實際文字、生效日／revision、12 個月、Google／Calendar／PDF 分享等事實並留私下完整快照與 hash；對照本 PR 基準 `consult-content.ts` 的告知及 consent 文案快照。核准該對應後才在隔離 Script Properties 設 `CONSULT_APPROVED_POLICY_VERSION=agreement-reference.v1`。未核實不可將此 property 當核准證據。
5. Alex 人工調整**隔離模板** Page 10 固定 CTA：「可回信或 LINE 免費索取《歐洲漫遊錄》重播，由團隊手動開放，觀看後可預約免費一對一諮詢」。所有 Stage 專頁、25+8 專頁、下一步與 bookingLink placeholder 核對同文；刪除固定「等待聯繫才開影片」、付費 CTA、無條件行銷／聯繫承諾。其他實際頁碼未知，需取得模板後盤點，不聲稱已修改。保留單檔 ANYONE_WITH_LINK／VIEW，不公開模板／資料夾。
6. #63 完成退訂／名單驗證，#67 執行下列真實隔離矩陣及瀏覽器驗收；由 Alex 核准後另行安排正式切換。正式 platform runtime 設兩個 server-only secrets，GAS 設對應 properties；同窗口切換受保護 GAS／proxy／前端。封鎖或停用所有無驗證舊 deployment、WP 直送、direct greeting／feedback；不能只保護新 URL。此 PR 不含任何部署指令或正式寫入。
7. 回復時先暫停新提交／回饋及非必要跟進排程，保留 Sheet 新 evidence/state 欄位、原始日期與撤回紀錄；不要回復整張表而抹去新紀錄。回到**仍有 credential／授權 gate 的已審核版本**及相容 proxy secret／endpoint。最初無保護原始備份僅供差異／服務功能還原，不可直接重新公開啟用；必要時持續暫停直到修補，不恢復未授權聯繫。既有 Queue 不盲重送、不重置 checkpoint／cache；由 Alex 核對已完成服務及待處理任務。

## 測試結果與限制

2026-11-24 本機執行（皆未正式寫入）：

- `npm.cmd ci`：通過，632 packages；lockfile／依賴未改。
- 明確指定原始、新版及修正前路徑後，`node --import tsx --test tests/consult-proxy/*.test.ts tests/consult-proxy/*.test.mjs`：**27 passed、0 failed、0 skipped**（原 16 項＋新增 11 項）。路徑缺漏／檔案不存在直接失敗，不允許 skip。
- `npx.cmd tsc --noEmit --incremental false`、`npx.cmd tsx scripts/check-shared-layout.ts`、`npx.cmd tsx scripts/check-design-system.ts`、`npm.cmd run check:consult`、`npx.cmd tsx scripts/check-consult-analytics.ts`：通過。
- `npm.cmd run build`：套用既有 production-platform vars 的本機 build 通過，18/18 pages；沒有封裝／部署 Worker。`git diff --check`：通過。

原 16 項涵蓋四種 opt-in、legacy、輸入驗證、Stage／25+8 計分、必要服務、撤回、舊 property、ACK、credential／proof 與既有 routing fixture。新增 11 項直接覆蓋真實 GAS legacy／v1 completed-cache／IN_FLIGHT、GAS ACK 經真實 Proxy 不重簽 cookie、feedback append 失敗、13 種 PDF／附件狀態、HTML escaping、四種 opt-in 與撤回後完整 Queue／Hot／25+8／feedback／延後問候、政策未核准必要服務、操作期間撤回、25+8 discriminator 與下游流程、修正前後呼叫計數。原／新版函式先斷言存在再比較；28 個保護函式、重要常數與 TTL 另由本地 structure 檢查。完整新版包含逐字一致的 helper；**不是 Google 執行證據**。

待 #67：完整 manifest／部署一致性、真實 Sheet append／公式與撤回寫入、Queue 工作成功／重試、實際 Slides 全頁／PDF 正確收件者與內容、ANYONE_WITH_LINK／VIEW、附件成功及失敗真實有效連結、四種 opt-in 等量報告、真實 Google ACK／redirect、Calendar 日期、18:11／fallback／10 分鐘 retry／既有舊任務撤回後抑制。依同意組合跨 Hot／Warm／Nurture 驗證，不將 stub 當正式結果。

瀏覽器尚待 #67：375/768/1024/1440px 提交與回饋／cookie（含正常重試、遺失與 dedup ACK）、overflow、focus-visible、Safari／Firefox／LINE 內建瀏覽器、console／hydration；本 PR 無 UI 視覺變更。原 `npm run lint` 仍為 Next 16 已移除的 next lint，未執行、未修基建。

公開政策本次工具仍未取到內容（2026-11-24 fetch cache miss）；政策版本／生效日未核實，**阻擋正式發布**。不據此推定政策內容缺漏或完全合規。

## #63／#67 交接及保留限制

#63 使用最小 Sheet state／withdraw helper 接退訂及人工撤回 SOP，建立可信重新訂閱、歷史 unknown 排除、發送／匯出前 marketing gate；驗證 same-email suppression、退訂後重填不解除、原證據不改。沒有 EDM 就不新建群發平台；未有實測可用退訂連結前不得寄行銷。回饋不產生新授權。

#67 完成上述隔離 Google／瀏覽器與正式切換／安全回復審核。實際政策、完整專案／manifest／部署、Sheet schema、Slides 及隔離資源缺件仍需 Alex 提供／核實。本地完整副本可審核，但不能聲稱已代表正式完整專案。

保留原 Cache 60 秒、IN_FLIGHT 20 秒及原 lock 邊界；跨 Cache 重複、Sheet／Queue 部分寫入、寄信後 checkpoint 中斷仍可能重複。相同 submissionId 多列時 contact gate fail closed。首次 doPost 部分失敗後人工重送可能產生另一 receivedAt／列，未修復既有部分寫入。12 個月起算須採原首次可信填表日，不因重試列延長。仍保留必要的全表讀取，量大時可能達 GAS quota；本次不加索引／資料庫。用途簽章不是郵箱身份驗證；Email 名單實際資格與退訂驗證留 #63。

## 第二輪審核後修正（本輪）

本輪繼續同一分支／PR #75，無新 Issue／PR、無 #63 實作。`doPost` 在 prepare 前保留原 caller submissionId；Cache key 不使用後端新 UUID。legacy 仍保存關聯 ID，相同 payload 在 keyed Cache window 內只新增一列學生與一筆 Queue、回相同 jobId；v1 caller ID 與既有 completed-cache／IN_FLIGHT 保持。

`sendEmailToUser` 使用可信 Queue checkpoint 的 URL 取得 Drive 檔案，核對 ID、該次評估既有命名、PDF MIME、非垃圾桶、非空檔、既有 ANYONE_WITH_LINK／VIEW 及下載 URL。任一取得／核實錯誤向外拋，不呼叫 MailApp、不標記 userEmailSent；只有之後 getAs 失敗可用原正確報告連結寄 link-only。沒有呼叫分享修改 API、沒有改 createPdfReport 或用 RESOURCE_LINK 補缺。這些唯讀 metadata 檢查仍不是實際匿名下載證據；[Drive File 官方介面](https://developers.google.com/apps-script/reference/drive/file) 說明下載 URL 仍受讀取權限限制，真正下載／分享驗收留 #67。

共用 `assessmentHtml` escape `& < > " '`；使用於服務信 nickname／name、stage 文字、下一步條目、PDF attribute，以及 greeting 的姓名／IG／LINE／個人化摘要。先 escape 文字，再插入模板 `<li>`／`<br>`；不 escape 完整模板、合法 CTA 結構或純文字信。

`assessmentConsent` 對可信原始 false／null／legacy 在讀 Properties／Sheet 前 fail closed；#62 沒有可信重新授權入口。true 仍必須通過最新 Sheet 原證據、目前 state、政策與同 Email 全歷史撤回查核，不能單憑 boolean 放行。用一個 row loop 合併原 filter／some，不保存跨操作授權結果。延後 payload 保留後端原始 contractVersion／contactConsent，舊缺證據任務仍安全略過。

prepare 尚未保存不查授權；PDF 純文案採中性指引，保留 25+8 `cta='twentyfive_plus8'`／空 stageCTALink／特殊預算與時間步驟，不變更 PDF 函式。服務 Email 查一次授權生成當次文案；必要內部信把已查判斷傳給 getContactSuggestion。alert／greeting／Calendar 移除相鄰入口重查，保留實際副作用前檢查；Hot checkpoint 之後、feedback append 之後、排程失敗 fallback 與到期 greeting 都會重查，測試期間撤回會停止下一個副作用。

保留的查詢有必要性：saveToSheet 必須在原 Lock 內查歷史撤回，才能安全填跟進日期；它重用已開啟的 Sheet，少一次 openById，contact=false 不讀全表，contact=true 仍讀一次。每次非必要 Mail／Calendar／排程前都要讀最新狀態，不能由之前純文案或其他副作用的結果取代。沒有改 Lock 邊界或移出查核；沒有真實 Google 時間，因此**不能聲稱持鎖時間或 15 秒 Proxy ACK deadline 已達標**。讀取與寄送之間的既有非原子競態仍存在。

### 修正前後本地邏輯呼叫數

以下只計本 PR 新 helper 的 openById／getDataRange().getValues／Properties getProperty 或 getProperties，以及 credential 的一次 Properties 讀取；原 Queue／排程既有讀取不重算為新增。使用真正 doPost／prepare／save／enqueue／processAssessmentQueue 與 Email／Calendar／greeting runner，Google 服務全是記憶體 stub。PDF 在第一個 Drive 呼叫前截停，但前段 placeholders／getPdfNextSteps 真的執行；新增報告 metadata 核實另在 Email 測試執行。沒有測量 Google RPC 秒數。

表內每格為「修正前 → 修正後」，一般 true／25+8 true 採非 Hot；Hot 另列。全表掃描指 row-object map 與授權 filter／some／for-of 的走訪次數；本量測無撤回且匹配列在尾端，因此走完全部列，非每個 cell 的 map。

| 情境 | openById | getDataRange().getValues | Script Properties 讀取 | 全表掃描 |
| --- | --- | --- | --- | --- |
| 一般 contact=false | 7 → 0 | 7 → 0 | 8 → 1 | 14 → 0 |
| 一般 contact=true | 9 → 3 | 9 → 4 | 10 → 5 | 25 → 8 |
| 一般 Hot contact=true | 10 → 4 | 10 → 5 | 11 → 6 | 28 → 10 |
| 25+8 contact=false | 11 → 0 | 11 → 0 | 12 → 1 | 22 → 0 |
| 25+8 contact=true | 15 → 6 | 15 → 7 | 16 → 8 | 43 → 14 |
| 25+8 Hot contact=true | 16 → 7 | 16 → 8 | 17 → 9 | 46 → 16 |
| 延後 Greeting，另加 | 2 → 1 | 2 → 1 | 2 → 1 | 6 → 2 |

提交／ACK 路徑：contact=false 的新增 open/read/property/scan 為 `1/1/2/2 → 0/0/1/0`；contact=true 為 `2/2/3/4 → 0/1/2/2`。剩餘一次 contact=true 全表讀取在 save 原 Lock 內，無法安全移除。marketing 不影響本條 contact 服務計數；無 EDM 發送。

### 差異、完整性與重現

原始檔 3,830 行、167,721 bytes（CRLF、EOF 無 newline）；修正前 4,015 行；最終 4,024 行、179,859 bytes（LF、有 EOF newline）。原備份逐 byte 不變。

| 版本 | SHA-256 |
| --- | --- |
| 原始 | `b206bc35d5fb450128c0a89efd5aed20027a24c60759a066ff1d9ef2eba25d61` |
| 本輪修正前 | `81a4cf67709707e377174df291dca6a78859848205b9e71a4a1254d48ca7922e` |
| 最終新版 | `04aeef14fab2af70d521233a3c60b4c4b02d5243cc6cf47e39f8dddfb502a343` |

合法 unified diff 明確加入 `\ No newline at end of file`，不再串接尾行。`git apply --numstat` 唯讀解析四份 private／sanitized diff 全部成功：原始→最終 **+304/−110**，本輪修正前→最終 **+66/−57**，淨增 9 行。inventory 另記無 autojunk 的 SequenceMatcher 邏輯比較 +301/−107，因 hunk 配對不同，不與實際 unified patch +304/−110 混用。所有差異檔仍留 ignored 本地目錄，不提交完整正式 GAS 或私人設定。

本輪修改 18 個既有函式、新增 assessmentHtml，沒有刪除函式。下表是各函式獨立比較，不含全域 blank lines；原始→最終的 16 個原函式統計另見 inventory。

| 本輪函式 | + / − |
| --- | --- |
| doPost | 2 / 1 |
| handleAccuracyFeedback | 2 / 2 |
| sendTeam25plus8Alert | 0 / 1 |
| schedule25plus8Greeting | 2 / 0 |
| send25plus8Greeting | 4 / 5 |
| create25plus8CalendarEvent | 2 / 5 |
| saveToSheet | 1 / 1 |
| buildUserEmailHtml | 5 / 5 |
| sendEmailToUser | 11 / 9 |
| sendEmailToTeam | 1 / 1 |
| createCalendarEvent | 5 / 5 |
| getAssessmentContent | 5 / 3 |
| prepareAssessmentData | 1 / 1 |
| getContactSuggestion | 2 / 2 |
| getPdfNextSteps | 1 / 1 |
| assessmentRecords | 2 / 2 |
| assessmentConsent | 14 / 11 |
| assessmentNewContact | 2 / 2 |
| assessmentHtml（新增） | 3 / 0 |

PowerShell 重現（全部本地，不連 Google）：

```powershell
python backups/issue62-gas/modify.py
$env:GAS_ORIGINAL_PATH = (Resolve-Path backups/issue62-gas/GAS.original.gs.txt).Path
$env:GAS_MODIFIED_PATH = (Resolve-Path backups/issue62-gas/GAS.modified.gs.txt).Path
$env:GAS_BEFORE_PATH = (Resolve-Path backups/issue62-gas/GAS.before-round3.gs.txt).Path
$env:GAS_METRICS_PATH = Join-Path (Resolve-Path backups/issue62-gas).Path 'performance.json'
node --import tsx --test tests/consult-proxy/*.test.ts tests/consult-proxy/*.test.mjs
node backups/issue62-gas/structure.mjs
python backups/issue62-gas/finalize.py
git apply --numstat backups/issue62-gas/GAS.private.diff
git apply --numstat backups/issue62-gas/GAS.sanitized.diff
```

本輪判斷：本地回歸、安全與重複查詢問題已修，建議合併作為待驗收修改；**不代表可正式發布**。真實 Google／完整效能、Calendar 時區、政策核准、Slides／manifest／部署一致性仍阻擋正式發布，留 #67／Alex 驗收。沒有自行合併、部署或開始 #63。既有 invalid next lint 未執行／未修；瀏覽器及上述正式服務未驗證。

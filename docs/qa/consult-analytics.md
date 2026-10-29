# Consult GA4 與流量來源驗收

## 初始化與正式建置

沿用 GoogleAdsHead 的單一 gtag.js?id=AW-17610996814、原本 Consent Mode v2 default/update、js 與 Ads config。
2026-10-29 唯讀檢查正式頁面及該 Google 公開 tag 回應：Ads tag 設定包含 vtp_instanceDestinationId: G-06M3GS0WS0，以及該 destination 的自動 page-view/form measurement。這支持沿用既有已連結的 GA4 destination，不是 GA4 後台收件驗證。

不增加 GA4 config、第二支 loader、手動 page_view/session_start/form_start。既有自動流量事件與 Ads conversion 機制保留。

cloudflare/production-platform.jsonc 的 vars 已設定 NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-06M3GS0WS0。
既有 npm run cf:build:production-platform 將 vars 合併至 commandEnv，再傳給 OpenNext/Next build 子程序；新增 assertion 防止正式建置使用空白或錯誤 destination。
既有 Production workflow 使用此命令，不需在 Cloudflare Dashboard 另行手動設定。若另建自訂 pipeline，必須在 Next build 前提供此值；事後僅改 Worker runtime var 不會改變已編譯的 NEXT_PUBLIC_*。本機可參考 .env.example。

## 事件與同意

只在正式部署、lilaiireland.com hostname、有效 GA4 ID，且既有 lilai_consent_v1 cookie 的 analytics 為 true 時送出。廣告同意獨立；既有 Ads 同意更新保留。CookieConsent 只多通知表單同意已變動。

| Event | 時機與去重 |
| --- | --- |
| consult_form_start | 同意後第一次非空白輸入變更、選項或表單同意鈕操作；focus、空白、導航不算。是有效互動，不要求整個欄位或階段已驗證成功。每個 mounted 表單一次。 |
| consult_step_view | 進入階段時送 step_number 1–5，每階段一次，返回不重算。若停在該階段才取得同意，只記目前階段，不補送先前未同意的階段。 |
| consult_step_complete | 通過該階段既有驗證後，每階段一次；返回再完成或重試不重算。 |
| consult_validation_error | continue/submit 驗證失敗或嘗試選第四個 barrier，只有 step_number，不含錯誤文字與輸入內容。 |
| consult_submit_attempt | 最後 submit 操作、驗證前；in-flight/completed 不重送，明確重試另計。 |
| consult_submit_success | 原 GAS fetch resolved 邊界一次，既有 Ads conversion 先執行。 |

所有自訂 payload 只有 send_to: G-06M3GS0WS0、固定 form_id、必要時 1–5 的 step_number。不含姓名、Email、電話、LINE/Instagram、自由文字或表單值，沒有自訂 UTM/session/client/user ID。

現有 gtag stub 在遠端 script 尚未載入時已會排入 dataLayer；若 gtag 暫時不存在，使用相同 dataLayer 的 Arguments command 佇列，不建立新 loader/config。只有已接受或入列的事件才標記去重。未同意的操作不暫存、不回放；日後新的有效操作可以開始追蹤。追蹤例外不影響驗證、GAS、Ads。廣告阻擋或離頁前始終未載入 Google script 的情況仍可能無法送達；程式層排隊不是後台送達保證。

原 form noValidate、自訂驗證、GAS no-cors、UI 保留；一般 input Enter 不跳步，textarea Enter 換行，最後 submit 可鍵盤操作。success 仍只代表 no-cors fetch resolved，不能確認 GAS 寫入或寄信成功。

## UTM 與 GA4 設定

驗收網址：
https://lilaiireland.com/consult?utm_source=instagram&utm_medium=social&utm_campaign=consult&utm_content=ig_bio

唯讀正式 HTTP 檢查確認四個 UTM 保留。Router 測試確認傳入原始 request，production-build 瀏覽器測試確認進頁、返回與提交後 URL 不變。未更動路由或 canonical。使用 GA4 原生 document location/referrer、Session Attribution，不把 UTM 複製到事件。

可沿用相同網址格式標記外部連結（以下為建議命名，非網站內新增連結）：

| 位置 | utm_source | utm_medium | utm_campaign | utm_content |
| --- | --- | --- | --- | --- |
| Instagram Bio | instagram | social | consult | ig_bio |
| Instagram Stories | instagram | social | consult | ig_stories |
| Threads | threads | social | consult | threads_profile |
| LINE | line | social | consult | line_message |

Google 自然搜尋保留搜尋 referrer，由 GA4 判斷 google / organic，不手動偽造 UTM。其他外部連結依來源提供 source/medium/campaign/content，不含個資。Google Ads 自動標記與歸因設定保留。

GA4 管理介面：

- 新增 event-scoped Custom Dimension，event parameter 為 step_number，供探索報表依階段拆分。
- utm_content 使用內建 Session manual ad content，不需另建 UTM Custom Dimension。
- 以 Session source / medium、Session campaign、Session manual ad content 拆分事件／漏斗，避免誤用 First user scope。
- 若要以成功作為 GA4 業務成果，可手動將 consult_submit_success 標記 Key event；不影響原本事件收集，不需要把所有階段設成 Key event。
- 不自動將此 Key event 匯入 Ads，避免與原有 Ads conversion 重複計算。
- 漏斗依序使用 View(n)、Complete(n)、View(n+1)，以 step_number 限制各步驟。使用者完成 Step 1 後離開 Step 2，應有 View(2)，但無 Complete(2)，不需額外離頁事件。

## 測試與部署後驗收

已執行 TypeScript、Next production build（使用 Cloudflare vars）、事件單元測試、既有 Ads/GAS 與 Consent 測試、Router UTM request 保留與 production route safety。
playwright.consult-analytics.config.ts 使用正式 Next build，在瀏覽器模擬正式 hostname；所有網路攔截到本機／mock，沒有執行 Google script 或送出真實 GAS/Ads 請求。
三項測試涵蓋六事件、Step 2 流失、同意取得／撤回、延遲 gtag、payload 白名單、UTM 保留、一次 Ads conversion、一次 js/config 且沒有新增 page_view 指令。

本機 Windows 的 OpenNext Cloudflare packaging 在子程序退出碼 3221226505 中止；Next build 成功。完整 Cloudflare 封裝以 PR Linux CI 結果為準。

部署後：

1. 用新的瀏覽器工作階段，從 Google Tag Assistant 連接上述 UTM 網址，啟用個人 debug mode。接受 Analytics Cookie Consent，不需對所有使用者加入 debug_mode。
2. GA4「管理 → 資料顯示 → DebugView」選自己的裝置，確認原有 page_view/session_start，以及 consult_step_view 的 step_number=1。網路 collect 請求的 tid 應為 G-06M3GS0WS0。
3. 填入第一個非空白值，確認一次 start；通過第一階段後確認 Complete(1)、View(2)。返回再前進不增加 View/Complete；停在 Step 2 不應出現 Complete(2)。
4. 其餘階段同理。完整 attempt/success 已由本機 mock 驗證；正式 GAS 成功邊界只以獲准的受控提交或真實業務流程確認，避免任意測試寄信與 Ads 轉換。
5. 檢查同一正常頁載入沒有兩筆 page_view（新工作階段才應有 session_start）、沒有雙重 GTM sender；自動 form_start 與自訂 consult_form_start 分開觀察。
6. DebugView 僅做有限歸因；等資料處理後在 Traffic acquisition／探索確認 instagram / social、consult、Session manual ad content = ig_bio 與漏斗事件的關聯。換 UTM 測試時使用新的乾淨工作階段；GA4 不因中途換 UTM 就必然新開 session。

正式 GA4 DebugView、後台 session 歸因、Google 遠端 script 產生的實際自動事件數尚未驗證。視覺 QA 仍需 375px/1440px、overflow、focus-visible、IME、console/hydration 與結果／feedback 操作；本次未調整 CSS 或 UI 內容。

官方參考：[Google tag config](https://developers.google.com/tag-platform/gtagjs/configure)、[UTM 維度](https://support.google.com/analytics/answer/11242870)、[自訂參數報表](https://developers.google.com/analytics/devguides/collection/ga4/event-parameters)、[DebugView](https://support.google.com/analytics/answer/7201382)。

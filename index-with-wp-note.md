# WordPress Page 內嵌版本說明

此檔案為 **WordPress 指定 Page 使用的完整前端程式碼**，內容不是獨立網站專案，而是提供給 WordPress 頁面直接嵌入使用。

請依下方標示將內容分成三個部分放入對應位置：

1. **HTML**
   - 放入 WordPress Page 的 HTML／Custom HTML 區塊。
   - 對應本檔案中的 `--HTML--` 區段。

2. **CSS**
   - 放入該頁面的自訂 CSS，或網站目前使用的 Page-level / Custom CSS 區域。
   - 對應本檔案中的 `--CSS--` 區段。
   - CSS 已使用 `.lilai-consultation-page` 作為主要 scope，避免影響 WordPress 其他頁面。

3. **JavaScript**
   - 放入該頁面的 JavaScript／Custom Code 區域。
   - 對應本檔案中的 `--Java Scripts--` 區段。
   - 此區包含表單互動、分類邏輯、航線計算、GAS API 傳送、Google Ads conversion tracking、成功頁面與 FAQ 等功能。

> **注意：**
> - 更新時請同步檢查 HTML、CSS、JavaScript 三個區段，避免只更新其中一段造成前後端邏輯不同步。
> - `GAS_ENDPOINT` 為正式 Google Apps Script Web App API 位址，部署新版 GAS 後若 URL 有變更，需同步更新 JavaScript 設定。
> - 此檔案作為 GitHub 版本控管與 WordPress Page 更新來源使用。

---

--HTML--<div class="lilai-consultation-page">

<section class="carousel-hero">
  <div class="carousel-track" id="carousel-track">

    <div class="carousel-slide active">
      <img src="https://lilaiireland.com/wp-content/uploads/2026/07/lilai-consultation-hero-1-1.jpg" alt="哩來愛爾蘭 — Podcast 錄製現場" loading="eager">
    </div>

    <div class="carousel-slide">
      <img src="https://lilaiireland.com/wp-content/uploads/2026/07/lilai-consultation-hero-2-1.jpg" alt="哩來愛爾蘭 — Alex &amp; Arsha 在愛爾蘭" loading="lazy">
    </div>

    <div class="carousel-slide">
      <img src="https://lilaiireland.com/wp-content/uploads/2026/07/lilai-consultation-hero-3-1.jpg" alt="哩來愛爾蘭 — 說明會現場" loading="lazy">
    </div>

  </div>

  <button type="button" class="carousel-arrow prev" onclick="carouselMove(-1)" aria-label="上一張">←</button>
  <button type="button" class="carousel-arrow next" onclick="carouselMove(1)" aria-label="下一張">→</button>

  <div class="carousel-content">
    <div class="carousel-badge">哩來出發計畫</div>
    <h1>每個想出發的人，<br>都需要先看懂自己。</h1>
    <p>填寫出發計畫，我們幫你判斷目前的出發階段<br>與最適合你的下一步。</p>
    <a href="#form" class="btn-hero">開始免費出發評估</a>
    <p class="hero-tagline">一起把夢，過成生活。</p>
  </div>

  <div class="carousel-dots" id="carousel-dots">
    <button type="button" class="carousel-dot active" onclick="carouselGoTo(0)" aria-label="第 1 張"></button>
    <button type="button" class="carousel-dot" onclick="carouselGoTo(1)" aria-label="第 2 張"></button>
    <button type="button" class="carousel-dot" onclick="carouselGoTo(2)" aria-label="第 3 張"></button>
  </div>
</section>

<section class="benefits">
  <p class="section-label">完成表單後，你將獲得</p>
  <h2 class="section-title">先看懂自己，再出發</h2>

  <div class="benefits-grid">
    <div class="benefit-card">
      <div class="benefit-num">1</div>
      <h3>免費出發階段建議</h3>
      <p>幫你判斷目前比較接近觀望型、探索型、準備型或行動型，讓你知道現在該做什麼。</p>
    </div>
    <div class="benefit-card">
      <div class="benefit-num">2</div>
      <h3>愛爾蘭語校與 25+8 初步方向</h3>
      <p>根據你的目標與出發時間，初步判斷你適合短期語校、25+8，還是先整理資訊。</p>
    </div>
    <div class="benefit-card">
      <div class="benefit-num">3</div>
      <h3>預算與生活準備資料</h3>
      <p>包含愛爾蘭語校、25+8、生活成本、住宿、打工與出發前準備方向。</p>
    </div>
    <div class="benefit-card">
      <div class="benefit-num">4</div>
      <h3>說明會優先邀請資格</h3>
      <p>完成表單後，獲得下一場說明會的<strong>優先邀請資格</strong>。說明會基本上免費，開放報名時第一時間通知你。</p>
    </div>
  </div>

  <div class="early-bird">
    <div class="early-bird-content">
      <h4>說明會優先邀請資格</h4>
      <p>完成出發計畫後，你已獲得下一場說明會的<span class="price-highlight">優先邀請資格</span>。說明會基本上免費參加，開放報名時我們會第一時間通知你。</p>
    </div>
  </div>
</section>

<section class="form-section" id="form">
  <div class="form-container">

    <div class="form-progress" id="progress-dots">
      <div class="progress-dot active" data-step="1"></div>
      <div class="progress-dot" data-step="2"></div>
      <div class="progress-dot" data-step="3"></div>
      <div class="progress-dot" data-step="4"></div>
      <div class="progress-dot" data-step="5"></div>
    </div>

    <div class="form-step active" id="step-1">
      <div class="step-header">
        <p class="step-num">SECTION 01 / 05</p>
        <h2 class="step-title">先認識一下你</h2>
        <p class="step-desc">填寫評估結果會寄到你的 Email，請確認正確。</p>
      </div>

      <div class="field-group">
        <label class="field-label" for="name">姓名 <span class="required">*</span></label>
        <input type="text" class="text-input" id="name" placeholder="你的名字" required="" maxlength="100">
        <span class="field-error" id="name-error">請填寫姓名</span>
      </div>

      <div class="field-group">
        <label class="field-label" for="nickname">暱稱 <span class="required">*</span><span class="field-hint">你希望哩來如何稱呼你？</span></label>
        <input type="text" class="text-input" id="nickname" placeholder="暱稱（英文 / 中文都可以）" required="" maxlength="100">
        <span class="field-error" id="nickname-error">請填寫暱稱</span>
      </div>

      <div class="field-group">
        <label class="field-label" for="email">Email <span class="required">*</span><span class="field-hint">評估結果與資料包將寄到這裡</span></label>
        <input type="email" class="text-input" id="email" placeholder="your@email.com" required="" maxlength="254">
        <span class="field-error" id="email-error">請填寫正確的 Email 格式</span>
      </div>

      <div class="field-group">
        <label class="field-label" for="instagram">Instagram 帳號<span class="field-hint">溝通更方便，推薦留！（選填）</span></label>
        <div class="ig-input-wrapper">
          <span class="ig-prefix">@</span>
          <input type="text" class="text-input" id="instagram" placeholder="your_handle" oninput="normalizeIG(this)" maxlength="100">
        </div>
        <span class="field-error" id="instagram-error">Instagram 帳號請控制在 100 字元以內</span>
      </div>

      <div class="field-group">
        <label class="field-label" for="lineId">Line ID<span class="field-hint">也可以透過 Line 聯繫，選填</span></label>
        <input type="text" class="text-input" id="lineId" placeholder="你的 Line ID" maxlength="100">
        <span class="field-error" id="lineId-error">LINE ID 請控制在 100 字元以內</span>
      </div>

      <div class="field-group">
        <label class="field-label">目前所在地 <span class="required">*</span></label>
        <div class="options-grid" id="location-options">
          <label class="option-item" data-value="台灣"><input type="radio" name="location" value="台灣"><span class="option-custom-check"></span><span class="option-text">台灣</span></label>
          <label class="option-item" data-value="愛爾蘭"><input type="radio" name="location" value="愛爾蘭"><span class="option-custom-check"></span><span class="option-text">愛爾蘭</span></label>
          <label class="option-item" data-value="其他歐洲國家"><input type="radio" name="location" value="其他歐洲國家"><span class="option-custom-check"></span><span class="option-text">其他歐洲國家</span></label>
          <label class="option-item" data-value="其他地區"><input type="radio" name="location" value="其他地區"><span class="option-custom-check"></span><span class="option-text">其他地區</span></label>
        </div>
        <span class="field-error" id="location-error">請選擇所在地</span>
      </div>

      <div class="form-nav">
        <span></span>
        <button type="button" class="btn-next" onclick="nextStep(1)">繼續 →</button>
      </div>
    </div>

    <div class="form-step" id="step-2">
      <div class="step-header">
        <p class="step-num">SECTION 02 / 05</p>
        <h2 class="step-title">你目前在哪個出發階段？</h2>
        <p class="step-desc">沒有對錯，誠實最有幫助。</p>
      </div>

      <div class="field-group">
        <label class="field-label">你目前對愛爾蘭的了解程度是？ <span class="required">*</span></label>
        <div class="options-grid" id="awareness-options">
          <label class="option-item" data-value="剛開始了解，還在查資料"><input type="radio" name="awareness" value="剛開始了解，還在查資料"><span class="option-custom-check"></span><span class="option-text">剛開始了解，還在查資料</span></label>
          <label class="option-item" data-value="已經看過一些愛爾蘭語校或 25+8 資訊"><input type="radio" name="awareness" value="已經看過一些愛爾蘭語校或 25+8 資訊"><span class="option-custom-check"></span><span class="option-text">已經看過一些愛爾蘭語校或 25+8 資訊</span></label>
          <label class="option-item" data-value="正在比較愛爾蘭和其他國家"><input type="radio" name="awareness" value="正在比較愛爾蘭和其他國家"><span class="option-custom-check"></span><span class="option-text">正在比較愛爾蘭和其他國家</span></label>
          <label class="option-item" data-value="已經蠻確定想去愛爾蘭，但還沒決定方案"><input type="radio" name="awareness" value="已經蠻確定想去愛爾蘭，但還沒決定方案"><span class="option-custom-check"></span><span class="option-text">已經蠻確定想去愛爾蘭，但還沒決定方案</span></label>
          <label class="option-item" data-value="已經準備報名，只是在找可信任的代辦或顧問"><input type="radio" name="awareness" value="已經準備報名，只是在找可信任的代辦或顧問"><span class="option-custom-check"></span><span class="option-text">已經準備報名，只是在找可信任的代辦或顧問</span></label>
        </div>
        <span class="field-error" id="awareness-error">請選擇了解程度</span>
      </div>

      <div class="field-group">
        <label class="field-label">你預計什麼時候出發？ <span class="required">*</span></label>
        <div class="options-grid" id="timeline-options">
          <label class="option-item" data-value="3 個月內"><input type="radio" name="timeline" value="3 個月內"><span class="option-custom-check"></span><span class="option-text">3 個月內</span></label>
          <label class="option-item" data-value="3–6 個月內"><input type="radio" name="timeline" value="3–6 個月內"><span class="option-custom-check"></span><span class="option-text">3–6 個月內</span></label>
          <label class="option-item" data-value="6–12 個月內"><input type="radio" name="timeline" value="6–12 個月內"><span class="option-custom-check"></span><span class="option-text">6–12 個月內</span></label>
          <label class="option-item" data-value="一年以上"><input type="radio" name="timeline" value="一年以上"><span class="option-custom-check"></span><span class="option-text">一年以上</span></label>
          <label class="option-item" data-value="還不確定"><input type="radio" name="timeline" value="還不確定"><span class="option-custom-check"></span><span class="option-text">還不確定</span></label>
        </div>
        <span class="field-error" id="timeline-error">請選擇出發時間</span>
      </div>

      <div class="field-group">
        <label class="field-label">你目前比較感興趣的方案是？ <span class="required">*</span></label>
        <div class="options-grid" id="plan-options">
          <label class="option-item" data-value="2–4 週短期遊學"><input type="radio" name="plan" value="2–4 週短期遊學"><span class="option-custom-check"></span><span class="option-text">2–4 週短期遊學</span></label>
          <label class="option-item" data-value="8–12 週語言學習"><input type="radio" name="plan" value="8–12 週語言學習"><span class="option-custom-check"></span><span class="option-text">8–12 週語言學習</span></label>
          <label class="option-item" data-value="25+8 打工遊學"><input type="radio" name="plan" value="25+8 打工遊學"><span class="option-custom-check"></span><span class="option-text">25+8 打工遊學</span></label>
          <label class="option-item" data-value="考試準備班／商業英文"><input type="radio" name="plan" value="考試準備班／商業英文"><span class="option-custom-check"></span><span class="option-text">考試準備班／商業英文</span></label>
          <label class="option-item" data-value="還不確定，需要先評估"><input type="radio" name="plan" value="還不確定，需要先評估"><span class="option-custom-check"></span><span class="option-text">還不確定，需要先評估</span></label>
          <label class="option-item" data-value="我其實也在比較其他國家"><input type="radio" name="plan" value="我其實也在比較其他國家"><span class="option-custom-check"></span><span class="option-text">我其實也在比較其他國家</span></label>
        </div>
        <span class="field-error" id="plan-error">請選擇感興趣的方案</span>
      </div>

      <div class="form-nav">
        <button type="button" class="btn-back" onclick="prevStep(2)">← 返回</button>
        <button type="button" class="btn-next" onclick="nextStep(2)">繼續 →</button>
      </div>
    </div>

    <div class="form-step" id="step-3">
      <div class="step-header">
        <p class="step-num">SECTION 03 / 05</p>
        <h2 class="step-title">你為什麼想出發？</h2>
        <p class="step-desc">可複選，選出最符合你的原因。</p>
      </div>

      <div class="field-group">
        <label class="field-label">你有沒有打算在愛爾蘭工作？ <span class="required">*</span></label>
        <div class="options-grid single-col" id="workIntention-options">
          <label class="option-item" data-value="有，這是我出發的重要原因之一"><input type="radio" name="workIntention" value="有，這是我出發的重要原因之一"><span class="option-custom-check"></span><span class="option-text">有，這是我出發的重要原因之一</span></label>
          <label class="option-item" data-value="沒有，我以學習和體驗為主"><input type="radio" name="workIntention" value="沒有，我以學習和體驗為主"><span class="option-custom-check"></span><span class="option-text">沒有，我以學習和體驗為主</span></label>
          <label class="option-item" data-value="還在考慮中"><input type="radio" name="workIntention" value="還在考慮中"><span class="option-custom-check"></span><span class="option-text">還在考慮中</span></label>
        </div>
        <span class="field-error" id="workIntention-error">請選擇一個選項</span>
      </div>

      <div class="field-group">
        <label class="field-label">你考慮去愛爾蘭，主要是為了什麼？ <span class="required">*</span><span class="field-hint">可複選</span></label>
        <div class="options-grid" id="goals-options">
          <label class="option-item" data-value="提升英文能力"><input type="checkbox" name="goals" value="提升英文能力"><span class="option-custom-check checkbox"></span><span class="option-text">提升英文能力</span></label>
          <label class="option-item" data-value="體驗歐洲生活"><input type="checkbox" name="goals" value="體驗歐洲生活"><span class="option-custom-check checkbox"></span><span class="option-text">體驗歐洲生活</span></label>
          <label class="option-item" data-value="累積海外職涯"><input type="checkbox" name="goals" value="累積海外職涯"><span class="option-custom-check checkbox"></span><span class="option-text">累積海外職涯</span></label>
          <label class="option-item" data-value="想離開台灣一陣子，換個環境"><input type="checkbox" name="goals" value="想離開台灣一陣子，換個環境"><span class="option-custom-check checkbox"></span><span class="option-text">想離開台灣一陣子，換個環境</span></label>
          <label class="option-item" data-value="未來想嘗試留在海外"><input type="checkbox" name="goals" value="未來想嘗試留在海外"><span class="option-custom-check checkbox"></span><span class="option-text">未來想嘗試留在海外</span></label>
          <label class="option-item" data-value="想銜接碩士或職涯發展"><input type="checkbox" name="goals" value="想銜接碩士或職涯發展"><span class="option-custom-check checkbox"></span><span class="option-text">想銜接碩士或職涯發展</span></label>
          <label class="option-item" data-value="想拓展人生經驗"><input type="checkbox" name="goals" value="想拓展人生經驗"><span class="option-custom-check checkbox"></span><span class="option-text">想拓展人生經驗</span></label>
        </div>
        <span class="field-error" id="goals-error">請至少選擇一個選項</span>
      </div>

      <div class="field-group">
        <label class="field-label">英文提升對你來說是？ <span class="required">*</span></label>
        <div class="options-grid single-col" id="englishGoal-options">
          <label class="option-item" data-value="最主要目的"><input type="radio" name="englishGoal" value="最主要目的"><span class="option-custom-check"></span><span class="option-text">這趟旅程最主要的目的</span></label>
          <label class="option-item" data-value="重要但非唯一"><input type="radio" name="englishGoal" value="重要但非唯一"><span class="option-custom-check"></span><span class="option-text">重要，但不是唯一原因</span></label>
          <label class="option-item" data-value="非首要目標"><input type="radio" name="englishGoal" value="非首要目標"><span class="option-custom-check"></span><span class="option-text">不是我的首要目標，我有其他優先考量</span></label>
        </div>
        <span class="field-error" id="englishGoal-error">請選擇一個選項</span>
      </div>

      <div class="field-group">
        <label class="field-label" for="life-change">如果真的去愛爾蘭，你最希望這趟旅程幫你改變什麼？ <span class="required">*</span></label>
        <textarea class="text-input" id="life-change" placeholder="寫下你的想法，沒有標準答案。可以是很個人的事，也可以是對生活的期待…" rows="5" maxlength="3000"></textarea>
        <span class="field-error" id="life-change-error">請填寫這個問題</span>
      </div>

      <div class="form-nav">
        <button type="button" class="btn-back" onclick="prevStep(3)">← 返回</button>
        <button type="button" class="btn-next" onclick="nextStep(3)">繼續 →</button>
      </div>
    </div>

    <div class="form-step" id="step-4">
      <div class="step-header">
        <p class="step-num">SECTION 04 / 05</p>
        <h2 class="step-title">現在最卡住你的是什麼？</h2>
        <p class="step-desc">說出來，才能幫你找出路。</p>
      </div>

      <div class="field-group">
        <label class="field-label">你現在最卡住的地方是什麼？ <span class="required">*</span><span class="field-hint">最多選 3 個</span></label>
        <div class="options-grid" id="barriers-options">
          <label class="option-item" data-value="預算不確定"><input type="checkbox" name="barriers" value="預算不確定"><span class="option-custom-check checkbox"></span><span class="option-text">預算不確定</span></label>
          <label class="option-item" data-value="英文不夠好"><input type="checkbox" name="barriers" value="英文不夠好"><span class="option-custom-check checkbox"></span><span class="option-text">英文不夠好</span></label>
          <label class="option-item" data-value="家人不支持或還沒溝通"><input type="checkbox" name="barriers" value="家人不支持或還沒溝通"><span class="option-custom-check checkbox"></span><span class="option-text">家人不支持或還沒溝通</span></label>
          <label class="option-item" data-value="不知道能不能在愛爾蘭找到工作"><input type="checkbox" name="barriers" value="不知道能不能在愛爾蘭找到工作"><span class="option-custom-check checkbox"></span><span class="option-text">不知道能不能在愛爾蘭找到工作</span></label>
          <label class="option-item" data-value="不確定回台灣後是否有幫助"><input type="checkbox" name="barriers" value="不確定回台灣後是否有幫助"><span class="option-custom-check checkbox"></span><span class="option-text">不確定回台灣後是否有幫助</span></label>
          <label class="option-item" data-value="怕孤單或適應不良"><input type="checkbox" name="barriers" value="怕孤單或適應不良"><span class="option-custom-check checkbox"></span><span class="option-text">怕孤單或適應不良</span></label>
          <label class="option-item" data-value="不知道愛爾蘭和其他國家怎麼選"><input type="checkbox" name="barriers" value="不知道愛爾蘭和其他國家怎麼選"><span class="option-custom-check checkbox"></span><span class="option-text">不知道愛爾蘭和其他國家怎麼選</span></label>
          <label class="option-item" data-value="不知道自己是不是真的適合出國"><input type="checkbox" name="barriers" value="不知道自己是不是真的適合出國"><span class="option-custom-check checkbox"></span><span class="option-text">不知道自己是不是真的適合出國</span></label>
          <label class="option-item" data-value="害怕做錯決定"><input type="checkbox" name="barriers" value="害怕做錯決定"><span class="option-custom-check checkbox"></span><span class="option-text">害怕做錯決定</span></label>
          <label class="option-item" data-value="還不清楚學校、簽證與住宿流程"><input type="checkbox" name="barriers" value="還不清楚學校、簽證與住宿流程"><span class="option-custom-check checkbox"></span><span class="option-text">還不清楚學校、簽證與住宿流程</span></label>
        </div>
        <span class="field-error" id="barriers-error">請至少選擇一個選項</span>
      </div>

      <div class="field-group">
        <label class="field-label">你對城市有偏好嗎？ <span class="required">*</span></label>
        <div class="options-grid single-col" id="cityPreference-options">
          <label class="option-item" data-value="想待在都柏林"><input type="radio" name="cityPreference" value="想待在都柏林"><span class="option-custom-check"></span><span class="option-text">想待在都柏林</span></label>
          <label class="option-item" data-value="都柏林為主，願意考慮其他城市"><input type="radio" name="cityPreference" value="都柏林為主，願意考慮其他城市"><span class="option-custom-check"></span><span class="option-text">都柏林為主，但願意考慮其他城市</span></label>
          <label class="option-item" data-value="傾向非都柏林城市"><input type="radio" name="cityPreference" value="傾向非都柏林城市"><span class="option-custom-check"></span><span class="option-text">傾向非都柏林城市（高威、科克等）</span></label>
          <label class="option-item" data-value="沒有特別偏好"><input type="radio" name="cityPreference" value="沒有特別偏好"><span class="option-custom-check"></span><span class="option-text">沒有特別偏好，哪裡適合就去哪裡</span></label>
        </div>
        <span class="field-error" id="cityPreference-error">請選擇一個選項</span>
      </div>

      <div class="field-group">
        <label class="field-label">你大概可以準備多少錢出發？ <span class="required">*</span><span class="field-hint">含學費與前期準備費用，不含個人零用</span></label>
        <div class="options-grid" id="budget-options">
          <label class="option-item" data-value="NT$30 萬以下"><input type="radio" name="budget" value="NT$30 萬以下"><span class="option-custom-check"></span><span class="option-text">NT$30 萬以下</span></label>
          <label class="option-item" data-value="NT$30–35 萬"><input type="radio" name="budget" value="NT$30–35 萬"><span class="option-custom-check"></span><span class="option-text">NT$30–35 萬</span></label>
          <label class="option-item" data-value="NT$35–40 萬"><input type="radio" name="budget" value="NT$35–40 萬"><span class="option-custom-check"></span><span class="option-text">NT$35–40 萬</span></label>
          <label class="option-item" data-value="NT$40–45 萬"><input type="radio" name="budget" value="NT$40–45 萬"><span class="option-custom-check"></span><span class="option-text">NT$40–45 萬</span></label>
          <label class="option-item" data-value="NT$45 萬以上"><input type="radio" name="budget" value="NT$45 萬以上"><span class="option-custom-check"></span><span class="option-text">NT$45 萬以上</span></label>
          <label class="option-item" data-value="還不確定"><input type="radio" name="budget" value="還不確定"><span class="option-custom-check"></span><span class="option-text">還不確定，需要更多資訊</span></label>
        </div>
        <span class="field-error" id="budget-error">請選擇預算區間</span>
      </div>

      <div class="field-group">
        <label class="field-label">你希望哩來優先提供哪一類資訊？ <span class="required">*</span><span class="field-hint">可複選</span></label>
        <div class="options-grid" id="resources-options">
          <label class="option-item" data-value="愛爾蘭語校比較"><input type="checkbox" name="resources" value="愛爾蘭語校比較"><span class="option-custom-check checkbox"></span><span class="option-text">愛爾蘭語校比較</span></label>
          <label class="option-item" data-value="25+8 打工遊學介紹"><input type="checkbox" name="resources" value="25+8 打工遊學介紹"><span class="option-custom-check checkbox"></span><span class="option-text">25+8 打工遊學介紹</span></label>
          <label class="option-item" data-value="預算與生活成本"><input type="checkbox" name="resources" value="預算與生活成本"><span class="option-custom-check checkbox"></span><span class="option-text">預算與生活成本</span></label>
          <label class="option-item" data-value="住宿資訊"><input type="checkbox" name="resources" value="住宿資訊"><span class="option-custom-check checkbox"></span><span class="option-text">住宿資訊</span></label>
          <label class="option-item" data-value="愛爾蘭找工作與打工"><input type="checkbox" name="resources" value="愛爾蘭找工作與打工"><span class="option-custom-check checkbox"></span><span class="option-text">愛爾蘭找工作與打工</span></label>
          <label class="option-item" data-value="英文程度與適應問題"><input type="checkbox" name="resources" value="英文程度與適應問題"><span class="option-custom-check checkbox"></span><span class="option-text">英文程度與適應問題</span></label>
          <label class="option-item" data-value="出發前準備 checklist"><input type="checkbox" name="resources" value="出發前準備 checklist"><span class="option-custom-check checkbox"></span><span class="option-text">出發前準備 checklist</span></label>
          <label class="option-item" data-value="一對一諮詢與選校建議"><input type="checkbox" name="resources" value="一對一諮詢與選校建議"><span class="option-custom-check checkbox"></span><span class="option-text">一對一諮詢與選校建議</span></label>
        </div>
        <span class="field-error" id="resources-error">請至少選擇一個選項</span>
      </div>

      <div class="form-nav">
        <button type="button" class="btn-back" onclick="prevStep(4)">← 返回</button>
        <button type="button" class="btn-next" onclick="nextStep(4)">繼續 →</button>
      </div>
    </div>

    <div class="form-step" id="step-5">
      <div class="step-header">
        <p class="step-num">SECTION 05 / 05</p>
        <h2 class="step-title">最後一步了！</h2>
        <p class="step-desc">讓我們知道你對什麼最感興趣，我們會寄給你最相關的內容。</p>
      </div>

      <div class="field-group">
        <label class="field-label">如果哩來未來有主題說明會，你會想參加哪一類？ <span class="required">*</span><span class="field-hint">可複選</span></label>
        <div class="options-grid" id="webinar-options">
          <label class="option-item" data-value="愛爾蘭語校與 25+8 完整介紹"><input type="checkbox" name="webinar" value="愛爾蘭語校與 25+8 完整介紹"><span class="option-custom-check checkbox"></span><span class="option-text">愛爾蘭語校與 25+8 完整介紹</span></label>
          <label class="option-item" data-value="英文不好也能去愛爾蘭嗎？"><input type="checkbox" name="webinar" value="英文不好也能去愛爾蘭嗎？"><span class="option-custom-check checkbox"></span><span class="option-text">英文不好也能去愛爾蘭嗎？</span></label>
          <label class="option-item" data-value="愛爾蘭打工、生活成本與預算規劃"><input type="checkbox" name="webinar" value="愛爾蘭打工、生活成本與預算規劃"><span class="option-custom-check checkbox"></span><span class="option-text">愛爾蘭打工、生活成本與預算規劃</span></label>
          <label class="option-item" data-value="從台灣到歐洲生活的真實經驗"><input type="checkbox" name="webinar" value="從台灣到歐洲生活的真實經驗"><span class="option-custom-check checkbox"></span><span class="option-text">從台灣到歐洲生活的真實經驗</span></label>
          <label class="option-item" data-value="如何說服家人與規劃出發時間"><input type="checkbox" name="webinar" value="如何說服家人與規劃出發時間"><span class="option-custom-check checkbox"></span><span class="option-text">如何說服家人與規劃出發時間</span></label>
          <label class="option-item" data-value="愛爾蘭 vs 其他國家比較"><input type="checkbox" name="webinar" value="愛爾蘭 vs 其他國家比較"><span class="option-custom-check checkbox"></span><span class="option-text">愛爾蘭 vs 其他國家比較</span></label>
          <label class="option-item" data-value="還不確定，想先收到活動通知"><input type="checkbox" name="webinar" value="還不確定，想先收到活動通知"><span class="option-custom-check checkbox"></span><span class="option-text">還不確定，想先收到活動通知</span></label>
        </div>
        <span class="field-error" id="webinar-error">請至少選擇一個選項</span>
      </div>

      <div class="field-group">
        <label class="field-label">同意條款 <span class="required">*</span></label>
        <label class="consent-item" id="consent1-item" onclick="toggleConsent('consent1')">
          <div class="consent-check"><span class="consent-check-mark">✓</span></div>
          <span class="consent-text">我同意收到哩來愛爾蘭寄送的出發建議、活動通知與相關資料。</span>
        </label>
        <label class="consent-item" id="consent2-item" onclick="toggleConsent('consent2')">
          <div class="consent-check"><span class="consent-check-mark">✓</span></div>
          <span class="consent-text">我了解本表單資料僅供哩來愛爾蘭進行出發階段評估、後續聯繫與服務建議使用，不會任意公開或販售給第三方。</span>
        </label>
        <span class="field-error" id="consent-error">請同意以上兩項條款才能完成送出</span>
      </div>

      <div class="form-nav">
        <button type="button" class="btn-back" onclick="prevStep(5)">← 返回</button>
        <button type="button" class="btn-submit" id="submit-btn" onclick="submitForm()">取得我的出發評估 🍀</button>
      </div>
    </div>

    <div class="success-screen" id="success-screen">

      <div id="result-phase">
        <div class="success-icon">🍀</div>
        <h2 class="success-title" id="success-title">你的出發評估來了</h2>

        <div class="stage-badge" id="success-stage-badge"></div>

        <div class="result-summary" id="result-summary"></div>

        <div class="result-diagnosis" id="result-diagnosis"></div>

        <div class="result-nextsteps" id="result-nextsteps"></div>
        <div id="result-cta"></div>

        <p class="result-email-hint">完整報告與 PDF 正在寄到你的 Email，請稍後查收。</p>

        <div class="accuracy-check" id="accuracy-check">
          <p class="accuracy-question">這個評估結果準嗎？</p>
          <div class="accuracy-options">
            <button type="button" class="accuracy-btn" onclick="submitAccuracy('很準')">很準 😊</button>
            <button type="button" class="accuracy-btn" onclick="submitAccuracy('還好')">還好 🤔</button>
            <button type="button" class="accuracy-btn accuracy-btn-miss" onclick="submitAccuracy('不太準')">不太準 😕</button>
          </div>
        </div>

        <div class="accuracy-done" id="accuracy-done" style="display:none;">
          <p id="accuracy-done-msg"></p>
        </div>
      </div>

      <p style="font-size:12px; color: var(--gray-light); margin-top: 24px;">哩來愛爾蘭 · 一起把夢，過成生活。</p>
    </div>

  </div>
</section>

<section class="faq-section">
  <div class="faq-container">
    <p class="section-label">FREQUENTLY ASKED</p>
    <h2 class="section-title" style="text-align:left;">常見問題</h2>

    <div class="faq-item">
      <div class="faq-question" onclick="toggleFaq(this)"><span>《哩來出發計畫》是報名表嗎？</span><div class="faq-toggle">+</div></div>
      <div class="faq-answer">不是。《哩來出發計畫》是一份免費的出發前評估表單，目的是幫你初步看懂自己目前的狀態、適合的方向，以及下一步可以怎麼走。填完不代表你要立刻報名語校，也不代表你一定要購買任何方案。我們希望你先把自己看清楚，再決定要不要出發。</div>
    </div>

    <div class="faq-item">
      <div class="faq-question" onclick="toggleFaq(this)"><span>填完表單後，我會收到什麼？</span><div class="faq-toggle">+</div></div>
      <div class="faq-answer">填寫完成後，你會收到：初步出發階段評估、適合你的下一步建議、愛爾蘭語校、25+8、預算與生活準備資料，以及下一場說明會的優先邀請資格（說明會基本上免費）。如果我們判斷你已經接近報名階段，也可能會建議你直接預約一對一語校出發諮詢。</div>
    </div>

    <div class="faq-item">
      <div class="faq-question" onclick="toggleFaq(this)"><span>說明會優先邀請資格是怎麼運作的？</span><div class="faq-toggle">+</div></div>
      <div class="faq-answer">完成《哩來出發計畫》後，你已獲得下一場說明會的優先邀請資格。說明會基本上免費參加，開放報名時我們會第一時間通知你，不需要現在做任何決定。</div>
    </div>

    <div class="faq-item">
      <div class="faq-question" onclick="toggleFaq(this)"><span>我完全不知道自己適不適合去愛爾蘭，應該先選哪一個？</span><div class="faq-toggle">+</div></div>
      <div class="faq-answer">建議你先填寫「哩來出發計畫｜免費階段評估」。它適合還在觀望、剛開始查資料、或不知道自己適合短期語校、25+8、考試準備班／商業英文的人。如果你現在的狀態是「我有興趣，但不知道從哪開始」，那就先從這裡開始。</div>
    </div>

    <div class="faq-item">
      <div class="faq-question" onclick="toggleFaq(this)"><span>《哩來出發計畫》和《愛爾蘭自助評估包》差在哪裡？</span><div class="faq-toggle">+</div></div>
      <div class="faq-answer">《哩來出發計畫》是免費初步評估，幫你判斷目前階段與下一步方向。《愛爾蘭自助評估包》是付費自學資料包，適合想自己先深入研究的人，內容包含說明會重播與完整整理資料，幫你更系統地了解愛爾蘭語校、25+8、預算與生活準備。如果你只是剛開始了解，先填出發計畫就好。如果你已經想自己花時間完整研究，自助評估包會更適合你。</div>
    </div>

    <div class="faq-item">
      <div class="faq-question" onclick="toggleFaq(this)"><span>《一對一出發諮詢》適合什麼人？</span><div class="faq-toggle">+</div></div>
      <div class="faq-answer">適合已經比較接近行動階段的人。例如你已經大致確定想去愛爾蘭、想報名語校或 25+8、想比較學校、城市、週數與報價、想確認預算、住宿、開課時間與報名流程，或需要有人直接幫你整理下一步。如果你已經不是「要不要去」的問題，而是「我要怎麼去、選哪個方案、什麼時候開始」，那就可以選一對一出發諮詢。</div>
    </div>

    <div class="faq-item">
      <div class="faq-question" onclick="toggleFaq(this)"><span>這些方案會不會都是在推我報名語校？</span><div class="faq-toggle">+</div></div>
      <div class="faq-answer">不會。我們當然提供語校代辦與留遊學諮詢服務，但《哩來出發計畫》的目的不是把每個人都推去報名。有些人適合 25+8，有些人適合短期語校，有些人可能適合先存錢、先補英文，甚至暫時不適合出發。我們希望做的是：幫你做出比較清楚、比較適合自己的選擇。</div>
    </div>

  </div>
</section>

</div>

--CSS--
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600&family=Noto+Sans+TC:wght@300;400;500;600&display=swap');

.lilai-consultation-page {
  --cream: #FAF8F3;
  --cream-dark: #F2EDE3;
  --ivory: #FFFEF9;
  --green-deep: #2D5016;
  --green-mid: #3D6B1F;
  --green-sage: #6B8F4E;
  --green-light: #A8C080;
  --green-pale: #D4E8C0;
  --green-mist: #EDF4E4;
  --brown-warm: #8B6F47;
  --gray-text: #3A3530;
  --gray-mid: #6B6560;
  --gray-light: #B8B2AA;
  --gray-line: #E0D8CE;
  --white: #FFFFFF;
  --error: #C0392B;
  --shadow: 0 2px 20px rgba(45,80,22,0.08);
  --shadow-hover: 0 6px 32px rgba(45,80,22,0.14);

width: 100%; max-width: none; margin: 0; padding: 0;
background: var(--cream); color: var(--gray-text);
font-family: 'Noto Sans TC', sans-serif; line-height: 1.8; font-weight: 300;
overflow-x: hidden;
}

.lilai-consultation-page,
.lilai-consultation-page *,
.lilai-consultation-page *::before,
.lilai-consultation-page *::after { box-sizing: border-box; }
.lilai-consultation-page h1,
.lilai-consultation-page h2,
.lilai-consultation-page h3,
.lilai-consultation-page h4,
.lilai-consultation-page p { margin-top: 0; }
.lilai-consultation-page a { text-decoration: none; }
.lilai-consultation-page button,
.lilai-consultation-page input,
.lilai-consultation-page textarea { font-family: 'Noto Sans TC', sans-serif; }
.lilai-consultation-page button { margin: 0; line-height: 1.8; text-transform: none; appearance: none; }
.lilai-consultation-page .carousel-slide:nth-child(2) img { object-position: center 28%; }
.lilai-consultation-page .carousel-content .hero-tagline {
  color: rgba(255,255,255,0.45); font-size: 12px;
  margin-top: 14px; margin-bottom: 0; letter-spacing: 1.5px;
}

.lilai-consultation-page .carousel-hero {
  position: relative; width: 100%; height: 720px; min-height: 520px; max-height: 85vh; overflow: hidden; background: var(--green-deep);
}

.lilai-consultation-page .carousel-track {
  display: flex; height: 100%; transition: transform 0.75s cubic-bezier(0.4, 0, 0.2, 1); width: 100%; will-change: transform;
}

.lilai-consultation-page .carousel-slide {
  flex: 0 0 100%; height: 100%; position: relative; overflow: hidden; width: 100%;
}

.lilai-consultation-page .carousel-slide img {
  width: 100%; height: 100%; object-fit: cover; object-position: center center; display: block; transform: scale(1.04); transition: transform 6s ease-out;
}

.lilai-consultation-page .carousel-slide.active img {
  transform: scale(1.0);
}

.lilai-consultation-page .carousel-slide::after {
  content: ''; position: absolute; inset: 0; background: linear-gradient( to bottom, rgba(20,40,10,0.25) 0%, rgba(20,40,10,0.15) 40%, rgba(20,40,10,0.55) 75%, rgba(20,40,10,0.82) 100% ); pointer-events: none;
}

.lilai-consultation-page .carousel-content {
  position: absolute; bottom: 0; left: 0; right: 0; padding: 40px 32px 56px; z-index: 10; text-align: center;
}

.lilai-consultation-page .carousel-badge {
  display: inline-block; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.35); color: rgba(255,255,255,0.95); font-size: 11px; font-weight: 600; letter-spacing: 2.5px; padding: 6px 20px; border-radius: 100px; margin-bottom: 18px; text-transform: uppercase;
}

.lilai-consultation-page .carousel-content h1 {
  font-family: 'Noto Serif TC', serif; font-size: clamp(26px, 6vw, 46px); font-weight: 600; color: #FFFFFF; line-height: 1.4; margin-bottom: 18px; max-width: 640px; margin-left: auto; margin-right: auto; text-shadow: 0 2px 12px rgba(0,0,0,0.3);
}

.lilai-consultation-page .carousel-content p {
  color: rgba(255,255,255,0.85); font-size: 15px; font-weight: 300; max-width: 480px; margin: 0 auto 28px; line-height: 1.9;
}

.lilai-consultation-page .btn-hero {
  display: inline-block; background: var(--white); color: var(--green-deep); font-family: 'Noto Sans TC', sans-serif; font-size: 15px; font-weight: 600; padding: 15px 44px; border-radius: 100px; text-decoration: none; letter-spacing: 0.5px; transition: all 0.25s ease; cursor: pointer; border: none; box-shadow: 0 4px 24px rgba(0,0,0,0.2);
}

.lilai-consultation-page .btn-hero:hover {
  transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.25); background: var(--cream);
}

.lilai-consultation-page .carousel-dots {
  position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); display: flex; gap: 7px; z-index: 20;
}

.lilai-consultation-page .carousel-dot {
  width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); transition: all 0.3s ease; cursor: pointer; border: none; min-width: 6px; min-height: 6px; padding: 0; appearance: none;
}

.lilai-consultation-page .carousel-dot.active {
  background: rgba(255,255,255,0.95); width: 20px; border-radius: 100px;
}

.lilai-consultation-page .carousel-arrow {
  position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 40px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; color: white; font-size: 18px; cursor: pointer; z-index: 20; display: flex; align-items: center; justify-content: center; transition: background 0.2s; -webkit-tap-highlight-color: transparent; min-width: 40px; min-height: 40px; padding: 0; line-height: 1; appearance: none;
}

.lilai-consultation-page .carousel-arrow:hover {
  background: rgba(255,255,255,0.25);
}

.lilai-consultation-page .carousel-arrow.prev {
  left: 16px;
}

.lilai-consultation-page .carousel-arrow.next {
  right: 16px;
}

.lilai-consultation-page .benefits {
  background: var(--ivory); padding: 64px 24px;
}

.lilai-consultation-page .section-label {
  text-align: center; font-size: 11px; font-weight: 600; letter-spacing: 3px; color: var(--green-sage); margin-bottom: 12px; text-transform: uppercase;
}

.lilai-consultation-page .section-title {
  font-family: 'Noto Serif TC', serif; font-size: clamp(22px, 4vw, 30px); font-weight: 600; color: var(--green-deep); text-align: center; margin-bottom: 40px; line-height: 1.5;
}

.lilai-consultation-page .benefits-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; max-width: 900px; margin: 0 auto;
}

.lilai-consultation-page .benefit-card {
  background: var(--white); border: 1px solid var(--gray-line); border-radius: 16px; padding: 28px 24px; transition: all 0.25s ease;
}

.lilai-consultation-page .benefit-card:hover {
  border-color: var(--green-sage); box-shadow: var(--shadow); transform: translateY(-2px);
}

.lilai-consultation-page .benefit-num {
  width: 36px; height: 36px; background: var(--green-mist); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Noto Serif TC', serif; font-weight: 600; font-size: 14px; color: var(--green-deep); margin-bottom: 14px;
}

.lilai-consultation-page .benefit-card h3 {
  font-size: 15px; font-weight: 600; color: var(--green-deep); margin-bottom: 8px; line-height: 1.5;
}

.lilai-consultation-page .benefit-card p {
  font-size: 13px; color: var(--gray-mid); line-height: 1.8; margin-bottom: 0;
}

.lilai-consultation-page .early-bird {
  background: var(--green-mist); border: 1px solid var(--green-pale); border-radius: 16px; padding: 24px 28px; max-width: 700px; margin: 32px auto 0;
}

.lilai-consultation-page .early-bird-content h4 {
  font-size: 15px; font-weight: 600; color: var(--green-deep); margin-bottom: 6px;
}

.lilai-consultation-page .early-bird-content p {
  font-size: 13px; color: var(--gray-mid); line-height: 1.8; margin-bottom: 0;
}

.lilai-consultation-page .price-highlight {
  font-weight: 600; color: var(--green-deep);
}

.lilai-consultation-page .price-original {
  text-decoration: line-through; color: var(--gray-light);
}

.lilai-consultation-page .form-section {
  background: var(--cream); padding: 64px 24px 80px;
}

.lilai-consultation-page .form-container {
  max-width: 680px; margin: 0 auto;
}

.lilai-consultation-page .form-progress {
  display: flex; gap: 8px; margin-bottom: 40px; justify-content: center;
}

.lilai-consultation-page .progress-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--gray-line); transition: all 0.3s ease;
}

.lilai-consultation-page .progress-dot.active {
  background: var(--green-sage); width: 24px; border-radius: 100px;
}

.lilai-consultation-page .progress-dot.done {
  background: var(--green-mid);
}

.lilai-consultation-page .form-step {
  display: none;
}

.lilai-consultation-page .form-step.active {
  display: block; animation: lilaiFadeSlideIn 0.35s ease;
}

@keyframes lilaiFadeSlideIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.lilai-consultation-page .step-header {
  margin-bottom: 32px;
}

.lilai-consultation-page .step-num {
  font-size: 11px; font-weight: 600; letter-spacing: 2px; color: var(--green-sage); text-transform: uppercase; margin-bottom: 8px;
}

.lilai-consultation-page .step-title {
  font-family: 'Noto Serif TC', serif; font-size: clamp(20px, 4vw, 26px); font-weight: 600; color: var(--green-deep); line-height: 1.4; margin-bottom: 8px;
}

.lilai-consultation-page .step-desc {
  font-size: 14px; color: var(--gray-mid); line-height: 1.8; margin-bottom: 0;
}

.lilai-consultation-page .field-group {
  margin-bottom: 24px;
}

.lilai-consultation-page .field-label {
  display: block; font-size: 14px; font-weight: 500; color: var(--gray-text); margin-bottom: 8px; line-height: 1.5;
}

.lilai-consultation-page .field-label .required {
  color: var(--green-sage); margin-left: 4px;
}

.lilai-consultation-page .field-hint {
  font-size: 12px; color: var(--gray-light); font-weight: 300; display: block; margin-top: 3px;
}

.lilai-consultation-page .ig-input-wrapper {
  position: relative; display: flex; align-items: center;
}

.lilai-consultation-page .ig-prefix {
  position: absolute; left: 16px; font-size: 15px; color: var(--green-mid); font-weight: 500; pointer-events: none; z-index: 1;
}

.lilai-consultation-page .ig-input-wrapper .text-input {
  padding-left: 32px;
}

.lilai-consultation-page .text-input {
  width: 100%; padding: 13px 16px; font-family: 'Noto Sans TC', sans-serif; font-size: 15px; font-weight: 300; background: var(--white); border: 1.5px solid var(--gray-line); border-radius: 10px; color: var(--gray-text); transition: all 0.2s ease; outline: none; -webkit-appearance: none; appearance: none; line-height: 1.8; height: auto; max-width: 100%;
}

.lilai-consultation-page .text-input:focus {
  border-color: var(--green-sage); box-shadow: 0 0 0 3px rgba(107,143,78,0.12);
}

.lilai-consultation-page .text-input::placeholder {
  color: var(--gray-light);
}

.lilai-consultation-page textarea.text-input {
  resize: vertical; min-height: 120px; line-height: 1.8;
}

.lilai-consultation-page .options-grid {
  display: flex; flex-direction: column; gap: 8px;
}

.lilai-consultation-page .option-item {
  display: flex; align-items: flex-start; gap: 12px; padding: 13px 16px; background: var(--white); border: 1.5px solid var(--gray-line); border-radius: 10px; cursor: pointer; transition: all 0.2s ease; -webkit-tap-highlight-color: transparent; position: relative; margin: 0; width: 100%;
}

.lilai-consultation-page .option-item:hover {
  border-color: var(--green-sage); background: var(--green-mist);
}

.lilai-consultation-page .option-item.selected {
  border-color: var(--green-mid); background: var(--green-mist);
}

.lilai-consultation-page .option-item input {
  display: block; position: absolute; width: 1px; height: 1px; padding: 0; margin: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}

.lilai-consultation-page .option-custom-check {
  width: 20px; height: 20px; border: 2px solid var(--gray-line); border-radius: 50%; flex-shrink: 0; margin-top: 1px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center;
}

.lilai-consultation-page .option-item.selected .option-custom-check {
  background: var(--green-mid); border-color: var(--green-mid);
}

.lilai-consultation-page .option-item.selected .option-custom-check::after {
  content: ''; width: 8px; height: 8px; background: white; border-radius: 50%;
}

.lilai-consultation-page .option-custom-check.checkbox {
  border-radius: 5px;
}

.lilai-consultation-page .option-item.selected .option-custom-check.checkbox::after {
  content: '✓'; font-size: 12px; color: white; font-weight: 600; line-height: 1; border-radius: 0; background: none; width: auto; height: auto;
}

.lilai-consultation-page .option-text {
  font-size: 14px; font-weight: 300; color: var(--gray-text); line-height: 1.6; padding-top: 1px;
}

.lilai-consultation-page .consent-item {
  display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; background: var(--green-mist); border: 1.5px solid var(--green-pale); border-radius: 10px; cursor: pointer; margin-bottom: 10px; -webkit-tap-highlight-color: transparent;
}

.lilai-consultation-page .consent-item.checked {
  border-color: var(--green-mid); background: #EDF4E4;
}

.lilai-consultation-page .consent-check {
  width: 20px; height: 20px; border: 2px solid var(--green-sage); border-radius: 5px; flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;
}

.lilai-consultation-page .consent-item.checked .consent-check {
  background: var(--green-mid); border-color: var(--green-mid);
}

.lilai-consultation-page .consent-check-mark {
  display: none; color: white; font-size: 12px; font-weight: 700;
}

.lilai-consultation-page .consent-item.checked .consent-check-mark {
  display: block;
}

.lilai-consultation-page .consent-text {
  font-size: 13px; color: var(--gray-mid); line-height: 1.7;
}

.lilai-consultation-page .form-nav {
  display: flex; justify-content: space-between; align-items: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--gray-line);
}

.lilai-consultation-page .btn-back {
  font-family: 'Noto Sans TC', sans-serif; font-size: 14px; font-weight: 400; color: var(--gray-mid); background: none; border: none; cursor: pointer; padding: 8px 0; display: flex; align-items: center; gap: 6px; transition: color 0.2s;
}

.lilai-consultation-page .btn-back:hover {
  color: var(--green-mid);
}

.lilai-consultation-page .btn-next {
  font-family: 'Noto Sans TC', sans-serif; font-size: 15px; font-weight: 500; color: var(--white); background: var(--green-mid); border: none; cursor: pointer; padding: 13px 36px; border-radius: 100px; transition: all 0.25s ease; letter-spacing: 0.5px;
}

.lilai-consultation-page .btn-next:hover {
  background: var(--green-deep); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(45,80,22,0.25);
}

.lilai-consultation-page .btn-submit {
  font-family: 'Noto Sans TC', sans-serif; font-size: 15px; font-weight: 600; color: var(--white); background: var(--green-deep); border: none; cursor: pointer; padding: 16px 48px; border-radius: 100px; transition: all 0.25s ease; letter-spacing: 0.5px; min-width: 180px;
}

.lilai-consultation-page .btn-submit:hover:not(:disabled) {
  transform: translateY(-1px); box-shadow: 0 6px 20px rgba(45,80,22,0.3);
}

.lilai-consultation-page .btn-submit:disabled {
  opacity: 0.6; cursor: not-allowed;
}

.lilai-consultation-page .field-error {
  color: var(--error); font-size: 12px; margin-top: 6px; display: none;
}

.lilai-consultation-page .field-error.show {
  display: block;
}

.lilai-consultation-page .success-screen {
  display: none; text-align: center; padding: 64px 24px; max-width: 560px; margin: 0 auto;
}

.lilai-consultation-page .success-screen.show {
  display: block;
}

.lilai-consultation-page .success-icon {
  width: 72px; height: 72px; background: var(--green-mist); border: 3px solid var(--green-pale); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 32px;
}

.lilai-consultation-page .success-title {
  font-family: 'Noto Serif TC', serif; font-size: 26px; font-weight: 600; color: var(--green-deep); margin-bottom: 16px; line-height: 1.4;
}

.lilai-consultation-page .success-desc {
  font-size: 15px; color: var(--gray-mid); line-height: 1.9; margin-bottom: 24px;
}

.lilai-consultation-page .stage-badge {
  display: inline-block; background: var(--green-mist); border: 1px solid var(--green-pale); color: var(--green-deep); font-weight: 600; font-size: 15px; padding: 10px 28px; border-radius: 100px; margin-bottom: 24px;
}

.lilai-consultation-page .spinner {
  display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: lilaiSpin 0.6s linear infinite; margin-right: 8px; vertical-align: middle;
}

@keyframes lilaiSpin { to { transform: rotate(360deg); } }

.lilai-consultation-page .faq-section {
  background: var(--ivory); padding: 64px 24px;
}

.lilai-consultation-page .faq-container {
  max-width: 680px; margin: 0 auto;
}

.lilai-consultation-page .faq-item {
  border-bottom: 1px solid var(--gray-line); padding: 20px 0;
}

.lilai-consultation-page .faq-question {
  font-size: 15px; font-weight: 500; color: var(--green-deep); cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 12px; line-height: 1.5;
}

.lilai-consultation-page .faq-toggle {
  width: 22px; height: 22px; background: var(--green-mist); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; color: var(--green-mid); transition: transform 0.3s ease; min-width: 22px; min-height: 22px;
}

.lilai-consultation-page .faq-item.open .faq-toggle {
  transform: rotate(45deg);
}

.lilai-consultation-page .faq-answer {
  font-size: 14px; color: var(--gray-mid); line-height: 1.9; max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease;
}

.lilai-consultation-page .faq-item.open .faq-answer {
  max-height: 500px; padding-top: 14px;
}

.lilai-consultation-page .result-summary {
  background: var(--green-mist); border: 1px solid var(--green-pale); border-radius: 14px; padding: 20px 24px; margin: 16px 0; text-align: left; font-size: 15px; color: var(--gray-text); line-height: 1.9;
}

.lilai-consultation-page .result-diagnosis {
  background: var(--white); border: 1px solid var(--gray-line); border-radius: 14px; padding: 20px 24px; margin: 12px 0; text-align: left; font-size: 14px; color: var(--gray-mid); line-height: 1.9; font-style: italic;
}

.lilai-consultation-page .result-nextsteps {
  text-align: left; margin: 16px 0; font-size: 14px; color: var(--gray-text); line-height: 1.9;
}

.lilai-consultation-page .result-nextsteps strong {
  display: block; font-size: 12px; font-weight: 600; color: var(--green-sage); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;
}

.lilai-consultation-page .result-email-hint {
  font-size: 12px; color: var(--gray-light); margin: 16px 0 24px; text-align: center;
}

.lilai-consultation-page .accuracy-check {
  border-top: 1px solid var(--gray-line); padding-top: 24px; margin-top: 8px;
}

.lilai-consultation-page .accuracy-question {
  font-size: 15px; font-weight: 500; color: var(--gray-text); margin-bottom: 14px; text-align: center;
}

.lilai-consultation-page .accuracy-options {
  display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
}

.lilai-consultation-page .accuracy-btn {
  font-family: 'Noto Sans TC', sans-serif; font-size: 14px; font-weight: 400; padding: 10px 22px; border-radius: 100px; border: 1.5px solid var(--gray-line); background: var(--white); color: var(--gray-text); cursor: pointer; transition: all 0.2s ease; -webkit-tap-highlight-color: transparent;
}

.lilai-consultation-page .accuracy-btn:hover {
  border-color: var(--green-sage); background: var(--green-mist);
}

.lilai-consultation-page .accuracy-btn-miss {
  border-color: #E8C4C4; color: #A05050;
}

.lilai-consultation-page .accuracy-btn-miss:hover {
  background: #FDF0F0; border-color: #C08080;
}

.lilai-consultation-page .accuracy-done {
  padding: 16px; text-align: center; font-size: 14px; color: var(--green-mid); font-weight: 500;
}

.lilai-consultation-page .result-cta-box {
  margin: 24px 0 0; padding: 24px; background: var(--white); border: 1.5px solid var(--gray-line); border-radius: 16px;
}

.lilai-consultation-page .result-cta-box-action {
  border-color: var(--green-mid); background: var(--green-mist);
}

.lilai-consultation-page .result-cta-label {
  font-size: 11px; font-weight: 600; letter-spacing: 2px; color: var(--green-sage); text-transform: uppercase; margin-bottom: 16px;
}

.lilai-consultation-page .result-cta-item {
  margin-bottom: 4px;
}

.lilai-consultation-page .result-cta-soft {
  background: var(--cream); border-radius: 10px; padding: 14px 16px;
}

.lilai-consultation-page .result-cta-title {
  font-size: 15px; font-weight: 600; color: var(--green-deep); margin-bottom: 6px;
}

.lilai-consultation-page .result-cta-desc {
  font-size: 13px; color: var(--gray-mid); line-height: 1.8; margin-bottom: 10px;
}

.lilai-consultation-page .result-cta-price {
  font-size: 16px; font-weight: 600; color: var(--green-deep); margin-bottom: 12px;
}

.lilai-consultation-page .result-cta-original {
  font-size: 13px; font-weight: 400; color: var(--gray-light); text-decoration: line-through; margin-left: 6px;
}

.lilai-consultation-page .result-cta-btn {
  display: inline-block; background: var(--green-mid); color: var(--white); font-family: 'Noto Sans TC', sans-serif; font-size: 14px; font-weight: 500; padding: 11px 28px; border-radius: 100px; text-decoration: none; transition: all 0.2s ease; margin-bottom: 4px;
}

.lilai-consultation-page .result-cta-btn:hover {
  background: var(--green-deep); color: var(--white);
}

.lilai-consultation-page .result-cta-btn-secondary {
  background: transparent; color: var(--green-mid); border: 1.5px solid var(--green-mid);
}

.lilai-consultation-page .result-cta-btn-secondary:hover {
  background: var(--green-mist); color: var(--green-mid);
}

.lilai-consultation-page .result-cta-divider {
  text-align: center; font-size: 12px; color: var(--gray-light); margin: 16px 0; position: relative;
}

.lilai-consultation-page .result-cta-divider::before,
.lilai-consultation-page .result-cta-divider::after {
  content: ''; position: absolute; top: 50%; width: 40%; height: 1px; background: var(--gray-line);
}

.lilai-consultation-page .result-cta-divider::before {
  left: 0;
}

.lilai-consultation-page .result-cta-divider::after {
  right: 0;
}

.lilai-consultation-page .options-grid.single-col { flex-direction: column; }
.lilai-consultation-page .option-item:focus-within {
  outline: 2px solid var(--green-sage); outline-offset: 3px;
}
.lilai-consultation-page button:focus-visible,
.lilai-consultation-page a:focus-visible {
  outline: 2px solid var(--green-sage); outline-offset: 3px;
}
.lilai-consultation-page .carousel-arrow:focus-visible,
.lilai-consultation-page .carousel-dot:focus-visible,
.lilai-consultation-page .btn-hero:focus-visible {
  outline-color: var(--white);
}
.lilai-consultation-page .option-text,
.lilai-consultation-page .consent-text,
.lilai-consultation-page .result-summary,
.lilai-consultation-page .result-diagnosis,
.lilai-consultation-page .result-nextsteps { overflow-wrap: anywhere; }
.lilai-consultation-page .form-section { scroll-margin-top: 24px; }

@media (max-width: 782px) {
  .lilai-consultation-page .carousel-hero { height: 680px; min-height: 560px; max-height: none; }
  .lilai-consultation-page .carousel-content { padding: 32px 20px 56px; }
  .lilai-consultation-page .carousel-slide:nth-child(2) img { object-position: center 25%; }
  .lilai-consultation-page .benefits,
  .lilai-consultation-page .form-section,
  .lilai-consultation-page .faq-section { padding-left: 20px; padding-right: 20px; }
  .lilai-consultation-page .benefits-grid { grid-template-columns: 1fr; }
  .lilai-consultation-page .form-nav { flex-direction: column-reverse; gap: 12px; align-items: stretch; }
  .lilai-consultation-page .btn-next,
  .lilai-consultation-page .btn-submit { width: 100%; text-align: center; }
  .lilai-consultation-page .btn-back { justify-content: center; }
}

@media (max-width: 480px) {
  .lilai-consultation-page .carousel-hero { height: 640px; min-height: 540px; }
  .lilai-consultation-page .carousel-arrow { display: none; }
  .lilai-consultation-page .carousel-content h1 { font-size: 28px; }
  .lilai-consultation-page .carousel-content p { font-size: 14px; }
  .lilai-consultation-page .carousel-content .hero-tagline { font-size: 12px; }
  .lilai-consultation-page .btn-hero { width: 100%; max-width: 280px; padding: 14px 24px; }
  .lilai-consultation-page .early-bird { padding: 22px 20px; }
  .lilai-consultation-page .result-summary,
  .lilai-consultation-page .result-diagnosis,
  .lilai-consultation-page .result-cta-box { padding: 18px; }
}

@media (prefers-reduced-motion: reduce) {
  .lilai-consultation-page .carousel-track,
  .lilai-consultation-page .carousel-slide img,
  .lilai-consultation-page .form-step.active {
    animation: none; transition: none;
  }
}

/* WordPress 主題相容層：所有規則仍限定在本頁 */
.lilai-consultation-page h1,
.lilai-consultation-page h2,
.lilai-consultation-page h3,
.lilai-consultation-page h4,
.lilai-consultation-page p {
  margin-block-start: 0;
  margin-block-end: 0;
}

.lilai-consultation-page img {
  max-width: none;
}

.lilai-consultation-page .carousel-dot {
  flex: 0 0 auto;
}

.lilai-consultation-page input,
.lilai-consultation-page textarea {
  margin: 0;
  box-shadow: none;
}

.lilai-consultation-page input:focus,
.lilai-consultation-page textarea:focus {
  outline: none;
}

.lilai-consultation-page .btn-hero,
.lilai-consultation-page .btn-next,
.lilai-consultation-page .btn-submit,
.lilai-consultation-page .btn-back,
.lilai-consultation-page .carousel-arrow,
.lilai-consultation-page .carousel-dot,
.lilai-consultation-page .accuracy-btn {
  line-height: 1.5;
  text-transform: none;
}

.lilai-consultation-page .btn-hero,
.lilai-consultation-page .result-cta-btn {
  color: var(--green-deep);
}

.lilai-consultation-page .btn-next,
.lilai-consultation-page .btn-submit,
.lilai-consultation-page .accuracy-btn,
.lilai-consultation-page .carousel-arrow,
.lilai-consultation-page .carousel-dot {
  -webkit-appearance: none;
}

@media (max-width: 782px) {
  .lilai-consultation-page .carousel-slide img {
    object-position: center center;
  }

  .lilai-consultation-page .carousel-slide:nth-child(2) img {
    object-position: center 25%;
  }
}

--Java Scripts--
// ============================================================
// ⚙️ 設定區 — 修改這裡的變數
// ============================================================

// 【必填】Google Apps Script Web App URL
// 設定步驟請見下方 GAS_SETUP_GUIDE 說明
// 把你的 Web App URL 填入這裡
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx8AxEZ_Dh1IFWqMvTLDGGvUyPyBKrgjzoSlW9wWgyTAAgYH3qUPtm6NBdZ5Mq6Mb0N/exec';

// 【可改】哩來團隊收信 Email（GAS 裡也要設定）
const TEAM_EMAIL = 'lilaiireland@gmail.com';

// 【可改】資料包連結
const RESOURCE_LINK = 'https://linktr.ee/lilaiireland';

// 【可改】說明會優惠
const WEBINAR_DISCOUNT = {
  original_price: 'NT$500',
  discount_price: 'NT$250',
};

// Google Ads 轉換追蹤：只在表單成功送出後觸發一次。
let assessmentConversionSent = false;
function trackAssessmentConversion() {
  if (assessmentConversionSent || typeof window.gtag !== 'function') return;
  window.gtag('event', 'conversion', {
    send_to: 'AW-17610996814/Ynp6CPHkhe4cEM74yc1B',
  });
  assessmentConversionSent = true;
}

// ============================================================
// 分類邏輯
// ============================================================

// 預算設定集中管理；保留目前分數與估算值，待與 GAS 同步更新成本模型。
// usableTuition 是既有區間估值（單位：萬元），不是學生實際可用金額或正式報價。
const BUDGET_RULES = {
  'NT$30 萬以下': { stagePoints: 1, hotPoints: 0, sensitivity: 5, usableTuition: 5 },
  'NT$30–35 萬': { stagePoints: 1, hotPoints: 0, sensitivity: 4, usableTuition: 10 },
  'NT$35–40 萬': { stagePoints: 2, hotPoints: 1, sensitivity: 3, usableTuition: 12.5 },
  'NT$40–45 萬': { stagePoints: 2, hotPoints: 1, sensitivity: 2, usableTuition: 17.5 },
  'NT$45 萬以上': { stagePoints: 2, hotPoints: 1, sensitivity: 1, usableTuition: 20 },
  '還不確定': { stagePoints: 0, hotPoints: 0, sensitivity: 3, usableTuition: null },
};
const ROUTE_BUDGET_RULES = {
  // 暫沿用既有模型及非 25+8 分支；課程長度與費用可行性留待前後端共同更新。
  twentyFivePlus8: { RT01: 10, RT02: 12, RT03: 12, RT04: 15, RT05: 12 },
  otherPlans: { RT01: 2.5, RT02: 3, RT03: 3, RT04: 3.5, RT05: 3 },
  gapPenalty: 1.5,
};
const FIELD_LIMITS = { name: 100, nickname: 100, email: 254, instagram: 100, lineId: 100, 'life-change': 3000 };
const STEP_FIELDS = {
  1: ['name', 'nickname', 'email', 'instagram', 'lineId', 'location'],
  2: ['awareness', 'timeline', 'plan'],
  3: ['workIntention', 'goals', 'englishGoal', 'life-change'],
  4: ['barriers', 'cityPreference', 'budget', 'resources'],
  5: ['webinar', 'consent'],
};

function classifyStage(data) {
  let score = 0;
  if (data.awareness === '已經準備報名，只是在找可信任的代辦或顧問') score += 4;
  else if (data.awareness === '已經蠻確定想去愛爾蘭，但還沒決定方案') score += 3;
  else if (data.awareness === '已經看過一些愛爾蘭語校或 25+8 資訊' || data.awareness === '正在比較愛爾蘭和其他國家') score += 2;

  if (data.timeline === '3 個月內') score += 4;
  else if (data.timeline === '3–6 個月內') score += 3;
  else if (data.timeline === '6–12 個月內') score += 2;

  if (['25+8 打工遊學', '考試準備班／商業英文', '8–12 週語言學習', '2–4 週短期遊學'].includes(data.plan)) score += 2;

  score += BUDGET_RULES[data.budget]?.stagePoints || 0;

  if (score >= 10) return 'action';
  if (score >= 7) return 'ready';
  if (score >= 4) return 'explore';
  return 'watch';
}

function classifyLead(data) {
  const hotTimeline = ['3 個月內', '3–6 個月內'];
  const hotAwareness = ['已經準備報名，只是在找可信任的代辦或顧問', '已經蠻確定想去愛爾蘭，但還沒決定方案'];
  let hotScore = 0;
  if (hotTimeline.includes(data.timeline)) hotScore += 2;
  if (hotAwareness.includes(data.awareness)) hotScore += 2;
  hotScore += BUDGET_RULES[data.budget]?.hotPoints || 0;
  if (['25+8 打工遊學', '考試準備班／商業英文'].includes(data.plan)) hotScore += 1;
  if (hotScore >= 4) return '🔥 Hot Lead';
  // 未達 Hot，但一年內出發或已明確表達報名意向，至少列為 Warm。
  const warmTimeline = ['3 個月內', '3–6 個月內', '6–12 個月內'];
  if (warmTimeline.includes(data.timeline) || hotAwareness.includes(data.awareness)) {
    return '♨️ Warm Lead';
  }
  return '🌱 Nurture Lead';
}

// ============================================================
// 卡點組合診斷句（Q11 多選組合 → 個性化診斷文字）
// ============================================================

const BARRIER_TO_INDEX = {
  '預算不確定': 1,
  '英文不夠好': 2,
  '家人不支持或還沒溝通': 3,
  '不知道能不能在愛爾蘭找到工作': 4,
  '不確定回台灣後是否有幫助': 5,
  '怕孤單或適應不良': 6,
  '不知道愛爾蘭和其他國家怎麼選': 7,
  '不知道自己是不是真的適合出國': 8,
  '害怕做錯決定': 9,
  '還不清楚學校、簽證與住宿流程': 10,
};

function getBlockerDiagnosis(barriersStr) {
  // 把文字陣列轉成數字陣列
  const selected = (barriersStr || '').split('、')
    .map(b => BARRIER_TO_INDEX[b.trim()])
    .filter(Boolean);

  const has = (n) => selected.includes(n);

  // 組合 F｜現實評估型
  if (has(1) && has(4) && has(5)) {
    return "你選的卡點都和「值不值得」有關——預算、打工、回台後的價值。這代表你不是衝動型，你在認真評估這趟旅程的投資報酬。這種思維方式其實很適合做出一個穩固的決定，你需要的是有人用具體數字和真實案例陪你算清楚這筆帳。";
  }

  // 組合 D｜執行焦慮型
  if (has(10) && has(9)) {
    return "你選的卡點都是關於「不知道怎麼走」——這不是你準備不夠，而是你還沒有機會看到整個流程的全貌。一旦有人把步驟從頭到尾走一遍給你看，你會發現每一步其實都沒有想像中複雜。";
  }

  // 組合 E｜自我適合性型
  if (has(8) && has(9)) {
    return "你在問的其實不是「愛爾蘭好不好」，而是「我適不適合出去」——這是一個更深的問題，資訊回答不了它。這個問題需要有人先了解你現在的狀態，才有辦法給你一個真正有用的答案。";
  }

  // 組合 B｜外部阻力型
  if (has(3) && has(9)) {
    return "你在外部有阻力（家人），內部又對自己的決定不夠確定——這個狀況下，光是拿到更多資訊不會讓你更敢走。你需要的是先把自己的理由想清楚，才有辦法跟家人溝通，也才有辦法說服自己。";
  }

  // 組合 A｜控制感型
  if (has(1) && has(9)) {
    return "你同時在擔心預算，又害怕做錯決定——這個組合通常不是錢的問題，而是對未知的控制感還不夠。你需要的不是更多資訊，而是一個能幫你把條件排列清楚、讓你看見決策輪廓的對話。";
  }

  // 組合 C｜資訊過載型
  if (has(7) && has(10)) {
    return "你同時對學校和國家選擇都還不確定——這通常不是你沒有認真找資料，而是選項太多、比較起來又沒有標準，越查越亂。你需要的是先確定一個對你最重要的條件，其他選擇就會自然縮小。這正是我們可以幫你做的事：先問你幾個問題，幫你篩掉不適合的選項。";
  }

  // 組合 G｜孤單 + 適合性型
  if (has(6) && has(8)) {
    return "你在擔心的不只是行程本身，更是「我能不能撐過去」——這其實是一種對自己的誠實，不是弱點。很多後來很適應的學生，出發前也是這樣想的。這個問題適合在諮詢時直接聊，不是靠資訊能解答的。";
  }

  // 組合 H｜英文焦慮 + 適合性型
  if (has(2) && has(8)) {
    return "「英文不夠好」和「不確定自己適不適合」這兩個卡點常常連在一起出現——很多時候，英文只是表面的擔心，底下是「我這樣的程度，人家會不會覺得我格格不入」。這個問題有具體的答案，語校的分級制度就是為了這件事設計的。";
  }

  // 通用版
  return "你選的這些卡點，反映的是你對這個決定的認真程度——卡住不是因為你不適合，而是因為你在意這個選擇。帶著這些問題來諮詢，正是我們可以一起整理的事。";
}

const STAGE_INFO = {
  watch: { name: '觀望型', emoji: '🌱', description: '你目前比較接近「觀望型」。這代表你對愛爾蘭或海外生活有興趣，但可能還在蒐集資訊、比較不同國家，或還沒有明確出發時間。這個階段不用急著報名，最重要的是先看懂自己的目標、預算和真正的卡點。', nextSteps: '先了解愛爾蘭語校、25+8 和短期遊學的差異\n整理預算方向與出發時間\n把你最在意的問題先寫下來，諮詢時更有效率', followUp: '加入 email nurturing 名單，持續寄送實用內容與活動通知', cta: 'explore_pack' },
  explore: { name: '探索型', emoji: '🔍', description: '你目前比較接近「探索型」。這代表你已經不只是隨便看看，而是開始認真思考愛爾蘭是否適合你。你可能正在比較方案、預算、英文程度或未來可能性。這個階段最適合先系統整理資訊，再決定下一步。', nextSteps: '比較短期語校與 25+8 的差異\n釐清預算、出發時間與工作期待\n把你最在意的問題先寫下來，諮詢時更有效率', followUp: '寄送資料包與下一場說明會邀請，並在活動前再次提醒', cta: 'explore_pack' },
  ready: { name: '準備型', emoji: '📋', description: '你目前比較接近「準備型」。這代表你已經進入比較實際的規劃階段，可能需要開始確認學校、課程長度、預算、住宿與出發時間。', nextSteps: '整理你的出發時間與預算上限\n參考愛爾蘭語校自主評估包，或直接預約一對一語校出發諮詢\n確認方案後盡快啟動申請流程，避免錯過開課日期', followUp: '寄送資料包與說明會邀請，重點追蹤，適時邀請一對一諮詢', cta: 'ready_both' },
  action: { name: '行動型', emoji: '🚀', description: '你目前比較接近「行動型」。這代表你可能已經接近決策階段，需要的不只是更多資訊，而是有人協助你確認學校、課程、報價、住宿、文件與時間安排。', nextSteps: '準備目前預算、出發時間與偏好課程\n預約一對一語校出發諮詢，讓哩來幫你比較語校、確認報價與流程\n諮詢費可折抵報名定金（諮詢後 7 日內報名享 NT$3,000 定金優惠），開課後定金全額退還', followUp: '請 24–48 小時內主動聯繫，邀請一對一諮詢', cta: 'action_consult' },
};

// ============================================================
// 輪播
// ============================================================

function getAssessmentContent(data, stage) {
  const info = STAGE_INFO[stage];
  if (data.plan !== '25+8 打工遊學') return info;
  const preparing = stage === 'ready' || stage === 'action';
  const nextSteps = preparing
    ? [
      '整理你的總預算、預計出發時間與課程偏好。',
      'Alex & Arsha 會在 1–2 個工作天內聯繫你，先透過文字確認需求。',
      '了解需求後，我們會免費開放《歐洲漫遊錄》說明會影片與相關資源，協助你確認下一步。'
    ]
    : [
      '整理你對 25+8 最想了解的問題，以及目前的預算與時間想法。',
      'Alex & Arsha 會在 1–2 個工作天內聯繫你，先透過文字了解你的狀況。',
      '了解需求後，我們會免費開放《歐洲漫遊錄》說明會影片與相關資源，讓你依自己的步調評估。'
    ];
  return { ...info, nextSteps: nextSteps.join('\n'), cta: 'twentyfive_plus8' };
}

let currentSlide = 0;
const totalSlides = 3;
let autoPlayTimer = null;

function carouselGoTo(index) {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (index + totalSlides) % totalSlides;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
  document.getElementById('carousel-track').style.transform = `translateX(-${currentSlide * 100}%)`;
  resetAutoPlay();
}

function carouselMove(dir) { carouselGoTo(currentSlide + dir); }

function resetAutoPlay() {
  if (autoPlayTimer) clearInterval(autoPlayTimer);
  autoPlayTimer = setInterval(() => carouselGoTo(currentSlide + 1), 4500);
}

// IG @ 自動補齊
function normalizeIG(input) {
  let val = input.value.replace(/^@+/, '');
  input.value = val;
}

// ============================================================
// 表單狀態
// ============================================================

let currentStep = 1;
let isSubmitting = false;
let hasSubmitted = false;
const formData = {};
const consentState = { consent1: false, consent2: false };

function initLilaiConsultationPage() {
  // 初始化輪播
  resetAutoPlay();

  // 選項互動
  document.querySelectorAll('.option-item input').forEach(input => {
    input.addEventListener('change', function() {
      const item = this.closest('.option-item');

      // 使用 input 原生狀態更新外觀，避免 label 預設行為造成 checkbox 重複切換。
      if (this.type === 'radio') {
        document.querySelectorAll(`input[name="${this.name}"]`).forEach(i => {
          i.closest('.option-item').classList.toggle('selected', i.checked);
        });
        return;
      }

      // 卡點最多選 3 個；第 4 個選項立即還原。
      if (this.name === 'barriers' && this.checked) {
        const checkedCount = document.querySelectorAll('input[name="barriers"]:checked').length;
        if (checkedCount > 3) {
          this.checked = false;
          const hint = document.querySelector('#barriers-options').closest('.field-group').querySelector('.field-hint');
          if (hint) {
            hint.style.color = 'var(--error)';
            hint.textContent = '最多只能選 3 個';
            setTimeout(() => {
              hint.style.color = '';
              hint.textContent = '最多選 3 個';
            }, 2000);
          }
        }
      }

      item.classList.toggle('selected', this.checked);
    });
  });

  document.querySelectorAll('.form-container input, .form-container textarea').forEach(input => {
    const field = input.name || input.id;
    const recheck = () => {
      if (document.getElementById(field + '-error')?.classList.contains('show')) {
        validateField(field);
      }
    };
    input.addEventListener('input', recheck);
    input.addEventListener('change', recheck);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLilaiConsultationPage, { once: true });
} else {
  initLilaiConsultationPage();
}

function toggleConsent(id) {
  consentState[id] = !consentState[id];
  document.getElementById(id + '-item').classList.toggle('checked', consentState[id]);
  if (document.getElementById('consent-error').classList.contains('show')) validateField('consent');
}

function validateField(field) {
  let valid = true;
  let message = '';
  if (Object.prototype.hasOwnProperty.call(FIELD_LIMITS, field)) {
    const rawValue = document.getElementById(field).value;
    const value = rawValue.trim();
    const required = ['name', 'nickname', 'email', 'life-change'].includes(field);
    valid = !required || value.length > 0;
    if (rawValue.length > FIELD_LIMITS[field]) {
      valid = false;
      message = '請控制在 ' + FIELD_LIMITS[field] + ' 字元以內';
    } else if (field === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      valid = false;
    }
  } else if (field === 'consent') {
    valid = consentState.consent1 && consentState.consent2;
  } else {
    const count = document.querySelectorAll(`input[name="${field}"]:checked`).length;
    valid = count > 0;
    if (field === 'barriers' && count > 3) {
      valid = false;
      message = '最多只能選 3 個';
    }
  }
  const error = document.getElementById(field + '-error');
  if (error) {
    if (!error.dataset.defaultMessage) error.dataset.defaultMessage = error.textContent;
    error.textContent = message || error.dataset.defaultMessage;
  }
  setError(field + '-error', !valid);
  return valid;
}

function validateStep(step) {
  // 逐欄驗證，不使用 every 的短路行為，以顯示這一步所有錯誤。
  let valid = true;
  for (const field of STEP_FIELDS[step] || []) {
    if (!validateField(field)) valid = false;
  }
  return valid;
}

function setError(id, show) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('show', show);
}

function nextStep(from) {
  if (isSubmitting || hasSubmitted) return;
  if (!validateStep(from)) {
    document.querySelector(`#step-${from} .field-error.show`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  collectStepData(from);
  goToStep(from + 1);
}

function prevStep(from) {
  if (isSubmitting || hasSubmitted) return;
  goToStep(from - 1);
}

function goToStep(to) {
  document.getElementById(`step-${currentStep}`).classList.remove('active');
  currentStep = to;
  document.getElementById(`step-${currentStep}`).classList.add('active');
  updateProgress();
  window.scrollTo({ top: document.getElementById('form').offsetTop - 20, behavior: 'smooth' });
}

function updateProgress() {
  document.querySelectorAll('.progress-dot').forEach((dot, i) => {
    dot.classList.remove('active', 'done');
    if (i + 1 === currentStep) dot.classList.add('active');
    else if (i + 1 < currentStep) dot.classList.add('done');
  });
}

function collectStepData(step) {
  if (step === 1) {
    formData.name = document.getElementById('name').value.trim();
    formData.nickname = document.getElementById('nickname').value.trim();
    formData.email = document.getElementById('email').value.trim();
    const igRaw = document.getElementById('instagram').value.trim().replace(/^@+/, '');
    formData.instagram = igRaw ? '@' + igRaw : '';
    formData.lineId = document.getElementById('lineId').value.trim();
    formData.location = document.querySelector('input[name="location"]:checked')?.value || '';
  }
  if (step === 2) {
    formData.awareness = document.querySelector('input[name="awareness"]:checked')?.value || '';
    formData.timeline = document.querySelector('input[name="timeline"]:checked')?.value || '';
    formData.plan = document.querySelector('input[name="plan"]:checked')?.value || '';
  }
  if (step === 3) {
    formData.workIntention = document.querySelector('input[name="workIntention"]:checked')?.value || '';
    // 考慮中保留打工推薦方向；W 分數仍依原本規則，不強制升到 4。
    formData.wantWork = ['有，這是我出發的重要原因之一', '還在考慮中'].includes(formData.workIntention);
    formData.goals = [...document.querySelectorAll('input[name="goals"]:checked')].map(i => i.value).join('、');
    formData.englishGoal = document.querySelector('input[name="englishGoal"]:checked')?.value || '';
    formData.lifeChange = document.getElementById('life-change').value.trim();
  }
  if (step === 4) {
    formData.barriers = [...document.querySelectorAll('input[name="barriers"]:checked')].map(i => i.value).join('、');
    formData.cityPreference = document.querySelector('input[name="cityPreference"]:checked')?.value || '';
    formData.budget = document.querySelector('input[name="budget"]:checked')?.value || '';
    formData.resources = [...document.querySelectorAll('input[name="resources"]:checked')].map(i => i.value).join('、');
  }
  if (step === 5) {
    formData.webinar = [...document.querySelectorAll('input[name="webinar"]:checked')].map(i => i.value).join('、');
  }
}

// ============================================================
// SUBMIT — 送到 Google Apps Script
// ============================================================

async function submitForm() {
  if (isSubmitting || hasSubmitted) return;
  for (let step = 1; step <= 5; step++) {
    if (!validateStep(step)) {
      goToStep(step);
      document.querySelector(`#step-${step} .field-error.show`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  }
  for (let step = 1; step <= 5; step++) collectStepData(step);

  const stage = classifyStage(formData);
  const leadQuality = classifyLead(formData);
  const stageInfo = getAssessmentContent(formData, stage);

  // 存入 formData 供 submitAccuracy 使用
  formData.stageName = stageInfo.emoji + ' ' + stageInfo.name;
  formData.leadQuality = leadQuality;

  const payload = {
    // 基本資料
    name: formData.name,
    nickname: formData.nickname,
    email: formData.email,
    instagram: formData.instagram,
    lineId: formData.lineId,
    location: formData.location,
    // 出發狀態
    awareness: formData.awareness,
    timeline: formData.timeline,
    plan: formData.plan,
    workIntention: formData.workIntention,
    wantWork: formData.wantWork,
    englishGoal: formData.englishGoal,
    cityPreference: formData.cityPreference,
    budget: formData.budget,
    // 目標與卡點
    goals: formData.goals,
    lifeChange: formData.lifeChange,
    barriers: formData.barriers,
    resources: formData.resources,
    webinar: formData.webinar,
    // 分類結果
    stage: stage,
    routeResult: getRouteRecommendation(formData),
    blockerDiagnosis: getBlockerDiagnosis(formData.barriers),
    stageName: stageInfo.emoji + ' ' + stageInfo.name,
    stageDescription: stageInfo.description,
    nextSteps: stageInfo.nextSteps,
    followUp: stageInfo.followUp,
    leadQuality: leadQuality,
    // 設定
    teamEmail: TEAM_EMAIL,
    resourceLink: RESOURCE_LINK,
    discountPrice: WEBINAR_DISCOUNT.discount_price,
    originalPrice: WEBINAR_DISCOUNT.original_price,
    // 時間戳記
    submittedAt: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
  };

  const btn = document.getElementById('submit-btn');

isSubmitting = true;
btn.disabled = true;
btn.innerHTML =
  '<span class="spinner"></span>正在送出資料，請稍等……';

try {
  let success = false;

  if (
    GAS_ENDPOINT !==
    'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL'
  ) {
    await fetch(GAS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
    });

    success = true;

  } else {
    // Demo mode
    await new Promise(
      resolve => setTimeout(resolve, 1200)
    );

    success = true;
  }

  if (success) {
    // GAS 已完成：
    // 1. 驗證資料
    // 2. 寫入 Sheet
    // 3. 加入背景 Queue
    //
    // PDF / Email / Calendar 會在背景執行

    trackAssessmentConversion();

    hasSubmitted = true;

    document
      .getElementById('step-5')
      .classList.remove('active');

    document
      .getElementById('progress-dots')
      .style.display = 'none';

    const sc =
      document.getElementById('success-screen');

    sc.classList.add('show');
    sc.style.display = 'block';


      // ── 即時診斷結果 ──────────────────────────────
      // 1. 階段 badge
      document.getElementById('success-stage-badge').textContent =
        stageInfo.emoji + ' 你目前是「' + stageInfo.name + '」';

      // 2. 摘要（核心描述）
      document.getElementById('result-summary').innerHTML =
        stageInfo.description;

      // 3. 卡點診斷句
      const diagnosis = getBlockerDiagnosis(formData.barriers);
      document.getElementById('result-diagnosis').innerHTML = diagnosis;

      // 4. 下一步 + 時間錨點
      const steps = (stageInfo.nextSteps || '')
        .split('\n')
        .filter(s => s.trim())
        .map(s => `<div style="padding: 4px 0">${s}</div>`)
        .join('');
      const timeAnchor = getTimeAnchor(formData.timeline || '', formData.plan);
      const timeAnchorHtml = timeAnchor
        ? `<div style="margin-top:14px; padding: 12px 16px; background: var(--cream-dark); border-radius: 10px; font-size:13px; color: var(--green-deep); font-weight:500;">⏰ ${timeAnchor}</div>`
        : '';
      document.getElementById('result-nextsteps').innerHTML =
        '<strong>建議你的下一步</strong>' + steps + timeAnchorHtml;

      // CTA 區塊（25+8 有專屬 CTA）
      const ctaContainer = document.getElementById('result-cta');
      if (ctaContainer) {
        ctaContainer.innerHTML = getStageCTAHtml(stageInfo.cta || '');
      }

      window.scrollTo({ top: document.getElementById('form').offsetTop - 20, behavior: 'smooth' });
    }
  } catch (err) {
    console.error(err);
    btn.disabled = false;
    btn.innerHTML = '取得我的出發評估 🍀';
    alert('送出時遇到問題，請稍後再試，或直接私訊哩來愛爾蘭 IG。');
  } finally {
    isSubmitting = false;
  }
}

// ============================================================
// 信任信號收集 — 準確度回饋
// ============================================================

function submitAccuracy(answer) {
  // 隱藏選項，顯示感謝
  document.getElementById('accuracy-check').style.display = 'none';
  const doneEl = document.getElementById('accuracy-done');
  const msgEl = document.getElementById('accuracy-done-msg');
  doneEl.style.display = 'block';

  if (answer === '很準') {
    msgEl.textContent = '太好了！很高興這個評估對你有幫助 🍀';
  } else if (answer === '還好') {
    msgEl.textContent = '謝謝你的回饋，我們會繼續優化評估邏輯！';
  } else {
    msgEl.textContent = '謝謝你告訴我們。我們今天會主動聯繫你，幫你重新確認狀態。';
  }

  // 送回饋到 GAS
  const feedbackPayload = {
    type: 'accuracy_feedback',
    name: formData.name,
    nickname: formData.nickname,
    email: formData.email,
    stageName: formData.stageName,
    leadQuality: formData.leadQuality,
    accuracyAnswer: answer,
    submittedAt: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
  };

  // 如果不準，在 payload 裡標記需要立即聯繫
  if (answer === '不太準') {
    feedbackPayload.urgentFollowUp = true;
  }

  if (GAS_ENDPOINT !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    fetch(GAS_ENDPOINT, {
  method: 'POST',
  mode: 'no-cors',
  headers: {
    'Content-Type': 'text/plain;charset=utf-8'
  },
  body: JSON.stringify(feedbackPayload),
}).catch(err => {
  console.log(
    'Feedback send error:',
    err
  );
});
  }
}

// ============================================================
// 時間錨點文字（根據 Q7 出發時間）
// ============================================================
function getTimeAnchor(timeline, plan) {
  if (plan === '25+8 打工遊學') {
    const messages = {
      '3 個月內': '出發時間較近，請先整理預算與預計開課日期，團隊聯繫時可一起確認準備時程。',
      '3–6 個月內': '可以先整理預算與出發月份，團隊聯繫時再一起確認課程及準備時程。',
      '6–12 個月內': '你還有時間比較方向，可先列出在意的條件，再透過影片與團隊聯繫逐步確認。',
      '一年以上': '時間較充裕，可以先了解 25+8 的安排，再逐步整理預算與出發方向。',
      '還不確定': '可以先從自己的目標與預算開始，團隊聯繫時再一起整理適合的出發時間。'
    };
    return messages[timeline] || '';
  }
  const map = {
    '3 個月內':    '你的出發時間很近，建議這 2–4 週就預約諮詢確認方案。',
    '3–6 個月內':  '如果要在 6 個月內出發，申請流程需要時間，現在開始剛好，也是適合購買機票的時候。',
    '6–12 個月內': '你還有時間，但語校熱門時段和住宿容易提早額滿，建議先了解方向，到時再確認細節。',
    '一年以上':    '時間充裕，但方向越早確認，後面準備越從容。',
    '還不確定':    '如果目標是暑期 6–9 月抵達，語校名額跟住宿很容易提早額滿，建議及早規劃。',
  };
  return map[timeline] || '';
}

// CTA 連結
const CTA_LINKS = {
  selfPack: 'https://portaly.cc/lilaiirelandecommerce/product/Ii9OfwrRh1x4YdhwO09D',
  consult:  'https://lilaiireland.com/language-school-signup',
};

function getStageCTAHtml(ctaType) {
  if (ctaType === 'explore_pack') {
    return '<div class="result-cta-box">' +
      '<p class="result-cta-label">✦ 你可能適合的下一步</p>' +
      '<div class="result-cta-item">' +
        '<div class="result-cta-title">愛爾蘭自主評估包</div>' +
        '<div class="result-cta-desc">適合想先自己研究清楚的你。包含說明會重播與完整整理資料，系統了解語校、25+8、預算與生活準備。</div>' +
        '<div class="result-cta-price">NT$400 <span class="result-cta-original">NT$500</span></div>' +
        '<a href="' + CTA_LINKS.selfPack + '" target="_blank" class="result-cta-btn">了解自主評估包</a>' +
      '</div>' +
      '<div class="result-cta-divider">或</div>' +
      '<div class="result-cta-item result-cta-soft">' +
        '<div class="result-cta-title">📬 優先收到說明會通知</div>' +
        '<div class="result-cta-desc">完成出發計畫後，你已獲得下一場說明會的優先邀請資格。說明會基本上免費參加，開放報名時我們會第一時間通知你。</div>' +
      '</div>' +
    '</div>';
  }
  if (ctaType === 'ready_both') {
    return '<div class="result-cta-box">' +
      '<p class="result-cta-label">✦ 你可能適合的下一步</p>' +
      '<div class="result-cta-item">' +
        '<div class="result-cta-title">一對一語校出發諮詢</div>' +
        '<div class="result-cta-desc">適合已經準備好談方案的你。針對你的預算、出發時間與目標，直接幫你比較語校、確認課程與報價。成功報名語校的學生，諮詢費可折抵定金，開課後退還，實際上不需要額外支付諮詢費用。</div>' +
        '<div class="result-cta-price">NT$800 <span class="result-cta-original">NT$1,000</span></div>' +
        '<a href="' + CTA_LINKS.consult + '" target="_blank" class="result-cta-btn">預約一對一諮詢</a>' +
      '</div>' +
      '<div class="result-cta-divider">或者先看看</div>' +
      '<div class="result-cta-item">' +
        '<div class="result-cta-title">愛爾蘭自主評估包</div>' +
        '<div class="result-cta-desc">如果你還想先自己研究，這份資料包可以讓你更有方向再來諮詢。</div>' +
        '<div class="result-cta-price">NT$400 <span class="result-cta-original">NT$500</span></div>' +
        '<a href="' + CTA_LINKS.selfPack + '" target="_blank" class="result-cta-btn result-cta-btn-secondary">了解自主評估包</a>' +
      '</div>' +
    '</div>';
  }
  if (ctaType === 'action_consult') {
    return '<div class="result-cta-box result-cta-box-action">' +
      '<p class="result-cta-label">✦ 你可能適合的下一步</p>' +
      '<div class="result-cta-item">' +
        '<div class="result-cta-title">一對一語校出發諮詢</div>' +
        '<div class="result-cta-desc">適合確定要報語校的你。諮詢費可折抵報名定金（諮詢後 7 日內報名享 NT$3,000 定金優惠），開課後定金全額退還。也就是說，成功報名語校的學生，實際上不需要額外支付諮詢費用。</div>' +
        '<div class="result-cta-price">NT$800 <span class="result-cta-original">NT$1,000</span></div>' +
        '<a href="' + CTA_LINKS.consult + '" target="_blank" class="result-cta-btn">立即預約一對一諮詢</a>' +
      '</div>' +
    '</div>';
  }
  if (ctaType === 'twentyfive_plus8') {
    return '<div class="result-cta-box result-cta-box-action">' +
      '<p class="result-cta-label">✦ 你的下一步</p>' +
      '<div class="result-cta-item">' +
        '<div class="result-cta-title">我們會在 1–2 個工作天內聯繫你 👋</div>' +
        '<div class="result-cta-desc">Alex & Arsha 會先透過文字跟你聊一下你的狀況和需求，之後免費開放《歐洲漫遊錄》說明會影片和相關資源給你。</div>' +
        '<div class="result-cta-desc" style="margin-top:8px; font-size:12px; color:var(--green-sage)">如果你有留 IG 或 Line，我們會直接從那邊找你聊，溝通更方便。</div>' +
      '</div>' +
    '</div>';
  }
  return '';
}

// ============================================================
// 五大航線 Scoring Algorithm（RT06 停用，保留欄位相容性）
// ============================================================

// Step 1：從表單資料計算五個 Preference Dimensions（各 1–5）
function calcDimensions(fd) {
  // B：預算敏感度（預算越低 → B 越高）
  const B = BUDGET_RULES[fd.budget]?.sensitivity || 3;
  const F = 6 - B; // Budget Flexibility

  // E：英文提升優先度
  let E = 2;
  if (fd.englishGoal === '最主要目的') E = 5;
  else if (fd.englishGoal === '重要但非唯一') E = 3;
  else if (fd.englishGoal === '非首要目標') E = 1;
  else {
    if (fd.goals && fd.goals.includes('提升英文能力')) E += 2;
    if ((fd.plan || '').includes('語言學習')) E += 1;
  }
  E = Math.max(1, Math.min(5, E));

  // W：工作/職涯需求
  let W = 1;
  if (fd.plan === '25+8 打工遊學') W += 3;
  if (fd.goals && fd.goals.includes('累積海外職涯')) W += 1;
  if (fd.workIntention === '有，這是我出發的重要原因之一') W = Math.max(W, 4);
  else if (fd.workIntention === '沒有，我以學習和體驗為主') W = 1;
  else if (fd.wantWork === false) W = 1;
  W = Math.max(1, Math.min(5, W));

  // C：非都柏林接受度（偏好非都柏林最高，無偏好次之）
  let C = 3;
  if (fd.cityPreference === '傾向非都柏林城市') C = 5;
  else if (fd.cityPreference === '沒有特別偏好') C = 4;
  else if (fd.cityPreference === '都柏林為主，願意考慮其他城市') C = 2;
  else if (fd.cityPreference === '想待在都柏林') C = 1;
  // 缺少答案時保留中性值 3；正常送出流程會要求完成這一題。
  C = Math.max(1, Math.min(5, C));

  // L：生活體驗重視度
  let L = 2;
  if (fd.goals && fd.goals.includes('體驗歐洲生活')) L += 1;
  if (fd.goals && fd.goals.includes('想拓展人生經驗')) L += 1;
  if (fd.goals && fd.goals.includes('累積海外職涯')) L += 0.5;
  L = Math.max(1, Math.min(5, L));

  return { B, E, W, C, L, F };
}

// Step 2：計算各航線分數
function calcRouteScores(fd, dims) {
  const { B, E, W, C, L, F } = dims;
  const is25plus8 = fd.plan === '25+8 打工遊學';
  const explicitlyDoesNotWantWork = fd.wantWork === false;

  const scores = {};

  // RT05 城市換軌線：明確有非都柏林興趣 → 直接拉到主推薦等級
  const cityBoost = fd.cityPreference === '傾向非都柏林城市' ? 1.5
    : fd.cityPreference === '沒有特別偏好' ? 0.6
    : fd.cityPreference === '都柏林為主，願意考慮其他城市' ? 0.3
    : 0; // 想待在都柏林 → 無加成

  // RT01 小資起飛線
  scores.RT01 = 0.75 * B + 0.15 * W + 0.10 * C;

  // RT02 打工開局線
  scores.RT02 = 0.50 * W + 0.20 * L + 0.20 * E + 0.10 * B;
  if (is25plus8) scores.RT02 += 0.4;
  if (explicitlyDoesNotWantWork) scores.RT02 -= 0.7;

  // RT03 英文進化線
  scores.RT03 = 0.60 * E + 0.15 * L + 0.15 * F + 0.10 * W;
  if (fd.plan === '考試準備班／商業英文') scores.RT03 += 0.8;

  // RT04 質感升級線
  scores.RT04 = 0.45 * F + 0.30 * L + 0.25 * E;

  // RT05 城市換軌線
  scores.RT05 = 0.55 * C + 0.25 * B + 0.20 * L + cityBoost;

  // RT06 不啟用
  scores.RT06 = -999;

  // Cap at 5.0
  for (const k in scores) {
    if (scores[k] !== -999) scores[k] = Math.min(5.0, scores[k]);
  }

  // 預算不足：暫保留舊模型效果，估算設定集中於 ROUTE_BUDGET_RULES。
  const usable = BUDGET_RULES[fd.budget]?.usableTuition;

  const budgetGap = {};
  if (usable !== null && usable !== undefined) {
    const minMap = is25plus8 ? ROUTE_BUDGET_RULES.twentyFivePlus8 : ROUTE_BUDGET_RULES.otherPlans;
    for (const rt in minMap) {
      if (usable < minMap[rt]) {
        budgetGap[rt] = true;
        scores[rt] = Math.max(0, scores[rt] - ROUTE_BUDGET_RULES.gapPenalty); // 預算不足時大幅降分
      }
    }
  }

  return { scores, budgetGap, usable };
}

// Step 3：排名並輸出推薦結果
function getRouteRecommendation(fd) {
  const dims = calcDimensions(fd);
  const { scores, budgetGap, usable } = calcRouteScores(fd, dims);

  const ROUTE_NAMES = {
    RT01: '小資起飛線',
    RT02: '打工開局線',
    RT03: '英文進化線',
    RT04: '質感升級線',
    RT05: '城市換軌線',
  };

  // 排序（RT06 排除）
  const ranked = Object.keys(ROUTE_NAMES)
    .map(rt => ({ rt, score: scores[rt] }))
    .sort((a, b) => b.score - a.score);

  const primary = ranked[0];
  const secondary = ranked[1];

  // Match labels
  function getMatchLabel(score) {
    if (score >= 4.20) return '高匹配';
    if (score >= 3.50) return '中高匹配';
    if (score >= 2.80) return '可考慮';
    return '目前非優先';
  }

  // 是否推薦第二條
  const showSecondary = secondary.score >= 3.5;

  // 預算不夠時不強推
  const primaryBudgetGap = budgetGap[primary.rt];

  return {
    dims,
    scores,
    primary: {
      rt: primary.rt,
      name: ROUTE_NAMES[primary.rt],
      score: primary.score,
      matchLabel: getMatchLabel(primary.score),
      hasBudgetGap: !!primaryBudgetGap,
    },
    secondary: showSecondary ? {
      rt: secondary.rt,
      name: ROUTE_NAMES[secondary.rt],
      score: secondary.score,
      matchLabel: getMatchLabel(secondary.score),
      hasBudgetGap: !!budgetGap[secondary.rt],
    } : null,
    isSimilar: Math.abs(primary.score - secondary.score) <= 0.25,
    budgetUnclear: fd.budget === '還不確定',
  };
}

function toggleFaq(questionEl) {
  questionEl.closest('.faq-item').classList.toggle('open');
}
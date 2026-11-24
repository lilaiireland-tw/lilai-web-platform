// Non-secret support functions appended to the reviewed local GAS copy; not a deployment artifact.
function assessmentCell(value) {
  return typeof value === 'string' && /^[\s\uFEFF]*[=+@-]/.test(value) ? "'" + value : value;
}

function assessmentHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
}

function assessmentInput(input) {
  const v1 = input.contractVersion != null;
  if (v1 && input.contractVersion !== 'free-assessment.v1') throw new Error('Unsupported contract');
  const data = {};
  const fields = ['name','nickname','email','instagram','lineId','location','awareness','timeline','plan','budget','goals','lifeChange','barriers','resources','webinar','workIntention','englishGoal','cityPreference','housingFlex','workRealism','langAdapt','lifestyleFlex'];
  fields.forEach(key => {
    if (input[key] != null && typeof input[key] !== 'string') throw new Error('Invalid ' + key);
    data[key] = (input[key] || '').trim();
    const limit = key === 'email' ? 254 : key === 'lifeChange' ? 3000 : 1000;
    if (data[key].length > (['name','nickname','instagram','lineId'].includes(key) ? 100 : limit)) throw new Error('Too long: ' + key);
  });
  if (!data.name || (v1 && !data.nickname) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new Error('Invalid identity');
  if (v1) {
    ['location','awareness','timeline','plan','budget','workIntention','englishGoal','cityPreference'].forEach(key => {
      if (!ASSESSMENT_OPTIONS[key].includes(data[key])) throw new Error('Invalid ' + key);
    });
    ['goals','barriers','resources','webinar'].forEach(key => {
      // Some existing labels contain 、, so match complete labels before separators.
      const values = [];
      let rest = data[key];
      const labels = ASSESSMENT_OPTIONS[key].slice().sort((a,b) => b.length - a.length);
      while (rest) {
        const label = labels.find(value => rest === value || rest.startsWith(value + '、'));
        if (!label) throw new Error('Invalid ' + key);
        if (rest === label + '、') throw new Error('Invalid ' + key);
        values.push(label);
        rest = rest.slice(label.length + 1);
      }
      if ((key !== 'webinar' && !values.length) || new Set(values).size !== values.length ||
          (key === 'barriers' && values.length > 3) || values.some(value => !ASSESSMENT_OPTIONS[key].includes(value))) throw new Error('Invalid ' + key);
    });
  }
  ['contactConsent','marketingConsent'].forEach(key => {
    if (typeof input[key] !== 'boolean' && (v1 || input[key] != null)) throw new Error('Invalid ' + key);
    data[key] = typeof input[key] === 'boolean' ? input[key] : null;
  });
  const contract = {privacyNoticeVersion:'agreement-reference.v1', consentTextVersion:'free-assessment-consent.v1', consentSource:'free_assessment'};
  Object.keys(contract).forEach(key => {
    if (v1 && input[key] !== contract[key]) throw new Error('Invalid ' + key);
    data[key] = v1 ? contract[key] : null;
  });
  data.contractVersion = v1 ? 'free-assessment.v1' : 'legacy';
  if (input.submissionId != null && (typeof input.submissionId !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(input.submissionId))) throw new Error('Invalid submissionId');
  if (v1 && !input.submissionId) throw new Error('Missing submissionId');
  data.submissionId = input.submissionId || Utilities.getUuid();
  const channels = input.discoveryChannels == null && !v1 ? null : input.discoveryChannels;
  const allowed = ASSESSMENT_OPTIONS.discoveryChannels;
  if (v1 && channels === null) throw new Error('Invalid discoveryChannels');
  if (channels !== null && (!Array.isArray(channels) || channels.length > allowed.length || new Set(channels).size !== channels.length ||
      channels.some(value => !allowed.includes(value)) || (channels.includes('unknown') && channels.length !== 1))) throw new Error('Invalid discoveryChannels');
  data.discoveryChannels = channels === null ? null : allowed.filter(value => channels.includes(value));
  if ((v1 || input.discoveryOther != null) && typeof input.discoveryOther !== 'string') throw new Error('Invalid discoveryOther');
  data.discoveryOther = (input.discoveryOther || '').trim();
  if (data.discoveryOther.length > 200 || (data.discoveryOther && !(channels || []).includes('other'))) throw new Error('Invalid discoveryOther');
  data.dcardExposure = input.dcardExposure ?? null;
  if (v1 && input.dcardExposure === undefined) throw new Error('Missing dcardExposure');
  if (data.dcardExposure !== null && !ASSESSMENT_OPTIONS.dcardExposure.includes(data.dcardExposure)) throw new Error('Invalid dcardExposure');
  data.receivedAt = new Date().toISOString();
  data.consentTimestamp = v1 ? data.receivedAt : null;
  if (!v1 && typeof input.wantWork === 'boolean') data.wantWork = input.wantWork;
  return data;
}

function assessmentRecords(sheet) {
  sheet = sheet || SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('填表資料');
  if (!sheet || sheet.getLastRow() < 2) return [];
  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();
  return rows.map((row, index) => ({sheet:sheet, row:index + 2, headers:headers,
    values:Object.fromEntries(headers.map((key, i) => [key, row[i]]))}));
}

function assessmentConsent(data, purpose) {
  try {
    const key = purpose === 'marketing' ? 'marketingConsent' : 'contactConsent';
    const withdrawn = purpose === 'marketing' ? 'marketingUnsubscribedAt' : 'contactWithdrawnAt';
    // #62 has no trusted re-grant path; invalid original consent cannot become a grant.
    if (!data || !data.submissionId || data.contractVersion !== 'free-assessment.v1' || data[key] !== true) return false;
    if (PropertiesService.getScriptProperties().getProperty('CONSULT_APPROVED_POLICY_VERSION') !== 'agreement-reference.v1') return false;
    const email = String(data.email || '').trim().toLowerCase();
    if (!email) return false;
    let record, matches = 0;
    for (const item of assessmentRecords()) {
      const values = item.values;
      if (String(values.Email || '').trim().toLowerCase() === email &&
          (values[withdrawn] || values[key + 'State'] === 'withdrawn')) return false;
      if (values.submissionId === data.submissionId) { record = values; matches++; }
    }
    return matches === 1 && String(record.Email || '').trim().toLowerCase() === email &&
      record[key] === true && record[key + 'State'] === 'granted' && !record[withdrawn] &&
      record.contractVersion === 'free-assessment.v1' && !!record.consentTimestamp &&
      record.privacyNoticeVersion === 'agreement-reference.v1' && record.consentTextVersion === 'free-assessment-consent.v1' &&
      record.consentSource === 'free_assessment';
  } catch (error) { return false; }
}

function assessmentNewContact(data, sheet) {
  try {
    return data.contractVersion === 'free-assessment.v1' && data.contactConsent === true &&
      PropertiesService.getScriptProperties().getProperty('CONSULT_APPROVED_POLICY_VERSION') === 'agreement-reference.v1' &&
      !assessmentRecords(sheet).some(record => String(record.values.Email || '').trim().toLowerCase() === data.email.toLowerCase() &&
        (record.values.contactWithdrawnAt || record.values.contactConsentState === 'withdrawn'));
  } catch (error) { return false; }
}

// Only trusted server/operator callers may withdraw; no grant/re-subscribe operation in #62.
function withdrawAssessmentConsent(submissionId, purpose) {
  if (!['contact','marketing'].includes(purpose)) throw new Error('Invalid purpose');
  const records = assessmentRecords().filter(record => record.values.submissionId === submissionId);
  if (records.length !== 1) throw new Error('Unknown submission');
  const record = records[0];
  const state = purpose === 'contact' ? 'contactConsentState' : 'marketingConsentState';
  const timestamp = purpose === 'contact' ? 'contactWithdrawnAt' : 'marketingUnsubscribedAt';
  if (![state,timestamp].every(key => record.headers.includes(key))) throw new Error('Missing consent schema');
  record.sheet.getRange(record.row, record.headers.indexOf(state) + 1).setValue('withdrawn');
  if (!record.values[timestamp]) record.sheet.getRange(record.row, record.headers.indexOf(timestamp) + 1).setValue(new Date().toISOString());
}

function assessmentOriginal(input) {
  if (!input.submissionId || !input.jobId) throw new Error('Missing correlation');
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(JOB_QUEUE_SHEET);
  const rows = sheet && sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1,8).getValues() : [];
  const matches = rows.filter(row => row[0] === input.jobId);
  if (matches.length !== 1) throw new Error('Unknown job');
  const original = JSON.parse(matches[0][4]);
  if (original.submissionId !== input.submissionId) throw new Error('Invalid correlation');
  return original;
}

function assessmentCredential(data) {
  const secret = PropertiesService.getScriptProperties().getProperty('CONSULT_GAS_CREDENTIAL');
  if (!secret || secret.length < 32 || !data || data._serverCredential !== secret) throw new Error('Unauthorized');
  delete data._serverCredential;
}

function assessmentFeedbackProof(data) {
  const secret = PropertiesService.getScriptProperties().getProperty('CONSULT_GAS_CREDENTIAL');
  const bytes = Utilities.computeHmacSha256Signature('feedback.v1|' + data.submissionId + '|' + data.jobId, secret);
  const expected = Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '');
  if (!data._feedbackProof || data._feedbackProof !== expected) throw new Error('Unauthorized feedback');
}

function assessmentFollowUpDate(now) {
  const day = Utilities.formatDate(now || new Date(), 'Asia/Taipei', 'yyyy-MM-dd');
  const date = new Date(day + 'T00:00:00+08:00');
  do { date.setUTCDate(date.getUTCDate() + 1); }
  while ([0,6].includes(new Date(date.getTime() + 8*3600000).getUTCDay()));
  return date;
}

function assessmentFollowUpText(allowed) {
  return allowed ? '若授權仍有效且未撤回，我們會在 1–2 個工作天內聯繫你（台灣週一至週五）。' : '僅評估／不主動聯繫；可自行回信或 LINE 免費索取重播，觀看後預約免費一對一諮詢。';
}

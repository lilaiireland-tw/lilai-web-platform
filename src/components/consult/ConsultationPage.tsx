"use client";

import { useEffect, useRef, useState } from "react";
import {
  classifyLead,
  classifyStage,
  getAssessmentContent,
  getBlockerDiagnosis,
  getRouteRecommendation,
  getTimeAnchor,
  type AssessmentData,
} from "@/lib/consult/assessment";
import {
  trackConsultationConversion,
  type GoogleAdsConversionGuard,
} from "@/lib/analytics/google-ads";
import {
  runAccuracyFeedbackSubmission,
  runConsultationSubmission,
  type ConsultationSubmissionGate,
} from "@/lib/consult/submission";
import { benefits, faqs, heroImages, optionLabels, options } from "./consult-content";
import styles from "./consultation.module.css";

const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbx8AxEZ_Dh1IFWqMvTLDGGvUyPyBKrgjzoSlW9wWgyTAAgYH3qUPtm6NBdZ5Mq6Mb0N/exec";
const TEAM_EMAIL = "lilaiireland@gmail.com";
const RESOURCE_LINK = "https://linktr.ee/lilaiireland";
const WEBINAR_DISCOUNT = { original_price: "NT$500", discount_price: "NT$250" };
const CTA_LINKS = {
  selfPack: "https://portaly.cc/lilaiirelandecommerce/product/Ii9OfwrRh1x4YdhwO09D",
  consult: "https://lilaiireland.com/language-school-signup",
};

type ChoiceName = keyof typeof options;
type FormValues = {
  name: string; nickname: string; email: string; instagram: string; lineId: string;
  location: string; awareness: string; timeline: string; plan: string;
  workIntention: string; goals: string[]; englishGoal: string; lifeChange: string;
  barriers: string[]; cityPreference: string; budget: string; resources: string[];
  webinar: string[]; consent1: boolean; consent2: boolean;
};

const initialValues: FormValues = {
  name: "", nickname: "", email: "", instagram: "", lineId: "", location: "",
  awareness: "", timeline: "", plan: "", workIntention: "", goals: [],
  englishGoal: "", lifeChange: "", barriers: [], cityPreference: "", budget: "",
  resources: [], webinar: [], consent1: false, consent2: false,
};

const stepFields: Record<number, (keyof FormValues | "consent")[]> = {
  1: ["name", "nickname", "email", "instagram", "lineId", "location"],
  2: ["awareness", "timeline", "plan"],
  3: ["workIntention", "goals", "englishGoal", "lifeChange"],
  4: ["barriers", "cityPreference", "budget", "resources"],
  5: ["webinar", "consent"],
};

const errorCopy: Record<string, string> = {
  name: "請填寫姓名", nickname: "請填寫暱稱", email: "請填寫正確的 Email 格式",
  instagram: "Instagram 帳號請控制在 100 字元以內", lineId: "LINE ID 請控制在 100 字元以內",
  location: "請選擇所在地", awareness: "請選擇了解程度", timeline: "請選擇出發時間",
  plan: "請選擇感興趣的方案", workIntention: "請選擇一個選項", goals: "請至少選擇一個選項",
  englishGoal: "請選擇一個選項", lifeChange: "請填寫這個問題", barriers: "請至少選擇一個選項",
  cityPreference: "請選擇一個選項", budget: "請選擇預算區間", resources: "請至少選擇一個選項",
  webinar: "請至少選擇一個選項", consent: "請同意以上兩項條款才能完成送出",
};

const fieldLimits: Partial<Record<keyof FormValues, number>> = {
  name: 100, nickname: 100, email: 254, instagram: 100, lineId: 100, lifeChange: 3000,
};

function cx(...names: (string | false | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

function FieldError({ field, errors, message }: { field: string; errors: Set<string>; message?: string }) {
  return <span id={`${field}-error`} className={cx(styles.fieldError, errors.has(field) && styles.show)}>{message || errorCopy[field]}</span>;
}

function OptionGroup({
  name, values, value, onChange, multiple = false, singleColumn = false,
}: {
  name: ChoiceName;
  values: readonly string[];
  value: string | string[];
  onChange: (value: string) => void;
  multiple?: boolean;
  singleColumn?: boolean;
}) {
  const selected = (option: string) => Array.isArray(value) ? value.includes(option) : value === option;
  return (
    <div className={cx(styles.optionsGrid, singleColumn && styles.singleCol)} id={`${name}-options`}>
      {values.map(option => (
        <label key={option} className={cx(styles.optionItem, selected(option) && styles.selected)} data-value={option}>
          <input type={multiple ? "checkbox" : "radio"} name={name} value={option} checked={selected(option)} onChange={() => onChange(option)} />
          <span className={cx(styles.optionCustomCheck, multiple && styles.checkbox)} />
          <span className={styles.optionText}>{optionLabels[name]?.[option] || option}</span>
        </label>
      ))}
    </div>
  );
}

function StageCta({ type }: { type: string }) {
  if (type === "twentyfive_plus8") return (
    <div className={cx(styles.resultCtaBox, styles.resultCtaBoxAction)}>
      <p className={styles.resultCtaLabel}>✦ 你的下一步</p>
      <div className={styles.resultCtaItem}>
        <div className={styles.resultCtaTitle}>我們會在 1–2 個工作天內聯繫你 👋</div>
        <div className={styles.resultCtaDesc}>Alex &amp; Arsha 會先透過文字跟你聊一下你的狀況和需求，之後免費開放《歐洲漫遊錄》說明會影片和相關資源給你。</div>
        <div className={cx(styles.resultCtaDesc, styles.contactHint)}>如果你有留 IG 或 Line，我們會直接從那邊找你聊，溝通更方便。</div>
      </div>
    </div>
  );
  if (type === "action_consult") return (
    <div className={cx(styles.resultCtaBox, styles.resultCtaBoxAction)}>
      <p className={styles.resultCtaLabel}>✦ 你可能適合的下一步</p>
      <div className={styles.resultCtaItem}>
        <div className={styles.resultCtaTitle}>一對一語校出發諮詢</div>
        <div className={styles.resultCtaDesc}>適合確定要報語校的你。諮詢費可折抵報名定金（諮詢後 7 日內報名享 NT$3,000 定金優惠），開課後定金全額退還。也就是說，成功報名語校的學生，實際上不需要額外支付諮詢費用。</div>
        <div className={styles.resultCtaPrice}>NT$800 <span className={styles.resultCtaOriginal}>NT$1,000</span></div>
        <a href={CTA_LINKS.consult} target="_blank" rel="noreferrer" className={styles.resultCtaBtn}>立即預約一對一諮詢</a>
      </div>
    </div>
  );
  if (type === "ready_both") return (
    <div className={styles.resultCtaBox}>
      <p className={styles.resultCtaLabel}>✦ 你可能適合的下一步</p>
      <div className={styles.resultCtaItem}>
        <div className={styles.resultCtaTitle}>一對一語校出發諮詢</div>
        <div className={styles.resultCtaDesc}>適合已經準備好談方案的你。針對你的預算、出發時間與目標，直接幫你比較語校、確認課程與報價。成功報名語校的學生，諮詢費可折抵定金，開課後退還，實際上不需要額外支付諮詢費用。</div>
        <div className={styles.resultCtaPrice}>NT$800 <span className={styles.resultCtaOriginal}>NT$1,000</span></div>
        <a href={CTA_LINKS.consult} target="_blank" rel="noreferrer" className={styles.resultCtaBtn}>預約一對一諮詢</a>
      </div>
      <div className={styles.resultCtaDivider}>或者先看看</div>
      <div className={styles.resultCtaItem}>
        <div className={styles.resultCtaTitle}>愛爾蘭自主評估包</div>
        <div className={styles.resultCtaDesc}>如果你還想先自己研究，這份資料包可以讓你更有方向再來諮詢。</div>
        <div className={styles.resultCtaPrice}>NT$400 <span className={styles.resultCtaOriginal}>NT$500</span></div>
        <a href={CTA_LINKS.selfPack} target="_blank" rel="noreferrer" className={cx(styles.resultCtaBtn, styles.resultCtaBtnSecondary)}>了解自主評估包</a>
      </div>
    </div>
  );
  return (
    <div className={styles.resultCtaBox}>
      <p className={styles.resultCtaLabel}>✦ 你可能適合的下一步</p>
      <div className={styles.resultCtaItem}>
        <div className={styles.resultCtaTitle}>愛爾蘭自主評估包</div>
        <div className={styles.resultCtaDesc}>適合想先自己研究清楚的你。包含說明會重播與完整整理資料，系統了解語校、25+8、預算與生活準備。</div>
        <div className={styles.resultCtaPrice}>NT$400 <span className={styles.resultCtaOriginal}>NT$500</span></div>
        <a href={CTA_LINKS.selfPack} target="_blank" rel="noreferrer" className={styles.resultCtaBtn}>了解自主評估包</a>
      </div>
      <div className={styles.resultCtaDivider}>或</div>
      <div className={cx(styles.resultCtaItem, styles.resultCtaSoft)}>
        <div className={styles.resultCtaTitle}>📬 優先收到說明會通知</div>
        <div className={styles.resultCtaDesc}>完成出發計畫後，你已獲得下一場說明會的優先邀請資格。說明會基本上免費參加，開放報名時我們會第一時間通知你。</div>
      </div>
    </div>
  );
}

export function ConsultationPage({ googleAdsEnabled }: { googleAdsEnabled: boolean }) {
  const [slide, setSlide] = useState(0);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [barrierLimit, setBarrierLimit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<null | { data: AssessmentData; stageInfo: ReturnType<typeof getAssessmentContent>; stageName: string; leadQuality: string }>(null);
  const [accuracy, setAccuracy] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const conversionGuard = useRef<GoogleAdsConversionGuard>({ sent: false });
  const submissionGate = useRef<ConsultationSubmissionGate>({ inFlight: false, completed: false });
  const formRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide(current => (current + 1) % heroImages.length), 4500);
    return () => window.clearInterval(timer);
  }, []);

  const setText = (field: keyof FormValues, value: string) => {
    setValues(current => ({ ...current, [field]: value }));
  };

  const setChoice = (field: ChoiceName, option: string, multiple = false) => {
    setValues(current => {
      if (!multiple) return { ...current, [field]: option };
      const selected = current[field] as string[];
      if (field === "barriers" && !selected.includes(option) && selected.length >= 3) {
        setBarrierLimit(true);
        window.setTimeout(() => setBarrierLimit(false), 2000);
        return current;
      }
      return { ...current, [field]: selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option] };
    });
  };

  const fieldValid = (field: keyof FormValues | "consent") => {
    if (field === "consent") return values.consent1 && values.consent2;
    const value = values[field];
    const limit = fieldLimits[field];
    if (limit && typeof value === "string" && value.length > limit) return false;
    if (["instagram", "lineId"].includes(field)) return true;
    if (field === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim());
    return Array.isArray(value) ? value.length > 0 : typeof value === "boolean" ? value : value.trim().length > 0;
  };

  useEffect(() => {
    setErrors(current => {
      const next = new Set([...current].filter(field => !fieldValid(field as keyof FormValues | "consent")));
      return next.size === current.size && [...next].every(field => current.has(field)) ? current : next;
    });
  }, [values]);

  const validateFields = (fields: (keyof FormValues | "consent")[]) => {
    const invalid = fields.filter(field => !fieldValid(field));
    setErrors(current => {
      const next = new Set(current);
      fields.forEach(field => next.delete(field));
      invalid.forEach(field => next.add(field));
      return next;
    });
    return invalid;
  };

  const scrollToFirstError = () => window.setTimeout(() => {
    formRef.current?.querySelector(`.${styles.fieldError}.${styles.show}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 0);

  const goToStep = (next: number) => {
    setStep(next);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const nextStep = () => {
    if (submitting || submitted) return;
    if (validateFields(stepFields[step]).length) return scrollToFirstError();
    goToStep(step + 1);
  };

  const assessmentData = (): AssessmentData => ({
    name: values.name.trim(), nickname: values.nickname.trim(), email: values.email.trim(),
    instagram: values.instagram.trim() ? `@${values.instagram.trim().replace(/^@+/, "")}` : "",
    lineId: values.lineId.trim(), location: values.location, awareness: values.awareness,
    timeline: values.timeline, plan: values.plan, workIntention: values.workIntention,
    wantWork: ["有，這是我出發的重要原因之一", "還在考慮中"].includes(values.workIntention),
    goals: values.goals.join("、"), englishGoal: values.englishGoal, lifeChange: values.lifeChange.trim(),
    barriers: values.barriers.join("、"), cityPreference: values.cityPreference, budget: values.budget,
    resources: values.resources.join("、"), webinar: values.webinar.join("、"),
  });

  const submit = async () => {
    const data = assessmentData();
    const stage = classifyStage(data);
    const leadQuality = classifyLead(data);
    const stageInfo = getAssessmentContent(data, stage);
    const stageName = `${stageInfo.emoji} ${stageInfo.name}`;
    const payload = {
      name: data.name, nickname: data.nickname, email: data.email, instagram: data.instagram,
      lineId: data.lineId, location: data.location, awareness: data.awareness, timeline: data.timeline,
      plan: data.plan, workIntention: data.workIntention, wantWork: data.wantWork,
      englishGoal: data.englishGoal, cityPreference: data.cityPreference, budget: data.budget,
      goals: data.goals, lifeChange: data.lifeChange, barriers: data.barriers, resources: data.resources,
      webinar: data.webinar, stage, routeResult: getRouteRecommendation(data),
      blockerDiagnosis: getBlockerDiagnosis(data.barriers), stageName, stageDescription: stageInfo.description,
      nextSteps: stageInfo.nextSteps, followUp: stageInfo.followUp, leadQuality, teamEmail: TEAM_EMAIL,
      resourceLink: RESOURCE_LINK, discountPrice: WEBINAR_DISCOUNT.discount_price,
      originalPrice: WEBINAR_DISCOUNT.original_price,
      submittedAt: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),
    };
    try {
      await runConsultationSubmission({
        gate: submissionGate.current,
        validate: () => {
          for (let target = 1; target <= 5; target += 1) {
            if (validateFields(stepFields[target]).length) {
              goToStep(target);
              scrollToFirstError();
              return false;
            }
          }
          return true;
        },
        request: () => fetch(GAS_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) }),
        onResolved: () => {
          trackConsultationConversion(conversionGuard.current, {
            productionDeployment: googleAdsEnabled,
          });
          setResult({ data, stageInfo, stageName, leadQuality });
          setSubmitted(true);
          formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        onSubmittingChange: setSubmitting,
      });
    } catch (error) {
      console.error(error);
      window.alert("送出時遇到問題，請稍後再試，或直接私訊哩來愛爾蘭 IG。");
    }
  };

  const submitAccuracy = (answer: string) => {
    if (!result || accuracy) return;
    setAccuracy(answer);
    const feedbackPayload: Record<string, unknown> = {
      type: "accuracy_feedback", name: result.data.name, nickname: result.data.nickname,
      email: result.data.email, stageName: result.stageName, leadQuality: result.leadQuality,
      accuracyAnswer: answer, submittedAt: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" }),
    };
    if (answer === "不太準") feedbackPayload.urgentFollowUp = true;
    runAccuracyFeedbackSubmission(() => fetch(GAS_ENDPOINT, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(feedbackPayload) }))
      .catch(error => console.log("Feedback send error:", error));
  };

  const textField = (id: keyof FormValues, label: string, required: boolean, hint: string, placeholder: string, type = "text") => (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor={id}>{label}{required && <span className={styles.required}>*</span>}{hint && <span className={styles.fieldHint}>{hint}</span>}</label>
      <input className={styles.textInput} id={id} type={type} placeholder={placeholder} required={required} maxLength={fieldLimits[id]} value={values[id] as string} onChange={event => setText(id, id === "instagram" ? event.target.value.replace(/^@+/, "") : event.target.value)} aria-invalid={errors.has(id)} aria-describedby={`${id}-error`} />
      <FieldError field={id} errors={errors} />
    </div>
  );

  const optionField = (name: ChoiceName, label: string, required: boolean, hint = "", multiple = false, singleColumn = false) => (
    <div className={styles.fieldGroup}>
      <div className={styles.fieldLabel} id={`${name}-label`}>{label}{required && <span className={styles.required}>*</span>}{hint && <span className={cx(styles.fieldHint, name === "barriers" && barrierLimit && styles.limitError)}>{name === "barriers" && barrierLimit ? "最多只能選 3 個" : hint}</span>}</div>
      <OptionGroup name={name} values={options[name]} value={values[name] as string | string[]} onChange={value => setChoice(name, value, multiple)} multiple={multiple} singleColumn={singleColumn} />
      <FieldError field={name} errors={errors} message={name === "barriers" && values.barriers.length > 3 ? "最多只能選 3 個" : undefined} />
    </div>
  );

  return (
    <main className={styles.page}>
      <section className={styles.carouselHero} aria-label="哩來出發計畫精選照片">
        <div className={styles.carouselTrack} style={{ transform: `translateX(-${slide * 100}%)` }}>
          {heroImages.map((image, index) => <div key={image.src} className={cx(styles.carouselSlide, index === slide && styles.active)}><img src={image.src} alt={image.alt} loading={index === 0 ? "eager" : "lazy"} /></div>)}
        </div>
        <button type="button" className={cx(styles.carouselArrow, styles.prev)} onClick={() => setSlide(current => (current - 1 + heroImages.length) % heroImages.length)} aria-label="上一張">←</button>
        <button type="button" className={cx(styles.carouselArrow, styles.next)} onClick={() => setSlide(current => (current + 1) % heroImages.length)} aria-label="下一張">→</button>
        <div className={styles.carouselContent}>
          <div className={styles.carouselBadge}>哩來出發計畫</div>
          <h1>每個想出發的人，<br />都需要先看懂自己。</h1>
          <p>填寫出發計畫，我們幫你判斷目前的出發階段<br />與最適合你的下一步。</p>
          <a href="#form" className={styles.btnHero}>開始免費出發評估</a>
          <p className={styles.heroTagline}>一起把夢，過成生活。</p>
        </div>
        <div className={styles.carouselDots}>{heroImages.map((_, index) => <button key={index} type="button" className={cx(styles.carouselDot, index === slide && styles.active)} onClick={() => setSlide(index)} aria-label={`第 ${index + 1} 張`} />)}</div>
      </section>

      <section className={styles.benefits}>
        <p className={styles.sectionLabel}>完成表單後，你將獲得</p>
        <h2 className={styles.sectionTitle}>先看懂自己，再出發</h2>
        <div className={styles.benefitsGrid}>{benefits.map(([title, copy], index) => <article className={styles.benefitCard} key={title}><div className={styles.benefitNum}>{index + 1}</div><h3>{title}</h3><p>{copy}</p></article>)}</div>
        <div className={styles.earlyBird}><div><h4>說明會優先邀請資格</h4><p>完成出發計畫後，你已獲得下一場說明會的<span className={styles.priceHighlight}>優先邀請資格</span>。說明會基本上免費參加，開放報名時我們會第一時間通知你。</p></div></div>
      </section>

      <section className={styles.formSection} id="form" ref={formRef}>
        <div className={styles.formContainer}>
          {!submitted && <div className={styles.formProgress} aria-label={`表單進度：第 ${step} 步，共 5 步`}>{[1,2,3,4,5].map(item => <span key={item} className={cx(styles.progressDot, item === step && styles.active, item < step && styles.done)} />)}</div>}
          {!submitted && <div aria-live="polite" className={styles.srOnly}>{errors.size ? "請修正標示的欄位" : ""}</div>}

          {!submitted && step === 1 && <div className={cx(styles.formStep, styles.active)}>
            <div className={styles.stepHeader}><p className={styles.stepNum}>SECTION 01 / 05</p><h2 className={styles.stepTitle}>先認識一下你</h2><p className={styles.stepDesc}>填寫評估結果會寄到你的 Email，請確認正確。</p></div>
            {textField("name", "姓名", true, "", "你的名字")}
            {textField("nickname", "暱稱", true, "你希望哩來如何稱呼你？", "暱稱（英文 / 中文都可以）")}
            {textField("email", "Email", true, "評估結果與資料包將寄到這裡", "your@email.com", "email")}
            <div className={styles.fieldGroup}><label className={styles.fieldLabel} htmlFor="instagram">Instagram 帳號<span className={styles.fieldHint}>溝通更方便，推薦留！（選填）</span></label><div className={styles.igInputWrapper}><span className={styles.igPrefix}>@</span><input className={styles.textInput} id="instagram" placeholder="your_handle" maxLength={100} value={values.instagram} onChange={event => setText("instagram", event.target.value.replace(/^@+/, ""))} aria-describedby="instagram-error" /></div><FieldError field="instagram" errors={errors} /></div>
            {textField("lineId", "Line ID", false, "也可以透過 Line 聯繫，選填", "你的 Line ID")}
            {optionField("location", "目前所在地", true)}
            <div className={styles.formNav}><span /><button type="button" className={styles.btnNext} onClick={nextStep}>繼續 →</button></div>
          </div>}

          {!submitted && step === 2 && <div className={cx(styles.formStep, styles.active)}>
            <div className={styles.stepHeader}><p className={styles.stepNum}>SECTION 02 / 05</p><h2 className={styles.stepTitle}>你目前在哪個出發階段？</h2><p className={styles.stepDesc}>沒有對錯，誠實最有幫助。</p></div>
            {optionField("awareness", "你目前對愛爾蘭的了解程度是？", true)}
            {optionField("timeline", "你預計什麼時候出發？", true)}
            {optionField("plan", "你目前比較感興趣的方案是？", true)}
            <div className={styles.formNav}><button type="button" className={styles.btnBack} onClick={() => goToStep(1)}>← 返回</button><button type="button" className={styles.btnNext} onClick={nextStep}>繼續 →</button></div>
          </div>}

          {!submitted && step === 3 && <div className={cx(styles.formStep, styles.active)}>
            <div className={styles.stepHeader}><p className={styles.stepNum}>SECTION 03 / 05</p><h2 className={styles.stepTitle}>你為什麼想出發？</h2><p className={styles.stepDesc}>可複選，選出最符合你的原因。</p></div>
            {optionField("workIntention", "你有沒有打算在愛爾蘭工作？", true, "", false, true)}
            {optionField("goals", "你考慮去愛爾蘭，主要是為了什麼？", true, "可複選", true)}
            {optionField("englishGoal", "英文提升對你來說是？", true, "", false, true)}
            <div className={styles.fieldGroup}><label className={styles.fieldLabel} htmlFor="lifeChange">如果真的去愛爾蘭，你最希望這趟旅程幫你改變什麼？ <span className={styles.required}>*</span></label><textarea className={styles.textInput} id="lifeChange" placeholder="寫下你的想法，沒有標準答案。可以是很個人的事，也可以是對生活的期待…" rows={5} maxLength={3000} value={values.lifeChange} onChange={event => setText("lifeChange", event.target.value)} aria-invalid={errors.has("lifeChange")} aria-describedby="lifeChange-error" /><FieldError field="lifeChange" errors={errors} /></div>
            <div className={styles.formNav}><button type="button" className={styles.btnBack} onClick={() => goToStep(2)}>← 返回</button><button type="button" className={styles.btnNext} onClick={nextStep}>繼續 →</button></div>
          </div>}

          {!submitted && step === 4 && <div className={cx(styles.formStep, styles.active)}>
            <div className={styles.stepHeader}><p className={styles.stepNum}>SECTION 04 / 05</p><h2 className={styles.stepTitle}>現在最卡住你的是什麼？</h2><p className={styles.stepDesc}>說出來，才能幫你找出路。</p></div>
            {optionField("barriers", "你現在最卡住的地方是什麼？", true, "最多選 3 個", true)}
            {optionField("cityPreference", "你對城市有偏好嗎？", true, "", false, true)}
            {optionField("budget", "你大概可以準備多少錢出發？", true, "含學費與前期準備費用，不含個人零用")}
            {optionField("resources", "你希望哩來優先提供哪一類資訊？", true, "可複選", true)}
            <div className={styles.formNav}><button type="button" className={styles.btnBack} onClick={() => goToStep(3)}>← 返回</button><button type="button" className={styles.btnNext} onClick={nextStep}>繼續 →</button></div>
          </div>}

          {!submitted && step === 5 && <div className={cx(styles.formStep, styles.active)}>
            <div className={styles.stepHeader}><p className={styles.stepNum}>SECTION 05 / 05</p><h2 className={styles.stepTitle}>最後一步了！</h2><p className={styles.stepDesc}>讓我們知道你對什麼最感興趣，我們會寄給你最相關的內容。</p></div>
            {optionField("webinar", "如果哩來未來有主題說明會，你會想參加哪一類？", true, "可複選", true)}
            <div className={styles.fieldGroup}><div className={styles.fieldLabel}>同意條款 <span className={styles.required}>*</span></div>
              <button type="button" className={cx(styles.consentItem, values.consent1 && styles.checked)} role="checkbox" aria-checked={values.consent1} onClick={() => setValues(current => ({ ...current, consent1: !current.consent1 }))}><span className={styles.consentCheck}><span className={styles.consentCheckMark}>✓</span></span><span className={styles.consentText}>我同意收到哩來愛爾蘭寄送的出發建議、活動通知與相關資料。</span></button>
              <button type="button" className={cx(styles.consentItem, values.consent2 && styles.checked)} role="checkbox" aria-checked={values.consent2} onClick={() => setValues(current => ({ ...current, consent2: !current.consent2 }))}><span className={styles.consentCheck}><span className={styles.consentCheckMark}>✓</span></span><span className={styles.consentText}>我了解本表單資料僅供哩來愛爾蘭進行出發階段評估、後續聯繫與服務建議使用，不會任意公開或販售給第三方。</span></button>
              <FieldError field="consent" errors={errors} />
            </div>
            <div className={styles.formNav}><button type="button" className={styles.btnBack} onClick={() => goToStep(4)}>← 返回</button><button type="button" className={styles.btnSubmit} disabled={submitting} onClick={submit}>{submitting && <span className={styles.spinner} />}{submitting ? "正在送出資料，請稍等……" : "取得我的出發評估 🍀"}</button></div>
          </div>}

          {submitted && result && <div className={cx(styles.successScreen, styles.show)} aria-live="polite">
            <div className={styles.successIcon}>🍀</div><h2 className={styles.successTitle}>你的出發評估來了</h2>
            <div className={styles.stageBadge}>{result.stageInfo.emoji} 你目前是「{result.stageInfo.name}」</div>
            <div className={styles.resultSummary}>{result.stageInfo.description}</div>
            <div className={styles.resultDiagnosis}>{getBlockerDiagnosis(result.data.barriers)}</div>
            <div className={styles.resultNextsteps}><strong>建議你的下一步</strong>{result.stageInfo.nextSteps.split("\n").filter(Boolean).map(item => <div key={item} className={styles.nextStepItem}>{item}</div>)}{getTimeAnchor(result.data.timeline, result.data.plan) && <div className={styles.timeAnchor}>⏰ {getTimeAnchor(result.data.timeline, result.data.plan)}</div>}</div>
            <StageCta type={result.stageInfo.cta} />
            <p className={styles.resultEmailHint}>完整報告與 PDF 正在寄到你的 Email，請稍後查收。</p>
            {!accuracy ? <div className={styles.accuracyCheck}><p className={styles.accuracyQuestion}>這個評估結果準嗎？</p><div className={styles.accuracyOptions}>{["很準 😊", "還好 🤔", "不太準 😕"].map(label => <button key={label} type="button" className={cx(styles.accuracyBtn, label.startsWith("不太準") && styles.accuracyBtnMiss)} onClick={() => submitAccuracy(label.split(" ")[0])}>{label}</button>)}</div></div> : <div className={styles.accuracyDone}><p>{accuracy === "很準" ? "太好了！很高興這個評估對你有幫助 🍀" : accuracy === "還好" ? "謝謝你的回饋，我們會繼續優化評估邏輯！" : "謝謝你告訴我們。我們今天會主動聯繫你，幫你重新確認狀態。"}</p></div>}
            <p className={styles.signature}>哩來愛爾蘭 · 一起把夢，過成生活。</p>
          </div>}
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqContainer}><p className={styles.sectionLabel}>FREQUENTLY ASKED</p><h2 className={cx(styles.sectionTitle, styles.faqTitle)}>常見問題</h2>
          {faqs.map(([question, answer], index) => <article key={question} className={cx(styles.faqItem, openFaq === index && styles.open)}><button type="button" className={styles.faqQuestion} aria-expanded={openFaq === index} onClick={() => setOpenFaq(current => current === index ? null : index)}><span>{question}</span><span className={styles.faqToggle}>+</span></button><div className={styles.faqAnswer}>{answer}</div></article>)}
        </div>
      </section>
    </main>
  );
}

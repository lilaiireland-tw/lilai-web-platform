"use client";

import { useEffect, useState } from "react";
import {
  ACCEPTED_PREFERENCES,
  REJECTED_PREFERENCES,
  readConsentCookie,
  saveConsentCookie,
  type ConsentPreferences,
} from "@/lib/analytics/consent";
import { updateGoogleAdsConsent } from "@/lib/analytics/google-ads";
import styles from "./cookie-consent.module.css";

export function CookieConsent({ productionDeployment }: { productionDeployment: boolean }) {
  const [ready, setReady] = useState(false);
  const [choiceMade, setChoiceMade] = useState(false);
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({ ...REJECTED_PREFERENCES });

  useEffect(() => {
    const saved = readConsentCookie(document.cookie);
    if (saved) {
      setPreferences(saved);
      setChoiceMade(true);
    } else {
      setOpen(true);
    }
    setReady(true);
  }, []);

  function save(preferencesToSave: ConsentPreferences) {
    const normalized: ConsentPreferences = {
      ...preferencesToSave,
      personalization: preferencesToSave.advertising && preferencesToSave.personalization,
    };
    saveConsentCookie(document, normalized);
    updateGoogleAdsConsent(normalized, { productionDeployment });
    setPreferences(normalized);
    setChoiceMade(true);
    setCustomize(false);
    setOpen(false);
  }

  if (!ready) return null;

  return (
    <div className={styles.positioner}>
      {!open ? (
        <button type="button" className={styles.reopen} onClick={() => { setCustomize(false); setOpen(true); }} aria-label="開啟 Cookie 偏好設定">
          Cookie 設定
        </button>
      ) : (
        <section className={styles.panel} aria-labelledby="lilai-cookie-title" aria-describedby="lilai-cookie-description">
          <h2 id="lilai-cookie-title">Cookie 與隱私設定</h2>
          <p id="lilai-cookie-description">
            我們使用必要的網站功能及經你同意的分析、廣告量測與個人化設定。
            你可以拒絕非必要項目，也可以隨時修改選擇。
            詳情請參閱 <a href="/agreement/" target="_blank" rel="noopener noreferrer">隱私權政策</a>。
          </p>
          {customize && (
            <fieldset className={styles.preferences}>
              <legend>選擇允許的用途</legend>
              <label>
                <input type="checkbox" checked={preferences.analytics} onChange={event => setPreferences(current => ({ ...current, analytics: event.target.checked }))} />
                網站分析
              </label>
              <label>
                <input type="checkbox" checked={preferences.advertising} onChange={event => setPreferences(current => ({ ...current, advertising: event.target.checked, personalization: event.target.checked ? current.personalization : false }))} />
                廣告成效量測
              </label>
              <label>
                <input type="checkbox" checked={preferences.personalization} disabled={!preferences.advertising} onChange={event => setPreferences(current => ({ ...current, personalization: event.target.checked }))} />
                個人化廣告
              </label>
            </fieldset>
          )}
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={() => save({ ...REJECTED_PREFERENCES })}>拒絕非必要</button>
            {customize ? (
              <button type="button" className={styles.secondary} onClick={() => save(preferences)}>儲存我的選擇</button>
            ) : (
              <button type="button" className={styles.secondary} onClick={() => setCustomize(true)}>自訂設定</button>
            )}
            <button type="button" className={styles.primary} onClick={() => save({ ...ACCEPTED_PREFERENCES })}>接受全部</button>
          </div>
          {choiceMade && <p className={styles.note}>變更設定後會套用到本次瀏覽，其他網站系統的同意管理仍需另外整合。</p>}
        </section>
      )}
    </div>
  );
}

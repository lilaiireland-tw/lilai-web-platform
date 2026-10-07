import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import styles from "./showcase.module.css";

export const metadata: Metadata = {
  title: "Design system review",
  robots: { index: false, follow: false },
  alternates: { canonical: "/design-system/" },
};

export default function DesignSystemPage() {
  return <main className="ds-body">
    <section className="ds-section">
      <div className="ds-container">
        <p className="ds-eyebrow">Lilai Ireland · UI foundation</p>
        <h1 className="ds-heading-1">品牌樣式檢查</h1>
        <p>Review only. These controls do not submit data.</p>
        <h2 className="ds-heading-2">Buttons</h2>
        <div className={styles.stack}>
          <div className={styles.row}>{(["primary", "secondary", "dark", "ghost"] as const).map(variant => <Button key={variant} variant={variant}>{variant}</Button>)}</div>
          <div className={styles.row}>{(["small", "default", "large"] as const).map(size => <Button key={size} size={size} variant="secondary">{size}</Button>)}</div>
          <div className={styles.row}><Button href="#forms">Anchor button</Button><Button disabled>Disabled button</Button><Button href="#forms" disabled>Disabled anchor</Button></div>
          <Button fullWidth>Full width</Button>
        </div>
        <h2 className="ds-heading-2">Cards</h2>
        <div className={styles.grid}>{(["default", "bordered", "elevated", "featured"] as const).map(variant => <article key={variant} className={`ds-card ${variant === "default" ? "" : `ds-card--${variant}`}`}><h3 className="ds-heading-3">{variant}</h3><p className="ds-small">Shared card shell.</p></article>)}</div>
      </div>
    </section>
    <section className="ds-section ds-section--soft" id="forms">
      <div className="ds-container ds-container--narrow">
        <h2 className="ds-heading-2">Form foundation</h2>
        <div className={styles.grid}>
          <div className="ds-field"><label className="ds-label" htmlFor="review-name">姓名</label><input className="ds-input" id="review-name" autoComplete="name" aria-describedby="review-name-help" placeholder="Name" /><p className="ds-help" id="review-name-help">Help text example.</p></div>
          <div className="ds-field"><label className="ds-label" htmlFor="review-city">城市</label><select className="ds-select" id="review-city" defaultValue=""><option value="">Select a city</option><option>Dublin</option><option>Cork</option></select></div>
          <div className="ds-field"><label className="ds-label" htmlFor="review-email">Email · invalid example</label><input className="ds-input" id="review-email" type="email" aria-invalid="true" aria-describedby="review-email-error" defaultValue="invalid" /><p className="ds-error" id="review-email-error">Error: 請輸入有效的 Email。</p></div>
          <div className="ds-field"><label className="ds-label" htmlFor="review-disabled">Disabled input</label><input className="ds-input" id="review-disabled" disabled defaultValue="Unavailable" /></div>
          <div className="ds-field"><label className="ds-label" htmlFor="review-notes">備註</label><textarea className="ds-textarea" id="review-notes" placeholder="Notes" /></div>
          <div className="ds-field"><label className="ds-label" htmlFor="review-select-disabled">Disabled select</label><select className="ds-select" id="review-select-disabled" disabled><option>Unavailable</option></select><label className="ds-label" htmlFor="review-textarea-disabled">Disabled textarea</label><textarea className="ds-textarea" id="review-textarea-disabled" disabled defaultValue="Unavailable" /></div>
        </div>
      </div>
    </section>
    <section className="ds-section ds-section--tint"><div className="ds-container ds-container--narrow"><h2 className="ds-heading-2">Tint section · narrow container</h2><p className="ds-body-large">Noto Sans TC body / Noto Serif TC headings.</p><p className="ds-caption">Caption example.</p></div></section>
  </main>;
}

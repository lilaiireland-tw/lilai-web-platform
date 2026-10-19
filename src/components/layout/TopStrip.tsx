import { primaryCta } from "@/config/navigation";
import styles from "./layout.module.css";

export function TopStrip() {
  return (
    <div className={styles.topStrip} data-site-top-strip="true">
      <a href={primaryCta.href}>
        馬上填寫免費出發評估！
      </a>
    </div>
  );
}
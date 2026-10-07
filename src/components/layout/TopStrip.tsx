import { primaryCta } from "@/config/navigation";
import styles from "./layout.module.css";

export function TopStrip() {
  return (
    <div className={styles.topStrip} data-site-top-strip="true">
      <a href={primaryCta.href}>一起把夢，過成生活｜免費出發評估開放中</a>
    </div>
  );
}

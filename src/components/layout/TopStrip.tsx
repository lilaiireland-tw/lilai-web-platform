import { topStripLink } from "@/config/navigation";
import styles from "./layout.module.css";

export function TopStrip() {
  return (
    <div className={styles.topStrip} data-site-top-strip="true">
      <a href={topStripLink.href}>{topStripLink.label}</a>
    </div>
  );
}

import { contactNavigation, policyNavigation, primaryNavigation, serviceNavigation } from "@/config/navigation";
import { Brand } from "./Brand";
import { Navigation } from "./Navigation";
import styles from "./layout.module.css";

export function Footer() {
  return (
    <footer className={styles.footer} id="resources">
      <div className={`${styles.container} ${styles.footerGrid}`}>
        <div><Brand inverse /><p>一起把夢，過成生活 ☘️</p></div>
        <div><h2>認識哩來</h2><Navigation links={primaryNavigation} label="頁尾主要導覽" /></div>
        <div><h2>開始規劃</h2><Navigation links={serviceNavigation} label="常用服務" /></div>
        <div><h2>聯絡我們</h2><Navigation links={contactNavigation} label="社群與聯絡方式" /></div>
      </div>
      <div className={`${styles.container} ${styles.footerBottom}`}>
        <small>© {new Date().getFullYear()} 哩來愛爾蘭 Lilai Ireland</small>
        <Navigation links={policyNavigation} label="相關政策" />
      </div>
    </footer>
  );
}

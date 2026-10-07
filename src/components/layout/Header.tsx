import { primaryCta, primaryNavigation, schoolSignupLink, serviceNavigation } from "@/config/navigation";
import { Brand } from "./Brand";
import { MobileNavigation } from "./MobileNavigation";
import { Navigation } from "./Navigation";
import styles from "./layout.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Brand />
        <Navigation links={[...primaryNavigation, schoolSignupLink]} label="主要導覽" className={styles.desktopNavigation} />
        <div className={styles.headerActions}>
          <a className={styles.cta} href={primaryCta.href}>{primaryCta.label}</a>
          <MobileNavigation>
            <Navigation links={[...primaryNavigation, ...serviceNavigation]} label="手機主要導覽" />
          </MobileNavigation>
        </div>
      </div>
    </header>
  );
}

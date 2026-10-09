import { primaryNavigation } from "@/config/navigation";
import { Brand } from "./Brand";
import { MobileNavigation } from "./MobileNavigation";
import { Navigation } from "./Navigation";
import styles from "./layout.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`ds-container ds-container--wide ${styles.headerInner}`}>
        <Brand />
        <Navigation links={primaryNavigation} label="主要導覽" className={styles.desktopNavigation} />
        <div className={styles.headerActions}>
          <MobileNavigation>
            <Navigation links={primaryNavigation} label="手機主要導覽" />
          </MobileNavigation>
        </div>
      </div>
    </header>
  );
}

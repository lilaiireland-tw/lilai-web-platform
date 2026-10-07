import type { NavigationLink } from "@/config/navigation";
import styles from "./layout.module.css";

export function Navigation({ links, label, className = "" }: {
  links: readonly NavigationLink[];
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ul className={styles.links}>
        {links.map(link => {
          const hasChildren = Boolean(link.children?.length);
          return (
            <li
              key={link.href}
              className={hasChildren ? `${styles.navItem} ${styles.navItemWithChildren}` : styles.navItem}
            >
              <a className={styles.navLink} href={link.href}>
                <span>{link.label}</span>
                {hasChildren ? <span className={styles.chevron} aria-hidden="true">⌄</span> : null}
              </a>
              {hasChildren ? (
                <ul className={styles.subLinks}>
                  {link.children?.map(child => (
                    <li key={child.href}>
                      <a href={child.href}>{child.label}</a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

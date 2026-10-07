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
        {links.map(link => (
          <li key={link.href}><a href={link.href}>{link.label}</a></li>
        ))}
      </ul>
    </nav>
  );
}

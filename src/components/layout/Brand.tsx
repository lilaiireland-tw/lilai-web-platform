import Image from "next/image";
import Link from "next/link";
import styles from "./layout.module.css";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className={`${styles.brand} ${inverse ? styles.inverse : ""}`} aria-label="哩來愛爾蘭首頁">
      <Image src="/assets/lilai-logo.png" alt="" width={144} height={144} className={styles.logo} unoptimized />
      <span><strong>哩來愛爾蘭</strong><small>Lilai Ireland</small></span>
    </Link>
  );
}

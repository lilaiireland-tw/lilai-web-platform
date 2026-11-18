"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./ireland-25-plus-8.module.css";
import { initialize } from "./native-interactions";

export function Ireland25Plus8Interactions({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (root.current) return initialize(root.current);
  }, []);
  return <div className={styles.design} data-ireland25 ref={root}>{children}</div>;
}

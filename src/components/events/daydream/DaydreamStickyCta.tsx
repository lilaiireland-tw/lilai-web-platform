"use client";

import { useEffect, useState } from "react";
import type { EventContent } from "@/lib/events/event-types";
import { DaydreamRegistrationCta } from "./DaydreamRegistrationCta";
import styles from "./daydream.module.css";

export function DaydreamStickyCta({ event }: { event: EventContent }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const update = () => {
      const nearForm = ["register", "closing"].some(id => {
        const rect = document.getElementById(id)?.getBoundingClientRect();
        return rect && rect.top < window.innerHeight && rect.bottom > 0;
      });
      setVisible(window.scrollY > window.innerHeight * 0.6 && !nearForm);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  if (!visible || event.status !== "active") return null;
  return <div className={styles.sticky}><DaydreamRegistrationCta event={event} location="mobile-sticky" label="免費報名 10/18 分享會" /></div>;
}

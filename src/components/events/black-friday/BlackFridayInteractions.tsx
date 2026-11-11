"use client";

import { useEffect, useState, type ReactNode, type MouseEvent } from "react";
import type { EventContent } from "@/lib/events/event-types";
import { readConsentCookie } from "@/lib/analytics/consent";
import { BlackFridayCta } from "./BlackFridayCta";
import styles from "./black-friday.module.css";

export function BlackFridayInteractions({ event, children }: { event: EventContent; children: ReactNode }) {
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const update = () => {
      const final = document.getElementById("final")?.getBoundingClientRect();
      const consent = document.getElementById("lilai-cookie-title");
      setShowSticky(Boolean(final && final.top >= window.innerHeight && !consent));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  function track(eventClick: MouseEvent<HTMLDivElement>) {
    const anchor = eventClick.target instanceof Element ? eventClick.target.closest<HTMLAnchorElement>("a[data-cta-location]") : null;
    if (!anchor || anchor.getAttribute("href") !== event.registrationUrl || !readConsentCookie(document.cookie)?.analytics) return;
    try {
      const payload = { event: "line_cta_click", cta_location: anchor.dataset.ctaLocation, cta_text: anchor.textContent?.trim() };
      (window.dataLayer ??= []).push(payload);
      window.dispatchEvent(new CustomEvent("lilai:line_cta_click", { detail: payload }));
    } catch {
      // Tracking must never interrupt the LINE link.
    }
  }

  return <div onClickCapture={track}>{children}
    {showSticky && event.status === "active" && <div className={styles.sticky}>
      <BlackFridayCta event={event} location="sticky_mobile" label="LINE 詢問黑五優惠" />
      <span>由哩來學長姐真人回覆</span>
    </div>}
  </div>;
}

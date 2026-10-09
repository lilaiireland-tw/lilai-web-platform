import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { EventContent, EventImage } from "@/lib/events/event-types";
import { Button } from "@/components/ui/Button";
import styles from "./daydream.module.css";

export function Lines({ text }: { text: string }) {
  return <>{text.split("\n").map((line, i) => <span key={i}>{i > 0 && <br />}{line}</span>)}</>;
}
export function Eyebrow({ index, children, inverse = false }: { index: string; children: ReactNode; inverse?: boolean }) {
  return <div className={`${styles.eyebrow} ${inverse ? styles.eyebrowInverse : ""}`}>
    <span>{index}</span><span aria-hidden="true" className={styles.eyebrowRule} /><span>{children}</span>
  </div>;
}
export function Photo({ image, hero = false, film = false, frameNo, className = "" }: {
  image: EventImage; hero?: boolean; film?: boolean; frameNo?: string; className?: string;
}) {
  return <figure className={`${styles.photoFrame} ${film ? styles.filmFrame : ""} ${className}`}>
    <div className={`${styles.photoViewport} ${hero ? styles.heroViewport : ""} ${film ? styles.filmViewport : ""}`}>
      <Image {...image} unoptimized priority={hero} fetchPriority={hero ? "high" : undefined}
        loading={hero ? undefined : "lazy"} className={styles.photo} />
    </div>
    {film && <figcaption className={styles.filmCaption}><span>{frameNo}</span><span>LILAI 2027</span></figcaption>}
  </figure>;
}
export function CampaignButton({ event, location, label = event.registrationLabel, external = false, inverse = false, small = false }: {
  event: EventContent; location: string; label?: string; external?: boolean; inverse?: boolean; small?: boolean;
}) {
  if (event.status !== "active") return null;
  return <Button href={external ? event.registrationUrl : "#register"} target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined} data-event-slug={event.slug}
    data-campaign-name={event.campaignName} data-cta-location={location}
    className={`${styles.button} ${inverse ? styles.buttonInverse : ""} ${small ? styles.buttonSmall : ""}`}>
    <span>{label}</span><span className={styles.buttonArrow} aria-hidden="true">→</span>
  </Button>;
}
export function DateStamp() {
  return <div className={styles.stamp} role="img" aria-label="LIVE 10.18 FREE"><span>LIVE</span><span>10.18</span><span>FREE</span></div>;
}
export function DetailIcon({ name }: { name: "calendar-days" | "clock" | "monitor" | "ticket" }) {
  return <span aria-hidden="true" className={styles.detailIcon} style={{ "--icon": `url(/events/daydream-adventure-2027/icons/${name}.svg)` } as CSSProperties} />;
}

import Image from "next/image";
import type { Speaker } from "@/lib/events/event-types";
import styles from "./events.module.css";

export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return <article className={`ds-card ds-card--bordered ${styles.stack}`}>
    {speaker.image && <Image {...speaker.image} className={styles.image} sizes="(max-width: 760px) calc(100vw - 76px), 400px" loading="lazy" />}
    <h3 className="ds-heading-3">{speaker.name}</h3>
    {speaker.role && <p className="ds-small">{speaker.role}</p>}<p>{speaker.bio}</p>
  </article>;
}

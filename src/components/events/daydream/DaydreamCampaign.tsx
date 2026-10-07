import Image from "next/image";
import type { ReactNode } from "react";
import type { EventContent, EventImage } from "@/lib/events/event-types";
import { daydreamCopy as copy } from "@/content/events/daydream-copy";
import { daydreamContact as contact, daydreamDetails as details } from "@/content/events/daydream-adventure-2027";
import { EventCta } from "../EventCta";
import { EventFaq } from "../EventFaq";
import { SpeakerCard } from "../SpeakerCard";
import { DaydreamStickyCta } from "./DaydreamStickyCta";
import styles from "./daydream.module.css";

function Photo({ image, hero = false }: { image: EventImage; hero?: boolean }) {
  // Recovered JPEGs are already small; preserve their exact bytes, without runtime upscaling/recompression.
  return <Image {...image} unoptimized priority={hero} fetchPriority={hero ? "high" : undefined} loading={hero ? undefined : "lazy"}
    className={styles.photo} />;
}

function Section({ id, title, eyebrow, children, tone = "" }: {
  id: string; title?: string; eyebrow?: string; children: ReactNode; tone?: string;
}) {
  return <section id={id} className={`ds-section ${styles.section} ${tone}`} aria-labelledby={title ? `${id}-title` : undefined}>
    <div className={`ds-container ${styles.stack}`}>
      {eyebrow && <p className="ds-eyebrow">{eyebrow}</p>}
      {title && <h2 id={`${id}-title`} className={`ds-heading-2 ${styles.copy}`}>{title}</h2>}
      {children}
    </div>
  </section>;
}

export function DaydreamCampaign({ event }: { event: EventContent }) {
  const cta = (location: string) => <EventCta event={event} location={location} label={event.registrationLabel} />;
  return <div className={styles.campaign}>
    <Section id="hero">
      <div className={styles.stack}>
        <p className="ds-eyebrow">2027 IRELAND WORKING HOLIDAY<br />From Daydream to Daily Life</p>
        <h1 className={`ds-heading-1 ${styles.heroTitle}`}>{event.shortTitle}</h1>
        <p className={`ds-heading-3 ${styles.subtitle}`}>{copy.hero.paragraphs[0]}</p>
        <div className={styles.twoColumns}>
          <p className={`${styles.copy} ${styles.heroStory}`}>{copy.hero.paragraphs[1]}</p>
          <div className={styles.stack}>
            <strong>{event.title.split("｜")[1]}</strong>
            <div className={styles.actions}><span className={styles.date}>10.18</span><div><time dateTime={event.startAt}>{event.dateLabel}</time><br />線上直播 · 免費線上分享</div></div>
            <div className={styles.actions}>{cta("hero")}<a href="#agenda">看看這場會聊什麼 ↓</a></div>
          </div>
        </div>
      </div>
      <figure className={styles.heroFrame}>
        {event.heroImage && <Photo image={event.heroImage} hero />}
        <figcaption>DAYDREAM — REAL LIFE<br />FRAME 001 · BELLA</figcaption>
        <span className={styles.stamp}>LIVE<br /><strong>10.18</strong><br />FREE</span>
      </figure>
    </Section>

    <Section id="hook" title={copy.hook.title} eyebrow={copy.hook.eyebrow}>
      <div className={styles.storyGrid}>
        <div className={styles.stack}><Photo image={copy.hook.photos[0]} /><strong className={styles.age}>18<span>歲</span></strong><p>{copy.hook.paragraphs[0]}</p><p>{copy.hook.paragraphs[1]}</p></div>
        <div className={styles.storyBridge}><span className="ds-eyebrow">··· 12 YEARS ···</span><p className={styles.copy}>{copy.hook.paragraphs[2]}</p><p className={styles.copy}>{copy.hook.paragraphs[3]}</p></div>
        <div className={styles.stack}><Photo image={copy.hook.photos[1]} /><strong className={styles.age}>30<span>歲</span></strong><p>{copy.hook.paragraphs[4]}</p></div>
      </div>
      <p className={`${styles.quote} ${styles.copy}`}>{copy.hook.paragraphs[5]}</p>
    </Section>

    <Section id="questions" title={copy.questions.title} eyebrow={copy.questions.eyebrow} tone="ds-section--soft">
      <ol className={styles.questions}>{copy.questions.items.map((question, i) => <li key={question}><span className="ds-eyebrow">Q.0{i + 1}</span><p className={styles.copy}>{question}</p></li>)}</ol>
    </Section>

    <Section id="agenda" title={copy.agenda.title} eyebrow={copy.agenda.eyebrow}>
      <p className="ds-eyebrow">PREPARE · ALEX → LIVE IT · BELLA → NEXT STEP · ARSHA</p>
      {copy.agenda.parts.map((part, i) => <div key={part.title} className={styles.stack}>
        <article className={`ds-card ds-card--bordered ${styles.agenda}`}>
          <div className={styles.stack}><span className="ds-eyebrow">PART 0{i + 1} · {['PREPARE', 'LIVE IT', 'NEXT STEP'][i]}</span><span className={styles.age}>0{i + 1}</span><strong>{copy.speakers.people[i].name}</strong><span>{copy.speakers.people[i].role}</span></div>
          <div className={styles.stack}><h3 className={`ds-heading-3 ${styles.copy}`}>{part.title}</h3>{part.paragraphs.map(p => <p key={p} className={styles.copy}>{p}</p>)}<strong>你會聽到</strong><ul className={styles.tags}>{part.tags.map(tag => <li key={tag}>{tag}</li>)}</ul></div>
        </article>
        {copy.agenda.annotations[i] && <p className={styles.annotation}>{copy.agenda.annotations[i]} ↓</p>}
      </div>)}
      <p className={styles.copy}>{copy.agenda.paragraphs.at(-1)}</p>
      <div className={styles.actions}>{cta("agenda")}<span>約 90–120 分鐘 · 線上直播</span></div>
    </Section>

    <Section id="frames" eyebrow={copy.frames.eyebrow} tone={styles.inverse}>
      <span className="ds-small">CONTACT SHEET · 300+ DAYS</span>
      <div className={styles.filmStrip}>{copy.frames.photos.map((image, i) => <figure key={image.src}><Photo image={image} /><figcaption>{['DUBLIN', 'WORK', 'PEOPLE', 'TRAVEL', '300+ DAYS'][i]}</figcaption></figure>)}</div>
      <p className={`${styles.quote} ${styles.copy}`}>{copy.frames.paragraphs[0]}</p>
    </Section>

    <Section id="speakers" title={copy.speakers.title} eyebrow={copy.speakers.eyebrow}>
      <div className={styles.speakers}>{copy.speakers.people.map(person => <SpeakerCard key={person.name} speaker={person} unoptimized />)}</div>
    </Section>

    <Section id="event" title={copy.event.title} eyebrow={copy.event.eyebrow} tone="ds-section--tint">
      <div className={styles.twoColumns}>
        <div className={styles.stack}><dl className={styles.details}>{details.map(item => <div key={item.label}><dt className="ds-eyebrow">{item.label}</dt><dd>{item.value}{'note' in item && <small>{item.note}</small>}</dd></div>)}</dl><div className={styles.actions}>{cta("event")}<span>報名說明會，不代表要出發。</span></div></div>
        <aside className={`ds-card ds-card--bordered ${styles.audience}`}><h3 className="ds-heading-3">適合誰？</h3><ul>{copy.event.items.map(item => <li key={item}>{item}</li>)}</ul></aside>
      </div>
    </Section>

    <Section id="faq" title={copy.faq.title} eyebrow={copy.faq.eyebrow}>
      <div className={styles.faq}><EventFaq items={copy.faq.items} /></div>
    </Section>

    <Section id="register" title={copy.register.title} eyebrow={copy.register.eyebrow}>
      <div className={styles.twoColumns}>
        <div className={styles.stack}><p className={styles.copy}>{copy.register.paragraphs[0]}</p><dl className={styles.details}>
          <div><dt>主辦</dt><dd>{details[8].value}<small>{details[8].note}</small></dd></div>
          <div><dt>INSTAGRAM</dt><dd><a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer">{contact.instagramHandle}</a></dd></div>
          <div><dt>聯絡我們</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>
        </dl></div>
        {event.status === "active" && <div className={`ds-card ds-card--featured ${styles.stack}`}>
          <h3 className="ds-heading-3">免費報名 10/18 分享會</h3><p>{event.dateLabel} · {event.venue} · FREE</p>
          <EventCta event={event} location="register" label="免費報名 10/18 分享會" target="_blank" />
          <p>將前往 Google 表單完成報名（開新分頁）。<br /><span className="ds-small">{event.registrationUrl.replace("https://", "")}</span></p>
          <figure className={styles.qr}><Image {...contact.qrImage} unoptimized loading="lazy" /><figcaption>手機掃碼報名</figcaption></figure>
          <p>{copy.register.paragraphs[1]}</p><p>{copy.register.paragraphs[2]}</p>
        </div>}
      </div>
    </Section>

    <Section id="closing" tone={styles.inverse}>
      <div className={styles.closing}><p>{copy.closing.paragraphs[0]}</p><p className={`${styles.quote} ${styles.copy}`}>{copy.closing.paragraphs[1]}</p>{cta("closing")}<p>{copy.closing.paragraphs[2]}</p><p className="ds-small">{contact.disclaimer}</p></div>
    </Section>
    <DaydreamStickyCta event={event} />
  </div>;
}

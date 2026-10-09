import Image from "next/image";
import type { ReactNode } from "react";
import type { EventContent } from "@/lib/events/event-types";
import { daydreamCopy as copy } from "@/content/events/daydream-copy";
import { daydreamContact as contact, daydreamDetails as details, daydreamPresentation as presentation } from "@/content/events/daydream-adventure-2027";
import { DaydreamStickyCta } from "./DaydreamStickyCta";
import { DaydreamFaq } from "./DaydreamFaq";
import { DaydreamRegistrationPanel } from "./DaydreamRegistrationPanel";
import { CampaignButton, DateStamp, DetailIcon, Eyebrow, Lines, Photo } from "./DaydreamPrimitives";
import styles from "./daydream.module.css";
import "./daydream-fonts.css";

function Section({ id, title, eyebrow, index, children, className = "", wide = false }: {
  id: string; title?: string; eyebrow?: string; index?: string; children: ReactNode; className?: string; wide?: boolean;
}) {
  return <section id={id} className={`${styles.section} ${className}`} aria-labelledby={title || id === "event" || id === "register" ? `${id}-title` : undefined}>
    <div className={`${styles.container} ${wide ? styles.wide : ""}`}>
      {title && <div className={styles.sectionHeading}>
        {eyebrow && index && <Eyebrow index={index}>{eyebrow}</Eyebrow>}
        <h2 id={`${id}-title`}><Lines text={title} /></h2>
      </div>}{children}
    </div>
  </section>;
}

export function DaydreamCampaign({ event }: { event: EventContent }) {
  const cta = (location: string) => <CampaignButton event={event} location={location} />;
  return <div className={styles.campaign} lang="zh-Hant">
    <Section id="hero" wide className={styles.hero}>
      <div className={styles.heroCopy}>
        <div className={styles.heroEyebrow}><span>2027 IRELAND WORKING HOLIDAY</span><span>From Daydream to Daily Life</span></div>
        <h1>{event.shortTitle}</h1>
        <div className={styles.heroSubtitle}><span aria-hidden="true" /><p>{copy.hero.paragraphs[0]}</p></div>
        <div className={styles.heroColumns}>
          <p className={styles.heroStory}><Lines text={copy.hero.paragraphs[1]} /></p>
          <div className={styles.heroInfo}>
            <div className={styles.heroInfoHeading}>
              <span>{copy.event.title}</span>
              <div className={styles.heroDateRow}><span className={styles.date}>10.18</span><div>
                <time dateTime={event.startAt}>{presentation.heroDate}</time><span>{details[1].note}</span><span>{event.venue} · 免費線上分享</span>
              </div></div>
            </div>
            <div className={styles.heroActions}>{cta("hero")}<a href="#agenda">看看這場會聊什麼 ↓</a></div>
          </div>
        </div>
      </div>
      <div className={styles.heroFrame}>
        {event.heroImage && <Photo image={event.heroImage} hero />}
        <div className={styles.heroPhotoLabel}><span>DAYDREAM</span><span aria-hidden="true" /><span>REAL LIFE</span></div>
        <span className={styles.heroFrameNumber}>FRAME 001 · BELLA</span><div className={styles.stampPosition}><DateStamp /></div>
      </div>
    </Section>

    <Section id="hook" title={copy.hook.title} eyebrow={copy.hook.eyebrow} index="02" className={styles.hook}>
      <div className={styles.storyColumns}>
        <div className={`${styles.storyCard} ${styles.storyBefore}`}><Photo image={copy.hook.photos[0]} />
          <span className={styles.age}>18<span>歲</span></span><p className={styles.storyIntro}>{copy.hook.paragraphs[0]}</p><p className={styles.storyQuote}>{copy.hook.paragraphs[1]}</p>
        </div>
        <div className={styles.storyBridge}><span>··· 12 YEARS ···</span><p><Lines text={copy.hook.paragraphs[2]} /></p><p><Lines text={copy.hook.paragraphs[3]} /></p></div>
        <div className={`${styles.storyCard} ${styles.storyAfter}`}><Photo image={copy.hook.photos[1]} />
          <span className={styles.age}>30<span>歲</span></span><p className={styles.storyQuote}>{copy.hook.paragraphs[4]}</p>
        </div>
      </div><p className={styles.storyClosing}><Lines text={copy.hook.paragraphs[5]} /></p>
    </Section>

    <Section id="questions" title={copy.questions.title} eyebrow={copy.questions.eyebrow} index="03" className={styles.questionsSection}>
      <ol className={styles.questions}>{copy.questions.items.map((question, i) => <li key={question}><span>Q.0{i + 1}</span><p><Lines text={question} /></p></li>)}</ol>
    </Section>

    <Section id="agenda" title={copy.agenda.title} eyebrow={copy.agenda.eyebrow} index="04" className={styles.agendaSection}>
      <div className={styles.agendaRoute}><span>PREPARE · ALEX</span><span aria-hidden="true">→</span><span>LIVE IT · BELLA</span><span aria-hidden="true">→</span><span>NEXT STEP · ARSHA</span></div>
      {copy.agenda.parts.map((part, i) => <div className={styles.agendaPart} key={part.title}>
        <article className={styles.agenda}>
          <div className={styles.agendaPerson}><span>PART 0{i + 1} · {['PREPARE', 'LIVE IT', 'NEXT STEP'][i]}</span><span>0{i + 1}</span>
            <div><span>{copy.speakers.people[i].name}</span><span>{copy.speakers.people[i].role}</span></div>
          </div>
          <div className={styles.agendaBody}><h3><Lines text={part.title} /></h3>
            <div className={styles.agendaParagraphs}>{part.paragraphs.filter((_, j) => i !== 1 || j !== 2).map(p => <p key={p}><Lines text={p} /></p>)}</div>
            {i === 1 && part.paragraphs[2] && <p className={styles.agendaQuote}><Lines text={part.paragraphs[2]} /></p>}
            <div className={styles.agendaTopics}><span>你會聽到</span><ul className={styles.tags}>{part.tags.map(tag => <li key={tag}>{tag}</li>)}</ul></div>
          </div>
        </article>
        {copy.agenda.annotations[i] && <div className={styles.annotationWrap}><span className={styles.annotation}><span>{copy.agenda.annotations[i]}</span><span aria-hidden="true">↓</span></span></div>}
      </div>)}
      <p className={styles.agendaClosing}><Lines text={copy.agenda.paragraphs[0]} /></p><div className={styles.actions}>{cta("agenda")}<span>約 90–120 分鐘 · 線上直播</span></div>
    </Section>

    <Section id="frames" wide className={styles.frames}>
      <div className={styles.framesHeading}><Eyebrow index="05" inverse>{copy.frames.eyebrow}</Eyebrow><span>CONTACT SHEET · 300+ DAYS</span></div>
      <div className={styles.filmStrip}>{copy.frames.photos.map((image, i) => <Photo key={image.src} image={image} film frameNo={['DUBLIN', 'WORK', 'PEOPLE', 'TRAVEL', '300+ DAYS'][i]} />)}</div>
      <p className={styles.framesQuote}><Lines text={copy.frames.paragraphs[0]} /></p>
    </Section>

    <Section id="speakers" title={copy.speakers.title} eyebrow={copy.speakers.eyebrow} index="06" className={styles.speakersSection}>
      <div className={styles.speakers}>{copy.speakers.people.map((person, i) => <article key={person.name}>
        <Photo image={person.image} /><div className={styles.speakerName}><span>0{i + 1}</span><h3>{person.name}</h3></div>
        <span className={styles.speakerRole}>{person.role}</span><p><Lines text={person.bio} /></p>
      </article>)}</div>
    </Section>

    <Section id="event" className={styles.eventSection}>
      <div className={styles.eventColumns}><div className={styles.eventMain}>
        <div className={styles.sectionHeading}><Eyebrow index="07">{copy.event.eyebrow}</Eyebrow>
          <h2 id="event-title">{copy.event.title.split("打工度假")[0]}<span className={styles.noWrap}>打工度假</span><wbr /><span className={styles.noWrap}>{copy.event.title.split("打工度假")[1]}</span></h2>
        </div>
        <dl className={styles.details}>{details.map(item => <div key={item.label}>
          <dt>{'icon' in item && <DetailIcon name={item.icon} />}{item.label}</dt><dd>{item.value}</dd>{'note' in item && <dd className={styles.detailNote}>{item.note}</dd>}
        </div>)}</dl><div className={styles.actions}>{cta("event")}<span>{copy.register.paragraphs[2]}</span></div>
      </div><aside className={styles.audience}><span>適合誰？</span><ul>{copy.event.items.map(item => <li key={item}>{item}</li>)}</ul></aside></div>
    </Section>

    <Section id="faq" title={copy.faq.title} eyebrow={copy.faq.eyebrow} index="08" className={styles.faqSection}><DaydreamFaq /></Section>

    <Section id="register" className={styles.registerSection}>
      <div className={styles.registerColumns}><div className={styles.registerCopy}>
        <Eyebrow index="09">{copy.register.eyebrow}</Eyebrow><h2 id="register-title"><Lines text={copy.register.title} /></h2>
        <p><Lines text={copy.register.paragraphs[0]} /></p><dl className={styles.contact}>
          <div><dt>主辦</dt><dd>{details[8].value}<br /><span>{details[8].note}</span></dd></div>
          <div><dt>INSTAGRAM</dt><dd><a href={contact.instagramUrl} target="_blank" rel="noopener noreferrer">{contact.instagramHandle}</a></dd></div>
          <div><dt>聯絡我們</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>
        </dl><Image {...presentation.logo} unoptimized className={styles.registerLogo} loading="lazy" />
      </div>
      <DaydreamRegistrationPanel event={event} />
      </div>
    </Section>

    <Section id="closing" className={styles.closingSection}>
      <div className={styles.closing}><p>{copy.closing.paragraphs[0]}</p><p><Lines text={copy.closing.paragraphs[1]} /></p>
        <CampaignButton event={event} location="closing" inverse /><p>{copy.closing.paragraphs[2]}</p>
      </div>
    </Section>
    <DaydreamStickyCta event={event} />
  </div>;
}

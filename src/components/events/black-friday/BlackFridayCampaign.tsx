import Image from "next/image";
import type { ReactNode } from "react";
import type { EventContent } from "@/lib/events/event-types";
import { blackFridayFaq, blackFridayTerms } from "@/content/events/black-friday-copy";
import { BlackFridayInteractions } from "./BlackFridayInteractions";
import { BlackFridayCta } from "./BlackFridayCta";
import styles from "./black-friday.module.css";

const asset = (name: string) => `/events/black-friday-2026/${name}`;

function Photo({ name, alt, width, height, hero = false }: {
  name: string; alt: string; width: number; height: number; hero?: boolean;
}) {
  return <picture>
    <source srcSet={`${asset(`${name}-640.webp`)} 640w, ${asset(`${name}.webp`)} ${width}w`}
      sizes={hero ? "(max-width: 1000px) calc(100vw - 40px), 510px" : "(max-width: 1200px) calc(100vw - 40px), 1080px"} />
    <Image src={asset(`${name}.webp`)} alt={alt} width={width} height={height} unoptimized
      fetchPriority={hero ? "high" : undefined} loading={hero ? "eager" : "lazy"}
      className={styles.photo} />
  </picture>;
}

function Section({ id, eyebrow, title, inverse = false, surface = false, children }: {
  id: string; eyebrow?: string; title?: ReactNode; inverse?: boolean; surface?: boolean; children: ReactNode;
}) {
  return <section id={id} className={`${styles.section} ${inverse ? styles.inverse : ""} ${surface ? styles.surface : ""}`} aria-labelledby={title ? `${id}-title` : undefined}>
    <div className={`ds-container ${styles.stack}`}>
      {title && <div className={styles.heading}>{eyebrow && <p className="ds-eyebrow">{eyebrow}</p>}
        <h2 id={`${id}-title`} className="ds-heading-2">{title}</h2></div>}
      {children}
    </div>
  </section>;
}

export function BlackFridayCampaign({ event }: { event: EventContent }) {
  const cta = (location: string, label: string, inverse = false) => <BlackFridayCta event={event} location={location} label={label} inverse={inverse} />;
  return <BlackFridayInteractions event={event}>
    <div className={styles.campaign}>
      <nav className={styles.pageNav} aria-label="黑五活動頁內導覽">
        <a href="#school-offers">學校優惠</a><a href="#departure">出發加碼</a><a href="#renewal">續簽優惠</a><a href="#faq">常見問題</a>
        {event.status === "active" && <a href={event.registrationUrl} data-event-slug={event.slug} data-campaign-name={event.campaignName} data-cta-location="nav">LINE 詢問優惠</a>}
      </nav>
      <section id="hero" className={`${styles.hero} ${styles.inverse}`} aria-labelledby="black-friday-title">
        <span className={styles.watermark} aria-hidden="true">BLACK FRIDAY</span>
        <div className={`ds-container ${styles.heroGrid}`}>
          <div className={styles.stack}>
            <p className={styles.badge}>哩來黑五出發計畫｜11 月限定｜11/30 截止</p>
            <h1 id="black-friday-title" className="ds-heading-1">想去愛爾蘭，<br />這次開始規劃。</h1>
            <div className={styles.offerDisplay}><p>指定語校課程</p><p>最高 <strong>30</strong><span>% OFF</span></p>
              <p><span className={styles.badge}>最低 7 折</span> 適用指定學校與課程，實際優惠依方案而異。</p><p>活動至 2026/11/30。</p></div>
            <p>學校優惠 × 哩來加碼，符合條件即可疊加享有。</p>
            <div className={styles.actions}>{cta("hero", "用 LINE 詢問我的優惠", true)}<a href="#school-offers">先看看有哪些優惠 ↓</a></div>
          </div>
          <figure className={styles.figure}>
            <Photo name="photo-street-group" width={896} height={846} hero alt="哩來學長姐與學生在都柏林街頭的自拍合照" />
            <figcaption>Dublin｜哩來學長姐與學弟妹的城市散步</figcaption>
          </figure>
        </div>
        <div className={styles.ribbon} aria-hidden="true">學校優惠 × 哩來加碼 <span>BLACK FRIDAY · 11/30 截止</span></div>
      </section>

      <Section id="stack" eyebrow="HOW IT STACKS · 優惠怎麼疊加" title="學校有優惠，哩來再加碼。">
        <div className={styles.offerStack}>
          <div className={`ds-card ds-card--bordered ${styles.card}`}><p className="ds-eyebrow">學校</p><h3>學費優惠</h3></div><span aria-hidden="true" className={styles.plus}>+</span>
          <div className={`ds-card ds-card--bordered ${styles.card}`}><p className="ds-eyebrow">學校</p><h3>指定學校免註冊費</h3></div><span aria-hidden="true" className={styles.plus}>+</span>
          <div className={`ds-card ${styles.card} ${styles.inverse}`}><p className="ds-eyebrow">哩來</p><h3>適用的哩來加碼</h3></div>
        </div>
        <p>每項優惠的資格分別認定，符合條件即可疊加享有。</p>
        <p><strong>你現在在哪個階段？</strong></p>
        <div className={styles.threeColumns}>{[["#school-offers", "正在規劃出發", "看學校優惠"], ["#departure", "已選好學校", "看出發加碼"], ["#renewal", "準備語校續簽", "看續簽優惠"]].map(([href, label, note]) =>
          <a key={href} href={href} className={`ds-card ds-card--bordered ${styles.stage}`}><strong>{label}</strong><span>{note} ↓</span></a>)}</div>
      </Section>

      <Section id="school-offers" eyebrow="SCHOOL OFFERS · 學校黑五優惠" title={<>你的愛爾蘭計畫，<br />從這波學校優惠開始。</>} surface>
        <div className={styles.twoColumns}>
          <div className={styles.stack}>
            <article className={`${styles.card} ${styles.inverse} ${styles.ticket}`}><p>優惠 A｜指定語校課程</p>
              <p className={styles.discount}>最高 <strong>30</strong>% OFF</p><h3>最低 7 折優惠</h3><p>適用指定學校與課程，實際優惠依方案而異。</p>
              <p className={styles.rule}>新生報名與語校續簽皆有適用的學校優惠。<br />依你的學習需求與預計時間，一起確認合適學校的黑五方案。</p></article>
            <article className={`ds-card ds-card--bordered ${styles.card}`}>
              <Image src={asset("isi-dublin-logo.png")} alt="ISI Dublin" width={664} height={117} unoptimized loading="lazy" className={styles.isiLogo} />
              <p className="ds-eyebrow">精選黑五課程優惠</p><h3><span className="ds-small">ISI Dublin</span><br />25＋8 打工遊學｜下午班</h3>
              <div className={styles.actions}><p>優惠價<br /><strong className={styles.price}>€2,520</strong></p><p>原價 <s>€3,520</s></p></div>
              <p><span className={styles.badge}>現省 €1,000</span></p><p className={styles.rule}>申請期限：2026/11/30 截止</p>
            </article>
          </div>
          <article className={`ds-card ds-card--bordered ${styles.card}`}><p className="ds-eyebrow">優惠 B｜指定學校限時優惠</p>
            <h3 className={styles.largeTitle}>免註冊費</h3><h3>明年才出發，這個月也能先申請。</h3>
            <p>指定學校於 2026/11/30 前送出申請，即可依適用條件享免註冊費優惠。課程週數、團報條件與適用開課日期依各校規定。</p>
            <div className={`${styles.card} ${styles.inverse}`}>
              <div className={styles.actions}><Image src={asset("atlas-logo.png")} alt="Atlas Language School" width={829} height={322} unoptimized loading="lazy" className={styles.atlasLogo} /><span>優惠示例</span></div>
              <h3>Atlas Language School</h3><h3 className={styles.gold}>免註冊費</h3>
              <dl className={styles.details}><dt>適用課程</dt><dd>報名 Atlas Language School<br />指定 8 週以上課程</dd>
                <dt>團報條件</dt><dd>11 月透過哩來團報送件，滿 5 人以上</dd><dt>優惠內容</dt><dd>免註冊費</dd>
                <dt>申請期限</dt><dd>2026/11/30 前送出申請</dd><dt>開課</dt><dd>明年出發亦有適用課程</dd></dl>
            </div><p>其他合作語校也有適用優惠，歡迎詢問學長姐。</p>
          </article>
        </div>
        <div className={styles.actions}><p>✓ 符合條件，可與學費優惠及哩來加碼疊加</p>{cta("school_offers", "詢問適合我的學校優惠")}</div>
      </Section>

      <Section id="departure" eyebrow="DEPARTURE BONUS · 哩來出發大禮包" title={<>出發前，<br />哩來再幫你準備一點。</>}>
        <div className={`${styles.card} ${styles.inverse}`}><p className={styles.gold}>於 2026/11/30 前送出報名表，符合以下任一條件，即可享大禮包的黑五升級福利：</p>
          <div className={styles.eligibility}><div><p>條件 A</p><h3>兩人以上團報</h3></div><span className={styles.plus}>或</span><div><p>條件 B</p><h3>已選好學校，毋須諮詢直接報名</h3></div></div></div>
        <p>依「四週以上短期課程」或「25＋8 打工遊學」享有對應福利。</p>
        <div className={styles.twoColumns}>
          <article className={`ds-card ds-card--bordered ${styles.card}`}><h3>四週以上短期課程 <span className={styles.badge}>升級</span></h3>
            <p>5 日網路卡 → 升級為</p><p className={styles.largeTitle}>28 日</p><h3>門號網路方案</h3><p><strong>Three Super Surfer</strong></p>
            <p><span className={styles.badge}>升級後方案價值 €20／人</span></p><p className="ds-small">€20 為升級後整個方案的價值。</p>
            <figure className={styles.sample}><Image src={asset("three-super-surfer.png")} width={284} height={180} alt="Three Super Surfer 方案卡圖示" unoptimized loading="lazy" /><figcaption>方案圖片示意</figcaption></figure>
          </article>
          <article className={`ds-card ds-card--bordered ${styles.card}`}><h3>25＋8 打工遊學 <span className={styles.badge}>加贈</span></h3>
            <p>每人加贈</p><h3 className={styles.largeTitle}>ISIC 國際學生證</h3><p><span className={styles.badge}>申辦價值 NT$350／人</span></p><p>✓ 原有 28 日門號網路方案福利照常享有。</p>
            <figure className={styles.sample}><Image src={asset("isic-card-sample.png")} width={272} height={190} alt="ISIC 國際學生證卡面示意" unoptimized loading="lazy" /><figcaption>卡面示意</figcaption></figure>
          </article>
        </div><div>{cta("departure_bonus", "詢問我的出發加碼")}</div>
      </Section>

      <Section id="renewal" eyebrow="已經在愛爾蘭的你" title={<>還想繼續的生活，<br />哩來陪你延續。</>} inverse>
        <div className={styles.twoColumns}><div className={styles.stack}><h3>續簽首月電信費補助</h3><p className={styles.discount}>最高 <strong>€20</strong></p>
          <div className={`${styles.card} ${styles.outlined}`}><h3 className={styles.gold}>補助怎麼領？</h3><ol className={styles.list}>
            <li>透過哩來辦理本次活動適用的語校續簽。</li><li>提供續簽首月的單月電信費證明。</li><li>依證明所列費用補助，最高 €20。</li><li>於續簽開始月份的次月底前發放。</li></ol>
            <p className={styles.rule}>例如：12 月開始續簽課程，補助於次年 1 月底前發放。</p></div></div>
          <div className={styles.stack}><p>即日起至 2026/11/30，透過哩來辦理本次活動適用的語校續簽，<br />續簽第一個月電信費補助，最高 €20。</p>
            <p>✓ 符合條件，可再搭配適用的學校黑五優惠。</p><div>{cta("renewal", "用 LINE 詢問續簽優惠", true)}</div></div>
        </div>
      </Section>

      <Section id="about" eyebrow="ABOUT LILAI · 認識哩來" title={<>優惠之外，<br />我們更想知道你為什麼想出發。</>}>
        <p>想加強英文、體驗不同生活，<br />還是給自己一段探索的時間？<br /><br />哩來學長姐陪你釐清出發動機、學習需求與生活期待，一起找到適合的課程與學校。</p>
        <figure className={styles.figure}><Photo name="photo-cafe-welcome" width={1080} height={452} alt="哩來學長姐與學弟妹在愛爾蘭咖啡店相聚，手拿歡迎卡片" /></figure>
        <ol className={styles.threeColumns}>{["理解你的出發動機", "釐清學習與生活期待", "一起找到適合的學校"].map((text, i) => <li key={text} className={styles.step}><span>0{i + 1}</span><h3>{text}</h3></li>)}</ol>
        <h3>一起把夢，過成生活。</h3>
      </Section>

      <Section id="faq" eyebrow="FREQUENTLY ASKED" title="常見問題" surface>
        <div className={styles.narrow}>{blackFridayFaq.map((item, i) => <details key={item.question} name="black-friday-faq" open={i === 0} className={styles.faq}>
          <summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>
      </Section>

      {event.status !== "archived" && <Section id="final" inverse>
        <div className={`${styles.stack} ${styles.closing}`}><p><span className={styles.badge}>傳送「黑五」</span></p>
          <h2 className="ds-heading-2">下一段愛爾蘭生活，<br />從聊聊你的計畫開始。</h2><p>加入或開啟哩來 LINE，傳送「黑五」，<br />告訴我們你準備出發或續簽，以及預計月份，<br />學長姐陪你確認適用優惠與下一步。</p>
          <div>{cta("footer", "加入 LINE，聊聊我的計畫", true)}</div><p>由哩來學長姐真人回覆。</p><h3 className={styles.gold}>一起把夢，過成生活。</h3>
        </div>
      </Section>}
      <Section id="terms" title="黑五出發計畫・活動說明"><ul className={styles.list}>{blackFridayTerms.map(term => <li key={term}>{term}</li>)}</ul></Section>
    </div>
  </BlackFridayInteractions>;
}

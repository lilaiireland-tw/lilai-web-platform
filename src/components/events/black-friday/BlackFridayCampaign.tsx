import { Fragment, type CSSProperties } from "react";
import type { EventContent } from "@/lib/events/event-types";
import { blackFridayTerms, blackFridaySchoolOffers } from "@/content/events/black-friday-copy";
import { BlackFridayInteractions } from "./BlackFridayInteractions";
import { BlackFridayCta } from "./BlackFridayCta";
import { BlackFridayFaq } from "./BlackFridayFaq";
import styles from "./black-friday.module.css";
import "./black-friday-fonts.css";

function Icon({ name, size = "md", color, style }: { name: string; size?: "md" | "xl"; color?: string; style?: CSSProperties }) {
  return <span style={{ display: "contents", ...style }}><span aria-hidden="true" data-lucide={name} style={{ display: "inline-block", width: size === "xl" ? 24 : 18,
    height: size === "xl" ? 24 : 18, flex: "0 0 auto", background: color || "currentColor",
    mask: `url(/events/black-friday-2026/icons/${name}.svg) center / contain no-repeat` }} /></span>;
}

// Source composition and inline declarations are preserved for reference parity.
export function BlackFridayCampaign({ event }: { event: EventContent }) {
  return <BlackFridayInteractions event={event}>
    <div className={styles.campaign}>
      <nav className={styles.pageNav} aria-label="黑五活動頁內導覽">
        <a href="#school-offers">學校優惠</a><a href="#departure">出發加碼</a><a href="#renewal">續簽優惠</a><a href="#faq">常見問題</a>
        {event.status === "active" && <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" data-event-slug={event.slug} data-campaign-name={event.campaignName} data-cta-location="nav">LINE 詢問優惠</a>}
      </nav>
      <div className={styles.design}>


<section id="hero" className={styles["bf-hero-sec"]} data-screen-label="Hero" style={{"position":"relative","overflow":"hidden","background":"#0b3927","padding":"72px 0 0"}}>

<div aria-hidden="true" style={{"position":"absolute","right":"-1vw","top":"28px","fontFamily":"'Black Friday Inter',sans-serif","fontWeight":900,"fontSize":"clamp(72px,12vw,190px)","lineHeight":0.82,"letterSpacing":"-.02em","color":"#0f4631","whiteSpace":"nowrap","pointerEvents":"none","writingMode":"vertical-rl"}}>BLACK FRIDAY</div>

<div className={styles["bf-hero"]} style={{"position":"relative","width":"min(1160px,100% - 40px)","margin":"0 auto"}}>
<div style={{"display":"flex","flexDirection":"column","gap":"22px","alignItems":"flex-start"}}>
<p style={{"margin":"0","display":"inline-flex","alignItems":"center","gap":"10px","padding":"8px 16px","borderRadius":"999px","background":"#ffbe12","color":"#0b3927","fontSize":"14px","fontWeight":800,"letterSpacing":".02em"}}>哩來黑五出發計畫<span aria-hidden="true" style={{"width":"1px","height":"14px","background":"#0b3927","opacity":0.4}}></span>11 月限定｜11/30 截止</p>
<h1 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(38px,5.2vw,68px)","fontWeight":900,"lineHeight":1.2,"letterSpacing":"-.02em","color":"#faf8ef"}}>想去愛爾蘭，<br />這次開始規劃。</h1>
<div style={{"display":"flex","flexDirection":"column","gap":"10px","padding":"20px 0 4px","borderTop":"1px solid rgba(255,255,255,.18)","width":"100%"}}>
<p style={{"margin":"0","fontSize":"17px","fontWeight":800,"color":"#faf8ef","letterSpacing":".04em"}}>指定語校課程</p>
<div style={{"display":"flex","alignItems":"flex-end","gap":"12px","flexWrap":"wrap"}}>
<span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(26px,2.6vw,34px)","fontWeight":900,"color":"#faf8ef","lineHeight":1,"paddingBottom":"10px"}}>最高</span>
<span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(96px,11vw,148px)","fontWeight":900,"color":"#ffbe12","lineHeight":0.84,"letterSpacing":"-.04em"}}>30</span>
<span style={{"display":"flex","flexDirection":"column","fontFamily":"'Black Friday Inter',sans-serif","fontWeight":900,"color":"#ffbe12","lineHeight":0.9,"paddingBottom":"4px"}}><span style={{"fontSize":"clamp(40px,4.4vw,60px)"}}>%</span><span style={{"fontSize":"clamp(34px,3.8vw,52px)","letterSpacing":"-.01em"}}>OFF</span></span>
</div>
<p style={{"margin":"8px 0 0","display":"flex","flexWrap":"wrap","alignItems":"center","gap":"10px 12px","fontSize":"15.5px","fontWeight":700,"color":"#faf8ef","lineHeight":1.6}}><span style={{"padding":"4px 12px","background":"#ffbe12","color":"#0b3927","fontSize":"16px","fontWeight":900,"borderRadius":"2px"}}>最低 7 折</span>適用指定學校與課程，實際優惠依方案而異。</p>
<p style={{"margin":"0","fontSize":"14px","lineHeight":1.6,"color":"rgba(250,248,239,.82)"}}>活動至 2026/11/30。</p>
</div>
<p style={{"margin":"0","maxWidth":"520px","fontSize":"17px","lineHeight":1.75,"color":"rgba(250,248,239,.86)"}}>學校優惠 × 哩來加碼，符合條件即可疊加享有。</p>
<div style={{"display":"flex","flexWrap":"wrap","gap":"12px 24px","alignItems":"center","marginTop":"4px"}}>
<BlackFridayCta event={event} location="hero" label="用 LINE 詢問我的優惠" inverse />
<a href="#school-offers" style={{"display":"inline-flex","alignItems":"center","gap":"8px","minHeight":"44px","fontSize":"15.5px","fontWeight":700,"color":"#faf8ef","textDecoration":"underline","textUnderlineOffset":"5px","textDecorationThickness":"1px"}}>先看看有哪些優惠<span aria-hidden="true">↓</span></a>
</div>
</div>
<figure style={{"margin":"0","padding":"0 14px 14px 0"}}>
<img src="/events/black-friday-2026/photo-street-group.jpg" width="896" height="846" fetchPriority="high" alt="哩來學長姐與學生在都柏林街頭的自拍合照" style={{"aspectRatio":"auto 896 / 846","display":"block","width":"100%","height":"auto","border":"1px solid rgba(255,255,255,.2)","boxShadow":"14px 14px 0 #ffbe12"}} />
<figcaption style={{"marginTop":"22px","fontSize":"13px","color":"rgba(250,248,239,.72)"}}>Dublin｜哩來學長姐與學弟妹的城市散步</figcaption>
</figure>
</div>
<div aria-hidden="true" style={{"position":"relative","margin":"72px -4vw -10px","padding":"20px 4vw 24px","background":"#ffbe12","transform":"rotate(-2deg)","display":"flex","justifyContent":"center","alignItems":"center","gap":"14px 28px","flexWrap":"wrap"}}>
<span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(26px,3.4vw,44px)","fontWeight":900,"color":"#0b3927","lineHeight":1.2}}>學校優惠 × 哩來加碼</span>
<span style={{"fontFamily":"'Black Friday Inter',sans-serif","fontSize":"13px","fontWeight":900,"letterSpacing":".14em","color":"#0b3927"}}>BLACK FRIDAY · 11/30 截止</span>
</div>
</section>

<section id="stack" className={styles["bf-sec"]} data-screen-label="Stack" style={{"padding":"104px 0 96px","borderBottom":"1px solid #cfe0d3"}}>
<div style={{"width":"min(1160px,100% - 40px)","margin":"0 auto","display":"flex","flexDirection":"column","gap":"40px"}}>
<header style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
<p style={{"margin":"0","fontSize":"12px","fontWeight":900,"letterSpacing":".09em","textTransform":"uppercase","color":"#005230"}}>HOW IT STACKS · 優惠怎麼疊加</p>
<h2 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(30px,3.6vw,44px)","fontWeight":900,"lineHeight":1.28,"letterSpacing":"-.012em","color":"#0b3927"}}>學校有優惠，哩來再加碼。</h2>
</header>
<div className={styles["bf-stack"]}>
<div style={{"display":"flex","flexDirection":"column","gap":"8px","padding":"24px","background":"#fffff6","border":"1px solid #cfe0d3","borderRadius":"4px"}}><p style={{"margin":"0","fontSize":"12px","fontWeight":900,"letterSpacing":".09em","color":"#005230"}}>學校</p><h3 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"22px","fontWeight":900,"lineHeight":1.35,"color":"#0b3927"}}>學費優惠</h3></div>
<div className={styles["bf-plus"]} aria-hidden="true" style={{"alignSelf":"center","width":"44px","height":"44px","borderRadius":"999px","background":"#ffbe12","color":"#0b3927","display":"grid","placeItems":"center","fontFamily":"'Black Friday Inter',sans-serif","fontSize":"26px","fontWeight":900,"lineHeight":1}}>+</div>
<div style={{"display":"flex","flexDirection":"column","gap":"8px","padding":"24px","background":"#fffff6","border":"1px solid #cfe0d3","borderRadius":"4px"}}><p style={{"margin":"0","fontSize":"12px","fontWeight":900,"letterSpacing":".09em","color":"#005230"}}>學校</p><h3 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"22px","fontWeight":900,"lineHeight":1.35,"color":"#0b3927"}}>指定學校免註冊費</h3></div>
<div className={styles["bf-plus"]} aria-hidden="true" style={{"alignSelf":"center","width":"44px","height":"44px","borderRadius":"999px","background":"#ffbe12","color":"#0b3927","display":"grid","placeItems":"center","fontFamily":"'Black Friday Inter',sans-serif","fontSize":"26px","fontWeight":900,"lineHeight":1}}>+</div>
<div style={{"display":"flex","flexDirection":"column","gap":"8px","padding":"24px","background":"#0b3927","borderRadius":"4px"}}><p style={{"margin":"0","fontSize":"12px","fontWeight":900,"letterSpacing":".09em","color":"#ffbe12"}}>哩來</p><h3 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"22px","fontWeight":900,"lineHeight":1.35,"color":"#faf8ef"}}>適用的哩來加碼</h3></div>
</div>
<p style={{"margin":"0","maxWidth":"720px","fontSize":"17px","lineHeight":1.75,"color":"#1a1a1a"}}>每項優惠的資格分別認定，符合條件即可疊加享有。</p>
<div style={{"display":"flex","flexDirection":"column","gap":"14px","paddingTop":"28px","borderTop":"1px solid #cfe0d3"}}>
<p style={{"margin":"0","fontSize":"15px","fontWeight":800,"color":"#0b3927"}}>你現在在哪個階段？</p>
<div className={styles["bf-3"]}>
<a href="#school-offers" style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px","minHeight":"76px","padding":"14px 20px","background":"#fffff6","border":"1px solid #cfe0d3","borderRadius":"13px","textDecoration":"none","transition":"border-color .2s ease,transform .2s ease"}}><span style={{"display":"flex","flexDirection":"column","gap":"4px"}}><span style={{"fontSize":"16px","fontWeight":800,"color":"#0b3927"}}>正在規劃出發</span><span style={{"fontSize":"13.5px","color":"#5f675f"}}>看學校優惠</span></span><span aria-hidden="true" style={{"fontSize":"18px","color":"#005230"}}>↓</span></a>
<a href="#departure" style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px","minHeight":"76px","padding":"14px 20px","background":"#fffff6","border":"1px solid #cfe0d3","borderRadius":"13px","textDecoration":"none","transition":"border-color .2s ease,transform .2s ease"}}><span style={{"display":"flex","flexDirection":"column","gap":"4px"}}><span style={{"fontSize":"16px","fontWeight":800,"color":"#0b3927"}}>已選好學校</span><span style={{"fontSize":"13.5px","color":"#5f675f"}}>看出發加碼</span></span><span aria-hidden="true" style={{"fontSize":"18px","color":"#005230"}}>↓</span></a>
<a href="#renewal" style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px","minHeight":"76px","padding":"14px 20px","background":"#fffff6","border":"1px solid #cfe0d3","borderRadius":"13px","textDecoration":"none","transition":"border-color .2s ease,transform .2s ease"}}><span style={{"display":"flex","flexDirection":"column","gap":"4px"}}><span style={{"fontSize":"16px","fontWeight":800,"color":"#0b3927"}}>準備語校續簽</span><span style={{"fontSize":"13.5px","color":"#5f675f"}}>看續簽優惠</span></span><span aria-hidden="true" style={{"fontSize":"18px","color":"#005230"}}>↓</span></a>
</div>
</div>
</div>
</section>

<section id="school-offers" className={styles["bf-sec"]} data-screen-label="School offers" style={{"padding":"96px 0","background":"#fffff6","borderBottom":"1px solid #cfe0d3"}}>
<div style={{"width":"min(1160px,100% - 40px)","margin":"0 auto","display":"flex","flexDirection":"column","gap":"40px"}}>
<header style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
<p style={{"margin":"0","fontSize":"12px","fontWeight":900,"letterSpacing":".09em","textTransform":"uppercase","color":"#005230"}}>SCHOOL OFFERS · 學校黑五優惠</p>
<h2 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(30px,3.6vw,44px)","fontWeight":900,"lineHeight":1.28,"letterSpacing":"-.012em","color":"#0b3927"}}>你的愛爾蘭計畫，<br />從這波學校優惠開始。</h2>
</header>
<div className={styles["bf-2"]}>
<div style={{"display":"flex","flexDirection":"column","gap":"20px","minWidth":"0"}}>
<article style={{"position":"relative","background":"#0b3927","borderRadius":"4px","color":"#faf8ef"}}>
<div className={styles["bf-card"]} style={{"padding":"32px 36px 28px","display":"flex","flexDirection":"column","gap":"10px"}}>
<p style={{"margin":"0","fontSize":"14px","fontWeight":800,"letterSpacing":".06em","color":"#ffbe12"}}>優惠 A｜指定語校課程</p>
<div style={{"display":"flex","alignItems":"flex-end","gap":"10px","flexWrap":"wrap","paddingTop":"6px"}}>
<span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"28px","fontWeight":900,"lineHeight":1,"paddingBottom":"8px"}}>最高</span>
<span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(84px,9vw,124px)","fontWeight":900,"lineHeight":0.84,"letterSpacing":"-.04em","color":"#ffbe12"}}>30</span>
<span style={{"display":"flex","flexDirection":"column","fontFamily":"'Black Friday Inter',sans-serif","fontWeight":900,"color":"#ffbe12","lineHeight":0.9,"paddingBottom":"3px"}}><span style={{"fontSize":"clamp(34px,3.6vw,50px)"}}>%</span><span style={{"fontSize":"clamp(30px,3.2vw,44px)"}}>OFF</span></span>
</div>
<p style={{"margin":"8px 0 0","fontFamily":"'Black Friday Serif',serif","fontSize":"24px","fontWeight":900,"lineHeight":1.3}}>最低 7 折優惠</p>
<p style={{"margin":"0","fontSize":"15px","lineHeight":1.65,"color":"rgba(250,248,239,.88)"}}>適用指定學校與課程，實際優惠依方案而異。</p>
</div>
<div aria-hidden="true" style={{"position":"relative","height":"28px"}}>
<span style={{"position":"absolute","left":"-14px","top":"0","width":"28px","height":"28px","borderRadius":"999px","background":"#fffff6"}}></span>
<span style={{"position":"absolute","left":"24px","right":"24px","top":"13px","borderTop":"2px dashed rgba(250,248,239,.28)"}}></span>
<span style={{"position":"absolute","right":"-14px","top":"0","width":"28px","height":"28px","borderRadius":"999px","background":"#fffff6"}}></span>
</div>
<div className={styles["bf-card"]} style={{"padding":"16px 36px 32px"}}>
<p style={{"margin":"0","fontSize":"15.5px","lineHeight":1.75,"color":"rgba(250,248,239,.88)"}}>新生報名與語校續簽皆有適用的學校優惠。<br />依你的學習需求與預計時間，一起確認合適學校的黑五方案。</p>
</div>
</article>
<article className={styles["bf-card"]} aria-labelledby="case-title" style={{"background":"#faf8ef","border":"1px solid #cfe0d3","borderRadius":"4px","padding":"28px 32px","display":"flex","flexDirection":"column","gap":"14px"}}>
<img src="/events/black-friday-2026/isi-dublin-logo.png" width="664" height="117" alt="ISI Dublin" loading="lazy" decoding="async" style={{"aspectRatio":"auto 664 / 117","display":"block","alignSelf":"flex-start","height":"clamp(36px,3.4vw,44px)","width":"auto","maxWidth":"100%"}} />
<p style={{"margin":"4px 0 0","fontSize":"12px","fontWeight":900,"letterSpacing":".09em","color":"#005230"}}>精選黑五課程優惠</p>
<h3 id="case-title" style={{"margin":"0","display":"flex","flexDirection":"column","gap":"2px","fontFamily":"'Black Friday Serif',serif","fontWeight":900,"lineHeight":1.4,"color":"#0b3927"}}><span style={{"fontFamily":"'Black Friday Inter',sans-serif","fontSize":"16px","fontWeight":800,"letterSpacing":".01em"}}>ISI Dublin</span><span style={{"fontSize":"22px"}}>25＋8 打工遊學｜下午班</span></h3>
<div style={{"display":"flex","alignItems":"baseline","gap":"8px 16px","flexWrap":"wrap"}}>
<p style={{"margin":"0","display":"flex","flexDirection":"column","gap":"2px"}}><span style={{"fontSize":"13px","fontWeight":700,"color":"#005230"}}>優惠價</span><span style={{"fontFamily":"'Black Friday Inter',sans-serif","fontSize":"clamp(48px,5vw,60px)","fontWeight":900,"lineHeight":1,"letterSpacing":"-.02em","color":"#0b3927","whiteSpace":"nowrap"}}>€2,520</span></p>
<p style={{"margin":"0","fontSize":"16px","color":"#5f675f","whiteSpace":"nowrap"}}>原價 <s style={{"fontFamily":"'Black Friday Inter',sans-serif","fontWeight":700}}>€3,520</s></p>
</div>
<div style={{"display":"flex","flexWrap":"wrap","gap":"8px"}}>
<span style={{"padding":"6px 14px","borderRadius":"999px","background":"#ffbe12","color":"#0b3927","fontSize":"15px","fontWeight":900,"whiteSpace":"nowrap"}}>現省 €1,000</span>
</div>
<p style={{"margin":"0","display":"flex","alignItems":"center","gap":"8px","paddingTop":"12px","borderTop":"1px solid #cfe0d3","fontSize":"15px","fontWeight":800,"color":"#0b3927"}}><Icon name="calendar-days" size="md" color="#005230" />申請期限：2026/11/30 截止</p>
</article>
</div>
<article className={styles["bf-card"]} style={{"background":"#faf8ef","border":"1px solid #cfe0d3","borderRadius":"4px","boxShadow":"14px 14px 0 rgba(0,82,48,.08)","padding":"32px 36px","display":"flex","flexDirection":"column","gap":"14px"}}>
<p style={{"margin":"0","fontSize":"14px","fontWeight":800,"letterSpacing":".06em","color":"#005230"}}>優惠 B｜指定學校限時優惠</p>
<p style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(56px,6.6vw,84px)","fontWeight":900,"lineHeight":1.05,"letterSpacing":"-.02em","color":"#0b3927"}}>免註冊費</p>
<p style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"22px","fontWeight":900,"lineHeight":1.4,"color":"#0b3927"}}>明年才出發，這個月也能先申請。</p>
<p style={{"margin":"0","fontSize":"15.5px","lineHeight":1.75,"color":"#5f675f"}}>指定學校於 2026/11/30 前送出申請，即可依適用條件享免註冊費優惠。課程週數、團報條件與適用開課日期依各校規定。</p>
{blackFridaySchoolOffers.map(s => <Fragment key={s.school}>
<div style={{"marginTop":"6px","background":"#0b3927","borderRadius":"4px","padding":"22px 24px","display":"flex","flexDirection":"column","gap":"12px"}}>
<div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"10px 12px","flexWrap":"wrap"}}>
<span style={{"display":"inline-flex","padding":"6px 10px","background":"#fffff6","borderRadius":"2px"}}><img src={s.logo} width={s.logoW} height={s.logoH} alt="" loading="lazy" decoding="async" style={{"aspectRatio":`auto ${s.logoW} / ${s.logoH}`,"display":"block","height":"32px","width":"auto"}} /></span>
<span style={{"whiteSpace":"nowrap","flex":"0 0 auto","padding":"3px 10px","border":"1px solid rgba(255,255,255,.28)","borderRadius":"999px","fontSize":"12px","fontWeight":800,"color":"rgba(250,248,239,.82)"}}>優惠示例</span>
</div>
<div style={{"display":"flex","flexDirection":"column","gap":"2px"}}>
<p style={{"margin":"0","fontFamily":"'Black Friday Inter',sans-serif","fontSize":"clamp(17px,1.6vw,19px)","fontWeight":800,"lineHeight":1.35,"color":"#faf8ef","overflowWrap":"normal","wordBreak":"keep-all"}}>{s.school}</p>
<p style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"30px","fontWeight":900,"lineHeight":1.25,"color":"#ffbe12"}}>{s.offer}</p>
</div>
<dl style={{"margin":"0","display":"grid","gridTemplateColumns":"auto minmax(0,1fr)","gap":"8px 16px","fontSize":"15px","lineHeight":1.55}}>
<dt style={{"color":"rgba(250,248,239,.7)"}}>適用課程</dt><dd style={{"margin":"0","color":"#faf8ef","fontWeight":700,"display":"flex","flexDirection":"column"}}><span style={{"wordBreak":"keep-all"}}>{s.course}</span><span>{s.course2}</span></dd>
<dt style={{"color":"rgba(250,248,239,.7)"}}>團報條件</dt><dd style={{"margin":"0","color":"#faf8ef","fontWeight":700}}>{s.group}</dd>
<dt style={{"color":"rgba(250,248,239,.7)"}}>優惠內容</dt><dd style={{"margin":"0","color":"#faf8ef","fontWeight":700}}>{s.offer}</dd>
<dt style={{"color":"rgba(250,248,239,.7)"}}>申請期限</dt><dd style={{"margin":"0","color":"#faf8ef","fontWeight":700}}>{s.deadline}</dd>
<dt style={{"color":"rgba(250,248,239,.7)"}}>開課</dt><dd style={{"margin":"0","color":"#faf8ef","fontWeight":700}}>{s.start}</dd>
</dl>
</div>
</Fragment>)}
<p style={{"margin":"0","fontSize":"15px","lineHeight":1.7,"color":"#1a1a1a"}}>其他合作語校也有適用優惠，歡迎詢問學長姐。</p>
</article>
</div>
<div style={{"display":"flex","flexWrap":"wrap","gap":"16px 24px","alignItems":"center","justifyContent":"space-between","paddingTop":"8px"}}>
<p style={{"margin":"0","display":"inline-flex","alignItems":"center","gap":"10px","padding":"10px 16px","background":"#eaf4ec","border":"1px solid #cfe0d3","borderRadius":"999px","fontSize":"14.5px","fontWeight":700,"color":"#0b3927"}}><Icon name="check" size="md" color="#005230" />符合條件，可與學費優惠及哩來加碼疊加</p>
<BlackFridayCta event={event} location="school_offers" label="詢問適合我的學校優惠" />
</div>
</div>
</section>

<section id="departure" className={styles["bf-sec"]} data-screen-label="Departure bonus" style={{"padding":"96px 0","borderBottom":"1px solid #cfe0d3"}}>
<div style={{"width":"min(1160px,100% - 40px)","margin":"0 auto","display":"flex","flexDirection":"column","gap":"36px"}}>
<header style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
<p style={{"margin":"0","fontSize":"12px","fontWeight":900,"letterSpacing":".09em","textTransform":"uppercase","color":"#005230"}}>DEPARTURE BONUS · 哩來出發大禮包</p>
<h2 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(30px,3.6vw,44px)","fontWeight":900,"lineHeight":1.28,"letterSpacing":"-.012em","color":"#0b3927"}}>出發前，<br />哩來再幫你準備一點。</h2>
</header>
<div className={styles["bf-card"]} style={{"background":"#0b3927","borderRadius":"4px","padding":"30px 36px","display":"flex","flexDirection":"column","gap":"20px"}}>
<p style={{"margin":"0","fontSize":"15px","fontWeight":800,"color":"#ffbe12"}}>於 2026/11/30 前送出報名表，符合以下任一條件，即可享大禮包的黑五升級福利：</p>
<div className={styles["bf-elig"]}>
<div style={{"display":"flex","flexDirection":"column","gap":"6px"}}><span style={{"fontSize":"12px","fontWeight":900,"letterSpacing":".09em","color":"rgba(250,248,239,.7)"}}>條件 A</span><span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(22px,2.4vw,28px)","fontWeight":900,"lineHeight":1.35,"color":"#faf8ef"}}>兩人以上團報</span></div>
<div className={styles["bf-or"]} style={{"width":"56px","height":"56px","borderRadius":"999px","background":"#ffbe12","color":"#0b3927","display":"grid","placeItems":"center","fontFamily":"'Black Friday Serif',serif","fontSize":"24px","fontWeight":900}}>或</div>
<div style={{"display":"flex","flexDirection":"column","gap":"6px"}}><span style={{"fontSize":"12px","fontWeight":900,"letterSpacing":".09em","color":"rgba(250,248,239,.7)"}}>條件 B</span><span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(22px,2.4vw,28px)","fontWeight":900,"lineHeight":1.35,"color":"#faf8ef"}}>已選好學校，毋須諮詢直接報名</span></div>
</div>
</div>
<p style={{"margin":"-8px 0 0","fontSize":"16px","lineHeight":1.7,"color":"#5f675f"}}>依「四週以上短期課程」或「25＋8 打工遊學」享有對應福利。</p>
<div className={styles["bf-2"]}>
<article className={styles["bf-card"]} style={{"background":"#fffff6","border":"1px solid #cfe0d3","borderRadius":"4px","padding":"32px 36px","display":"flex","flexDirection":"column","gap":"14px"}}>
<div style={{"display":"flex","alignItems":"center","gap":"12px","flexWrap":"wrap"}}><h3 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"24px","fontWeight":900,"lineHeight":1.3,"color":"#0b3927"}}>四週以上短期課程</h3><span style={{"padding":"4px 14px","borderRadius":"999px","background":"#ffbe12","color":"#0b3927","fontSize":"13px","fontWeight":900}}>升級</span></div>
<p style={{"margin":"4px 0 0","display":"flex","alignItems":"center","gap":"8px","fontSize":"16px","fontWeight":700,"color":"#5f675f"}}>5 日網路卡<Icon name="arrow-right" size="md" color="#005230" />升級為</p>
<p style={{"margin":"0","display":"flex","alignItems":"baseline","gap":"12px","flexWrap":"wrap"}}><span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(56px,6vw,76px)","fontWeight":900,"lineHeight":1,"color":"#0b3927"}}>28 日</span><span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"22px","fontWeight":900,"color":"#0b3927"}}>門號網路方案</span></p>
<p style={{"margin":"0","fontSize":"17px","fontWeight":800,"color":"#1a1a1a"}}>Three Super Surfer</p>
<p style={{"margin":"2px 0 0","alignSelf":"flex-start","display":"flex","alignItems":"baseline","gap":"10px","flexWrap":"wrap","padding":"8px 16px","background":"#ffbe12","color":"#0b3927","fontSize":"15px","fontWeight":800}}>升級後方案價值<span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"28px","fontWeight":900,"lineHeight":1.1}}>€20／人</span></p>
<p style={{"margin":"0","fontSize":"13.5px","lineHeight":1.6,"color":"#5f675f"}}>€20 為升級後整個方案的價值。</p>
<figure style={{"margin":"8px 0 0","background":"#faf8ef","border":"1px solid #cfe0d3","borderRadius":"4px","padding":"24px","display":"flex","flexDirection":"column","alignItems":"center","gap":"10px"}}>
<img src="/events/black-friday-2026/three-super-surfer.png" width="284" height="180" loading="lazy" decoding="async" alt="Three Super Surfer 方案卡圖示" style={{"aspectRatio":"auto 284 / 180","display":"block","width":"100%","maxWidth":"284px","height":"auto"}} />
<figcaption style={{"fontSize":"13px","color":"#5f675f"}}>方案圖片示意</figcaption>
</figure>
</article>
<article className={styles["bf-card"]} style={{"background":"#fffff6","border":"1px solid #cfe0d3","borderRadius":"4px","padding":"32px 36px","display":"flex","flexDirection":"column","gap":"14px"}}>
<div style={{"display":"flex","alignItems":"center","gap":"12px","flexWrap":"wrap"}}><h3 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"24px","fontWeight":900,"lineHeight":1.3,"color":"#0b3927"}}>25＋8 打工遊學</h3><span style={{"padding":"4px 14px","borderRadius":"999px","background":"#ffbe12","color":"#0b3927","fontSize":"13px","fontWeight":900}}>加贈</span></div>
<p style={{"margin":"4px 0 0","fontSize":"16px","fontWeight":800,"color":"#005230"}}>每人加贈</p>
<p style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(36px,4.2vw,52px)","fontWeight":900,"lineHeight":1.15,"color":"#0b3927"}}>ISIC 國際學生證</p>
<p style={{"margin":"2px 0 0","alignSelf":"flex-start","display":"flex","alignItems":"baseline","gap":"10px","flexWrap":"wrap","padding":"8px 16px","background":"#ffbe12","color":"#0b3927","fontSize":"15px","fontWeight":800}}>申辦價值<span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"28px","fontWeight":900,"lineHeight":1.1}}>NT$350／人</span></p>
<p style={{"margin":"0","display":"flex","alignItems":"flex-start","gap":"10px","fontSize":"15.5px","lineHeight":1.6,"color":"#1a1a1a"}}><Icon name="check" size="md" color="#005230" style={{"marginTop":"3px"}} />原有 28 日門號網路方案福利照常享有。</p>
<figure style={{"margin":"8px 0 0","background":"#faf8ef","border":"1px solid #cfe0d3","borderRadius":"4px","padding":"24px","display":"flex","flexDirection":"column","alignItems":"center","gap":"10px"}}>
<img src="/events/black-friday-2026/isic-card-sample.png" width="272" height="190" loading="lazy" decoding="async" alt="ISIC 國際學生證卡面示意" style={{"aspectRatio":"auto 272 / 190","display":"block","width":"100%","maxWidth":"272px","height":"auto"}} />
<figcaption style={{"fontSize":"13px","fontWeight":700,"color":"#0b3927"}}>卡面示意</figcaption>
</figure>
</article>
</div>
<div style={{"display":"flex","justifyContent":"flex-start"}}>
<BlackFridayCta event={event} location="departure_bonus" label="詢問我的出發加碼" />
</div>
</div>
</section>

<section id="renewal" className={styles["bf-sec"]} data-screen-label="Renewal" style={{"padding":"96px 0","background":"#0b3927"}}>
<div className={styles["bf-renew"]} style={{"width":"min(1160px,100% - 40px)","margin":"0 auto","alignItems":"start"}}>
<div style={{"display":"flex","flexDirection":"column","gap":"18px"}}>
<p style={{"margin":"0","fontSize":"14px","fontWeight":900,"letterSpacing":".06em","color":"#ffbe12"}}>已經在愛爾蘭的你</p>
<h2 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(30px,3.6vw,44px)","fontWeight":900,"lineHeight":1.28,"letterSpacing":"-.012em","color":"#faf8ef"}}>還想繼續的生活，<br />哩來陪你延續。</h2>
<div style={{"marginTop":"20px","paddingTop":"24px","borderTop":"1px solid rgba(255,255,255,.18)","display":"flex","flexDirection":"column","gap":"6px"}}>
<p style={{"margin":"0","display":"flex","alignItems":"center","gap":"10px","fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(22px,2.4vw,28px)","fontWeight":900,"color":"#faf8ef"}}><Icon name="smartphone" size="xl" color="#ffbe12" />續簽首月電信費補助</p>
<p style={{"margin":"0","display":"flex","alignItems":"flex-end","gap":"14px"}}><span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(28px,3vw,36px)","fontWeight":900,"color":"#faf8ef","lineHeight":1,"paddingBottom":"14px"}}>最高</span><span style={{"fontFamily":"'Black Friday Inter',sans-serif","fontSize":"clamp(96px,12vw,168px)","fontWeight":900,"lineHeight":0.9,"letterSpacing":"-.04em","color":"#ffbe12"}}>€20</span></p>
</div>
<div style={{"marginTop":"8px","padding":"24px","border":"1px solid rgba(255,255,255,.22)","borderRadius":"13px","display":"flex","flexDirection":"column","gap":"14px"}}>
<h3 style={{"margin":"0","fontSize":"17px","fontWeight":900,"color":"#ffbe12"}}>補助怎麼領？</h3>
<ol style={{"listStyle":"none","margin":"0","padding":"0","display":"flex","flexDirection":"column","gap":"10px"}}>
<li style={{"display":"flex","gap":"12px","alignItems":"baseline","fontSize":"15.5px","lineHeight":1.6,"color":"#faf8ef"}}><span style={{"flex":"0 0 auto","fontFamily":"'Black Friday Inter',sans-serif","fontSize":"13px","fontWeight":900,"color":"#ffbe12"}}>01</span>透過哩來辦理本次活動適用的語校續簽。</li>
<li style={{"display":"flex","gap":"12px","alignItems":"baseline","fontSize":"15.5px","lineHeight":1.6,"color":"#faf8ef"}}><span style={{"flex":"0 0 auto","fontFamily":"'Black Friday Inter',sans-serif","fontSize":"13px","fontWeight":900,"color":"#ffbe12"}}>02</span>提供續簽首月的單月電信費證明。</li>
<li style={{"display":"flex","gap":"12px","alignItems":"baseline","fontSize":"15.5px","lineHeight":1.6,"color":"#faf8ef"}}><span style={{"flex":"0 0 auto","fontFamily":"'Black Friday Inter',sans-serif","fontSize":"13px","fontWeight":900,"color":"#ffbe12"}}>03</span>依證明所列費用補助，最高 €20。</li>
<li style={{"display":"flex","gap":"12px","alignItems":"baseline","fontSize":"15.5px","lineHeight":1.6,"color":"#faf8ef"}}><span style={{"flex":"0 0 auto","fontFamily":"'Black Friday Inter',sans-serif","fontSize":"13px","fontWeight":900,"color":"#ffbe12"}}>04</span>於續簽開始月份的次月底前發放。</li>
</ol>
<p style={{"margin":"0","paddingTop":"12px","borderTop":"1px solid rgba(255,255,255,.18)","fontSize":"14px","lineHeight":1.65,"color":"rgba(250,248,239,.82)"}}>例如：12 月開始續簽課程，補助於次年 1 月底前發放。</p>
</div>
</div>
<div style={{"display":"flex","flexDirection":"column","gap":"22px","alignItems":"flex-start"}}>
<p style={{"margin":"0","fontSize":"17px","lineHeight":1.85,"color":"rgba(250,248,239,.9)"}}>即日起至 2026/11/30，透過哩來辦理本次活動適用的語校續簽，<br />續簽第一個月電信費補助，最高 €20。</p>
<p style={{"margin":"0","display":"inline-flex","alignItems":"center","gap":"10px","padding":"10px 16px","border":"1px solid rgba(255,255,255,.28)","borderRadius":"999px","fontSize":"14.5px","fontWeight":700,"color":"#faf8ef"}}><Icon name="check" size="md" color="#ffbe12" />符合條件，可再搭配適用的學校黑五優惠。</p>
<BlackFridayCta event={event} location="renewal" label="用 LINE 詢問續簽優惠" inverse />
</div>
</div>
</section>

<section id="about" className={styles["bf-sec"]} data-screen-label="About" style={{"padding":"96px 0","borderBottom":"1px solid #cfe0d3"}}>
<div style={{"width":"min(1160px,100% - 40px)","margin":"0 auto","display":"flex","flexDirection":"column","gap":"44px"}}>
<div className={styles["bf-about"]}>
<div style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
<p style={{"margin":"0","fontSize":"12px","fontWeight":900,"letterSpacing":".09em","textTransform":"uppercase","color":"#005230"}}>ABOUT LILAI · 認識哩來</p>
<h2 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(30px,3.6vw,44px)","fontWeight":900,"lineHeight":1.28,"letterSpacing":"-.012em","color":"#0b3927"}}>優惠之外，<br />我們更想知道你為什麼想出發。</h2>
</div>
<p style={{"margin":"0","fontSize":"17px","lineHeight":1.85,"color":"#5f675f"}}>想加強英文、體驗不同生活，<br />還是給自己一段探索的時間？<br /><br />哩來學長姐陪你釐清出發動機、學習需求與生活期待，一起找到適合的課程與學校。</p>
</div>
<figure style={{"margin":"0","padding":"0 14px 14px 0"}}>
<img src="/events/black-friday-2026/photo-cafe-welcome.jpg" width="1080" height="452" loading="lazy" decoding="async" alt="哩來學長姐與學弟妹在愛爾蘭咖啡店相聚，手拿歡迎卡片" style={{"display":"block","width":"100%","height":"auto","aspectRatio":"1080 / 452","objectFit":"cover","border":"1px solid #cfe0d3","boxShadow":"14px 14px 0 rgba(0,82,48,.08)"}} />
</figure>
<ol className={styles["bf-3"]} style={{"listStyle":"none","margin":"0","padding":"0"}}>
<li style={{"display":"flex","flexDirection":"column","gap":"10px","paddingTop":"20px","borderTop":"2px solid #0b3927"}}><span style={{"fontFamily":"'Black Friday Inter',sans-serif","fontSize":"14px","fontWeight":900,"letterSpacing":".09em","color":"#005230"}}>01</span><span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"22px","fontWeight":900,"lineHeight":1.4,"color":"#0b3927"}}>理解你的出發動機</span></li>
<li style={{"display":"flex","flexDirection":"column","gap":"10px","paddingTop":"20px","borderTop":"2px solid #0b3927"}}><span style={{"fontFamily":"'Black Friday Inter',sans-serif","fontSize":"14px","fontWeight":900,"letterSpacing":".09em","color":"#005230"}}>02</span><span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"22px","fontWeight":900,"lineHeight":1.4,"color":"#0b3927"}}>釐清學習與生活期待</span></li>
<li style={{"display":"flex","flexDirection":"column","gap":"10px","paddingTop":"20px","borderTop":"2px solid #0b3927"}}><span style={{"fontFamily":"'Black Friday Inter',sans-serif","fontSize":"14px","fontWeight":900,"letterSpacing":".09em","color":"#005230"}}>03</span><span style={{"fontFamily":"'Black Friday Serif',serif","fontSize":"22px","fontWeight":900,"lineHeight":1.4,"color":"#0b3927"}}>一起找到適合的學校</span></li>
</ol>
<p style={{"margin":"8px 0 0","fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(24px,2.6vw,30px)","fontWeight":900,"color":"#0b3927"}}>一起把夢，過成生活。</p>
</div>
</section>

<section id="faq" className={styles["bf-sec"]} data-screen-label="FAQ" style={{"padding":"96px 0","background":"#fffff6","borderBottom":"1px solid #cfe0d3"}}>
<div style={{"width":"min(940px,100% - 40px)","margin":"0 auto","display":"flex","flexDirection":"column","gap":"36px"}}>
<header style={{"display":"flex","flexDirection":"column","gap":"16px"}}>
<p style={{"margin":"0","fontSize":"12px","fontWeight":900,"letterSpacing":".09em","textTransform":"uppercase","color":"#005230"}}>FREQUENTLY ASKED</p>
<h2 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(30px,3.6vw,44px)","fontWeight":900,"lineHeight":1.28,"color":"#0b3927"}}>常見問題</h2>
</header>
<BlackFridayFaq />
</div>
</section>

{event.status !== "archived" && (<section id="final" className={styles["bf-sec"]} data-screen-label="Final CTA" style={{"position":"relative","overflow":"hidden","background":"#0b3927","padding":"104px 0"}}>

<div aria-hidden="true" style={{"position":"absolute","left":"50%","bottom":"-.16em","transform":"translateX(-50%)","fontFamily":"'Black Friday Inter',sans-serif","fontWeight":900,"fontSize":"clamp(64px,13vw,200px)","lineHeight":1,"letterSpacing":"-.02em","color":"#0f4631","whiteSpace":"nowrap","pointerEvents":"none"}}>BLACK FRIDAY</div>

<div style={{"position":"relative","width":"min(940px,100% - 40px)","margin":"0 auto","display":"flex","flexDirection":"column","alignItems":"center","gap":"22px","textAlign":"center"}}>
<p style={{"margin":"0","padding":"6px 14px","borderRadius":"999px","background":"#ffbe12","color":"#0b3927","fontSize":"13px","fontWeight":900,"letterSpacing":".04em"}}>傳送「黑五」</p>
<h2 style={{"margin":"0","fontFamily":"'Black Friday Serif',serif","fontSize":"clamp(30px,4vw,48px)","fontWeight":900,"lineHeight":1.3,"letterSpacing":"-.012em","color":"#faf8ef"}}>下一段愛爾蘭生活，<br />從聊聊你的計畫開始。</h2>
<p style={{"margin":"0","maxWidth":"620px","fontSize":"17px","lineHeight":1.85,"color":"rgba(250,248,239,.88)"}}>加入或開啟哩來 LINE，傳送「黑五」，<br />告訴我們你準備出發或續簽，以及預計月份，<br />學長姐陪你確認適用優惠與下一步。</p>
<BlackFridayCta event={event} location="footer" label="加入 LINE，聊聊我的計畫" inverse />
<p style={{"margin":"0","fontSize":"14px","color":"rgba(250,248,239,.78)"}}>由哩來學長姐真人回覆。</p>
<p style={{"margin":"20px 0 0","fontFamily":"'Black Friday Serif',serif","fontSize":"24px","fontWeight":900,"color":"#ffbe12"}}>一起把夢，過成生活。</p>
</div>
</section>)}

<section id="terms" aria-labelledby="terms-title" style={{"padding":"56px 0 64px","background":"#faf8ef"}}>
<div style={{"width":"min(940px,100% - 40px)","margin":"0 auto","display":"flex","flexDirection":"column","gap":"16px"}}>
<h2 id="terms-title" style={{"margin":"0","fontSize":"17px","fontWeight":900,"color":"#0b3927"}}>黑五出發計畫・活動說明</h2>
<ul style={{"margin":"0","padding":"0 0 0 20px","display":"flex","flexDirection":"column","gap":"8px","fontSize":"15px","lineHeight":1.7,"color":"#1a1a1a"}}>{blackFridayTerms.map(term => <li key={term}>{term}</li>)}</ul>
</div>
</section>

      </div>
    </div>
  </BlackFridayInteractions>;
}

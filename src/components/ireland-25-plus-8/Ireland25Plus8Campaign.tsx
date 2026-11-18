import { ireland25Plus8Schools, ireland25Plus8Tiers } from "@/content/ireland-25-plus-8-copy";
import { Ireland25Plus8Interactions } from "./Ireland25Plus8Interactions";
import { Ireland25Plus8Cta } from "./Ireland25Plus8Cta";
import { Ireland25Plus8Faq } from "./Ireland25Plus8Faq";
import "./fonts.css";

// Empty location/consult paragraphs preserve the browser-repaired source DOM without hydration errors.
// Preserve the supplied composition and inline styles, like BlackFridayCampaign.
export function Ireland25Plus8Campaign() {
  return <Ireland25Plus8Interactions>
<nav aria-label="閱讀旅程" className="l-jr" data-flash="false" data-show="false">
      <ol style={{"listStyle": "none", "margin": "0px", "padding": "0px", "display": "flex", "flexDirection": "column", "gap": "14px", "position": "relative"}}>
        <li aria-hidden="true" style={{"position": "absolute", "left": "21px", "top": "22px", "bottom": "22px", "width": "2px", "background": "rgb(207, 224, 211)"}}></li>
        <li aria-hidden="true" style={{"position": "absolute", "left": "21px", "top": "22px", "width": "2px", "height": "calc(0% - 0px)", "background": "rgb(0, 82, 48)", "transition": "height 250ms"}}></li>
        <li style={{"position": "relative"}}>
          <a aria-current="false" aria-label="01 認識 25+8" className="l-jr-a" data-jump="system" data-state="todo" href="#system">
            <span className="l-jr-dot">01</span>
            <span aria-hidden="true" className="l-jr-lb">認識 25+8</span>
          </a>
        </li>
        <li style={{"position": "relative"}}>
          <a aria-current="false" aria-label="02 探索預算與生活" className="l-jr-a" data-jump="budget" data-state="todo" href="#budget">
            <span className="l-jr-dot">02</span>
            <span aria-hidden="true" className="l-jr-lb">探索預算與生活</span>
          </a>
        </li>
        <li style={{"position": "relative"}}>
          <a aria-current="false" aria-label="03 挑選適合的學校" className="l-jr-a" data-jump="choose" data-state="todo" href="#choose">
            <span className="l-jr-dot">03</span>
            <span aria-hidden="true" className="l-jr-lb">挑選適合的學校</span>
          </a>
        </li>
        <li style={{"position": "relative"}}>
          <a aria-current="false" aria-label="04 準備你的出發" className="l-jr-a" data-jump="why-lilai" data-state="todo" href="#why-lilai">
            <span className="l-jr-dot">04</span>
            <span aria-hidden="true" className="l-jr-lb">準備你的出發</span>
          </a>
        </li>
      </ol>
    </nav>
<main>
      <section className="l-sec" id="top" style={{"padding": "56px 0px 48px", "borderBottom": "1px solid rgb(207, 224, 211)"}}>
        <div style={{"width": "min(1160px, 100% - 40px)", "margin": "0px auto", "display": "flex", "flexDirection": "column", "gap": "40px"}}>
          <nav aria-label="麵包屑" style={{"fontSize": "13px", "lineHeight": "1.6", "color": "rgb(95, 103, 95)"}}>
            <a href="https://lilaiireland.com/" style={{"color": "rgb(95, 103, 95)"}}>哩來愛爾蘭</a>
            <span aria-hidden="true" style={{"margin": "0px 8px"}}>/</span>
            <span aria-current="page" style={{"color": "rgb(11, 57, 39)"}}>愛爾蘭 25+8 打工遊學</span>
          </nav>
          <div className="l-split" style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) minmax(0px, 1fr)", "gap": "56px", "alignItems": "center", "marginTop": "-16px"}}>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "20px"}}>
              <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "textTransform": "uppercase", "color": "rgb(0, 82, 48)"}}>IRELAND WORK &amp; STUDY GUIDE</p>
              <h1 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(36px, 5vw, 60px)", "fontWeight": "900", "lineHeight": "1.16", "letterSpacing": "-0.02em", "color": "rgb(11, 57, 39)"}}>愛爾蘭 25+8 是什麼？</h1>
              <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(20px, 2.2vw, 26px)", "fontWeight": "700", "lineHeight": "1.45", "color": "rgb(0, 82, 48)", "textWrap": "balance"}}>25 週學英文，開啟不一樣的愛爾蘭生活。</p>
              <p style={{"margin": "0px", "maxWidth": "560px", "fontSize": "17px", "lineHeight": "1.75", "color": "rgb(63, 70, 63)", "textWrap": "pretty"}}>透過合格英文課程，有機會取得最長約 8 個月的學生居留許可，在符合規定下兼職工作，體驗真正的海外生活。了解費用、工作規則、學校選擇，以及哩來如何陪你準備出發。</p>
              <div data-cta-zone="hero" style={{"display": "flex", "flexWrap": "wrap", "gap": "12px 16px", "alignItems": "center", "marginTop": "4px"}}>
                <div className="sc-host-x" style={{"display": "contents"}}>
                  <Ireland25Plus8Cta href="/consult" label="免費評估我的 25+8 出發計畫" />
                </div>
                <div className="sc-host-x" style={{"display": "contents"}}>
                  <Ireland25Plus8Cta href="#system" variant="surface" label="先了解 25+8" />
                </div>
              </div>
            </div>
            <aside aria-label="25+8 重點數字" style={{"background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "boxShadow": "rgba(0, 82, 48, 0.08) 14px 14px 0px", "padding": "clamp(24px, 3vw, 36px)", "display": "flex", "flexDirection": "column"}}>
              <p style={{"margin": "0px 0px 8px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "color": "rgb(0, 82, 48)"}}>25+8 AT A GLANCE</p>
              <div style={{"display": "grid", "gridTemplateColumns": "minmax(0px, auto) minmax(0px, 1fr)", "gap": "4px 20px", "alignItems": "baseline", "padding": "18px 0px", "borderBottom": "1px solid rgb(207, 224, 211)"}}>
                <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(30px, 3.4vw, 40px)", "fontWeight": "900", "color": "rgb(11, 57, 39)", "lineHeight": "1.1"}}>25 週</p>
                <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.6", "color": "rgb(63, 70, 63)"}}>合格英文課程，每週至少 15 小時</p>
              </div>
              <div style={{"display": "grid", "gridTemplateColumns": "minmax(0px, auto) minmax(0px, 1fr)", "gap": "4px 20px", "alignItems": "baseline", "padding": "18px 0px", "borderBottom": "1px solid rgb(207, 224, 211)"}}>
                <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(30px, 3.4vw, 40px)", "fontWeight": "900", "color": "rgb(11, 57, 39)", "lineHeight": "1.1"}}>約 8 個月</p>
                <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.6", "color": "rgb(63, 70, 63)"}}>一期學生居留，最多三期、累計約兩年</p>
              </div>
              <div style={{"display": "grid", "gridTemplateColumns": "minmax(0px, auto) minmax(0px, 1fr)", "gap": "4px 20px", "alignItems": "baseline", "padding": "18px 0px 0px"}}>
                <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(30px, 3.4vw, 40px)", "fontWeight": "900", "color": "rgb(11, 57, 39)", "lineHeight": "1.1"}}>20 / 40</p>
                <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.6", "color": "rgb(63, 70, 63)"}}>每週工時上限（小時），40 小時僅限官方指定期間</p>
              </div>
            </aside>
          </div>
          <nav aria-label="快速導覽" className="l-qn" style={{"display": "grid", "gridTemplateColumns": "repeat(3, minmax(0px, 1fr))", "gap": "12px"}}>
            <a className="scp0" href="#system" style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "10px", "minHeight": "68px", "padding": "12px 20px", "background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "textDecoration": "none", "color": "rgb(11, 57, 39)", "fontSize": "16.5px", "fontWeight": "800", "lineHeight": "1.35", "transition": "border-color 200ms, transform 200ms"}}>
              <span style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                <span className="l-qn-n" style={{"fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "color": "rgb(213, 149, 0)"}}>01 制度</span>
                <span>25+8 是什麼？</span>
              </span>
              <span aria-hidden="true" className="l-qn-ar" style={{"color": "rgb(0, 82, 48)"}}>→</span>
            </a>
            <a className="scp0" href="#budget" style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "10px", "minHeight": "68px", "padding": "12px 20px", "background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "textDecoration": "none", "color": "rgb(11, 57, 39)", "fontSize": "16.5px", "fontWeight": "800", "lineHeight": "1.35", "transition": "border-color 200ms, transform 200ms"}}>
              <span style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                <span className="l-qn-n" style={{"fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "color": "rgb(213, 149, 0)"}}>02 費用</span>
                <span>要準備多少錢？</span>
              </span>
              <span aria-hidden="true" className="l-qn-ar" style={{"color": "rgb(0, 82, 48)"}}>→</span>
            </a>
            <a className="scp0" href="#choose" style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "10px", "minHeight": "68px", "padding": "12px 20px", "background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "textDecoration": "none", "color": "rgb(11, 57, 39)", "fontSize": "16.5px", "fontWeight": "800", "lineHeight": "1.35", "transition": "border-color 200ms, transform 200ms"}}>
              <span style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                <span className="l-qn-n" style={{"fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "color": "rgb(213, 149, 0)"}}>03 選校</span>
                <span>如何選學校？</span>
              </span>
              <span aria-hidden="true" className="l-qn-ar" style={{"color": "rgb(0, 82, 48)"}}>→</span>
            </a>
          </nav>
          <div className="l-stats" style={{"display": "grid", "gridTemplateColumns": "repeat(3, minmax(0px, 1fr))", "borderTop": "1px solid rgb(207, 224, 211)", "paddingTop": "20px", "marginTop": "-8px"}}>
            <div style={{"padding": "0px 20px 0px 0px", "display": "flex", "flexDirection": "column", "gap": "2px"}}>
              <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "26px", "fontWeight": "900", "color": "rgb(11, 57, 39)", "lineHeight": "1.2"}}>400+</p>
              <p style={{"margin": "0px", "fontSize": "14px", "color": "rgb(95, 103, 95)"}}>位學弟妹的陪伴經驗</p>
            </div>
            <div style={{"padding": "0px 20px", "borderLeft": "1px solid rgb(207, 224, 211)", "display": "flex", "flexDirection": "column", "gap": "2px"}}>
              <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "26px", "fontWeight": "900", "color": "rgb(11, 57, 39)", "lineHeight": "1.2"}}>20+</p>
              <p style={{"margin": "0px", "fontSize": "14px", "color": "rgb(95, 103, 95)"}}>間精選合作語校</p>
            </div>
            <div style={{"padding": "0px 20px", "borderLeft": "1px solid rgb(207, 224, 211)", "display": "flex", "flexDirection": "column", "gap": "2px"}}>
              <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "26px", "fontWeight": "900", "color": "rgb(11, 57, 39)", "lineHeight": "1.2"}}>4.8 / 5</p>
              <p style={{"margin": "0px", "fontSize": "14px", "color": "rgb(95, 103, 95)"}}>說明會滿意度（以上）</p>
            </div>
          </div>
        </div>
      </section>
      <section className="l-sec" id="system" style={{"background": "rgb(255, 255, 246)", "borderBottom": "1px solid rgb(207, 224, 211)", "padding": "96px 0px"}}>
        <div style={{"width": "min(1160px, 100% - 40px)", "margin": "0px auto", "display": "flex", "flexDirection": "column", "gap": "36px"}}>
          <header style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
            <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "textTransform": "uppercase", "color": "rgb(0, 82, 48)"}}>HOW 25+8 WORKS</p>
            <h2 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(27px, 3.4vw, 42px)", "fontWeight": "900", "lineHeight": "1.3", "letterSpacing": "-0.012em", "color": "rgb(11, 57, 39)", "textWrap": "balance"}}>25+8 到底是什麼？一次看懂愛爾蘭打工遊學制度。</h2>
            <p style={{"margin": "0px", "maxWidth": "680px", "fontSize": "17px", "lineHeight": "1.75", "color": "rgb(63, 70, 63)", "textWrap": "pretty"}}>25+8 是愛爾蘭長期英文課程方案的通稱，不是獨立的簽證類型：報名至少 25 週的合格英文課程，符合規定後可獲准最長約 8 個月的學生居留。點選各階段看說明。</p>
          </header>
          <div style={{"display": "flex", "flexDirection": "column", "gap": "0px"}}>
            <div aria-label="25+8 的三個階段" className="l-tl" role="tablist" style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 2.4fr) minmax(0px, 1fr) minmax(0px, 1.3fr)", "gap": "6px"}}>
              <button aria-controls="tl-panel-0" aria-selected="true" className="l-tab" id="tl-tab-0" role="tab" style={{"font": "inherit", "textAlign": "left", "cursor": "pointer", "minHeight": "44px", "padding": "16px 18px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px 4px 0px 0px", "background": "rgb(250, 248, 239)", "color": "rgb(11, 57, 39)", "display": "flex", "flexDirection": "column", "gap": "10px", "transition": "background 200ms"}} tabIndex={0} type="button">
                <span aria-hidden="true" style={{"display": "block", "height": "10px", "background": "rgb(0, 82, 48)"}}></span>
                <span className="l-tab-ey" style={{"fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "color": "rgb(0, 82, 48)"}}>25 WEEKS</span>
                <span className="l-tab-t" style={{"fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "20px", "fontWeight": "900", "lineHeight": "1.35"}}>25 週英文課程</span>
                <span className="l-tab-sub" style={{"fontSize": "14px", "color": "rgb(95, 103, 95)"}}>每週至少 15 小時</span>
              </button>
              <button aria-controls="tl-panel-1" aria-selected="false" className="l-tab" id="tl-tab-1" role="tab" style={{"font": "inherit", "textAlign": "left", "cursor": "pointer", "minHeight": "44px", "padding": "16px 18px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px 4px 0px 0px", "background": "rgb(250, 248, 239)", "color": "rgb(11, 57, 39)", "display": "flex", "flexDirection": "column", "gap": "10px", "transition": "background 200ms"}} tabIndex={-1} type="button">
                <span aria-hidden="true" style={{"display": "block", "height": "10px", "background": "rgb(255, 190, 18)"}}></span>
                <span className="l-tab-ey" style={{"fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "color": "rgb(138, 90, 0)"}}>HOLIDAY</span>
                <span className="l-tab-t" style={{"fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "20px", "fontWeight": "900", "lineHeight": "1.35"}}>假期與生活</span>
                <span className="l-tab-sub" style={{"fontSize": "14px", "color": "rgb(95, 103, 95)"}}>依學校課程安排</span>
              </button>
              <button aria-controls="tl-panel-2" aria-selected="false" className="l-tab" id="tl-tab-2" role="tab" style={{"font": "inherit", "textAlign": "left", "cursor": "pointer", "minHeight": "44px", "padding": "16px 18px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px 4px 0px 0px", "background": "rgb(250, 248, 239)", "color": "rgb(11, 57, 39)", "display": "flex", "flexDirection": "column", "gap": "10px", "transition": "background 200ms"}} tabIndex={-1} type="button">
                <span aria-hidden="true" style={{"display": "block", "height": "10px", "border": "2px dashed rgb(169, 198, 177)", "boxSizing": "border-box"}}></span>
                <span className="l-tab-ey" style={{"fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "color": "rgb(0, 82, 48)"}}>RENEWAL</span>
                <span className="l-tab-t" style={{"fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "20px", "fontWeight": "900", "lineHeight": "1.35"}}>續簽可能性</span>
                <span className="l-tab-sub" style={{"fontSize": "14px", "color": "rgb(95, 103, 95)"}}>最多三期、約兩年</span>
              </button>
            </div>
            <div aria-labelledby="tl-tab-0" id="tl-panel-0" role="tabpanel" style={{"borderWidth": "0px 1px 1px", "borderStyle": "none solid solid", "borderColor": "currentcolor rgb(207, 224, 211) rgb(207, 224, 211)", "borderImage": "none", "background": "rgb(250, 248, 239)", "padding": "clamp(20px, 3vw, 32px)"}}>
              <div className="l-split" style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) minmax(0px, 1fr)", "gap": "16px 40px"}}>
                <p style={{"margin": "0px", "fontSize": "16.5px", "lineHeight": "1.75", "color": "rgb(26, 26, 26)"}}>課程是 25+8 的核心，也是取得學生居留的前提。主要目的是學習英文。</p>
                <ul style={{"margin": "0px", "paddingLeft": "18px", "display": "flex", "flexDirection": "column", "gap": "6px", "fontSize": "15.5px", "lineHeight": "1.7"}}>
                  <li>至少 25 週、每週至少 15 小時的合格英文課程</li>
                  <li>出席率至少 85%</li>
                  <li>須完成符合規定的期末考試</li>
                </ul>
              </div>
            </div>
            <div aria-labelledby="tl-tab-1" hidden id="tl-panel-1" role="tabpanel" style={{"borderWidth": "0px 1px 1px", "borderStyle": "none solid solid", "borderColor": "currentcolor rgb(207, 224, 211) rgb(207, 224, 211)", "borderImage": "none", "background": "rgb(250, 248, 239)", "padding": "clamp(20px, 3vw, 32px)"}}>
              <div className="l-split" style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) minmax(0px, 1fr)", "gap": "16px 40px"}}>
                <p style={{"margin": "0px", "fontSize": "16.5px", "lineHeight": "1.75", "color": "rgb(26, 26, 26)"}}>「8」常用來指搭配課程的假期安排。實際假期日期與居留效期，以學校及官方規定為準。</p>
                <ul style={{"margin": "0px", "paddingLeft": "18px", "display": "flex", "flexDirection": "column", "gap": "6px", "fontSize": "15.5px", "lineHeight": "1.7"}}>
                  <li>可以利用休假探索愛爾蘭或歐洲</li>
                  <li>工時依官方指定期間判斷，不是依你的假期</li>
                  <li>每週 40 小時只適用 6–9 月，及 12 月 15 日至 1 月 15 日</li>
                </ul>
              </div>
            </div>
            <div aria-labelledby="tl-tab-2" hidden id="tl-panel-2" role="tabpanel" style={{"borderWidth": "0px 1px 1px", "borderStyle": "none solid solid", "borderColor": "currentcolor rgb(207, 224, 211) rgb(207, 224, 211)", "borderImage": "none", "background": "rgb(250, 248, 239)", "padding": "clamp(20px, 3vw, 32px)"}}>
              <div className="l-split" style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) minmax(0px, 1fr)", "gap": "16px 40px"}}>
                <p style={{"margin": "0px", "fontSize": "16.5px", "lineHeight": "1.75", "color": "rgb(26, 26, 26)"}}>符合條件可申請延長，每一次都需要重新審核，無法保證通過。</p>
                <ul style={{"margin": "0px", "paddingLeft": "18px", "display": "flex", "flexDirection": "column", "gap": "6px", "fontSize": "15.5px", "lineHeight": "1.7"}}>
                  <li>合格語言課程最多三期</li>
                  <li>學生居留累計最長約兩年</li>
                  <li>需符合出席率、考試、財力與合格課程等條件</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="l-4" style={{"display": "grid", "gridTemplateColumns": "repeat(4, minmax(0px, 1fr))", "gap": "0px", "borderTop": "2px solid rgb(11, 57, 39)"}}>
            <div style={{"padding": "20px 20px 4px 0px", "display": "flex", "flexDirection": "column", "gap": "6px"}}>
              <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "28px", "fontWeight": "900", "color": "rgb(11, 57, 39)", "lineHeight": "1.15"}}>85%</p>
              <p style={{"margin": "0px", "fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>最低出席率，影響續簽與居留</p>
            </div>
            <div style={{"padding": "20px 20px 4px 0px", "display": "flex", "flexDirection": "column", "gap": "6px"}}>
              <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "28px", "fontWeight": "900", "color": "rgb(11, 57, 39)", "lineHeight": "1.15"}}>期末考</p>
              <p style={{"margin": "0px", "fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>須完成符合規定的考試</p>
            </div>
            <div style={{"padding": "20px 20px 4px 0px", "display": "flex", "flexDirection": "column", "gap": "6px"}}>
              <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "28px", "fontWeight": "900", "color": "rgb(11, 57, 39)", "lineHeight": "1.15"}}>20 / 40 小時</p>
              <p style={{"margin": "0px", "fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>Stamp 2 一般每週 20 小時；6–9 月、12/15–1/15 每週 40 小時</p>
            </div>
            <div style={{"padding": "20px 0px 4px", "display": "flex", "flexDirection": "column", "gap": "6px"}}>
              <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "28px", "fontWeight": "900", "color": "rgb(11, 57, 39)", "lineHeight": "1.15"}}>合格課程</p>
              <p style={{"margin": "0px", "fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>須在當期官方名單內（TrustEd Ireland 正逐步取代 ILEP）</p>
            </div>
          </div>
          <p style={{"margin": "0px", "fontSize": "13.5px", "lineHeight": "1.7", "color": "rgb(95, 103, 95)"}}>居留許可與續簽由愛爾蘭移民局審核核發。資料整理日期：2026 年 11 月 16 日｜來源：<a href="https://www.irishimmigration.ie/" rel="noopener" target="_blank">Irish Immigration Service</a>、<a href="https://www.qqi.ie/" rel="noopener" target="_blank">QQI</a>，以官方最新公告為準。</p>
        </div>
      </section>
      <section className="l-sec" id="budget" style={{"borderBottom": "1px solid rgb(207, 224, 211)", "padding": "96px 0px"}}>
        <div style={{"width": "min(1160px, 100% - 40px)", "margin": "0px auto", "display": "flex", "flexDirection": "column", "gap": "40px"}}>
          <header style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
            <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "textTransform": "uppercase", "color": "rgb(0, 82, 48)"}}>COST &amp; BUDGET</p>
            <h2 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(27px, 3.4vw, 42px)", "fontWeight": "900", "lineHeight": "1.3", "letterSpacing": "-0.012em", "color": "rgb(11, 57, 39)"}}>愛爾蘭 25+8 要準備多少錢？</h2>
            <p style={{"margin": "0px", "maxWidth": "680px", "fontSize": "17px", "lineHeight": "1.75", "color": "rgb(63, 70, 63)", "textWrap": "pretty"}}>學校價格會因地點、課程時段與方案而不同。哩來依各校 25+8 標準方案的比較成本，把合作語校分成三個預算級距。</p>
          </header>
          <div className="l-3" style={{"display": "grid", "gridTemplateColumns": "repeat(3, minmax(0px, 1fr))", "gap": "20px", "alignItems": "stretch"}}>
            <article style={{"background": "rgb(255, 255, 246)", "borderWidth": "4px 1px 1px", "borderStyle": "solid", "borderColor": "rgb(0, 82, 48) rgb(207, 224, 211) rgb(207, 224, 211)", "borderImage": "none", "borderRadius": "4px", "padding": "26px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
              <p style={{"margin": "0px", "display": "flex", "alignItems": "baseline", "gap": "10px"}}>
                <span style={{"fontSize": "22px", "fontWeight": "900", "color": "rgb(0, 82, 48)", "letterSpacing": "0.04em"}}>{ireland25Plus8Tiers[0].symbol}</span>
                <span style={{"fontSize": "14px", "fontWeight": "800", "color": "rgb(63, 70, 63)"}}>{ireland25Plus8Tiers[0].label}</span>
              </p>
              <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "26px", "fontWeight": "900", "lineHeight": "1.3", "color": "rgb(11, 57, 39)"}}>{ireland25Plus8Tiers[0].price}</h3>
              <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>{ireland25Plus8Tiers[0].description}</p>
              <p style={{"margin": "auto 0px 0px", "paddingTop": "12px", "borderTop": "1px solid rgb(207, 224, 211)", "fontSize": "14px", "color": "rgb(95, 103, 95)"}}>代表語校：<a data-flash="1" data-jump={ireland25Plus8Tiers[0].schoolId} href={`#${ireland25Plus8Tiers[0].schoolId}`} style={{"display": "inline-flex", "alignItems": "center", "gap": "4px", "minHeight": "44px", "fontWeight": "700"}}>{ireland25Plus8Schools[0].name} <span aria-hidden="true" className="l-ar l-ar-d">↓</span></a></p>
            </article>
            <article style={{"background": "rgb(255, 255, 246)", "borderWidth": "4px 1px 1px", "borderStyle": "solid", "borderColor": "rgb(0, 82, 48) rgb(207, 224, 211) rgb(207, 224, 211)", "borderImage": "none", "borderRadius": "4px", "padding": "26px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
              <p style={{"margin": "0px", "display": "flex", "alignItems": "baseline", "gap": "10px"}}>
                <span style={{"fontSize": "22px", "fontWeight": "900", "color": "rgb(0, 82, 48)", "letterSpacing": "0.04em"}}>{ireland25Plus8Tiers[1].symbol}</span>
                <span style={{"fontSize": "14px", "fontWeight": "800", "color": "rgb(63, 70, 63)"}}>{ireland25Plus8Tiers[1].label}</span>
              </p>
              <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "26px", "fontWeight": "900", "lineHeight": "1.3", "color": "rgb(11, 57, 39)"}}>{ireland25Plus8Tiers[1].price}</h3>
              <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>{ireland25Plus8Tiers[1].description}</p>
              <p style={{"margin": "auto 0px 0px", "paddingTop": "12px", "borderTop": "1px solid rgb(207, 224, 211)", "fontSize": "14px", "color": "rgb(95, 103, 95)"}}>代表語校：<a data-flash="1" data-jump={ireland25Plus8Tiers[1].schoolId} href={`#${ireland25Plus8Tiers[1].schoolId}`} style={{"display": "inline-flex", "alignItems": "center", "gap": "4px", "minHeight": "44px", "fontWeight": "700"}}>{ireland25Plus8Schools[1].name} <span aria-hidden="true" className="l-ar l-ar-d">↓</span></a></p>
            </article>
            <article style={{"background": "rgb(255, 255, 246)", "borderWidth": "4px 1px 1px", "borderStyle": "solid", "borderColor": "rgb(0, 82, 48) rgb(207, 224, 211) rgb(207, 224, 211)", "borderImage": "none", "borderRadius": "4px", "padding": "26px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
              <p style={{"margin": "0px", "display": "flex", "alignItems": "baseline", "gap": "10px"}}>
                <span style={{"fontSize": "22px", "fontWeight": "900", "color": "rgb(0, 82, 48)", "letterSpacing": "0.04em"}}>{ireland25Plus8Tiers[2].symbol}</span>
                <span style={{"fontSize": "14px", "fontWeight": "800", "color": "rgb(63, 70, 63)"}}>{ireland25Plus8Tiers[2].label}</span>
              </p>
              <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "26px", "fontWeight": "900", "lineHeight": "1.3", "color": "rgb(11, 57, 39)"}}>{ireland25Plus8Tiers[2].price}</h3>
              <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>{ireland25Plus8Tiers[2].description}</p>
              <p style={{"margin": "auto 0px 0px", "paddingTop": "12px", "borderTop": "1px solid rgb(207, 224, 211)", "fontSize": "14px", "color": "rgb(95, 103, 95)"}}>代表語校：<a data-flash="1" data-jump={ireland25Plus8Tiers[2].schoolId} href={`#${ireland25Plus8Tiers[2].schoolId}`} style={{"display": "inline-flex", "alignItems": "center", "gap": "4px", "minHeight": "44px", "fontWeight": "700"}}>{ireland25Plus8Schools[2].name} <span aria-hidden="true" className="l-ar l-ar-d">↓</span></a></p>
            </article>
          </div>
          <div className="sc-host-x" style={{"display": "contents"}}>
            <div style={{"display": "flex", "gap": "var(--space-3)", "padding": "14px 16px", "background": "var(--surface-warm-soft)", "border": "1px solid rgb(240, 214, 138)", "borderRadius": "var(--radius-control)"}}>
              <span style={{"color": "rgb(107, 74, 0)", "flex": "0 0 auto", "marginTop": "2px"}}>
                <span aria-hidden="true" data-lucide="info" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/info.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
              </span>
              <div style={{"display": "flex", "flexDirection": "column", "gap": "4px"}}>
                <p style={{"fontFamily": "var(--font-body)", "fontSize": "var(--fs-body)", "fontWeight": "var(--fw-bold)", "color": "rgb(107, 74, 0)", "margin": "0px"}}>級距是預算分類，不是品質等級，也不是即時報價</p>
                <div style={{"fontFamily": "var(--font-body)", "fontSize": "var(--fs-small)", "lineHeight": "1.7", "color": "var(--text-body)"}}>比較成本含學費與報名、教材、保險、考試等必要費用，不含限時優惠與抵達後生活費。實際費用以學校當期方案與正式報價為準。</div>
              </div>
            </div>
          </div>
          <div className="l-split" style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1.2fr) minmax(0px, 0.8fr)", "gap": "48px", "alignItems": "start"}}>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "20px"}}>
              <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "26px", "fontWeight": "900", "lineHeight": "1.35", "color": "rgb(11, 57, 39)"}}>除了學費，還要準備這些</h3>
              <ul className="l-2" style={{"listStyle": "none", "margin": "0px", "padding": "0px", "display": "grid", "gridTemplateColumns": "repeat(2, minmax(0px, 1fr))", "gap": "0px 28px"}}>
                <li style={{"display": "grid", "gridTemplateColumns": "40px minmax(0px, 1fr)", "gap": "14px", "alignItems": "start", "padding": "14px 0px", "borderTop": "1px solid rgb(207, 224, 211)"}}>
                  <span style={{"width": "40px", "height": "40px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                    <div className="sc-host-x" style={{"display": "contents"}}>
                      <span aria-hidden="true" data-lucide="graduation-cap" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/graduation-cap.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                    </div>
                  </span>
                  <div style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                    <p style={{"margin": "0px", "fontSize": "15.5px", "fontWeight": "800", "color": "rgb(11, 57, 39)"}}>語校課程與必要費用</p>
                    <p style={{"margin": "0px", "fontSize": "14px", "lineHeight": "1.6", "color": "rgb(95, 103, 95)"}}>參考上方三個級距</p>
                  </div>
                </li>
                <li style={{"display": "grid", "gridTemplateColumns": "40px minmax(0px, 1fr)", "gap": "14px", "alignItems": "start", "padding": "14px 0px", "borderTop": "1px solid rgb(207, 224, 211)"}}>
                  <span style={{"width": "40px", "height": "40px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                    <div className="sc-host-x" style={{"display": "contents"}}>
                      <span aria-hidden="true" data-lucide="plane-takeoff" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/plane-takeoff.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                    </div>
                  </span>
                  <div style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                    <p style={{"margin": "0px", "fontSize": "15.5px", "fontWeight": "800", "color": "rgb(11, 57, 39)"}}>機票</p>
                    <p style={{"margin": "0px", "fontSize": "14px", "lineHeight": "1.6", "color": "rgb(95, 103, 95)"}}>依季節、航線與購票時間</p>
                  </div>
                </li>
                <li style={{"display": "grid", "gridTemplateColumns": "40px minmax(0px, 1fr)", "gap": "14px", "alignItems": "start", "padding": "14px 0px", "borderTop": "1px solid rgb(207, 224, 211)"}}>
                  <span style={{"width": "40px", "height": "40px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                    <div className="sc-host-x" style={{"display": "contents"}}>
                      <span aria-hidden="true" data-lucide="house" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/house.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                    </div>
                  </span>
                  <div style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                    <p style={{"margin": "0px", "fontSize": "15.5px", "fontWeight": "800", "color": "rgb(11, 57, 39)"}}>住宿與日常生活費</p>
                    <p style={{"margin": "0px", "fontSize": "14px", "lineHeight": "1.6", "color": "rgb(95, 103, 95)"}}>城市與住宿類型影響最大</p>
                  </div>
                </li>
                <li style={{"display": "grid", "gridTemplateColumns": "40px minmax(0px, 1fr)", "gap": "14px", "alignItems": "start", "padding": "14px 0px", "borderTop": "1px solid rgb(207, 224, 211)"}}>
                  <span style={{"width": "40px", "height": "40px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                    <div className="sc-host-x" style={{"display": "contents"}}>
                      <span aria-hidden="true" data-lucide="bus" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/bus.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                    </div>
                  </span>
                  <div style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                    <p style={{"margin": "0px", "fontSize": "15.5px", "fontWeight": "800", "color": "rgb(11, 57, 39)"}}>交通與通訊</p>
                    <p style={{"margin": "0px", "fontSize": "14px", "lineHeight": "1.6", "color": "rgb(95, 103, 95)"}}>通勤、手機門號與網路</p>
                  </div>
                </li>
                <li style={{"display": "grid", "gridTemplateColumns": "40px minmax(0px, 1fr)", "gap": "14px", "alignItems": "start", "padding": "14px 0px", "borderTop": "1px solid rgb(207, 224, 211)"}}>
                  <span style={{"width": "40px", "height": "40px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                    <div className="sc-host-x" style={{"display": "contents"}}>
                      <span aria-hidden="true" data-lucide="id-card" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/id-card.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                    </div>
                  </span>
                  <div style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                    <p style={{"margin": "0px", "fontSize": "15.5px", "fontWeight": "800", "color": "rgb(11, 57, 39)"}}>居留註冊相關費用</p>
                    <p style={{"margin": "0px", "fontSize": "14px", "lineHeight": "1.6", "color": "rgb(95, 103, 95)"}}>IRP 官方費用，依當期公告</p>
                  </div>
                </li>
                <li style={{"display": "grid", "gridTemplateColumns": "40px minmax(0px, 1fr)", "gap": "14px", "alignItems": "start", "padding": "14px 0px", "borderTop": "1px solid rgb(207, 224, 211)"}}>
                  <span style={{"width": "40px", "height": "40px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                    <div className="sc-host-x" style={{"display": "contents"}}>
                      <span aria-hidden="true" data-lucide="wallet" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/wallet.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                    </div>
                  </span>
                  <div style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                    <p style={{"margin": "0px", "fontSize": "15.5px", "fontWeight": "800", "color": "rgb(11, 57, 39)"}}>初期安頓費用</p>
                    <p style={{"margin": "0px", "fontSize": "14px", "lineHeight": "1.6", "color": "rgb(95, 103, 95)"}}>租屋押金、生活用品等</p>
                  </div>
                </li>
              </ul>
            </div>
            <aside style={{"background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "boxShadow": "rgba(0, 82, 48, 0.08) 14px 14px 0px", "padding": "28px", "display": "flex", "flexDirection": "column", "gap": "14px"}}>
              <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "color": "rgb(0, 82, 48)"}}>財力證明</p>
              <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "44px", "fontWeight": "900", "lineHeight": "1", "color": "rgb(11, 57, 39)"}}>€6,665</p>
              <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7"}}>非簽證需求國籍、就讀 8 個月課程的學生，需具備可直接支配的資金。</p>
              <p style={{"margin": "0px", "background": "rgb(234, 244, 236)", "borderRadius": "11px", "padding": "12px 14px", "fontSize": "15px", "lineHeight": "1.65", "fontWeight": "700", "color": "rgb(11, 57, 39)"}}>這不是繳給政府的費用，而是你需要具備並能證明的生活資金，不用和學費、生活費重複相加。</p>
              <p style={{"margin": "0px", "fontSize": "13px", "lineHeight": "1.6", "color": "rgb(95, 103, 95)"}}>資料整理日期：2026-11-16｜<a href="https://www.irishimmigration.ie/coming-to-study-in-ireland/what-are-my-study-options/a-fee-paying-private-primary-or-secondary-school/information-on-student-finances/" rel="noopener" target="_blank">官方財力規定</a></p>
            </aside>
          </div>
          <div style={{"display": "flex", "flexWrap": "wrap", "gap": "12px 16px", "alignItems": "center"}}>
            <div className="sc-host-x" style={{"display": "contents"}}>
              <Ireland25Plus8Cta href="/consult" label="看看我的預算適合哪些學校" />
            </div>
            <p style={{"margin": "0px", "fontSize": "14px", "color": "rgb(95, 103, 95)"}}>免費出發評估，不需要先付款。</p>
          </div>
        </div>
      </section>
      <section className="l-sec" id="webinar" style={{"borderBottom": "1px solid rgb(207, 224, 211)", "padding": "96px 0px"}}>
        <div style={{"width": "min(1080px, 100% - 40px)", "margin": "0px auto", "display": "flex", "flexDirection": "column", "gap": "36px"}}>
          <div hidden id="hv-block" style={{"display": "flex", "flexDirection": "column", "gap": "36px"}}>
            <header style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
              <p style={{"margin": "0", "fontSize": "12px", "fontWeight": "900", "letterSpacing": ".09em", "textTransform": "uppercase", "color": "#005230"}}>25+8 WEBINAR HIGHLIGHTS</p>
              <h2 style={{"margin": "0", "fontFamily": "'Ireland25 Noto Serif TC',serif", "fontSize": "clamp(27px,3.4vw,42px)", "fontWeight": "900", "lineHeight": "1.3", "letterSpacing": "-.012em", "color": "#0b3927", "textWrap": "balance"}}>先花幾分鐘，認識你可能的愛爾蘭生活。</h2>
              <p style={{"margin": "0", "maxWidth": "680px", "fontSize": "17px", "lineHeight": "1.75", "color": "#3f463f", "textWrap": "pretty"}}>從課程安排、打工規定到出發準備，跟著哩來學長姐快速了解 25+8 的重點。</p>
            </header>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "14px"}}>
              <div className="l-player" id="hv-player" style={{"position": "relative", "aspectRatio": "16 / 9", "background": "#0b3927", "border": "1px solid #cfe0d3", "borderRadius": "4px", "overflow": "hidden", "boxShadow": "14px 14px 0 rgba(0,82,48,.08)"}}></div>
              <div style={{"display": "flex", "flexWrap": "wrap", "justifyContent": "space-between", "alignItems": "baseline", "gap": "6px 20px"}}>
                <h3 id="hv-title" style={{"margin": "0", "fontFamily": "'Ireland25 Noto Serif TC',serif", "fontSize": "20px", "fontWeight": "900", "lineHeight": "1.4", "color": "#0b3927"}}></h3>
                <p id="hv-meta" style={{"margin": "0", "fontSize": "13.5px", "lineHeight": "1.6", "color": "#5f675f"}}></p>
              </div>
              <details hidden id="hv-summary" style={{"background": "#fffff6", "border": "1px solid #cfe0d3", "borderRadius": "13px"}}>
                <summary style={{"listStyle": "none", "cursor": "pointer", "minHeight": "52px", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "12px", "padding": "12px 18px", "fontSize": "15px", "fontWeight": "800", "color": "#0b3927"}}>影片文字摘要<span className="l-chev" style={{"display": "flex", "color": "#005230", "transition": "transform 200ms ease"}}>
                    <span aria-hidden="true" data-lucide="chevron-down" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/chevron-down.svg\")", "WebkitMaskImage": "url(\"/assets/ireland-25-plus-8/icons/chevron-down.svg\")", "maskRepeat": "no-repeat", "WebkitMaskRepeat": "no-repeat", "maskPosition": "center", "WebkitMaskPosition": "center", "maskSize": "contain", "WebkitMaskSize": "contain"}}></span>
                  </span></summary>
                <ul id="hv-summary-list" style={{"margin": "0", "padding": "0 18px 18px 38px", "display": "flex", "flexDirection": "column", "gap": "6px", "fontSize": "15px", "lineHeight": "1.7", "color": "#3f463f"}}></ul>
              </details>
            </div>
          </div>
          <div className="l-split" data-cta-zone="webinar" style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1.15fr) minmax(0px, 0.85fr)", "gap": "28px 48px", "alignItems": "center", "background": "rgb(255, 255, 246)", "borderWidth": "4px 1px 1px", "borderStyle": "solid", "borderColor": "rgb(0, 82, 48) rgb(207, 224, 211) rgb(207, 224, 211)", "borderImage": "none", "borderRadius": "4px", "padding": "clamp(22px, 4vw, 40px)"}}>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "14px"}}>
              <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "color": "rgb(0, 82, 48)"}}>FULL REPLAY</p>
              <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(23px, 2.6vw, 28px)", "fontWeight": "900", "lineHeight": "1.35", "color": "rgb(11, 57, 39)"}}>想看完整的 25+8 說明會？</h3>
              <p style={{"margin": "0px", "fontSize": "15.5px", "lineHeight": "1.75", "color": "rgb(63, 70, 63)", "textWrap": "pretty"}}>填寫免費出發評估後，就可以向哩來申請完整重播。我們會為你開通 7 天觀看權限，讓你依照自己的步調慢慢了解。</p>
              <div className="l-wrapbtn" style={{"display": "flex", "marginTop": "4px"}}>
                <div className="sc-host-x" style={{"display": "contents"}}>
                  <Ireland25Plus8Cta href="/consult" label="填寫免費出發評估，索取完整重播" />
                </div>
              </div>
              <p style={{"margin": "0px", "fontSize": "13.5px", "lineHeight": "1.65", "color": "rgb(95, 103, 95)"}}>完整重播不會公開在本頁，由哩來確認後開通。想跳過重播、直接討論，可以選擇<a href="#consult">付費快速諮詢</a>。</p>
            </div>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "14px", "borderLeft": "1px solid rgb(207, 224, 211)", "paddingLeft": "clamp(16px, 2.4vw, 28px)"}}>
              <ol aria-label="索取完整重播的三個階段" style={{"listStyle": "none", "margin": "0px", "padding": "0px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
                <li style={{"display": "grid", "gridTemplateColumns": "28px minmax(0px, 1fr)", "gap": "10px", "alignItems": "baseline"}}>
                  <span style={{"fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "15px", "fontWeight": "900", "color": "rgb(213, 149, 0)"}}>01</span>
                  <span style={{"fontSize": "15.5px", "fontWeight": "800", "lineHeight": "1.5", "color": "rgb(11, 57, 39)"}}>填寫免費出發評估</span>
                </li>
                <li style={{"display": "grid", "gridTemplateColumns": "28px minmax(0px, 1fr)", "gap": "10px", "alignItems": "baseline"}}>
                  <span style={{"fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "15px", "fontWeight": "900", "color": "rgb(213, 149, 0)"}}>02</span>
                  <span style={{"fontSize": "15.5px", "fontWeight": "800", "lineHeight": "1.5", "color": "rgb(11, 57, 39)"}}>向哩來申請完整重播</span>
                </li>
                <li style={{"display": "grid", "gridTemplateColumns": "28px minmax(0px, 1fr)", "gap": "10px", "alignItems": "baseline"}}>
                  <span style={{"fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "15px", "fontWeight": "900", "color": "rgb(213, 149, 0)"}}>03</span>
                  <span style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                    <span style={{"fontSize": "15.5px", "fontWeight": "800", "lineHeight": "1.5", "color": "rgb(11, 57, 39)"}}>開通後享有 7 天觀看權限</span>
                    <span style={{"fontSize": "13.5px", "lineHeight": "1.6", "color": "rgb(95, 103, 95)"}}>從哩來實際開通當天起算，不是送出表單的時間。</span>
                  </span>
                </li>
              </ol>
              <p style={{"margin": "0px", "paddingTop": "12px", "borderTop": "1px solid rgb(207, 224, 211)", "fontSize": "14px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>看完重播後，即可依流程預約免費一對一諮詢。</p>
            </div>
          </div>
        </div>
      </section>
      <section className="l-sec" id="why-ireland" style={{"background": "rgb(255, 255, 246)", "borderBottom": "1px solid rgb(207, 224, 211)", "padding": "96px 0px"}}>
        <div style={{"width": "min(1160px, 100% - 40px)", "margin": "0px auto", "display": "flex", "flexDirection": "column", "gap": "40px"}}>
          <header style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
            <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "textTransform": "uppercase", "color": "rgb(0, 82, 48)"}}>WHY IRELAND</p>
            <h2 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(27px, 3.4vw, 42px)", "fontWeight": "900", "lineHeight": "1.3", "letterSpacing": "-0.012em", "color": "rgb(11, 57, 39)"}}>為什麼選擇愛爾蘭？</h2>
            <p style={{"margin": "0px", "maxWidth": "640px", "fontSize": "17px", "lineHeight": "1.75", "color": "rgb(63, 70, 63)"}}>把學習、工作與旅行，結合成一段真正的海外生活。</p>
          </header>
          <div className="l-4 l-4c" style={{"gap": "40px 24px", "alignItems": "start"}}>
            <article style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
              <div style={{"display": "grid", "gridTemplateColumns": "44px minmax(0px, 1fr)", "gap": "10px", "borderTop": "1px solid rgb(207, 224, 211)", "paddingTop": "14px"}}>
                <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "22px", "fontWeight": "900", "color": "rgb(213, 149, 0)", "lineHeight": "1.35"}}>01</p>
                <div style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "21px", "fontWeight": "900", "lineHeight": "1.4", "color": "rgb(11, 57, 39)"}}>把英文融入生活</h3>
                  <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>從課堂、咖啡廳到日常交流，處處都是用英文的機會。</p>
                </div>
              </div>
            </article>
            <article style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
              <div style={{"display": "grid", "gridTemplateColumns": "44px minmax(0px, 1fr)", "gap": "10px", "borderTop": "1px solid rgb(207, 224, 211)", "paddingTop": "14px"}}>
                <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "22px", "fontWeight": "900", "color": "rgb(213, 149, 0)", "lineHeight": "1.35"}}>02</p>
                <div style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "21px", "fontWeight": "900", "lineHeight": "1.4", "color": "rgb(11, 57, 39)"}}>累積海外工作經驗</h3>
                  <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>在規定範圍內接觸當地職場，學習不同文化的工作方式。</p>
                </div>
              </div>
            </article>
            <article style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
              <div style={{"display": "grid", "gridTemplateColumns": "44px minmax(0px, 1fr)", "gap": "10px", "borderTop": "1px solid rgb(207, 224, 211)", "paddingTop": "14px"}}>
                <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "22px", "fontWeight": "900", "color": "rgb(213, 149, 0)", "lineHeight": "1.35"}}>03</p>
                <div style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "21px", "fontWeight": "900", "lineHeight": "1.4", "color": "rgb(11, 57, 39)"}}>從愛爾蘭探索歐洲</h3>
                  <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>善用假期旅行，讓探索成為生活的一部分。</p>
                </div>
              </div>
            </article>
            <article style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
              <div style={{"display": "grid", "gridTemplateColumns": "44px minmax(0px, 1fr)", "gap": "10px", "borderTop": "1px solid rgb(207, 224, 211)", "paddingTop": "14px"}}>
                <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "22px", "fontWeight": "900", "color": "rgb(213, 149, 0)", "lineHeight": "1.35"}}>04</p>
                <div style={{"display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "21px", "fontWeight": "900", "lineHeight": "1.4", "color": "rgb(11, 57, 39)"}}>重新看見自己的可能</h3>
                  <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>多元文化與不同生活節奏，可能讓你對未來有新的想法。</p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="l-sec" id="fit" style={{"borderBottom": "1px solid rgb(207, 224, 211)", "padding": "96px 0px"}}>
        <div style={{"width": "min(1160px, 100% - 40px)", "margin": "0px auto", "display": "flex", "flexDirection": "column", "gap": "40px"}}>
          <header style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
            <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "textTransform": "uppercase", "color": "rgb(0, 82, 48)"}}>IS 25+8 FOR YOU</p>
            <h2 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(27px, 3.4vw, 42px)", "fontWeight": "900", "lineHeight": "1.3", "letterSpacing": "-0.012em", "color": "rgb(11, 57, 39)", "textWrap": "balance"}}>人生不只有一種出發方式，你適合 25+8 嗎？</h2>
          </header>
          <ul className="l-2" style={{"listStyle": "none", "margin": "0px", "padding": "0px", "display": "grid", "gridTemplateColumns": "repeat(2, minmax(0px, 1fr))", "gap": "0px 40px"}}>
            <li style={{"display": "grid", "gridTemplateColumns": "auto minmax(0px, 1fr)", "gap": "4px 16px", "alignItems": "baseline", "padding": "16px 0px", "borderTop": "1px solid rgb(207, 224, 211)"}}>
              <span style={{"fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.06em", "color": "rgb(138, 90, 0)", "whiteSpace": "nowrap"}}>探索方向</span>
              <span style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                <strong style={{"fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "18px", "fontWeight": "900", "lineHeight": "1.45", "color": "rgb(11, 57, 39)"}}>剛畢業的你</strong>
                <span style={{"fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>想用一段海外生活，提升英文、思考未來。</span>
              </span>
            </li>
            <li style={{"display": "grid", "gridTemplateColumns": "auto minmax(0px, 1fr)", "gap": "4px 16px", "alignItems": "baseline", "padding": "16px 0px", "borderTop": "1px solid rgb(207, 224, 211)"}}>
              <span style={{"fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.06em", "color": "rgb(138, 90, 0)", "whiteSpace": "nowrap"}}>轉換節奏</span>
              <span style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                <strong style={{"fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "18px", "fontWeight": "900", "lineHeight": "1.45", "color": "rgb(11, 57, 39)"}}>工作幾年的你</strong>
                <span style={{"fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>想離開熟悉的環境，重新學習與探索。</span>
              </span>
            </li>
            <li style={{"display": "grid", "gridTemplateColumns": "auto minmax(0px, 1fr)", "gap": "4px 16px", "alignItems": "baseline", "padding": "16px 0px", "borderTop": "1px solid rgb(207, 224, 211)"}}>
              <span style={{"fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.06em", "color": "rgb(138, 90, 0)", "whiteSpace": "nowrap"}}>不受年齡上限</span>
              <span style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                <strong style={{"fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "18px", "fontWeight": "900", "lineHeight": "1.45", "color": "rgb(11, 57, 39)"}}>超過打工度假年齡的你</strong>
                <span style={{"fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>透過合格的長期語言課程，體驗海外生活。</span>
              </span>
            </li>
            <li style={{"display": "grid", "gridTemplateColumns": "auto minmax(0px, 1fr)", "gap": "4px 16px", "alignItems": "baseline", "padding": "16px 0px", "borderTop": "1px solid rgb(207, 224, 211)"}}>
              <span style={{"fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.06em", "color": "rgb(138, 90, 0)", "whiteSpace": "nowrap"}}>實用英文</span>
              <span style={{"display": "flex", "flexDirection": "column", "gap": "2px"}}>
                <strong style={{"fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "18px", "fontWeight": "900", "lineHeight": "1.45", "color": "rgb(11, 57, 39)"}}>想把英文用出來的你</strong>
                <span style={{"fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>不只待在教室，而是在生活中持續使用英文。</span>
              </span>
            </li>
          </ul>
          <div style={{"display": "flex", "flexDirection": "column", "gap": "18px"}}>
            <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "24px", "fontWeight": "900", "color": "rgb(11, 57, 39)"}}>WHV（打工度假）、25+8、短期遊學怎麼選？</h3>
            <div aria-label="選擇要查看的出發方式" className="l-cmp-tabs" role="tablist" style={{"gridTemplateColumns": "repeat(3, minmax(0px, 1fr))", "gap": "6px"}}>
              <button aria-controls="cmp-table" aria-selected="false" className="l-seg" role="tab" style={{"fontStyle": "inherit", "fontVariant": "inherit", "fontWeight": "800", "fontStretch": "inherit", "fontSize": "14px", "lineHeight": "1.25", "fontFamily": "inherit", "fontOpticalSizing": "inherit", "fontSizeAdjust": "inherit", "fontKerning": "inherit", "fontFeatureSettings": "inherit", "fontVariationSettings": "inherit", "fontLanguageOverride": "inherit", "cursor": "pointer", "minHeight": "46px", "padding": "6px 8px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "background": "rgb(255, 255, 246)", "color": "rgb(11, 57, 39)"}} tabIndex={-1} type="button">WHV（打工度假）</button>
              <button aria-controls="cmp-table" aria-selected="true" className="l-seg" role="tab" style={{"fontStyle": "inherit", "fontVariant": "inherit", "fontWeight": "800", "fontStretch": "inherit", "fontSize": "14px", "lineHeight": "inherit", "fontFamily": "inherit", "fontOpticalSizing": "inherit", "fontSizeAdjust": "inherit", "fontKerning": "inherit", "fontFeatureSettings": "inherit", "fontVariationSettings": "inherit", "fontLanguageOverride": "inherit", "cursor": "pointer", "minHeight": "46px", "padding": "6px 8px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "background": "rgb(255, 255, 246)", "color": "rgb(11, 57, 39)"}} tabIndex={0} type="button">25+8</button>
              <button aria-controls="cmp-table" aria-selected="false" className="l-seg" role="tab" style={{"fontStyle": "inherit", "fontVariant": "inherit", "fontWeight": "800", "fontStretch": "inherit", "fontSize": "14px", "lineHeight": "inherit", "fontFamily": "inherit", "fontOpticalSizing": "inherit", "fontSizeAdjust": "inherit", "fontKerning": "inherit", "fontFeatureSettings": "inherit", "fontVariationSettings": "inherit", "fontLanguageOverride": "inherit", "cursor": "pointer", "minHeight": "46px", "padding": "6px 8px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "background": "rgb(255, 255, 246)", "color": "rgb(11, 57, 39)"}} tabIndex={-1} type="button">短期遊學</button>
            </div>
            <table className="l-cmp" data-active="1" id="cmp-table" style={{"width": "100%", "borderCollapse": "collapse", "tableLayout": "fixed", "background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)"}}>
              <caption style={{"textAlign": "left", "fontSize": "13.5px", "color": "rgb(95, 103, 95)", "padding": "10px 0px", "captionSide": "bottom"}}>制度細節以官方及台愛打工度假計畫最新公告為準。</caption>
              <thead>
                <tr>
                  <th scope="col" style={{"width": "18%", "padding": "14px 16px", "borderBottom": "1px solid rgb(207, 224, 211)"}}></th>
                  <th scope="col" style={{"padding": "14px 16px", "textAlign": "left", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "18px", "fontWeight": "900", "color": "rgb(11, 57, 39)", "borderBottom": "1px solid rgb(207, 224, 211)"}}>WHV（打工度假）</th>
                  <th scope="col" style={{"padding": "14px 16px", "textAlign": "left", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "18px", "fontWeight": "900", "borderBottom": "1px solid rgb(0, 82, 48)"}}>25+8 長期打工遊學</th>
                  <th scope="col" style={{"padding": "14px 16px", "textAlign": "left", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "18px", "fontWeight": "900", "color": "rgb(11, 57, 39)", "borderBottom": "1px solid rgb(207, 224, 211)"}}>短期語言課程</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" style={{"padding": "14px 16px", "textAlign": "left", "verticalAlign": "top", "fontSize": "13.5px", "fontWeight": "800", "color": "rgb(95, 103, 95)", "borderTop": "1px solid rgb(207, 224, 211)"}}>主要目的</th>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>以度假為主，可打工體驗生活</td>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>以學英文為主，搭配海外生活與兼職</td>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>短時間密集學英文</td>
                </tr>
                <tr>
                  <th scope="row" style={{"padding": "14px 16px", "textAlign": "left", "verticalAlign": "top", "fontSize": "13.5px", "fontWeight": "800", "color": "rgb(95, 103, 95)", "borderTop": "1px solid rgb(207, 224, 211)"}}>停留時間</th>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>依計畫規定，最長約一年</td>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>一期約 8 個月；最多三期、累計約兩年</td>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>數週到數月</td>
                </tr>
                <tr>
                  <th scope="row" style={{"padding": "14px 16px", "textAlign": "left", "verticalAlign": "top", "fontSize": "13.5px", "fontWeight": "800", "color": "rgb(95, 103, 95)", "borderTop": "1px solid rgb(207, 224, 211)"}}>工作條件</th>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>計畫期間可打工</td>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>Stamp 2：一般每週 20 小時，指定期間 40 小時</td>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>一般不具工作許可</td>
                </tr>
                <tr>
                  <th scope="row" style={{"padding": "14px 16px", "textAlign": "left", "verticalAlign": "top", "fontSize": "13.5px", "fontWeight": "800", "color": "rgb(95, 103, 95)", "borderTop": "1px solid rgb(207, 224, 211)"}}>申請限制</th>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>有年齡上限與名額限制</td>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>無打工度假年齡上限，需符合課程、財力、出席等條件</td>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>依學校與入境規定</td>
                </tr>
                <tr>
                  <th scope="row" style={{"padding": "14px 16px", "textAlign": "left", "verticalAlign": "top", "fontSize": "13.5px", "fontWeight": "800", "color": "rgb(95, 103, 95)", "borderTop": "1px solid rgb(207, 224, 211)"}}>適合誰</th>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>符合年齡、想彈性安排工作與旅行</td>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>想長期學英文並體驗海外生活</td>
                  <td style={{"padding": "14px 16px", "verticalAlign": "top", "fontSize": "15px", "lineHeight": "1.6", "borderTop": "1px solid rgb(207, 224, 211)"}}>時間有限、想先體驗再決定</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="l-sec" id="choose" style={{"background": "rgb(255, 255, 246)", "borderBottom": "1px solid rgb(207, 224, 211)", "padding": "96px 0px"}}>
        <div style={{"width": "min(1160px, 100% - 40px)", "margin": "0px auto", "display": "flex", "flexDirection": "column", "gap": "40px"}}>
          <header style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
            <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "textTransform": "uppercase", "color": "rgb(0, 82, 48)"}}>CHOOSING A SCHOOL</p>
            <h2 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(27px, 3.4vw, 42px)", "fontWeight": "900", "lineHeight": "1.3", "letterSpacing": "-0.012em", "color": "rgb(11, 57, 39)", "textWrap": "balance"}}>語言學校那麼多，怎麼知道哪一間適合自己？</h2>
            <p style={{"margin": "0px", "fontSize": "18px", "fontWeight": "700", "lineHeight": "1.6", "color": "rgb(0, 82, 48)"}}>沒有最好的語言學校，只有更適合你的選擇。</p>
          </header>
          <div className="l-split l-auto" style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) minmax(0px, 1fr)", "gap": "48px", "alignItems": "center"}}>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "28px"}}>
              <ul className="l-2" style={{"listStyle": "none", "margin": "0px", "padding": "0px", "display": "grid", "gridTemplateColumns": "repeat(2, minmax(0px, 1fr))", "gap": "20px 24px"}}>
                <li style={{"display": "flex", "flexDirection": "column", "gap": "8px"}}>
                  <span style={{"display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "16.5px", "fontWeight": "900", "color": "rgb(11, 57, 39)"}}><span style={{"width": "36px", "height": "36px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="wallet" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/wallet.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>預算</span>
                  <span style={{"fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>不只看學費，也要算整體生活成本。</span>
                </li>
                <li style={{"display": "flex", "flexDirection": "column", "gap": "8px"}}>
                  <span style={{"display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "16.5px", "fontWeight": "900", "color": "rgb(11, 57, 39)"}}><span style={{"width": "36px", "height": "36px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="map-pin" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/map-pin.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>城市</span>
                  <span style={{"fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>生活節奏、住宿與交通條件都不同。</span>
                </li>
                <li style={{"display": "flex", "flexDirection": "column", "gap": "8px"}}>
                  <span style={{"display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "16.5px", "fontWeight": "900", "color": "rgb(11, 57, 39)"}}><span style={{"width": "36px", "height": "36px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="book-open" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/book-open.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>學習需求</span>
                  <span style={{"fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>英文程度、課程時段與個人目標。</span>
                </li>
                <li style={{"display": "flex", "flexDirection": "column", "gap": "8px"}}>
                  <span style={{"display": "flex", "alignItems": "center", "gap": "10px", "fontSize": "16.5px", "fontWeight": "900", "color": "rgb(11, 57, 39)"}}><span style={{"width": "36px", "height": "36px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="badge-check" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/badge-check.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>品質與保障</span>
                  <span style={{"fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>合格課程、學校政策與 Learner Protection。</span>
                </li>
              </ul>
              <ol aria-label="哩來的選校方式" style={{"listStyle": "none", "margin": "0px", "padding": "20px 0px 0px", "borderTop": "1px solid rgb(207, 224, 211)", "display": "flex", "flexDirection": "column", "gap": "10px"}}>
                <li style={{"display": "grid", "gridTemplateColumns": "32px minmax(0px, 1fr)", "gap": "12px", "alignItems": "center"}}>
                  <span style={{"width": "32px", "height": "32px", "borderRadius": "999px", "border": "1px solid rgb(169, 198, 177)", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontSize": "14px", "fontWeight": "900", "color": "rgb(0, 82, 48)"}}>1</span>
                  <span style={{"fontSize": "15.5px", "fontWeight": "700"}}>了解你的目標、預算、城市與英文程度</span>
                </li>
                <li style={{"display": "grid", "gridTemplateColumns": "32px minmax(0px, 1fr)", "gap": "12px", "alignItems": "center"}}>
                  <span style={{"width": "32px", "height": "32px", "borderRadius": "999px", "border": "1px solid rgb(169, 198, 177)", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontSize": "14px", "fontWeight": "900", "color": "rgb(0, 82, 48)"}}>2</span>
                  <span style={{"fontSize": "15.5px", "fontWeight": "700"}}>從合格語校中篩掉不適合的選項</span>
                </li>
                <li style={{"display": "grid", "gridTemplateColumns": "32px minmax(0px, 1fr)", "gap": "12px", "alignItems": "center"}}>
                  <span style={{"width": "32px", "height": "32px", "borderRadius": "999px", "background": "rgb(0, 82, 48)", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontSize": "14px", "fontWeight": "900", "color": "rgb(255, 255, 255)"}}>3</span>
                  <span style={{"fontSize": "15.5px", "fontWeight": "900", "color": "rgb(11, 57, 39)"}}>最多推薦三間，並說明每間的取捨</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>
      <section className="l-sec" id="schools" style={{"borderBottom": "1px solid rgb(207, 224, 211)", "padding": "96px 0px"}}>
        <div style={{"width": "min(1160px, 100% - 40px)", "margin": "0px auto", "display": "flex", "flexDirection": "column", "gap": "36px"}}>
          <header style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
            <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "textTransform": "uppercase", "color": "rgb(0, 82, 48)"}}>PARTNER SCHOOLS</p>
            <h2 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(27px, 3.4vw, 42px)", "fontWeight": "900", "lineHeight": "1.3", "letterSpacing": "-0.012em", "color": "rgb(11, 57, 39)", "textWrap": "balance"}}>不同預算、不同生活方式，都有值得探索的選擇。</h2>
          </header>
          <div className="l-3" style={{"display": "grid", "gridTemplateColumns": "repeat(3, minmax(0px, 1fr))", "gap": "24px", "alignItems": "stretch"}}>
            <article className="l-sch" id={ireland25Plus8Schools[0].id} style={{"display": "flex", "flexDirection": "column", "background": "rgb(255, 255, 246)", "borderWidth": "4px 1px 1px", "borderStyle": "solid", "borderColor": "rgb(0, 82, 48) rgb(207, 224, 211) rgb(207, 224, 211)", "borderImage": "none", "borderRadius": "4px", "overflow": "hidden"}} tabIndex={-1}>
              <div className="sc-host-x" style={{"display": "contents"}}>
                <figure style={{"margin": "0px", "display": "flex", "flexDirection": "column", "gap": "var(--space-3)"}}>
                  <div style={{"position": "relative", "aspectRatio": "4 / 3", "overflow": "hidden", "border": "1px solid var(--border-hairline)", "borderRadius": "var(--radius-card)", "background": "var(--surface-accent-soft)", "boxShadow": "none"}}>
                    <img alt={ireland25Plus8Schools[0].image.alt} decoding="async" height={ireland25Plus8Schools[0].image.height} loading="lazy" src={ireland25Plus8Schools[0].image.src} style={{"width": "100%", "height": "100%", "objectFit": "cover", "display": "block"}} width={ireland25Plus8Schools[0].image.width} />
                  </div>
                </figure>
              </div>
              <div style={{"flex": "1 1 auto", "padding": "20px 22px 18px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
                <div style={{"display": "flex", "flexDirection": "column", "alignItems": "flex-start", "gap": "8px"}}>
                  <div className="sc-host-x" style={{"display": "contents"}}>
                    <span style={{"display": "inline-flex", "alignItems": "center", "gap": "var(--space-1)", "padding": "6px 12px", "borderRadius": "var(--radius-pill)", "fontFamily": "var(--font-body)", "fontSize": "12.5px", "fontWeight": "var(--fw-semibold)", "lineHeight": "1.35", "whiteSpace": "nowrap", "background": "var(--cta-bg)", "color": "var(--cta-fg)", "border": "1px solid transparent"}}>{ireland25Plus8Schools[0].tier}</span>
                  </div>
                  <p className="l-loc" style={{"margin": "0px", "display": "flex", "alignItems": "flex-start", "gap": "6px", "fontSize": "14px", "lineHeight": "1.55", "color": "rgb(63, 70, 63)"}}><span style={{"flex": "0 0 auto", "display": "flex", "paddingTop": "2px", "color": "rgb(0, 82, 48)"}}></span></p><div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="map-pin" role="presentation" style={{"display": "inline-block", "width": "16px", "height": "16px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/map-pin.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div><span>{ireland25Plus8Schools[0].location}</span><p></p>
                </div>
                <div style={{"display": "flex", "flexDirection": "column", "gap": "4px"}}>
                  <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "23px", "fontWeight": "900", "lineHeight": "1.35", "color": "rgb(11, 57, 39)"}}>{ireland25Plus8Schools[0].name}</h3>
                  <p style={{"margin": "0px", "fontSize": "13.5px", "fontWeight": "800", "color": "rgb(0, 82, 48)"}}>{ireland25Plus8Schools[0].tagline}</p>
                </div>
                <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>{ireland25Plus8Schools[0].description}</p>
                <div style={{"marginTop": "auto", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
                  <ul style={{"margin": "0px", "padding": "12px 0px 0px 18px", "borderTop": "1px solid rgb(207, 224, 211)", "display": "flex", "flexDirection": "column", "gap": "4px", "fontSize": "14.5px", "lineHeight": "1.65"}}>
                    <li>{ireland25Plus8Schools[0].features[0]}</li>
                    <li>{ireland25Plus8Schools[0].features[1]}</li>
                    <li>{ireland25Plus8Schools[0].features[2]}</li>
                  </ul>
                  <p style={{"margin": "0px", "fontSize": "14px", "lineHeight": "1.6", "color": "rgb(11, 57, 39)", "background": "rgb(234, 244, 236)", "borderRadius": "11px", "padding": "10px 12px"}}><strong style={{"fontWeight": "900"}}>適合：</strong>{ireland25Plus8Schools[0].suitableFor}</p>
                  <a data-school={ireland25Plus8Schools[0].name} href="/consult" style={{"display": "flex", "alignItems": "center", "gap": "6px", "minHeight": "44px", "fontSize": "15px", "fontWeight": "800"}}>問問哩來這間適不適合我<span aria-hidden="true" className="l-ar">→</span></a>
                </div>
              </div>
            </article>
            <article className="l-sch" id={ireland25Plus8Schools[1].id} style={{"display": "flex", "flexDirection": "column", "background": "rgb(255, 255, 246)", "borderWidth": "4px 1px 1px", "borderStyle": "solid", "borderColor": "rgb(0, 82, 48) rgb(207, 224, 211) rgb(207, 224, 211)", "borderImage": "none", "borderRadius": "4px", "overflow": "hidden"}} tabIndex={-1}>
              <div className="sc-host-x" style={{"display": "contents"}}>
                <figure style={{"margin": "0px", "display": "flex", "flexDirection": "column", "gap": "var(--space-3)"}}>
                  <div style={{"position": "relative", "aspectRatio": "4 / 3", "overflow": "hidden", "border": "1px solid var(--border-hairline)", "borderRadius": "var(--radius-card)", "background": "var(--surface-accent-soft)", "boxShadow": "none"}}>
                    <img alt={ireland25Plus8Schools[1].image.alt} decoding="async" height={ireland25Plus8Schools[1].image.height} loading="lazy" src={ireland25Plus8Schools[1].image.src} style={{"width": "100%", "height": "100%", "objectFit": "cover", "display": "block"}} width={ireland25Plus8Schools[1].image.width} />
                  </div>
                </figure>
              </div>
              <div style={{"flex": "1 1 auto", "padding": "20px 22px 18px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
                <div style={{"display": "flex", "flexDirection": "column", "alignItems": "flex-start", "gap": "8px"}}>
                  <div className="sc-host-x" style={{"display": "contents"}}>
                    <span style={{"display": "inline-flex", "alignItems": "center", "gap": "var(--space-1)", "padding": "6px 12px", "borderRadius": "var(--radius-pill)", "fontFamily": "var(--font-body)", "fontSize": "12.5px", "fontWeight": "var(--fw-semibold)", "lineHeight": "1.35", "whiteSpace": "nowrap", "background": "var(--cta-bg)", "color": "var(--cta-fg)", "border": "1px solid transparent"}}>{ireland25Plus8Schools[1].tier}</span>
                  </div>
                  <p className="l-loc" style={{"margin": "0px", "display": "flex", "alignItems": "flex-start", "gap": "6px", "fontSize": "14px", "lineHeight": "1.55", "color": "rgb(63, 70, 63)"}}><span style={{"flex": "0 0 auto", "display": "flex", "paddingTop": "2px", "color": "rgb(0, 82, 48)"}}></span></p><div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="map-pin" role="presentation" style={{"display": "inline-block", "width": "16px", "height": "16px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/map-pin.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div><span>{ireland25Plus8Schools[1].location}</span><p></p>
                </div>
                <div style={{"display": "flex", "flexDirection": "column", "gap": "4px"}}>
                  <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "23px", "fontWeight": "900", "lineHeight": "1.35", "color": "rgb(11, 57, 39)"}}>{ireland25Plus8Schools[1].name}</h3>
                  <p style={{"margin": "0px", "fontSize": "13.5px", "fontWeight": "800", "color": "rgb(0, 82, 48)"}}>{ireland25Plus8Schools[1].tagline}</p>
                </div>
                <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>{ireland25Plus8Schools[1].description}</p>
                <div style={{"marginTop": "auto", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
                  <ul style={{"margin": "0px", "padding": "12px 0px 0px 18px", "borderTop": "1px solid rgb(207, 224, 211)", "display": "flex", "flexDirection": "column", "gap": "4px", "fontSize": "14.5px", "lineHeight": "1.65"}}>
                    <li>{ireland25Plus8Schools[1].features[0]}</li>
                    <li>{ireland25Plus8Schools[1].features[1]}</li>
                    <li>{ireland25Plus8Schools[1].features[2]}</li>
                  </ul>
                  <p style={{"margin": "0px", "fontSize": "14px", "lineHeight": "1.6", "color": "rgb(11, 57, 39)", "background": "rgb(234, 244, 236)", "borderRadius": "11px", "padding": "10px 12px"}}><strong style={{"fontWeight": "900"}}>適合：</strong>{ireland25Plus8Schools[1].suitableFor}</p>
                  <a data-school={ireland25Plus8Schools[1].name} href="/consult" style={{"display": "flex", "alignItems": "center", "gap": "6px", "minHeight": "44px", "fontSize": "15px", "fontWeight": "800"}}>問問哩來這間適不適合我<span aria-hidden="true" className="l-ar">→</span></a>
                </div>
              </div>
            </article>
            <article className="l-sch" id={ireland25Plus8Schools[2].id} style={{"display": "flex", "flexDirection": "column", "background": "rgb(255, 255, 246)", "borderWidth": "4px 1px 1px", "borderStyle": "solid", "borderColor": "rgb(0, 82, 48) rgb(207, 224, 211) rgb(207, 224, 211)", "borderImage": "none", "borderRadius": "4px", "overflow": "hidden"}} tabIndex={-1}>
              <div className="sc-host-x" style={{"display": "contents"}}>
                <figure style={{"margin": "0px", "display": "flex", "flexDirection": "column", "gap": "var(--space-3)"}}>
                  <div style={{"position": "relative", "aspectRatio": "4 / 3", "overflow": "hidden", "border": "1px solid var(--border-hairline)", "borderRadius": "var(--radius-card)", "background": "var(--surface-accent-soft)", "boxShadow": "none"}}>
                    <img alt={ireland25Plus8Schools[2].image.alt} decoding="async" height={ireland25Plus8Schools[2].image.height} loading="lazy" src={ireland25Plus8Schools[2].image.src} style={{"width": "100%", "height": "100%", "objectFit": "cover", "display": "block"}} width={ireland25Plus8Schools[2].image.width} />
                  </div>
                </figure>
              </div>
              <div style={{"flex": "1 1 auto", "padding": "20px 22px 18px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
                <div style={{"display": "flex", "flexDirection": "column", "alignItems": "flex-start", "gap": "8px"}}>
                  <div className="sc-host-x" style={{"display": "contents"}}>
                    <span style={{"display": "inline-flex", "alignItems": "center", "gap": "var(--space-1)", "padding": "6px 12px", "borderRadius": "var(--radius-pill)", "fontFamily": "var(--font-body)", "fontSize": "12.5px", "fontWeight": "var(--fw-semibold)", "lineHeight": "1.35", "whiteSpace": "nowrap", "background": "var(--cta-bg)", "color": "var(--cta-fg)", "border": "1px solid transparent"}}>{ireland25Plus8Schools[2].tier}</span>
                  </div>
                  <p className="l-loc" style={{"margin": "0px", "display": "flex", "alignItems": "flex-start", "gap": "6px", "fontSize": "14px", "lineHeight": "1.55", "color": "rgb(63, 70, 63)"}}><span style={{"flex": "0 0 auto", "display": "flex", "paddingTop": "2px", "color": "rgb(0, 82, 48)"}}></span></p><div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="map-pin" role="presentation" style={{"display": "inline-block", "width": "16px", "height": "16px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/map-pin.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div><span>{ireland25Plus8Schools[2].location}</span><p></p>
                </div>
                <div style={{"display": "flex", "flexDirection": "column", "gap": "4px"}}>
                  <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "23px", "fontWeight": "900", "lineHeight": "1.35", "color": "rgb(11, 57, 39)"}}>{ireland25Plus8Schools[2].name}</h3>
                  <p style={{"margin": "0px", "fontSize": "13.5px", "fontWeight": "800", "color": "rgb(0, 82, 48)"}}>{ireland25Plus8Schools[2].tagline}</p>
                </div>
                <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>{ireland25Plus8Schools[2].description}</p>
                <div style={{"marginTop": "auto", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
                  <ul style={{"margin": "0px", "padding": "12px 0px 0px 18px", "borderTop": "1px solid rgb(207, 224, 211)", "display": "flex", "flexDirection": "column", "gap": "4px", "fontSize": "14.5px", "lineHeight": "1.65"}}>
                    <li>{ireland25Plus8Schools[2].features[0]}</li>
                    <li>{ireland25Plus8Schools[2].features[1]}</li>
                    <li>{ireland25Plus8Schools[2].features[2]}</li>
                  </ul>
                  <p style={{"margin": "0px", "fontSize": "14px", "lineHeight": "1.6", "color": "rgb(11, 57, 39)", "background": "rgb(234, 244, 236)", "borderRadius": "11px", "padding": "10px 12px"}}><strong style={{"fontWeight": "900"}}>適合：</strong>{ireland25Plus8Schools[2].suitableFor}</p>
                  <a data-school={ireland25Plus8Schools[2].name} href="/consult" style={{"display": "flex", "alignItems": "center", "gap": "6px", "minHeight": "44px", "fontSize": "15px", "fontWeight": "800"}}>問問哩來這間適不適合我<span aria-hidden="true" className="l-ar">→</span></a>
                </div>
              </div>
            </article>
          </div>
          <div className="l-city" style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "12px 24px", "alignItems": "center", "background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "padding": "20px 24px"}}>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "4px"}}>
              <p style={{"margin": "0px", "fontSize": "16px", "fontWeight": "900", "color": "rgb(11, 57, 39)"}}>不只都柏林</p>
              <p style={{"margin": "0px", "fontSize": "14.5px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>哩來也有其他愛爾蘭城市的合作語校。真正適合你的學校，要從預算、城市與個人目標一起評估。</p>
            </div>
            <a href="/consult" style={{"display": "flex", "alignItems": "center", "minHeight": "44px", "fontSize": "15px", "fontWeight": "800", "whiteSpace": "nowrap"}}>一起比較其他城市 →</a>
          </div>
          <p style={{"margin": "-12px 0px 0px", "fontSize": "13.5px", "lineHeight": "1.65", "color": "rgb(95, 103, 95)"}}>級距依哩來 2026 年 9 月整理的比較資料，不是即時報價。</p>
        </div>
      </section>
      <section className="l-sec" id="why-lilai" style={{"background": "rgb(255, 255, 246)", "borderBottom": "1px solid rgb(207, 224, 211)", "padding": "96px 0px"}}>
        <div style={{"width": "min(1160px, 100% - 40px)", "margin": "0px auto", "display": "flex", "flexDirection": "column", "gap": "56px"}}>
          <header style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
            <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "textTransform": "uppercase", "color": "rgb(0, 82, 48)"}}>WHY LILAI</p>
            <h2 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(27px, 3.4vw, 42px)", "fontWeight": "900", "lineHeight": "1.3", "letterSpacing": "-0.012em", "color": "rgb(11, 57, 39)", "textWrap": "balance"}}>不只是幫你報名學校，更陪你把出發準備好。</h2>
          </header>
          <div className="l-3" style={{"display": "grid", "gridTemplateColumns": "repeat(3, minmax(0px, 1fr))", "gap": "0px", "borderTop": "2px solid rgb(11, 57, 39)"}}>
            <div style={{"padding": "22px 24px 0px 0px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>
              <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "22px", "fontWeight": "900", "color": "rgb(213, 149, 0)"}}>01</p>
              <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "22px", "fontWeight": "900", "color": "rgb(11, 57, 39)"}}>客製化選校</h3>
              <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>先了解你的需求，最多推薦三間語校，並說明取捨。</p>
              <a href="#choose" style={{"display": "flex", "alignItems": "center", "minHeight": "44px", "fontSize": "14.5px", "fontWeight": "800"}}>看選校方式 →</a>
            </div>
            <div style={{"padding": "22px 24px 0px 0px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>
              <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "22px", "fontWeight": "900", "color": "rgb(213, 149, 0)"}}>02</p>
              <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "22px", "fontWeight": "900", "color": "rgb(11, 57, 39)"}}>開局大禮包</h3>
              <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>依方案條件提供行前、求職、通訊與英語練習資源。</p>
              <a href="#gift" style={{"display": "flex", "alignItems": "center", "minHeight": "44px", "fontSize": "14.5px", "fontWeight": "800"}}>看內容 →</a>
            </div>
            <div style={{"padding": "22px 0px 0px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>
              <p style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "22px", "fontWeight": "900", "color": "rgb(213, 149, 0)"}}>03</p>
              <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "22px", "fontWeight": "900", "color": "rgb(11, 57, 39)"}}>愛爾蘭在地經驗</h3>
              <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>找房、PPSN、IRP、開戶與打工，學長姐自己都走過。</p>
              <a href="#team" style={{"display": "flex", "alignItems": "center", "minHeight": "44px", "fontSize": "14.5px", "fontWeight": "800"}}>認識團隊 →</a>
            </div>
          </div>
          <div className="l-gift l-auto" id="gift" style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) minmax(0px, 1fr)", "gap": "48px", "alignItems": "center", "background": "rgb(250, 248, 239)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "padding": "clamp(24px, 4vw, 44px)"}}>
            <div className="sc-host-x" style={{"display": "contents"}}>
              <figure style={{"margin": "0px", "display": "flex", "flexDirection": "column", "gap": "var(--space-3)"}}>
                <div style={{"position": "relative", "aspectRatio": "4 / 3", "overflow": "hidden", "border": "1px solid var(--border-hairline)", "borderRadius": "var(--radius-card)", "background": "var(--surface-accent-soft)", "boxShadow": "var(--shadow-offset)"}}>
                  <img alt="愛爾蘭開局大禮包：行前開局雙手冊、服務業求職攻略、抵達後的網路方案、AI 英文練功系統、出發前 30 天準備清單" decoding="async" height="1200" loading="lazy" src="/assets/ireland-25-plus-8/photos/starter-pack.jpg" style={{"width": "100%", "height": "100%", "objectFit": "cover", "display": "block"}} width="1600" />
                </div>
              </figure>
            </div>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "20px"}}>
              <div style={{"display": "flex", "flexDirection": "column", "gap": "8px"}}>
                <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "color": "rgb(0, 82, 48)"}}>開局大禮包</p>
                <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "26px", "fontWeight": "900", "lineHeight": "1.35", "color": "rgb(11, 57, 39)"}}>出發前後會用到的資源，先幫你整理好</h3>
              </div>
              <ul className="l-2" style={{"listStyle": "none", "margin": "0px", "padding": "0px", "display": "grid", "gridTemplateColumns": "repeat(2, minmax(0px, 1fr))", "gap": "12px"}}>
                <li style={{"display": "flex", "flexDirection": "column", "gap": "0px", "background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "overflow": "hidden"}}>
                  <div style={{"display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "56px", "padding": "10px 14px"}}>
                    <span style={{"flex": "0 0 auto", "width": "36px", "height": "36px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="book-open" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/book-open.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>
                    <span style={{"fontSize": "15px", "fontWeight": "800", "lineHeight": "1.45", "color": "rgb(11, 57, 39)"}}>行前準備與生活指南</span>
                  </div>
                </li>
                <li style={{"display": "flex", "flexDirection": "column", "gap": "0px", "background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "overflow": "hidden"}}>
                  <div style={{"display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "56px", "padding": "10px 14px"}}>
                    <span style={{"flex": "0 0 auto", "width": "36px", "height": "36px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="briefcase" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/briefcase.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>
                    <span style={{"fontSize": "15px", "fontWeight": "800", "lineHeight": "1.45", "color": "rgb(11, 57, 39)"}}>愛爾蘭服務業求職攻略</span>
                  </div>
                </li>
                <li style={{"display": "flex", "flexDirection": "column", "gap": "0px", "background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "overflow": "hidden"}}>
                  <div style={{"display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "56px", "padding": "10px 14px"}}>
                    <span style={{"flex": "0 0 auto", "width": "36px", "height": "36px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="smartphone" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/smartphone.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>
                    <span style={{"fontSize": "15px", "fontWeight": "800", "lineHeight": "1.45", "color": "rgb(11, 57, 39)"}}>通訊與 eSIM 相關資源</span>
                  </div>
                </li>
                <li style={{"display": "flex", "flexDirection": "column", "gap": "0px", "background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "overflow": "hidden"}}>
                  <div style={{"display": "flex", "alignItems": "center", "gap": "12px", "minHeight": "56px", "padding": "10px 14px"}}>
                    <span style={{"flex": "0 0 auto", "width": "36px", "height": "36px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "display": "flex", "alignItems": "center", "justifyContent": "center", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="messages-square" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/messages-square.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>
                    <span style={{"fontSize": "15px", "fontWeight": "800", "lineHeight": "1.45", "color": "rgb(11, 57, 39)"}}>AI 英語練習相關資源</span>
                  </div>
                </li>
              </ul>
              <p style={{"margin": "0px", "fontSize": "14px", "lineHeight": "1.65", "color": "rgb(63, 70, 63)"}}>透過哩來適用方案報名的學弟妹，可依方案條件取得。不同方案（如 LITE／PRO）內容與資格不同，以報名方案與當期公告為準。</p>
            </div>
          </div>
          <div className="l-split l-auto" id="team" style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1.1fr) minmax(0px, 0.9fr)", "gap": "48px", "alignItems": "center"}}>
            <div className="sc-host-x" style={{"display": "contents"}}>
              <figure style={{"margin": "0px", "display": "flex", "flexDirection": "column", "gap": "var(--space-3)"}}>
                <div style={{"position": "relative", "aspectRatio": "3 / 2", "overflow": "hidden", "border": "1px solid var(--border-hairline)", "borderRadius": "var(--radius-card)", "background": "var(--surface-accent-soft)", "boxShadow": "var(--shadow-offset)"}}>
                  <img alt="哩來團隊與學弟妹在都柏林咖啡廳聚會，手拿歡迎卡片" decoding="async" height="543" loading="lazy" src="/assets/ireland-25-plus-8/photos/lilai-community-meetup.jpg" style={{"width": "100%", "height": "100%", "objectFit": "cover", "display": "block"}} width="724" />
                </div>
                <figcaption style={{"fontFamily": "var(--font-body)", "fontSize": "var(--fs-small)", "lineHeight": "1.6", "color": "var(--text-muted)"}}>哩來與學弟妹在都柏林的聚會。</figcaption>
              </figure>
            </div>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "14px", "maxWidth": "620px"}}>
              <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "color": "rgb(0, 82, 48)"}}>在地經驗</p>
              <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "26px", "fontWeight": "900", "lineHeight": "1.35", "color": "rgb(11, 57, 39)"}}>有愛爾蘭在地生活經驗的學長姐，陪你少走一點冤枉路</h3>
              <p style={{"margin": "0px", "fontSize": "15.5px", "lineHeight": "1.72", "color": "rgb(63, 70, 63)"}}>除了選校與報名，哩來也透過行前說明會、抵達後的資訊整理，以及學長姐的真實經驗分享，陪你準備在愛爾蘭的生活。</p>
              <p style={{"margin": "0px", "fontSize": "13.5px", "color": "rgb(95, 103, 95)"}}>服務內容依實際方案為準；哩來不承諾保證工作或保證住宿。</p>
              <div style={{"display": "flex", "marginTop": "6px"}}>
                <div className="sc-host-x" style={{"display": "contents"}}>
                  <Ireland25Plus8Cta href="/consult" label="讓哩來幫我規劃 25+8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="l-sec" id="stories" style={{"borderBottom": "1px solid rgb(207, 224, 211)", "padding": "96px 0px"}}>
        <div style={{"width": "min(1160px, 100% - 40px)", "margin": "0px auto", "display": "flex", "flexDirection": "column", "gap": "36px"}}>
          <header style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
            <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "textTransform": "uppercase", "color": "rgb(0, 82, 48)"}}>REAL STORIES</p>
            <h2 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(27px, 3.4vw, 42px)", "fontWeight": "900", "lineHeight": "1.3", "letterSpacing": "-0.012em", "color": "rgb(11, 57, 39)", "textWrap": "balance"}}>每一段愛爾蘭生活，都從不同的起點開始。</h2>
          </header>
          <div className="l-car-ctrl" style={{"alignItems": "center", "justifyContent": "space-between", "gap": "12px", "margin": "-16px 0px -20px"}}>
            <p style={{"margin": "0px", "fontSize": "13.5px", "color": "rgb(95, 103, 95)"}}>左右滑動，或用按鈕切換 · <span aria-live="polite">01 / 02</span></p>
            <div style={{"display": "flex", "gap": "8px"}}>
              <button aria-label="上一則故事" className="l-car-btn" data-car-prev="1" disabled style={{"fontStyle": "inherit", "fontVariant": "inherit", "fontWeight": "inherit", "fontStretch": "inherit", "fontSize": "18px", "lineHeight": "inherit", "fontFamily": "inherit", "fontOpticalSizing": "inherit", "fontSizeAdjust": "inherit", "fontKerning": "inherit", "fontFeatureSettings": "inherit", "fontVariationSettings": "inherit", "fontLanguageOverride": "inherit", "cursor": "pointer", "width": "44px", "height": "44px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "background": "rgb(255, 255, 246)", "color": "rgb(0, 82, 48)"}} title="上一則故事" type="button">←</button>
              <button aria-label="下一則故事" className="l-car-btn" data-car-next="1" style={{"fontStyle": "inherit", "fontVariant": "inherit", "fontWeight": "inherit", "fontStretch": "inherit", "fontSize": "18px", "lineHeight": "inherit", "fontFamily": "inherit", "fontOpticalSizing": "inherit", "fontSizeAdjust": "inherit", "fontKerning": "inherit", "fontFeatureSettings": "inherit", "fontVariationSettings": "inherit", "fontLanguageOverride": "inherit", "cursor": "pointer", "width": "44px", "height": "44px", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "999px", "background": "rgb(255, 255, 246)", "color": "rgb(0, 82, 48)"}} title="下一則故事" type="button">→</button>
            </div>
          </div>
          <div aria-label="學弟妹故事（可用左右方向鍵切換）" className="l-car l-2" data-car="1" role="region" style={{"display": "grid", "gridTemplateColumns": "repeat(2, minmax(0px, 1fr))", "gap": "24px", "alignItems": "start"}} tabIndex={0}>
            <article data-active="true" style={{"display": "flex", "flexDirection": "column", "background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "overflow": "hidden"}}>
              <div className="sc-host-x" style={{"display": "contents"}}>
                <figure style={{"margin": "0px", "display": "flex", "flexDirection": "column", "gap": "var(--space-3)"}}>
                  <div style={{"position": "relative", "aspectRatio": "4 / 3", "overflow": "hidden", "border": "1px solid var(--border-hairline)", "borderRadius": "var(--radius-card)", "background": "var(--surface-accent-soft)", "boxShadow": "none"}}>
                    <img alt="Mo 分享的都柏林生活照片" decoding="async" height="1050" loading="lazy" src="/assets/ireland-25-plus-8/photos/story-mo.jpg" style={{"width": "100%", "height": "100%", "objectFit": "cover", "display": "block"}} width="1400" />
                  </div>
                </figure>
              </div>
              <div style={{"padding": "22px 24px 24px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
                <p style={{"margin": "0px", "display": "flex", "alignItems": "center", "gap": "12px"}}>
                  <span style={{"fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "18px", "fontWeight": "900", "lineHeight": "1", "color": "rgb(213, 149, 0)"}}>01</span>
                  <span style={{"display": "flex", "alignItems": "center", "minHeight": "28px", "padding": "0px 12px", "borderRadius": "999px", "background": "rgb(234, 244, 236)", "fontSize": "13px", "fontWeight": "800", "color": "rgb(0, 82, 48)"}}>25+8｜英文成長</span>
                </p>
                <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(20px, 2vw, 23px)", "fontWeight": "900", "lineHeight": "1.4", "color": "rgb(11, 57, 39)", "textWrap": "balance"}}>從聽不懂英文，到勇敢在都柏林工作</h3>
                <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.72", "color": "rgb(63, 70, 63)"}}>剛畢業的 Mo，曾經連最基本的英文對話都聽不懂。來到都柏林後，她透過課堂互動慢慢累積信心，六個月後開始能應付餐廳工作中的客人提問。雖然也有挫折，她仍一步步找到開口的勇氣。</p>
                <figure style={{"margin": "4px 0px 0px", "padding": "2px 0px 2px 16px", "borderLeft": "3px solid rgb(255, 190, 18)", "display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <blockquote style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "17.5px", "fontWeight": "700", "lineHeight": "1.65", "color": "rgb(11, 57, 39)"}}>「英文不好真的不是什麼嚴重的問題，只要你敢踏出第一步去嘗試，你就已經是最厲害的了！」</blockquote>
                  <figcaption style={{"fontSize": "13.5px", "color": "rgb(95, 103, 95)"}}>— Mo</figcaption>
                </figure>
              </div>
            </article>
            <article data-active="false" style={{"display": "flex", "flexDirection": "column", "background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "overflow": "hidden"}}>
              <div className="sc-host-x" style={{"display": "contents"}}>
                <figure style={{"margin": "0px", "display": "flex", "flexDirection": "column", "gap": "var(--space-3)"}}>
                  <div style={{"position": "relative", "aspectRatio": "4 / 3", "overflow": "hidden", "border": "1px solid var(--border-hairline)", "borderRadius": "var(--radius-card)", "background": "var(--surface-accent-soft)", "boxShadow": "none"}}>
                    <img alt="Lynne 分享的語校課堂照片" decoding="async" height="1050" loading="lazy" src="/assets/ireland-25-plus-8/photos/story-lynne.jpg" style={{"width": "100%", "height": "100%", "objectFit": "cover", "display": "block"}} width="1400" />
                  </div>
                </figure>
              </div>
              <div style={{"padding": "22px 24px 24px", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
                <p style={{"margin": "0px", "display": "flex", "alignItems": "center", "gap": "12px"}}>
                  <span style={{"fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "18px", "fontWeight": "900", "lineHeight": "1", "color": "rgb(213, 149, 0)"}}>02</span>
                  <span style={{"display": "flex", "alignItems": "center", "minHeight": "28px", "padding": "0px 12px", "borderRadius": "999px", "background": "rgb(234, 244, 236)", "fontSize": "13px", "fontWeight": "800", "color": "rgb(0, 82, 48)"}}>25+8｜人生探索</span>
                </p>
                <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(20px, 2vw, 23px)", "fontWeight": "900", "lineHeight": "1.4", "color": "rgb(11, 57, 39)", "textWrap": "balance"}}>工作一年後，決定看看更大的世界</h3>
                <p style={{"margin": "0px", "fontSize": "15px", "lineHeight": "1.72", "color": "rgb(63, 70, 63)"}}>景觀設計系畢業、工作一年的 Lynne，原本計畫前往英國，後來選擇了愛爾蘭。她享受國際化的語校生活，也曾遇到寄宿家庭問題。哩來協助她與學校溝通，讓她在異地感受到有人可以一起面對困難。</p>
                <figure style={{"margin": "4px 0px 0px", "padding": "2px 0px 2px 16px", "borderLeft": "3px solid rgb(255, 190, 18)", "display": "flex", "flexDirection": "column", "gap": "6px"}}>
                  <blockquote style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "17.5px", "fontWeight": "700", "lineHeight": "1.65", "color": "rgb(11, 57, 39)"}}>「後面遇到的事情也不太會擔心了，會覺得後面有人在的感覺。」</blockquote>
                  <figcaption style={{"fontSize": "13.5px", "color": "rgb(95, 103, 95)"}}>— Lynne</figcaption>
                </figure>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="l-sec" id="process" style={{"background": "rgb(255, 255, 246)", "borderBottom": "1px solid rgb(207, 224, 211)", "padding": "96px 0px"}}>
        <div style={{"width": "min(1160px, 100% - 40px)", "margin": "0px auto", "display": "flex", "flexDirection": "column", "gap": "36px"}}>
          <header style={{"display": "flex", "flexDirection": "column", "gap": "16px"}}>
            <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "textTransform": "uppercase", "color": "rgb(0, 82, 48)"}}>HOW TO START</p>
            <h2 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(27px, 3.4vw, 42px)", "fontWeight": "900", "lineHeight": "1.3", "letterSpacing": "-0.012em", "color": "rgb(11, 57, 39)", "textWrap": "balance"}}>你的愛爾蘭冒險，可以從這四步開始。</h2>
          </header>
          <div className="l-4" style={{"display": "grid", "gridTemplateColumns": "repeat(4, minmax(0px, 1fr))", "gap": "16px", "alignItems": "start"}}>
            <div className="sc-host-x" style={{"display": "contents"}}>
              <div style={{"background": "var(--surface-accent-soft)", "border": "1px solid var(--color-green)", "borderRadius": "var(--radius-card)", "padding": "var(--space-6)", "display": "flex", "flexDirection": "column", "gap": "var(--space-3)"}}>
                <span style={{"fontFamily": "var(--font-display)", "fontSize": "30px", "fontWeight": "var(--fw-black)", "lineHeight": "1", "color": "var(--color-green)"}}>01</span>
                <h4 style={{"fontFamily": "var(--font-body)", "fontSize": "var(--fs-card-title)", "fontWeight": "var(--fw-bold)", "lineHeight": "1.35", "color": "var(--text-heading)", "margin": "0px"}}>填寫免費出發評估</h4>
                <p style={{"fontSize": "var(--fs-body)", "lineHeight": "var(--lh-body)", "color": "var(--text-muted)", "margin": "0px"}}>讓哩來初步了解你的目標、預算與出發計畫。</p>
              </div>
            </div>
            <div className="sc-host-x" style={{"display": "contents"}}>
              <div style={{"background": "var(--surface-card)", "border": "1px solid var(--border-hairline)", "borderRadius": "var(--radius-card)", "padding": "var(--space-6)", "display": "flex", "flexDirection": "column", "gap": "var(--space-3)"}}>
                <span style={{"fontFamily": "var(--font-display)", "fontSize": "30px", "fontWeight": "var(--fw-black)", "lineHeight": "1", "color": "var(--color-green)"}}>02</span>
                <h4 style={{"fontFamily": "var(--font-body)", "fontSize": "var(--fs-card-title)", "fontWeight": "var(--fw-bold)", "lineHeight": "1.35", "color": "var(--text-heading)", "margin": "0px"}}>觀看說明會重播</h4>
                <p style={{"fontSize": "var(--fs-body)", "lineHeight": "var(--lh-body)", "color": "var(--text-muted)", "margin": "0px"}}>依流程取得說明會重播，先了解 25+8 與出發方式。</p>
              </div>
            </div>
            <div className="sc-host-x" style={{"display": "contents"}}>
              <div style={{"background": "var(--surface-card)", "border": "1px solid var(--border-hairline)", "borderRadius": "var(--radius-card)", "padding": "var(--space-6)", "display": "flex", "flexDirection": "column", "gap": "var(--space-3)"}}>
                <span style={{"fontFamily": "var(--font-display)", "fontSize": "30px", "fontWeight": "var(--fw-black)", "lineHeight": "1", "color": "var(--color-green)"}}>03</span>
                <h4 style={{"fontFamily": "var(--font-body)", "fontSize": "var(--fs-card-title)", "fontWeight": "var(--fw-bold)", "lineHeight": "1.35", "color": "var(--text-heading)", "margin": "0px"}}>預約免費一對一諮詢</h4>
                <p style={{"fontSize": "var(--fs-body)", "lineHeight": "var(--lh-body)", "color": "var(--text-muted)", "margin": "0px"}}>看完重播後預約，一起討論你的出發計畫與語校選擇。</p>
              </div>
            </div>
            <div className="sc-host-x" style={{"display": "contents"}}>
              <div style={{"background": "var(--surface-card)", "border": "1px solid var(--border-hairline)", "borderRadius": "var(--radius-card)", "padding": "var(--space-6)", "display": "flex", "flexDirection": "column", "gap": "var(--space-3)"}}>
                <span style={{"fontFamily": "var(--font-display)", "fontSize": "30px", "fontWeight": "var(--fw-black)", "lineHeight": "1", "color": "var(--color-green)"}}>04</span>
                <h4 style={{"fontFamily": "var(--font-body)", "fontSize": "var(--fs-card-title)", "fontWeight": "var(--fw-bold)", "lineHeight": "1.35", "color": "var(--text-heading)", "margin": "0px"}}>確認學校、報名與行前準備</h4>
                <p style={{"fontSize": "var(--fs-body)", "lineHeight": "var(--lh-body)", "color": "var(--text-muted)", "margin": "0px"}}>完成適用的報名流程，並使用行前資源。</p>
              </div>
            </div>
          </div>
          <div id="consult" style={{"display": "flex", "flexDirection": "column", "gap": "18px", "paddingTop": "12px"}}>
            <div style={{"display": "flex", "flexDirection": "column", "gap": "8px"}}>
              <h3 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(22px, 2.4vw, 28px)", "fontWeight": "900", "lineHeight": "1.35", "color": "rgb(11, 57, 39)"}}>想跟哩來一對一聊聊？有兩種方式。</h3>
              <p style={{"margin": "0px", "fontSize": "15.5px", "lineHeight": "1.7", "color": "rgb(63, 70, 63)"}}>兩種方式都能獲得一對一諮詢，差別在於是否先完成免費評估及重播流程。</p>
            </div>
            <div className="l-2" style={{"display": "grid", "gridTemplateColumns": "repeat(2, minmax(0px, 1fr))", "gap": "16px", "alignItems": "stretch"}}>
              <article data-cta-zone="consult" style={{"background": "rgb(255, 255, 246)", "border": "2px solid rgb(0, 82, 48)", "borderRadius": "4px", "padding": "clamp(20px, 3vw, 28px)", "display": "flex", "flexDirection": "column", "gap": "14px", "boxShadow": "rgba(0, 82, 48, 0.08) 14px 14px 0px"}}>
                <p style={{"margin": "0px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "8px"}}></p>
                  <div className="sc-host-x" style={{"display": "contents"}}>
                    <span style={{"display": "inline-flex", "alignItems": "center", "gap": "var(--space-1)", "padding": "6px 12px", "borderRadius": "var(--radius-pill)", "fontFamily": "var(--font-body)", "fontSize": "12.5px", "fontWeight": "var(--fw-semibold)", "lineHeight": "1.35", "whiteSpace": "nowrap", "background": "var(--cta-bg)", "color": "var(--cta-fg)", "border": "1px solid transparent"}}>免費</span>
                  </div>
                  <span style={{"fontSize": "13px", "fontWeight": "800", "color": "rgb(63, 70, 63)"}}>一般流程</span>
                <p></p>
                <div style={{"display": "flex", "flexDirection": "column", "gap": "4px"}}>
                  <h4 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "22px", "fontWeight": "900", "lineHeight": "1.4", "color": "rgb(11, 57, 39)"}}>免費一對一諮詢</h4>
                  <p style={{"margin": "0px", "fontSize": "15.5px", "lineHeight": "1.7", "color": "rgb(95, 103, 95)"}}>先了解，再討論</p>
                </div>
                <ul style={{"listStyle": "none", "margin": "0px", "padding": "0px", "display": "flex", "flexDirection": "column", "gap": "10px", "fontSize": "15.5px", "lineHeight": "1.6", "color": "rgb(26, 26, 26)"}}>
                  <li style={{"display": "flex", "alignItems": "center", "gap": "10px"}}><span style={{"display": "flex", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="check" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/check.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>完成免費出發評估</li>
                  <li style={{"display": "flex", "alignItems": "center", "gap": "10px"}}><span style={{"display": "flex", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="check" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/check.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>觀看說明會重播</li>
                  <li style={{"display": "flex", "alignItems": "center", "gap": "10px"}}><span style={{"display": "flex", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="check" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/check.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>預約免費一對一諮詢</li>
                </ul>
                <p style={{"margin": "0px", "fontSize": "14px", "lineHeight": "1.65", "color": "rgb(95, 103, 95)"}}>不收費，依流程完成即可預約。</p>
                <div className="l-wrapbtn" style={{"display": "flex", "marginTop": "auto", "paddingTop": "6px"}}>
                  <div className="sc-host-x" style={{"display": "contents"}}>
                    <Ireland25Plus8Cta href="/consult" compact label="開始免費出發評估 →" />
                  </div>
                </div>
              </article>
              <article data-cta-zone="consult-paid" style={{"background": "rgb(255, 255, 246)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "4px", "padding": "clamp(20px, 3vw, 28px)", "display": "flex", "flexDirection": "column", "gap": "14px"}}>
                <p style={{"margin": "0px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "8px"}}></p>
                  <div className="sc-host-x" style={{"display": "contents"}}>
                    <span style={{"display": "inline-flex", "alignItems": "center", "gap": "var(--space-1)", "padding": "6px 12px", "borderRadius": "var(--radius-pill)", "fontFamily": "var(--font-body)", "fontSize": "12.5px", "fontWeight": "var(--fw-semibold)", "lineHeight": "1.35", "whiteSpace": "nowrap", "background": "var(--surface-accent-soft)", "color": "var(--color-green)", "border": "1px solid var(--border-hairline)"}}>付費</span>
                  </div>
                  <span style={{"fontSize": "13px", "fontWeight": "800", "color": "rgb(63, 70, 63)"}}>免前置</span>
                <p></p>
                <div style={{"display": "flex", "flexDirection": "column", "gap": "4px"}}>
                  <h4 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "22px", "fontWeight": "900", "lineHeight": "1.4", "color": "rgb(11, 57, 39)"}}>付費快速諮詢</h4>
                  <p style={{"margin": "0px", "fontSize": "15.5px", "lineHeight": "1.7", "color": "rgb(95, 103, 95)"}}>有方向，就直接聊</p>
                </div>
                <ul style={{"listStyle": "none", "margin": "0px", "padding": "0px", "display": "flex", "flexDirection": "column", "gap": "10px", "fontSize": "15.5px", "lineHeight": "1.6", "color": "rgb(26, 26, 26)"}}>
                  <li style={{"display": "flex", "alignItems": "center", "gap": "10px"}}><span style={{"display": "flex", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="check" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/check.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>免填完整評估</li>
                  <li style={{"display": "flex", "alignItems": "center", "gap": "10px"}}><span style={{"display": "flex", "color": "rgb(0, 82, 48)"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="check" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/check.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>免看說明會重播</li>
                  <li style={{"display": "flex", "alignItems": "flex-start", "gap": "10px"}}><span style={{"display": "flex", "color": "rgb(0, 82, 48)", "paddingTop": "3px"}}>
                      <div className="sc-host-x" style={{"display": "contents"}}>
                        <span aria-hidden="true" data-lucide="check" role="presentation" style={{"display": "inline-block", "width": "18px", "height": "18px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/check.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
                      </div>
                    </span>透過哩來報名並開課後，退還諮詢費</li>
                </ul>
                <p style={{"margin": "0px", "fontSize": "14px", "lineHeight": "1.65", "color": "rgb(95, 103, 95)"}}>費用與退費條件以哩來正式公告為準。</p>
                <div className="l-wrapbtn" style={{"display": "flex", "marginTop": "auto", "paddingTop": "6px"}}>
                  <div className="sc-host-x" style={{"display": "contents"}}>
                    <Ireland25Plus8Cta aria-disabled="true" data-paid-consult="" role="link" tabIndex={-1} variant="surface" compact label="直接預約付費諮詢 →" />
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
      <section className="l-sec" id="faq" style={{"borderBottom": "1px solid rgb(207, 224, 211)", "padding": "96px 0px"}}>
        <div style={{"width": "min(940px, 100% - 40px)", "margin": "0px auto", "display": "flex", "flexDirection": "column", "gap": "32px"}}>
          <header style={{"display": "flex", "flexDirection": "column", "gap": "16px", "alignItems": "center", "textAlign": "center"}}>
            <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "textTransform": "uppercase", "color": "rgb(0, 82, 48)"}}>FREQUENTLY ASKED</p>
            <h2 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(27px, 3.4vw, 42px)", "fontWeight": "900", "lineHeight": "1.3", "color": "rgb(11, 57, 39)"}}>愛爾蘭 25+8 常見問題</h2>
          </header>
          <div style={{"display": "flex", "flexDirection": "column", "gap": "10px"}}>
            <Ireland25Plus8Faq />









          </div>
          <p style={{"margin": "0px", "fontSize": "13.5px", "lineHeight": "1.65", "color": "rgb(95, 103, 95)", "textAlign": "center"}}>移民法規、財力要求與學校資格以 <a href="https://www.irishimmigration.ie/coming-to-study-in-ireland/what-are-my-study-options/a-third-level-course-or-a-language-course/" rel="noopener" target="_blank">Irish Immigration Service</a> 最新資料為準。資料整理日期：2026 年 11 月 16 日。</p>
        </div>
      </section>
      <section data-cta-zone="final" id="start" style={{"background": "rgb(11, 57, 39)", "padding": "96px 0px"}}>
        <div className="l-split l-auto" style={{"width": "min(1160px, 100% - 40px)", "margin": "0px auto", "display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) minmax(0px, 1fr)", "gap": "56px", "alignItems": "center"}}>
          <div style={{"display": "flex", "flexDirection": "column", "gap": "20px", "maxWidth": "640px"}}>
            <p style={{"margin": "0px", "fontSize": "12px", "fontWeight": "900", "letterSpacing": "0.09em", "textTransform": "uppercase", "color": "rgb(255, 190, 18)"}}>YOUR IRELAND JOURNEY STARTS HERE</p>
            <h2 style={{"margin": "0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "clamp(30px, 4vw, 46px)", "fontWeight": "900", "lineHeight": "1.25", "color": "rgb(255, 255, 255)"}}>你的愛爾蘭冒險，從這裡開始。</h2>
            <p style={{"margin": "0px", "fontSize": "17px", "lineHeight": "1.8", "color": "rgba(255, 255, 255, 0.86)"}}>不確定 25+8 適不適合自己、該準備多少預算、選哪一間學校？沒關係，你不需要一開始就知道所有答案。先告訴哩來你的想法，我們一起把出發方向整理清楚。</p>
            <div style={{"display": "flex", "marginTop": "4px"}}>
              <div className="sc-host-x" style={{"display": "contents"}}>
                <Ireland25Plus8Cta href="/consult" variant="white" label="免費評估我的愛爾蘭出發計畫" />
              </div>
            </div>
            <p style={{"margin": "0px", "fontSize": "13.5px", "lineHeight": "1.65", "color": "rgba(255, 255, 255, 0.75)"}}>免費出發評估是了解需求的第一步，不代表保證入學、居留或工作機會。</p>
            <p style={{"margin": "8px 0px 0px", "fontFamily": "\"Ireland25 Noto Serif TC\", serif", "fontSize": "21px", "fontWeight": "700", "color": "rgb(255, 190, 18)"}}>一起把夢，過成生活。</p>
          </div>
        </div>
      </section>
    </main>
<div aria-hidden="true" data-show="false" data-sticky="1">
      <div aria-hidden="true" style={{"display": "grid", "gridTemplateColumns": "repeat(4, minmax(0px, 1fr))", "gap": "3px", "background": "rgb(250, 248, 239)"}}>
        <span className="l-jm" data-state="todo" style={{"display": "block", "height": "3px", "background": "rgb(207, 224, 211)", "transition": "background-color 250ms"}}></span>
        <span className="l-jm" data-state="todo" style={{"display": "block", "height": "3px", "background": "rgb(207, 224, 211)", "transition": "background-color 250ms"}}></span>
        <span className="l-jm" data-state="todo" style={{"display": "block", "height": "3px", "background": "rgb(207, 224, 211)", "transition": "background-color 250ms"}}></span>
        <span className="l-jm" data-state="todo" style={{"display": "block", "height": "3px", "background": "rgb(207, 224, 211)", "transition": "background-color 250ms"}}></span>
      </div>
      <div className="sc-host-x" style={{"display": "contents"}}>
        <div style={{"position": "sticky", "bottom": "0px", "zIndex": "30", "background": "var(--color-header-veil)", "backdropFilter": "blur(var(--header-blur))", "borderTop": "1px solid var(--border-hairline)", "padding": "var(--space-3) var(--gutter-mobile) calc(var(--space-3) + env(safe-area-inset-bottom))", "display": "flex", "flexDirection": "column", "gap": "var(--space-2)"}}>
          <p style={{"fontFamily": "var(--font-body)", "fontSize": "var(--fs-small)", "lineHeight": "1.5", "color": "var(--text-muted)", "margin": "0px", "textAlign": "center"}}>免費 · 不需要先付款</p>
          <Ireland25Plus8Cta href="/consult" compact label="免費評估我的 25+8 出發計畫" />
        </div>
      </div>
    </div>
  </Ireland25Plus8Interactions>;
}

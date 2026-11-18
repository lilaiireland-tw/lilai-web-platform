import { ireland25Plus8Faq } from "@/content/ireland-25-plus-8-copy";

export function Ireland25Plus8Faq() {
  return <>{ireland25Plus8Faq.map((item, index) => (
    <details open={index < 2} style={{"background": "rgb(255, 255, 255)", "border": "1px solid rgb(207, 224, 211)", "borderRadius": "13px", "overflow": "hidden"}} key={item.question}>
      <summary style={{"listStyle": "none", "cursor": "pointer", "minHeight": "56px", "display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "16px", "padding": "14px 20px"}}>
        <h3 style={{"margin": "0px", "fontSize": "16px", "fontWeight": "800", "lineHeight": "1.5", "color": "rgb(11, 57, 39)"}}>{item.question}</h3>
        <span className="l-chev" style={{"flex": "0 0 auto", "display": "flex", "color": "rgb(0, 82, 48)", "transition": "transform 200ms"}}>
          <div className="sc-host-x" style={{"display": "contents"}}>
            <span aria-hidden="true" data-lucide="chevron-down" role="presentation" style={{"display": "inline-block", "width": "20px", "height": "20px", "flex": "0 0 auto", "background": "currentcolor", "maskImage": "url(\"/assets/ireland-25-plus-8/icons/chevron-down.svg\")", "maskRepeat": "no-repeat", "maskPosition": "center center", "maskSize": "contain"}}></span>
          </div>
        </span>
      </summary>
      <div style={{"padding": "0px 20px 18px", "display": "flex", "flexDirection": "column", "gap": "8px"}}>
        <p style={{"margin": "0px", "fontSize": "15.5px", "lineHeight": "1.75", "color": "rgb(63, 70, 63)"}}>{item.answer}</p>
        {item.link && (<a href={item.link.href} style={{"alignSelf": "flex-start", "display": "flex", "alignItems": "center", "minHeight": "36px", "fontSize": "14.5px", "fontWeight": "800"}}>{item.link.label}</a>)}
      </div>
    </details>
  ))}</>;
}

# Lilai design system foundation

This standardizes the existing brand, without migrating any production form or
homepage architecture. Reference: [signup repository](https://github.com/lilaiireland-tw/language-school-signup-page/tree/a7d0fbd4d74f3b0be923a1ac85c774a3328ecf88),
especially `app/globals.css`, `app/layout.tsx` and `app/page.tsx`.

`src/styles/tokens.css` is the canonical source for brand values and font faces.
Root layout loads tokens, legacy globals, then `primitives.css`. New pages opt
into `ds-*` classes; the homepage keeps its own section spacing and typography
scale. Do not add another token palette in a page or CSS Module.

## Brand colors

| Token (`--color-`) | Value | Usage |
| --- | --- | --- |
| background | #faf8ef | Page background |
| surface | #fffff6 | Cards |
| primary | #005230 | Primary actions |
| primary-dark | #0b3927 | Headings, dark buttons |
| primary-light | #eaf4ec | Tint sections, disabled fields |
| accent | #d59500 | Brand accent |
| accent-bright | #ffbe12 | Highlights |
| accent-soft | #fff2c8 | Highlight backgrounds |
| text-main | #1a1a1a | Body, top strip |
| text-muted | #5f675f | Secondary text |
| border | #cfe0d3 | Borders |
| danger | #a33b32 | Error text and borders |
| white | #fff | Inverse text, controls |
| focus | accent alias | Keyboard outline |
| section-soft | #f1f3ec | Soft sections |
| header | rgb(250 248 239 / 94%) | Existing blurred header |
| footer | #10291f | Existing footer |
| text-inverse-muted | rgb(255 255 255 / 80%) | Footer secondary text |
| border-inverse | rgb(255 255 255 / 18%) | Footer divider |

## Typography

`--font-sans` / `--font-body`: Noto Sans TC. `--font-serif` / `--font-heading`:
Noto Serif TC. Reuse existing local regular (400) and bold (700) Sans, and bold
(700) Serif files. OFL remains in `public/fonts/OFL.txt`; no new fonts are copied.
These are reference subsets, not complete CJK fonts: verify new characters;
missing glyphs fall back to the documented system fonts. Intermediate and heavy
legacy weights remain browser matched/synthesized; new code uses 400/700.

| Class | Token / size | Usage |
| --- | --- | --- |
| ds-body | text-body / 16px | Sans body, 1.75 line height |
| ds-body-large | text-body-large / 18px | Lead text |
| ds-heading-1 | text-heading-1 / 32–55px | Serif, bold, 1.25 line height |
| ds-heading-2 | text-heading-2 / 28–49px | Section heading |
| ds-heading-3 | text-heading-3 / 22–31px | Card heading |
| ds-small | text-small / 14px | Supporting text |
| ds-caption | text-caption / 12px | Caption |
| ds-eyebrow | text-caption / 12px | Sans bold, .09em tracking |

Sizes use rem/clamp and respect browser text sizing. Button line height is 1.15.
Use semantic h1/h2/h3 independently of the chosen visual class. All three heading
classes reset `margin: 0` and `max-width: none`, including when a smaller visual
class is applied to h1. Consumers set spacing/width through their layout or
page CSS; no homepage or browser-default heading margins are inherited. Existing
homepage heading sizes remain untouched; its Sans stack now prioritizes Noto
instead of Inter, and uses the same local faces as the shell.

## Spacing

`--space-1` through `--space-9`: **4, 8, 12, 16, 24, 32, 48, 64, 96px**.
Use this finite scale for new layout gaps and padding. Component dimensions
(e.g. button padding from signup) need not become separate spacing tokens.

## Radius

`--radius-small` 4px: signup card shells; `--radius-medium` 8px: controls and
submenu items; `--radius-large` 16px: floating panels; `--radius-pill` 999px:
buttons. Shell-specific 9/12/14px rounding remains to preserve PR #9 visuals.

## Shadows

| Token | Usage |
| --- | --- |
| shadow-elevated | Reference 0 22px 60px, 11% green shadow; elevated cards |
| shadow-floating | Alias of elevated; shell dropdown/menu |
| shadow-cta | Reference 0 9px 24px, 18% green shadow; primary button |
| shadow-cta-hover | Existing homepage button hover, unchanged |
| shadow-featured | Reference 12px solid primary-light offset; featured card |

## Buttons

```tsx
import { Button } from "@/components/ui/Button";

<Button type="submit" size="large">送出</Button>
<Button href="/language-school-signup/" variant="secondary">開始報名</Button>
<Button disabled fullWidth>暫時無法使用</Button>
```

Variants: primary, secondary, dark, ghost (outline). Sizes: small (44px),
default (48px), large (54px). `fullWidth`, `className`, native element props,
children and ARIA attributes are supported. Without href it renders a button
and defaults to `type="button"`. Disabled anchors remove href/onClick and leave
the tab order; disabled buttons use native disabled. Use `disabled` rather than
ARIA alone to disable an action. Event callbacks must originate in a Client
Component as usual in Next.js; static buttons can render on the server.

CSS-only equivalent: `ds-button ds-button--secondary ds-button--small`.
For a disabled raw anchor remove href/activation handlers and set role="link",
aria-disabled="true", tabindex="-1". CSS does not prevent navigation.
Hover lifts 2px; disabled controls do not move. Reduced motion removes the lift.

## Forms

Use `ds-field`, `ds-label`, `ds-input`, `ds-select`, `ds-textarea`, `ds-help`,
`ds-error` with native markup. These are text/select/textarea primitives; do not
apply ds-input to checkbox/radio controls. State, validation and submission
remain the caller's responsibility. Invalid uses a thicker border **and error
copy**, not color alone. Disabled uses native disabled and a muted tint.

```tsx
<div className="ds-field">
  <label className="ds-label" htmlFor="email">Email（必填）</label>
  <input className="ds-input" id="email" name="email" type="email" required
    aria-invalid={true} aria-describedby="email-help email-error" />
  <p className="ds-help" id="email-help">用於聯絡你。</p>
  <p className="ds-error" id="email-error">錯誤：請輸入有效的 Email。</p>
</div>
```

Each control needs a visible label and unique id. Connect help/error IDs through
aria-describedby. Announce newly displayed validation errors with a suitable
live region at the form level; the CSS foundation does not implement validation.

## Cards

`ds-card` is the default surface/padding shell, without a border or shadow.
Add one of `ds-card--bordered`, `ds-card--elevated`, `ds-card--featured`.
No business layout, click behavior or automatic heading semantics are imposed.
Keep featured cards inside a container to allow room for their offset shadow.

## Containers / Sections

```tsx
<section className="ds-section ds-section--soft" aria-labelledby="title">
  <div className="ds-container ds-container--narrow">
    <h2 id="title" className="ds-heading-2">開始規劃</h2>
    <article className="ds-card ds-card--bordered">內容</article>
  </div>
</section>
```

Container width: 1160px; narrow: 940px; total gutter: 40px desktop/tablet,
28px mobile (20px/14px per side). Section variants: default, soft, tint.
Vertical padding: 96px desktop, 78px tablet, 64px mobile, following signup's
scale while aligning its tablet transition with the accepted shell breakpoint.
Existing homepage spacing remains page-specific. Shell containers use the same
canonical width/gutter tokens, keeping their existing calculated widths.

## Responsive

| Range | Convention |
| --- | --- |
| >1100px | Desktop navigation |
| 761–1100px | Tablet, mobile navigation; reduced section padding |
| ≤760px | Mobile gutters and section padding; 26px strip/header offset |
| ≤380px | Small mobile; shell hides brand text |

CSS media queries use literal breakpoints, not unusable custom properties.
PR #9 remains at 1100/760/380; homepage retains 1120/920/720 and interactions
retain 720; signup reference uses 1000/760 plus 420/370 refinements. Do not
mass-convert existing page queries. New pages use the shell conventions above;
their grids may collapse earlier when content needs it. No JS breakpoint system.

## Accessibility

All buttons, links, summary, input/select/textarea and tabindex controls use a
3px accent outline with 4px offset on focus-visible. Outline coexists with
shadows; never remove focus without replacement. Preserve native controls,
keyboard navigation, labels and reduced motion. Check focus against each
surface and avoid clipping outlines with overflow. Shell skip link, About
focus-within submenu and mobile disclosure logic remain unchanged.

## Legacy aliases

Compatibility aliases only: ink → color-text-main; muted → color-text-muted;
green → color-primary; sage → color-primary-light; linen → color-background;
card → color-surface; line → color-border; yellow → color-accent-bright;
shadow → shadow-elevated; serif → font-serif; sans → font-sans.

`green-2` (#0f6d45), `brand` (#008c4f), `sage-2` (#dcefe5) remain homepage-only
compatibility values in the same source, not aliases to a different color.
New code must use canonical tokens. No homepage HTML or interaction code changes.

## Review

`/design-system/` is a small production-noindex review page, not navigation/SEO
content and not included in the sitemap. Check desktop and 375/768px: shell,
About submenu/mobile disclosure, button variants/states, card shells, fields,
footer, keyboard focus, overflow, console/hydration errors, layout shift and
sticky 28px desktop / 26px mobile offsets. Screenshot comparison is still
required before visual sign-off, especially Noto font matching on the homepage.

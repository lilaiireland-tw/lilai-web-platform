# Daydream Landing Page v3 parity

Scope: reproduce the supplied activity content; retain the site's existing Top
Strip, Header and Footer. The source's campaign navigation/footer and footer-only
disclaimer are intentionally outside the content comparison. Public routing,
metadata, canonical/noindex behavior and archived-event protections are retained.

Source: user-supplied `白日夢冒險王 Landing Page v3.html` (not committed).
Its decoded `__bundler/template` provides composition, and the embedded
`Lilai2027DesignSystem_b9203f` provides actual component styles. Hint dimensions
are editor placeholders, not final rendered dimensions.

## Asset provenance

- Eleven existing photos/QR files already match the bundle exactly.
- `arsha.jpg` restores the embedded original JPEG rather than the prior WebP.
- `lilai-logo.png` and four Lucide SVG masks come directly from the bundle.
- Fifty-five unmodified WOFF2 files supply the source Sans, Serif and handwritten
  faces. CSS unicode ranges are restricted to the current campaign's characters.
- Font licenses accompany the assets. LXGW attribution source:
  https://github.com/lxgw/LxgwWenkaiTC/blob/main/OFL.txt
- Existing `.jpeg` photos contain PNG data in the source as well; their original
  bytes and established public paths are preserved.
- The prior `arsha.webp` remains available at its old path for compatibility.

## Browser acceptance checks still required

No browser control surface was available during implementation. Source/SSR and
asset checks are not pixel comparisons or evidence of client interaction QA.

Compare both pages in the same browser/OS at widths 390, 759, 760, 1024 and
1440px, with the same zoom and loaded fonts. Compare the activity area independently
of the intentionally different site shell and its resulting vertical offset.

- Verify all ten sections, text wrapping, font weights, margins, background bands,
  photo crops/filtering, double-ring stamp, film captions and speaker offsets.
- At 759/760px verify the exact source breakpoint; source flex layouts may wrap
  naturally at other widths. Mobile final film image remains 3:4 and spans two columns.
- Check horizontal overflow, narrow viewports, FAQ answer lengths and the long
  topic chips; check focus-visible rings and keyboard activation.
- FAQ starts closed, shows plus/minus and permits only one open answer.
- Campaign CTAs stay in-page and land below the retained sticky site shell;
  only the registration-card CTA opens the external Google Form in a new tab.
- On mobile, bottom CTA appears after scrolling 60% of viewport height and hides
  when register or closing intersects the viewport. Verify safe-area padding.
- `?reg=embed` reproduces the source's alternate iframe mode (640px desktop,
  560px mobile). It uses the supplied URL as-is; the short Google Forms URL's
  actual embedding support must be checked. Do not submit a production form.
- Verify reduced motion, console/hydration errors, image/font network failures
  and that the shared shell still matches other pages.
- Recheck archived status: no registration link, QR, embed or sticky CTA.

## Automated checks

`scripts/check-daydream.ts` verifies metadata, section order, copy/explicit line
breaks, initially collapsed FAQ, CTA targets/analytics attributes, image dimensions
and loading, asset existence, and archived registration removal. Passing a source
HTML path also compares 72 used image/logo/icon/font assets to the original bundle.

Repository typecheck, shared-layout checks, design-system checks, production build
and whitespace checks remain required. `npm run lint` is the existing unsupported
`next lint` command and is outside this task.

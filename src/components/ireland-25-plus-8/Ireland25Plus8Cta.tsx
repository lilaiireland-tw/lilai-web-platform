import type { ComponentProps } from "react";

type Props = ComponentProps<"a"> & {
  label: string;
  variant?: "surface" | "white";
  compact?: boolean;
};

export function Ireland25Plus8Cta({ label, variant, compact = false, style, ...props }: Props) {
  return <a {...props} style={{
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "gap": "var(--space-2)",
    "minHeight": "54px",
    "padding": "0px 34px",
    "borderRadius": "var(--radius-pill)",
    "fontFamily": "var(--font-body)",
    "fontSize": "16.5px",
    "fontWeight": "var(--fw-bold)",
    "lineHeight": "1",
    "letterSpacing": "0.01em",
    "textDecoration": "none",
    "cursor": "pointer",
    "width": "auto",
    "whiteSpace": "nowrap",
    "boxSizing": "border-box",
    "transition": "background var(--motion-fast) var(--ease-standard),transform var(--motion-fast) var(--ease-standard),border-color var(--motion-fast) var(--ease-standard),color var(--motion-fast) var(--ease-standard)",
    "transform": "none",
    "opacity": "1",
    "background": "var(--cta-bg)",
    "color": "var(--cta-fg)",
    "border": "1px solid transparent",
    ...(compact ? { minHeight: "48px", padding: "0px 26px", fontSize: "15px", width: "100%" } : {}),
    ...(variant === "surface" ? { background: "var(--surface-card)", color: "var(--text-brand)", border: "1px solid var(--border-hairline)" } : {}),
    ...(variant === "white" ? { background: "var(--color-white)", color: "var(--color-green-dark)" } : {}),
    ...style,
  }}>{label}</a>;
}

import type { ComponentPropsWithoutRef } from "react";

type Options = {
  variant?: "primary" | "secondary" | "dark" | "ghost";
  size?: "small" | "default" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
};
export type ButtonProps = Options & (
  | (ComponentPropsWithoutRef<"button"> & { href?: never })
  | (ComponentPropsWithoutRef<"a"> & { href: string })
);

export function Button(props: ButtonProps) {
  const { variant = "primary", size = "default", fullWidth = false, disabled = false, className = "", ...rest } = props;
  const classes = ["ds-button", `ds-button--${variant}`, size !== "default" && `ds-button--${size}`, fullWidth && "ds-button--full", className].filter(Boolean).join(" ");
  if ("href" in rest && typeof rest.href === "string") {
    const { href, onClick, ...anchor } = rest as ComponentPropsWithoutRef<"a">;
    // No href or activation handler when disabled: keyboard and modified clicks
    // cannot navigate. Keep the link role for assistive technology.
    return <a {...anchor} className={classes} href={disabled ? undefined : href}
      onClick={disabled ? undefined : onClick} role={disabled ? "link" : anchor.role}
      aria-disabled={disabled ? true : anchor["aria-disabled"]} tabIndex={disabled ? -1 : anchor.tabIndex} />;
  }
  const button = rest as ComponentPropsWithoutRef<"button">;
  return <button {...button} type={button.type ?? "button"} className={classes} disabled={disabled} />;
}

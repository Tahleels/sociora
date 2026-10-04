import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type SharedProps = { variant?: "primary" | "secondary" | "quiet"; children: ReactNode; className?: string };
type LinkProps = SharedProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & { href: string };
type ActionProps = SharedProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & { href?: undefined };
type Props = LinkProps | ActionProps;
const styles = { primary: "bg-ink text-white hover:bg-accent", secondary: "border border-line bg-white/70 text-ink hover:border-accent hover:text-accent", quiet: "text-ink hover:bg-white" };
export function Button(props: Props) {
  const { variant = "primary", className = "", children } = props;
  const style = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none ${styles[variant]} ${className}`;
  if (props.href) {
    const { href, variant: _variant, className: _className, children: _children, ...linkProps } = props as LinkProps;
    return <Link {...linkProps} className={style} href={href}>{children}</Link>;
  }
  const { href: _href, variant: _variant, className: _className, children: _children, ...buttonProps } = props as ActionProps;
  return <button className={style} {...buttonProps}>{children}</button>;
}

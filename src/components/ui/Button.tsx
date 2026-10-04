import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { href?: string; variant?: "primary" | "secondary" | "quiet"; children: ReactNode };
const styles = { primary: "bg-ink text-white hover:bg-accent", secondary: "border border-line bg-white/70 text-ink hover:border-accent hover:text-accent", quiet: "text-ink hover:bg-white" };
export function Button({ href, variant = "primary", className = "", children, ...props }: Props) {
  const style = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 ${styles[variant]} ${className}`;
  return href ? <Link className={style} href={href}>{children}</Link> : <button className={style} {...props}>{children}</button>;
}

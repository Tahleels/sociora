import type { ButtonHTMLAttributes } from "react";
export function Chip({ selected = false, className = "", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return <button type="button" aria-pressed={selected} className={`rounded-full border px-4 py-2.5 text-sm transition ${selected ? "border-ink bg-ink text-white" : "border-line bg-white/65 text-ink hover:border-accent hover:text-accent"} ${className}`} {...props}>{children}</button>;
}

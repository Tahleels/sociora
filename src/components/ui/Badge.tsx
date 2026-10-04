import type { ReactNode } from "react";
export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" }) {
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tone === "accent" ? "bg-accent/10 text-accent" : "bg-mist text-muted"}`}>{children}</span>;
}

// OWNER: Workstream C
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sociora — ask anonymously, answered by people who've lived it",
  description: "AI routes your question to people with the right experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

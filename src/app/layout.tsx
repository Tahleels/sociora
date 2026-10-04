// OWNER: Workstream C
import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Sociora — ask anonymously, learn from lived experience",
  description: "AI routes your question to people with the right experience.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Nav />{children}<footer className="border-t border-line px-5 py-8 text-center text-xs text-muted">A quieter corner of the internet, built on lived experience.</footer></body>
    </html>
  );
}

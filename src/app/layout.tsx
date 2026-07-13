import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tulip Events",
  description: "Register for events and track attendance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900">{children}</body>
    </html>
  );
}

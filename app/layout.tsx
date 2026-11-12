import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/standard.css";
import "./globals.css";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: `${profile.name}, ${profile.role}`,
  description: profile.intro,
};

export const viewport: Viewport = { themeColor: "#F4F5F7" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

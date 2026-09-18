import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Teko } from "next/font/google";
import { PLAYER } from "@/lib/config";
import { getTrackerSnapshot } from "@/lib/tracker";
import "./globals.css";

const display = Teko({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ff4655",
  colorScheme: "dark",
};

export function generateMetadata(): Metadata {
  const data = getTrackerSnapshot();
  const description = PLAYER.about;
  const image = data.cardWide || data.avatar;
  return {
    metadataBase: new URL("https://afonsocasteloa.github.io"),
    title: {
      default: "Afonso · Fazed#any",
      template: "%s · Fazed#any",
    },
    description,
    keywords: ["Afonso", "Fazed", "Fazed#any", "Valorant", "Immortal", "Tracker", "Portugal", "Krypto Gaming"],
    authors: [{ name: "Afonso" }],
    creator: "Afonso",
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.svg" },
    manifest: "/manifest.webmanifest",
    alternates: { canonical: "/" },
    openGraph: {
      title: "Afonso · Fazed#any",
      description,
      locale: "pt_PT",
      type: "profile",
      url: "https://afonsocasteloa.github.io/",
      images: image ? [{ url: image, alt: "Afonso · Fazed#any" }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: "Afonso · Fazed#any",
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body className={`${display.variable} ${body.variable} antialiased`}>{children}</body>
    </html>
  );
}

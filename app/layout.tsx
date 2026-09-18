import type { Metadata } from "next";
import { IBM_Plex_Sans, Teko } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://afonsocasteloa.github.io"),
  title: {
    default: "Afonso · Fazed#any",
    template: "%s · Fazed#any",
  },
  description:
    "Perfil competitivo de Valorant do Afonso — Fazed#any. Carreira completa, atualizada a partir do Tracker, EP 5 até V26.",
  keywords: ["Valorant", "Fazed", "Tracker", "Ascendant", "Afonso"],
  authors: [{ name: "Afonso" }],
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Afonso · Fazed#any",
    description: "Site pessoal competitivo — carreira completa alinhada com o Tracker.",
    locale: "pt_PT",
    type: "website",
    url: "https://afonsocasteloa.github.io/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Afonso · Fazed#any",
    description: "Perfil competitivo de Valorant, sempre atualizado.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={`${display.variable} ${body.variable} antialiased`}>{children}</body>
    </html>
  );
}

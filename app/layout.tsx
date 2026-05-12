import type { Metadata, Viewport } from "next";
import { Anton, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Modern Rehab — Glasgow Chronic Pain & Injury Clinic",
  description:
    "One-on-one chronic-pain and injury rehab in Cathcart, Glasgow. Twelve years fixing the cases everyone else gave up on.",
  openGraph: {
    title: "Modern Rehab — Glasgow Chronic Pain & Injury Clinic",
    description:
      "Stop managing pain. Start fixing it. 1-on-1 hands-on treatment and strength rehab with James McCaig in Cathcart, Glasgow.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0E0E",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${geistMono.variable} ${caveat.variable}`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f%5B%5D=switzer@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

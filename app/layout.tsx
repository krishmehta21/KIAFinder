import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "KIA Bus Finder — Bangalore Airport Bus (Vayu Vajra) Locator",
  description: "Locate your nearest BMTC Vayu Vajra airport bus stops, live schedules, and routes in Bangalore instantly.",
  metadataBase: new URL("https://kia-finder.vercel.app"),
  openGraph: {
    title: "KIA Bus Finder — Bangalore Airport Bus Locator",
    description: "Locate your nearest BMTC Vayu Vajra bus stops, route schedules, and map directions in Bangalore instantly.",
    url: "https://kia-finder.vercel.app",
    siteName: "KIA Bus Finder",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KIA Bus Finder — Bangalore Airport Bus Locator",
    description: "Locate your nearest BMTC Vayu Vajra bus stops, route schedules, and map directions in Bangalore instantly.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Crimson_Text, Tiro_Devanagari_Sanskrit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson-text",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const tiroDevanagariSanskrit = Tiro_Devanagari_Sanskrit({
  variable: "--font-tiro-devanagari-sanskrit",
  subsets: ["devanagari", "latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Bhagavad Gita Guide",
  description:
    "Learn the Bhagavad Gita one verse at a time with AI guidance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${crimsonText.variable} ${tiroDevanagariSanskrit.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

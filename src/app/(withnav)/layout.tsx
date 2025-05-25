import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "PitchPal - AI Avatar Presentations",
  description: "Create stunning AI avatar presentations from your PowerPoint files",
  icons: {
    icon: '/temus-logo.svg',
    shortcut: '/temus-logo.svg',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
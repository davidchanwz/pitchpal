import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import 'primereact/resources/themes/viva-light/theme.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';

const inter = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Temus Avatar",
  description: "Temus Avatar",
  icons: {
    icon: '/temus-logo.svg',
    shortcut: '/temus-logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        <main className="h-screen w-full flex flex-column">
          {children}
        </main>
      </body>
    </html>
  );
}

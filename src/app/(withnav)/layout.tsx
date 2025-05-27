import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import FloatingNavbar from "@/components/FloatingNavbar";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth');
  }  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <FloatingNavbar userName={session?.user?.email || "Guest"} />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
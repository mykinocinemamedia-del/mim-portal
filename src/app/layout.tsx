import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AiChatbot } from "@/components/shared/ai-chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIM Portal - Maid In Malaysia | Kino Studios",
  description: "Platform perkhidmatan pembantu rumah Malaysia oleh Kino Studios Sdn. Bhd. Daftar sebagai pembantu atau majikan, temui padanan yang sesuai, dan uruskan kontrak secara pusat.",
  keywords: ["Maid In Malaysia", "MIM Portal", "pembantu rumah", "pengasuh", "penjaga orang tua", "Kino Studios", "KinoCinema Media"],
  authors: [{ name: "Kino Studios Sdn. Bhd." }],
  openGraph: {
    title: "MIM Portal - Maid In Malaysia",
    description: "Platform perkhidmatan pembantu rumah Malaysia",
    siteName: "MIM Portal",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <AiChatbot />
      </body>
    </html>
  );
}

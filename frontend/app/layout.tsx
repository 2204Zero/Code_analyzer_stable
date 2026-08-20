import "./globals.css";
import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Atmosphere } from "@/components/ui/Atmosphere";

const inter = Inter({ subsets: ['latin'] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vertex.AI",
  description: "Enterprise-Grade Multi-Agent Code Analysis & 3D Architecture Mapping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className={cn(inter.className, "min-h-screen bg-[#09090B] text-zinc-300 relative")}>
        <Atmosphere />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}

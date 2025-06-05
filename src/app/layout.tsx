"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/myConponents/sidebar";
import { firmContext } from "@/components/EntrepriseContext";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PLAMA - Gestion de Projets",
  keywords: ["gestion de projets", "PLAMA", "projets", "management"],
  authors: [{ name: "Abdoul Rahim" }],
  creator: "Abdoul Rahim",
  description: "PLAMA est une application de gestion de projets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [firmID, setFirmID] = useState(1);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      ><firmContext.Provider value={{ firmID, setFirmID }}>
        <Sidebar/>
        {children}
      </firmContext.Provider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nexus Video Pro - AI Video Studio & NLE',
  description: 'Production-grade non-linear video editing (NLE) with Generative AI synthesis hub',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#07080C] text-[#F3F4F6] min-h-screen antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}

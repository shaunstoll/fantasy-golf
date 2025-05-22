import type { Metadata } from "next";
import { Baloo_2 as Font } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/header";

const font = Font({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Fantasy Golf",
  description: "The Frankel Fantasy Golf League",
  icons: {
    icon: [
      {
        url: "/favicons/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/favicons/favicon-1024x1024.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
    apple: [
      {
        rel: "apple-touch-icon",
        url: "/favicons/favicon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.variable} antialiased overflow-hidden`}>
        <TRPCReactProvider>
          <div className="bg-gray-200 dark:bg-gray-900 text-black dark:text-white">
            <div className="max-w-screen-sm mx-auto h-dvh flex flex-col gap-1 p-1">
              <Header />
              {children}
            </div>
          </div>
        </TRPCReactProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

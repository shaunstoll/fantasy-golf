import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Baloo_2 as Font } from "next/font/google";

import "@/app/globals.css";
import Header from "@/components/header";
import { TRPCReactProvider } from "@/trpc/react";

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
      <body
        className={`
          ${font.variable}
          overflow-hidden antialiased
        `}
      >
        <TRPCReactProvider>
          <div
            className={`
              bg-gray-200 text-black
              dark:bg-gray-900 dark:text-white
            `}
          >
            <div
              className={`mx-auto flex h-dvh max-w-screen-sm flex-col gap-1 p-1`}
            >
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

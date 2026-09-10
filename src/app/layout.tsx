import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { LenisProvider } from "@/components/LenisProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "RYDEX — Book a ride in seconds",
  description: "Real-time vehicle booking platform",

  openGraph: {
    title: "RYDEX",
    description:
      "Book any vehicle — bikes to trucks. Real-time tracking, transparent pricing.",
    url: "https://rydex-eo9t.onrender.com/",
    type: "website",
    siteName: "RideFlow",

    images: [
      {
        url: "https://rydex-eo9t.onrender.com/rydex.png",
        width: 1200,
        height: 630,
        alt: "RideFlow - Vehicle Booking Platform",
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white dark:bg-neutral-950 text-black dark:text-white transition-colors">
        <Providers>
          <LenisProvider>{children}</LenisProvider>
        </Providers>

        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: { fontFamily: "inherit" },
          }}
        />
      </body>
    </html>
  );
}

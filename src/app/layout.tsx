import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { LenisProvider } from "@/components/LenisProvider";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
export const metadata: Metadata = {
  title: "RideFlow — Book a Ride in Seconds",
  description: "Real-time vehicle booking platform",

  openGraph: {
    title: "RideFlow — Book a Ride in Seconds",
    description: "Real-time vehicle booking platform",
    url: "https://rydex-eo9t.onrender.com/",
    siteName: "RideFlow",
    type: "website",
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
    <html
      lang="en"
      className="h-full antialiased"
    >
<body className="min-h-full flex flex-col bg-white dark:bg-neutral-950 text-black dark:text-white transition-colors">
        <ThemeProvider>
          <Providers>
            <LenisProvider>{children}</LenisProvider>
          </Providers>
        </ThemeProvider>
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

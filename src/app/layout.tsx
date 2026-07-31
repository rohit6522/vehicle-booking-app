import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { LenisProvider } from "@/components/LenisProvider";
export const metadata: Metadata = {
  title: "RideFlow — Book a ride in seconds",
  description: "Real-time vehicle booking platform",
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
      <body className="min-h-full flex flex-col">
        <Providers>
          <LenisProvider>{children}</LenisProvider>
        </Providers>
      </body>
    </html>
  );
}

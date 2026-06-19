import type { Metadata } from "next";
import { Open_Sans, Rock_Salt, Orbitron } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const rockSalt = Rock_Salt({
  weight: "400",
  variable: "--font-rock-salt",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "tattty - Image Generator",
  description: "Generate amazing images with tattty (Flux). A powerful AI image generation tool powered by tattty.",
  keywords: ["AI", "Image Generator", "Flux", "editor", "tattty", "Art"],
  authors: [{ name: "tattty Team" }],
  openGraph: {
    title: "tattty - Image Generator",
    description: "Generate amazing images with tattty AI (Flux)",
    siteName: "tattty AI",
    images: [
      {
        url: "/gokanix1200x630.png",
        width: 1200,
        height: 630,
        alt: "tattty Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "tattty - Image Generator",
    description: "Generate amazing images with tattty AI (Flux)",
    images: ["/gokanix1200x630.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${openSans.variable} ${rockSalt.variable} ${orbitron.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

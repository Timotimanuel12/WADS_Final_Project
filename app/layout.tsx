import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"
import ThemeProvider from "@/components/ThemeProvider"; 
import RouteLoadingOverlay from "@/components/RouteLoadingOverlay";
import { AudioProvider } from "@/components/AudioProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HelpImTooLazy",
  description: "AI-optimized task management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <body className={`${inter.className} transition-colors duration-300`}>
        <AudioProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <RouteLoadingOverlay />
            {children}
          </ThemeProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"
import ThemeProvider from "@/components/ThemeProvider"; 
import RouteLoadingOverlay from "@/components/RouteLoadingOverlay";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <RouteLoadingOverlay />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
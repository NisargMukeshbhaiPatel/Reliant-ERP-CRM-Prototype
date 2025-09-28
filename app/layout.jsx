import "@/ui/globals.css";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/ui/theme-provider";
import { Toaster } from "@/ui/components/toaster";

const inter = Inter({ subsets: ["latin"], display: "auto" });
export default async function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"//support light only for now
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>

        <Toaster />
      </body>
    </html>
  );
}


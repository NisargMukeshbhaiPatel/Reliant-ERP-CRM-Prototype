import "@/ui/globals.css";
import { Figtree } from "next/font/google"

import { Toaster } from "@/ui/components/toaster"

const figtree = Figtree({ subsets: ["latin"], display: "auto" })

export default async function RootLayout({ children }) {
  return (
    <html lang="en" className={figtree.className} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html >
  );
}


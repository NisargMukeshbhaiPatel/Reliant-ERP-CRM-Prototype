import Link from "next/link";
import { Button } from "@/components/button";
import { ArrowLeft } from "lucide-react";

export default async function RootLayout({ children }) {
  return (
    <main className="relative">
      <div className="absolute left-4 top-4 z-10">
        <Link href="/">
          <Button variant="default" size="lg">
            <ArrowLeft className="h-5 w-5" />
            Go Back to Products
          </Button>
        </Link>
      </div>
      {children}
    </main>
  );
}

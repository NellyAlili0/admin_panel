import type { Metadata } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
export const metadata: Metadata = {
  title: "Zidallie Admin",
  description: "Zidallie Admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased relative">
        <NextTopLoader color="yellow" height={3} />
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  );
}

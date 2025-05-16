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
        <div className="absolute top-0 right-0 p-2 text-white bg-red-500">
          Debug Environment
        </div>
        <NextTopLoader color="yellow" height={3} />
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  );
}

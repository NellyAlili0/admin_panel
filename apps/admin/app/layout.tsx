import type { Metadata } from "next";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
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
      <body className="antialiased">
        <NextTopLoader color="yellow" height={3} />
        {children}
      </body>
    </html>
  );
}

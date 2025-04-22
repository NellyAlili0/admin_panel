import type { Metadata } from "next";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';


export const metadata: Metadata = {
  title: "Zidallie - Admin Panel",
  description: "Zidallie - Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <NextTopLoader color="#fcba03" />
        {children}
      </body>
    </html>
  );
}

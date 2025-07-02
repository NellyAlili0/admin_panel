import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zidallie Booking",
  description: "Zidallie Booking Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

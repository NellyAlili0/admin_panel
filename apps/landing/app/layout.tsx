
import Navbar from "@/components/widgets/common/Navbar";
import "./globals.css";
import ScrollUp from "@/components/widgets/common/ScrollUp";
import ScrollToHashElement from "@/components/widgets/common/ScrollToHashElement";
import Footer from "@/components/widgets/common/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Zidallie - School Transportation</title>
        <meta
          name="description"
          content="Zidallie offers safe and reliable transport services for schools and parents. We also organize school trips and tours. Discover our services today!"
        />
        <meta
          name="keywords"
          content="Zidallie, transport services, school transport, parents transport, school trips, school tours"
        />
        {/* <link rel="shortcut icon" href="/assets/Home/logo.png" type="image/x-icon" /> */}
      </head>
      <body
        className={`antialiased max-w-screen overflow-x-hidden`}
      >
        <Navbar />
        {children}
        <ScrollUp />
        <ScrollToHashElement />
        <Footer />
      </body>
    </html>
  );
}

import Footer from "@/public/components/footer";
import Header from "@/public/components/header";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "onc-limb",
  description: "onc-limb home page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <Head>
        <title>ONC-LIMB</title>
        <meta name="onc-limb" content="onc-limbのホームページ" />
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <body className={inter.className}>
      <Header/>
        {children}
      <Footer/>

        </body>
    </html>
  );
}

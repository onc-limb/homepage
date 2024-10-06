import Footer from '@/components/footer';
import Header from '@/components/header';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
    title: 'onc-limb',
    description: 'onc-limb home page',
    icons: {
        icon: '/favicon.ico'
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased flex flex-col h-screen',
                    inter.variable,
                )}
            >
                    <Header />
                    {children}
                    <Footer />
            </body>
        </html>
    );
}

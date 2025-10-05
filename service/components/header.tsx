'use client';
import Link from 'next/link';
import Logo from '@/public/MainLogo.jpg';
import Image from 'next/image';
import HeaderButton from '@/components/HeaderButton';
import { Menu } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
const MAIN_TITLE = 'onclimb';
const Header = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;
                // On mobile (screen width < 768px), hide/show header based on scroll direction
                if (window.innerWidth < 768) {
                    if (currentScrollY > lastScrollY && currentScrollY > 50) {
                        // Scrolling down - hide header
                        setIsVisible(false);
                    } else {
                        // Scrolling up - show header
                        setIsVisible(true);
                    }
                } else {
                    // On desktop, always show header
                    setIsVisible(true);
                }
                setLastScrollY(currentScrollY);
            }
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar);
            // Cleanup function
            return () => {
                window.removeEventListener('scroll', controlNavbar);
            };
        }
    }, [lastScrollY]);
    return (
        <header className={`sticky top-0 z-50 w-full transition-transform duration-300 ${
            isVisible ? 'translate-y-0' : 'md:translate-y-0 -translate-y-full'
        }`}>
            <div className="flex items-center justify-between bg-neutral-800 shadow-lg">
                <Link
                    href="/"
                    className="flex items-center gap-3 mx-4 sm:mx-8 my-3 px-4 py-2 bg-neutral-200 rounded-lg shadow-[4px_4px_8px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.4),inset_-2px_-2px_4px_rgba(0,0,0,0.15)] transition-all duration-300"
                >
                    <Image
                        src={Logo}
                        alt="onclimb logo"
                        width={40}
                        height={40}
                        style={{ objectFit: 'cover' }}
                        className="rounded-md shadow-sm"
                    />
                    <h1 className="text-neutral-900 font-bold text-xl sm:text-2xl tracking-wide">
                        {MAIN_TITLE}
                    </h1>
                </Link>
                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-4 mx-8">
                    <HeaderButton href="/knowledges">ナレッジベース</HeaderButton>
                    <HeaderButton href="/articles">記事一覧</HeaderButton>
                    <HeaderButton href="/profile">プロフィール</HeaderButton>
                </div>
                {/* Mobile Navigation - Hamburger Menu */}
                <div className="md:hidden mx-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">メニューを開く</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link href="/knowledges" className="w-full cursor-pointer">
                                    ナレッジベース
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/articles" className="w-full cursor-pointer">
                                    記事一覧
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/profile" className="w-full cursor-pointer">
                                    プロフィール
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};
export default Header;

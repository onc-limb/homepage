'use client';
import Link from 'next/link';
import Logo from '@/public/MainLogo.jpg';
import Image from 'next/image';
import HeaderButton from './HeaderButton';
import { Menu } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { NAV_ITEMS } from '@/lib/constants';
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
        <header className={`sticky top-0 z-50 w-full transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'md:translate-y-0 -translate-y-full'
            }`}>
            <div className="flex items-center justify-between bg-background/95 backdrop-blur-sm border-b border-border/50">
                <Link
                    href="/"
                    className="flex items-center gap-3 mx-4 sm:mx-8 my-4 group"
                >
                    <Image
                        src={Logo}
                        alt="onclimb logo"
                        width={36}
                        height={36}
                        style={{ objectFit: 'cover' }}
                        className="rounded-sm opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <h1 className="text-foreground font-medium text-lg sm:text-xl tracking-wide-elegant">
                        {MAIN_TITLE}
                    </h1>
                </Link>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1 mx-8">
                    {NAV_ITEMS.map((item) => (
                        <HeaderButton key={item.href} href={item.href}>
                            {item.label}
                        </HeaderButton>
                    ))}
                </div>
                {/* Mobile Navigation - Hamburger Menu */}
                <div className="md:hidden mx-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">メニューを開く</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                            {NAV_ITEMS.map((item) => (
                                <DropdownMenuItem key={item.href} asChild>
                                    <Link href={item.href} className="w-full cursor-pointer text-foreground">
                                        {item.label}
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};
export default Header;

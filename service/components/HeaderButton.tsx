import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ReactNode } from 'react';
type Props = {
    href: string;
    children: ReactNode;
};
const HeaderButton = ({ href, children }: Props) => {
    return (
        <Link href={href}>
            <Button 
                variant="ghost" 
                className="px-4 py-2 text-muted-foreground text-sm tracking-elegant hover:text-foreground hover:bg-transparent transition-colors duration-200"
            >
                {children}
            </Button>
        </Link>
    );
};
export default HeaderButton;

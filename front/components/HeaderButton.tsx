import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ReactNode } from 'react';

type Props = {
    href: string;
    children: ReactNode;
};

const HeaderButton = ({ href, children }: Props) => {
    return (
        <Button variant="ghost" className="p-6 text-white text-base">
            <Link href={href}>{children}</Link>
        </Button>
    );
};

export default HeaderButton;

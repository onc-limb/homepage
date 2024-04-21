import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ReactNode } from 'react';

type Props = {
    href: string;
    children: ReactNode;
};

const HeaderButton = ({ href, children }: Props) => {
    return (
        <Button className="p-8">
            <Link href={href}>{children}</Link>
        </Button>
    );
};

export default HeaderButton;

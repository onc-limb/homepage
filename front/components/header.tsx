import Link from 'next/link';
import Logo from '@/app/favicon.ico';
import Image from 'next/image';

const Header = () => {
    return (
        <header>
            <div className="flex item-center space-x-8">
                <Link href="/" className="flex item-center space-x-2">
                    <Image src={Logo} alt="メインロゴ" width={120} height={120} />
                    <p className="text-2xl">onc-limb</p>
                </Link>
                <Link href="/portfolio">ポートフォリオ</Link>
                <Link href="/blog">ブログ</Link>
                <Link href="profile">プロフィール</Link>
            </div>
        </header>
    );
};
export default Header;

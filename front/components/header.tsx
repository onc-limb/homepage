import Link from 'next/link';
import Logo from '@/public/MainLogo.jpg';
import Image from 'next/image';
import HeaderButton from '@/components/HeaderButton';

const Header = () => {
    return (
        <header>
            <div className="flex items-center justify-between mb-2 bg-neutral-700">
                <Link href="/" className="mx-8 my-2">
                    <Image src={Logo} alt="メインロゴ" width={100} objectFit="contain" />
                </Link>
                <div className="space-x-4 mx-8">
                    <HeaderButton href="/">トップ</HeaderButton>
                    <HeaderButton href="/portfolio">ポートフォリオ</HeaderButton>
                    <HeaderButton href="/blog">ブログ</HeaderButton>
                    <HeaderButton href="/profile">プロフィール</HeaderButton>
                </div>
            </div>
        </header>
    );
};
export default Header;

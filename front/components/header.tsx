import Link from 'next/link';
import Logo from '@/public/MainLogo.jpg';
import Image from 'next/image';
import HeaderButton from '@/components/HeaderButton';

const MAIN_TITLE = 'onc-limb';

const Header = () => {
    return (
        <header>
            <div className="flex items-center justify-between bg-neutral-700">
                <Link
                    href="/"
                    className="flex flex space-x-4 mx-8 my-2 bg-neutral-900 rounded-full border-neutral-400 border-4 p-3"
                >
                    <Image
                        src={Logo}
                        alt="メインロゴ"
                        width={50}
                        style={{objectFit:"contain"}}
                        className="ml-4"
                    />
                    <h1 className="flex items-center uppercase text-white font-serif text-4xl italic">
                        {MAIN_TITLE}
                    </h1>
                </Link>
                <div className="space-x-4 mx-8">
                    <HeaderButton href="/">トップ</HeaderButton>
                    <HeaderButton href="/article">記事</HeaderButton>
                    <HeaderButton href="/portfolio">ポートフォリオ</HeaderButton>
                    <HeaderButton href="/profile">プロフィール</HeaderButton>
                </div>
            </div>
        </header>
    );
};
export default Header;

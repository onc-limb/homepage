import Link from "next/link";
import Logo from "../../app/favicon.ico"
import Image from "next/image";


const Header = () => {
    return (
         <header>
            <Link href="/">
                <Image src={Logo} alt="メインロゴ" width={60} height={60} />
                <p>onc-limb</p>
            </Link>
            <Link href="/portfolio">ポートフォリオ</Link>
            <Link href="/blog">ブログ</Link>
            <Link href="profile">プロフィール</Link>
        </header>
    )
}
export default Header;
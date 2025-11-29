import { Github, Twitter, BookOpen, Linkedin } from 'lucide-react';
import Link from 'next/link';
interface SocialLink {
    name: string;
    url: string;
    icon: React.ReactNode;
    description: string;
    username?: string;
}
const socialLinks: SocialLink[] = [
    {
        name: 'GitHub',
        url: 'https://github.com/onc-limb',
        icon: <Github className="w-6 h-6" />,
        description: 'ソースコード、OSS活動',
        username: '@onc-limb',
    },
    {
        name: 'Zenn',
        url: 'https://zenn.dev/onclimb',
        icon: <BookOpen className="w-6 h-6" />,
        description: '技術記事の執筆',
        username: '@onclimb',
    },
    {
        name: 'X (Twitter)',
        url: 'https://twitter.com/onc_limb',
        icon: <Twitter className="w-6 h-6" />,
        description: '日々の発信、技術トピック',
        username: '@onc_limb',
    },
];
export default function SocialPage() {
    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="w-full py-16 md:py-24">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">
                            Connect
                        </span>
                        <h1 className="text-4xl font-light tracking-wide-elegant sm:text-5xl text-foreground">
                            Social
                        </h1>
                        <div className="w-16 h-px bg-border/70 my-4" />
                        <p className="max-w-[600px] text-muted-foreground text-base md:text-lg font-light tracking-elegant">
                            各プラットフォームでの活動
                        </p>
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-border/30" />
            {/* Social Links Section */}
            <section className="w-full py-16 md:py-20">
                <div className="container px-4 md:px-6 mx-auto max-w-3xl">
                    <div className="flex flex-col space-y-6">
                        {socialLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <div className="flex items-center gap-6 p-6 border border-border/50 bg-card/30 hover:bg-card/50 hover:border-border transition-all duration-200">
                                    <div className="flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
                                        {link.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-lg font-medium text-foreground tracking-elegant">
                                                {link.name}
                                            </h2>
                                            {link.username && (
                                                <span className="text-sm text-muted-foreground">
                                                    {link.username}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1 tracking-elegant">
                                            {link.description}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
                                        <span className="text-sm">→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}

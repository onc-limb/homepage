import { BookOpen } from 'lucide-react';
import Link from 'next/link';
// GitHub アイコンのカスタムコンポーネント（lucide-react の Github は非推奨のため）
function GitHubIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
    );
}
// X アイコンのカスタムコンポーネント（lucide-react の Twitter は非推奨のため）
function XIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}
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
        icon: <GitHubIcon className="w-6 h-6" />,
        description: 'ソースコード',
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
        icon: <XIcon className="w-6 h-6" />,
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
                        <span className="text-xs tracking-wide-elegant text-turquoise-600 uppercase">
                            Connect
                        </span>
                        <h1 className="text-4xl font-light tracking-wide-elegant sm:text-5xl text-foreground">
                            Social
                        </h1>
                        <div className="w-16 h-px bg-turquoise-400/60 my-4" />
                        <p className="max-w-[600px] text-muted-foreground text-base md:text-lg font-light tracking-elegant">
                            各プラットフォームでの活動
                        </p>
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-turquoise-200/50" />
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
                                <div className="flex items-center gap-6 p-6 border border-turquoise-200/60 bg-white/70 hover:bg-turquoise-50/50 hover:border-turquoise-300/80 rounded-lg shadow-card hover:shadow-soft transition-all duration-200">
                                    <div className="flex-shrink-0 text-turquoise-500 group-hover:text-turquoise-600 transition-colors">
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

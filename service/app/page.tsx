import Link from 'next/link';
import { Code, Server, Cloud, ArrowRight } from 'lucide-react';
const highlights = [
    {
        icon: <Code className="w-5 h-5" />,
        title: 'Frontend',
        description: 'React / Next.js / TypeScript',
    },
    {
        icon: <Server className="w-5 h-5" />,
        title: 'Backend',
        description: 'Python / Node.js / REST API',
    },
    {
        icon: <Cloud className="w-5 h-5" />,
        title: 'Infrastructure',
        description: 'AWS / Cloudflare / Docker',
    },
];
const navItems = [
    {
        href: '/profile',
        label: 'Profile',
        description: '経歴・価値観',
    },
    {
        href: '/skills',
        label: 'Skills',
        description: '技術スタック',
    },
    {
        href: '/portfolio',
        label: 'Portfolio',
        description: '制作実績',
    },
    {
        href: '/news',
        label: 'News',
        description: '技術ニュース',
    },
    {
        href: '/social',
        label: 'Social',
        description: '各種リンク',
    },
];
export default function Top() {
    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="w-full py-20 md:py-28 lg:py-36">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-8 text-center">
                        <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">
                            Fullstack Engineer
                        </span>
                        <h1 className="text-5xl font-light tracking-wide-elegant sm:text-6xl xl:text-7xl text-foreground">
                            onclimb
                        </h1>
                        <div className="w-16 h-px bg-border/70 my-4" />
                        <p className="max-w-[700px] text-muted-foreground text-lg md:text-xl font-light tracking-elegant leading-relaxed">
                            フロントエンドからバックエンド、インフラまで
                            <br className="hidden sm:block" />
                            一貫した開発でプロダクトを形にします
                        </p>
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-border/30" />
            {/* Skills Highlight Section */}
            <section className="w-full py-16 md:py-20 bg-card/30">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
                        {highlights.map((item) => (
                            <div
                                key={item.title}
                                className="flex flex-col items-center text-center space-y-3"
                            >
                                <div className="text-muted-foreground">{item.icon}</div>
                                <h3 className="text-lg font-medium text-foreground tracking-elegant">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground tracking-elegant">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center mt-10">
                        <Link
                            href="/skills"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground tracking-elegant transition-colors"
                        >
                            View all skills
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-border/30" />
            {/* Navigation Section */}
            <section className="w-full py-16 md:py-20">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center mb-12">
                        <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">
                            Explore
                        </span>
                        <h2 className="text-3xl font-light tracking-elegant sm:text-4xl text-foreground">
                            Contents
                        </h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="group p-6 border border-border/50 bg-card/30 hover:bg-card/50 hover:border-border transition-all duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-foreground tracking-elegant mb-1">
                                            {item.label}
                                        </h3>
                                        <p className="text-sm text-muted-foreground tracking-elegant">
                                            {item.description}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-border/30" />
            {/* News Section */}
            <section className="w-full py-16 md:py-20 bg-card/30">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-6 text-center">
                        <span className="text-xs tracking-wide-elegant text-muted-foreground uppercase">
                            Daily Updates
                        </span>
                        <h2 className="text-3xl font-light tracking-elegant sm:text-4xl text-foreground">
                            技術ニュース
                        </h2>
                        <p className="max-w-[600px] text-muted-foreground text-sm md:text-base font-light tracking-elegant">
                            毎日自動収集される技術ニュースのAI要約
                        </p>
                        <Link
                            className="mt-4 inline-flex h-11 items-center justify-center border border-border/50 bg-transparent px-8 text-sm text-foreground tracking-elegant hover:bg-accent hover:border-border transition-all duration-200"
                            href="/news"
                        >
                            View News →
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

import Link from "next/link"
import { Server, Layers, Wrench, ArrowRight } from "lucide-react"
import {
    GeometricBackground,
    HeroContent,
    AnimatedSkillCard,
    AnimatedNavCard,
    FadeInSection,
} from "@/components/animations"
import { NAV_ITEMS } from "@/lib/constants"
const highlights = [
    {
        icon: <Server className="w-5 h-5" />,
        title: "Backend",
        description: "TypeScript / NestJS / REST API / GraphQL / PostgreSQL / Python",
    },
    {
        icon: <Layers className="w-5 h-5" />,
        title: "Architecture",
        description: "Clean Architecture / DDD / Microservices",
    },
    {
        icon: <Wrench className="w-5 h-5" />,
        title: "Frontend & Infra",
        description: "React / Next.js / AWS / Docker",
    },
]
export default function Top() {
    return (
        <main className="flex-1">
            {/* Hero Section */}
            <section className="relative w-full py-20 md:py-28 lg:py-36 overflow-hidden">
                {/* 幾何学背景アニメーション */}
                <GeometricBackground />
                <div className="container px-4 md:px-6 mx-auto relative z-10">
                    <HeroContent
                        subtitle="Fullstack Engineer / Architect"
                        title="onclimb"
                        description={
                            <>
                                フロントエンドからバックエンド、インフラまで
                                <br className="hidden sm:block" />
                                一貫した開発でプロダクトを形にします
                            </>
                        }
                    />
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-turquoise-200/50" />
            {/* Skills Highlight Section */}
            <section className="w-full py-16 md:py-20 bg-gradient-to-b from-turquoise-50/30 to-background">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
                        {highlights.map((item, index) => (
                            <AnimatedSkillCard
                                key={item.title}
                                icon={item.icon}
                                title={item.title}
                                description={item.description}
                                index={index}
                            />
                        ))}
                    </div>
                    <FadeInSection className="flex justify-center mt-10" delay={0.3}>
                        <Link
                            href="/skills"
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground tracking-elegant transition-colors"
                        >
                            View all skills
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </FadeInSection>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-turquoise-200/50" />
            {/* Navigation Section */}
            <section className="w-full py-16 md:py-20">
                <div className="container px-4 md:px-6 mx-auto">
                    <FadeInSection className="flex flex-col items-center justify-center space-y-6 text-center mb-12">
                        <span className="text-xs tracking-wide-elegant text-turquoise-600 uppercase">
                            Explore
                        </span>
                        <h2 className="text-3xl font-light tracking-elegant sm:text-4xl text-foreground">
                            Contents
                        </h2>
                    </FadeInSection>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                        {NAV_ITEMS.map((item, index) => (
                            <AnimatedNavCard key={item.href} item={item} index={index} />
                        ))}
                    </div>
                </div>
            </section>
            {/* Divider */}
            <div className="w-full border-t border-turquoise-200/50" />
            {/* News Section */}
            <section className="w-full py-16 md:py-20 bg-gradient-to-b from-turquoise-50/30 to-background">
                <div className="container px-4 md:px-6 mx-auto">
                    <FadeInSection className="flex flex-col items-center justify-center space-y-6 text-center">
                        <span className="text-xs tracking-wide-elegant text-turquoise-600 uppercase">
                            Daily Updates
                        </span>
                        <h2 className="text-3xl font-light tracking-elegant sm:text-4xl text-foreground">
                            技術ニュース
                        </h2>
                        <p className="max-w-[600px] text-muted-foreground text-sm md:text-base font-light tracking-elegant">
                            毎日自動収集される技術ニュースのAI要約
                        </p>
                        <Link
                            className="mt-4 inline-flex h-11 items-center justify-center bg-turquoise-500 hover:bg-turquoise-600 px-8 text-sm text-white tracking-elegant rounded-md transition-all duration-200 shadow-soft"
                            href="/news"
                        >
                            View News →
                        </Link>
                    </FadeInSection>
                </div>
            </section>
        </main>
    )
}

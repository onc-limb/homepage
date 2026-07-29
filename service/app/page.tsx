import Link from "next/link"
import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/constants"
import { getHomeStats } from "@/lib/stats"
import {
    FloatingShapes,
    HeroParticleTitle,
    HeroSpotlight,
    Reveal,
} from "@/components/animations"

const githubLink = SOCIAL_LINKS.find((s) => s.name === "GitHub")
if (!githubLink) {
    throw new Error("SOCIAL_LINKS must include a GitHub entry")
}
const GITHUB_URL = githubLink.url

const CAPS = [
    {
        num: "/01",
        title: "Backend / Software Architecture",
        desc: "「作ると決まったもの」を、特定の誰かに依存せず誰でもメンテ・拡張できる形で実装する。ドメインモデリングを起点に、クリーンアーキテクチャと設計原則でスケールしても品質が落ちない構造を組む。",
        chips: ["TypeScript", "Go", "NestJS", "GraphQL", "PostgreSQL"],
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
            >
                <rect x="3" y="4" width="18" height="6" rx="1" />
                <rect x="3" y="14" width="18" height="6" rx="1" />
                <circle cx="7" cy="7" r="0.8" fill="currentColor" />
                <circle cx="7" cy="17" r="0.8" fill="currentColor" />
            </svg>
        ),
    },
    {
        num: "/02",
        title: "Frontend & UX",
        desc: "React / Next.js で、デザインの意図を汲んだUIを実装。技術は課題解決の手段——アクセシビリティとパフォーマンスを両立させ、ユーザーに価値が届く形にする。",
        chips: ["React", "Next.js", "Tailwind", "SwiftUI"],
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
            >
                <path d="M2 12l10-7 10 7-10 7z" />
                <path d="M2 17l10 7 10-7" />
            </svg>
        ),
    },
    {
        num: "/03",
        title: "Infra / DevOps",
        desc: "AWS Solutions Architect 保有。CI/CD・IaC・コンテナ運用で開発基盤を整え、開発者体験を高める。「なぜその挙動か」を一次情報から確かめ、根拠のある技術選定を行う。",
        chips: ["AWS", "Terraform", "Docker", "GitHub Actions"],
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
            >
                <path d="M5 12h14M5 6h14M5 18h14" />
                <circle cx="9" cy="6" r="1.5" fill="currentColor" />
                <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                <circle cx="9" cy="18" r="1.5" fill="currentColor" />
            </svg>
        ),
    },
]

// Explore は「深掘りする読み物を選ぶ」セクションなので、Home と、
// 場所ではなく行動導線である Contact を除く（Contact はヒーローと CTA バンドで拾う）。
const EXPLORE_ITEMS = NAV_ITEMS.filter(
    (n) => n.href !== "/" && n.href !== "/contact"
)

// STATS はリクエスト毎に DB 集計するため、ページを動的レンダリングにする（#127）。
// /studio で本を読了にしたり記事を公開すると、再デプロイなしで次回アクセスに反映される。
export const dynamic = "force-dynamic"

export default async function TopPage() {
    // トップ STATS 4 枠を、私的指標（書籍予算・curiosity）から
    // DB 裏付けの実績指標に刷新する（#127）。
    const { readBooksCount, publishedArticlesCount, usedTagCount, totalBooksCount } =
        await getHomeStats()
    const stats = [
        { value: String(readBooksCount), sup: "", label: "books read" },
        { value: String(publishedArticlesCount), sup: "", label: "articles published" },
        { value: String(usedTagCount), sup: "", label: "topics covered" },
        { value: String(totalBooksCount), sup: "", label: "books logged" },
    ]

    return (
        <main className="page flex-1">
            {/* HERO */}
            <section className="relative grid min-h-screen place-items-center overflow-hidden px-0 pb-20 pt-[120px]">
                <HeroSpotlight />
                <FloatingShapes />

                <div className="relative z-[2] mx-auto max-w-[980px] px-6 text-center">
                    <Reveal as="div">
                        <span
                            className="pulse-dot mb-8 inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-surface-solid px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted"
                        >
                            <span
                                aria-hidden="true"
                                className="block h-[7px] w-[7px] rounded-full"
                                style={{
                                    background: "var(--accent)",
                                    boxShadow:
                                        "0 0 0 4px var(--accent-soft), 0 0 12px var(--accent)",
                                }}
                            />
                            Fullstack engineer / software architect
                        </span>
                    </Reveal>

                    <Reveal
                        delay={120}
                        className="relative mx-auto mb-6"
                        style={{
                            width: "100%",
                            height: "clamp(180px, 24vw, 280px)",
                        }}
                    >
                        <HeroParticleTitle text="onclimb" />
                    </Reveal>

                    <Reveal delay={240}>
                        <p className="mx-auto mb-4 max-w-[640px] text-[clamp(18px,2vw,22px)] font-normal leading-[1.6] tracking-normal text-fg">
                            作ると決まったプロダクトを、動き続けるソフトウェアとして実装する。
                        </p>
                    </Reveal>
                    <Reveal delay={320}>
                        <p className="mx-auto mb-10 max-w-[560px] text-[15px] leading-[1.7] text-fg-muted">
                            ソフトウェアアーキテクトの思考を持ちながら、自ら手を動かす実装者。
                            <br />
                            技術は課題を解決し続けるための手段だと考えています。
                        </p>
                    </Reveal>

                    <Reveal
                        delay={420}
                        className="inline-flex flex-wrap justify-center gap-3"
                    >
                        {/* 最初に目に入る行動導線を問い合わせにする。
                            Profile / Portfolio は探索の導線なので ghost に下げる。 */}
                        <Link className="btn btn-primary" href="/contact">
                            仕事のお問い合わせはこちら
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M5 12h14M13 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link className="btn btn-ghost" href="/profile">
                            Profileを見る
                        </Link>
                        <Link className="btn btn-ghost" href="/portfolio">
                            作ったものを見る
                        </Link>
                    </Reveal>
                </div>

                <div className="scroll-hint pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-dim">
                    SCROLL
                </div>
            </section>

            {/* STACK / WHAT I DO */}
            <section className="relative py-[120px]">
                <div className="container-design">
                    <Reveal as="header" className="mb-14 flex max-w-[720px] flex-col gap-3">
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                            01 / What I do
                        </span>
                        <h2 className="text-[clamp(32px,4vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                            設計から実装まで、
                            <br />
                            地続きで責任を持つ。
                        </h2>
                        <p className="max-w-[560px] text-base leading-[1.7] text-fg-muted">
                            ドメインを深く理解したモデリングを起点に、高保守性なアプリケーションを組み立てるフルスタックエンジニア。「何を作るか」の決定を尊重し、「作ると決まったもの」を正しく設計・運用し続けることに責任を持ちます。生成 AI で 0→1 が速くなった今こそ、それを拡大し長期運用へ導く「理解に基づく設計」の価値を磨き続けています。
                        </p>
                    </Reveal>

                    <div
                        className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-hairline [@media(min-width:720px)]:grid-cols-3"
                        style={{ background: "var(--hairline)" }}
                    >
                        {CAPS.map((cap, i) => (
                            <Reveal
                                key={cap.title}
                                delay={i * 100}
                                as="article"
                                className="cap-cell relative overflow-hidden bg-bg-elev px-8 py-9 transition-colors duration-250 hover:bg-bg-elev-2"
                            >
                                <div className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-dim">
                                    {cap.num}
                                </div>
                                <div
                                    className="mb-6 grid h-11 w-11 place-items-center rounded-md border border-hairline-strong text-accent transition-all duration-300"
                                    style={{ background: "var(--accent-soft)" }}
                                >
                                    {cap.icon}
                                </div>
                                <h3 className="mb-3 text-[20px] font-semibold tracking-[-0.01em]">
                                    {cap.title}
                                </h3>
                                <p className="mb-4 text-sm leading-[1.7] text-fg-muted">
                                    {cap.desc}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {cap.chips.map((c) => (
                                        <span
                                            key={c}
                                            className="rounded-[4px] border border-hairline-strong bg-bg px-2 py-1 font-mono text-[11px] text-fg"
                                        >
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal
                        className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-hairline [@media(min-width:720px)]:grid-cols-4"
                        style={{ background: "var(--hairline)" }}
                    >
                        {stats.map((s) => (
                            <div key={s.label} className="bg-bg-elev p-8 text-left">
                                <span className="block font-mono text-[36px] font-semibold tracking-[-0.03em] text-fg-strong">
                                    {s.value}
                                    {s.sup && (
                                        <sup className="ml-0.5 text-base text-accent">
                                            {s.sup}
                                        </sup>
                                    )}
                                </span>
                                <div className="mt-1.5 text-xs tracking-[0.05em] text-fg-muted">
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* EXPLORE */}
            <section className="relative pb-[120px] pt-10">
                <div className="container-design">
                    <Reveal as="header" className="mb-14 flex max-w-[720px] flex-col gap-3">
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                            02 / Explore
                        </span>
                        <h2 className="text-[clamp(32px,4vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                            深掘りする場所を選ぶ。
                        </h2>
                        <p className="max-w-[560px] text-base leading-[1.7] text-fg-muted">
                            経歴、技術スタック、作ったもの、毎日の知識収集、読書ノート。それぞれのページに違うリズムがあります。
                        </p>
                    </Reveal>

                    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
                        {EXPLORE_ITEMS.map((item, i) => (
                            <Reveal key={item.href} delay={i * 60}>
                                <Link
                                    href={item.href}
                                    className="explore relative block overflow-hidden rounded-[var(--radius-lg)] border border-hairline-solid bg-surface-solid p-7 shadow-card transition-all duration-350 hover:-translate-y-1 hover:border-accent"
                                >
                                    <span className="mb-4 block font-mono text-[11px] tracking-[0.2em] text-fg-dim">
                                        → {item.href}
                                    </span>
                                    <div className="mb-1.5 flex items-center gap-2 text-[22px] font-semibold">
                                        {item.label}
                                        <span className="explore__arrow inline-block transition-transform duration-300">
                                            ↗
                                        </span>
                                    </div>
                                    <div className="text-sm leading-[1.6] text-fg-muted">
                                        {item.description}
                                    </div>
                                    <span
                                        className="pointer-events-none absolute -bottom-5 -right-5 h-[100px] w-[100px] rounded-md opacity-[0.05] transition-opacity duration-350"
                                        style={{
                                            background: "var(--accent)",
                                        }}
                                    />
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA BAND */}
            <section className="relative pb-[120px] pt-10">
                <div className="container-design">
                    <Reveal
                        className="relative overflow-hidden rounded-[var(--radius-lg)] border border-hairline-strong px-8 py-20 text-center"
                        style={{
                            background: "var(--bg-elev)",
                        }}
                    >
                        <h2 className="relative mb-4 text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.02em]">
                            仕事の話、しませんか。
                        </h2>
                        <p className="relative mb-7 text-base text-fg-muted">
                            作ると決まったプロダクトの実装・運用、技術相談、雑談まで。気軽に連絡してください。
                        </p>
                        <div className="relative inline-flex flex-wrap justify-center gap-3">
                            {/* メールアドレスの直リンクからコンタクトページへ差し替え。
                                アドレス自体は /contact のメール経路で表示している。 */}
                            <Link className="btn btn-primary" href="/contact">
                                お問い合わせ / ご相談
                            </Link>
                            <a
                                className="btn btn-ghost"
                                href={GITHUB_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                GitHub ↗
                            </a>
                        </div>
                    </Reveal>
                </div>
            </section>
        </main>
    )
}

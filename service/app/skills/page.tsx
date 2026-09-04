import type { Metadata } from "next"
import { getRadarAxes, getSkills, getSkillsByCategory } from "@/lib/skills"
import { Reveal } from "@/components/animations"
import { RadarChart, SkillsList } from "@/components/skills"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
    title: "Skills",
    description:
        "フロントエンド、バックエンド、クラウド、設計など、実務で使ってきた技術スタックと習熟度を紹介します。",
    path: "/skills",
})

const LEVEL_LEGEND = [
    { value: 5, label: "5 — 専門", color: "#4ADE80", opacity: 1 },
    { value: 4, label: "4 — 実務継続", color: "var(--accent)", opacity: 1 },
    { value: 3, label: "3 — 実務経験", color: "var(--rose)", opacity: 1 },
    { value: 2, label: "2 — 個人利用", color: "var(--amber)", opacity: 1 },
    { value: 1, label: "1 — 学習中", color: "var(--amber)", opacity: 0.6 },
]

export default function SkillsPage() {
    const skills = getSkills()
    const axes = getRadarAxes(skills)
    const skillsByCategory = getSkillsByCategory()

    return (
        <main className="page flex-1">
            {/* page-hero */}
            <section className="px-0 pb-10 pt-20">
                <div className="mx-auto max-w-[1100px] px-6">
                    <Reveal className="mb-4 flex gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-fg-dim">
                        <span>onclimb</span>
                        <span>/</span>
                        <b className="font-medium text-accent">skills</b>
                    </Reveal>
                    <Reveal delay={80}>
                        <h1 className="mb-5 text-[clamp(40px,5.6vw,64px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                            手を動かしてきた、
                            <br />
                            その全部。
                        </h1>
                    </Reveal>
                    <Reveal delay={160}>
                        <p className="max-w-[640px] text-lg leading-[1.7] text-fg">
                            使ってきた技術と、その習熟度。レーダーで全体像を、バーで個別の深さを。
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Radar */}
            <section className="py-14">
                <div className="mx-auto max-w-[1100px] px-6">
                    <Reveal className="grid grid-cols-1 items-center gap-8 [@media(min-width:900px)]:grid-cols-[minmax(0,1fr)_320px] [@media(min-width:900px)]:gap-14">
                        <div className="relative mx-auto aspect-square w-full max-w-[600px]">
                            <RadarChart axes={axes} />
                        </div>
                        <div className="flex flex-col gap-3">
                            {axes.map((a) => (
                                <div
                                    key={a.key}
                                    className="flex items-start gap-3.5 rounded-[var(--radius)] border border-hairline bg-bg-elev px-4 py-3.5 transition-all duration-200 hover:border-accent hover:bg-accent-soft"
                                >
                                    <div
                                        className="w-1 self-stretch rounded"
                                        style={{
                                            background: "var(--accent)",
                                            opacity: Math.max(0.15, a.ratio),
                                        }}
                                    />
                                    <div className="flex-1">
                                        <div className="mb-0.5 text-sm font-semibold">
                                            {a.label}
                                        </div>
                                        <div className="font-mono text-[11px] text-fg-dim">
                                            total {a.total} · {a.count} skills
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Reveal>

                    <Reveal className="my-10 flex flex-wrap justify-center gap-4 border-y border-hairline py-5">
                        {LEVEL_LEGEND.map((l) => (
                            <div
                                key={l.value}
                                className="flex items-center gap-2 font-mono text-xs text-fg-muted"
                            >
                                <span
                                    className="block h-2.5 w-2.5 rounded-full"
                                    style={{
                                        background: l.color,
                                        opacity: l.opacity,
                                    }}
                                />
                                {l.label}
                            </div>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* Category sections */}
            <section className="py-20">
                <div className="mx-auto max-w-[1100px] px-6">
                    <SkillsList skillsByCategory={skillsByCategory} />
                </div>
            </section>
        </main>
    )
}

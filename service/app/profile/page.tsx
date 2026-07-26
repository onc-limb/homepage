import Image from "next/image"
import Link from "next/link"
import { getProfile, getParsedProfile } from "@/lib/profile"
import { Reveal } from "@/components/animations"

export default async function ProfilePage() {
    const profile = await getProfile()
    const parsed = await getParsedProfile()

    return (
        <main className="page flex-1">
            {/* page-hero */}
            <section className="px-0 pb-10 pt-20">
                <div className="mx-auto max-w-[820px] px-6">
                    <Reveal className="mb-4 flex gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-fg-dim">
                        <span>onclimb</span>
                        <span>/</span>
                        <b className="font-medium text-accent">profile</b>
                    </Reveal>
                    <Reveal
                        delay={80}
                        className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-hairline-strong bg-surface-solid px-3.5 py-1.5 font-mono text-[13px] text-fg-muted"
                    >
                        <span
                            aria-hidden="true"
                            className="block h-1.5 w-1.5 rounded-full"
                            style={{
                                background: "var(--accent)",
                                boxShadow: "0 0 8px var(--accent)",
                            }}
                        />
                        <span className="font-mono">available for new projects</span>
                    </Reveal>
                    <Reveal delay={160}>
                        <h1 className="mb-5 text-[clamp(40px,5.6vw,64px)] font-semibold leading-[1.05] tracking-[-0.03em]">
                            動く理由を知り、
                            <br />
                            使う人を想う。
                        </h1>
                    </Reveal>
                    <Reveal delay={240}>
                        <p className="mb-4 max-w-[640px] text-lg leading-[1.8] text-fg">
                            「作る」と決まったプロダクトを、動き続けるソフトウェアとして実装し、運用まで担う当事者。ソフトウェアアーキテクトの視点で設計しながら、自ら手を動かす。フロントエンドからバックエンド、インフラまで一貫して携わるフルスタックエンジニア。
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* identity card */}
            <div className="mx-auto max-w-[820px] px-6">
                <Reveal
                    as="section"
                    className="my-14 grid grid-cols-1 items-center gap-8 rounded-[var(--radius-lg)] border border-hairline-solid p-10 shadow-card [@media(min-width:720px)]:grid-cols-[200px_1fr] [@media(min-width:720px)]:gap-12"
                    style={{
                        // グラデーション廃止・単色化: 放射状グラデーションを単色サーフェスに置換
                        background: "var(--surface-solid)",
                    }}
                >
                    <div className="relative h-[200px] w-[200px] rounded-full p-[3px]"
                        style={{
                            // グラデーション廃止・単色化: 線形グラデーションのリングを単色アクセントに置換
                            background: "var(--accent)",
                        }}
                    >
                        <span
                            aria-hidden="true"
                            className="absolute -inset-2 rounded-full border border-dashed border-hairline-strong"
                            style={{ animation: "spin-slow 30s linear infinite" }}
                        />
                        <div className="relative h-full w-full overflow-hidden rounded-full bg-bg">
                            <Image
                                src={profile.data.avatar}
                                alt={profile.data.name}
                                fill
                                sizes="200px"
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="mb-1.5 text-[28px] font-semibold tracking-[-0.02em]">
                            {profile.data.name}
                        </div>
                        <div className="mb-5 text-sm leading-[1.5] text-fg-muted">
                            {profile.data.title}
                        </div>
                        <div className="flex flex-wrap gap-5 font-mono text-xs text-fg-dim">
                            <span>
                                📍 <b className="font-medium text-fg">Tokyo</b>
                            </span>
                            <span>
                                EXP <b className="font-medium text-fg">5+ years</b>
                            </span>
                            <span>
                                FOCUS{" "}
                                <b className="font-medium text-fg">
                                    Backend / Software Architecture
                                </b>
                            </span>
                            <span>
                                STATUS{" "}
                                <b className="font-medium text-accent">open to work</b>
                            </span>
                        </div>
                    </div>
                </Reveal>
            </div>

            {/* 自己紹介 */}
            {parsed.selfIntroduction.length > 0 && (
                <section className="relative py-20">
                    <div className="mx-auto max-w-[820px] px-6">
                        <Reveal
                            as="header"
                            className="mb-8 flex items-baseline gap-4 border-b border-hairline pb-4"
                        >
                            <span className="font-mono text-xs tracking-[0.18em] text-accent">
                                01
                            </span>
                            <h2 className="text-[28px] font-semibold tracking-[-0.02em]">
                                自己紹介
                            </h2>
                        </Reveal>
                        <Reveal
                            delay={80}
                            className="text-[17px] leading-[1.85] tracking-[0.005em] text-fg"
                        >
                            {parsed.selfIntroduction.map((block, i) =>
                                block.type === "pullQuote" ? (
                                    <div
                                        key={i}
                                        className="my-8 rounded-r-[var(--radius)] border-l-[3px] border-accent bg-accent-soft px-7 py-6 text-lg font-medium text-fg-strong"
                                    >
                                        {block.text}
                                    </div>
                                ) : (
                                    <p key={i} className="mb-[18px]">
                                        {block.text}
                                    </p>
                                ),
                            )}
                        </Reveal>
                    </div>
                </section>
            )}

            {/* 経歴 */}
            {parsed.career.length > 0 && (
                <section className="relative py-20">
                    <div className="mx-auto max-w-[820px] px-6">
                        <Reveal
                            as="header"
                            className="mb-8 flex items-baseline gap-4 border-b border-hairline pb-4"
                        >
                            <span className="font-mono text-xs tracking-[0.18em] text-accent">
                                02
                            </span>
                            <h2 className="text-[28px] font-semibold tracking-[-0.02em]">
                                経歴
                            </h2>
                        </Reveal>
                        <div className="grid gap-6">
                            {parsed.career.map((item, i) => (
                                <Reveal
                                    key={i}
                                    delay={i * 80}
                                    as="article"
                                    className="grid grid-cols-1 gap-1.5 border-b border-hairline py-5 last:border-b-0 [@media(min-width:601px)]:grid-cols-[140px_1fr] [@media(min-width:601px)]:gap-6"
                                >
                                    <div className="pt-1 font-mono text-xs tracking-[0.06em] text-accent">
                                        {item.period}
                                    </div>
                                    <div>
                                        <div className="mb-2 text-base font-semibold text-fg-strong">
                                            {item.role}
                                        </div>
                                        <ul className="m-0 list-none p-0">
                                            {item.bullets.map((b, j) => (
                                                <li
                                                    key={j}
                                                    className="relative py-1 pl-5 text-[14.5px] leading-[1.6] text-fg-muted before:absolute before:left-0 before:top-[13px] before:block before:h-px before:w-2 before:bg-fg-dim"
                                                >
                                                    {b}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 関心 */}
            {parsed.interests.length > 0 && (
                <section className="relative py-20">
                    <div className="mx-auto max-w-[820px] px-6">
                        <Reveal
                            as="header"
                            className="mb-8 flex items-baseline gap-4 border-b border-hairline pb-4"
                        >
                            <span className="font-mono text-xs tracking-[0.18em] text-accent">
                                03
                            </span>
                            <h2 className="text-[28px] font-semibold tracking-[-0.02em]">
                                エンジニアとしての今 — 関心
                            </h2>
                        </Reveal>
                        <div
                            className="mt-3 grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-lg)] border border-hairline [@media(min-width:720px)]:grid-cols-2"
                            style={{ background: "var(--hairline)" }}
                        >
                            {parsed.interests.map((item, i) => (
                                <Reveal
                                    key={i}
                                    delay={i * 60}
                                    className="bg-bg-elev px-7 py-6 transition-colors duration-200 hover:bg-bg-elev-2"
                                >
                                    <div className="mb-1.5 text-[15px] font-semibold text-accent-strong">
                                        {item.title}
                                    </div>
                                    <div className="text-sm leading-[1.7] text-fg-muted">
                                        {item.description}
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 資格 */}
            {parsed.certs.length > 0 && (
                <section className="relative py-20">
                    <div className="mx-auto max-w-[820px] px-6">
                        <Reveal
                            as="header"
                            className="mb-8 flex items-baseline gap-4 border-b border-hairline pb-4"
                        >
                            <span className="font-mono text-xs tracking-[0.18em] text-accent">
                                04
                            </span>
                            <h2 className="text-[28px] font-semibold tracking-[-0.02em]">
                                資格
                            </h2>
                        </Reveal>
                        <div className="grid grid-cols-1 gap-3 [@media(min-width:600px)]:grid-cols-2">
                            {parsed.certs.map((cert, i) => (
                                <Reveal
                                    key={i}
                                    delay={i * 50}
                                    className="flex items-start gap-3.5 rounded-[var(--radius)] border border-hairline bg-bg-elev px-5 py-4 transition-colors duration-200 hover:border-accent"
                                >
                                    <div
                                        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-accent"
                                        style={{ background: "var(--accent-soft)" }}
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="mb-0.5 text-sm font-medium leading-[1.5]">
                                            {cert.title}
                                        </div>
                                        <div className="font-mono text-[11px] text-fg-dim">
                                            {cert.year}
                                        </div>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* next-link */}
            <div className="mx-auto max-w-[820px] px-6">
                <Reveal>
                    <Link
                        href="/skills"
                        className="my-14 flex items-center justify-between rounded-[var(--radius-lg)] border border-hairline-strong bg-surface-solid px-8 py-7 transition-all duration-250 hover:-translate-y-0.5 hover:border-accent"
                    >
                        <div>
                            <div className="mb-1 font-mono text-[11px] tracking-[0.16em] text-fg-dim">
                                NEXT — 02
                            </div>
                            <div className="text-xl font-semibold">
                                使ってきた技術スタックを見る
                            </div>
                        </div>
                        <div className="grid h-11 w-11 place-items-center rounded-full bg-accent text-white transition-transform duration-300 [.group:hover_&]:translate-x-1.5">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M5 12h14M13 5l7 7-7 7" />
                            </svg>
                        </div>
                    </Link>
                </Reveal>
            </div>
        </main>
    )
}

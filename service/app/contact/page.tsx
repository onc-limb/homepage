import type { Metadata } from "next"
import { Mail } from "lucide-react"
import { Reveal } from "@/components/animations"
import { CONTACT_EMAIL } from "@/lib/constants"
import { CONTACT_CATEGORIES } from "@/lib/validations/contact"
import { ContactForm } from "./ContactForm"

export const metadata: Metadata = {
    title: "Contact — onclimb",
    description:
        "仕事のご相談・技術的なご相談の窓口。メールとフォームの2つの経路で受け付けています。",
}

export default function ContactPage() {
    return (
        <main className="page flex-1">
            <section className="px-0 pb-20 pt-20">
                <div className="mx-auto max-w-[960px] px-6">
                    <Reveal className="mb-4 flex gap-1.5 font-mono text-xs uppercase tracking-[0.16em] text-fg-dim">
                        <span>onclimb</span>
                        <span>/</span>
                        <b className="font-medium text-accent">contact</b>
                    </Reveal>

                    <Reveal as="header" className="mb-12 flex flex-col gap-4">
                        <h1 className="text-[clamp(32px,4vw,48px)] font-semibold leading-[1.1] tracking-[-0.03em]">
                            仕事のお問い合わせは
                            <br />
                            こちらから。
                        </h1>
                        <p className="max-w-[620px] text-base leading-[1.8] text-fg-muted">
                            作ると決まったプロダクトの実装・運用のご相談、技術的な壁打ち、
                            まだ形になっていない構想の段階でも構いません。
                            メールとフォームのどちらでも受け付けています。
                        </p>
                    </Reveal>

                    <div className="grid items-start gap-6 [@media(min-width:960px)]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                        <Reveal className="flex flex-col gap-6">
                            <div className="rounded-[var(--radius-lg)] border border-hairline-solid bg-surface-solid p-7 shadow-card">
                                <div className="mb-5 flex items-center gap-2.5">
                                    <span
                                        className="grid h-9 w-9 place-items-center rounded-md border border-hairline-strong text-accent"
                                        style={{ background: "var(--accent-soft)" }}
                                    >
                                        <Mail className="h-[18px] w-[18px]" />
                                    </span>
                                    <h2 className="text-[19px] font-semibold tracking-[-0.01em]">
                                        メールで送る
                                    </h2>
                                </div>
                                <p className="mb-5 text-sm leading-[1.8] text-fg-muted">
                                    普段お使いのメールソフトからそのまま送れます。
                                    資料の添付が必要なときや、社内の関係者を CC に入れたいときはこちらが確実です。
                                </p>
                                <a
                                    className="btn btn-ghost w-full justify-center break-all font-mono text-[13px]"
                                    href={`mailto:${CONTACT_EMAIL}`}
                                >
                                    {CONTACT_EMAIL}
                                </a>
                            </div>

                            <div className="rounded-[var(--radius-lg)] border border-hairline bg-bg-elev p-7">
                                <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-dim">
                                    受け付けている相談
                                </h2>
                                <ul className="flex flex-col gap-2.5">
                                    {CONTACT_CATEGORIES.map((category) => (
                                        <li
                                            key={category.value}
                                            className="flex items-start gap-2.5 text-sm leading-[1.7] text-fg-muted"
                                        >
                                            <span
                                                aria-hidden="true"
                                                className="mt-[7px] block h-[5px] w-[5px] shrink-0 rounded-full"
                                                style={{ background: "var(--accent)" }}
                                            />
                                            {category.label}
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-5 text-xs leading-[1.7] text-fg-dim">
                                    内容を確認のうえ、数日以内にご記入のメールアドレス宛へ返信します。
                                </p>
                            </div>
                        </Reveal>

                        <Reveal delay={100} className="flex flex-col gap-4">
                            <h2 className="text-[19px] font-semibold tracking-[-0.01em]">
                                フォームで送る
                            </h2>
                            <ContactForm />
                        </Reveal>
                    </div>
                </div>
            </section>
        </main>
    )
}

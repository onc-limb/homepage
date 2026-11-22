import type { Metadata } from "next"

import { DESIGN_SAMPLES } from "./samples"
import type { DesignTheme } from "./tokens"

export const metadata: Metadata = {
    title: "デザイン",
    robots: { index: false, follow: false },
}

const THEMES: readonly DesignTheme[] = ["light", "dark"]

export default function DesignPage() {
    return (
        <main className="font-ds text-ds-base text-ds-fg">
            <h1 className="p-ds-3 text-ds-xl">デザインシステム</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2">
                {THEMES.map((theme) => (
                    <section
                        key={theme}
                        data-theme={theme}
                        className="bg-ds-bg p-ds-4 text-ds-fg"
                    >
                        <h2 className="text-ds-lg">{theme}</h2>
                        {DESIGN_SAMPLES.map(({ id, title, Sample }) => (
                            <section key={id} className="mt-ds-4">
                                <h3 className="border-b border-ds-border pb-ds-1 text-ds-base">
                                    {title}
                                </h3>
                                <div className="mt-ds-3">
                                    <Sample theme={theme} />
                                </div>
                            </section>
                        ))}
                    </section>
                ))}
            </div>
        </main>
    )
}

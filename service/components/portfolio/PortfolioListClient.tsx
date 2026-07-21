"use client"

import { useState } from "react"
import type { Project } from "@/lib/portfolio"
import { PortfolioFilterBar, type PortfolioFilter } from "./PortfolioFilter"
import { PortfolioSection } from "./PortfolioSection"

interface Props {
    personal: Project[]
}

export function PortfolioListClient({ personal }: Props) {
    const [filter, setFilter] = useState<PortfolioFilter>("all")

    return (
        <>
            <PortfolioFilterBar onChange={setFilter} initial={filter} />

            <section className="py-14">
                <div className="mx-auto max-w-[1080px] px-6">
                    {(filter === "all" || filter === "personal") &&
                        personal.length > 0 && (
                            <PortfolioSection
                                seq="/01"
                                title="Personal Projects"
                                countLabel="projects"
                                projects={personal}
                            />
                        )}

                    {personal.length === 0 && (
                        <div className="py-12 text-center text-fg-muted">
                            プロジェクトは準備中です
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

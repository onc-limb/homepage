import type { ReactNode } from "react"

type SectionProps = {
    heading: string
    children?: ReactNode
}

/** man-page style section: uppercase heading, indented body. */
export function Section({ heading, children }: SectionProps) {
    return (
        <section>
            <h2 className="font-ds text-ds-lg font-bold uppercase text-ds-fg">{heading}</h2>
            <div className="mt-ds-2 pl-ds-3 md:pl-ds-5">{children}</div>
        </section>
    )
}

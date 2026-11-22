import type { ReactNode } from "react"

type PageProps = {
    title: string
    command?: string
    peek?: ReactNode
    children?: ReactNode
}

/** Page frame: peek, then the `$ command` line, then the h1, then the body. */
export function Page({ title, command, peek, children }: PageProps) {
    return (
        <div className="mx-auto w-full max-w-ds-page px-ds-3 py-ds-5 font-ds text-ds-base leading-ds text-ds-fg md:px-ds-page-gutter">
            {peek ? <div className="mb-ds-4">{peek}</div> : null}
            {command ? <p className="font-ds text-ds-sm text-ds-fg-muted">$ {command}</p> : null}
            <h1 className="mt-ds-2 text-ds-xl font-bold text-ds-fg">{title}</h1>
            <div className="mt-ds-4">{children}</div>
        </div>
    )
}

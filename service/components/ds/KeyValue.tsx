import { Fragment, type ReactNode } from "react"

export type KeyValueItem = { key: string; value: ReactNode }

type KeyValueProps = {
    items: readonly KeyValueItem[]
}

export function KeyValue({ items }: KeyValueProps) {
    return (
        <dl className="grid grid-cols-1 gap-x-ds-4 gap-y-ds-1 border border-ds-border bg-ds-surface p-ds-3 font-ds text-ds-base text-ds-fg md:grid-cols-ds-kv">
            {items.map((item, index) => (
                <Fragment key={index}>
                    <dt className="text-ds-sm text-ds-fg-muted">{item.key}</dt>
                    <dd>{item.value}</dd>
                </Fragment>
            ))}
        </dl>
    )
}

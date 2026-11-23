import { Fragment, type ReactNode } from "react"

import { BOXED_SURFACE } from "./surface-styles"

export type KeyValueItem = { key: string; value: ReactNode }

type KeyValueProps = {
    items: readonly KeyValueItem[]
}

export function KeyValue({ items }: KeyValueProps) {
    return (
        <dl className={`grid grid-cols-1 gap-x-ds-4 gap-y-ds-1 md:grid-cols-ds-kv ${BOXED_SURFACE} font-ds text-ds-base text-ds-fg`}>
            {items.map((item, index) => (
                <Fragment key={index}>
                    <dt className="text-ds-sm text-ds-fg-muted">{item.key}</dt>
                    <dd>{item.value}</dd>
                </Fragment>
            ))}
        </dl>
    )
}

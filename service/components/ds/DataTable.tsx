import type { ReactNode } from "react"

import { TABLE, TABLE_SCROLL, TD, TH } from "./table-styles"

export type DataTableColumn<K extends string> = { key: K; header: string }

type DataTableProps<K extends string> = {
    columns: readonly DataTableColumn<K>[]
    rows: readonly Record<K, ReactNode>[]
}

export function DataTable<K extends string>({ columns, rows }: DataTableProps<K>) {
    return (
        <div className={TABLE_SCROLL}>
            <table className={TABLE}>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} scope="col" className={TH}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((column) => (
                                <td key={column.key} className={TD}>
                                    {row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

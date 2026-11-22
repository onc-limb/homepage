import { DataTable } from "@/components/ds/DataTable"

import type { DesignSample } from "./types"

const COLUMNS = [
    { key: "name", header: "名前" },
    { key: "level", header: "レベル" },
    { key: "years", header: "年数" },
] as const

export const dataTableSample: DesignSample = {
    id: "data-table",
    title: "DataTable",
    Sample: () => (
        <DataTable
            columns={COLUMNS}
            rows={[
                { name: "TypeScript", level: "上級", years: "5" },
                { name: "Rust", level: "中級", years: "2" },
            ]}
        />
    ),
}

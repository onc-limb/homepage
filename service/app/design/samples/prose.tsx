import { Prose } from "@/components/ds/Prose"

import type { DesignSample } from "./types"

const MARKDOWN = `# 山荘の入口

onclimb の本文。**太字**と[リンク](https://example.com)を含む。

- 一つ目
- 二つ目

> 引用はここに書く。

| 名前 | 年数 |
| --- | --- |
| TypeScript | 5 |

\`\`\`
pnpm --dir service test
\`\`\`
`

export const proseSample: DesignSample = {
    id: "prose",
    title: "Prose",
    Sample: () => <Prose markdown={MARKDOWN} />,
}

import { CodeBlock } from "@/components/ds/CodeBlock"

import type { DesignSample } from "./types"

export const codeBlockSample: DesignSample = {
    id: "code-block",
    title: "CodeBlock",
    Sample: () => (
        <div className="grid grid-cols-1 gap-ds-3">
            <CodeBlock prompt="$ " code="pnpm --dir service test" />
            <CodeBlock code={"const name = 'onclimb'\nconsole.log(name)"} />
        </div>
    ),
}

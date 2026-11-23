import { SPACE_TOKENS } from "../tokens"
import type { DesignSample } from "./types"

export const spacingSample: DesignSample = {
    id: "spacing",
    title: "余白",
    Sample: () => (
        <ul className="grid grid-cols-1 gap-ds-2">
            {SPACE_TOKENS.map((token) => (
                <li key={token.name} className="flex items-center gap-ds-3">
                    <span className={`${token.utility} inline-block h-ds-3 shrink-0 bg-ds-accent`} />
                    <span className="text-ds-sm">
                        {token.name} {token.value}
                    </span>
                </li>
            ))}
        </ul>
    ),
}

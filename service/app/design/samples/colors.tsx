import { COLOR_TOKENS } from "../tokens"
import type { DesignSample } from "./types"

export const colorsSample: DesignSample = {
    id: "colors",
    title: "色",
    Sample: ({ theme }) => (
        <ul className="grid grid-cols-1 gap-ds-2">
            {COLOR_TOKENS.map((token) => (
                <li key={token.name} className="flex items-center gap-ds-3">
                    <span
                        className={`${token.swatch} inline-block h-ds-4 w-ds-5 shrink-0 border border-ds-border-strong`}
                    />
                    <span className="text-ds-sm">
                        <span className="text-ds-fg">{token.name}</span>{" "}
                        <span className="text-ds-fg-muted">
                            {token[theme]} {token.role}
                        </span>
                    </span>
                </li>
            ))}
        </ul>
    ),
}

import { TEXT_TOKENS } from "../tokens"
import type { DesignSample } from "./types"

export const typeSample: DesignSample = {
    id: "type",
    title: "文字",
    Sample: () => (
        <div className="grid grid-cols-1 gap-ds-3">
            <ul className="grid grid-cols-1 gap-ds-2">
                {TEXT_TOKENS.map((token) => (
                    <li key={token.name}>
                        <p className="text-ds-sm text-ds-fg-muted">
                            {token.name} {token.value}
                        </p>
                        <p className={`${token.utility} font-ds`}>山荘の入口 onclimb</p>
                    </li>
                ))}
            </ul>
            <div>
                <p className="text-ds-sm text-ds-fg-muted">font-ds（M PLUS 1 Code）</p>
                <p className="font-ds text-ds-base">見出し・コマンド・表 guest@onclimb</p>
            </div>
            <div>
                <p className="text-ds-sm text-ds-fg-muted">font-ds-prose（M PLUS 1）</p>
                <p className="font-ds-prose text-ds-base">長い本文には字幅が可変の書体を使う。</p>
            </div>
        </div>
    ),
}

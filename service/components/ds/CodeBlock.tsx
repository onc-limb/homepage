type CodeBlockProps = {
    code: string
    prompt?: string
}

export function CodeBlock({ code, prompt }: CodeBlockProps) {
    return (
        <pre className="overflow-x-auto border border-ds-border bg-ds-surface p-ds-3 font-ds text-ds-sm leading-ds text-ds-fg">
            <code>
                {prompt ? <span className="select-none text-ds-fg-muted">{prompt}</span> : null}
                {code}
            </code>
        </pre>
    )
}

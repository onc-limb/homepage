interface IconProps {
    className?: string
    width?: number | string
    height?: number | string
}

/**
 * 外部リンク（↗）SVG。Portfolio 一覧 / Portfolio 詳細 から参照する。
 */
export function ExternalIcon({ className, width = 14, height = 14 }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            className={className}
        >
            <path d="M14 3h7v7M10 14L21 3M21 14v6a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h6" />
        </svg>
    )
}

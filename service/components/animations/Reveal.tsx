"use client"

import {
    useEffect,
    useRef,
    type CSSProperties,
    type ElementType,
    type ReactNode,
} from "react"

interface RevealProps {
    children: ReactNode
    delay?: number
    as?: ElementType
    className?: string
    style?: CSSProperties
}

/**
 * docs/design/shared/shell.js:220-237 と互換の reveal アニメーション。
 * threshold 0.12, rootMargin '0px 0px -8% 0px', delay は ms 単位。
 */
export function Reveal({
    children,
    delay = 0,
    as = "div",
    className,
    style,
}: RevealProps) {
    const ref = useRef<HTMLElement | null>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (!("IntersectionObserver" in window)) {
            el.classList.add("is-revealed")
            return
        }
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const target = entry.target as HTMLElement
                        target.style.transitionDelay = `${delay}ms`
                        target.classList.add("is-revealed")
                        io.unobserve(target)
                    }
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
        )
        io.observe(el)
        return () => io.disconnect()
    }, [delay])

    // React 19 では ref は通常の prop なので、createElement に props オブジェクトを
    // 組み立てて渡すより JSX で直接渡す（react-hooks/refs はレンダー中に ref を
    // 含むオブジェクトを作る形を「値を読みうる」と判定する）。
    const Element = as

    return (
        <Element
            ref={ref}
            data-reveal=""
            data-reveal-delay={delay}
            className={className}
            style={style}
        >
            {children}
        </Element>
    )
}

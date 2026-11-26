import Link from "next/link"
import type { MouseEventHandler, ReactNode, Ref } from "react"

import { Planks } from "./Planks"
import { FOCUS_RING } from "./focus-styles"
import { EXTERNAL_LINK_ATTRS, isExternalHref } from "./href"

type DoorCommonProps = {
    size?: "small" | "large"
    /** Main destination: the frame turns accent. */
    primary?: boolean
    /** Large doors only: the second line of the nameplate. */
    count?: string
    children: ReactNode
}

type DoorLinkProps = DoorCommonProps & {
    href: string
    /** Large links only: overrides the URL displayed below the door. */
    caption?: string
    type?: undefined
    pressed?: undefined
    "aria-expanded"?: undefined
    "aria-controls"?: undefined
    ref?: undefined
    onClick?: undefined
    disabled?: undefined
}

type DoorActionProps = DoorCommonProps & {
    href?: undefined
    caption?: undefined
    type?: "button" | "submit" | "reset"
    /** Toggle state; sets aria-pressed and turns the frame accent while true. */
    pressed?: boolean
    "aria-expanded"?: boolean
    "aria-controls"?: string
    ref?: Ref<HTMLButtonElement>
    onClick?: MouseEventHandler<HTMLButtonElement>
    disabled?: boolean
}

export type DoorButtonProps = DoorLinkProps | DoorActionProps

function Handle() {
    return <span aria-hidden="true" className="relative h-ds-2 w-ds-2 shrink-0 border border-ds-fg bg-ds-accent" />
}

export function DoorButton(props: DoorButtonProps) {
    const {
        size = "small",
        primary = false,
        count,
        caption,
        children,
        href,
        type,
        pressed,
        "aria-expanded": expanded,
        "aria-controls": controls,
        ref,
        onClick,
        disabled,
    } = props
    const external = href !== undefined && isExternalHref(href)
    const accent = primary || pressed === true
    const frameColor = accent ? "border-ds-accent" : "border-ds-map-wood-wall"
    const mark = external ? <span> ↗</span> : null

    const content =
        size === "large" ? (
            <>
                <span
                    className={`relative flex h-ds-door-narrow w-ds-door-narrow overflow-hidden border-ds-door-lg bg-ds-map-wood text-ds-fg outline outline-2 outline-ds-fg md:h-ds-door md:w-ds-door ${frameColor}`}
                >
                    <Planks />
                    <span className="relative flex h-full w-full flex-col items-center gap-ds-2 p-ds-2">
                        <span className="flex flex-col border border-ds-fg bg-ds-surface px-ds-2 py-ds-1 text-center">
                            <span className="font-bold">{children}</span>
                            {count !== undefined ? <span className="text-ds-sm text-ds-fg-muted">{count}</span> : null}
                        </span>
                        <span className="flex w-full grow items-center gap-ds-1">
                            <span className="h-full grow border-2 border-ds-map-wood-wall" />
                            <Handle />
                        </span>
                    </span>
                </span>
                {href !== undefined ? (
                    <span className="mt-ds-2 text-ds-sm text-ds-link underline underline-offset-4">
                        {caption ?? href}
                        {mark}
                    </span>
                ) : null}
            </>
        ) : (
            <>
                <Planks />
                <span className="relative font-bold">{children}</span>
                {mark !== null ? <span className="relative">{mark}</span> : null}
                <Handle />
            </>
        )

    const className =
        size === "large"
            ? `inline-flex flex-col items-start font-ds text-ds-base ${FOCUS_RING}`
            : `relative inline-flex items-center gap-ds-3 overflow-hidden border-ds-door bg-ds-map-wood py-ds-2 pl-ds-2 pr-ds-5 font-ds text-ds-base text-ds-fg outline outline-1 outline-ds-fg ${frameColor} ${FOCUS_RING}`

    if (href === undefined) {
        return (
            <button
                ref={ref}
                type={type ?? "button"}
                aria-pressed={pressed}
                aria-expanded={expanded}
                aria-controls={controls}
                data-primary={primary ? "true" : undefined}
                onClick={onClick}
                disabled={disabled}
                className={className}
            >
                {content}
            </button>
        )
    }

    const linkProps = { className, "data-primary": primary ? "true" : undefined }
    if (external) {
        return (
            <a href={href} {...EXTERNAL_LINK_ATTRS} {...linkProps}>
                {content}
            </a>
        )
    }
    return (
        <Link href={href} {...linkProps}>
            {content}
        </Link>
    )
}

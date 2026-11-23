/** True for absolute (`http(s)://`) and scheme-relative (`//`) URLs; everything else is an in-site href. */
export function isExternalHref(href: string): boolean {
    return /^(https?:)?\/\//i.test(href)
}

/** Attributes every external link carries so it opens in a new tab safely. */
export const EXTERNAL_LINK_ATTRS = { target: "_blank", rel: "noopener noreferrer" } as const

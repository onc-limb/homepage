"use client"

import { useEffect } from "react"

const ADSENSE_SRC =
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2116109734269102"

/**
 * AdSense ローダーを hydration 後にクライアント側で読み込む。
 * 生の <script> を <head> に置くと、ローダーが hydration 前に別の
 * <script> を <head> へ注入して SSR の head ツリーとズレ、hydration
 * mismatch を起こす。next/script だと data-nscript 属性で AdSense が
 * 警告を出すため、useEffect で素の script を append してどちらも避ける。
 */
export function AdSense() {
    useEffect(() => {
        if (document.querySelector(`script[src="${ADSENSE_SRC}"]`)) return
        const script = document.createElement("script")
        script.async = true
        script.src = ADSENSE_SRC
        script.crossOrigin = "anonymous"
        document.head.appendChild(script)
    }, [])
    return null
}

"use client"

import { useEffect, useState } from "react"

function pad(n: number): string {
    return String(n).padStart(2, "0")
}

function formatUtc(d: Date): string {
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`
}

export function FooterClock() {
    const [time, setTime] = useState<string>("")
    useEffect(() => {
        setTime(formatUtc(new Date()))
        const id = setInterval(() => setTime(formatUtc(new Date())), 1000)
        return () => clearInterval(id)
    }, [])
    return <span className="strong">{time}</span>
}

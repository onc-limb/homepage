import { ImageResponse } from "next/og"

export const alt = "onclimb — Fullstack Engineer / Software Architect"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
    return new ImageResponse(
        <div
            style={{
                alignItems: "center",
                background: "#090d12",
                color: "#f4f7f9",
                display: "flex",
                height: "100%",
                justifyContent: "center",
                padding: "80px",
                width: "100%",
            }}
        >
            <div
                style={{
                    border: "2px solid #29313a",
                    borderRadius: "32px",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "space-between",
                    padding: "64px",
                    width: "100%",
                }}
            >
                <div style={{ color: "#76e6a7", display: "flex", fontSize: 28 }}>
                    FULLSTACK ENGINEER / SOFTWARE ARCHITECT
                </div>
                <div
                    style={{
                        display: "flex",
                        fontSize: 116,
                        fontWeight: 700,
                        letterSpacing: "-5px",
                    }}
                >
                    onclimb
                </div>
                <div style={{ color: "#aab4be", display: "flex", fontSize: 30 }}>
                    設計から実装・運用まで、動き続けるソフトウェアをつくる。
                </div>
            </div>
        </div>,
        size
    )
}

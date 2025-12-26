"use client"
import { useReducedMotion } from "motion/react"
import FloatingShape from "./FloatingShape"
// 固定の図形配置（ランダムだとハイドレーションエラーになるため）
const shapeConfigs = [
    { type: "circle" as const, size: 60, x: 10, y: 15, duration: 20, delay: 0 },
    { type: "triangle" as const, size: 45, x: 85, y: 10, duration: 25, delay: 0.5 },
    { type: "square" as const, size: 40, x: 75, y: 70, duration: 22, delay: 1 },
    { type: "hexagon" as const, size: 55, x: 15, y: 75, duration: 28, delay: 0.3 },
    { type: "circle" as const, size: 35, x: 50, y: 5, duration: 18, delay: 0.8 },
    { type: "triangle" as const, size: 50, x: 90, y: 45, duration: 24, delay: 0.2 },
    { type: "square" as const, size: 30, x: 5, y: 45, duration: 26, delay: 0.6 },
    { type: "hexagon" as const, size: 42, x: 60, y: 85, duration: 21, delay: 0.4 },
]
export default function GeometricBackground() {
    const shouldReduceMotion = useReducedMotion()
    // アクセシビリティ: reduced motion が有効な場合は表示しない
    if (shouldReduceMotion) {
        return null
    }
    return (
        <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            aria-hidden="true"
        >
            {shapeConfigs.map((config, index) => (
                <FloatingShape
                    key={index}
                    type={config.type}
                    size={config.size}
                    initialX={config.x}
                    initialY={config.y}
                    duration={config.duration}
                    delay={config.delay}
                />
            ))}
        </div>
    )
}

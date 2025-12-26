"use client"
import { motion } from "motion/react"
// 図形の種類
type ShapeType = "circle" | "triangle" | "square" | "hexagon"
interface FloatingShapeProps {
    type: ShapeType
    size: number
    initialX: number
    initialY: number
    duration: number
    delay?: number
}
// SVG 図形コンポーネント
const shapes: Record<ShapeType, (size: number) => React.ReactNode> = {
    circle: (size) => (
        <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
        />
    ),
    triangle: (size) => (
        <polygon
            points={`${size / 2},2 ${size - 2},${size - 2} 2,${size - 2}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
        />
    ),
    square: (size) => (
        <rect
            x="2"
            y="2"
            width={size - 4}
            height={size - 4}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
        />
    ),
    hexagon: (size) => {
        const cx = size / 2
        const cy = size / 2
        const r = size / 2 - 2
        const points = Array.from({ length: 6 }, (_, i) => {
            const angle = (Math.PI / 3) * i - Math.PI / 2
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
        }).join(" ")
        return (
            <polygon points={points} fill="none" stroke="currentColor" strokeWidth="1" />
        )
    },
}
export default function FloatingShape({
    type,
    size,
    initialX,
    initialY,
    duration,
    delay = 0,
}: FloatingShapeProps) {
    // 水彩風カラーパレット（ターコイズ〜テラコッタ）
    const watercolorColors = [
        "text-turquoise-400/20",
        "text-turquoise-500/15",
        "text-turquoise-300/25",
        "text-terracotta-400/15",
        "text-terracotta-300/20",
    ]
    // 位置に基づいて色を決定（一貫性を保つため）
    const colorIndex = Math.abs(Math.floor(initialX * initialY)) % watercolorColors.length
    const colorClass = watercolorColors[colorIndex]
    return (
        <motion.div
            className={`absolute ${colorClass} pointer-events-none`}
            style={{
                left: `${initialX}%`,
                top: `${initialY}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{
                opacity: 1,
                y: [0, -15, 0, 10, 0],
                rotate: [0, 180, 360],
            }}
            transition={{
                opacity: { duration: 1, delay },
                y: {
                    duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay,
                },
                rotate: {
                    duration: duration * 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay,
                },
            }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="filter blur-[0.5px]"
            >
                {shapes[type](size)}
            </svg>
        </motion.div>
    )
}

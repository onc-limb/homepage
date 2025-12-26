"use client"
import { motion } from "motion/react"
import { ReactNode } from "react"
interface AnimatedSkillCardProps {
    icon: ReactNode
    title: string
    description: string
    index: number
}
export default function AnimatedSkillCard({
    icon,
    title,
    description,
    index,
}: AnimatedSkillCardProps) {
    return (
        <motion.div
            className="flex flex-col items-center text-center space-y-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
            }}
        >
            <div className="text-turquoise-500">{icon}</div>
            <h3 className="text-lg font-medium text-foreground tracking-elegant">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground tracking-elegant">
                {description}
            </p>
        </motion.div>
    )
}

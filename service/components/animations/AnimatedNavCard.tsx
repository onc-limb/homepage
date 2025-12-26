"use client"
import { motion } from "motion/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
interface NavItem {
    href: string
    label: string
    description: string
}
interface AnimatedNavCardProps {
    item: NavItem
    index: number
}
export default function AnimatedNavCard({ item, index }: AnimatedNavCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: "easeOut",
            }}
            whileHover={{
                y: -3,
                transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
        >
            <Link
                href={item.href}
                className="group block p-6 border border-turquoise-200/60 bg-white/60 hover:bg-turquoise-50/50 hover:border-turquoise-300/80 rounded-lg transition-all duration-200 shadow-card hover:shadow-soft"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-foreground tracking-elegant mb-1">
                            {item.label}
                        </h3>
                        <p className="text-sm text-muted-foreground tracking-elegant">
                            {item.description}
                        </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-turquoise-400 group-hover:text-turquoise-600 transition-colors" />
                </div>
            </Link>
        </motion.div>
    )
}

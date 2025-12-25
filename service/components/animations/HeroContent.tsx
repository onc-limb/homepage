'use client';
import { motion, Variants } from 'motion/react';
import { ReactNode } from 'react';
// アニメーションバリアント
const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
};
const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};
const lineVariants: Variants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
        scaleX: 1,
        opacity: 1,
        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};
interface HeroContentProps {
    subtitle: string;
    title: string;
    description: ReactNode;
}
export default function HeroContent({ subtitle, title, description }: HeroContentProps) {
    return (
        <motion.div
            className="flex flex-col items-center justify-center space-y-8 text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.span
                className="text-xs tracking-wide-elegant text-muted-foreground uppercase"
                variants={itemVariants}
            >
                {subtitle}
            </motion.span>
            <motion.h1
                className="text-5xl font-light tracking-wide-elegant sm:text-6xl xl:text-7xl text-foreground"
                variants={itemVariants}
            >
                {title}
            </motion.h1>
            <motion.div
                className="w-16 h-px bg-turquoise-400/60 my-4"
                variants={lineVariants}
            />
            <motion.p
                className="max-w-[700px] text-muted-foreground text-lg md:text-xl font-light tracking-elegant leading-relaxed"
                variants={itemVariants}
            >
                {description}
            </motion.p>
        </motion.div>
    );
}

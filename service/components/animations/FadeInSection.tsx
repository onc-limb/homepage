'use client';
import { motion } from 'motion/react';
import { ReactNode } from 'react';
interface FadeInSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}
export default function FadeInSection({
    children,
    className = '',
    delay = 0,
    direction = 'up',
}: FadeInSectionProps) {
    const directionOffset = {
        up: { y: 30, x: 0 },
        down: { y: -30, x: 0 },
        left: { y: 0, x: 30 },
        right: { y: 0, x: -30 },
        none: { y: 0, x: 0 },
    };
    const offset = directionOffset[direction];
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, ...offset }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
                duration: 0.6,
                delay,
                ease: 'easeOut',
            }}
        >
            {children}
        </motion.div>
    );
}

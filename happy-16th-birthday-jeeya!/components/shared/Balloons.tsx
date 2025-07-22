
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Balloon: React.FC<{ initialX: number; duration: number; delay: number; color: string }> = ({ initialX, duration, delay, color }) => {
    const sway = useMemo(() => [0, Math.random() > 0.5 ? 20 : -20, 0], []);
    
    return (
        <motion.div
            className="absolute bottom-[-100px] w-20 h-24"
            style={{ 
                left: `${initialX}%`,
                background: `radial-gradient(circle at 30% 30%, ${color}, #333)`,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                boxShadow: `inset -5px -5px 10px rgba(0,0,0,0.3)`,
            }}
            initial={{ y: 0, x: 0 }}
            animate={{ y: '-120vh', x: sway }}
            transition={{
                duration,
                delay,
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop'
            }}
        >
            <div className="absolute bottom-[-8px] left-[calc(50%-4px)] w-2 h-4 bg-inherit transform -skew-y-12" />
        </motion.div>
    );
}

const Balloons: React.FC = () => {
    const balloonData = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        initialX: Math.random() * 90,
        duration: Math.random() * 8 + 12, // 12s to 20s
        delay: Math.random() * 10,
        color: ['#e94560', '#ff7675', '#fdcb6e', '#81ecec', '#a29bfe'][Math.floor(Math.random() * 5)],
    })), []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {balloonData.map(b => (
                <Balloon key={b.id} {...b} />
            ))}
        </div>
    );
};

export default Balloons;

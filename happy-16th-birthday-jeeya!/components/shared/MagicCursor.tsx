
import React, { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

const MagicCursor: React.FC = () => {
    const [isHovering, setIsHovering] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
    
    const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
    const smoothMouse = {
        x: useSpring(mousePosition.x, springConfig),
        y: useSpring(mousePosition.y, springConfig),
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
            
            const target = e.target as HTMLElement;
            const isInteractive = !!target.closest('a, button, input, [role="button"], textarea');
            setIsHovering(isInteractive);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const cursorSize = isHovering ? 40 : 20;

    return (
        <div 
            className="fixed inset-0 z-[9999] pointer-events-none" 
            style={{ mixBlendMode: 'difference' }}
        >
            {/* The outer ring */}
            <motion.div
                style={{
                    left: smoothMouse.x,
                    top: smoothMouse.y,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    width: cursorSize,
                    height: cursorSize,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute w-5 h-5 border-2 border-white rounded-full"
            />
            {/* The inner dot */}
            <motion.div
                style={{
                    left: mousePosition.x,
                    top: mousePosition.y,
                    translateX: '-50%',
                    translateY: '-50%',
                }}
                animate={{
                    scale: isHovering ? 0 : 1,
                }}
                transition={{ duration: 0.1 }}
                className="absolute w-2 h-2 bg-white rounded-full"
            />
        </div>
    );
};

export default MagicCursor;

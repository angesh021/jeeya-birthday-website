
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from './shared/useFocusTrap.ts';

interface SecretMessageProps {
  isOpen: boolean;
  onClose: () => void;
}

const staticFeatures = [
    { name: 'Holo-Glow Display', description: 'A screen that projects interactive holograms into the air around you.' },
    { name: 'Neural Sync', description: 'Control your phone with just a thought. No hands needed.' },
    { name: 'Chameleon Shell', description: 'The phone body dynamically changes color and texture to match your outfit or mood.' },
    { name: 'Pocket Sun Charging', description: 'Charges itself using ambient light, even indoors. Never needs a cable.' },
    { name: 'Quantum Comms', description: 'Instant, unbreakable communication across any distance. No lag, ever.' },
];

const SecretMessage: React.FC<SecretMessageProps> = ({ isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef, isOpen);

    const [isUnwrapped, setIsUnwrapped] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setIsUnwrapped(false);
            }, 300); // Allow exit animation
            return () => clearTimeout(timer);
        }
    }, [isOpen]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const GiftBox = () => (
        <motion.div
            key="giftbox"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="flex flex-col items-center text-center cursor-pointer"
            onClick={() => setIsUnwrapped(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            role="button"
            aria-label="Unwrap the gift"
        >
            <motion.div
                className="relative w-48 h-48"
                aria-hidden="true"
            >
                <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-r from-pink-500 to-red-500 rounded-b-lg shadow-lg" />
                <motion.div
                    className="absolute top-0 w-[110%] h-1/4 bg-gradient-to-r from-pink-600 to-red-600 rounded-t-lg shadow-md"
                    style={{ x: '-5%' }}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-full bg-brand-accent/70" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-full bg-brand-accent/70 absolute top-[30%] -mt-3" />
                </div>
            </motion.div>
            <h2 id="gift-modal-title" className="font-script text-4xl text-brand-accent mt-6">A Gift For You!</h2>
            <p className="text-brand-text/80 mt-2">Click to unwrap your surprise...</p>
        </motion.div>
    );

    const RevealedGift = () => (
        <motion.div
            key="revealed"
            className="w-full"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.1 } }
            }}
        >
            <motion.div variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}>
                <h2 id="gift-modal-title" className="font-serif text-3xl md:text-4xl text-brand-accent mb-2 text-center md:text-left">Behold! The iPhone 16e</h2>
                <p className="text-brand-text/80 mb-8 text-center md:text-left">A one-of-a-kind design, imagined just for you.</p>
            </motion.div>
    
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* Phone Image Column */}
                <motion.div
                    className="relative flex justify-center items-center h-full"
                    variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: 'spring', delay: 0.2 } } }}
                >
                    <div className="absolute w-64 h-64 bg-brand-primary/20 rounded-full blur-3xl animate-pulsate-slow"></div>
                    <img
                        src="https://rewardmobile.co.uk/wp-content/uploads/2025/02/Apple-iPhone16e_White_Hero_Vertical.png"
                        alt="A futuristic smartphone, the iPhone 16e"
                        className="relative z-10 w-full max-w-[250px] drop-shadow-2xl"
                    />
                </motion.div>
    
                {/* Features Column */}
                <motion.div
                    className="space-y-4"
                    variants={{
                        visible: { transition: { staggerChildren: 0.15, delayChildren: 0.4 } }
                    }}
                >
                    <motion.h3
                        className="font-bold text-xl mb-4 border-t border-white/10 pt-4 md:border-none md:pt-0"
                        variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                    >
                        Mind-Blowing Features:
                    </motion.h3>
                    {staticFeatures.map((feature) => (
                        <motion.div
                            key={feature.name}
                            variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                        >
                            <p className="font-bold text-brand-secondary">{feature.name}</p>
                            <p className="text-brand-text/80 text-sm">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="gift-modal-title"
                        className="bg-gradient-to-br from-brand-surface to-[#2a215a] p-8 md:p-12 rounded-2xl w-full max-w-3xl relative shadow-2xl border border-brand-accent/30 overflow-y-auto max-h-[90vh] flex items-center justify-center min-h-[500px]"
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0, transition: { type: 'spring', damping: 20, stiffness: 200 } }}
                        exit={{ scale: 0.8, y: 50, transition: { duration: 0.2 } }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-3xl text-white/70 hover:text-white transition-colors z-30" aria-label="Close dialog">&times;</button>
                        
                        <AnimatePresence mode="wait">
                           {!isUnwrapped ? <GiftBox /> : <RevealedGift />}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SecretMessage;


import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from './shared/useFocusTrap.ts';

interface SecretMessageProps {
  isOpen: boolean;
  onClose: () => void;
}

// UPDATE: Changed to the new iPhone 16e gift concept.
const staticGift = {
    name: "iPhone 16e",
    description: "A revolutionary leap into the future. Crafted from a single piece of smart glass, it's more than a phone—it's a seamless extension of you.",
    imageUrl: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1200&auto=format&fit=crop",
    features: [
        { name: "Holographic FaceTime", description: "Experience calls in stunning 3D, bringing your loved ones right into the room." },
        { name: "Aura-Sync Glass", description: "The chassis subtly shifts color to match your mood, notifications, or music." },
        { name: "Neural-Link Editing", description: "Intuitively edit photos and videos with just a thought. It's magic." },
    ]
};

const GiftBox: React.FC<{ onUnwrap: () => void }> = ({ onUnwrap }) => (
    <motion.div
        key="giftbox"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        className="flex flex-col items-center text-center"
    >
        <h3 className="text-3xl font-bold mb-2 text-white">A Special Gift For You</h3>
        <p className="text-brand-text/80 mb-6">Click the box to unwrap it!</p>
        <motion.div
            onClick={onUnwrap}
            className="relative w-48 h-48 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            role="button"
            aria-label="Unwrap the gift"
        >
            <motion.div
                className="absolute top-0 w-52 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-t-lg shadow-lg z-10"
                style={{ left: '-16px' }}
                aria-hidden="true"
            >
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-8 h-20 bg-pink-300 rounded-full transform -skew-x-12" />
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-8 h-20 bg-red-300 rounded-full transform skew-x-12" />
            </motion.div>
            <div
                className="absolute bottom-0 w-full h-3/4 bg-gradient-to-r from-pink-500 to-red-500 rounded-b-lg shadow-lg"
                aria-hidden="true"
            />
            <div
                className="absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-full bg-red-400"
                aria-hidden="true"
            />
        </motion.div>
    </motion.div>
);


const SecretMessage: React.FC<SecretMessageProps> = ({ isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useFocusTrap(modalRef, isOpen);

    const [isRevealed, setIsRevealed] = useState(false);

    // Reset the component state when the modal is closed
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setIsRevealed(false);
            }, 300); // Allow exit animation to complete before reset
            return () => clearTimeout(timer);
        }
    }, [isOpen]);
    
    // Add keyboard listener for closing the modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);


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
                        className="relative bg-gradient-to-br from-[#1d1747] to-brand-surface w-full max-w-4xl p-8 md:p-12 rounded-2xl shadow-2xl border border-white/10"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-4xl text-white/50 hover:text-white transition-colors z-20" aria-label="Close message">&times;</button>
                        
                        <div className="min-h-[450px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {!isRevealed ? (
                                    <GiftBox onUnwrap={() => setIsRevealed(true)} />
                                ) : (
                                    <motion.div
                                        key="gift-content"
                                        className="grid md:grid-cols-2 gap-8 items-center w-full"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 }}
                                    >
                                        <motion.div className="flex items-center justify-center">
                                            <div className="relative animate-pulsate-slow" style={{filter: 'drop-shadow(0 0 1.5rem rgba(233, 69, 96, 0.5))'}}>
                                                 <img src={staticGift.imageUrl} alt={`Image of ${staticGift.name}`} className="w-full max-w-xs h-auto object-contain rounded-2xl" />
                                            </div>
                                        </motion.div>
                                        
                                        <motion.div>
                                            <h3 className="text-4xl font-bold font-serif text-brand-accent mb-3">{staticGift.name}</h3>
                                            <p className="text-brand-text/80 mb-6">{staticGift.description}</p>
                                            <ul className="space-y-4">
                                                {staticGift.features.map(feature => (
                                                    <li key={feature.name} className="border-l-2 border-brand-primary/50 pl-4">
                                                        <strong className="text-white block">{feature.name}</strong>
                                                        <span className="text-brand-text/70">{feature.description}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SecretMessage;


import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from './shared/useFocusTrap.ts';

interface SecretMessageProps {
  isOpen: boolean;
  onClose: () => void;
}

const staticGift = {
    name: "The Starlight Projector",
    description: "Turns any room into a breathtaking galaxy, perfect for creating a magical and relaxing atmosphere.",
    imageUrl: "https://images.unsplash.com/photo-1519638831568-d9897f54ed69?q=80&w=1200&auto=format&fit=crop",
    features: [
        { name: "Cosmic Ambiance", description: "Projects a realistic starry night sky onto your walls and ceiling." },
        { name: "Multiple Modes", description: "Choose from different color combinations and dazzling effects." },
        { name: "Soothing Sounds", description: "Connect via Bluetooth to play your favorite relaxing music." },
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
                        className="relative bg-gradient-to-br from-[#1d1747] to-brand-surface w-full max-w-2xl p-8 rounded-2xl shadow-2xl border border-white/10"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-4xl text-white/50 hover:text-white transition-colors z-20" aria-label="Close message">&times;</button>
                        
                        <div className="min-h-[400px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {!isRevealed ? (
                                    <GiftBox onUnwrap={() => setIsRevealed(true)} />
                                ) : (
                                    <motion.div
                                        key="gift-content"
                                        className="grid md:grid-cols-2 gap-8 items-center w-full"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <img src={staticGift.imageUrl} alt={`Image of ${staticGift.name}`} className="w-full h-auto object-cover rounded-lg shadow-2xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold text-brand-accent mb-2">{staticGift.name}</h3>
                                            <p className="text-brand-text/80 mb-4 italic">{staticGift.description}</p>
                                            <ul className="space-y-2">
                                                {staticGift.features.map(feature => (
                                                    <li key={feature.name}>
                                                        <strong className="text-white">{feature.name}:</strong>
                                                        <span className="text-brand-text/70 ml-2">{feature.description}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
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

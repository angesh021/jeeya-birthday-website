
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from './shared/useFocusTrap.ts';
import { getGiftConcept, getGiftImage, type GiftConcept } from '../services/giftService.ts';

interface SecretMessageProps {
  isOpen: boolean;
  onClose: () => void;
}

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

    const [isUnwrapped, setIsUnwrapped] = useState(false);
    const [giftConcept, setGiftConcept] = useState<GiftConcept | null>(null);
    const [giftImageUrl, setGiftImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isImageLoading, setIsImageLoading] = useState(false);

    const resetState = useCallback(() => {
        setIsUnwrapped(false);
        setGiftConcept(null);
        setGiftImageUrl(null);
        setIsLoading(false);
        setError(null);
        setIsImageLoading(false);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                resetState();
            }, 300); // Allow exit animation
            return () => clearTimeout(timer);
        }
    }, [isOpen, resetState]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const fetchGift = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const concept = await getGiftConcept();
            setGiftConcept(concept);

            setIsImageLoading(true);
            const imagePrompt = `${concept.name}: ${concept.description}`;
            const imageResult = await getGiftImage(imagePrompt);
            setGiftImageUrl(imageResult.imageUrl);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setIsImageLoading(false);
        }
    };
    
    const handleUnwrap = () => {
        setIsUnwrapped(true);
        fetchGift();
    };
    
    const handleRetry = () => {
        setError(null);
        fetchGift();
    };

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
                                {!isUnwrapped && (
                                    <GiftBox onUnwrap={handleUnwrap} />
                                )}

                                {isUnwrapped && isLoading && (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center gap-4 text-center"
                                    >
                                        <div className="relative w-20 h-20">
                                            <motion.div
                                                className="absolute inset-0 border-4 border-brand-primary rounded-full"
                                                animate={{
                                                    scale: [1, 1.3, 1],
                                                    opacity: [0.5, 1, 0.5],
                                                    rotate: [0, 180, 360],
                                                }}
                                                transition={{
                                                    duration: 2.5,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                }}
                                            />
                                            <motion.div
                                                className="absolute inset-4 border-2 border-brand-accent rounded-full"
                                                animate={{
                                                    scale: [1, 0.7, 1],
                                                    opacity: [1, 0.5, 1],
                                                    rotate: [360, 180, 0],
                                                }}
                                                transition={{
                                                    duration: 2.5,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                }}
                                            />
                                            <motion.div
                                                className="absolute inset-8 bg-white rounded-full"
                                                animate={{
                                                    scale: [1, 1.5, 1],
                                                }}
                                                transition={{
                                                    duration: 1.25,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                }}
                                            />
                                        </div>
                                        <p className="text-brand-text/80 font-serif mt-4">Unwrapping your surprise...</p>
                                    </motion.div>
                                )}

                                {isUnwrapped && error && (
                                     <motion.div key="error" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-center">
                                        <p className="text-red-400 mb-4">{error}</p>
                                        <button onClick={handleRetry} className="px-6 py-2 bg-brand-secondary text-white font-bold rounded-full transform hover:scale-105 transition-transform">
                                            Try Again
                                        </button>
                                     </motion.div>
                                )}

                                {isUnwrapped && !isLoading && !error && giftConcept && (
                                    <motion.div
                                        key="gift-content"
                                        className="grid md:grid-cols-2 gap-8 items-center w-full"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            {isImageLoading ? (
                                                <div className="w-full aspect-square bg-white/5 rounded-lg animate-pulse" />
                                            ) : giftImageUrl ? (
                                                <img src={giftImageUrl} alt={`Image of ${giftConcept.name}`} className="w-full h-auto object-cover rounded-lg shadow-2xl" />
                                            ) : (
                                                <div className="w-full aspect-square bg-white/5 rounded-lg flex items-center justify-center text-brand-text/50">Image not available</div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold text-brand-accent mb-2">{giftConcept.name}</h3>
                                            <p className="text-brand-text/80 mb-4 italic">{giftConcept.description}</p>
                                            <ul className="space-y-2">
                                                {giftConcept.features.map(feature => (
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

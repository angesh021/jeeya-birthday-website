
import React, { useState, useEffect } from 'react';
import { motion, type MotionProps } from 'framer-motion';

const Blob: React.FC<{ className: string; gradient: string; animate: MotionProps['animate']; transition: MotionProps['transition'] }> = ({ className, gradient, animate, transition }) => (
    <motion.div
        className={`absolute rounded-full filter blur-2xl opacity-50 md:opacity-70 ${className}`}
        style={{ background: gradient }}
        initial={{ scale: 1, rotate: 0 }}
        animate={animate}
        transition={transition}
    />
);

const Plus: React.FC<{ className: string; animate: MotionProps['animate']; transition: MotionProps['transition'] }> = ({ className, animate, transition }) => (
    <motion.div
        className={`absolute text-brand-secondary text-2xl font-thin select-none ${className}`}
        initial={{ opacity: 0 }}
        animate={animate}
        transition={transition}
    >
        +
    </motion.div>
);

const phrases = [
    "Happy Sweet 16, Jeeya!",
    "A new chapter begins.",
    "Time to celebrate you!",
    "Sixteen candles, endless wishes"
];

const Hero: React.FC = () => {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    
    useEffect(() => {
        let timeoutId: number;
        const currentPhrase = phrases[phraseIndex];
        const typingSpeed = 100;
        const deletingSpeed = 50;
        const pauseDuration = 2000;

        // Logic to handle typing and deleting
        if (isDeleting) {
            if (typedText.length > 0) {
                timeoutId = window.setTimeout(() => {
                    setTypedText(current => current.slice(0, -1));
                }, deletingSpeed);
            } else {
                setIsDeleting(false);
                setPhraseIndex(prev => (prev + 1) % phrases.length);
            }
        } else {
            if (typedText.length < currentPhrase.length) {
                timeoutId = window.setTimeout(() => {
                    setTypedText(current => currentPhrase.substring(0, current.length + 1));
                }, typingSpeed);
            } else {
                timeoutId = window.setTimeout(() => {
                    setIsDeleting(true);
                }, pauseDuration);
            }
        }

        return () => clearTimeout(timeoutId);
    }, [typedText, isDeleting, phraseIndex]);


    return (
        <div className="h-screen w-full flex flex-col items-center justify-center text-center relative overflow-hidden bg-brand-background">
            {/* Background Blobs */}
            <Blob
                className="w-96 h-96 top-[-150px] left-[-150px]"
                gradient="linear-gradient(to right, #8e2de2, #4a00e0)"
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />
            <Blob
                className="w-80 h-80 bottom-[-100px] right-[-100px]"
                gradient="linear-gradient(to right, #e94560, #ff7675)"
                animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear', delay: 5 }}
            />
             <Blob
                className="w-60 h-60 bottom-[20%] left-[10%] hidden md:block"
                gradient="linear-gradient(to right, #00c9ff, #92fe9d)"
                animate={{ y: [0, -20, 0], x: [0, 20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
            />
             <Blob // New small blob
                className="w-40 h-40 top-[10%] right-[5%]"
                gradient="linear-gradient(to right, #fdcb6e, #ff7675)"
                animate={{ y: [0, 15, 0], x: [0, -15, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
            />
            <Blob // New small blob
                className="w-32 h-32 bottom-[5%] left-[5%]"
                gradient="linear-gradient(to right, #a29bfe, #81ecec)"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Giant 16 in the background */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center z-0"
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <p className="font-black text-[28rem] md:text-[40rem] text-white/5 select-none font-sans">
                    16
                </p>
            </motion.div>

            {/* Decorative Elements */}
            <Plus className="top-[20%] left-[15%]" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} />
            <Plus className="top-[50%] right-[10%]" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 3 }} />
            <Plus className="bottom-[15%] left-[30%]" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 2 }} />
            
            <motion.svg className="absolute w-full h-full text-white/10" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <motion.path
                    d="M 10,90 C 20,10 80,90 90,10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 4, ease: 'easeInOut', delay: 1 }}
                 />
            </motion.svg>

            <div className="relative z-10 flex flex-col items-center justify-center space-y-6 md:space-y-8">
                <div className="h-20 sm:h-24 flex items-center justify-center">
                    <h1 className="text-4xl sm:text-5xl font-black text-white text-center" aria-live="polite">
                        <span>{typedText}</span>
                        <motion.span
                            key="cursor"
                            className="inline-block w-1 h-10 sm:h-12 bg-brand-primary ml-2 align-middle"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        />
                    </h1>
                </div>
                
                <motion.div
                    className="relative w-64 h-64 md:w-80 md:h-80"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                >
                    <div 
                        className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-secondary transform scale-110"
                        style={{
                           borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                           animation: 'morph 8s ease-in-out infinite'
                        }}
                    />
                    <div 
                         className="relative w-full h-full overflow-hidden shadow-2xl"
                         style={{ borderRadius: '58% 42% 38% 62% / 63% 40% 60% 37%', animation: 'morph 8s ease-in-out infinite reverse' }}
                    >
                        <img
                            src="https://6utr15bvp7cgy83c.public.blob.vercel-storage.com/jeeya-portrait.jpg"
                            alt="Portrait of the birthday girl"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </motion.div>
                
                <motion.p
                    className="font-serif text-brand-text/70 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                >
                    July 25, 2009
                </motion.p>

            </div>
            
            <style>
            {`
                @keyframes morph {
                    0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                }
            `}
            </style>
        </div>
    );
};

export default Hero;

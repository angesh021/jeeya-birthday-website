
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateBirthdayPoem } from '../services/geminiService.ts';

// New component for the loading animation
const MagicalQuillLoading: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
        <div className="relative w-24 h-24">
            {/* Quill Body */}
            <motion.svg 
                className="absolute w-full h-full"
                viewBox="0 0 100 100"
                initial={{ rotate: -15, x: 20 }}
                animate={{ 
                    rotate: [-15, -5, -20, -10, -15],
                    x: [20, 10, 25, 15, 20],
                    y: [0, -10, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
                <path d="M 80 20 Q 50 40 40 70 L 35 75 Q 45 60 70 30 Z" fill="#f0f0f0" />
                <path d="M 40 70 L 35 75 L 30 70" stroke="#f0f0f0" strokeWidth="2" fill="none" />
                <line x1="40" y1="70" x2="60" y2="50" stroke="#f0f0f0" strokeWidth="1" />
                <line x1="45" y1="65" x2="65" y2="45" stroke="#f0f0f0" strokeWidth="1" />
                <line x1="50" y1="60" x2="70" y2="40" stroke="#f0f0f0" strokeWidth="1" />
            </motion.svg>
            {/* Sparkles */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-brand-accent rounded-full"
                    style={{
                        left: `${25 + Math.random() * 10}%`,
                        top: `${65 + Math.random() * 10}%`,
                        width: `${Math.random() * 6 + 2}px`,
                        height: `${Math.random() * 6 + 2}px`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3
                    }}
                />
            ))}
        </div>
        <p className="text-brand-text/80 font-serif italic">The muse is composing a verse...</p>
    </div>
);

const PoemGenerator: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [poem, setPoem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!keyword.trim() || isLoading) return;
    setIsLoading(true);
    setError('');
    setPoem('');

    try {
        const poemText = await generateBirthdayPoem(keyword);
        setPoem(poemText);
    } catch (err) {
        console.error('Poem generation error:', err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        if (errorMessage.includes('Failed to fetch')) {
             setError("Could not connect to the AI poet. Please ensure the local development server (`vercel dev`) is running and try again.");
        } else {
             setError(errorMessage);
        }
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleGenerate();
    }
  }
  
  const handleReset = () => {
      setPoem('');
      setKeyword('');
      setError('');
  }
  
  const poemLines = poem.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="py-16 text-center">
      <motion.h2 
        className="text-4xl md:text-6xl font-bold text-center mb-4"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        AI Birthday Poem
      </motion.h2>
      <motion.p 
        className="text-brand-text/80 mb-12 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Enter a word that reminds you of Jeeya (e.g., "laughter", "stars", "dreams") and let our magical AI conjure a poem just for her.
      </motion.p>
      
      <div className="w-full max-w-2xl mx-auto bg-brand-surface/50 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-2xl border border-white/10">
        <AnimatePresence mode="wait">
            {poem ? (
                <motion.div key="poem-result">
                    <motion.div 
                        className="bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] p-8 rounded-lg shadow-inner max-w-2xl mx-auto border border-black/10 text-gray-800"
                        initial={{ opacity: 0, scale: 0.9, rotateX: -20 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{ transformOrigin: 'top' }}
                    >
                         <motion.div 
                            initial="hidden"
                            animate="visible"
                            transition={{ staggerChildren: 0.3 }}
                         >
                            {poemLines.map((line, index) => (
                                <motion.p 
                                    key={index}
                                    className="text-lg md:text-xl whitespace-pre-wrap leading-relaxed text-center font-serif mb-4"
                                    variants={{
                                        hidden: { opacity: 0, y: 10 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                >
                                    {line}
                                </motion.p>
                            ))}
                         </motion.div>
                    </motion.div>
                    <motion.button
                        key="reset-button"
                        onClick={handleReset}
                        className="mt-8 bg-brand-accent text-brand-background font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        Write Another
                    </motion.button>
                </motion.div>
            ) : (
                <motion.div 
                    key="poem-input"
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center min-h-[250px] justify-center"
                >
                    {isLoading ? (
                        <MagicalQuillLoading />
                    ) : error ? (
                         <div className="text-red-400 bg-red-900/20 p-4 rounded-md text-center">
                            <p className="font-bold mb-2">Oh no, a writer's block!</p>
                            <p className="text-sm">{error}</p>
                         </div>
                    ) : (
                        <div className="w-full max-w-md">
                            <div className="relative">
                                <input
                                  type="text"
                                  value={keyword}
                                  onChange={(e) => setKeyword(e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  placeholder="Enter a keyword..."
                                  className="w-full bg-brand-background/50 p-4 rounded-full border-2 border-transparent focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition px-6 text-lg"
                                />
                            </div>
                             <button
                              onClick={handleGenerate}
                              disabled={isLoading || !keyword.trim()}
                              className="mt-6 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-12 rounded-full disabled:opacity-50 transition-all transform hover:scale-105 text-lg"
                            >
                              Conjure a Poem
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PoemGenerator;

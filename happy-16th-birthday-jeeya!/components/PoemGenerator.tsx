
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateBirthdayPoem } from '../services/geminiService.ts';

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
        className="text-brand-text/80 mb-8 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Enter a word that reminds you of Jeeya (e.g., "laughter", "stars", "dreams") and let our magical AI write a poem just for her.
      </motion.p>

      <div className="flex justify-center gap-2 max-w-md mx-auto">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a keyword..."
          className="w-full bg-brand-surface p-3 rounded-full border border-white/20 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition px-6"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !keyword.trim()}
          className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-8 rounded-full disabled:opacity-50 transition-all transform hover:scale-105"
        >
          {isLoading ? 'Writing...' : 'Generate'}
        </button>
      </div>

      <div className="mt-12 min-h-[200px] flex items-center justify-center">
        {isLoading && (
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-brand-primary"></div>
                <p className="text-brand-text/70">The muse is thinking...</p>
            </div>
        )}
        {error && <p className="text-red-400 bg-red-900/20 p-4 rounded-md">{error}</p>}
        {poem && (
          <motion.div 
            className="bg-brand-surface/50 p-8 rounded-lg shadow-xl max-w-2xl mx-auto border border-white/10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-lg whitespace-pre-wrap leading-relaxed text-center font-serif text-brand-text">
                {poem}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PoemGenerator;

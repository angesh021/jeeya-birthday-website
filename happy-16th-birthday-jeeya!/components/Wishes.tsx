
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Wish } from '../constants.tsx';
import { initialWishes } from '../constants.tsx';
import * as wishService from '../services/wishService.ts';

const WishCard: React.FC<{ wish: Wish }> = ({ wish }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      className="bg-brand-surface p-6 rounded-lg shadow-lg border border-white/10"
    >
      <p className="text-brand-text/90 mb-2">"{wish.message}"</p>
      <p className="text-right font-bold text-brand-secondary">- {wish.name}</p>
    </motion.div>
  );
};

const Wishes: React.FC = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchWishes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const fetchedWishes = await wishService.getWishes();
        setWishes(fetchedWishes.length > 0 ? fetchedWishes : initialWishes);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Could not fetch wishes.';
        setError(errorMessage);
        setWishes(initialWishes);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    
    const optimisticWish: Wish = {
      id: `optimistic-${Date.now()}`,
      name,
      message,
    };
    setWishes(prevWishes => [optimisticWish, ...prevWishes]);
    
    const currentName = name;
    const currentMessage = message;
    setName('');
    setMessage('');
    
    try {
      const newWish = await wishService.addWish({ name: currentName, message: currentMessage });
      setWishes(prevWishes => prevWishes.map(w => w.id === optimisticWish.id ? newWish : w));
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred while sending your wish.';
        setSubmitError(errorMsg);
        setWishes(prevWishes => prevWishes.filter(w => w.id !== optimisticWish.id));
        setName(currentName);
        setMessage(currentMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16">
      <motion.h2 
        className="text-4xl md:text-6xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Birthday Wishes
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-3xl font-bold mb-4">Leave a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-text/80 mb-1">Your Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Your Bestie"
                className="w-full bg-brand-background p-3 rounded-md border border-white/20 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-brand-text/80 mb-1">Your Wish</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Share a happy memory or a wish for the future..."
                className="w-full bg-brand-background p-3 rounded-md border border-white/20 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition"
                required
              />
            </div>
             {submitError && <p className="text-red-500 text-sm text-center">{submitError}</p>}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-full disabled:opacity-50 transition-all transform hover:scale-105"
            >
              {isSubmitting ? 'Sending...' : 'Send Your Wish'}
            </button>
          </form>
        </motion.div>

        <div className="space-y-6">
            {isLoading && <p className="text-center text-brand-text/70">Loading wishes...</p>}
            {error && !isLoading && <p className="text-center text-red-400 bg-red-900/20 p-3 rounded-md">{error}</p>}
            {!isLoading && !error && wishes.length === 0 && <p className="text-center text-brand-text/70">Be the first to leave a wish!</p>}
            <AnimatePresence>
                {wishes.map((wish) => (
                <WishCard key={wish.id} wish={wish} />
                ))}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Wishes;

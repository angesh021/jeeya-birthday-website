
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Wish } from '../constants.tsx';
import * as wishService from '../services/wishService.ts';

const QuoteIcon: React.FC = () => (
    <svg className="w-24 h-24 text-brand-accent/10 absolute -top-8 -left-8 transform rotate-[-15deg] pointer-events-none" fill="currentColor" viewBox="0 0 448 512" aria-hidden="true">
        <path d="M448 296c0 66.3-53.7 120-120 120h-8c-17.7 0-32-14.3-32-32s14.3-32 32-32h8c30.9 0 56-25.1 56-56v-8H320c-35.3 0-64-28.7-64-64V128c0-35.3 28.7-64 64-64h96c35.3 0 64 28.7 64 64v168zm-256 0c0 66.3-53.7 120-120 120H64c-17.7 0-32-14.3-32-32s14.3-32 32-32h8c30.9 0 56-25.1 56-56v-8H64c-35.3 0-64-28.7-64-64V128c0-35.3 28.7-64 64-64h96c35.3 0 64 28.7 64 64v168z"/>
    </svg>
);


const WishCard: React.FC<{ wish: Wish }> = ({ wish }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="bg-gradient-to-br from-brand-surface to-[#2a215a] p-6 rounded-xl shadow-lg border border-white/10 break-inside-avoid relative overflow-hidden"
    >
      <QuoteIcon />
      <p className="font-serif text-lg text-brand-text/90 mb-4 z-10 relative">"{wish.message}"</p>
      <p className="text-right font-script text-2xl text-brand-secondary">- {wish.name}</p>
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
        setWishes(fetchedWishes);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Could not fetch wishes.';
        setError(errorMessage);
        setWishes([]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmitting) {
        return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
        const newWish = await wishService.addWish({ name, message });
        setWishes(prevWishes => [newWish, ...prevWishes]);
        setName('');
        setMessage('');
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred while sending your wish.';
        setSubmitError(errorMsg);
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

      <div className="grid md:grid-cols-12 gap-12 items-start">
        <motion.div 
            className="md:col-span-5 lg:col-span-4"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-brand-surface/70 p-8 rounded-xl sticky top-24">
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
                  placeholder="Share a happy memory or a wish..."
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
          </div>
        </motion.div>

        <div className="md:col-span-7 lg:col-span-8">
            {isLoading && <p className="text-center text-brand-text/70">Loading wishes from across the universe...</p>}
            {error && !isLoading && <p className="text-center text-red-400 bg-red-900/20 p-3 rounded-md">{error}</p>}
            {!isLoading && !error && wishes.length === 0 && <p className="text-center text-brand-text/70">Be the first to leave a wish!</p>}
            
            <div className="columns-1 sm:columns-2 gap-6 space-y-6">
                <AnimatePresence>
                    {wishes.map((wish) => (
                        <WishCard key={wish.id} wish={wish} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Wishes;

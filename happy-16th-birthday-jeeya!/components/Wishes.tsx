
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Wish } from '../constants.tsx';
import { demoWishes } from '../constants.tsx';
import * as wishService from '../services/wishService.ts';

declare global {
    interface Window {
        confetti: (options: any) => void;
    }
}

const Avatar: React.FC<{ name: string }> = ({ name }) => {
    const initials = (name || 'G').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    const colors = ['bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-teal-500', 'bg-orange-500'];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
    const color = colors[colorIndex];
    return (
        <div className={`w-10 h-10 rounded-full ${color} flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md`}>
            {initials}
        </div>
    );
};

const WishCard: React.FC<{ wish: Wish; onLike: (id: string) => void; }> = ({ wish, onLike }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [particles, setParticles] = useState<{id: number}[]>([]);

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLiked) return;
        setIsLiked(true);
        onLike(wish.id);
        
        const newParticles = Array.from({ length: 10 }).map(() => ({ id: Math.random() }));
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 1000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="mb-8 p-px bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-brand-primary/20 hover:!opacity-100 group"
            style={{ breakInside: 'avoid' }}
        >
            <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="bg-brand-surface/70 backdrop-blur-xl p-6 rounded-[15px] h-full flex flex-col"
            >
                <p className="text-brand-text/90 flex-grow mb-6 font-serif italic break-words">"{wish.message}"</p>
                <div className="flex items-center justify-between gap-2 mt-auto pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <Avatar name={wish.name} />
                        <span className="font-bold text-sm text-brand-text truncate">{wish.name}</span>
                    </div>
                    <div className="relative flex items-center gap-2">
                         <AnimatePresence>
                            {particles.map(p => (
                                <motion.div
                                    key={p.id}
                                    className="absolute bottom-0 right-2 text-brand-primary"
                                    initial={{ y: 0, opacity: 1, scale: 0.5 }}
                                    animate={{ y: -50, x: (Math.random() - 0.5) * 30, scale: Math.random() * 0.5 + 0.8, opacity: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <button onClick={handleLike} className="flex items-center gap-1.5" aria-label={`Like wish from ${wish.name}`}>
                            <motion.svg 
                                className={`w-5 h-5 transition-colors ${isLiked ? 'text-brand-primary' : 'text-brand-text/50 group-hover:text-brand-primary/80'}`} 
                                viewBox="0 0 24 24" 
                                fill={isLiked ? "currentColor" : "none"} 
                                stroke="currentColor" 
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </motion.svg>
                            <span className={`font-semibold text-sm transition-colors ${isLiked ? 'text-brand-primary' : 'text-brand-text/70'}`}>
                                {wish.likes || 0}
                            </span>
                        </button>
                    </div>
                </div>
            </motion.div>
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
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const isDemoMode = error === 'DEMO_MODE';

  const fetchWishes = useCallback(async (isPoll = false) => {
    if (!isPoll) setIsLoading(true);
    setError(null);
    try {
        const fetchedWishes = await wishService.getWishes();
        setWishes(fetchedWishes);
    } catch (err) {
        if (!isPoll) {
             const errorMessage = err instanceof Error ? err.message : 'Could not fetch wishes.';
            if (errorMessage.includes('not configured') || errorMessage.includes('missing')) {
                setError('DEMO_MODE');
                setWishes(demoWishes);
            } else {
                setError(errorMessage);
                setWishes([]);
            }
        }
    } finally {
        if (!isPoll) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  // Polling for new wishes
  useEffect(() => {
    const interval = setInterval(() => {
        if (!document.hidden && !isSubmitting) {
            fetchWishes(true);
        }
    }, 15000);
    return () => clearInterval(interval);
  }, [isSubmitting, fetchWishes]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
        const newWish = await wishService.addWish({ name, message });
        setWishes(prevWishes => [newWish, ...prevWishes]);
        if (typeof window.confetti === 'function' && submitButtonRef.current) {
            const rect = submitButtonRef.current.getBoundingClientRect();
            window.confetti({
                particleCount: 150, spread: 70,
                origin: { 
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight,
                },
                colors: ['#e94560', '#ff7675', '#fdcb6e', '#f0f0f0']
            });
        }
        setName('');
        setMessage('');
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An error occurred while sending your wish.';
        setSubmitError(errorMsg);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleLike = useCallback(async (id: string) => {
        setWishes(prev => prev.map(w => w.id === id ? {...w, likes: (w.likes || 0) + 1} : w));
        try {
            await wishService.likeWish(id);
        } catch (error) {
            console.error("Failed to like wish:", error);
            setWishes(prev => prev.map(w => w.id === id ? {...w, likes: (w.likes || 0) - 1} : w));
        }
    }, []);

  return (
    <div className="py-16">
      <motion.h2 
        className="text-4xl md:text-6xl font-bold text-center mb-12"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Wishes From The Heart
      </motion.h2>

      <div className="flex flex-col items-center gap-12 w-full max-w-5xl mx-auto">
        <motion.div
            className="w-full max-w-2xl px-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-brand-surface/80 to-brand-surface/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/10">
            <h3 className="text-3xl font-bold mb-4 font-serif text-brand-accent">Leave a Message</h3>
            
            <fieldset disabled={isSubmitting || isLoading || isDemoMode} className="group">
                {isDemoMode && (
                    <div className="text-center bg-brand-accent/10 p-3 rounded-lg mb-4 border border-brand-accent/30">
                        <p className="font-bold text-brand-accent text-sm">Demo Mode</p>
                        <p className="text-xs text-brand-text/80">Connect Vercel KV to enable live wishes.</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="w-full bg-brand-background/50 p-3 rounded-md border border-white/20 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition disabled:opacity-50" required />
                  </div>
                  <div>
                    <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Share a happy memory or a wish..." className="w-full bg-brand-background/50 p-3 rounded-md border border-white/20 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition disabled:opacity-50" required />
                  </div>
                  {submitError && <p className="text-red-400 text-sm text-center">{submitError}</p>}
                  <button ref={submitButtonRef} type="submit" className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-full disabled:opacity-50 transition-all transform group-enabled:hover:scale-105 group-enabled:hover:shadow-lg group-enabled:hover:shadow-brand-primary/20">
                    {isSubmitting ? 'Sending...' : 'Send Your Wish'}
                  </button>
                </form>
            </fieldset>
          </div>
        </motion.div>

        <div className="w-full mt-8">
            {isLoading && <p className="text-center text-brand-text/70">Loading wishes from across the universe...</p>}
            {error && !isDemoMode && !isLoading && <p className="text-center text-red-400 bg-red-900/20 p-3 rounded-md">{error}</p>}
            
            {wishes.length > 0 && (
                <div className="w-full" style={{
                    columnCount: 1,
                    columnGap: '2rem',
                }}>
                     <div className="md:columns-2 lg:columns-3 gap-8">
                        {wishes.map((wish) => (
                            <WishCard key={wish.id} wish={wish} onLike={handleLike} />
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Wishes;

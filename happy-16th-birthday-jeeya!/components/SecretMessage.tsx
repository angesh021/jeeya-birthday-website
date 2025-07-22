
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from './shared/useFocusTrap.ts';

interface SecretMessageProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecretMessage: React.FC<SecretMessageProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
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
            aria-labelledby="secret-message-title"
            className="bg-gradient-to-br from-brand-surface to-[#2a215a] p-8 md:p-12 rounded-2xl w-full max-w-2xl relative shadow-2xl border border-brand-accent/30"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0, transition: { type: 'spring', damping: 15 } }}
            exit={{ scale: 0.8, y: 50, transition: { duration: 0.2 } }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-3xl text-white/70 hover:text-white transition-colors">&times;</button>
            <h2 id="secret-message-title" className="font-script text-4xl md:text-5xl text-brand-accent mb-6 text-center">A Message For You, Jeeya</h2>
            <div className="text-lg md:text-xl text-brand-text/90 leading-relaxed space-y-4 text-center">
              <p>
                Sixteen years ago, you brought an incredible light into our lives, and it has only shone brighter with each passing day. Watching you grow into the smart, kind, and wonderfully unique person you are has been the greatest gift.
              </p>
              <p>
                This year is a special milestone, a bridge between the sweet memories of yesterday and the exciting adventures of tomorrow. Embrace every moment, chase every dream, and never forget how much you are loved.
              </p>
              <p className="font-bold text-brand-secondary">
                Happy Sweet 16! Here's to you and the amazing future that awaits.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SecretMessage;

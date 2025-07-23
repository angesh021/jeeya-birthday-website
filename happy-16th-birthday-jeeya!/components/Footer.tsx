import React from 'react';
import { StarIcon } from '../constants.tsx';

interface FooterProps {
  onSecretClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onSecretClick }) => {
  return (
    <footer className="text-center p-8 pb-28 md:pb-8 text-brand-text/60 relative">
      <p>Made with ❤️ for the best 16-year-old in the universe.</p>
      <p>&copy; {new Date().getFullYear()} Jeeya's Birthday Crew</p>

      {/* Secret message button integrated into the footer flow */}
      <div className="mt-6">
         <button 
            onClick={onSecretClick}
            className="inline-flex items-center gap-2 text-brand-accent/80 hover:text-brand-accent transition-colors duration-300 group"
            aria-label="A special message"
          >
            <div className="p-2 bg-brand-accent/10 group-hover:bg-brand-accent/20 rounded-full transition-colors duration-300">
              <StarIcon />
            </div>
            <span className="font-serif">Psst... there's a secret message!</span>
          </button>
      </div>
    </footer>
  );
};

export default Footer;
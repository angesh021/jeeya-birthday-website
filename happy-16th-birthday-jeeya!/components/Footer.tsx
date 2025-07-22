import React from 'react';
import { StarIcon } from '../constants.tsx';

interface FooterProps {
  onSecretClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onSecretClick }) => {
  return (
    <footer className="text-center p-8 text-brand-text/60 relative">
      <div className="hidden md:block absolute bottom-8 right-8">
         <button 
            onClick={onSecretClick}
            className="p-4 bg-brand-accent/20 hover:bg-brand-accent/40 rounded-full transition-colors animate-pulsate-slow"
            aria-label="A special message"
          >
            <StarIcon />
          </button>
      </div>
      <p>Made with ❤️ for the best 16-year-old in the universe.</p>
      <p>&copy; {new Date().getFullYear()} Jeeya's Birthday Crew</p>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  onInView: (id: string) => void;
}

const Section: React.FC<SectionProps> = ({ id, className = '', children, onInView }) => {
  return (
    <motion.section
      id={id}
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 relative ${className}`}
      onViewportEnter={() => onInView(id)}
    >
      <div className="w-full max-w-5xl mx-auto">
        {children}
      </div>
    </motion.section>
  );
};

export default Section;

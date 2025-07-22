
import React, { useRef } from 'react';
import { motion, useScroll, useSpring, type Variants } from 'framer-motion';
import { timelineEvents, type TimelineEvent as TimelineEventType } from '../constants.tsx';

// A single event in the timeline
const TimelineEvent: React.FC<{ event: TimelineEventType; index: number }> = ({ event, index }) => {
  const isEven = index % 2 === 0;

  // Stagger animation for the content inside the card
  const cardContentVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 12 },
    },
  };
  
  // The main container for the entire timeline event row, which handles the 3D rotation
  return (
    <motion.div
      className="flex items-center w-full mb-8"
      style={{
        transformOrigin: isEven ? 'right' : 'left', // Set origin for 3D rotation
      }}
      initial={{ opacity: 0, x: isEven ? -50 : 50, rotateY: 45 }}
      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`flex w-full items-center ${isEven ? 'flex-row-reverse' : ''}`}>
        {/* Card container with hover effect */}
        <div className="w-5/12">
          <motion.div
            variants={cardContentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            whileHover={{ scale: 1.05, y: -8, boxShadow: '0 15px 30px rgba(233, 69, 96, 0.2)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            className={`p-6 rounded-xl shadow-lg bg-brand-surface/40 backdrop-blur-md border border-white/10 text-left cursor-pointer ${isEven ? 'md:text-right' : 'md:text-left'}`}
          >
            <motion.p variants={textVariants} className="text-xl font-bold text-brand-primary">{event.year}</motion.p>
            <motion.h3 variants={textVariants} className="text-2xl font-semibold mb-2">{event.title}</motion.h3>
            <motion.p variants={textVariants} className="text-brand-text/80">{event.description}</motion.p>
          </motion.div>
        </div>

        {/* Pulsating icon in the middle */}
        <div className="w-2/12 flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.4 }}
            className="z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], boxShadow: ['0 0 0px rgba(233, 69, 96, 0.4)', '0 0 20px rgba(233, 69, 96, 0.8)', '0 0 0px rgba(233, 69, 96, 0.4)'] }}
              transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
              className="bg-brand-primary text-white p-3 rounded-full shadow-lg"
            >
              {event.icon}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Spacer div */}
        <div className="w-5/12"></div>
      </div>
    </motion.div>
  );
};


// The main Timeline component
const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="py-16" ref={containerRef}>
      <motion.h2
        className="text-4xl md:text-6xl font-bold text-center mb-24"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        A Journey to Sixteen
      </motion.h2>

      {/* Container with perspective for 3D effect */}
      <div className="relative w-full max-w-4xl mx-auto" style={{ perspective: '1200px' }}>
        {/* The gradient timeline bar */}
        <motion.div
          className="absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-brand-secondary to-brand-primary origin-top"
          style={{ scaleY, translateX: '-50%' }}
        />
        <div className="relative">
          {timelineEvents.map((event, index) => (
            <TimelineEvent key={event.year} event={event} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;

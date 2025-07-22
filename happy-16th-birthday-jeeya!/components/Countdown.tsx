
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
    onFinish: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ onFinish }) => {
    const targetDate = useMemo(() => {
        const birthMonth = 6; 
        const birthDay = 25;
        const today = new Date();
        const currentYear = today.getFullYear();
        let nextBirthday = new Date(currentYear, birthMonth, birthDay);
        if (today.getTime() > nextBirthday.getTime()) {
            nextBirthday.setFullYear(currentYear + 1);
        }
        return nextBirthday;
    }, []);

    const calculateTimeLeft = useCallback(() => {
        const difference = +targetDate - +new Date();
        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }, [targetDate]);
    
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isFinished, setIsFinished] = useState(() => +targetDate <= +new Date());

    useEffect(() => {
        if (isFinished) {
            onFinish();
            return;
        }

        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            if (Object.values(newTimeLeft).every(v => v === 0)) {
                setIsFinished(true);
                onFinish();
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isFinished, onFinish, calculateTimeLeft]);

    const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <div className="text-4xl md:text-6xl font-bold text-white bg-white/10 p-3 rounded-lg w-20 md:w-28 text-center backdrop-blur-sm">
                {String(value).padStart(2, '0')}
            </div>
            <span className="mt-2 text-sm md:text-base text-brand-text/80 uppercase tracking-widest">{label}</span>
        </div>
    );

    return (
        <div className="text-center">
            <AnimatePresence mode="wait">
            {isFinished ? (
                 <motion.div
                    key="finished" 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                 >
                     <h3 className="font-script text-5xl md:text-7xl font-bold text-brand-accent animate-pulse">
                        Happy Birthday, Jeeya!
                     </h3>
                 </motion.div>
            ) : (
                <motion.div 
                    key="countdown"
                    className="flex justify-center items-center gap-2 md:gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <TimeUnit value={timeLeft.days} label="Days" />
                    <TimeUnit value={timeLeft.hours} label="Hours" />
                    <TimeUnit value={timeLeft.minutes} label="Minutes" />
                    <TimeUnit value={timeLeft.seconds} label="Seconds" />
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default Countdown;

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const MIN_LOADING_TIME = 3500; // Slightly longer for the majestic feel

export default function LoadingScreen() {
    const { i18n } = useTranslation();
    const isRtl = i18n.language === "ar";
    
    // Smooth progress simulation that naturally slows down near 100%
    const [progress, setProgress] = useState(0);
    const startTime = useRef(Date.now());
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const diff = 95 - prev;
                if (prev >= 95) return prev;
                return prev + diff * 0.1 + Math.random(); 
            });
        }, 300);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime.current;
            if (elapsed >= MIN_LOADING_TIME) {
                setProgress(100);
                clearInterval(timer);
            }
        }, 100);
        return () => clearInterval(timer);
    }, []);

    const messages = isRtl 
        ? ["نحضّر لك الفخامة...", "نجمع أجود المكونات...", "لحظات فقط المتبقية...", "مرحباً بك"] 
        : ["Preparing Luxury...", "Gathering the finest...", "Just a moment...", "Welcome"];

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [messages.length]);

    // SVG Circular Progress Constants
    const radius = 120; // Massive beautiful ring
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
            className="fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden bg-black" // Force a deep base
            dir={isRtl ? "rtl" : "ltr"}
        >
            {/* 1. The Deep Cinematic Canvas */}
            <div className="absolute inset-0 z-0">
                <motion.div 
                    initial={{ scale: 1.2, filter: "brightness(0.5) blur(5px)" }}
                    animate={{ scale: 1, filter: "brightness(0.8) blur(0px)" }}
                    transition={{ duration: 8, ease: "easeOut" }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/image.jpg')" }}
                />
                <div className="absolute inset-0 bg-black/50" />
                <div 
                    className="absolute inset-0"
                    style={{ background: `radial-gradient(circle at center, transparent 0%, var(--bg-main) 85%)` }}
                />
            </div>

            {/* 2. Sweeping Light Flares (Cinematic Elegance) */}
            <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen overflow-hidden">
                <motion.div 
                    animate={{ 
                        x: ['-50vw', '150vw'],
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] w-[80vw] h-[30vh] bg-primary/20 blur-[100px] rotate-[-25deg]"
                />
                <motion.div 
                    animate={{ 
                        x: ['150vw', '-50vw'],
                        opacity: [0, 0.3, 0]
                    }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[20%] w-[80vw] h-[40vh] bg-secondary/20 blur-[120px] rotate-15"
                />
            </div>

            {/* 3. The Grand Centerpiece (Majestic Halo & Glass Orb) */}
            <div className="relative z-10 w-[300px] h-[300px] flex items-center justify-center -mt-8">
                
                {/* SVG Majestic Halo */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(var(--color-primary),0.4)]" viewBox="0 0 280 280">
                    <defs>
                        <linearGradient id="haloGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-primary)" />
                            <stop offset="50%" stopColor="var(--color-secondary, #fff)" />
                            <stop offset="100%" stopColor="var(--color-primary)" />
                        </linearGradient>
                    </defs>
                    
                    {/* Background faint track */}
                    <circle 
                        cx="140" cy="140" r={radius} 
                        stroke="currentColor" strokeWidth="1" fill="none" 
                        className="text-primary/10" 
                    />
                    
                    {/* Animated Solid Sweep (the progress) */}
                    <motion.circle 
                        cx="140" cy="140" r={radius} 
                        stroke="url(#haloGlow)" 
                        strokeWidth="2.5" 
                        fill="none" 
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{ strokeDasharray: circumference }}
                    />
                    
                    {/* Inner Decorative Rotating Rings */}
                    <motion.circle 
                        cx="140" cy="140" r={radius - 12} 
                        stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 15"
                        fill="none" 
                        className="text-primary/40"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        style={{ originX: '140px', originY: '140px' }}
                    />
                    {/* Outer Decorative Rotating Rings */}
                    <motion.circle 
                        cx="140" cy="140" r={radius + 12} 
                        stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 20"
                        fill="none" 
                        className="text-primary/30"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                        style={{ originX: '140px', originY: '140px' }}
                    />
                </svg>

                {/* The Floating Glass Orb containing the Logo */}
                <motion.div 
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-40 h-40 rounded-full bg-black/30 backdrop-blur-3xl border border-white/10 shadow-[inset_0_0_50px_rgba(255,255,255,0.05),0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center p-6 overflow-hidden"
                >
                    {/* Inner Orb Shine */}
                    <motion.div 
                        animate={{ x: ['-200%', '200%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent skew-x-12"
                    />
                    {/* Gently pulsating logo */}
                    <motion.img 
                        animate={{ scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        src="/logo.png" 
                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" 
                        alt="Logo" 
                    />
                </motion.div>

            </div>

            {/* 4. Elegant Typography & Percentage */}
            <div className="relative z-10 mt-16 w-full flex flex-col items-center">
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={msgIndex}
                        initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="text-xl md:text-2xl font-black text-(--text-main) tracking-widest text-center"
                    >
                        {messages[msgIndex]}
                    </motion.div>
                </AnimatePresence>

                {/* Bespoke Percentage Display instead of a bar */}
                <div className="mt-8 flex items-center gap-6 opacity-80">
                    <div className="h-px w-16 bg-linear-to-r from-transparent to-primary" />
                    <span className="text-sm font-black text-primary tracking-[0.4em] drop-shadow-[0_0_10px_rgba(var(--color-primary),0.8)]" dir="ltr">
                        {Math.round(progress)}%
                    </span>
                    <div className="h-px w-16 bg-linear-to-l from-transparent to-primary" />
                </div>

            </div>

        </motion.div>
    );
}
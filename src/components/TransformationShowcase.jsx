import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import GlassCard from './ui/GlassCard';

/*
  Data structure for the sets.
  Each set has:
  - id: unique id
  - name: Label for the set (e.g., "Perfume")
  - original: URL for the input image
  - generated: Array of URLs for the output images
*/
const TRANSFORMATION_SETS = [
    {
        id: 'perfume',
        name: 'Product Photography',
        original: 'https://images.unsplash.com/photo-1595867865439-b9d9c9b5f543?q=80&w=1000&auto=format&fit=crop', // Simple bottle
        generated: [
            'https://images.unsplash.com/photo-1605618738936-3987ac5b8e21?q=80&w=800&auto=format&fit=crop', // Splash
            'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=800&auto=format&fit=crop', // Luxury
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop', // Neon
        ]
    },
    {
        id: 'fashion',
        name: 'Fashion Editorial',
        original: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop', // Simple model pose
        generated: [
            'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop', // Street
            'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=800&auto=format&fit=crop', // Studio
            'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop', // Lifestyle
        ]
    }
];

const TransformationShowcase = () => {
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const currentSet = TRANSFORMATION_SETS[currentSetIndex];

    const nextSet = () => {
        setCurrentSetIndex((prev) => (prev + 1) % TRANSFORMATION_SETS.length);
    };

    const prevSet = () => {
        setCurrentSetIndex((prev) => (prev - 1 + TRANSFORMATION_SETS.length) % TRANSFORMATION_SETS.length);
    };

    return (
        <div className="relative w-full max-w-7xl mx-auto">
            {/* Header / Controls */}
            <div className="flex items-center justify-between mb-8 px-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    <span className="text-white/80 font-medium tracking-wide">
                        Example: {currentSet.name}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={prevSet}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white"
                        aria-label="Previous Example"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={nextSet}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white"
                        aria-label="Next Example"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 relative">

                {/* ORIGINAL INPUT */}
                <div className="relative z-10 flex flex-col items-center">
                    <p className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Original Image</p>
                    <GlassCard className="!p-3 !bg-black/40 !border-white/10 w-[240px] md:w-[280px] shrink-0 transform transition-transform hover:scale-105 duration-300">
                        <div className="aspect-[4/5] rounded-lg overflow-hidden bg-white/5 relative group">
                            <AnimatePresence mode='wait'>
                                <motion.img
                                    key={currentSet.original}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    src={currentSet.original}
                                    alt="Original"
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        </div>
                    </GlassCard>
                </div>

                {/* CONNECTOR ARROW (Desktop) */}
                <div className="hidden lg:flex flex-col items-center justify-center text-primary/50 relative -mt-8">
                    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-glow-cyan">
                        <path d="M10 50C40 50 40 10 90 10" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="animate-pulse" />
                        <path d="M85 5L95 10L85 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20 mt-2">
                        AI PROCESSING
                    </span>
                </div>

                {/* CONNECTOR ARROW (Mobile) */}
                <div className="lg:hidden flex flex-col items-center text-primary/50 -my-4 z-0">
                    <ArrowRight className="rotate-90 w-8 h-8 animate-bounce text-primary" />
                </div>

                {/* GENERATED OUTPUTS */}
                <div className="relative z-10 flex-1 w-full">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Images Made Using AI</p>
                        <span className="text-xs bg-gradient-to-r from-primary/20 to-secondary/20 text-white px-2 py-0.5 rounded-full border border-white/5">
                            Hundreds of Variations
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <AnimatePresence mode='wait'>
                            {currentSet.generated.map((imgUrl, index) => (
                                <motion.div
                                    key={`${currentSet.id}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <GlassCard className="!p-0 overflow-hidden !border-primary/20 hover:!border-primary/50 group h-full cursor-pointer transition-all hover:shadow-[0_0_30px_-5px_var(--primary)]">
                                        <div className="aspect-[4/5] relative">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
                                            <img
                                                src={imgUrl}
                                                alt={`Generated ${index + 1}`}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute bottom-3 left-3 z-20">
                                                <button className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-primary hover:border-primary transition-all">
                                                    <ArrowRight size={14} className="-rotate-45" />
                                                </button>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TransformationShowcase;

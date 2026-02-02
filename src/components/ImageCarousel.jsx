import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import GlassCard from './ui/GlassCard';

const SCENARIOS = [
    {
        id: 1,
        title: "Fashion Editorial",
        original: {
            url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
            label: "Model Shot"
        },
        variations: [
            { id: "1a", url: "https://images.unsplash.com/photo-1529139574466-a302d2d3f524?q=80&w=2000&auto=format&fit=crop", category: "Polka Dot Theme" },
            { id: "1b", url: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?q=80&w=2000&auto=format&fit=crop", category: "Minimal White" },
            { id: "1c", url: "https://images.unsplash.com/photo-1550935532-088f49a6a72b?q=80&w=2000&auto=format&fit=crop", category: "Cyberpunk Vibe" }
        ]
    },
    {
        id: 2,
        title: "Interior Design",
        original: {
            url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop",
            label: "Empty Room"
        },
        variations: [
            { id: "2a", url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2000&auto=format&fit=crop", category: "Modern Dark" },
            { id: "2b", url: "https://images.unsplash.com/photo-1616137492450-eb8027a9650d?q=80&w=2000&auto=format&fit=crop", category: "Beige Scandi" },
            { id: "2c", url: "https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=2000&auto=format&fit=crop", category: "Luxury Gold" }
        ]
    },
    {
        id: 3,
        title: "Product Photography",
        original: {
            url: "https://images.unsplash.com/photo-1605733160314-4fc7dac4bb16?q=80&w=600&auto=format&fit=crop",
            label: "Simple Bottle"
        },
        variations: [
            { id: "3a", url: "https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=2000&auto=format&fit=crop", category: "Fresh Fruit" },
            { id: "3b", url: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?q=80&w=2000&auto=format&fit=crop", category: "Cocktail Bar" },
            { id: "3c", url: "https://images.unsplash.com/photo-1556228720-1957be83f98c?q=80&w=2000&auto=format&fit=crop", category: "Nature Vibes" }
        ]
    }
];

const ImageCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % SCENARIOS.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + SCENARIOS.length) % SCENARIOS.length);
    };

    const currentScenario = SCENARIOS[currentIndex];

    // Animation variants
    const fadeInScale = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 }
    };

    return (
        <section className="py-24 bg-dark-bg border-t border-white/5 relative overflow-hidden" id="showcase-carousel">
            <div className="container relative z-10 px-6 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="w-5 h-5" />
                        <AnimatePresence mode="wait">
                            <motion.h3
                                key={currentScenario.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-xl font-medium text-white"
                            >
                                Example: {currentScenario.title}
                            </motion.h3>
                        </AnimatePresence>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={prevSlide}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-8 items-center">

                    {/* LEFT: Original Image */}
                    <div className="w-full xl:w-1/4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">Original Image</h4>
                        <GlassCard className="!bg-black/30 w-full aspect-[3/4] p-2 relative group overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentScenario.id}
                                    src={currentScenario.original.url}
                                    alt="Original"
                                    variants={fadeInScale}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.4 }}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </AnimatePresence>
                            <div className="absolute top-4 left-4 z-10">
                                <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10">INPUT</span>
                            </div>
                        </GlassCard>
                    </div>

                    {/* MIDDLE: Connector */}
                    <div className="flex flex-col items-center justify-center gap-2 xl:px-4">
                        <div className="hidden xl:block">
                            <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 35C20 35 30 5 50 5C70 5 80 35 100 35" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" className="opacity-50" />
                                <path d="M95 32L100 35L95 38" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="xl:hidden rotate-90 my-4">
                            <ArrowRight className="text-primary opacity-50 w-8 h-8" />
                        </div>
                        <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold tracking-wider uppercase backdrop-blur-sm whitespace-nowrap">
                            AI Processing
                        </div>
                    </div>

                    {/* RIGHT: Generated Images */}
                    <div className="w-full xl:flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center xl:text-left">Images Made Using AI</h4>
                            <span className="hidden sm:inline-block px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/20">Hundreds of Variations</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <AnimatePresence mode='wait'>
                                {currentScenario.variations.map((item, idx) => (
                                    <motion.div
                                        key={`${currentScenario.id}-${idx}`}
                                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                                        className=""
                                    >
                                        <GlassCard className="w-full aspect-[3/4] p-2 relative group hover:border-primary/50 transition-colors">
                                            <img
                                                src={item.url}
                                                alt={`Variation ${item.category}`}
                                                className="w-full h-full object-cover rounded-lg"
                                            />

                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                                <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white hover:bg-white/20">
                                                    <ArrowRight className="-rotate-45 w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <span className="px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] text-white border border-white/10">{item.category}</span>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ImageCarousel;

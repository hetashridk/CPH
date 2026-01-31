import React from 'react';
import { motion } from 'framer-motion';
import AnimatedText from './ui/AnimatedText';
import GlowingButton from './ui/GlowingButton';
import { useModal } from '../context/ModalContext';

const Hero = () => {
    const { openModal } = useModal();
    return (
        <section className="relative h-screen min-h-[800px] w-full overflow-hidden bg-dark-bg flex items-center justify-center">

            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-hero-glow opacity-20 blur-[100px] animate-pulse-slow" />
                <div className="absolute inset-0 bg-noise opacity-30 mix-blend-overlay" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-dark-bg to-transparent" />
            </div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 z-0 opacity-10"
                style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>

            {/* Content Container */}
            <div className="relative z-10 container px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="inline-block mb-6 px-4 py-1 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md"
                >
                    <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">AI MARKETING STUDIO</span>
                </motion.div>

                <div className="max-w-5xl mx-auto mb-10">
                    <h1 className="font-heading font-bold text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-white tracking-tight">
                        <AnimatedText text="The Visual" className="justify-center" />
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary animate-gradient-x">
                            Production System for Modern Brands
                        </span>
                    </h1>
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed"
                >
                    AI Marketing Studio replaces photoshoots, agencies, and slow creative workflows with an <span className="text-white font-medium">AI-powered production system for product visuals</span>.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col md:flex-row gap-6 justify-center items-center"
                >
                    <GlowingButton variant="primary" onClick={() => openModal({ type: 'demo' })}>
                        Book Live Demo
                    </GlowingButton>
                    {/* <GlowingButton variant="primary" onClick={() => document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' })}>
                        Start Creating
                    </GlowingButton> */}
                    <GlowingButton variant="secondary" onClick={openModal}>
                        Join Operator Workshop
                    </GlowingButton>
                    {/* <GlowingButton variant="secondary" onClick={() => openModal({ type: 'demo' })}>
                        Book a Demo
                    </GlowingButton> */}
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"
                />
                <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-20 -left-20 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] pointer-events-none"
                />
            </div>
        </section>
    );
};

export default Hero;

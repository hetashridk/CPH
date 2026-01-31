import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './ui/GlassCard';

const NewCategorySection = () => {
    return (
        <section className="py-24 bg-dark-bg relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block mb-8 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm"
                    >
                        <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
                            A New Category
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-heading font-bold text-4xl md:text-5xl text-white mb-16"
                    >
                        AI Photography Infrastructure
                    </motion.h2>

                    {/* The "Not" List */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {['Not a tool', 'Not a SaaS toy', 'Not an agency'].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm flex items-center justify-center"
                            >
                                <span className="text-gray-400 font-medium text-lg relative">
                                    {item}
                                    <span className="absolute left-0 right-0 top-1/2 h-[1px] bg-red-500/50 transform -rotate-3 scale-x-110" />
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* The Big Reveal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <h3 className="text-white text-2xl md:text-3xl font-light mb-4">It’s a</h3>
                        <div className="relative inline-block">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-secondary blur opacity-30" />
                            <span className="relative text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                                Visual Production<br className="hidden md:block" /> Operating System
                            </span>
                        </div>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        viewport={{ once: true }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed"
                    >
                        A system that lets brands generate, manage, and scale <span className="text-white">product photography in-house</span>.
                    </motion.p>

                    {/* Analogy Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <GlassCard className="!bg-gradient-to-br !from-gray-900/80 !to-black/80 !border-white/10 max-w-2xl mx-auto py-12">
                            <p className="text-xl md:text-2xl text-gray-400 font-light leading-relaxed">
                                Think of it like:
                                <br />
                                <span className="text-3xl md:text-4xl text-white font-bold block mt-4 mb-2">
                                    A photography department.
                                </span>
                                <span className="text-primary block font-medium">
                                    Without the department.
                                </span>
                            </p>
                        </GlassCard>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default NewCategorySection;

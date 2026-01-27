import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './ui/GlassCard';

const Comparison = () => {
    return (
        <section className="py-24 bg-dark-surface border-t border-white/5 relative overflow-hidden" id="comparison">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container relative z-10 px-6">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-heading font-bold text-4xl md:text-6xl text-white mb-6"
                    >
                        Old Way vs <span className="text-gradient-primary">New Era</span>
                    </motion.h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Stop wasting budget on logistics. Switch to the speed of generative AI.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Old Way */}
                    <GlassCard className="!bg-black/40 !border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="h-48 mb-6 rounded-xl overflow-hidden relative">
                            <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center z-10">
                                <span className="px-3 py-1 bg-red-500/20 text-red-500 border border-red-500/50 rounded text-xs font-bold uppercase tracking-wider">Slow & Expensive</span>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1542315750-f8d9b1069672?q=80&w=2670&auto=format&fit=crop"
                                alt="Traditional Photography"
                                className="w-full h-full object-cover grayscale opacity-50"
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-400 mb-6">Old Traditional Shoots</h3>
                        <ul className="space-y-4 text-gray-500 text-sm">
                            <li className="flex items-start gap-3"><span className="text-red-900/50 mt-1">❌</span> You need professional photographers</li>
                            <li className="flex items-start gap-3"><span className="text-red-900/50 mt-1">❌</span> Limited products in one time shoot</li>
                            <li className="flex items-start gap-3"><span className="text-red-900/50 mt-1">❌</span> Long Brainstorming Sessions</li>
                            <li className="flex items-start gap-3"><span className="text-red-900/50 mt-1">❌</span> Countless hours for themes</li>
                            <li className="flex items-start gap-3"><span className="text-red-900/50 mt-1">❌</span> Need to pay for consultation also</li>
                            <li className="flex items-start gap-3"><span className="text-red-900/50 mt-1">❌</span> Quality depends on the gears and tools</li>
                            <li className="flex items-start gap-3"><span className="text-red-900/50 mt-1">❌</span> Large budgets locked into single shoots</li>
                        </ul>
                    </GlassCard>

                    {/* New Way */}
                    <GlassCard className="!border-primary/30 relative overflow-hidden group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                        <div className="h-48 mb-6 rounded-xl overflow-hidden relative border border-primary/20">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-6 z-10">
                                <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/50 rounded text-xs font-bold uppercase tracking-wider shadow-glow-cyan">Instant & Scalable</span>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=2574&auto=format&fit=crop"
                                alt="AI Photography"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-6">AI Marketing Studio</h3>
                        <ul className="space-y-4 text-gray-300 text-sm font-medium">
                            <li className="flex items-start gap-3"><span className="text-primary mt-1">✓</span> Easy to Use</li>
                            <li className="flex items-start gap-3"><span className="text-primary mt-1">✓</span> Batch Production (Bulk)</li>
                            <li className="flex items-start gap-3"><span className="text-primary mt-1">✓</span> Auto Prompting from images</li>
                            <li className="flex items-start gap-3"><span className="text-primary mt-1">✓</span> 1,00,000 + Free Prompt Library</li>
                            <li className="flex items-start gap-3"><span className="text-primary mt-1">✓</span> Free Brand Analysis</li>
                            <li className="flex items-start gap-3"><span className="text-primary mt-1">✓</span> Up to 4k Resolution photos</li>
                            <li className="flex items-start gap-3"><span className="text-primary mt-1">✓</span> Designed to reduce photography expenses</li>
                        </ul>
                    </GlassCard>
                </div>
            </div>
        </section>
    );
};

export default Comparison;

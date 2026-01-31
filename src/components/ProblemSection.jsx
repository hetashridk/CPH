import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './ui/GlassCard';

const ProblemSection = () => {
    return (
        <section className="py-24 bg-dark-bg relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-heading font-bold text-4xl md:text-6xl text-white mb-6 leading-none"
                    >
                        The problem isn’t creativity.<br />
                        <span className="text-gray-500">It’s the system.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-xl md:text-2xl text-gray-300 font-light"
                    >
                        Modern brands are content factories stuck using 2010 production models.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
                    {/* What you need */}
                    <GlassCard className="!bg-primary/5 !border-primary/20">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">01</span>
                            You need
                        </h3>
                        <ul className="space-y-6">
                            {['Constant visual output', 'Multiple formats', 'Fast iterations', 'Global distribution'].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-gray-200 text-lg">
                                    <span className="text-primary text-xl">➤</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </GlassCard>

                    {/* What you use */}
                    <GlassCard className="!bg-red-500/5 !border-red-500/20">
                        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 text-sm">02</span>
                            But you’re still using
                        </h3>
                        <ul className="space-y-6">
                            {['Studios', 'Photographers', 'Agencies', 'Reshoots', 'Approvals'].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 text-gray-400 text-lg">
                                    <span className="text-red-500/50 text-xl">✖</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </GlassCard>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-3xl mx-auto space-y-6"
                >
                    <p className="text-2xl md:text-3xl text-white font-light">
                        High quality still comes with <span className="text-red-400 font-normal">high friction</span>.
                    </p>
                    <p className="text-xl md:text-2xl text-gray-400">
                        And your growth pipeline depends on external vendors.
                    </p>
                    <div className="pt-8">
                        <p className="text-3xl md:text-5xl font-heading font-bold text-white tracking-wide leading-tight">
                            That’s not scalable.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">That’s fragile.</span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ProblemSection;

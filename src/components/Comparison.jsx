import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './ui/GlassCard';
import TransformationShowcase from './TransformationShowcase';

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

                <div className="mt-12">
                    <TransformationShowcase />
                </div>
            </div>
        </section>
    );
};

export default Comparison;

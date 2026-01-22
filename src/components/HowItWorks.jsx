import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './ui/GlassCard';

const steps = [
    {
        id: "01",
        title: "Upload",
        desc: "Upload your raw product photos. No fancy lighting needed.",
        icon: "📤"
    },
    {
        id: "02",
        title: "Configure",
        desc: "Select your vibe, background, and lighting settings from our presets.",
        icon: "⚙️"
    },
    {
        id: "03",
        title: "Generate",
        desc: "Get 4K, studio-quality results in seconds ready for export.",
        icon: "✨"
    },
];

const HowItWorks = () => {
    return (
        <section className="py-32 bg-dark-bg relative" id="how-it-works">
            <div className="container px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="font-heading font-bold text-4xl md:text-5xl text-white mb-4">
                        Creation <span className="text-gray-500">Simplifed</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                        >
                            <GlassCard className="h-full flex flex-col items-center text-center relative overflow-hidden">
                                <span className="absolute top-4 right-4 text-xs font-bold text-gray-700 tracking-widest">{step.id}</span>
                                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-primary/5 group-hover:bg-primary/20 transition-colors duration-300">
                                    {step.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;

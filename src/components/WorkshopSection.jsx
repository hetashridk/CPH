import React from 'react';
import { motion } from 'framer-motion';

const WorkshopSection = () => {
    return (
        <section className="py-20 md:py-32 relative border-t border-white/10">
            <div className="container mx-auto px-6 md:px-12">

                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-primary font-mono text-sm tracking-wider uppercase mb-4 block"
                    >
                        New Offering
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-heading font-bold text-5xl md:text-7xl text-white mb-6 leading-tight"
                    >
                        Gen AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Workshop</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-gray-300 mb-6 font-medium"
                    >
                        Learn to create product photos & videos without studios, crews, or delays.
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 leading-relaxed max-w-2xl mx-auto"
                    >
                        A hands-on workshop where we teach you how to generate high-quality product visuals using the best AI tools available in the market — fast, simple, and practical.
                    </motion.p>
                </div>

                {/* Who is this for & Format Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass-panel p-10 md:p-12 md:rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm"
                    >
                        <h3 className="font-heading text-3xl text-white mb-8">Who this is for</h3>
                        <ul className="space-y-4">
                            {['Ecommerce founders', 'Marketing teams', 'Creators & agencies', 'Anyone tired of expensive shoots & slow delivery'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-300">
                                    <span className="text-primary mt-1">✓</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-8 pt-8 border-t border-white/10 text-sm text-gray-400 italic">
                            If you deal with products + visuals, this is for you.
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass-panel p-10 md:p-12 md:rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm"
                    >
                        <h3 className="font-heading text-3xl text-white mb-8">Format</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-300"><span className="text-secondary mt-1">●</span> Live or online</li>
                            <li className="flex items-start gap-3 text-gray-300"><span className="text-secondary mt-1">●</span> Hands-on sessions</li>
                            <li className="flex items-start gap-3 text-gray-300"><span className="text-secondary mt-1">●</span> Real use cases</li>
                            <li className="flex items-start gap-3 text-gray-300"><span className="text-secondary mt-1">●</span> Practical exercises</li>
                            <li className="flex items-start gap-3 text-gray-300"><span className="text-secondary mt-1">●</span> Q&A + troubleshooting</li>
                        </ul>
                        <div className="mt-8 pt-8 border-t border-white/10 text-sm text-gray-400">
                            You’ll work with your own products during the workshop.
                        </div>
                    </motion.div>
                </div>

                {/* What you'll learn */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h3 className="font-heading text-4xl text-white">What you’ll learn</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-dark-card border border-white/5 p-8 rounded-2xl"
                        >
                            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-6 text-primary font-bold text-xl">1</div>
                            <h4 className="font-heading text-2xl text-white mb-4">AI Product Photography</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li>• Turn basic product images into professional campaigns</li>
                                <li>• Generate multiple angles, styles, and backgrounds</li>
                                <li>• Maintain brand consistency</li>
                                <li>• Produce content in bulk</li>
                            </ul>
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-dark-card border border-white/5 p-8 rounded-2xl"
                        >
                            <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-6 text-secondary font-bold text-xl">2</div>
                            <h4 className="font-heading text-2xl text-white mb-4">AI Video Generation</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li>• Create product videos without cameras</li>
                                <li>• Generate reels, ads, and promos</li>
                                <li>• Repurpose one product into multiple formats</li>
                            </ul>
                        </motion.div>

                        {/* Card 3 */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-dark-card border border-white/5 p-8 rounded-2xl"
                        >
                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6 text-purple-400 font-bold text-xl">3</div>
                            <h4 className="font-heading text-2xl text-white mb-4">Tool Mastery</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li>• Current top AI platforms</li>
                                <li>• Prompting techniques</li>
                                <li>• Workflow automation</li>
                                <li>• Output optimization (quality + speed)</li>
                            </ul>
                            <p className="mt-4 text-xs text-white/50 uppercase tracking-widest">No theory. Only tools you’ll actually use.</p>
                        </motion.div>
                    </div>
                </div>

                {/* Comparison & Outcomes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 items-stretch">
                    {/* How different */}
                    <div>
                        <h3 className="font-heading text-3xl text-white mb-8">How this workshop is different</h3>
                        <div className="space-y-6">
                            <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/10">
                                <h4 className="text-red-400 font-bold mb-2 uppercase text-xs tracking-wider">Most Workshops</h4>
                                <ul className="text-gray-400 space-y-1">
                                    <li>❌ Teach features</li>
                                    <li>❌ Show demos</li>
                                    <li>❌ Leave you confused</li>
                                </ul>
                            </div>
                            <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 blur-xl rounded-full"></div>
                                <h4 className="text-green-400 font-bold mb-2 uppercase text-xs tracking-wider">Our Workshop</h4>
                                <ul className="text-gray-300 space-y-1">
                                    <li>✅ Teaches workflows</li>
                                    <li>✅ Makes you independent</li>
                                    <li>✅ Gives you repeatable systems</li>
                                </ul>
                                <p className="mt-4 text-sm text-gray-400 italic">
                                    You don’t learn “how AI works”. You learn how to use it to make money and save time.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Outcomes */}
                    <div>
                        <h3 className="font-heading text-3xl text-white mb-8">Outcomes</h3>
                        <div className="bg-gradient-to-br from-white/5 to-transparent p-8 rounded-2xl border border-white/5 h-full">
                            <ul className="space-y-4 mb-8">
                                {[
                                    'Replace basic photoshoots',
                                    'Generate your own campaigns',
                                    'Reduce creative costs',
                                    'Speed up launches',
                                    'Become self-reliant with AI tools'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-lg text-gray-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 text-center">
                                <p className="text-white font-bold text-lg">In short:</p>
                                <p className="text-primary-light">You stop waiting for creatives. You become one.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Founder */}
                <div className="max-w-3xl mx-auto text-center mb-24">
                    <p className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">Founder-led training</p>
                    <div className="relative inline-block">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-25"></div>
                        <div className="relative bg-dark-bg border border-white/10 p-8 rounded-lg">
                            <h3 className="font-heading text-3xl text-white mb-2">Piyush Bharoliya</h3>
                            <p className="text-gray-400 mb-4">Creative professional with 15+ years of experience in marketing, production, and AI workflows.</p>
                            <p className="text-white font-medium italic">"Not a teacher. A practitioner who already made the mistakes for you."</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <h2 className="font-heading text-4xl md:text-5xl text-white mb-8">
                        Learn once. <span className="text-primary">Use forever.</span>
                    </h2>
                    <p className="text-xl text-gray-400 mb-10">Build visuals without depending on studios again.</p>
                    <button className="px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        Book Workshop Now
                    </button>
                </div>

            </div>
        </section>
    );
};

export default WorkshopSection;

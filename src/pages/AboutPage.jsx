import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const team = [
    {
        name: "James Murray",
        role: "Chief Executive Officer",
        desc: "Visionary leader with over a decade of experience in AI and computational photography. Driving the future of digital asset creation.",
        image: "https://images.unsplash.com/photo-1542315750-f8d9b1069672?q=80&w=2670&auto=format&fit=crop"
    },
    {
        name: "Laura Gonzales",
        role: "Chief Technology Officer",
        desc: "Expert in computer vision and machine learning. Architecting the neural networks that power our industry-leading generation engine.",
        image: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2527&auto=format&fit=crop"
    }
];

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-white selection:bg-primary selection:text-black overflow-hidden relative">
            {/* Background Gradients */}
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <Navbar />

            <div className="h-24"></div>

            <main className="container mx-auto px-6 md:px-12 py-10 md:py-20 relative z-10">

                {/* 1. Who We Are Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 mb-40"
                >
                    <div>
                        <h1 className="font-heading font-bold text-6xl md:text-8xl leading-none mb-6">
                            Who <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">we are</span>
                        </h1>
                        <p className="text-lg font-mono text-primary uppercase tracking-widest mb-4">
                            Est. 2025
                        </p>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="glass-panel p-8 md:p-10 rounded-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <p className="text-gray-300 leading-relaxed mb-6 font-sans text-lg relative z-10">
                                AI Marketing Studio was born after nearly a decade in traditional photoshoots and video production. While the creative work was strong, the system was broken, with endless revisions, delays, high costs, and shrinking ROI. The issue wasn’t creativity, but slow, manual, approval-heavy workflows. As AI evolved, our founder, Piyush Bharoliya, chose to build with the future, creating AI Marketing Studio to remove friction, not replace creativity.

                            </p>
                            <p className="text-gray-300 leading-relaxed font-sans text-lg relative z-10">
                                Today, we help brands replace weeks of production with hours, large crews with simple workflows, and high costs with scalable systems. By reducing manual labour, we free teams to focus on ideas and growth. We believe technology should create independence, not dependency. We avoid inflated promises, ethics matter more than growth, and pride more than shortcuts. AI Marketing Studio exists to help brands move faster, spend less, and create freely.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Meet The Team Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 border-t border-white/10 pt-20">
                    {/* Sticky Header */}
                    <div className="md:sticky md:top-32 h-fit">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="font-heading font-bold text-5xl md:text-7xl text-white leading-none"
                        >
                            Meet the <br /> <span className="text-gray-600">team</span>
                        </motion.h2>
                    </div>

                    {/* Team Grid */}
                    <div className="space-y-24">
                        {team.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="flex flex-col md:flex-row gap-8 items-start group"
                            >
                                {/* Hexagon/Circular Image with Glow */}
                                <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-20 group-hover:opacity-50 transition-opacity duration-300" />
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover rounded-full border-2 border-white/10 relative z-10 group-hover:border-primary/50 transition-colors duration-300" />
                                </div>

                                {/* Details */}
                                <div>
                                    <h3 className="font-heading text-3xl text-white mb-2 group-hover:text-primary transition-colors">{member.name}</h3>
                                    <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-4">{member.role}</p>
                                    <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-md font-sans">{member.desc}</p>

                                    {/* Social Icons */}
                                    <div className="flex gap-4 text-gray-500 text-sm font-mono">
                                        <a href="#" className="hover:text-white transition-colors">LIN</a>
                                        <a href="#" className="hover:text-white transition-colors">X</a>
                                        <a href="#" className="hover:text-white transition-colors">IG</a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;

import React from 'react';
import { motion } from 'framer-motion';

const projects = [
    {
        id: 1,
        title: "Maison De Fleure",
        category: "Branding",
        image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=2680&auto=format&fit=crop",
        size: "aspect-[4/5]",
    },
    {
        id: 2,
        title: "Oculous One",
        category: "Product Design",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2574&auto=format&fit=crop",
        size: "aspect-square",
        isDark: true
    },
    {
        id: 3,
        title: "Carbon & Co",
        category: "Marketing Strategy",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop",
        size: "aspect-video",
    },
    {
        id: 4,
        title: "Velvet Interiors",
        category: "Art Direction",
        image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2670&auto=format&fit=crop",
        size: "aspect-[4/5]",
    },
];

const Projects = () => {
    return (
        <section id="projects" className="py-24 md:py-32 bg-dark-bg relative overflow-hidden">
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 md:px-12 relative z-10">

                {/* Header */}
                <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="block text-xs font-bold font-mono uppercase tracking-widest text-primary mb-4"
                        >
                            Selected Work
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="font-heading font-bold text-5xl md:text-7xl text-white leading-none"
                        >
                            Featured <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-600">projects</span>
                        </motion.h2>
                    </div>
                    <motion.a
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        href="#"
                        className="hidden md:inline-flex items-center gap-2 text-white border-b border-primary/50 pb-1 hover:border-primary hover:text-primary transition-colors duration-300 font-mono text-sm"
                    >
                        View All Projects <span className="text-xl">→</span>
                    </motion.a>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 md:gap-y-24">
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`flex flex-col gap-6 ${index % 2 !== 0 ? 'md:mt-24' : ''}`} // Offset effect
                        >
                            <div className={`w-full overflow-hidden ${project.size} relative group rounded-lg`}>
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none mix-blend-overlay" />
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {project.isDark && (
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
                                )}
                            </div>

                            <div className="flex justify-between items-start border-t border-white/10 pt-4 group">
                                <div>
                                    <h3 className="font-heading text-3xl text-white mb-1 group-hover:text-primary transition-colors duration-300">{project.title}</h3>
                                    <p className="text-gray-400 text-sm font-medium tracking-wide font-mono">{project.category}</p>
                                </div>
                                <span className="text-xs font-bold font-mono text-gray-500 group-hover:text-white transition-colors">2026</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center md:hidden">
                    <a href="#" className="inline-flex items-center gap-2 text-white border-b border-white/50 pb-1">
                        View All Projects <span className="text-xl">→</span>
                    </a>
                </div>

            </div>
        </section>
    );
};

export default Projects;

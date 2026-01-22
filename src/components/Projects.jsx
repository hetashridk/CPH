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
        // This one represents the "dark container with UI mockup" vibe from the template
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
        <section id="projects" className="py-24 md:py-32 bg-stone-200">
            <div className="container mx-auto px-6 md:px-12">

                {/* Header */}
                <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <span className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-4">Selected Work</span>
                        <h2 className="font-serif text-5xl md:text-7xl text-stone-900 leading-[0.9]">
                            Selected <br /> <span className="italic">projects</span>
                        </h2>
                    </div>
                    <a href="#" className="hidden md:inline-flex items-center gap-2 text-stone-900 border-b border-stone-400 pb-1 hover:border-stone-900 transition-colors">
                        View All Projects <span className="text-xl">→</span>
                    </a>
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
                            className={`flex flex-col gap-6 ${index % 2 !== 0 ? 'md:mt-24' : ''}`} // Offset effect for masonry feel
                        >
                            <div className={`w-full overflow-hidden ${project.size} relative group bg-stone-300`}>
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                {project.isDark && (
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                                )}
                            </div>

                            <div className="flex justify-between items-start border-t border-stone-400/30 pt-4">
                                <div>
                                    <h3 className="font-serif text-3xl text-stone-900 mb-1">{project.title}</h3>
                                    <p className="text-stone-500 text-sm font-medium tracking-wide">{project.category}</p>
                                </div>
                                <span className="text-xs font-bold text-stone-400">2025</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center md:hidden">
                    <a href="#" className="inline-flex items-center gap-2 text-stone-900 border-b border-stone-400 pb-1">
                        View All Projects <span className="text-xl">→</span>
                    </a>
                </div>

            </div>
        </section>
    );
};

export default Projects;

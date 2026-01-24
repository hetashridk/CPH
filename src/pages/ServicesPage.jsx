import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const services = [
    {
        id: "01",
        title: "Batch Production",
        desc: "Generate hundreds of campaign-ready images in one go. No more manual edits, just pure scale for your catalog."
    },
    {
        id: "02",
        title: "95% Accuracy",
        desc: "Keep your brand consistency 100% intact. Same lighting, same vibe, same product details across every shot."
    },
    {
        id: "03",
        title: "90% Cost Reduction",
        desc: "Cut out the studio rental, crew, and logistics. Get professional results for a fraction of the traditional price."
    },
    {
        id: "04",
        title: "4K Ready Outputs",
        desc: "High-resolution assets ready for your e-commerce store, social ads, and even print materials."
    },
    {
        id: "05",
        title: "Instant Turnaround",
        desc: "From upload to download in seconds. Meet tight deadlines without breaking a sweat or compromising quality."
    }
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const ServicesPage = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-white selection:bg-primary selection:text-black overflow-hidden relative">
            {/* Background Gradients */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <Navbar />

            <div className="h-24"></div>

            <main className="container mx-auto px-6 md:px-12 py-10 md:py-20 relative z-10">

                {/* 1. Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 mb-32"
                >
                    <div>
                        <h1 className="font-heading font-bold text-6xl md:text-8xl leading-none mb-8">
                            What <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">we do</span>
                        </h1>
                    </div>
                    <div className="flex flex-col gap-6 text-gray-300 font-sans text-lg leading-relaxed max-w-lg pt-4">
                        <p>
                            We revolutionize product photography using advanced AI. Our platform transforms simple uploads into studio-grade masterpieces, saving you time and resources while elevating your brand's visual identity.
                        </p>
                        <p>
                            Whether you need one hero image or a catalog of thousands, our automated pipeline delivers consistent, 4K-ready results in seconds. No studio required.
                        </p>
                    </div>
                </motion.div>

                {/* 2. Services Grid */}
                <div className="border-t border-white/10 pt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Sticky Header "Services" */}
                        <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="font-heading font-bold text-5xl md:text-6xl text-white mb-8"
                            >
                                Services
                            </motion.h2>
                        </div>

                        {/* Cards Grid */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {services.map((service, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="glass-panel p-10 md:p-12 min-h-[350px] flex flex-col justify-between group hover:border-primary/50 transition-all duration-500 hover:shadow-glow-cyan"
                                >
                                    <span className="text-xs font-bold font-mono text-primary/80 mb-4 block group-hover:text-primary transition-colors">{service.id}</span>
                                    <div>
                                        <h3 className="font-heading text-3xl text-white mb-6 leading-tight group-hover:translate-x-2 transition-transform duration-300">
                                            {service.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                                            {service.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                    </div>
                </div>

                {/* 3. Client Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mt-40 border-t border-white/10 pt-20"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div>
                            <h2 className="font-heading font-bold text-5xl md:text-6xl text-white leading-tight mb-8">
                                Client <br /> <span className="text-gray-500">testimonials</span>
                            </h2>
                        </div>
                        <div>
                            <blockquote className="font-heading text-3xl md:text-4xl text-white leading-tight mb-8 relative">
                                <span className="absolute -left-8 -top-8 text-6xl text-primary/20 font-serif">"</span>
                                It's like having a full production team in my pocket. The ROI was immediate.
                            </blockquote>
                            <p className="text-primary font-bold mb-2">Sarah Jenkins, Creative Director</p>
                            <p className="text-gray-500 text-sm">Fashion Forward Co.</p>
                        </div>
                    </div>
                </motion.div>

            </main>

            <Footer />
        </div>
    );
};

export default ServicesPage;

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const services = [
    {
        id: "01",
        title: "Batch Production",
        desc: "Generate hundreds of campaign-ready images in one go. No more manual edits, just pure scale for your catalog.",
        bgColor: "bg-orange-50",
        textColor: "text-stone-800",
    },
    {
        id: "02",
        title: "95% Accuracy",
        desc: "Keep your brand consistency 100% intact. Same lighting, same vibe, same product details across every shot.",
        bgColor: "bg-blue-50",
        textColor: "text-stone-800",
    },
    {
        id: "03",
        title: "90% Cost Reduction",
        desc: "Cut out the studio rental, crew, and logistics. Get professional results for a fraction of the traditional price.",
        bgColor: "bg-white",
        textColor: "text-stone-800",
    },
    {
        id: "04",
        title: "4K Ready Outputs",
        desc: "High-resolution assets ready for your e-commerce store, social ads, and even print materials.",
        bgColor: "bg-neutral-300",
        textColor: "text-stone-500",
    },
];

const Features = () => {
    // Scroll ref for the parallax effect container
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <section ref={containerRef} id="features" className="bg-stone-400 relative z-10 my-20">
            {/* 
               The 'sticky' class makes the entire grid stick to the top as we scroll, 
               allowing the next section (z-20) to slide over it eventually.
            */}
            <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
                <div className="container mx-auto px-6 md:px-12 h-full flex flex-col justify-center">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 h-[80vh] md:h-auto">

                        {/* Static Title Block */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-stone-400 p-8 md:p-12 flex flex-col justify-between border-r border-b border-stone-500/20 relative"
                        >
                            <h2 className="font-heading font-light text-5xl md:text-7xl lg:text-8xl leading-[0.9] text-stone-800 tracking-tight">
                                Core <br /> Features
                            </h2>
                            <div className="self-end mt-8">
                                <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-stone-800/30 text-xs font-bold uppercase tracking-widest text-stone-800 cursor-pointer hover:bg-stone-800 hover:text-white transition-colors">
                                    Read More ↗
                                </span>
                            </div>
                        </motion.div>

                        {/* Animated Service Cards */}
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 100 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }} // Staggered entrance
                                className={`${service.bgColor} p-8 md:p-12 flex flex-col justify-between transition-colors duration-300 min-h-[300px] md:min-h-[400px]`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold uppercase tracking-widest opacity-60 mix-blend-multiply">{service.id}</span>
                                </div>

                                <div className="mt-8">
                                    <h3 className={`font-heading font-light text-3xl md:text-4xl mb-6 ${service.textColor} leading-tight`}>
                                        {service.title}
                                    </h3>
                                    <p className={`text-sm md:text-base leading-relaxed opacity-80 ${service.textColor} max-w-sm`}>
                                        {service.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {/* Filler for Grid layout */}
                        <div className="hidden lg:block bg-stone-400 p-8 md:p-12 min-h-[400px]"></div>

                    </div>
                </div>
            </div>

            {/* Ghost spacer to create scroll distance for the sticky effect to hold */}
            <div className="h-[50vh]"></div>
        </section>
    );
};

export default Features;

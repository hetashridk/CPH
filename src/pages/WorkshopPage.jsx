import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

// Icons inferred for tools/concepts (using simple text or placeholders if icons aren't available, 
// using generic SVG placeholders for specific tool logos to avoid external dependencies issues)
const CheckIcon = () => <span className="text-primary font-bold">✓</span>;
const PlusIcon = () => <span className="text-secondary font-bold">+</span>;

const FAQs = [
    {
        question: "Do I need any prior photography experience?",
        answer: "No. This workshop is designed to take you from zero to pro. We teach you the workflows that replace the need for technical photography knowledge."
    },
    {
        question: "What tools will we be covering?",
        answer: "We cover the industry leaders: Midjourney, Stable Diffusion, Runway, and Photoshop Generative Fill, plus workflow automation tools."
    },
    {
        question: "Is this a live workshop?",
        answer: "Yes, we offer both live online sessions and offline hands-on workshops. Check the schedule for the next cohort."
    },
    {
        question: "Do I need a high-end PC?",
        answer: "Most tools we use are cloud-based. A standard laptop with a good internet connection is all you need."
    }
];

const WorkshopPage = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white selection:bg-primary selection:text-black font-sans">
            <Navbar />

            {/* 1. HERO SECTION: Masterclass Style */}
            <section className="pt-32 pb-20 px-4 md:px-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="bg-dark-card border border-white/10 rounded-3xl overflow-hidden relative grid grid-cols-1 lg:grid-cols-2">

                        {/* Grid Pattern Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"></div>

                        {/* LEFT COLUMN: Text & CTA */}
                        <div className="p-8 md:p-16 flex flex-col justify-center relative z-10">
                            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
                                Master Gen AI Product Visuals & 15+ Tools
                            </h1>
                            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                Join 1000+ professionals who've transformed their productivity, automated tedious work, and future-proofed their careers - all in one live workshop.
                            </p>

                            {/* Info Tags */}
                            <div className="flex flex-wrap gap-4 mb-10">
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                    <span className="text-gray-400">⏱</span>
                                    <span className="text-sm font-bold text-white tracking-wider">3 HOURS</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                    <span className="text-gray-400">📅</span>
                                    <span className="text-sm font-bold text-white tracking-wider">STARTS 28TH JAN</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                                    <span className="text-gray-400">🕒</span>
                                    <span className="text-sm font-bold text-white tracking-wider">7PM TO 10PM</span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div>
                                <button className="px-8 py-4 bg-primary text-black font-bold text-lg rounded-lg hover:bg-primary-light transition-all hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.3)] w-full md:w-auto">
                                    Claim your spot
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Video/Image */}
                        <div className="relative h-[400px] lg:h-auto bg-black/20 flex items-center justify-center p-8 md:p-16">
                            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 group cursor-pointer shadow-2xl">
                                {/* Placeholder Gradient or Image */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black"></div>
                                {/* Simulate Mentor Image */}
                                <img
                                    src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=2574&auto=format&fit=crop"
                                    alt="Workshop Mentor"
                                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                {/* School/Brand Logo overlay (based on ref) */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
                                    <h3 className="font-heading font-bold text-3xl text-white tracking-tighter">
                                        AI <span className="text-primary">STUDIO</span>
                                    </h3>
                                </div>

                                {/* Play Button */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center pl-1 shadow-lg">
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-black border-b-[10px] border-b-transparent ml-1"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. STATS BAR: The AI Training 10M+ equivalent */}
            <section className="border-y border-white/5 bg-white/[0.02] py-12">
                <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <h3 className="text-4xl font-heading font-bold text-white mb-2">15+</h3>
                        <p className="text-gray-500 text-sm uppercase tracking-wider">Years Experience</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-heading font-bold text-white mb-2">10k+</h3>
                        <p className="text-gray-500 text-sm uppercase tracking-wider">Assets Generated</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-heading font-bold text-white mb-2">90%</h3>
                        <p className="text-gray-500 text-sm uppercase tracking-wider">Cost Reduction</p>
                    </div>
                    <div>
                        <h3 className="text-4xl font-heading font-bold text-white mb-2">100%</h3>
                        <p className="text-gray-500 text-sm uppercase tracking-wider">Practical Learning</p>
                    </div>
                </div>
            </section>

            {/* 3. A WORKSHOP WORTH YOUR TIME */}
            <section className="py-24 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">A workshop <span className="text-primary italic">worth your time</span></h2>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Most workshops teach you "how it works". We teach you "how to use it" to make money and save time.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Box 1 */}
                        <div className="bg-dark-card border border-white/5 p-8 rounded-3xl hover:border-primary/30 transition-colors group">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 text-xl group-hover:scale-110 transition-transform">🚀</div>
                            <h3 className="text-xl font-bold text-white mb-4">Speed Up Launches</h3>
                            <p className="text-gray-400 leading-relaxed">Stop waiting weeks for photoshoots. Launch new products in days with instant AI generation.</p>
                        </div>
                        {/* Box 2 */}
                        <div className="bg-dark-card border border-white/5 p-8 rounded-3xl hover:border-primary/30 transition-colors group">
                            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-6 text-xl group-hover:scale-110 transition-transform">💰</div>
                            <h3 className="text-xl font-bold text-white mb-4">Reduce Creative Costs</h3>
                            <p className="text-gray-400 leading-relaxed">Cut production budgets by 90%. No studio rentals, no expensive gear, no logistics.</p>
                        </div>
                        {/* Box 3 */}
                        <div className="bg-dark-card border border-white/5 p-8 rounded-3xl hover:border-primary/30 transition-colors group">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 mb-6 text-xl group-hover:scale-110 transition-transform">🎨</div>
                            <h3 className="text-xl font-bold text-white mb-4">Total Creative Control</h3>
                            <p className="text-gray-400 leading-relaxed">Generate exactly what you envision. Change backgrounds, lighting, and angles instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. LEARN AI FRAMEWORKS (Curriculum) */}
            <section className="py-24 bg-dark-surface relative overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                            Learn <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI Frameworks</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Our proprietary frameworks designed to simplify complex workflows.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Module 1 */}
                        <div className="bg-dark-bg border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-colors group h-full flex flex-col">
                            <div className="bg-white/5 p-4 border-b border-white/5 flex justify-between items-center">
                                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">MODULE 01</span>
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            </div>
                            <div className="p-8 flex-1">
                                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-primary transition-colors">AI Product Photography</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-gray-300">
                                        <div className="mt-1 w-1 h-1 rounded-full bg-gray-500"></div>
                                        Turn basic product images into professional campaigns
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-gray-300">
                                        <div className="mt-1 w-1 h-1 rounded-full bg-gray-500"></div>
                                        Generate multiple angles, styles, and backgrounds
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-gray-300">
                                        <div className="mt-1 w-1 h-1 rounded-full bg-gray-500"></div>
                                        Maintain brand consistency across large catalogs
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Module 2 */}
                        <div className="bg-dark-bg border border-white/10 rounded-2xl overflow-hidden hover:border-secondary/50 transition-colors group h-full flex flex-col">
                            <div className="bg-white/5 p-4 border-b border-white/5 flex justify-between items-center">
                                <span className="font-mono text-xs text-secondary bg-secondary/10 px-2 py-1 rounded border border-secondary/20">MODULE 02</span>
                                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                            </div>
                            <div className="p-8 flex-1">
                                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-secondary transition-colors">AI Video Generation</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-gray-300">
                                        <div className="mt-1 w-1 h-1 rounded-full bg-gray-500"></div>
                                        Create engaging product videos without cameras
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-gray-300">
                                        <div className="mt-1 w-1 h-1 rounded-full bg-gray-500"></div>
                                        Generate Reels, TikToks, and Ad creatives
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-gray-300">
                                        <div className="mt-1 w-1 h-1 rounded-full bg-gray-500"></div>
                                        Repurpose static assets into motion content
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Module 3 */}
                        <div className="bg-dark-bg border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors group h-full flex flex-col">
                            <div className="bg-white/5 p-4 border-b border-white/5 flex justify-between items-center">
                                <span className="font-mono text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">MODULE 03</span>
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                            </div>
                            <div className="p-8 flex-1">
                                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-purple-400 transition-colors">Workflow Automation</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-sm text-gray-300">
                                        <div className="mt-1 w-1 h-1 rounded-full bg-gray-500"></div>
                                        Prompting techniques for consistent results
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-gray-300">
                                        <div className="mt-1 w-1 h-1 rounded-full bg-gray-500"></div>
                                        Batch processing for e-commerce catalogs
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-gray-300">
                                        <div className="mt-1 w-1 h-1 rounded-full bg-gray-500"></div>
                                        Upscaling and output optimization for print/web
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. LEARN 15+ ESSENTIAL TOOLS */}
            <section className="py-24">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="font-heading text-4xl font-bold mb-16">Learn <span className="text-secondary">15+ Essential Tools</span></h2>

                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-5xl mx-auto">
                        {[
                            "Midjourney", "Stable Diffusion", "Runway Gen-2", "Pika Labs",
                            "Magnific AI", "Topaz", "Photoshop AI", "Leonardo.ai",
                            "ChatGPT", "Claude", "CapCut", "Premiere AI",
                            "Recraft", "Krea", "Fooocus"
                        ].map((tool, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 px-6 py-4 rounded-xl hover:bg-white/10 hover:border-primary/50 transition-all cursor-default">
                                <span className="text-lg font-medium text-gray-300">{tool}</span>
                            </div>
                        ))}
                        <div className="bg-primary/20 border border-primary/50 px-6 py-4 rounded-xl">
                            <span className="text-lg font-bold text-primary">+ Many More</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. SKILL STACK */}
            <section className="py-24 bg-gradient-to-b from-dark-surface to-dark-bg">
                <div className="container mx-auto px-6">
                    <h2 className="font-heading text-4xl font-bold mb-16 text-center">Skill Stack</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            "Prompt Engineering", "Style Consistency", "Image Upscaling",
                            "Video Synthesis", "Inpainting/Outpainting", "LoRA Training",
                            "ComfyUI workflows", "Color Grading"
                        ].map((skill, i) => (
                            <div key={i} className="p-6 rounded-lg bg-black/40 border border-white/5 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                                <span className="text-gray-300 font-medium">{skill}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. MEET YOUR MENTOR */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="glass-panel p-10 md:p-16 rounded-3xl flex flex-col md:flex-row items-center gap-12 border border-white/10">
                        <div className="w-full md:w-1/3">
                            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-800 relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
                                {/* Placeholder for Piyush Image */}
                                <div className="absolute bottom-6 left-6 text-left">
                                    <h3 className="text-2xl font-bold text-white">Piyush Bharoliya</h3>
                                    <p className="text-primary font-mono text-sm">Founder & Lead Mentor</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-2/3">
                            <h2 className="font-heading text-4xl font-bold mb-6">Meet your <span className="text-primary">Mentor</span></h2>
                            <p className="text-xl text-gray-300 mb-6 italic">
                                "Not a teacher. A practitioner who already made the mistakes for you."
                            </p>
                            <p className="text-gray-400 leading-relaxed mb-8">
                                With over 15+ years in marketing, production, and AI workflows, Piyush has transitioned from traditional studio photography to leading the Generative AI revolution. He helps brands build scalable, high-quality visual engines.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="px-4 py-2 bg-white/5 rounded-full text-sm text-gray-400 border border-white/10">Founder @ CPH</div>
                                <div className="px-4 py-2 bg-white/5 rounded-full text-sm text-gray-400 border border-white/10">Ex-Creative Director</div>
                                <div className="px-4 py-2 bg-white/5 rounded-full text-sm text-gray-400 border border-white/10">AI Consultant</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. WHO IS THIS WORKSHOP FOR */}
            <section className="py-24 bg-dark-surface">
                <div className="container mx-auto px-6">
                    <h2 className="font-heading text-4xl font-bold mb-12 text-center">Who is this workshop for?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Ecommerce Founders", desc: "Who want to cut photography costs and launch faster." },
                            { title: "Marketing Teams", desc: "Who need high-volume creative assets on demand." },
                            { title: "Creators & Agencies", desc: "Who want to offer AI services to clients." },
                            { title: "Traditional Photographers", desc: "Who want to pivot and future-proof their careers." }
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-dark-bg rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 9. GLOBALLY ACCLAIMED / TESTIMONIALS */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <h2 className="font-heading text-4xl font-bold mb-16 text-center">Globally Acclaimed</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Sarah J.", role: "Brand Owner", text: "Saved us $15k in our first launch. The workflows are literally copy-paste." },
                            { name: "Mike T.", role: "Agency Founder", text: "Piyush doesn't fluff around. Straight to the tools and tactics that work." },
                            { name: "Elena R.", role: "Digital Marketer", text: "I assumed AI was hard. This workshop made it feel like a superpower I always had." }
                        ].map((t, i) => (
                            <div key={i} className="glass-panel p-8 rounded-2xl relative">
                                <div className="text-primary text-4xl absolute top-6 left-6 font-serif">"</div>
                                <p className="text-gray-300 mt-6 mb-6 relative z-10">{t.text}</p>
                                <div>
                                    <p className="text-white font-bold">{t.name}</p>
                                    <p className="text-xs text-gray-500 uppercase">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 10. FAQs */}
            <section className="py-24 bg-dark-surface">
                <div className="container mx-auto px-6 max-w-3xl">
                    <h2 className="font-heading text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {FAQs.map((faq, index) => (
                            <div key={index} className="border border-white/10 rounded-xl bg-dark-bg overflow-hidden">
                                <button
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span className="font-medium text-lg text-white">{faq.question}</span>
                                    <span className={`transform transition-transform duration-300 ${openFaq === index ? 'rotate-45' : ''}`}>
                                        <PlusIcon />
                                    </span>
                                </button>
                                <AnimatePresence>
                                    {openFaq === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA FOOTER */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="font-heading text-5xl md:text-7xl font-bold text-white mb-8">
                        Learn once. <span className="text-primary">Use forever.</span>
                    </h2>
                    <p className="text-xl text-gray-400 mb-12">Build visuals without depending on studios again.</p>
                    <button className="px-12 py-6 bg-white text-black font-bold text-xl rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                        Book Your Spot Now
                    </button>
                    <p className="mt-6 text-sm text-gray-600">100% Satisfaction Guarantee</p>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default WorkshopPage;

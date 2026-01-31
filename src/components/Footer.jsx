import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-dark-bg py-24 relative overflow-hidden border-t border-white/5">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="md:col-span-2">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="font-heading text-4xl md:text-5xl font-bold text-white mb-6"
                        >
                            Redefine Your <span className="text-gradient-primary">Visual Reality</span>
                        </motion.h2>
                        <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
                            Join the revolution of AI-driven marketing. Create studio-quality visuals in seconds, not days.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Twitter, href: "#" },
                                { icon: Instagram, href: "#" },
                                { icon: Linkedin, href: "#" },
                                { icon: Youtube, href: "#" }
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-primary hover:bg-primary/10 transition-all duration-300"
                                >
                                    <social.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-heading font-bold text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link to="/features" className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                            <li><Link to="/showcase" className="hover:text-primary transition-colors">Showcase</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-heading font-bold text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                            <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 uppercase tracking-widest">
                    <p>© 2026 AI Marketing Studio. All rights reserved.</p>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

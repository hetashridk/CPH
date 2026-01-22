import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hoverEffect = true }) => {
    return (
        <motion.div
            whileHover={hoverEffect ? { y: -5, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' } : {}}
            className={`glass-panel p-6 rounded-2xl relative overflow-hidden group ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;

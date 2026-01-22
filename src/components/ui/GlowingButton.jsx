import React from 'react';
import { motion } from 'framer-motion';

const GlowingButton = ({ children, onClick, variant = 'primary', className = '' }) => {
    const baseStyles = "relative px-8 py-3 rounded-full font-bold tracking-wide uppercase text-sm transition-all duration-300 overflow-hidden group";

    const variants = {
        primary: "bg-transparent border border-primary text-primary hover:text-black",
        secondary: "bg-transparent border border-secondary text-secondary hover:text-white",
    };

    const glowColors = {
        primary: "from-primary to-emerald-400",
        secondary: "from-secondary to-pink-500",
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            onClick={onClick}
        >
            <span className={`absolute inset-0 w-full h-full bg-gradient-to-r ${glowColors[variant]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <span className="relative z-10">{children}</span>
            <div className={`absolute -inset-3 bg-gradient-to-r ${glowColors[variant]} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-300 rounded-full`} />
        </motion.button>
    );
};

export default GlowingButton;

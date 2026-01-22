import React from 'react';
import GlassCard from './ui/GlassCard';

const SocialProof = () => {
    return (
        <section className="py-24 bg-dark-surface relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />

            <div className="container px-6 relative z-10">
                <GlassCard className="!bg-gradient-to-br !from-white/5 !to-white/0 !border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
                        <div className="md:w-1/2">
                            <h2 className="font-serif italic text-3xl md:text-4xl text-white leading-relaxed mb-8">
                                "The quality is indistinguishable from our $10k studio shoots. This is magic."
                            </h2>
                            <div>
                                <p className="font-heading font-bold text-primary tracking-wide uppercase text-sm">Sarah Jenkins</p>
                                <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">CMO, Velvet & Co</p>
                            </div>
                        </div>

                        <div className="md:w-1/2 w-full grid grid-cols-2 gap-8 text-center border-l border-white/10 pl-0 md:pl-12">
                            <div>
                                <div className="font-heading font-bold text-5xl md:text-6xl text-white mb-2">10x</div>
                                <div className="text-xs uppercase tracking-widest text-primary font-bold">Speed Increase</div>
                            </div>
                            <div>
                                <div className="font-heading font-bold text-5xl md:text-6xl text-white mb-2">90%</div>
                                <div className="text-xs uppercase tracking-widest text-primary font-bold">Cost Savings</div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </section>
    );
};

export default SocialProof;

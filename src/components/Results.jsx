import React from 'react';

const Results = () => {
    return (
        <section id="results" className="py-32 bg-charcoal-900 text-beige-50">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="font-serif text-4xl md:text-6xl mb-8">
                        More images. Less money. <span className="italic text-sage-200">Zero drama.</span>
                    </h2>
                    <p className="text-xl text-charcoal-500 font-light">Scale your content engine without scaling your budget.</p>
                </div>

                {/* Simple Text Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left border-t border-charcoal-800 pt-12">
                    <div className="space-y-4">
                        <span className="text-sage-200 text-6xl font-serif">1</span>
                        <h3 className="text-xl font-bold uppercase tracking-widest">Visual Consistency</h3>
                        <p className="text-charcoal-500 font-light leading-relaxed">Ensure every shot matches your brand guidelines perfectly with AI-enforced style rules.</p>
                    </div>
                    <div className="space-y-4">
                        <span className="text-sage-200 text-6xl font-serif">2</span>
                        <h3 className="text-xl font-bold uppercase tracking-widest">Global Scale</h3>
                        <p className="text-charcoal-500 font-light leading-relaxed">Create localized assets for every market instantly without reshooting a single frame.</p>
                    </div>
                    <div className="space-y-4">
                        <span className="text-sage-200 text-6xl font-serif">3</span>
                        <h3 className="text-xl font-bold uppercase tracking-widest"> Instant ROI</h3>
                        <p className="text-charcoal-500 font-light leading-relaxed">Cut photography costs by 90% and launch campaigns in hours, not weeks.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Results;

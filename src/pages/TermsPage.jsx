import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-white selection:bg-primary selection:text-black">
            <Navbar />
            <div className="h-24"></div>

            <main className="container mx-auto px-6 md:px-12 py-20 max-w-4xl relative z-10">
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />

                <h1 className="font-heading font-bold text-5xl md:text-6xl mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                    Terms & Conditions
                </h1>

                <div className="space-y-12 text-gray-400 font-sans leading-relaxed">
                    <p className="font-mono text-sm text-secondary uppercase tracking-wider">Last updated: January 2026</p>

                    <section>
                        <h2 className="font-heading text-2xl text-white mb-6 flex items-center gap-3">
                            <span className="text-secondary/50 font-mono text-sm">01.</span> Acceptance of Terms
                        </h2>
                        <p className="glass-panel p-6 rounded-xl border-l-2 border-secondary/50">
                            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-heading text-2xl text-white mb-6 flex items-center gap-3">
                            <span className="text-primary/50 font-mono text-sm">02.</span> Use of Service
                        </h2>
                        <p className="glass-panel p-6 rounded-xl border-l-2 border-primary/50">
                            You agree to use the service only for lawful purposes. You are prohibited from posting on or transmitting through this website any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, or otherwise objectionable.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-heading text-2xl text-white mb-6 flex items-center gap-3">
                            <span className="text-accent/50 font-mono text-sm">03.</span> Intellectual Property
                        </h2>
                        <p className="glass-panel p-6 rounded-xl border-l-2 border-accent/50">
                            The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Site are protected under applicable copyrights, trademarks and other proprietary (including but not limited to intellectual property) rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-heading text-2xl text-white mb-6 flex items-center gap-3">
                            <span className="text-gray-500 font-mono text-sm">04.</span> Limitation of Liability
                        </h2>
                        <p className="glass-panel p-6 rounded-xl">
                            In no event shall AI Marketing Studio be liable for any direct, indirect, incidental, special, exemplary, or consequential damages arising out of or in any way connected with the use of this website.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsPage;

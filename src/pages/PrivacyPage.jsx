import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-white selection:bg-primary selection:text-black">
            <Navbar />
            <div className="h-24"></div>

            <main className="container mx-auto px-6 md:px-12 py-20 max-w-4xl relative z-10">
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                <h1 className="font-heading font-bold text-5xl md:text-6xl mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                    Privacy Policy
                </h1>

                <div className="space-y-12 text-gray-400 font-sans leading-relaxed">
                    <p className="font-mono text-sm text-primary uppercase tracking-wider">Last updated: January 2026</p>

                    <section>
                        <h2 className="font-heading text-2xl text-white mb-6 flex items-center gap-3">
                            <span className="text-primary/50 font-mono text-sm">01.</span> Information We Collect
                        </h2>
                        <p className="glass-panel p-6 rounded-xl border-l-2 border-primary/50">
                            We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or communicate with us. This may include your name, email address, and any other information you choose to provide.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-heading text-2xl text-white mb-6 flex items-center gap-3">
                            <span className="text-secondary/50 font-mono text-sm">02.</span> How We Use Your Information
                        </h2>
                        <p className="glass-panel p-6 rounded-xl border-l-2 border-secondary/50">
                            We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect AI Marketing Studio and our users. We also use this information to offer you tailored content – like giving you more relevant search results and ads.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-heading text-2xl text-white mb-6 flex items-center gap-3">
                            <span className="text-accent/50 font-mono text-sm">03.</span> Data Security
                        </h2>
                        <p className="glass-panel p-6 rounded-xl border-l-2 border-accent/50">
                            We work hard to protect AI Marketing Studio and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-heading text-2xl text-white mb-6 flex items-center gap-3">
                            <span className="text-gray-500 font-mono text-sm">04.</span> Contact Us
                        </h2>
                        <p className="glass-panel p-6 rounded-xl">
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@aimarketingstudio.com" className="text-primary hover:text-white transition-colors">privacy@aimarketingstudio.com</a>.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPage;

import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-beige-50">
            <Navbar theme="solid" />
            <div className="h-20"></div>

            <main className="container mx-auto px-6 md:px-12 py-20 max-w-4xl">
                <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-12">Terms & Conditions</h1>

                <div className="space-y-8 text-stone-600 font-light leading-relaxed">
                    <p>Last updated: January 2026</p>

                    <section>
                        <h2 className="font-serif text-2xl text-stone-900 mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl text-stone-900 mb-4">2. Use of Service</h2>
                        <p>
                            You agree to use the service only for lawful purposes. You are prohibited from posting on or transmitting through this website any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, or otherwise objectionable.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl text-stone-900 mb-4">3. Intellectual Property</h2>
                        <p>
                            The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Site are protected under applicable copyrights, trademarks and other proprietary (including but not limited to intellectual property) rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl text-stone-900 mb-4">4. Limitation of Liability</h2>
                        <p>
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

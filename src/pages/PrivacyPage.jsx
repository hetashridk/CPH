import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-beige-50">
            <Navbar theme="solid" />
            <div className="h-20"></div>

            <main className="container mx-auto px-6 md:px-12 py-20 max-w-4xl">
                <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-12">Privacy Policy</h1>

                <div className="space-y-8 text-stone-600 font-light leading-relaxed">
                    <p>Last updated: January 2026</p>

                    <section>
                        <h2 className="font-serif text-2xl text-stone-900 mb-4">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or communicate with us. This may include your name, email address, and any other information you choose to provide.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl text-stone-900 mb-4">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect AI Marketing Studio and our users. We also use this information to offer you tailored content – like giving you more relevant search results and ads.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl text-stone-900 mb-4">3. Data Security</h2>
                        <p>
                            We work hard to protect AI Marketing Studio and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl text-stone-900 mb-4">4. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at privacy@aimarketingstudio.com.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPage;

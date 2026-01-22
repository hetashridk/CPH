import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const services = [
    {
        id: "01",
        title: "Batch Production",
        desc: "Generate hundreds of campaign-ready images in one go. No more manual edits, just pure scale for your catalog."
    },
    {
        id: "02",
        title: "95% Accuracy",
        desc: "Keep your brand consistency 100% intact. Same lighting, same vibe, same product details across every shot."
    },
    {
        id: "03",
        title: "90% Cost Reduction",
        desc: "Cut out the studio rental, crew, and logistics. Get professional results for a fraction of the traditional price."
    },
    {
        id: "04",
        title: "4K Ready Outputs",
        desc: "High-resolution assets ready for your e-commerce store, social ads, and even print materials."
    },
    {
        id: "05",
        title: "Instant Turnaround",
        desc: "From upload to download in seconds. Meet tight deadlines without breaking a sweat or compromising quality."
    }
];

const ServicesPage = () => {
    return (
        <div className="min-h-screen bg-sage-300">
            <Navbar theme="solid" />
            {/* Spacer for fixed navbar */}
            <div className="h-20"></div>

            <main className="container mx-auto px-6 md:px-12 py-20 md:py-32">

                {/* 1. Hero Section ("What we do") */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 mb-32">
                    <div>
                        <h1 className="font-serif text-6xl md:text-8xl text-stone-900 leading-[0.9] mb-8">
                            What <br /> we do
                        </h1>
                    </div>
                    <div className="flex flex-col gap-6 text-stone-800 font-medium leading-relaxed max-w-lg">
                        <p>
                            This is the space to describe the service. Focus the description on how customers or clients can benefit from using this service: explain how it solves a problem, or makes life easier or more enjoyable.
                        </p>
                        <p>
                            Be sure to include all the relevant details users will want to know, like pricing, duration, and location. If they’ll need to prepare or bring anything with them, let them know here.
                        </p>
                    </div>
                </div>

                {/* 2. Services Grid ("Services" + Cards) */}
                <div className="border-t border-stone-800/10 pt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Sticky Header "Services" */}
                        <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                            <h2 className="font-serif text-5xl md:text-6xl text-stone-900 mb-8 opacity-90">
                                Services
                            </h2>
                        </div>

                        {/* Cards Grid */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {services.map((service, index) => (
                                <div key={index} className="bg-white p-10 md:p-12 min-h-[350px] flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
                                    <span className="text-xs font-bold text-stone-400 mb-4 block">{service.id}</span>
                                    <div>
                                        <h3 className="font-sans font-light text-3xl text-stone-800 mb-6 leading-tight">
                                            {service.title}
                                        </h3>
                                        <p className="text-stone-500 text-sm leading-relaxed">
                                            {service.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* 3. Client Testimonials (Bottom Section) */}
                <div className="mt-40 border-t border-stone-800/10 pt-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div>
                            <h2 className="font-serif text-5xl md:text-6xl text-stone-900 leading-tight mb-8">
                                Client <br /> testimonials
                            </h2>
                        </div>
                        <div>
                            <blockquote className="font-serif text-3xl md:text-4xl text-stone-900 italic leading-tight mb-8">
                                "Worth every minute working together."
                            </blockquote>
                            <p className="text-stone-600 mb-2">Given Name, Company Role</p>
                            <p className="text-stone-400 text-sm">This is the space to share a review from one of the business's clients.</p>
                        </div>
                    </div>
                </div>

            </main>

            <div className="bg-beige-50">
                <Footer />
            </div>
        </div>
    );
};

export default ServicesPage;

import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const team = [
    {
        name: "James Murray",
        role: "Chief Executive Officer",
        desc: "Describe the team member here. Write a brief description of their role and responsibilities, or a short bio with a background summary.",
        image: "https://images.unsplash.com/photo-1542315750-f8d9b1069672?q=80&w=2670&auto=format&fit=crop" // Placeholder user 1
    },
    {
        name: "Laura Gonzales",
        role: "Chief Technology Officer",
        desc: "Describe the team member here. Write a brief description of their role and responsibilities, or a short bio with a background summary.",
        image: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2527&auto=format&fit=crop" // Placeholder user 2
    }
];

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-stone-300">
            <Navbar theme="solid" />

            {/* Spacer for fixed navbar */}
            <div className="h-20"></div>

            <main className="container mx-auto px-6 md:px-12 py-20 md:py-32">

                {/* 1. Who We Are Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 mb-40">
                    <div>
                        <h1 className="font-serif text-6xl md:text-8xl text-stone-900 leading-[0.9] mb-6">
                            Who <br /> we are
                        </h1>
                        <p className="text-stone-500 font-medium text-lg max-w-sm">
                            Delivering Results That Matter Since 2035
                        </p>
                    </div>
                    <div className="flex items-center">
                        <div>
                            <p className="text-stone-500 leading-relaxed mb-6">
                                This is a space to share more about the business. Take advantage of this long text to tell people who’s behind it, what it does, how it began, and other details. It’s an excellent place to share the story behind the business and describe what this site has to offer its visitors.
                            </p>
                            <p className="text-stone-500 leading-relaxed">
                                Be sure to include all the relevant details users will want to know, like pricing, duration, and location. If they’ll need to prepare or bring anything with them, let them know here. Give users an idea of what to expect from the service and tell them how to book it.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Meet The Team Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 border-t border-stone-400/50 pt-20">
                    {/* Sticky Header for Team Section */}
                    <div className="md:sticky md:top-32 h-fit">
                        <h2 className="font-serif text-5xl md:text-7xl text-stone-900 leading-[0.9]">
                            Meet the <br /> team
                        </h2>
                    </div>

                    {/* Team Grid (Right Column Stacking) */}
                    <div className="space-y-24">
                        {team.map((member, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Circular Image */}
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-stone-400 flex-shrink-0">
                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                </div>

                                {/* Details */}
                                <div>
                                    <h3 className="font-serif text-3xl text-stone-900 mb-2">{member.name}</h3>
                                    <p className="text-stone-500 text-sm mb-4 leading-relaxed max-w-md">{member.desc}</p>

                                    {/* Social Icons */}
                                    <div className="flex gap-4 text-stone-900 text-sm">
                                        <a href="#" className="hover:opacity-70">IG</a>
                                        <a href="#" className="hover:opacity-70">X</a>
                                        <a href="#" className="hover:opacity-70">Tk</a>
                                        <a href="#" className="hover:opacity-70">Fb</a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>

            <div className="bg-beige-50">
                <Footer />
            </div>
        </div>
    );
};

export default AboutPage;

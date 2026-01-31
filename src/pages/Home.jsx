import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProblemSection from '../components/ProblemSection';
import NewCategorySection from '../components/NewCategorySection';
import Comparison from '../components/Comparison';
import HowItWorks from '../components/HowItWorks';
import SocialProof from '../components/SocialProof';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <main className="bg-dark-bg min-h-screen text-white">
            <Navbar />
            <Hero />
            <ProblemSection />
            <NewCategorySection />
            <Comparison />
            <HowItWorks />
            <SocialProof />
            <Footer />
        </main>
    );
};

export default Home;

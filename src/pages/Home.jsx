import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Comparison from '../components/Comparison';
import ImageCarousel from '../components/ImageCarousel';
import HowItWorks from '../components/HowItWorks';
import SocialProof from '../components/SocialProof';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <main className="bg-dark-bg min-h-screen text-white">
            <Navbar />
            <Hero />
            <Comparison />
            <ImageCarousel />
            <HowItWorks />
            <SocialProof />
            <Footer />
        </main>
    );
};

export default Home;

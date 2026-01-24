import React from 'react';
import Navbar from '../components/Navbar';
import Projects from '../components/Projects';
import Footer from '../components/Footer';

const ProjectsPage = () => {
    return (
        <div className="min-h-screen bg-dark-bg selection:bg-primary selection:text-black">
            <Navbar />
            {/* Spacer for fixed navbar */}
            <div className="h-20"></div>
            <Projects />
            <Footer />
        </div>
    );
};

export default ProjectsPage;

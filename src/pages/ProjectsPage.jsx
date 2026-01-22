import React from 'react';
import Navbar from '../components/Navbar';
import Projects from '../components/Projects';
import Footer from '../components/Footer';

const ProjectsPage = () => {
    return (
        <div className="min-h-screen bg-stone-200">
            <Navbar theme="solid" />
            {/* Spacer for fixed navbar */}
            <div className="h-20 bg-stone-200"></div>
            <Projects />
            <div className="bg-beige-50">
                <Footer />
            </div>
        </div>
    );
};

export default ProjectsPage;

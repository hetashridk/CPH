import React from 'react';
import { XCircle, Clock, DollarSign, Camera, ImageMinus, Layers } from 'lucide-react';

const problems = [
    { title: "Expensive Studios", desc: "$500+ per hour for space." },
    { title: "Slow Turnaround", desc: "Weeks to get final edits." },
    { title: "Inconsistent Lighting", desc: "Hard to match across shoots." },
    { title: "Endless Reshoots", desc: "One wrong angle ruins the batch." },
    { title: "Creative Bottlenecks", desc: "Limited by physical props." },
    { title: "Month-long Catalogs", desc: "Campaigns delayed by production." },
];

const Problem = () => {
    return (
        <section className="bg-sage-100 py-24 md:py-32">
            <div className="container">
                <div className="flex flex-col md:flex-row gap-16 md:gap-24">

                    {/* Header */}
                    <div className="md:w-1/3">
                        <h2 className="font-serif text-4xl md:text-5xl text-charcoal-900 mb-6 leading-tight">
                            The old way <br /> is broken.
                        </h2>
                        <div className="w-16 h-0.5 bg-charcoal-900 mb-8"></div>
                        <p className="text-lg text-charcoal-500 font-light">
                            Traditional product photography is slow, expensive, and scales poorly.
                            Your brand shouldn’t move at human speed.
                        </p>
                    </div>

                    {/* List Style Grid (No Cards) */}
                    <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                        {problems.map((item, index) => (
                            <div key={index} className="flex gap-4 items-start border-t border-sage-200 pt-6">
                                <div className="mt-1 w-2 h-2 rounded-full bg-charcoal-400"></div>
                                <div>
                                    <h3 className="font-serif text-xl text-charcoal-900 mb-1">{item.title}</h3>
                                    <p className="text-sm text-charcoal-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Problem;

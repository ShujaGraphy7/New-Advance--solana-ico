import React from "react";

const Roadmap = () => {
  return (
    <section
      id="roadmap"
      className="roadmap-section py-16 md:py-24 bg-gray-900 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-emerald-600/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 grid-pattern opacity-5"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h6 className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-600/10 to-yellow-600/10 text-sm font-medium text-yellow-500 mb-4">
          Our Journey
        </h6>
               <p className="text-gray-400 text-lg mb-12 max-w-3xl mx-auto">
          Our development path is clear and focused, with strategic milestones designed to build a robust and innovative platform.
        </p>

        {/* Replace roadmap with an image */}
        <img
          src="/partners/Roadmap_-_visual_selection.png"
          alt="Project Roadmap"
          className="mx-auto max-w-full rounded-lg shadow-lg"
        />
      </div>
    </section>
  );
};

export default Roadmap;

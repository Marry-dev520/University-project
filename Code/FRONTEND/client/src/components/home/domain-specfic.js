import React from "react";

const DomainRecommendations = () => {
  return (
    <section className="w-full bg-white py-20 border-t border-slate-50">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header Section */}
        <div className="mb-12 max-w-7xl">
          <h2 className="text-4xl md:text-5xl font-medium text-slate-900 mb-6 leading-tight md:text-center">
            Domain-Specific Recommendations
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed md:text-center ">
            Once you complete your assessment, the AI recommends the best
            freelancing domains for you. Whether you're skilled in writing,
            design, or tech, our system will suggest the fields where you're
            most likely to succeed.
          </p>
        </div>

        {/* 2. REPLACED GRID WITH IMAGE */}
        <div className="w-full flex justify-start mt-10">
          <img
            src="../home-page/domain-specfic.png"
            alt="Domain Recommendations Cloud"
            className="w-full h-auto object-contain rounded-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default DomainRecommendations;

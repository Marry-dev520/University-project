import React from "react";

const NextSteps = () => {
  const steps = [
    {
      icon: "../home-page/project.png",
      count: "300+",
      label: "Project Matches",
    },
    {
      icon: "../home-page/learning.png",
      count: "25",
      label: "Learning Resources",
    },
    {
      icon: "../home-page/career.png",
      count: "12+",
      label: "Career Resources",
    },
  ];

  return (
    <section className="w-full bg-white py-15 border-t border-slate-50">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-medium text-slate-900 mb-4">
            Next Steps
          </h2>
          <p className="text-lg text-slate-500">
            Based on your results, the AI will:
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Icon Container */}
              <div className="mb-6 h-32 flex items-end justify-center">
                <img
                  src={step.icon}
                  alt={step.label}
                  className="max-h-full w-auto object-contain  "
                />
              </div>

              {/* Number */}
              <h3 className="text-5xl font-medium text-slate-900 mb-2">
                {step.count}
              </h3>

              {/* Label */}
              <p className="text-lg text-slate-500 font-medium">{step.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NextSteps;

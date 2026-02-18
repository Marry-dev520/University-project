import React, { useState } from "react";

const faqData = [
  {
    question: "What is a Contra challenge?",
    answer:
      "A Contra challenge is a skill-based competition where freelancers create projects based on a prompt to showcase their expertise, win prizes, and get discovered by top clients.",
  },
  {
    question: "How do I host a challenge or hackathon for my product?",
    answer:
      "You can partner with us to launch a branded challenge. Our team helps define the scope, criteria, and prizes to ensure maximum engagement from our community of skilled experts.",
  },
  {
    question: "Who can participate in a Contra challenge?",
    answer:
      "Anyone with a Contra profile can participate! Challenges are open to designers, developers, writers, and creative professionals looking to build their portfolio.",
  },
  {
    question: "What are the benefits of hosting a challenge on Contra?",
    answer:
      "Hosting a challenge drives massive brand awareness, generates high-quality user-generated content, and allows you to identify top talent for future hiring needs.",
  },
  {
    question: "How does Contra help promote my challenge?",
    answer:
      "We promote challenges through our newsletter, social media channels, and directly on the platform to our community of over 1M+ independent experts.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full bg-white py-24 border-t border-slate-50">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* LEFT COLUMN: Title */}
          <div className="lg:col-span-4">
            <h2 className="text-4xl md:text-5xl font-medium text-slate-900 leading-tight sticky top-24">
              Frequently asked questions
            </h2>
          </div>

          {/* RIGHT COLUMN: Accordion List */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-slate-200 border-t border-slate-200">
              {faqData.map((item, index) => (
                <div key={index} className="py-6">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex justify-between items-start text-left group focus:outline-none"
                  >
                    <span className="text-lg md:text-xl font-medium text-slate-700 group-hover:text-slate-900 transition-colors pr-8">
                      {item.question}
                    </span>
                    <span className="flex-shrink-0 mt-1">
                      {/* Chevron Icon */}
                      <svg
                        className={`w-6 h-6 text-slate-500 transform transition-transform duration-300 ${
                          openIndex === index ? "rotate-180" : "rotate-0"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </button>

                  {/* Expandable Answer */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openIndex === index
                        ? "max-h-96 opacity-100 mt-4"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-slate-500 text-base leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;

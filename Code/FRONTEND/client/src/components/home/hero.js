import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative w-full bg-white pt-12 pb-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text Content */}
          <div className="flex flex-col space-y-8 z-10">
            <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-medium leading-[1.1] tracking-tight text-slate-900">
              Discover the best freelancing domain with our ai-powered skill
              test
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed">
              Our AI uses intelligent algorithms to create customized skill
              tests based on your experience, interests, and goals.
            </p>

            <div className="pt-2">
              <Link
                to="/assignment"
                className="inline-block bg-slate-900 hover:bg-slate-800 text-white text-base font-semibold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Assignment
              </Link>
            </div>
          </div>

          {/* Right Column: Simple Image */}
          <div className="flex justify-center lg:justify-end items-center mt-12 lg:mt-0">
            <img
              src="../home-page/hero.png"
              alt="Hero Illustration"
              className="w-full max-w-md  shadow-xl object-cover"
            />
          </div>
        </div>

        {/* Bottom Section: Stats */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-transparent">
          <div className="text-center md:text-center">
            <h3 className="text-5xl font-medium text-slate-900 mb-2">1M+</h3>
            <p className="text-slate-500">creative experts</p>
          </div>
          <div className="text-center md:text-center">
            <h3 className="text-5xl font-medium text-slate-900 mb-2">300+</h3>
            <p className="text-slate-500">skills and tools represented</p>
          </div>
          <div className="text-center md:text-center">
            <h3 className="text-5xl font-medium text-slate-900 mb-2">$120M+</h3>
            <p className="text-slate-500">verified expert earnings</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

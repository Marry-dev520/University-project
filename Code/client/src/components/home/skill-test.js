import { Link } from "react-router-dom";

const SkillTests = () => {
  return (
    <section className="w-full bg-white py-15 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT SIDE: Single Image */}
          <div className="relative flex justify-center items-center">
            <img
              // 2. USE THE IMPORTED VARIABLE HERE
              src="../home-page/skill-test.png"
              alt="Skill Test Preview"
              className="w-full max-w-lg object-fit rounded-xl "
            />
          </div>

          {/* RIGHT SIDE: Text Content */}
          <div className="flex flex-col items-start space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 leading-tight">
              Personalized Skill Tests
            </h2>

            <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
              These tests will evaluate your proficiency in various freelancing
              domains, including graphic design, content writing, programming,
              and more.
            </p>

            <div className="pt-4">
              <Link
                to="/assignment"
                className="inline-block bg-slate-900 hover:bg-slate-800 text-white text-base font-semibold py-3.5 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Start Assignment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SkillTests;

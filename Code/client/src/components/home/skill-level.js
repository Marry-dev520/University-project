import { Link } from "react-router-dom";

const SkillTracking = () => {
  return (
    <section className="w-full bg-white py-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT SIDE: Image */}
          <div className="relative flex justify-center items-center">
            {/* Optional: Background Glow for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-purple-100/60 blur-3xl rounded-full -z-10"></div>

            <img
              src="../home-page/skill-level.png"
              alt="Skill Level Tracking Graph"
              className="w-full max-w-lg h-auto object-contain "
            />
          </div>

          {/* RIGHT SIDE: Text Content */}
          <div className="flex flex-col items-start space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 leading-tight">
              Skill Level Tracking
            </h2>

            <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
              Track your progress over time with real-time updates on your skill
              improvement. The platform continuously monitors your growth,
              ensuring you're always moving toward your freelancing goals.
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

export default SkillTracking;

import { Link } from "react-router-dom";

const InstantFeedback = () => {
  return (
    <section className="w-full bg-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
          {/* LEFT SIDE: Text Content */}
          <div className="flex flex-col items-start space-y-6 order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 leading-tight">
              Instant Feedback
            </h2>

            <p className="text-lg text-slate-500 leading-relaxed max-w-lg">
              After completing each assessment, receive instant AI-driven
              feedback. This includes a breakdown of your strengths, areas to
              improve, and suggestions for further learning. The feedback is
              designed to help you grow and excel in your chosen freelancing
              career.
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

          {/* RIGHT SIDE: Image */}
          <div className="relative flex justify-center  items-center order-1 lg:order-2">
            <img
              src="../home-page/feedback.png"
              alt="AI Feedback Dashboard Illustration"
              className="w-full max-w-lg h-auto object-contain "
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstantFeedback;

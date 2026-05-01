import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { availableSkills } from "../constants";

// IMPORT YOUR NEW CHATBOT COMPONENT HERE
import Chatbot from "./Chatbot";

const StudentDashboard = ({ user, setUser }) => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const navigate = useNavigate();

  const [isChatOpen, setIsChatOpen] = useState(false);

  // States for AI Task Recommendation
  const [aiTask, setAiTask] = useState(null);
  const [loadingTask, setLoadingTask] = useState(false);

  // Strict check to see if the user already has saved skills
  const hasSkills = user?.enrolled_courses && user.enrolled_courses.length > 0;

  useEffect(() => {
    if (hasSkills) {
      setSelectedSkills(user.enrolled_courses);
    }
  }, [user, hasSkills]); // <-- Added hasSkills here

  const handleSkillToggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const saveSkills = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        "http://127.0.0.1:8000/api/update-skills/",
        { enrolled_courses: selectedSkills },
        { headers: { Authorization: `Token ${token}` } },
      );

      const updatedUser = res.data.user;
      // Update local storage so it persists on refresh
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditingSkills(false); // Close the edit menu
      alert("Skills saved successfully!");
    } catch (err) {
      console.error("Error saving skills", err);
      alert("Failed to save skills. Please ensure you are logged in.");
    }
  };

  // Function to fetch AI Task
  const generateAiTask = async () => {
    setLoadingTask(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/api/ai-task/", {
        headers: { Authorization: `Token ${token}` },
      });
      setAiTask(res.data);
    } catch (err) {
      console.error("Failed to fetch AI task", err);
      alert("Failed to connect to the AI Mentor. Try again later.");
    } finally {
      setLoadingTask(false);
    }
  };
  console.log("CURRENT USER DATA IN REACT:", user);
  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      {/* --- Enrolled Skills Card --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 border-t-4 border-t-indigo-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            My Enrolled DigiSkills
          </h2>

          {/* ONLY show Edit button if they already have skills and aren't currently editing */}
          {hasSkills && !isEditingSkills && (
            <button
              onClick={() => setIsEditingSkills(true)}
              className="text-indigo-600 text-sm font-semibold hover:underline"
            >
              Edit Skills
            </button>
          )}
        </div>

        {/* Logic: Show selection menu if editing OR if they have no skills yet */}
        {isEditingSkills || !hasSkills ? (
          <div>
            <p className="text-slate-500 mb-4 text-sm">
              Select the courses you are enrolled in:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {availableSkills.map((skill) => (
                <label
                  key={skill}
                  className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {skill}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex justify-end">
              {isEditingSkills && hasSkills && (
                <button
                  onClick={() => {
                    setIsEditingSkills(false);
                    setSelectedSkills(user.enrolled_courses); // Reset changes
                  }}
                  className="mr-3 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={saveSkills}
                disabled={selectedSkills.length === 0}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed shadow-sm"
              >
                Save My Skills
              </button>
            </div>
          </div>
        ) : (
          /* READ-ONLY MODE: Shows automatically if they have skills saved! */
          <div className="flex flex-wrap gap-2">
            {user.enrolled_courses.map((course) => (
              <span
                key={course}
                className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-200 shadow-sm"
              >
                {course}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* --- Action Cards Grid --- */}
      {/* ONLY show these cards if the user has selected their skills */}
      {hasSkills && !isEditingSkills && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ease-in-out opacity-100">
          {/* 1. Skill Assessment Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Skill Assessment
              </h2>
              <p className="text-slate-600 mb-6 text-sm">
                {user?.recommended_domain
                  ? "You have already completed the assessment. Want to try again?"
                  : "Take the test to get your recommended freelancing domain based on your skills."}
              </p>
            </div>
            <button
              onClick={() => navigate("/quiz")}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors w-max"
            >
              {user?.recommended_domain
                ? "Retake Assessment"
                : "Start Assessment"}
            </button>
          </div>

          {/* 2. Recommendation Card */}
          <div
            className={`bg-white p-6 rounded-xl shadow-sm border border-t-4 flex flex-col justify-center ${
              user?.recommended_domain &&
              !user?.enrolled_courses?.includes(user.recommended_domain)
                ? "border-amber-100 border-t-amber-500"
                : "border-emerald-100 border-t-emerald-500"
            }`}
          >
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              My Recommendation
            </h2>
            {user?.recommended_domain ? (
              <div>
                {user?.enrolled_courses?.includes(user.recommended_domain) ? (
                  <>
                    <p className="text-slate-500 text-sm mb-1">
                      Great job! Based on your assessment, your ideal domain
                      matches your skills:
                    </p>
                    <p className="text-emerald-700 font-extrabold text-2xl mt-1 truncate">
                      {user.recommended_domain}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-600 text-sm mb-1">
                      Based on your test results, you might be better suited for
                      a different path:
                    </p>
                    <p className="text-amber-600 font-extrabold text-2xl mt-1 truncate">
                      {user.recommended_domain}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-2">
                <p className="text-slate-500 italic text-sm">
                  No recommendation yet.
                  <br />
                  Please take the assessment to unlock.
                </p>
              </div>
            )}
          </div>

          {/* 3. Portfolio Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between border-t-4 border-t-purple-500">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                My Portfolio
              </h2>
              <p className="text-slate-600 mb-6 text-sm">
                Build and share your professional portfolio based on your
                completed tasks to attract potential clients.
              </p>
            </div>
            <button
              onClick={() => navigate(`/portfolio/${user?.username}`)}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors w-max shadow-sm"
            >
              Manage Portfolio
            </button>
          </div>

          {/* 4. AI Project Recommendation Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between border-t-4 border-t-sky-500">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                AI Task Suggestion <span className="text-sky-500">✦</span>
              </h2>

              {aiTask ? (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    {aiTask.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {aiTask.description}
                  </p>
                </div>
              ) : (
                <p className="text-slate-600 mb-6 text-sm">
                  Not sure what to build next? Ask the AI Mentor to generate a
                  custom project idea based on your current domain.
                </p>
              )}
            </div>

            <button
              onClick={generateAiTask}
              disabled={loadingTask}
              className="bg-sky-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors w-max shadow-sm disabled:bg-sky-300 flex items-center gap-2"
            >
              {loadingTask ? (
                <>
                  <span className="animate-spin text-lg leading-none">⟳</span>{" "}
                  Generating...
                </>
              ) : aiTask ? (
                "Generate Another Idea"
              ) : (
                "Get AI Suggestion"
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- FLOATING AI CHATBOT BUTTON --- */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 bg-sky-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-sky-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 z-40 flex items-center gap-2 font-bold group border-2 border-white"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform">
            ✦
          </span>
          <span>Ask AI Mentor</span>
        </button>
      )}

      {/* --- RENDER THE SEPARATED CHATBOT COMPONENT HERE --- */}
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default StudentDashboard;

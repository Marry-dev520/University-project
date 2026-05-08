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

  // --- NEW STATES FOR FR4, FR6, FR10 ---
  // PDF
  const [isDownloading, setIsDownloading] = useState(false);

  // Jobs (FR10)
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Evaluation (FR4)
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalType, setEvalType] = useState("text");
  const [evalContent, setEvalContent] = useState("");
  const [evalReference, setEvalReference] = useState("");
  const [evalResult, setEvalResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Strict check to see if the user already has saved skills
  const hasSkills = user?.enrolled_courses && user.enrolled_courses.length > 0;

  useEffect(() => {
    if (hasSkills) {
      setSelectedSkills(user.enrolled_courses);
    }
  }, [user, hasSkills]);

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
        "https://shark-app-jifss.ondigitalocean.app/api/update-skills/",
        { enrolled_courses: selectedSkills },
        { headers: { Authorization: `Token ${token}` } },
      );

      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditingSkills(false);
      alert("Skills saved successfully!");
    } catch (err) {
      console.error("Error saving skills", err);
      alert("Failed to save skills. Please ensure you are logged in.");
    }
  };

  const generateAiTask = async () => {
    setLoadingTask(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://shark-app-jifss.ondigitalocean.app/api/ai-task/",
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      setAiTask(res.data);
    } catch (err) {
      console.error("Failed to fetch AI task", err);
      alert("Failed to connect to the AI Mentor. Try again later.");
    } finally {
      setLoadingTask(false);
    }
  };

  // --- NEW FEATURE FUNCTIONS ---

  // FR6: Download PDF Portfolio
  const downloadPortfolioPdf = async () => {
    setIsDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://shark-app-jifss.ondigitalocean.app/api/portfolio/${user.username}/pdf/`,
        {
          headers: { Authorization: `Token ${token}` },
          responseType: "blob", // CRITICAL FOR PDF FILES
        },
      );

      // Create a temporary link to trigger browser download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${user.username}_portfolio.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download PDF", err);
      alert("Failed to generate PDF. Make sure you have projects added.");
    } finally {
      setIsDownloading(false);
    }
  };

  // FR10: Fetch Freelance Jobs
  const fetchFreelanceJobs = async () => {
    setLoadingJobs(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://shark-app-jifss.ondigitalocean.app/api/jobs/",
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // FR4: Submit for Evaluation
  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();
    setIsEvaluating(true);
    setEvalResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://shark-app-jifss.ondigitalocean.app/api/evaluate/",
        {
          type: evalType,
          content: evalContent,
          reference_content: evalReference,
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      setEvalResult(res.data);
    } catch (err) {
      console.error("Evaluation failed", err);
      alert("Evaluation failed to process.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      {/* --- Enrolled Skills Card --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 border-t-4 border-t-indigo-500">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            My Enrolled DigiSkills
          </h2>
          {hasSkills && !isEditingSkills && (
            <button
              onClick={() => setIsEditingSkills(true)}
              className="text-indigo-600 text-sm font-semibold hover:underline"
            >
              Edit Skills
            </button>
          )}
        </div>

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
                    setSelectedSkills(user.enrolled_courses);
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
            className={`bg-white p-6 rounded-xl shadow-sm border border-t-4 flex flex-col justify-center ${user?.recommended_domain && !user?.enrolled_courses?.includes(user.recommended_domain) ? "border-amber-100 border-t-amber-500" : "border-emerald-100 border-t-emerald-500"}`}
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
              <p className="text-slate-500 italic text-sm mt-2">
                No recommendation yet.
                <br />
                Please take the assessment to unlock.
              </p>
            )}
          </div>

          {/* 3. Portfolio & PDF Download Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between border-t-4 border-t-purple-500">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                My Portfolio
              </h2>
              <p className="text-slate-600 mb-4 text-sm">
                Build and share your professional portfolio based on your
                completed tasks to attract potential clients.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/portfolio/${user?.username}`)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm w-full"
              >
                Manage
              </button>
              <button
                onClick={downloadPortfolioPdf}
                disabled={isDownloading}
                className="bg-slate-100 text-purple-700 border border-purple-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-50 transition-colors shadow-sm disabled:opacity-50 w-full flex justify-center items-center"
              >
                {isDownloading ? "..." : "PDF"}
              </button>
            </div>
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
                  custom project idea.
                </p>
              )}
            </div>
            <button
              onClick={generateAiTask}
              disabled={loadingTask}
              className="bg-sky-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors w-max shadow-sm disabled:bg-sky-300"
            >
              {loadingTask
                ? "Generating..."
                : aiTask
                  ? "Another Idea"
                  : "Get AI Suggestion"}
            </button>
          </div>

          {/* 5. FR4: AI Code/Text Evaluation Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between border-t-4 border-t-rose-500">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Automated Evaluation
              </h2>
              <p className="text-slate-600 mb-6 text-sm">
                Submit your writing for AI grammar/plagiarism checks, or your
                code for syntax validation.
              </p>
            </div>
            <button
              onClick={() => setShowEvalModal(true)}
              className="bg-rose-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors w-max shadow-sm"
            >
              Evaluate Task
            </button>
          </div>
        </div>
      )}

      {/* --- FR10: Freelance Jobs Feed Section --- */}
      {hasSkills && !isEditingSkills && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Live Freelance Jobs
              </h2>
              <p className="text-sm text-slate-500">
                Recent listings matched to your domain.
              </p>
            </div>
            <button
              onClick={fetchFreelanceJobs}
              disabled={loadingJobs}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
            >
              {loadingJobs ? "Fetching..." : "Find Jobs"}
            </button>
          </div>

          {jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map((job, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-100 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    {job.title}
                  </a>
                  <p className="text-xs text-slate-500 mt-1 mb-2">
                    Published: {job.published}
                  </p>
                  <p
                    className="text-sm text-slate-700"
                    dangerouslySetInnerHTML={{ __html: job.summary }}
                  ></p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-slate-500 text-sm">
              Click "Find Jobs" to load the latest opportunities from Upwork.
            </div>
          )}
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

      {/* RENDER CHATBOT COMPONENT */}
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* --- EVALUATION MODAL (FR4) --- */}
      {showEvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-slate-900">
                Task Evaluation
              </h2>
              <button
                onClick={() => setShowEvalModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleEvaluationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Submission Type
                  </label>
                  <select
                    value={evalType}
                    onChange={(e) => setEvalType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="text">Content Writing / Essay</option>
                    <option value="code">Programming / Code</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Your Submission
                  </label>
                  <textarea
                    required
                    value={evalContent}
                    onChange={(e) => setEvalContent(e.target.value)}
                    rows="5"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 font-mono text-sm"
                    placeholder={
                      evalType === "text"
                        ? "Paste your essay or writing here..."
                        : "Paste your Python code here..."
                    }
                  ></textarea>
                </div>

                {evalType === "text" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Reference Material (Optional for Plagiarism Check)
                    </label>
                    <textarea
                      value={evalReference}
                      onChange={(e) => setEvalReference(e.target.value)}
                      rows="2"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-sm"
                      placeholder="Paste original source text to check similarity against..."
                    ></textarea>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isEvaluating || !evalContent}
                  className="w-full bg-rose-600 text-white font-bold py-3 rounded-lg hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {isEvaluating ? "Analyzing Data..." : "Run AI Evaluation"}
                </button>
              </form>

              {/* Evaluation Results Box */}
              {evalResult && (
                <div className="mt-6 p-4 border border-rose-200 bg-rose-50 rounded-lg">
                  <h3 className="font-bold text-rose-900 mb-2">
                    Evaluation Results:
                  </h3>
                  {evalResult.evaluation_type === "Content Writing" ? (
                    <ul className="space-y-2 text-sm text-rose-800">
                      <li>
                        <strong>Status:</strong> {evalResult.status}
                      </li>
                      <li>
                        <strong>Word Count:</strong> {evalResult.word_count}
                      </li>
                      <li>
                        <strong>Plagiarism Match:</strong>{" "}
                        {evalResult.plagiarism_similarity}
                      </li>
                      <li>
                        <strong>Sentiment Score:</strong>{" "}
                        {evalResult.sentiment_score} (Scale: -1 to 1)
                      </li>
                    </ul>
                  ) : (
                    <div className="text-sm text-rose-800">
                      <p>
                        <strong>Syntax Valid:</strong>{" "}
                        {evalResult.syntax_valid ? "✅ Yes" : "❌ No"}
                      </p>
                      <p className="mt-1 font-mono bg-white p-2 border border-rose-100 rounded">
                        {evalResult.feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

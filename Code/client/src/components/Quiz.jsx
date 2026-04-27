import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [answers, setAnswers] = useState({});
  const [resultData, setResultData] = useState(null); // Stores score, total, and recommendation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch data and user courses on load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!token || !storedUser) {
          navigate("/login");
          return;
        }

        const courses = storedUser.enrolled_courses || [];
        setEnrolledCourses(courses);

        if (courses.length > 0) {
          setSelectedDomain(courses[0]);
        } else {
          setError(
            "You have not enrolled in any skills. Please go back to the dashboard and select your skills.",
          );
          setLoading(false);
          return;
        }

        // Fetch Questions
        const res = await axios.get("http://127.0.0.1:8000/api/assessment/", {
          headers: { Authorization: `Token ${token}` },
        });

        setQuestions(res.data);
      } catch (err) {
        setError("Could not load the assessment.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate]);

  // Frontend safeguard: Ensure we only show a maximum of 10 questions
  const filteredQuestions = questions
    .filter((q) => q.domain === selectedDomain)
    .slice(0, 10);

  const handleOptionChange = (questionId, selectedValue) => {
    setAnswers({ ...answers, [questionId]: selectedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const answeredCount = filteredQuestions.filter(
      (q) => answers[q.id || q._id],
    ).length;

    if (answeredCount < filteredQuestions.length) {
      setError(
        `Please answer all ${filteredQuestions.length} questions for ${selectedDomain} before submitting!`,
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      // Send the answers to the DB to be checked
      const res = await axios.post(
        "http://127.0.0.1:8000/api/result/",
        { answers: answers, domain: selectedDomain },
        { headers: { Authorization: `Token ${token}` } },
      );

      // Update user in local storage if returned
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // Save the structured result (score, total, recommendation)
      setResultData({
        score: res.data.score,
        total: res.data.total,
        recommendation: res.data.recommendation,
      });
    } catch (err) {
      setError("Error calculating results. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 font-semibold text-slate-700">
        Loading Assessment...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        {enrolledCourses.length > 0 && !resultData && (
          <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
            {enrolledCourses.map((domain) => (
              <button
                key={domain}
                onClick={() => {
                  setSelectedDomain(domain);
                  setAnswers({});
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedDomain === domain
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        )}

        {resultData ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Assessment Complete!
            </h2>

            {/* Display Score out of 10 */}
            <div className="mb-8">
              <p className="text-lg text-slate-600 mb-2">Your Score:</p>
              <div className="inline-block px-8 py-4 bg-indigo-50 text-indigo-700 text-5xl font-black rounded-xl border-2 border-indigo-200 shadow-sm">
                {resultData.score}{" "}
                <span className="text-3xl text-indigo-400">
                  / {resultData.total}
                </span>
              </div>
            </div>

            <p className="text-lg text-slate-600 mb-4">
              Your recommended freelancing domain is:
            </p>
            <div className="inline-block px-8 py-4 bg-emerald-100 text-emerald-800 text-2xl font-extrabold rounded-lg border-2 border-emerald-300 shadow-sm mb-8">
              {resultData.recommendation}
            </div>

            <div>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-slate-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-8 border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Skill Assessment
              </h1>
              {selectedDomain && (
                <p className="text-slate-500">
                  Showing questions for:{" "}
                  <strong className="text-indigo-600">{selectedDomain}</strong>
                </p>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg font-medium">
                {error}
              </div>
            )}

            {filteredQuestions.length === 0 && !error ? (
              <div className="text-center py-10 text-slate-500">
                No questions found for {selectedDomain}.
              </div>
            ) : (
              filteredQuestions.map((q, index) => {
                const currentId = q.id || q._id;

                return (
                  <div
                    key={currentId}
                    className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      {index + 1}. {q.question_text}
                    </h3>
                    <div className="space-y-3">
                      {[q.option1, q.option2, q.option3, q.option4].map(
                        (option, idx) => {
                          const isSelected = answers[currentId] === option;

                          return (
                            <label
                              key={idx}
                              className={`flex items-center space-x-3 cursor-pointer p-4 border rounded-lg transition-all ${
                                isSelected
                                  ? "bg-indigo-50 border-indigo-500 shadow-sm"
                                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-indigo-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question_${currentId}`}
                                value={option}
                                checked={isSelected}
                                onChange={() =>
                                  handleOptionChange(currentId, option)
                                }
                                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                              />
                              <span className="text-slate-700 font-medium">
                                {option}
                              </span>
                            </label>
                          );
                        },
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {filteredQuestions.length > 0 && (
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors text-lg shadow-md mt-4"
              >
                Submit Assessment
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Quiz;

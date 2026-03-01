import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("All"); // Added for filtering
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fetch data on load
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

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
    fetchQuestions();
  }, [navigate]);

  // Logic to filter questions based on the selected domain
  const filteredQuestions =
    selectedDomain === "All"
      ? questions
      : questions.filter((q) => q.domain === selectedDomain);

  const handleOptionChange = (questionId, selectedValue) => {
    setAnswers({ ...answers, [questionId]: selectedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Ensure we only check validation for the VISIBLE filtered questions
    const answeredCount = filteredQuestions.filter((q) => answers[q.id]).length;
    if (answeredCount < filteredQuestions.length) {
      setError("Please answer all visible questions before submitting!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://127.0.0.1:8000/api/result/",
        { answers: answers, domain: selectedDomain }, // Passing domain to backend
        { headers: { Authorization: `Token ${token}` } },
      );

      if (res.data.user)
        localStorage.setItem("user", JSON.stringify(res.data.user));
      setResult(res.data.recommendation);
    } catch (err) {
      setError("Error calculating results.");
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        {/* Domain Selection Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {["All", "Graphic Design", "Programming", "Content Writing"].map(
            (domain) => (
              <button
                key={domain}
                onClick={() => {
                  setSelectedDomain(domain);
                  setAnswers({});
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDomain === domain
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {domain}
              </button>
            ),
          )}
        </div>

        {result ? (
          <div className="text-center py-12">
            {/* ... (Success UI remains the same) */}
            <h2 className="text-3xl font-bold">{result}</h2>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">
                Skill Assessment
              </h1>
              <p className="text-slate-500">
                Showing questions for: <strong>{selectedDomain}</strong>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            {filteredQuestions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                No questions found for this category.
              </div>
            ) : (
              filteredQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200"
                >
                  <h3 className="text-lg font-semibold mb-4">
                    {index + 1}. {q.question_text}
                  </h3>
                  <div className="space-y-3">
                    {[q.option1, q.option2, q.option3, q.option4].map(
                      (option, idx) => (
                        <label
                          key={idx}
                          className={`flex items-center space-x-3 cursor-pointer p-4 border rounded-lg ${answers[q.id] === option ? "bg-indigo-50 border-indigo-500" : "bg-white border-gray-200"}`}
                        >
                          <input
                            type="radio"
                            name={`question_${q.id}`}
                            value={option}
                            checked={answers[q.id] === option}
                            onChange={() => handleOptionChange(q.id, option)}
                            className="w-5 h-5 text-indigo-600"
                          />
                          <span className="text-slate-700">{option}</span>
                        </label>
                      ),
                    )}
                  </div>
                </div>
              ))
            )}

            {filteredQuestions.length > 0 && (
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl"
              >
                Submit {selectedDomain} Assessment
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Quiz;

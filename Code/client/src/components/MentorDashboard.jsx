import { useState } from "react";
import axios from "axios";
import { availableSkills } from "../constants";

const MentorDashboard = () => {
  // Add Question State
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [questionData, setQuestionData] = useState({
    domain: availableSkills[0],
    question_text: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_option: "",
  });

  // Review Students State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [feedbackText, setFeedbackText] = useState({});

  // --- Handlers for Add Question ---
  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    const options = [
      questionData.option1,
      questionData.option2,
      questionData.option3,
      questionData.option4,
    ];

    if (!options.includes(questionData.correct_option)) {
      return alert(
        "The correct option must exactly match one of the four options.",
      );
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://127.0.0.1:8000/api/add-question/",
        questionData,
        { headers: { Authorization: `Token ${token}` } },
      );

      alert("Question added successfully!");
      setIsAddQuestionOpen(false);
      setQuestionData({
        domain: availableSkills[0],
        question_text: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correct_option: "",
      });
    } catch (err) {
      console.error("Failed to add question:", err);
      alert("Failed to add question. Please check the backend connection.");
    }
  };

  // --- Handlers for Review Students ---
  const fetchStudentProgress = async () => {
    setIsReviewOpen(true);
    setLoadingProgress(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://127.0.0.1:8000/api/student-progress/",
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      setStudentsProgress(res.data);
    } catch (err) {
      console.error("Failed to fetch student progress:", err);
      // Fallback dummy data for UI testing if API isn't ready
      setStudentsProgress([
        {
          id: 1,
          username: "john_doe",
          domain: "Graphic Design",
          result: "Logo Design",
          status: "Completed",
          score: 8, // Dummy score
        },
        {
          id: 2,
          username: "jane_smith",
          domain: "Programming",
          result: "Frontend Web Dev",
          status: "Completed",
          score: 2, // Dummy score
        },
      ]);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleFeedbackChange = (resultId, text) => {
    setFeedbackText({ ...feedbackText, [resultId]: text });
  };

  const submitFeedback = async (resultId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://127.0.0.1:8000/api/submit-feedback/",
        {
          result_id: resultId,
          feedback: feedbackText[resultId],
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      alert("Feedback submitted successfully!");

      // Clear the text box for that specific student
      setFeedbackText({ ...feedbackText, [resultId]: "" });
    } catch (err) {
      console.error("Failed to submit feedback", err);
      alert("Failed to submit feedback. Backend might not be ready.");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Question Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 border-l-4 border-l-indigo-500">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Question Bank
          </h2>
          <p className="text-slate-600 mb-4">
            Add new questions to the database for students.
          </p>
          <button
            onClick={() => setIsAddQuestionOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            Add Question
          </button>
        </div>

        {/* Review Students Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 border-l-4 border-l-emerald-500">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Review Students
          </h2>
          <p className="text-slate-600 mb-4">
            Check recent test scores and provide feedback.
          </p>
          <button
            onClick={fetchStudentProgress}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
          >
            Review Progress
          </button>
        </div>

        {/* My Domains Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-slate-900 mb-2">My Domains</h2>
          <p className="text-slate-600">
            Manage Graphic Design and Freelancing topics.
          </p>
        </div>
      </div>

      {/* ----------- Add Question Modal ----------- */}
      {isAddQuestionOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Add New Assessment Question
            </h2>
            <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Domain / Skill Category
                </label>
                <select
                  value={questionData.domain}
                  onChange={(e) =>
                    setQuestionData({ ...questionData, domain: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                >
                  {availableSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Question
                </label>
                <textarea
                  value={questionData.question_text}
                  onChange={(e) =>
                    setQuestionData({
                      ...questionData,
                      question_text: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Option {num}
                    </label>
                    <input
                      type="text"
                      value={questionData[`option${num}`]}
                      onChange={(e) =>
                        setQuestionData({
                          ...questionData,
                          [`option${num}`]: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Correct Option
                </label>
                <select
                  value={questionData.correct_option}
                  onChange={(e) =>
                    setQuestionData({
                      ...questionData,
                      correct_option: e.target.value,
                    })
                  }
                  className="w-full border border-emerald-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-emerald-50"
                  required
                >
                  <option value="" disabled>
                    -- Select the correct answer --
                  </option>
                  {questionData.option1 && (
                    <option value={questionData.option1}>
                      Option 1: {questionData.option1}
                    </option>
                  )}
                  {questionData.option2 && (
                    <option value={questionData.option2}>
                      Option 2: {questionData.option2}
                    </option>
                  )}
                  {questionData.option3 && (
                    <option value={questionData.option3}>
                      Option 3: {questionData.option3}
                    </option>
                  )}
                  {questionData.option4 && (
                    <option value={questionData.option4}>
                      Option 4: {questionData.option4}
                    </option>
                  )}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------- Review Students Modal ----------- */}
      {isReviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Student Progress & Feedback
              </h2>
              <button
                onClick={() => setIsReviewOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            {loadingProgress ? (
              <div className="text-center py-10 text-slate-500">
                Loading students...
              </div>
            ) : studentsProgress.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                No student data found.
              </div>
            ) : (
              <div className="space-y-6">
                {studentsProgress.map((student) => (
                  <div
                    key={student.id}
                    className="border border-slate-200 rounded-lg p-5 bg-slate-50"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          @{student.username}
                        </h3>
                        <p className="text-sm text-slate-600">
                          Domain:{" "}
                          <span className="font-medium text-slate-900">
                            {student.domain}
                          </span>
                        </p>

                        {/* --- NEW SCORE FIELD ADDED HERE --- */}
                        <p className="text-sm text-slate-600">
                          Score:{" "}
                          <span className="font-medium text-indigo-600">
                            {student.score !== null &&
                            student.score !== undefined
                              ? `${student.score} / 10`
                              : "Not taken yet"}
                          </span>
                        </p>

                        <p className="text-sm text-slate-600">
                          Recommendation:{" "}
                          <span className="font-medium text-emerald-600">
                            {student.result}
                          </span>
                        </p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-200">
                        {student.status}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Leave Feedback
                      </label>
                      <textarea
                        rows="2"
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-3"
                        placeholder="Write constructive feedback for this student..."
                        value={feedbackText[student.id] || ""}
                        onChange={(e) =>
                          handleFeedbackChange(student.id, e.target.value)
                        }
                      ></textarea>
                      <div className="flex justify-end">
                        <button
                          onClick={() => submitFeedback(student.id)}
                          disabled={!feedbackText[student.id]}
                          className="bg-emerald-600 disabled:bg-emerald-300 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MentorDashboard;

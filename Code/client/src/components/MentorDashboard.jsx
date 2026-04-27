import { useState } from "react";
import axios from "axios";
import { availableSkills } from "../constants";

const MentorDashboard = () => {
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Review Students
          </h2>
          <p className="text-slate-600">
            Check recent test scores and provide feedback.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-slate-900 mb-2">My Domains</h2>
          <p className="text-slate-600">
            Manage Graphic Design and Freelancing topics.
          </p>
        </div>
      </div>

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
    </>
  );
};

export default MentorDashboard;

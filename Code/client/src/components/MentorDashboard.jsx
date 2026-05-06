import { useState, useEffect } from "react";
import axios from "axios";

const MentorDashboard = () => {
  // --- States ---
  const [localDomains, setLocalDomains] = useState([]);
  const [newDomain, setNewDomain] = useState("");
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [questionData, setQuestionData] = useState({
    domain: "",
    question_text: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_option: "",
  });

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [feedbackText, setFeedbackText] = useState({});

  // --- NEW STATES: AI Analytics & Clustering (FR9) ---
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [clusterData, setClusterData] = useState({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // --- Fetch Domains from Database on Load ---
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://127.0.0.1:8000/api/domains/", {
          headers: { Authorization: `Token ${token}` },
        });
        setLocalDomains(res.data);
        if (res.data.length > 0) {
          setQuestionData((prev) => ({ ...prev, domain: res.data[0] }));
        }
      } catch (err) {
        console.error("Failed to fetch domains", err);
      }
    };
    fetchDomains();
  }, []);

  // --- Add Domain to Database ---
  const handleAddDomain = async (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://127.0.0.1:8000/api/domains/",
        { name: newDomain },
        { headers: { Authorization: `Token ${token}` } },
      );

      setLocalDomains([...localDomains, res.data.domain]);
      setNewDomain("");
      alert(res.data.message);
    } catch (err) {
      if (err.response && err.response.data.error) {
        alert(err.response.data.error);
      } else {
        alert("Failed to add domain to database.");
      }
    }
  };

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
        domain: localDomains[0] || "",
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
      setStudentsProgress([
        {
          id: 1,
          username: "john_doe",
          domain: "Graphic Design",
          result: "Logo Design",
          status: "Completed",
          score: 8,
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
        { result_id: resultId, feedback: feedbackText[resultId] },
        { headers: { Authorization: `Token ${token}` } },
      );
      alert("Feedback submitted successfully!");
      setFeedbackText({ ...feedbackText, [resultId]: "" });
    } catch (err) {
      console.error("Failed to submit feedback", err);
      alert("Failed to submit feedback. Backend might not be ready.");
    }
  };

  // --- Generate Portfolio Entry for Student ---
  const handleGeneratePortfolio = async (student) => {
    if (
      !window.confirm(
        `Generate a public portfolio entry for @${student.username}?`,
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://127.0.0.1:8000/api/mentor/generate-portfolio/",
        {
          student_id: student.id,
          title: `Assessment Completed: ${student.domain}`,
          domain: student.domain,
          description: `Successfully completed the skill assessment with a score of ${student.score}/10. Mentor recommendation: ${student.result}.`,
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      alert(`Portfolio entry successfully generated for @${student.username}!`);
    } catch (err) {
      console.error("Failed to generate portfolio", err);
      alert("Failed to generate portfolio entry.");
    }
  };

  // --- NEW: FR9 Fetch AI Analytics & Clusters ---
  const fetchAnalytics = async () => {
    setIsAnalyticsOpen(true);
    setLoadingAnalytics(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://127.0.0.1:8000/api/analytics/clusters/",
        { headers: { Authorization: `Token ${token}` } },
      );
      setClusterData(res.data.clusters || {});
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      alert(
        err.response?.data?.error ||
          "Failed to load AI clustering data. Make sure you have at least 3 students.",
      );
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <>
      {/* Updated Grid from 3 to 4 columns to fit the new card! */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Add Question Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 border-t-4 border-t-indigo-500 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Question Bank
            </h2>
            <p className="text-slate-600 mb-6 text-sm">
              Add new questions to the database for student assessments.
            </p>
          </div>
          <button
            onClick={() => setIsAddQuestionOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors w-max"
          >
            Add Question
          </button>
        </div>

        {/* Review Students Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 border-t-4 border-t-emerald-500 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Review Students
            </h2>
            <p className="text-slate-600 mb-6 text-sm">
              Check recent test scores and provide feedback to students.
            </p>
          </div>
          <button
            onClick={fetchStudentProgress}
            className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors w-max"
          >
            Review Progress
          </button>
        </div>

        {/* --- NEW: AI Analytics Card --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-rose-100 border-t-4 border-t-rose-500 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              AI Analytics <span>✦</span>
            </h2>
            <p className="text-slate-600 mb-6 text-sm">
              Use K-Means clustering to identify high-performers and students
              needing help.
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="bg-rose-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors w-max"
          >
            View Clusters
          </button>
        </div>

        {/* Manage Domains Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 border-t-4 border-t-amber-500 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Manage Domains
            </h2>
            <p className="text-slate-600 mb-4 text-sm">
              Add new skill categories to the database for students.
            </p>
            <form onSubmit={handleAddDomain} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="New domain name..."
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-amber-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                Save
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
              {localDomains.map((domain) => (
                <span
                  key={domain}
                  className="bg-amber-50 text-amber-800 text-xs px-2.5 py-1 rounded border border-amber-200"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ----------- NEW: AI Analytics Modal ----------- */}
      {isAnalyticsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                Machine Learning Student Clusters
                <span className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded font-bold border border-rose-200">
                  K-Means
                </span>
              </h2>
              <button
                onClick={() => setIsAnalyticsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            {loadingAnalytics ? (
              <div className="text-center py-10 text-slate-500 animate-pulse">
                Running K-Means Algorithm...
              </div>
            ) : Object.keys(clusterData).length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                Not enough data to form clusters. Need at least 3 students.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(clusterData).map(([clusterName, students]) => {
                  // Determine styling based on cluster name
                  let colorClass =
                    "bg-slate-50 border-slate-200 text-slate-800";
                  let headerClass = "text-slate-900";

                  if (clusterName.includes("Needs Help")) {
                    colorClass = "bg-red-50 border-red-200";
                    headerClass = "text-red-700";
                  } else if (clusterName.includes("On Track")) {
                    colorClass = "bg-blue-50 border-blue-200";
                    headerClass = "text-blue-700";
                  } else if (clusterName.includes("High Performers")) {
                    colorClass = "bg-emerald-50 border-emerald-200";
                    headerClass = "text-emerald-700";
                  }

                  return (
                    <div
                      key={clusterName}
                      className={`border rounded-xl p-4 ${colorClass}`}
                    >
                      <h3
                        className={`text-lg font-bold mb-3 border-b pb-2 border-opacity-20 ${headerClass}`}
                      >
                        {clusterName}{" "}
                        <span className="text-sm font-normal text-slate-500 float-right">
                          ({students.length})
                        </span>
                      </h3>

                      {students.length === 0 ? (
                        <p className="text-sm text-slate-500 italic">
                          No students in this cluster.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {students.map((student, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-3 rounded shadow-sm border border-white border-opacity-50"
                            >
                              <p className="font-bold text-slate-800">
                                @{student.username}
                              </p>
                              <p className="text-xs text-slate-500 mb-1">
                                {student.domain || "No Domain"}
                              </p>
                              <div className="flex justify-between text-sm mt-2">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                  Score: <b>{student.score}</b>
                                </span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                  Projects: <b>{student.projects}</b>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
                  {localDomains.map((skill) => (
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
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleGeneratePortfolio(student)}
                          className="bg-purple-100 text-purple-700 border border-purple-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                        >
                          Generate Portfolio Entry
                        </button>
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

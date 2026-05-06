import { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [data, setData] = useState({ users: [], projects: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://127.0.0.1:8000/api/admin/dashboard/",
          {
            headers: { Authorization: `Token ${token}` },
          },
        );
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError(
          "Failed to load admin data. Make sure you have admin privileges.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  // --- CRUD OPERATIONS ---

  // 1. UPDATE USER ROLE
  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://127.0.0.1:8000/api/admin/users/${userId}/`,
        { role: newRole },
        { headers: { Authorization: `Token ${token}` } },
      );

      // Update local UI state
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u,
        ),
      }));
      alert(`User role updated to ${newRole}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update user role.");
    }
  };

  // 2. DELETE USER
  const handleDeleteUser = async (userId, username) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete @${username}?`,
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/admin/users/${userId}/`, {
        headers: { Authorization: `Token ${token}` },
      });

      // Update local UI state
      setData((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.id !== userId),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  // 3. DELETE PROJECT
  const handleDeleteProject = async (projectId, title) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the project: "${title}"?`,
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://127.0.0.1:8000/api/admin/projects/${projectId}/`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );

      // Update local UI state
      setData((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== projectId),
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to delete project.");
    }
  };

  // --- Derived Analytics Logic ---
  const students = data.users.filter((u) => u.role.toLowerCase() === "student");
  const studentsWithAssessments = students.filter(
    (u) => u.domain && u.domain !== "None",
  );
  const completionRate =
    students.length > 0
      ? Math.round((studentsWithAssessments.length / students.length) * 100)
      : 0;

  const domainDistribution = studentsWithAssessments.reduce((acc, user) => {
    acc[user.domain] = (acc[user.domain] || 0) + 1;
    return acc;
  }, {});

  const sortedDomains = Object.entries(domainDistribution).sort(
    (a, b) => b[1] - a[1],
  );

  const reportedFeedback = data.users.filter(
    (user) => user.feedback && user.feedback.trim() !== "",
  );

  if (loading)
    return (
      <div className="text-center py-20 text-slate-500 font-medium">
        Loading System Data...
      </div>
    );
  if (error)
    return (
      <div className="text-center py-20 text-red-500 font-medium">{error}</div>
    );

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 border-t-4 border-t-emerald-500">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Users
          </h2>
          <p className="text-3xl font-black text-slate-900">
            {data.users.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 border-t-4 border-t-indigo-500">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Projects
          </h2>
          <p className="text-3xl font-black text-slate-900">
            {data.projects.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 border-t-4 border-t-amber-500">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
            Mentor Reports
          </h2>
          <p className="text-3xl font-black text-slate-900">
            {reportedFeedback.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-sky-100 border-t-4 border-t-sky-500">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
            Assessments Done
          </h2>
          <p className="text-3xl font-black text-slate-900">
            {completionRate}%
          </p>
        </div>
      </div>

      {/* Admin Panel Main Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-slate-50 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "users" ? "bg-white text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-800"}`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "projects" ? "bg-white text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
          >
            Platform Projects
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "reports" ? "bg-white text-amber-600 border-b-2 border-amber-600" : "text-slate-500 hover:text-slate-800"}`}
          >
            Feedback Reports
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-4 text-sm font-bold transition-colors whitespace-nowrap ${activeTab === "analytics" ? "bg-white text-sky-600 border-b-2 border-sky-600" : "text-slate-500 hover:text-slate-800"}`}
          >
            Analytics & Progress
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-x-auto">
          {/* USERS TAB WITH CRUD */}
          {activeTab === "users" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-3 font-medium rounded-tl-lg">Username</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Joined</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-3 font-semibold text-slate-900">
                      @{user.username}
                    </td>
                    <td className="p-3 text-slate-600">{user.email}</td>
                    <td className="p-3 text-slate-500 text-sm">
                      {user.date_joined}
                    </td>
                    <td className="p-3">
                      {/* ROLE UPDATE DROPDOWN */}
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleUpdateRole(user.id, e.target.value)
                        }
                        className={`px-2 py-1 text-xs font-bold rounded-full border cursor-pointer outline-none ${
                          user.role.toLowerCase() === "admin"
                            ? "bg-purple-100 text-purple-700 border-purple-200"
                            : user.role.toLowerCase() === "mentor"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        <option value="Student">Student</option>
                        <option value="Mentor">Mentor</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      {/* DELETE USER BUTTON */}
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PROJECTS TAB WITH CRUD */}
          {activeTab === "projects" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-3 font-medium rounded-tl-lg">
                    Project Title
                  </th>
                  <th className="p-3 font-medium">Domain</th>
                  <th className="p-3 font-medium">Student</th>
                  <th className="p-3 font-medium">Link</th>
                  <th className="p-3 font-medium rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.projects.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-500">
                      No projects submitted yet.
                    </td>
                  </tr>
                ) : (
                  data.projects.map((project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-3 font-semibold text-slate-900">
                        {project.title}
                      </td>
                      <td className="p-3 text-slate-600">{project.domain}</td>
                      <td className="p-3 text-indigo-600 font-medium">
                        @{project.student}
                      </td>
                      <td className="p-3">
                        {project.url ? (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm font-medium"
                          >
                            View URL &rarr;
                          </a>
                        ) : (
                          <span className="text-slate-400 text-sm">No URL</span>
                        )}
                      </td>
                      <td className="p-3">
                        {/* DELETE PROJECT BUTTON */}
                        <button
                          onClick={() =>
                            handleDeleteProject(project.id, project.title)
                          }
                          className="text-red-500 hover:text-red-700 text-sm font-semibold bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* REPORTS TAB */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              {reportedFeedback.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No mentor feedback reports available yet.
                </div>
              ) : (
                reportedFeedback.map((user) => (
                  <div
                    key={user.id}
                    className="bg-amber-50 p-4 rounded-lg border border-amber-100"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-slate-900">
                        @{user.username}
                      </span>
                      <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase">
                        {user.domain}
                      </span>
                    </div>
                    <p className="text-slate-700 italic text-sm">
                      "{user.feedback}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Skill Domain Distribution
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Current breakdown of recommended paths for students.
                </p>
                <div className="space-y-4">
                  {sortedDomains.length === 0 ? (
                    <p className="text-slate-400 italic text-sm">
                      No assessment data available yet.
                    </p>
                  ) : (
                    sortedDomains.map(([domain, count]) => {
                      const percentage = Math.round(
                        (count / studentsWithAssessments.length) * 100,
                      );
                      return (
                        <div key={domain}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-semibold text-slate-700">
                              {domain}
                            </span>
                            <span className="text-slate-500">
                              {count} students ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-sky-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Student Progress Insights
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="text-emerald-500 text-xl leading-none">
                        &bull;
                      </span>
                      <p className="text-sm text-slate-600">
                        <strong className="text-slate-800">
                          Engagement Rate:
                        </strong>{" "}
                        {completionRate}% of registered students have
                        successfully completed their initial skill assessment.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-indigo-500 text-xl leading-none">
                        &bull;
                      </span>
                      <p className="text-sm text-slate-600">
                        <strong className="text-slate-800">
                          Trending Skill:
                        </strong>{" "}
                        {sortedDomains.length > 0
                          ? `${sortedDomains[0][0]} is currently the most popular domain.`
                          : "Not enough data yet."}
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

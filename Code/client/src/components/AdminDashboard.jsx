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

  // Filter users to only show those who have received mentor feedback
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Admin Panel Main Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-slate-50">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-4 text-sm font-bold transition-colors ${activeTab === "users" ? "bg-white text-emerald-600 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-800"}`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-6 py-4 text-sm font-bold transition-colors ${activeTab === "projects" ? "bg-white text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
          >
            Platform Projects
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-6 py-4 text-sm font-bold transition-colors ${activeTab === "reports" ? "bg-white text-amber-600 border-b-2 border-amber-600" : "text-slate-500 hover:text-slate-800"}`}
          >
            Feedback Reports
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-x-auto">
          {/* USERS TAB */}
          {activeTab === "users" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-3 font-medium rounded-tl-lg">Username</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium">Joined</th>
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
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full ${user.role === "Admin" ? "bg-purple-100 text-purple-700" : user.role === "Mentor" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-sm">
                      {user.date_joined}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PROJECTS TAB */}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.projects.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-500">
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

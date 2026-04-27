import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Portfolio = () => {
  // We grab the username from the URL (e.g., localhost:3000/portfolio/johndoe)
  const { username } = useParams();

  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state for adding new projects
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    domain: "",
    description: "",
    project_url: "",
  });

  // Check if the logged-in user is viewing their own portfolio
  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const isOwner = loggedInUser && loggedInUser.username === username;

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/portfolio/${username}/`,
        );
        setPortfolioData(res.data);
      } catch (err) {
        setError("Portfolio not found or user does not exist.");
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [username]);

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://127.0.0.1:8000/api/add-project/", newProject, {
        headers: { Authorization: `Token ${token}` },
      });

      alert("Project added!");
      setIsAdding(false);
      setNewProject({
        title: "",
        domain: "",
        description: "",
        project_url: "",
      });

      // Refresh the page to show the new project
      window.location.reload();
    } catch (err) {
      alert("Failed to add project.");
    }
  };

  if (loading)
    return <div className="text-center mt-20">Loading Portfolio...</div>;
  if (error)
    return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Portfolio Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 text-center border-t-4 border-indigo-500">
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            {portfolioData.student_name}'s Portfolio
          </h1>
          <p className="text-lg text-slate-500 mb-4">
            {portfolioData.recommended_domain || "DigiSkills Student"}
          </p>
          <a
            href={`mailto:${portfolioData.email}`}
            className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Contact Me
          </a>
        </div>

        {/* Add Project Button (Only visible to the owner) */}
        {isOwner && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700"
            >
              {isAdding ? "Cancel" : "+ Add New Project"}
            </button>
          </div>
        )}

        {/* Add Project Form */}
        {isOwner && isAdding && (
          <form
            onSubmit={handleAddProject}
            className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-200"
          >
            <h3 className="text-lg font-bold mb-4">Add to Portfolio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Project Title"
                required
                className="border p-2 rounded w-full"
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Domain (e.g., Graphic Design)"
                required
                className="border p-2 rounded w-full"
                onChange={(e) =>
                  setNewProject({ ...newProject, domain: e.target.value })
                }
              />
            </div>
            <textarea
              placeholder="Describe what you built..."
              required
              className="border p-2 rounded w-full mb-4"
              rows="3"
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            ></textarea>
            <input
              type="url"
              placeholder="Link to project (Optional)"
              className="border p-2 rounded w-full mb-4"
              onChange={(e) =>
                setNewProject({ ...newProject, project_url: e.target.value })
              }
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium w-full"
            >
              Save Project
            </button>
          </form>
        )}

        {/* Projects Grid */}
        {portfolioData.projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl text-slate-500">
            No projects added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioData.projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    {project.domain}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-slate-400">
                      {project.created_at}
                    </span>
                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        View Project &rarr;
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;

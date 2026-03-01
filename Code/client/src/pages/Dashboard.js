import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modals State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Form Data State
  const [profileData, setProfileData] = useState({ username: "", email: "" });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // States for the Student Skill Checklist
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [isEditingSkills, setIsEditingSkills] = useState(false);

  const navigate = useNavigate();

  // DigiSkills Courses
  const availableSkills = [
    "Graphic Design",
    "Content Writing",
    "Programming",
    "Freelancing",
    "E-Commerce",
    "QuickBooks",
    "AutoCAD",
  ];

  useEffect(() => {
    // Fetch the logged-in user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      // If no user is found, kick them back to login
      navigate("/login");
    } else {
      setUser(storedUser);
      setProfileData({
        username: storedUser.username || "",
        email: storedUser.email || "",
      });
      // Load their existing skills if they have any
      if (storedUser.enrolled_courses) {
        setSelectedSkills(storedUser.enrolled_courses);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Handle checking/unchecking a skill
  const handleSkillToggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Save skills to Django Backend
  const saveSkills = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.patch(
        "http://127.0.0.1:8000/api/update-skills/",
        { enrolled_courses: selectedSkills },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
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

  // Handle Edit Profile Submit
  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // Changed to use Token
      const res = await axios.patch(
        "http://127.0.0.1:8000/api/update-profile/",
        profileData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      const updatedUser = res.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditProfileOpen(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  // Handle Change Password Submit
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return alert("New passwords do not match!");
    }

    try {
      const token = localStorage.getItem("token"); // Changed to use Token
      await axios.post(
        "http://127.0.0.1:8000/api/change-password/",
        {
          old_password: passwordData.oldPassword,
          new_password: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      setIsChangePasswordOpen(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }); // Reset form
      alert("Password changed successfully! Please log in again.");
      handleLogout(); // Standard security practice to force re-login
    } catch (err) {
      console.error(err);
      alert("Failed to change password. Check your old password.");
    }
  };

  // Show a loading state while checking the user
  if (!user) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            AI-Supported Virtual Internship Hub for Freelancing Careers
          </h1>
          <p className="text-sm text-slate-500 capitalize">
            {user.role} Dashboard
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700 hidden md:block">
            Welcome, {user.username}!
          </span>

          {/* Profile Dropdown Container */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center focus:outline-none"
            >
              <img
                src={
                  user.profileImage ||
                  "https://ui-avatars.com/api/?name=" + user.username
                }
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-slate-200 hover:border-blue-500 transition-all object-cover"
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    setIsEditProfileOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setIsChangePasswordOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Change Password
                </button>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area - Conditionals based on Role */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ---------------- STUDENT DASHBOARD ---------------- */}
        {String(user.role).toLowerCase() === "student" && (
          <div className="space-y-6">
            {/* SKILLS SECTION */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 border-t-4 border-t-indigo-500">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-900">
                  My Enrolled DigiSkills
                </h2>
                {!isEditingSkills && user.enrolled_courses?.length > 0 && (
                  <button
                    onClick={() => setIsEditingSkills(true)}
                    className="text-indigo-600 text-sm font-semibold hover:underline"
                  >
                    Edit Skills
                  </button>
                )}
              </div>

              {/* If editing OR if they have 0 skills, show the checklist */}
              {isEditingSkills ||
              !user.enrolled_courses ||
              user.enrolled_courses.length === 0 ? (
                <div>
                  <p className="text-slate-500 mb-4 text-sm">
                    Select the courses you are enrolled in:
                  </p>

                  {/* Improved Checkbox UI */}
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

                  {/* Buttons */}
                  <div className="flex justify-end">
                    {isEditingSkills && user.enrolled_courses?.length > 0 && (
                      <button
                        onClick={() => {
                          setIsEditingSkills(false);
                          // Reset selection to whatever is currently saved in the DB
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
                /* Show their saved skills nicely as badges */
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

            {/* --- QUIZ & RECOMMENDATION SECTION --- */}
            {/* Only show this if the user has saved at least one course and is not editing */}
            {user.enrolled_courses &&
              user.enrolled_courses.length > 0 &&
              !isEditingSkills && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 ease-in-out opacity-100">
                  {/* Assessment Card */}
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

                  {/* Recommendation Card */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 border-t-4 border-t-emerald-500 flex flex-col justify-center">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">
                      My Recommendation
                    </h2>
                    {user?.recommended_domain ? (
                      <div>
                        <p className="text-slate-500 text-sm mb-1">
                          Based on your assessment, your ideal domain is:
                        </p>
                        <p className="text-emerald-700 font-extrabold text-2xl mt-1">
                          {user.recommended_domain}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        </div>
                        <p className="text-slate-500 italic text-sm">
                          No recommendation yet.
                          <br />
                          Please take the assessment to unlock.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* ---------------- MENTOR DASHBOARD ---------------- */}
        {String(user.role).toLowerCase() === "mentor" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 border-l-4 border-l-indigo-500">
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Question Bank
              </h2>
              <p className="text-slate-600 mb-4">
                Add new questions to the database for students.
              </p>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors">
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
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                My Domains
              </h2>
              <p className="text-slate-600">
                Manage Graphic Design and Freelancing topics.
              </p>
            </div>
          </div>
        )}

        {/* ---------------- ADMIN DASHBOARD ---------------- */}
        {String(user.role).toLowerCase() === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 border-t-4 border-t-emerald-500">
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                System Users
              </h2>
              <p className="text-slate-600 mb-4">
                Manage all students, mentors, and admin accounts.
              </p>
              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors">
                View All Users
              </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 border-t-4 border-t-emerald-500">
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Platform Analytics
              </h2>
              <p className="text-slate-600">
                View overall system health and engagement metrics.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* --- Edit Profile Modal --- */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Edit Profile
            </h2>
            <form onSubmit={handleEditProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Change Password Modal --- */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Change Password
            </h2>
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
                  required
                />
                {passwordData.newPassword &&
                  passwordData.confirmPassword &&
                  passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      Passwords do not match
                    </p>
                  )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

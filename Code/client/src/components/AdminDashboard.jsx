const AdminDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-emerald-100 border-t-4 border-t-emerald-500">
        <h2 className="text-lg font-bold text-slate-900 mb-2">System Users</h2>
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
  );
};

export default AdminDashboard;

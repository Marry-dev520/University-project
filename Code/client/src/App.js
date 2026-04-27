import { useLocation, Routes, Route } from "react-router-dom";
import axios from "axios";
import "./App.css";
import Home from "./pages/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Quiz from "./components/Quiz";
import Portfolio from "./pages/Portfolio";

// 2. Setup Axios Globals BEFORE the App component renders
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

function App() {
  const location = useLocation();

  // List the routes where the Navbar and Footer should be HIDDEN
  const hiddenRoutes = ["/dashboard", "/quiz", "/login", "/signup"]; // I added login/signup here as they usually don't need navbars!

  // Check if the current URL matches any of the hidden routes
  const hideNavAndFooter = hiddenRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show Navbar if we are NOT on a hidden route */}
      {!hideNavAndFooter && <Navbar />}

      {/* Main Content Area */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio/:username" element={<Portfolio />} />
          {/* <Route path="/quiz" element={<Quiz />} /> */}
        </Routes>
      </div>

      {/* Only show Footer if we are NOT on a hidden route */}
      {!hideNavAndFooter && <Footer />}
    </div>
  );
}

export default App;

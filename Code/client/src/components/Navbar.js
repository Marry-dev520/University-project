import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full bg-white border-b border-gray-100 py-4">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        {/* Left Side: Logo */}
        <div className="flex-shrink-0 cursor-pointer">
          <Link to="/">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="68"
              height="27"
              viewBox="0 0 68 27"
              fill="none"
            >
              {/* FIX: Changed clip-path to clipPath */}
              <g clipPath="url(#clip0_1_1278)">
                <path
                  d="M16.141 -0.00999808C13.4854 -0.00999808 10.9387 1.04492 9.06091 2.92269L2.93268 9.05092C1.05492 10.9287 0 13.4754 0 16.131C0 21.661 4.48289 26.1438 10.0128 26.1438C12.6684 26.1438 15.2152 25.0889 17.0929 23.2111L21.3319 18.9722C21.3319 18.9721 21.3319 18.9723 21.3319 18.9722L33.6827 6.6214C34.5795 5.72459 35.7958 5.22077 37.0641 5.22077C39.1874 5.22077 40.9876 6.60467 41.6117 8.5197L45.5096 4.62181C43.7314 1.83676 40.6134 -0.00999808 37.0641 -0.00999808C34.4085 -0.00999808 31.8617 1.04492 29.984 2.92269L13.3943 19.5125C12.4974 20.4093 11.2811 20.9131 10.0128 20.9131C7.37176 20.9131 5.23077 18.7721 5.23077 16.131C5.23077 14.8627 5.73459 13.6464 6.63139 12.7496L12.7596 6.6214C13.6564 5.72459 14.8727 5.22077 16.141 5.22077C18.2645 5.22077 20.0645 6.60473 20.6887 8.51983L24.5866 4.62191C22.8084 1.83681 19.6904 -0.00999808 16.141 -0.00999808Z"
                  fill="#14171F"
                />
                <path
                  d="M34.3173 19.5125C33.4205 20.4093 32.2042 20.9131 30.9359 20.9131C28.8128 20.9131 27.0128 19.5295 26.3885 17.6148L22.4907 21.5126C24.269 24.2973 27.3868 26.1438 30.9359 26.1438C33.5915 26.1438 36.1382 25.0889 38.016 23.2111L54.6057 6.6214C55.5025 5.72459 56.7189 5.22077 57.9872 5.22077C60.6283 5.22077 62.7692 7.36176 62.7692 10.0028C62.7692 11.2711 62.2654 12.4874 61.3686 13.3843L55.2404 19.5125C54.3436 20.4093 53.1272 20.9131 51.859 20.9131C49.7357 20.9131 47.9356 19.5293 47.3114 17.6144L43.4136 21.5123C45.1918 24.2972 48.3097 26.1438 51.859 26.1438C54.5145 26.1438 57.0613 25.0889 58.9391 23.2111L65.0673 17.0829C66.945 15.2052 68 12.6584 68 10.0028C68 4.47289 63.5171 -0.00999808 57.9872 -0.00999808C55.3316 -0.00999808 52.7848 1.04492 50.9071 2.92269L34.3173 19.5125Z"
                  fill="#14171F"
                />
              </g>
              <defs>
                <clipPath id="clip0_1_1278">
                  <rect
                    width="68"
                    height="26.1538"
                    fill="white"
                    transform="translate(0 -0.00999808)"
                  />
                </clipPath>
              </defs>
            </svg>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-700">
          <Link to="/" className="hover:text-black transition-colors">
            Portfolio Generation
          </Link>
          <Link to="/" className="hover:text-black transition-colors">
            AI-Powered Chatbot
          </Link>
          <Link to="/" className="hover:text-black transition-colors">
            Reporting & Analytics
          </Link>
          <Link to="/" className="hover:text-black transition-colors">
            Task/Project Allocation
          </Link>
        </div>

        {/* Right Side: Auth Buttons */}
        <div className="flex items-center gap-6">
          <Link
            to="/signup"
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-6 rounded-full transition-colors"
          >
            Sign up
          </Link>

          <Link
            to="/login"
            className="text-sm font-semibold text-slate-900 hover:text-slate-700"
          >
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

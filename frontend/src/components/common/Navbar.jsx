import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="w-full border-b border-zinc-700 bg-zinc-900 px-4 md:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">

        {/* Brand & Titles */}
        <div className="text-center md:text-left flex flex-col justify-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white flex items-center justify-center md:justify-start gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            CoTEG
          </h1>
          <h2 className="mt-1.5 text-xs md:text-sm text-zinc-400 italic max-w-md md:max-w-xl leading-relaxed">
            A Hybrid T-GCN Model for Multi-Label Emotion Detection with Emotion Correlation Modeling
          </h2>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-1 sm:space-x-2 bg-zinc-800/50 p-1 rounded-lg border border-zinc-700/50">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-md transition-all ${
                isActive 
                  ? 'text-white bg-zinc-700 shadow-sm' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/features"
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-md transition-all ${
                isActive 
                  ? 'text-white bg-zinc-700 shadow-sm' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
              }`
            }
          >
            Features
          </NavLink>
          <NavLink
            to="/author"
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium rounded-md transition-all ${
                isActive 
                  ? 'text-white bg-zinc-700 shadow-sm' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
              }`
            }
          >
            Author
          </NavLink>
        </div>

      </div>
    </nav>
  );
}
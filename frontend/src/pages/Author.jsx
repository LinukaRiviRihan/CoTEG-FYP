import React from 'react';
import Profile_Photo from '../assets/Profile Photo.png';

export default function Author() {
  const author = {
    name: "Linuka Rivi Rihan",
    role: "Researcher & Developer",
    bio: "Focused on research in Natural Language Processing and Graph Neural Networks. Identified key gaps in existing literature to develop the CoTEG model, engineering its core correlation engine and contextual baseline integrations.",
    initials: "LRR",
    imageUrl: Profile_Photo,
    linkedinUrl: "https://www.linkedin.com/in/linukarivirihan",
    githubUrl: "https://github.com/LinukaRiviRihan",
    themeBg: "bg-blue-50",
    themeText: "text-blue-600",
  };

  return (
    <div className="min-h-screen px-4 py-12 md:px-6 bg-white font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <header className="text-center space-y-4 max-w-3xl mx-auto mb-10">
          <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm">The Author</h2>
          <h1 className="text-3xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Behind the CoTEG
          </h1>
          <p className="text-lg text-gray-500">
            Meet the researcher dedicated to advancing the future of emotional artificial intelligence.
          </p>
        </header>

        {/* Author Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-8 shadow-md flex flex-col items-center text-center">

            {/* Avatar Section */}
            <div className={`w-28 h-28 mb-6 shrink-0 rounded-full flex items-center justify-center shadow-sm border border-white ring-4 ring-gray-50 overflow-hidden ${!author.imageUrl ? author.themeBg : 'bg-gray-100'}`}>
              {author.imageUrl ? (
                <img
                  src={author.imageUrl}
                  alt={`${author.name} profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className={`text-3xl font-bold ${author.themeText}`}>
                  {author.initials}
                </span>
              )}
            </div>

            {/* Author Info Section */}
            <h3 className="text-3xl font-bold text-zinc-900 mb-2">
              {author.name}
            </h3>

            <p className={`text-sm font-semibold uppercase tracking-wider mb-6 ${author.themeText}`}>
              {author.role}
            </p>

            <p className="text-gray-500 leading-relaxed text-base max-w-2xl mb-8">
              {author.bio}
            </p>

            {/* Social/Contact Links */}
            <div className="flex gap-4 justify-center text-gray-400">
              {/* LinkedIn Link */}
              <a
                href={author.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors p-3 bg-gray-50 rounded-full hover:bg-blue-50"
                aria-label="LinkedIn Profile"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              {/* GitHub Link */}
              <a
                href={author.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors p-3 bg-gray-50 rounded-full hover:bg-gray-200"
                aria-label="GitHub Profile"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { useUstav } from '../App';

function Home() {
  const { ustav, loading, error } = useUstav();

  if (loading) return <div className="p-8 md:p-12 text-gray-500">Loading contents...</div>;
  if (error) return <div className="p-8 md:p-12 text-red-500">Error: {error}</div>;

  const chapters = ustav?.chapters || [];

  return (
    <div className="max-w-[1800px] w-full mx-auto px-4 md:px-8 py-4 md:py-8 h-screen flex flex-col border-l-4 border-[var(--primary)] overflow-hidden">

      {/* Top Right Link - Responsive Positioning */}
      <div className="w-full flex justify-end mb-4 md:absolute md:top-8 md:right-8">
        <div className="flex items-center gap-4">
          <img src="https://i.postimg.cc/mrZ4hsYX/davor.png" alt="Davor Logo" className="h-12 w-auto object-contain" />
          <div className="text-right text-xs text-gray-500">
            <p>For specialized implementation support, training, or executive consulting:</p>
            <a href="https://mulalic.ai-studio.wiki" target="_blank" rel="noreferrer" className="text-red-700 font-bold hover:underline block mt-1">
              mulalic.ai-studio.wiki
            </a>
          </div>
        </div>
      </div>

      {/* Main Title Block */}
      <header className="mt-4 md:mt-12 mb-4 md:mb-8">
        <h1 className="book-title-large">
          AI SOLVED<br />
          BUSINESS<br />
          PROBLEMS
        </h1>
        <div className="border-b-2 border-gray-200 mt-4 mb-4"></div>
        <p className="book-subtitle">
          50 Real-World Challenges from 10 Industries<br />
          A Manager's Workbook
        </p>
        <div className="mt-6 border-l-2 border-gray-300 pl-4 py-1 italic text-gray-600 text-xs md:text-sm max-w-2xl">
          "Homo naturae minister et interpres tantum facit et intelligit, quantum de naturae ordine re vel mente observaverit: nec amplius scit aut potest."
          <span className="block mt-1 font-bold">— Francis Bacon, Novum Organum (1620)</span>
        </div>
        <div className="mt-8 flex flex-wrap gap-4 md:gap-8">
          <Link to="/preface" className="inline-flex items-center text-[var(--primary)] font-bold uppercase tracking-widest text-xs md:text-sm hover:underline">
            Read Preface
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </Link>
          <Link to="/index-of-terms" className="inline-flex items-center text-gray-500 font-bold uppercase tracking-widest text-xs md:text-sm hover:underline">
            Index of Terms
          </Link>
          <Link to="/bibliography" className="inline-flex items-center text-gray-500 font-bold uppercase tracking-widest text-xs md:text-sm hover:underline">
            Master Bibliography
          </Link>
          <Link to="/afterword" className="inline-flex items-center text-gray-500 font-bold uppercase tracking-widest text-xs md:text-sm hover:underline">
            Afterword
          </Link>
        </div>
        <div className="border-b-2 border-gray-200 mt-6"></div>
      </header>

      {/* Table of Contents */}
      <section className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        <h2 className="book-toc-header mb-4">Table of Contents</h2>

        <div className="space-y-0">
          {chapters.map((chapter) => (
            <Link key={chapter.id} to={`/chapter/${chapter.id}`} className="book-nav-link group flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 p-3 hover:bg-gray-50">
              <span className="w-full md:w-32 font-bold text-gray-400 text-xs uppercase tracking-wider shrink-0">Chapter {chapter.number}</span>
              <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4 flex-grow">
                <span className="font-bold text-lg md:text-xl text-black group-hover:text-red-700 transition-colors leading-tight">
                  {chapter.title}
                </span>
                <span className="text-gray-400 text-sm italic">
                  — {chapter.subtitle || 'The AI Operating System'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="book-footer border-t-2 border-gray-200 mt-4 pt-4 pb-4">
        <a href="https://mulalic.ai-studio.wiki/" target="_blank" rel="noreferrer" className="hover:text-[var(--primary)] transition-colors">
          Davor Mulalić
        </a>
      </footer>
    </div>
  );
}

export default Home;

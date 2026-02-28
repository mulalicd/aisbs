
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const Search = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [index, setIndex] = useState(null);
    const [filters, setFilters] = useState({
        chapterId: '',
        type: ''
    });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const inputRef = useRef(null);

    useEffect(() => {
        // Fetch search index on component mount if not already loaded
        if (!index && isOpen) {
            setLoading(true);
            axios.get('/api/search-index')
                .then(res => {
                    setIndex(res.data.documents);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load search index:', err);
                    setLoading(false);
                });
        }
    }, [isOpen, index]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!index || !query.trim()) {
            setResults([]);
            return;
        }

        const performSearch = () => {
            const q = query.toLowerCase();
            let filtered = index.filter(doc => {
                const matchesQuery =
                    doc.title.toLowerCase().includes(q) ||
                    doc.content.toLowerCase().includes(q) ||
                    (doc.subtitle && doc.subtitle.toLowerCase().includes(q)) ||
                    doc.keywords.some(kw => kw.toLowerCase().includes(q));

                const matchesChapter = !filters.chapterId || doc.chapterId === parseInt(filters.chapterId);
                const matchesType = !filters.type || doc.type === filters.type;

                return matchesQuery && matchesChapter && matchesType;
            });

            // Simple scoring
            const scored = filtered.map(doc => {
                let score = 0;
                if (doc.title.toLowerCase().includes(q)) score += 10;
                if (doc.subtitle && doc.subtitle.toLowerCase().includes(q)) score += 5;
                if (doc.keywords.some(kw => kw.toLowerCase() === q)) score += 8;
                // Count occurrences in content
                const regex = new RegExp(q, 'gi');
                const matches = doc.content.match(regex);
                if (matches) score += matches.length;

                return { ...doc, relevance: score };
            });

            scored.sort((a, b) => b.relevance - a.relevance);
            setResults(scored.slice(0, 20)); // Limit to top 20
        };

        const timer = setTimeout(performSearch, 300);
        return () => clearTimeout(timer);
    }, [query, index, filters]);

    const toggleSearch = () => setIsOpen(!isOpen);

    const getResultUrl = (result) => {
        switch (result.type) {
            case 'chapter':
                return `/chapter/ch${result.chapterId}`;
            case 'problem':
                return `/chapter/ch${result.chapterId}/problem/${result.problemId}`;
            case 'section':
                if (result.id === 'preface') return '/preface';
                if (result.id === 'index-of-terms') return '/index-of-terms';
                if (result.id === 'master-bibliography') return '/bibliography';
                if (result.id === 'afterword') return '/afterword';
                return '/';
            default:
                return '/';
        }
    };

    const generateSnippet = (content, q) => {
        if (!q) return content.substring(0, 160) + '...';
        const idx = content.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return content.substring(0, 160) + '...';

        const start = Math.max(0, idx - 60);
        const end = Math.min(content.length, idx + q.length + 100);
        let snippet = content.substring(start, end);

        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';

        return snippet;
    };

    const handleResultClick = (result) => {
        navigate(getResultUrl(result));
        setIsOpen(false);
        setQuery('');
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            {/* Search Trigger Button - Fixed Bottom Right or Navbar */}
            <button
                onClick={toggleSearch}
                className="fixed bottom-8 left-8 z-50 w-14 h-14 bg-[var(--primary)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform md:bottom-12 md:left-12"
                aria-label="Open Search"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>

            {/* Search Modal Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

                        {/* Search Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder-gray-400"
                                placeholder="Search chapters, problems, terms..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 border border-gray-300 rounded px-1.5 py-0.5">ESC</span>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Filters Bar */}
                        <div className="px-4 py-2 border-b border-gray-100 flex flex-wrap gap-2 bg-white sticky top-0">
                            <select
                                className="text-xs font-bold uppercase tracking-wider bg-gray-100 border-none rounded-lg px-3 py-1.5 text-gray-600 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                value={filters.chapterId}
                                onChange={(e) => setFilters({ ...filters, chapterId: e.target.value })}
                            >
                                <option value="">All Chapters</option>
                                {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>Chapter {i + 1}</option>
                                ))}
                            </select>

                            <select
                                className="text-xs font-bold uppercase tracking-wider bg-gray-100 border-none rounded-lg px-3 py-1.5 text-gray-600 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="">All Types</option>
                                <option value="chapter">Chapters</option>
                                <option value="problem">Problems</option>
                                <option value="section">General</option>
                            </select>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
                            {loading ? (
                                <div className="py-12 text-center text-gray-400 italic">Initializing Intel Index...</div>
                            ) : results.length > 0 ? (
                                results.map((result) => (
                                    <div
                                        key={result.id}
                                        onClick={() => handleResultClick(result)}
                                        className="p-4 rounded-xl border border-gray-100 hover:border-[var(--primary)] hover:bg-gray-50 cursor-pointer transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] py-0.5 px-2 bg-red-50 rounded-full">
                                                {result.type}
                                            </span>
                                            {result.metadata?.industry && (
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                    {result.metadata.industry}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-black text-gray-900 leading-tight mb-1 group-hover:text-[var(--primary)] transition-colors">
                                            {result.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed italic">
                                            {generateSnippet(result.content, query)}
                                        </p>
                                    </div>
                                ))
                            ) : query.length > 0 ? (
                                <div className="py-12 text-center space-y-2">
                                    <p className="text-gray-400 font-bold uppercase tracking-widest">No Intelligence Matches</p>
                                    <p className="text-xs text-gray-400">Try broader terms or check filters.</p>
                                </div>
                            ) : (
                                <div className="py-12 text-center text-gray-300 space-y-4">
                                    <div className="flex justify-center gap-4">
                                        <span className="w-2 h-2 rounded-full bg-gray-200"></span>
                                        <span className="w-2 h-2 rounded-full bg-gray-200"></span>
                                        <span className="w-2 h-2 rounded-full bg-gray-200"></span>
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Ready for Strategic Inquiry</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center px-6">
                            <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
                                <span className="flex items-center gap-1"><kbd className="bg-white border rounded px-1">ENTER</kbd> Navigate</span>
                                <span className="flex items-center gap-1"><kbd className="bg-white border rounded px-1">ESC</kbd> Close</span>
                            </div>
                            <p className="text-[10px] font-black italic text-gray-400 uppercase tracking-widest">
                                AISBP Knowledge Engine v6.1
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Search;

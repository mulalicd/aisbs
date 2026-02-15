import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const UserManual = ({ isOpen, onClose }) => {
    const [activeSection, setActiveSection] = useState('welcome');

    // Prevent background scrolling when manual is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const sections = [
        { id: 'welcome', title: 'Start Here', icon: '🚀' },
        { id: 'nav', title: 'Navigation', icon: '🧭' },
        { id: 'exec', title: 'Execution', icon: '⚡' },
        { id: 'analysis', title: 'Analysis', icon: '📊' },
        { id: 'export', title: 'Export', icon: '📥' }
    ];

    const content = {
        welcome: (
            <div className="space-y-4 animate-fadeIn">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Welcome to AISBS</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                    <strong>AI Solved Business Problems (AISBS)</strong> is an interactive executive workbook designed to bridge the gap between business strategy and artificial intelligence.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
                    <p className="text-blue-800 text-xs font-semibold">
                        CORE PURPOSE: To simulate and solve 50 real-world challenges across 10 major industries using advanced AI modeling.
                    </p>
                </div>
                <p className="text-gray-600 text-sm">
                    This manual guides you through the process of selecting a problem, running an AI simulation, and generating actionable business intelligence.
                </p>
            </div>
        ),
        nav: (
            <div className="space-y-4 animate-fadeIn">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Navigation Guide</h3>
                <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-gray-100 p-2 rounded text-lg">📚</div>
                        <div>
                            <h4 className="font-bold text-sm text-gray-700">Dashboard</h4>
                            <p className="text-xs text-gray-500">Your central hub. Access the Table of Contents, Preface, and specialized Indexes from here.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-gray-100 p-2 rounded text-lg">📑</div>
                        <div>
                            <h4 className="font-bold text-sm text-gray-700">Chapters & Problems</h4>
                            <p className="text-xs text-gray-500">Navigate to a specific Industry Chapter (e.g., "Freight", "HR") and select a Business Problem to solve.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="bg-gray-100 p-2 rounded text-lg">🔍</div>
                        <div>
                            <h4 className="font-bold text-sm text-gray-700">Search</h4>
                            <p className="text-xs text-gray-500">Use the global search bar (Ctrl+K) to instantly find concepts, terms, or specific problems.</p>
                        </div>
                    </div>
                </div>
            </div>
        ),
        exec: (
            <div className="space-y-4 animate-fadeIn">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Executing AI Models</h3>
                <p className="text-sm text-gray-600">The <strong>Workbench</strong> is where the magic happens. It appears on the right side of every Problem page.</p>

                <div className="space-y-3 mt-4">
                    <div className="border border-slate-200 rounded p-3">
                        <div className="font-bold text-xs text-slate-700 mb-1">MODE SELECTION</div>
                        <p className="text-xs text-slate-500">
                            <span className="bg-gray-200 px-1 rounded text-gray-700 font-mono">Simulation Mode</span> uses pre-calculated mock data for instant demos.<br />
                            <span className="bg-red-100 px-1 rounded text-red-700 font-mono mt-1 inline-block">Production Mode</span> connects to real LLMs (Claude, GPT-4, Gemini) for live analysis.
                        </p>
                    </div>

                    <div className="border border-slate-200 rounded p-3">
                        <div className="font-bold text-xs text-slate-700 mb-1">DATA INPUT</div>
                        <p className="text-xs text-slate-500">
                            You can use the provided <strong>Mock Data</strong> or click <strong>Upload Structured Data</strong> to analyze your own JSON/CSV files.
                        </p>
                    </div>
                </div>
            </div>
        ),
        analysis: (
            <div className="space-y-4 animate-fadeIn">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Interpreting Results</h3>
                <p className="text-sm text-gray-600">The AI generates a comprehensive <strong>Strategic Protocol</strong> containing:</p>

                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li><strong>Executive Summary:</strong> High-level verdict and immediate recommendations.</li>
                    <li><strong>Visual Metrics:</strong> Dynamic charts showing efficiency gains, ROI, or risk reduction.</li>
                    <li><strong>Strategic Roadmap:</strong> A phased implementation plan (Weeks 1-8+).</li>
                    <li><strong>Action Plan:</strong> A specific "Monday Morning" checklist for immediate execution.</li>
                </ul>

                <div className="bg-indigo-50 p-3 rounded mt-2 border border-indigo-100">
                    <span className="text-indigo-800 text-xs font-bold">💡 Intelligence Amplifier</span>
                    <p className="text-indigo-600 text-xs mt-1">
                        Look for the "Amplifier" block at the top of the chat to see real-time confidence scores and model latency.
                    </p>
                </div>
            </div>
        ),
        export: (
            <div className="space-y-4 animate-fadeIn">
                <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Export & Reporting</h3>
                <p className="text-sm text-gray-600">Generated the perfect strategy? Take it with you.</p>

                <div className="flex flex-col gap-3 mt-2">
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded border border-gray-200">
                        <span className="text-red-500 text-xl">📄</span>
                        <div>
                            <div className="font-bold text-gray-700 text-sm">Download PDF Report</div>
                            <div className="text-xs text-gray-500">Click the "PDF Download" button in the Execution Console header to generate a professional, print-ready document.</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Manual Container */}
            <div className="relative bg-white w-full max-w-4xl h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scaleIn">

                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">USER MANUAL</h2>
                        <p className="text-xs text-slate-500 mt-1">v2.5 System Guide</p>
                    </div>

                    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${activeSection === section.id
                                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <span className="text-lg">{section.icon}</span>
                                {section.title}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-200">
                        <a
                            href="mailto:mulalic.davor@outlook.com"
                            className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                        >
                            <span>Need Help?</span>
                            <strong>Contact Support</strong>
                        </a>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    {/* Header */}
                    <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur sticky top-0 z-10">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            AISBS / Guide / {sections.find(s => s.id === activeSection)?.title}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-red-500 transition-colors"
                            title="Close Manual"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="max-w-2xl mx-auto">
                            {content[activeSection]}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                        <p className="text-[10px] text-slate-400">
                            © 2026 AI Solved Business Problems. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out forwards; }
        /* Custom Scrollbar for Manual Content */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
        </div>,
        document.body
    );
};

export default UserManual;

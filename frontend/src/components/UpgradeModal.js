import React from 'react';

const UpgradeModal = ({ isOpen, onClose, errorMessage }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all">
            <div
                className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-fadeIn"
                style={{ animation: 'fadeIn 0.3s ease-out' }}
            >
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🔑</span>
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-tighter">Premium Access Required</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors text-xl font-light"
                    >
                        ×
                    </button>
                </div>

                <div className="p-8">
                    {/* Error Message */}
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-red-700 text-xs font-bold leading-relaxed italic">
                            "{errorMessage}"
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-base font-black text-slate-900 mb-2 uppercase tracking-tight italic">Step into the Executive Suite</h3>
                            <p className="text-slate-500 text-xs leading-relaxed">
                                To unlock continuous reasoning, Production Mode (LLM), and high-velocity analysis, please inject your private API key.
                                We operate on a <strong>"Bring Your Own Intelligence"</strong> model.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 text-[11px]">
                            {[
                                { icon: '🚀', label: 'Continuous Reasoning & Context Memory' },
                                { icon: '🧠', label: 'Access to Claude 3.5 & GPT-4 Turbo' },
                                { icon: '📊', label: 'Deep Data Augmentation (Unlimited)' },
                                { icon: '🔐', label: 'Zero Data Retention Policy' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                    <span>{item.icon}</span>
                                    <span className="font-bold text-slate-700 uppercase">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={onClose}
                                className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-lg shadow-black/10 active:scale-[0.98]"
                            >
                                Return to Workbench & Add Key
                            </button>

                            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noreferrer" className="hover:text-blue-500 transition-colors">Get Gemini Key</a>
                                <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" className="hover:text-amber-600 transition-colors">Get Claude Key</a>
                                <a href="https://platform.openai.com/" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors">Get OpenAI Key</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest italic">
                        Your keys remain client-side and are never stored on our servers.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;

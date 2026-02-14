import React, { useState, useRef, useEffect } from 'react';
// External libraries (jsPDF, html2canvas) are loaded via CDN in index.html to ensure availability
// window.jspdf and window.html2canvas are used below

const Amplifier = ({ metadata, output, mode }) => {
  // If we have no metadata, don't render amplifier unless we want a generic one
  if (!output && !metadata) return null;

  // Domain-specific stats
  const latency = output?.metrics?.latency || metadata?.executionTime || '420ms';
  const confidence = output?.metrics?.confidence || (mode === 'mock' ? '100%' : '94.8%');
  const efficiency = output?.metrics?.efficiency || (metadata?.tokenEstimate ? `~${metadata.tokenEstimate} toks` : 'Optimal');

  // Dynamic Metrics Chart
  const visualMetrics = output?.metrics?.visualMetrics || [
    { label: 'Operational Velocity', value: 88, theme: 'info' },
    { label: 'Strategic Alignment', value: 92, theme: 'success' }
  ];

  const getThemeClasses = (theme, value) => {
    switch (theme?.toLowerCase() || 'info') {
      case 'success':
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-500 to-green-500';
      case 'warning':
      case 'amber':
        return 'bg-gradient-to-r from-amber-500 to-orange-500';
      case 'danger':
      case 'red':
        return 'bg-gradient-to-r from-red-500 to-rose-600';
      case 'info':
      case 'blue':
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-600';
    }
  };

  return (
    <div className="amplifier-block mt-6 p-5 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span>⚡</span> Executive Intelligence Amplifier
        </h4>
        <span className="text-[10px] font-mono text-slate-400">v2.5.0</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Latency</div>
          <div className="text-sm font-bold text-slate-700">{latency}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Confidence</div>
          <div className="text-sm font-bold text-emerald-600">{confidence}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Model</div>
          <div className="text-sm font-bold text-blue-600 truncate" title={metadata?.model || 'Simulation'}>
            {metadata?.model || 'Simulation'}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Efficiency</div>
          <div className="text-sm font-bold text-slate-700">{efficiency}</div>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="space-y-3">
        {visualMetrics.map((m, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
              <span>{m.label}</span>
              <span>{m.value}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getThemeClasses(m.theme || m.color)}`}
                style={{ width: `${m.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



const PromptSplitView = ({ prompt, onExecute }) => {
  const [inputs, setInputs] = useState({});
  const [dataSource, setDataSource] = useState('mock'); // 'mock' | 'user'
  const [mode, setMode] = useState('mock'); // 'mock' | 'llm'
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const fileInputRef = useRef(null);

  // For continuous chat
  const [followUpInput, setFollowUpInput] = useState('');


  const chatEndRef = useRef(null);
  const submitButtonRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Optimization: Use requestAnimationFrame to avoid "Forced Reflow" violations
    // during DOM updates in the conversation history.
    const scrollTask = requestAnimationFrame(() => {
      scrollToBottom();
    });
    return () => cancelAnimationFrame(scrollTask);
  }, [conversation, loading]);

  // Global handler for guided prompts from HTML strings
  useEffect(() => {
    window.handleGuidedPrompt = (promptText) => {
      setFollowUpInput(`Would you like to ${promptText}`);
      // Use setTimeout to ensure state update has propagated if needed, 
      // but clicking the button will pick up the current state if handled by form
      setTimeout(() => {
        submitButtonRef.current?.click();
      }, 50);
    };
    return () => { delete window.handleGuidedPrompt; };
  }, [conversation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const processResult = (result) => {
    if (!result || !result.success) {
      throw new Error(result?.error || result?.message || 'Execution failed without specific error.');
    }
    const output = result.output || {};
    // Handle various output structures
    const content = output.html || output.text || output.rawText || JSON.stringify(output, null, 2);
    const isHtml = !!output.html;

    return { content, isHtml, metadata: result.metadata, rawOutput: output };
  };

  const validateInputs = () => {
    if (dataSource === 'mock') return true;
    if (!prompt.inputSchema?.properties) return true;

    const required = prompt.inputSchema.required || [];
    const missing = required.filter(field => !inputs[field] || String(inputs[field]).trim() === '');

    if (missing.length > 0) {
      setError(`Missing required fields: ${missing.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleExecute = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setError(null);

    const payload = {
      ...inputs,
      _dataSource: dataSource,
      _apiKey: apiKey
    };

    const initialUserMsg = dataSource === 'mock'
      ? { role: 'user', content: 'Execute simulation with Standard Mock Data.' }
      : { role: 'user', content: `Execute with Custom Data` };

    setConversation(prev => [...prev, initialUserMsg]);

    try {
      const result = await onExecute(payload, mode);
      const { content, isHtml, metadata, rawOutput } = processResult(result);

      const aiResponse = {
        role: 'ai',
        content,
        isHtml,
        metadata,
        rawOutput // For amplifier to use
      };

      setConversation(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('[PromptSplitView] Execution error:', err);
      setError(err.message || 'Execution failed');
      setConversation(prev => [...prev, { role: 'ai', content: `System Error: ${err.message}`, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpInput.trim()) return;

    const userMsg = { role: 'user', content: followUpInput };
    setConversation(prev => [...prev, userMsg]);
    setFollowUpInput('');
    setLoading(true);

    try {
      const payload = {
        ...inputs,
        _dataSource: dataSource,
        _apiKey: apiKey,
        _followUp: followUpInput,
        _context: conversation
      };

      const result = await onExecute(payload, mode);
      const { content, isHtml, metadata, rawOutput } = processResult(result);

      const aiResponse = {
        role: 'ai',
        content,
        isHtml,
        metadata,
        rawOutput
      };
      setConversation(prev => [...prev, aiResponse]);

    } catch (err) {
      setError(err.message);
      setConversation(prev => [...prev, { role: 'ai', content: `Error: ${err.message}`, error: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('conversation-history');
    if (!element) return;

    // Access globals from CDN
    const html2canvas = window.html2canvas;
    const jsPDF = window.jspdf ? window.jspdf.jsPDF : null;

    if (!html2canvas || !jsPDF) {
      alert('PDF libraries not loaded. Please wait for the page to finish loading or check your connection.');
      return;
    }

    setLoading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`AISBS_Executive_Report_${prompt.id}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Failed to generate PDF. Please check console.');
    } finally {
      setLoading(false);
    }
  };



  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('promptId', prompt.id); // prompt is from props

    try {
      // Use fetch directly for this specific auxiliary endpoint
      const res = await fetch('/api/validate-upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        setInputs(data.data);
        setDataSource('user'); // Auto-switch to user data
        alert('File parsed successfully! Form fields populated.');
      } else {
        alert('Validation Failed: ' + (data.message || 'Unknown error'));
        console.error(data);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed. Ensure backend is running.');
    }
  };

  const hasSchema = prompt.inputSchema?.properties && Object.keys(prompt.inputSchema.properties).length > 0;

  return (
    <div className="workbench-container">
      <div className="split-view">
        {/* Left Pane: Blueprint */}
        <div className="split-pane">
          <div className="pane-header">
            <span className="pane-title">Reference Blueprint</span>
            <div className="flex items-center gap-2">
              <span className={`status-badge ${prompt.severity?.toLowerCase() || 'low'}`}>
                Impact: {prompt.severity || 'Standard'}
              </span>
            </div>
          </div>
          <div className="pane-content">
            <div className="prompt-display">
              {prompt.content || "No blueprint content available."}
            </div>
          </div>
        </div>

        {/* Right Pane: Execution Console */}
        <div className="split-pane">
          <div className="pane-header">
            <span className="pane-title">Execution Console</span>
            <div className="flex items-center gap-3">
              {conversation.length > 0 && (
                <button
                  onClick={handleDownloadPDF}
                  className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 flex items-center gap-1 transition-colors"
                  disabled={loading}
                >
                  <span className="text-red-600">PDF</span> Download Report
                </button>
              )}
              <span className={`status-badge ${mode === 'llm' ? 'live' : 'mock'}`}>
                {mode === 'llm' ? 'PRODUCTION (LLM)' : 'SIMULATION (MOCK)'}
              </span>
            </div>
          </div>

          <div className="console-wrapper">

            {/* 1. Configuration Bar */}
            <div style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid var(--border)' }}>

              {/* Mode Selection */}
              <div className="input-group mb-4">
                <div className="data-source-toggle">
                  <div
                    className={`toggle-option ${mode === 'mock' ? 'active' : ''}`}
                    onClick={() => setMode('mock')}
                  >
                    Simulation Mode
                  </div>
                  <div
                    className={`toggle-option ${mode === 'llm' ? 'active' : ''}`}
                    onClick={() => setMode('llm')}
                  >
                    Production Mode (LLM)
                  </div>
                </div>
              </div>

              {/* Data Source Toggle */}
              <div className="input-group">
                <div className="flex justify-between items-center mb-1">
                  <label>Data Input Strategy</label>
                  {dataSource === 'user' && (
                    <button
                      type="button"
                      className="text-xs text-blue-600 font-bold hover:underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📄 Upload Structured Data
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                />

                <div className="data-source-toggle" style={{ marginBottom: 0 }}>
                  <div
                    className={`toggle-option ${dataSource === 'mock' ? 'active' : ''}`}
                    onClick={() => setDataSource('mock')}
                  >
                    Use Mockup Data
                  </div>
                  <div
                    className={`toggle-option ${dataSource === 'user' ? 'active' : ''}`}
                    onClick={() => setDataSource('user')}
                  >
                    Provide Own Data
                  </div>
                </div>
              </div>

              {/* API Key Injection */}
              {mode === 'llm' && (
                <div className="mt-4">
                  <button
                    type="button"
                    className="text-xs font-bold text-gray-500 hover:text-red-600 underline"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? 'Hide Custom API Key' : '+ Use Custom API Key (Optional)'}
                  </button>

                  {showApiKey && (
                    <form className="api-key-section" onSubmit={(e) => e.preventDefault()}>
                      <label className="block text-xs font-bold mb-1">
                        Custom Provider Key (Claude/GPT)
                        {apiKey && <span className="ml-2 text-emerald-600">✓ Active</span>}
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="api-key-input"
                        placeholder="sk-..."
                        value={apiKey}
                        autoComplete="current-password"
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <div className="text-[10px] text-gray-500 mt-1">Key is used only for this session and is transmitted securely to the backend.</div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* 2. Chat / Output Area */}
            <div className="console-output-area">
              {/* Initial Input Form (Only if conversation is empty) */}
              {conversation.length === 0 && (
                <div style={{ padding: '2rem' }}>
                  {dataSource === 'user' ? (
                    <form onSubmit={handleExecute} className="execution-form">
                      {hasSchema ? (
                        Object.entries(prompt.inputSchema.properties).map(([key, schema]) => (
                          <div key={key} className="input-group">
                            <label>{key} {prompt.inputSchema.required?.includes(key) && '*'}</label>
                            {schema.type === 'array' || key.toLowerCase().includes('data') ? (
                              <textarea
                                name={key}
                                value={inputs[key] || ''}
                                onChange={handleInputChange}
                                placeholder={`Enter ${key}...`}
                              />
                            ) : (
                              <input
                                type={schema.type === 'number' ? 'number' : 'text'}
                                name={key}
                                value={inputs[key] || ''}
                                onChange={handleInputChange}
                              />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="input-group">
                          <label>Context Data</label>
                          <textarea
                            name="context"
                            value={inputs.context || ''}
                            onChange={handleInputChange}
                            placeholder="Paste business context..."
                          />
                        </div>
                      )}
                      <button type="submit" className="execute-button" disabled={loading}>
                        {loading ? 'Validating...' : 'Run Execution'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-10">
                      {/* REPLACEMENT: Davor Logo instead of Robot */}
                      <img
                        src="https://i.postimg.cc/mrZ4hsYX/davor.png"
                        alt="AI Agent"
                        className="h-20 w-auto mx-auto mb-4 object-contain contrast-125 drop-shadow-sm"
                      />
                      <h3 className="font-bold text-gray-700">Ready for Simulation</h3>
                      <p className="text-gray-500 mb-6">System will use pre-calibrated mock data for this scenario.</p>
                      <button onClick={handleExecute} className="execute-button w-full justify-center" disabled={loading}>
                        {loading ? 'Initializing Simulation...' : 'Start Simulation'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Conversation History */}
              <div id="conversation-history" style={{ padding: '1.5rem', background: '#fff' }}>
                {conversation.map((msg, idx) => (
                  <div key={idx} className={`chat-message ${msg.role}`} style={{ marginBottom: '2rem' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`chat-role-label ${msg.role}`}>
                        {msg.role === 'user' ? 'Operator' : 'AI Assistant'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="chat-message-content" style={msg.error ? { border: '1px solid red', background: '#fff5f5' } : {}}>
                      {msg.isHtml ? (
                        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: msg.content }} />
                      ) : (
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{msg.content}</pre>
                      )}

                      {/* Amplifier Rendering */}
                      {msg.role === 'ai' && !msg.error && (
                        <Amplifier metadata={msg.metadata} output={msg.rawOutput} mode={mode} />
                      )}


                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="chat-message ai">
                    <span className="chat-role-label ai">AI Assistant</span>
                    <div className="chat-message-content">
                      <div className="flex items-center gap-2">
                        <span className="animate-pulse">●</span>
                        <span className="animate-pulse delay-75">●</span>
                        <span className="animate-pulse delay-150">●</span>
                        <span className="text-sm text-gray-500 ml-2">Processing intelligence...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* 3. Follow-up Input (Bottom) */}
            {conversation.length > 0 && (
              <div style={{ padding: '1.5rem', background: '#fff', borderTop: '1px solid var(--border)' }}>
                <form onSubmit={handleFollowUp} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 font-sans follow-up-input"
                    placeholder="Refine output, ask follow-up, or request table format..."
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    ref={submitButtonRef}
                    className="bg-black text-white px-6 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
                    disabled={loading || !followUpInput.trim()}
                  >
                    ➤
                  </button>
                </form>
              </div>
            )}

            {error && !conversation.length && (
              <div className="p-4 bg-red-50 text-red-600 border-t border-red-200 text-sm font-bold text-center">
                {error}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptSplitView;

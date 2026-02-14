import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import MarkdownRenderer from '../components/MarkdownRenderer';

function ProblemView() {
  const { chapterId, problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/api/chapters/${chapterId}/problems/${problemId}`)
      .then(response => {
        setProblem(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [chapterId, problemId]);

  if (loading) return <div className="loading-container">Loading problem...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;
  if (!problem) return <div className="error-container">Problem not found</div>;

  const sections = problem.sections || {};
  const prompts = problem.prompts || [];
  const businessCase = problem.businessCase || {};
  const failureModes = problem.failureModes || [];

  return (
    <div className="problem-view-container">
      <header className="problem-header">
        <div className="problem-meta">Problem {problem.id}</div>
        <h1 className="problem-main-title">{problem.title || 'Untitled Problem'}</h1>
      </header>

      <div className="problem-content-grid">
        <div className="problem-main-column">
          {/* Section 1: Operational Reality */}
          {sections.operationalReality && (
            <section className="problem-section-card">
              <h2 className="section-title">{sections.operationalReality.title || 'The Operational Reality'}</h2>
              <div className="section-body">
                <MarkdownRenderer content={sections.operationalReality.content || sections.operationalReality} />
              </div>
            </section>
          )}

          {/* Section 2: Why Traditional Methods Fail */}
          {sections.whyTraditionalFails && (
            <section className="problem-section-card">
              <h2 className="section-title">{sections.whyTraditionalFails.title || 'Why Traditional Methods Fail'}</h2>
              <div className="section-body">
                <MarkdownRenderer content={sections.whyTraditionalFails.content || sections.whyTraditionalFails} />
              </div>
            </section>
          )}

          {/* Section 3: Manager's Decision Point */}
          {sections.managerDecisionPoint && (
            <section className="problem-section-card">
              <h2 className="section-title">{sections.managerDecisionPoint.title || "The Manager's Decision Point"}</h2>
              <div className="section-body">
                <MarkdownRenderer content={sections.managerDecisionPoint.content || sections.managerDecisionPoint} />
              </div>
            </section>
          )}

          {/* Section 4: AI-Augmented Workflow */}
          {sections.aiWorkflow && (
            <section className="problem-section-card">
              <h2 className="section-title">{sections.aiWorkflow.title || 'The AI-Augmented Workflow'}</h2>
              <div className="section-body">
                <MarkdownRenderer content={sections.aiWorkflow.content || sections.aiWorkflow} />
              </div>
            </section>
          )}
        </div>

        <div className="problem-sidebar-column">
          {/* Business Case Card */}
          {businessCase && Object.keys(businessCase).length > 0 && (
            <section className="sidebar-card business-case-card">
              <h2 className="sidebar-card-title">Business Case (ROI)</h2>
              <div className="business-case-body">
                {businessCase.currentState && (
                  <div className="case-metric-group">
                    <h3 className="metric-heading">Current State</h3>
                    <div className="metric-list">
                      {businessCase.currentState.annualFreightSpend && (
                        <div className="metric-item">
                          <span className="metric-label">Annual Spend</span>
                          <span className="metric-value">${businessCase.currentState.annualFreightSpend.toLocaleString()}</span>
                        </div>
                      )}
                      {businessCase.currentState.estimatedErrorRate && (
                        <div className="metric-item">
                          <span className="metric-label">Error Rate</span>
                          <span className="metric-value">{(businessCase.currentState.estimatedErrorRate * 100).toFixed(1)}%</span>
                        </div>
                      )}
                      {businessCase.currentState.currentAnnualLoss && (
                        <div className="metric-item">
                          <span className="metric-label">Annual Loss</span>
                          <span className="metric-value highlight-loss">${businessCase.currentState.currentAnnualLoss.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {businessCase.withAI && (
                  <div className="case-metric-group">
                    <h3 className="metric-heading">With AI Implementation</h3>
                    <div className="metric-list">
                      {businessCase.withAI.year1NetRecovery && (
                        <div className="metric-item">
                          <span className="metric-label">Year 1 Net Recovery</span>
                          <span className="metric-value highlight-gain">${businessCase.withAI.year1NetRecovery.toLocaleString()}</span>
                        </div>
                      )}
                      {businessCase.payback && businessCase.payback.months && (
                        <div className="metric-item">
                          <span className="metric-label">Payback Period</span>
                          <span className="metric-value">{businessCase.payback.months} months</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Executive Prompts Card */}
          {prompts.length > 0 && (
            <section className="sidebar-card prompts-card">
              <h2 className="sidebar-card-title">EXECUTIVE PROMPTS</h2>
              <div className="prompts-grid">
                {prompts.map((prompt, index) => (
                  <Link
                    key={prompt.id || index}
                    to={`/chapter/${chapterId}/problem/${problemId}/prompt/${prompt.id}`}
                    className="executive-prompt-link"
                  >
                    <div className="prompt-link-icon">⚡</div>
                    <div className="prompt-link-content">
                      <div className="prompt-link-title">{prompt.title || `Prompt ${index + 1}`}</div>
                      <div className="prompt-link-meta">v{prompt.version || '1.0'}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Failure Modes - Full Width Section */}
      {failureModes.length > 0 && (
        <section className="failure-modes-section">
          <h2 className="fm-section-title">Failure Modes & Recovery Strategies</h2>
          <div className="fm-grid">
            {failureModes.map((fm, index) => (
              <div key={fm.id || index} className="fm-card">
                <div className="fm-badge">Risk #{index + 1}</div>
                <h3 className="fm-title">{fm.name || 'Unnamed Scenario'}</h3>

                <div className="fm-detail">
                  <span className="fm-detail-label">Symptom</span>
                  <div className="fm-detail-text">
                    <MarkdownRenderer content={fm.symptom} />
                  </div>
                </div>

                <div className="fm-detail">
                  <span className="fm-detail-label">Root Cause</span>
                  <div className="fm-detail-text">
                    <MarkdownRenderer content={fm.rootCause} />
                  </div>
                </div>

                <div className="fm-recovery-box">
                  <h4 className="recovery-heading">Recovery Strategy</h4>
                  {typeof fm.recovery === 'string' ? (
                    <MarkdownRenderer content={fm.recovery} />
                  ) : (
                    <div className="recovery-steps">
                      {fm.recovery?.immediate && (
                        <div className="step">
                          <span className="step-tag immediate">Immediate</span>
                          <p>{fm.recovery.immediate.details || fm.recovery.immediate.action}</p>
                        </div>
                      )}
                      {fm.recovery?.shortTerm && (
                        <div className="step">
                          <span className="step-tag short-term">Short-Term</span>
                          <p>{fm.recovery.shortTerm.action || fm.recovery.shortTerm}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProblemView;


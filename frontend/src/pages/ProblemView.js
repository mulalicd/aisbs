import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ProblemView() {
  const { chapterId, problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/api/chapters/${chapterId}/problems/${problemId}`)
      .then(response => {
        console.log('Problem data received:', response.data);
        setProblem(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching problem:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [chapterId, problemId]);

  if (loading) return <div className="loading">Loading problem...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!problem) return <div className="error">Problem not found</div>;

  // Defensive data access with defaults
  const sections = problem.sections || {};
  const prompts = problem.prompts || [];
  const businessCase = problem.businessCase || {};
  const failureModes = problem.failureModes || [];

  return (
    <div className="problem-view">
      <h1>{problem.title || 'Untitled Problem'}</h1>

      {/* Section 1: Operational Reality */}
      {sections.operationalReality && (
        <section className="problem-section">
          <h2>{sections.operationalReality.title || 'The Operational Reality'}</h2>
          <div className="section-content">
            {sections.operationalReality.content || sections.operationalReality}
          </div>
        </section>
      )}

      {/* Section 2: Why Traditional Methods Fail */}
      {sections.whyTraditionalFails && (
        <section className="problem-section">
          <h2>{sections.whyTraditionalFails.title || 'Why Traditional Methods Fail'}</h2>
          <div className="section-content">
            {sections.whyTraditionalFails.content || sections.whyTraditionalFails}
          </div>
        </section>
      )}

      {/* Section 3: Manager's Decision Point */}
      {sections.managerDecisionPoint && (
        <section className="problem-section">
          <h2>{sections.managerDecisionPoint.title || "The Manager's Decision Point"}</h2>
          <div className="section-content">
            {sections.managerDecisionPoint.content || sections.managerDecisionPoint}
          </div>
        </section>
      )}

      {/* Section 4: AI-Augmented Workflow */}
      {sections.aiWorkflow && (
        <section className="problem-section">
          <h2>{sections.aiWorkflow.title || 'The AI-Augmented Workflow'}</h2>
          <div className="section-content">
            {sections.aiWorkflow.content || sections.aiWorkflow}
          </div>
        </section>
      )}

      {/* Business Case */}
      {businessCase && Object.keys(businessCase).length > 0 && (
        <section className="problem-section business-case">
          <h2>The Business Case</h2>
          <div className="roi-calculator">
            {businessCase.currentState && (
              <div className="current-state">
                <h3>Current State</h3>
                <ul>
                  {businessCase.currentState.annualFreightSpend && (
                    <li>Annual Spend: ${businessCase.currentState.annualFreightSpend.toLocaleString()}</li>
                  )}
                  {businessCase.currentState.estimatedErrorRate && (
                    <li>Error Rate: {(businessCase.currentState.estimatedErrorRate * 100).toFixed(1)}%</li>
                  )}
                  {businessCase.currentState.currentAnnualLoss && (
                    <li>Annual Loss: ${businessCase.currentState.currentAnnualLoss.toLocaleString()}</li>
                  )}
                </ul>
              </div>
            )}
            {businessCase.withAI && (
              <div className="with-ai">
                <h3>With AI Implementation</h3>
                <ul>
                  {businessCase.withAI.year1NetRecovery && (
                    <li>Year 1 Net Recovery: ${businessCase.withAI.year1NetRecovery.toLocaleString()}</li>
                  )}
                  {businessCase.payback && businessCase.payback.months && (
                    <li>Payback: {businessCase.payback.months} months</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Prompts */}
      {prompts.length > 0 && (
        <section className="problem-section prompts">
          <h2>Executive Prompts</h2>
          <div className="prompts-list">
            {prompts.map((prompt, index) => (
              <Link 
                key={prompt.id || index}
                to={`/chapter/${chapterId}/problem/${problemId}/prompt/${prompt.id}`}
                className="prompt-card"
              >
                <div className="prompt-title">{prompt.title || `Prompt ${index + 1}`}</div>
                <div className="prompt-meta">
                  {prompt.version && `Version: ${prompt.version}`}
                  {prompt.severity && ` | Severity: ${prompt.severity}`}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Failure Modes */}
      {failureModes.length > 0 && (
        <section className="problem-section failure-modes">
          <h2>What Goes Wrong & How to Recover</h2>
          {failureModes.map((fm, index) => (
            <div key={fm.id || index} className="failure-mode">
              <h3>Failure Mode #{index + 1}: {fm.name || 'Unnamed Failure Mode'}</h3>
              {fm.symptom && (
                <div className="fm-symptom">
                  <strong>What You See:</strong> {fm.symptom}
                </div>
              )}
              {fm.rootCause && (
                <div className="fm-cause">
                  <strong>Why It Happens:</strong> {fm.rootCause}
                </div>
              )}
              {fm.recovery && (
                <div className="fm-recovery">
                  <strong>How to Recover:</strong>
                  {fm.recovery.immediate && (
                    <div className="immediate">
                      <h4>Immediate (24hr):</h4>
                      <p>{fm.recovery.immediate.details || fm.recovery.immediate.action}</p>
                    </div>
                  )}
                  {fm.recovery.shortTerm && (
                    <div className="short-term">
                      <h4>Short-Term:</h4>
                      <p>{fm.recovery.shortTerm.action || fm.recovery.shortTerm}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <section className="debug-info" style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', fontSize: '0.8rem' }}>
          <details>
            <summary>Debug Info (Click to expand)</summary>
            <pre style={{ overflow: 'auto', maxHeight: '300px' }}>
              {JSON.stringify(problem, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </div>
  );
}

export default ProblemView;

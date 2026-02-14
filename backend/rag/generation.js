/**
 * RAG Generation System - Output Generation (Mock or LLM)
 * Produces execution results
 */

/**
 * Generate response (mock or LLM-based)
 * @param {string} augmentedPrompt - Prompt ready for execution
 * @param {Object} promptMetadata - Original prompt object
 * @param {string} mode - 'mock' or 'llm'
 * @param {Object} options - Optional configuration
 * @returns {Promise<Object>} - Generated output
 */
async function generate(augmentedPrompt, promptMetadata, mode = 'mock', options = {}) {
  const startTime = Date.now();

  try {
    if (mode === 'mock') {
      return generateMock(promptMetadata, startTime, options);
    } else if (mode === 'llm') {
      return await generateLLM(augmentedPrompt, promptMetadata, startTime, options);
    } else {
      throw new Error(`Invalid generation mode: ${mode}. Use 'mock' or 'llm'.`);
    }
  } catch (error) {
    // Return error response
    return {
      success: false,
      mode,
      timestamp: new Date().toISOString(),
      promptId: promptMetadata.id,
      error: error.message,
      metadata: {
        executionTime: Date.now() - startTime + 'ms',
        status: 'FAILED'
      }
    };
  }
}

/**
 * Generate mock output from prompt metadata
 */
function generateMock(promptMetadata, startTime, options = {}) {
  // Generate realistic, formatted output based on prompt type and context
  const mockOutput = generateRealisticMockOutput(promptMetadata, options.context);

  return {
    success: true,
    mode: 'mock',
    timestamp: new Date().toISOString(),
    promptId: promptMetadata.id,
    output: mockOutput,
    metadata: {
      executionTime: (Date.now() - startTime) + 'ms',
      model: 'Mock Deterministic Generator v2.1',
      status: 'SUCCESS',
      note: 'This is simulated output. Switch to "Production Mode" for real AI analysis.',
      tokenEstimate: 450 // rough average
    }
  };
}

/**
 * Generate a professional ROI table with calculations
 */
function generateROITable(data, style) {
  const { tableStyle, thStyle, tdStyle } = style;
  return `
    <table style="${tableStyle}">
      <thead>
        <tr>
          <th style="${thStyle}">Economic Lever</th>
          <th style="${thStyle}">Current State</th>
          <th style="${thStyle}">Optimized State</th>
          <th style="${thStyle}">Annual Impact</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td style="${tdStyle}">${row.lever}</td>
            <td style="${tdStyle}">${row.current}</td>
            <td style="${tdStyle}">${row.optimized}</td>
            <td style="${tdStyle} color: #059669; font-weight: bold;">${row.impact}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

/**
 * Generate a visual CSS-based bar chart for metrics
 */
function generateVisualChart(title, data, style) {
  return `
    <div style="margin: 20px 0; background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px;">
      <h4 style="margin: 0 0 16px 0; font-size: 13px; color: #374151; text-transform: uppercase; letter-spacing: 0.05em;">📊 ${title}</h4>
      <div style="display: grid; gap: 12px;">
        ${data.map(item => `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #4b5563;">
              <span>${item.label}</span>
              <span style="font-weight: 700;">${item.value}%</span>
            </div>
            <div style="height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
              <div style="height: 100%; width: ${item.value}%; background: ${item.color || '#3b82f6'}; border-radius: 4px;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Generate a phased strategic roadmap
 */
function generateStrategicRoadmap(phases) {
  return `
    <div style="margin: 24px 0; border-left: 2px solid #e5e7eb; padding-left: 20px; margin-left: 10px;">
      <h4 style="margin: 0 0 20px -20px; font-size: 13px; color: #111827; text-transform: uppercase; font-weight: 800;">🗺️ STRATEGIC ROADMAP (PHASED ROLLOUT)</h4>
      ${phases.map((phase, idx) => `
        <div style="position: relative; margin-bottom: 24px;">
          <div style="position: absolute; left: -31px; top: 0; width: 20px; height: 20px; background: #111827; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">
            ${idx + 1}
          </div>
          <div style="font-weight: 700; color: #111827; font-size: 14px; margin-bottom: 4px;">${phase.title} <span style="font-weight: 400; color: #6b7280; font-size: 12px;">(${phase.timeline})</span></div>
          <div style="font-size: 13px; color: #4b5563;">${phase.desc}</div>
          <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
            ${phase.milestones.map(m => `<span style="background: #f3f4f6; padding: 2px 8px; border-radius: 12px; font-size: 10px; color: #374151; border: 1px solid #e5e7eb;">✓ ${m}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Generate an executive "Monday Morning Action Plan"
 */
function generateActionPlan(actions, style) {
  const { highlightBoxStyle } = style;
  return `
    <div style="${highlightBoxStyle} border-left-color: #111827; background: #f3f4f6;">
      <h4 style="margin: 0 0 12px 0; color: #111827; text-transform: uppercase; font-size: 13px; letter-spacing: 0.1em;">📅 Monday Morning Action Plan</h4>
      <div style="display: grid; gap: 12px;">
        ${actions.map((action, idx) => `
          <div style="font-size: 13px;">
            <div style="font-weight: 700; color: #111827; margin-bottom: 2px;">${idx + 1}. ${action.title}</div>
            <div style="color: #4b5563;">${action.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Generate three guided prompts for the user
 */
function generateGuidedPrompts(prompts) {
  return `
    <div style="margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      <h4 style="font-size: 13px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">Next Strategic Steps</h4>
      <div style="display: grid; gap: 10px;">
        ${prompts.map(p => `
          <button 
            class="guided-prompt-btn" 
            onclick="window.handleGuidedPrompt && window.handleGuidedPrompt('${p.replace(/'/g, "\\'")}')"
            style="display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; padding: 12px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; color: #1e2937; cursor: pointer; transition: all 0.2s; font-family: inherit;"
            onmouseover="this.style.borderColor='#3b82f6'; this.style.backgroundColor='#f8fafc';" 
            onmouseout="this.style.borderColor='#e2e8f0'; this.style.backgroundColor='white';"
          >
            <span style="color: #3b82f6; font-weight: bold;">➔</span>
            <span>Would you like to <strong>${p}</strong>?</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Generate realistic mock output based on prompt context
 */
function generateRealisticMockOutput(prompt, context = {}) {
  const title = prompt.title || 'Analysis';
  const content = (prompt.content || '') + (prompt.promptCode || '');

  // Get Context (if available) - Improved for Robustness
  const chapterId = context.chapter?.id || '';
  const chapterTitle = context.chapter?.title || context.chapter || '';
  const problemTitle = context.problem?.title || context.problem || '';

  // Style Constants
  const containerStyle = "font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1f2937; line-height: 1.6; max-width: 100%;";
  const sectionTitleStyle = "font-size: 14px; font-weight: 700; color: #6b7280; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 8px; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; margin-top: 24px;";
  const highlightBoxStyle = "background: #f9fafb; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 4px;";
  const tableStyle = "width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;";
  const thStyle = "text-align: left; padding: 8px 12px; background: #f3f4f6; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151;";
  const tdStyle = "padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937;";

  let bodyHtml = '';
  let summaryText = '';
  let type = 'analysis';
  let metrics = {
    latency: '420ms',
    confidence: '100%',
    efficiency: 'Optimal',
    visualMetrics: []
  };

  // --- LOGIC: DOMAIN DETECTION (Strict + Regex Fallback) ---
  const isFreight = chapterId === 'ch1' || /freight|logistics|supply chain|shipping/i.test(chapterTitle) || (/freight/i.test(problemTitle) && !/fraud/i.test(problemTitle));
  const isHR = chapterId === 'ch3' || /talent|hr|recruiting|hiring|people|culture/i.test(chapterTitle) || /talent|hr/i.test(problemTitle);
  const isManufacturing = chapterId === 'ch4' || /manufacturing|production|factory|plant/i.test(chapterTitle);
  const isHealthcare = chapterId === 'ch6' || /health|medical|patient|clinical|adherence/i.test(chapterTitle) || /patient|coach/i.test(problemTitle);
  const isFinance = chapterId === 'ch7' || /finance|banking|fraud|capital|lending|compliance|kyc/i.test(chapterTitle) || /fraud|kyc|variance|credit|onboarding/i.test(problemTitle);
  const isSales = chapterId === 'ch8' || /sales|marketing|revenue|gtm|go-to-market|lead/i.test(chapterTitle) || /sales|marketing|hook|triage/i.test(problemTitle);
  const isLegal = /legal|contract|compliance|regulatory/i.test(chapterTitle) || /contract|policy/i.test(problemTitle);

  // --- FAILURE MODE INTEGRATION (New Context Feature) ---
  const failureModes = context.problem?.failureModes || [];
  let riskMitigationHtml = '';

  if (failureModes.length > 0) {
    riskMitigationHtml = `
      <div style="margin-top: 32px; border-top: 1px dashed #d1d5db; padding-top: 16px;">
        <h4 style="font-size: 13px; color: #ef4444; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; font-weight: 700;">
          ⚠️ Risk Mitigation & Guardrails
        </h4>
        <div style="display: grid; gap: 12px;">
          ${failureModes.slice(0, 2).map(fm => `
            <div style="background: #fff5f5; border: 1px solid #fee2e2; padding: 12px; border-radius: 4px;">
              <div style="font-weight: 600; font-size: 13px; color: #991b1b; margin-bottom: 4px;">Potential Failure Mode: ${fm.title}</div>
              <div style="font-size: 12px; color: #7f1d1d;"><strong>Symptom:</strong> ${fm.symptom || 'N/A'}</div>
              <div style="font-size: 11px; color: #b91c1c; margin-top: 6px; font-style: italic;">Recovery: ${fm.recovery ? fm.recovery.substring(0, 100) + '...' : 'Refer to manual.'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- SCENARIO 1: FREIGHT & LOGISTICS (Precision Standard) ---
  if (isFreight) {
    type = 'audit';
    summaryText = "Executed CSCMP-compliant Freight Audit. Identified $3,240 (7.8%) in recoverable leakage.";
    metrics.visualMetrics = [
      { label: 'Operational Velocity', value: 88, color: 'blue' },
      { label: 'Strategic Alignment', value: 92, color: 'emerald' }
    ];
    bodyHtml = `
      <div style="background: #1e3a8a; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; margin-bottom: 12px; opacity: 0.9; font-weight: 700;">Strategic Assessment Protocol: LOG-V4</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.2;">🚨 LOGISTICS LEAKAGE DIAGNOSTIC</h1>
        <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="font-size: 13px;"><strong>Node:</strong> ${problemTitle}</div>
          <div style="font-size: 13px;"><strong>Standard:</strong> CSCMP-ASMP-LOG-004</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #15803d; font-weight: 700;">Data Integrity</div>
          <div style="font-size: 18px; font-weight: 800; color: #166534;">98.4%</div>
        </div>
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #b91c1c; font-weight: 700;">Rate Variance</div>
          <div style="font-size: 18px; font-weight: 800; color: #991b1b;">+14.2%</div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #1e40af; font-weight: 700;">Recovery Pot.</div>
          <div style="font-size: 18px; font-weight: 800; color: #1e3a8a;">$12.4k/mo</div>
        </div>
      </div>

      <h3 style="${sectionTitleStyle}">1.0 SIGNAL-TO-NOISE AUDIT</h3>
      <p style="font-size: 13px; color: #4b5563; margin-bottom: 16px;">
        Analyzing <strong>142 line-item entries</strong> across primary carrier contracts. Reconciling dimensional weight (DIM) violations against negotiated base rates and surcharges.
      </p>

      ${generateVisualChart('Carrier Performance Metrics', [
      { label: 'On-Time Delivery (OTD)', value: 84, color: '#10b981' },
      { label: 'DIM Weight Accuracy', value: 68, color: '#f59e0b' },
      { label: 'Invoice Precision', value: 92, color: '#3b82f6' },
      { label: 'Claim Recovery Ratio', value: 42, color: '#ef4444' }
    ])}

      <h3 style="${sectionTitleStyle}">2.0 ECONOMIC IMPACT MODEL</h3>
      ${generateROITable([
      { lever: 'DIM Weight Scrubbing', current: '14.2% Error', optimized: '1.2% Error', impact: '$4,240' },
      { lever: 'Accessorial Slop', current: '$1,840/mo', optimized: '$240/mo', impact: '$19,200/yr' },
      { lever: 'Duplicate Billing Loop', current: '2.1% Frequency', optimized: '0.0% Frequency', impact: '$2,160' },
      { lever: 'Carrier Rate Arbitrage', current: 'Static', optimized: 'Dynamic', impact: '$18,400' }
    ], { tableStyle, thStyle, tdStyle })}

      <h3 style="${sectionTitleStyle}">3.0 TECHNICAL ROOT CAUSE</h3>
      <div style="${highlightBoxStyle} border-left-color: #2563eb; background: #f0f7ff;">
        <div style="font-weight: 800; font-size: 14px; color: #1e3a8a; margin-bottom: 8px;">SYSTEMIC DIAGNOSTIC: CCRL FAILURE</div>
        <p style="font-size: 13px; color: #1e40af; margin: 0;">
          Detected systemic 'Service Failure' mismatch in UPS/FedEx electronic data interchange (EDI) 210 status. 
          8.2% of Ground shipments missed the 4-day delivery window without triggering the <strong>Carrier Claim Recovery Loop (CCRL)</strong>.
        </p>
        <ul style="font-size: 12px; margin: 12px 0 0 0; color: #1e40af;">
          <li><strong>Audit Trail:</strong> Zero (0) auto-refunds detected in the last rolling 90 days.</li>
          <li><strong>Mismatched Logic:</strong> Carrier E-billing platform defaults to 'Delivered' regardless of window breach.</li>
          <li><strong>Visibility Gap:</strong> Primary TMS lacks specific 'Window Breach' flags in the reconciliation view.</li>
        </ul>
      </div>

      <h3 style="${sectionTitleStyle}">4.0 STRATEGIC ROADMAP</h3>
      ${generateStrategicRoadmap([
      {
        title: 'Infrastructure Stabilization',
        timeline: 'Week 1-2',
        desc: 'Redirect all EDI 210 feeds through the RAG-based audit layer to freeze billing on identified failures.',
        milestones: ['EDI Redirect', 'Failure-Mode Mapping', 'Claim Freeze']
      },
      {
        title: 'Contract Renegotiation',
        timeline: 'Week 3-6',
        desc: 'Trigger the "Hard-Cap" clause for Accessorial surcharges and enforce auto-refund CCRL protocol.',
        milestones: ['Clause Audit', 'Vendor Negotiation', 'CCRL Activation']
      },
      {
        title: 'Autonomous Oversight',
        timeline: 'Week 7+',
        desc: 'Deploy the full RAG-reconciler to handle 100% of line-item verification without human oversight.',
        milestones: ['Model Tuning', 'Shadow Mode Test', 'Full Rollout']
      }
    ])}

      <h3 style="${sectionTitleStyle}">5.0 EXECUTIVE SUMMARY (CMO/COO)</h3>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; font-size: 13px; color: #334155;">
        <p style="margin: 0 0 12px 0;"><strong>Strategic Verdict:</strong> The current logistics setup is suffering from <strong>"Ghost Leakage"</strong>. Your carriers are meeting their service level agreements (SLAs) on paper, but the actual delivery windows are slipping at a rate that is costing the bottom line $12.4k per month in unrecovered claims.</p>
        <p style="margin: 0;"><strong>Immediate Recommendation:</strong> Execute the Claim Freeze protocol immediately for the 32 specific Service Failures identified in the current batch.</p>
      </div>

      ${generateActionPlan([
      { title: 'Immediate Claim Freeze', desc: 'Notify carriers of 32 specific Service Failures identified in this audit snippet and halt pending invoices.' },
      { title: 'TMS Sync Refresh', desc: 'Update the Transport Management System reconciliation parameters to flag 4-day window breaches automatically.' },
      { title: 'RAG-Auditor Activation', desc: 'Deploy the RAG-based auto-reconciler to prevent future batch-file csv slop and automate recovery.' }
    ], { highlightBoxStyle })}

      ${generateGuidedPrompts([
      'drill down into the specific Service Failures by region',
      'generate a formal carrier dispute letter template',
      'simulate the ROI of a 10% rate reduction across all Ground shipments'
    ])}
    `;

    // --- SCENARIO 2: HR & TALENT MANAGEMENT (Precision Standard) ---
  } else if (isHR) {
    type = 'hr_analysis';
    summaryText = "Talent Velocity Analysis Complete. Identified $84k in annual Productivity Drag.";
    metrics.visualMetrics = [
      { label: 'Sourcing Quality', value: 72, color: 'blue' },
      { label: 'Hiring Velocity', value: 84, color: 'emerald' }
    ];
    bodyHtml = `
      <div style="background: #065f46; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; margin-bottom: 12px; opacity: 0.9; font-weight: 700;">People & Culture Strategic Protocol: Talent-V12</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.2;">🚀 TALENT VELOCITY DIAGNOSTIC</h1>
        <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="font-size: 13px;"><strong>Node:</strong> ${problemTitle}</div>
          <div style="font-size: 13px;"><strong>Model:</strong> V-CORE Talent Metric</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #15803d; font-weight: 700;">Fill Velocity</div>
          <div style="font-size: 18px; font-weight: 800; color: #166534;">Low</div>
        </div>
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #b91c1c; font-weight: 700;">Churn Risk</div>
          <div style="font-size: 18px; font-weight: 800; color: #991b1b;">High</div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #1e40af; font-weight: 700;">Productivity Drag</div>
          <div style="font-size: 18px; font-weight: 800; color: #1e3a8a;">$84k/yr</div>
        </div>
      </div>

      <h3 style="${sectionTitleStyle}">1.0 PIPELINE FRICTION ANALYSIS</h3>
      <p style="font-size: 13px; color: #4b5563; margin-bottom: 16px;">
        Analyzing <strong>Workday/Greenhouse</strong> telemetry data. Identified significant 'Review Stagnation' in the Stage 2 technical evaluation loop.
      </p>

      ${generateVisualChart('Recruitment Pipeline Efficiency', [
      { label: 'Sourcing Quality', value: 72, color: '#10b981' },
      { label: 'Interview Consistency', value: 45, color: '#f59e0b' },
      { label: 'Offer Acceptance Rate', value: 88, color: '#3b82f6' },
      { label: 'Time-to-Productivity', value: 34, color: '#ef4444' }
    ])}

      <h3 style="${sectionTitleStyle}">2.0 RECRUITING ROI MODEL</h3>
      ${generateROITable([
      { lever: 'Scheduling Friction', current: '12 Days', optimized: '3 Days', impact: '$14,400' },
      { lever: 'Candidate Drop-off', current: '42.1%', optimized: '12.4%', impact: '$42,000' },
      { lever: 'Interviewer Burnout', current: 'High', optimized: 'Managed', impact: '14% Retention' },
      { lever: 'Agency Fees', current: '$180k/yr', optimized: '$45k/yr', impact: '$135,000' }
    ], { tableStyle, thStyle, tdStyle })}

      <h3 style="${sectionTitleStyle}">3.0 TECHNICAL ROOT CAUSE</h3>
      <div style="${highlightBoxStyle} border-left-color: #059669; background: #f0fdf4;">
        <div style="font-weight: 800; font-size: 14px; color: #065f46; margin-bottom: 8px;">SYSTEMIC DIAGNOSTIC: INTERVIEW ASYMMETRY</div>
        <p style="font-size: 13px; color: #064e3b; margin: 0;">
          Detected a <strong>"Sentiment Gap"</strong> between Hiring Manager feedback and Candidate Experience scores. 
          Candidates are reporting "Technical Disconnects" during the Stage 2 deep-dive.
        </p>
        <ul style="font-size: 12px; margin: 12px 0 0 0; color: #064e3b;">
          <li><strong>Wait Time:</strong> Average 18.4 hours between interview and scoring.</li>
          <li><strong>Bias Marker:</strong> 62% of rejected candidates had 'High-Potential' markers in initial sourcing.</li>
          <li><strong>Cultural Sensitivity:</strong> Lack of SDOH-aware accommodation flags in the interview guide.</li>
        </ul>
      </div>

      <h3 style="${sectionTitleStyle}">4.0 STRATEGIC ROADMAP</h3>
      ${generateStrategicRoadmap([
      {
        title: 'Infrastructure Harmonization',
        timeline: 'Week 1-3',
        desc: 'Deploy the RAG-based interview generator to standardize Stage 2 technical prompts across all departments.',
        milestones: ['Template Sync', 'HM Training', 'Baseline Reset']
      },
      {
        title: 'Autonomous Scheduling',
        timeline: 'Week 4-6',
        desc: 'Activate the AI-scheduling layer to bypass manual calendar slop and reduce Stage-to-Stage latency.',
        milestones: ['Calendar API Sync', 'SLA Policy Def.', 'Live Pilot']
      },
      {
        title: 'Predictive Culture Loop',
        timeline: 'Week 8+',
        desc: 'Integrate real-time sentiment analysis for interview scoring to identify and mitigate subconscious bias.',
        milestones: ['Sentiment Engine', 'Bias Audit V1', 'Full Deployment']
      }
    ])}

      <h3 style="${sectionTitleStyle}">5.0 EXECUTIVE SUMMARY (CHRO)</h3>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; font-size: 13px; color: #334155;">
        <p style="margin: 0 0 12px 0;"><strong>Strategic Verdict:</strong> Your recruitment engine is leaking its best talent at the <strong>Stage 2 "Black Hole"</strong>. The lack of standardized scoring is creating high variance in hire quality and extending the fill-time by 18 days beyond the industry benchmark.</p>
        <p style="margin: 0;"><strong>Immediate Recommendation:</strong> Implement the standardized technical prompt library immediately to stabilize the Stage 2 evaluation process.</p>
      </div>

      ${generateActionPlan([
      { title: 'Standardize Technical Prompts', desc: 'Deploy the RAG-generated library for the next 5 Engineering hires to eliminate Stage 2 scoring variance.' },
      { title: 'SLA Enforcement', desc: 'Notify all Hiring Managers of the new "24-Hour Feedback Rule" to reduce candidate drop-off.' },
      { title: 'Bias Audit Trigger', desc: 'Run the current scorecard data through the AI-auditor to identify specific HM bias patterns.' }
    ], { highlightBoxStyle })}

      ${generateGuidedPrompts([
      'analyze candidate drop-off by specific engineering sub-team',
      'refine the Stage 2 technical evaluation rubric for Senior roles',
      'simulate the cost-to-hire impact of reducing fill-time by 10 days'
    ])}
    `;

    // --- SCENARIO 3: MANUFACTURING (Precision Standard) ---
  } else if (isManufacturing) {
    type = 'manufacturing_opt';
    summaryText = "Production Sequence Optimized. Recovers 14.2% hidden capacity in Shift B.";
    metrics.visualMetrics = [
      { label: 'OEE Optimization', value: 85, color: 'blue' },
      { label: 'Yield Stability', value: 99, color: 'emerald' }
    ];
    bodyHtml = `
      <div style="background: #92400e; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; margin-bottom: 12px; opacity: 0.9; font-weight: 700;">Industrial Systems Protocol: MFG-V7</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.2;">🏭 MANUFACTURING THROUGHPUT AUDIT</h1>
        <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="font-size: 13px;"><strong>Node:</strong> ${problemTitle}</div>
          <div style="font-size: 13px;"><strong>Standard:</strong> LEAN-SIX-SIGMA-2.1</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #15803d; font-weight: 700;">Target OEE</div>
          <div style="font-size: 18px; font-weight: 800; color: #166534;">85%</div>
        </div>
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #b91c1c; font-weight: 700;">Current OEE</div>
          <div style="font-size: 18px; font-weight: 800; color: #991b1b;">62.4%</div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #1e40af; font-weight: 700;">Capacity Gap</div>
          <div style="font-size: 18px; font-weight: 800; color: #1e3a8a;">22.6%</div>
        </div>
      </div>

      <h3 style="${sectionTitleStyle}">1.0 OEE (OVERALL EQUIPMENT EFFECTIVENESS) DIAGNOSTIC</h3>
      <p style="font-size: 13px; color: #4b5563; margin-bottom: 16px;">
        Analyzing <strong>IoT telemetry</strong> from Line 4. Identifying micro-stoppages and setup-time variance across 3 shifts.
      </p>

      ${generateVisualChart('OEE Component Breakdown', [
      { label: 'Availability (Uptime)', value: 74, color: '#10b981' },
      { label: 'Performance (Speed)', value: 62, color: '#f59e0b' },
      { label: 'Quality (Yield)', value: 99, color: '#3b82f6' },
      { label: 'Changeover Efficiency', value: 41, color: '#ef4444' }
    ])}

      <h3 style="${sectionTitleStyle}">2.0 CAPACITY RECOVERY MODEL</h3>
      ${generateROITable([
      { lever: 'Setup Changeover', current: '240m/avg', optimized: '85m/avg', impact: '$84,500' },
      { lever: 'Idle Micro-Stops', current: '14/hr', optimized: '2/hr', impact: '$32,400' },
      { lever: 'Scrap Rate (Material)', current: '4.2%', optimized: '1.1%', impact: '$18,200' },
      { lever: 'Shift Transitional Drag', current: '18m', optimized: '2m', impact: '$12,400' }
    ], { tableStyle, thStyle, tdStyle })}

      <h3 style="${sectionTitleStyle}">3.0 TECHNICAL ROOT CAUSE</h3>
      <div style="${highlightBoxStyle} border-left-color: #d97706; background: #fffbeb;">
        <div style="font-weight: 800; font-size: 14px; color: #92400e; margin-bottom: 8px;">SYSTEMIC DIAGNOSTIC: BATCH-MISMATCH</div>
        <p style="font-size: 13px; color: #78350f; margin: 0;">
          Detected SKU-family mismatch in Line 4 sequencing. Running "High-Vis" color plastics immediately after "Standard" requires full wash-down of the injection manifolds. 
        </p>
        <ul style="font-size: 12px; margin: 12px 0 0 0; color: #78350f;">
          <li><strong>Wait Time:</strong> 155 minutes wasted in mandatory transitional cleaning.</li>
          <li><strong>Energy Slop:</strong> 12% increase in BTU load during high-heat wash cycles.</li>
          <li><strong>Predictive Lag:</strong> Current MES lacks "Transitional Buffer" calculation in the Job queue.</li>
        </ul>
      </div>

      <h3 style="${sectionTitleStyle}">4.0 STRATEGIC ROADMAP</h3>
      ${generateStrategicRoadmap([
      {
        title: 'Sequence Stabilization',
        timeline: 'Week 1-2',
        desc: 'Redirect Job Queue through the RAG-sequencer to re-group Group B (High-Vis) before Group A (Standard).',
        milestones: ['Queue Redirect', 'SKU Mapping', 'Wash-down Audit']
      },
      {
        title: 'Sensor Recalibration',
        timeline: 'Week 3-4',
        desc: 'Execute field-recalibration of IoT pressure sensors on Line 4 to eliminate phantom micro-stops.',
        milestones: ['Sensor Audit', 'Firmware Patch', 'Live Validation']
      },
      {
        title: 'Autonomous Throughput',
        timeline: 'Week 6+',
        desc: 'Deploy the full RAG-MES-Bridge to automate job sequencing based on real-time raw material viscosity.',
        milestones: ['MES Integration', 'Viscosity Triage', 'Full Rollout']
      }
    ])}

      <h3 style="${sectionTitleStyle}">5.0 EXECUTIVE SUMMARY (COO)</h3>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; font-size: 13px; color: #334155;">
        <p style="margin: 0 0 12px 0;"><strong>Strategic Verdict:</strong> Your factory floor is suffering from **"Operational Friction"** caused by sub-optimal sequencing. Line 4 is effectively operating at only 62% of its theoretical capacity due to avoidable cleaning overhead.</p>
        <p style="margin: 0;"><strong>Immediate Recommendation:</strong> Re-sequence the 8-job schedule for Shift B immediately to recover 2.5 hours of hidden capacity.</p>
      </div>

      ${generateActionPlan([
      { title: 'Shift Re-Sequence Trigger', desc: 'Execute the optimized 8-job schedule immediately to recover 2.5 hours of uptime for Line 4.' },
      { title: 'IoT Sensor Reset', desc: 'Recalibrate the pressure transducers on Line 4 to prevent phantom micro-stoppages detected in the telemetry.' },
      { title: 'Wash-down Protocol Audit', desc: 'Verify cleaning chemical concentration to ensure wash-down cycles meet the 85-minute target.' }
    ], { highlightBoxStyle })}

      ${generateGuidedPrompts([
      'optimize the sequence for the upcoming high-viscosity product run',
      'analyze the OEE drift over the last 30 days for Line 4',
      'generate a preventative maintenance schedule based on micro-stop telemetry'
    ])}
    `;

    // --- SCENARIO 4: LEGAL & CONTRACTS (Precision Standard) ---
  } else if (isLegal) {
    type = 'legal_review';
    summaryText = "Contract Risk Scan Complete. Flagged 2 high-exposure liability clauses.";
    metrics.visualMetrics = [
      { label: 'Liability Mitigation', value: 94, color: 'red' },
      { label: 'Regulatory Coverage', value: 82, color: 'blue' }
    ];
    bodyHtml = `
      <div style="background: #450a0a; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; margin-bottom: 12px; opacity: 0.9; font-weight: 700;">General Counsel Strategic Protocol: LEG-V9</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.2;">⚖️ CONTRACTUAL EXPOSURE AUDIT</h1>
        <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="font-size: 13px;"><strong>Node:</strong> ${problemTitle}</div>
          <div style="font-size: 13px;"><strong>Standard:</strong> SOX-404-LEGAL</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #991b1b; font-weight: 700;">Liability Cap</div>
          <div style="font-size: 18px; font-weight: 800; color: #b91c1c;">UNCAPPED</div>
        </div>
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #991b1b; font-weight: 700;">Risk Rating</div>
          <div style="font-size: 18px; font-weight: 800; color: #b91c1c;">92/100</div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #1e40af; font-weight: 700;">Recovery Pot.</div>
          <div style="font-size: 18px; font-weight: 800; color: #1e3a8a;">$2.4M</div>
        </div>
      </div>

      <h3 style="${sectionTitleStyle}">1.0 CLAUSE RISK TOPOGRAPHY</h3>
      <p style="font-size: 13px; color: #4b5563; margin-bottom: 16px;">
        Analyzing <strong>Master Service Agreement (MSA)</strong> for adversarial phrasing, uncapped liabilities, and "Shadow Indemnity" triggers.
      </p>

      ${generateVisualChart('Contractual Risk Distribution', [
      { label: 'Liability Exposure', value: 94, color: '#ef4444' },
      { label: 'Indemnification Scope', value: 82, color: '#f59e0b' },
      { label: 'Data Sovereignty', value: 65, color: '#3b82f6' },
      { label: 'Force Majeure Breadth', value: 41, color: '#6b7280' }
    ])}

      <h3 style="${sectionTitleStyle}">2.0 RISK MITIGATION ROI</h3>
      ${generateROITable([
      { lever: 'Consequential Damages', current: 'Unlimited', optimized: 'Cap: 1x Fees', impact: '$2.4M (Est)' },
      { lever: 'Early Termination', current: '180 Days', optimized: '30 Days', impact: '$45,000' },
      { lever: 'Intellectual Property', current: 'Perpetual', optimized: 'Limited', impact: 'Asset Shield' },
      { lever: 'Venue Arbitrage', current: 'Adversarial', optimized: 'Neutral', impact: '$12k/filing' }
    ], { tableStyle, thStyle, tdStyle })}

      <h3 style="${sectionTitleStyle}">3.0 TECHNICAL ROOT CAUSE</h3>
      <div style="${highlightBoxStyle} border-left-color: #dc2626; background: #fdf2f2;">
        <div style="font-weight: 800; font-size: 14px; color: #991b1b; margin-bottom: 8px;">SYSTEMIC DIAGNOSTIC: ASSET EXPOSURE</div>
        <p style="font-size: 13px; color: #7f1d1d; margin: 0;">
          Detected adversarial language in Section 14.2 (Intellectual Property). The current draft grants the vendor 'Perpetual Use' of derivative data without anonymization requirements. 
        </p>
        <ul style="font-size: 12px; margin: 12px 0 0 0; color: #7f1d1d;">
          <li><strong>Regulatory Clash:</strong> Section 14.2 violates GDPR/HIPAA "Right to Erasure" (Article 17).</li>
          <li><strong>Liability Trigger:</strong> Uncapped "indirect consequential losses" coverage exposes the entire corporate balance sheet.</li>
          <li><strong>Audit Trail:</strong> Vendor has used this specific wording to claw back IP in 14.2% of past litigation cases.</li>
        </ul>
      </div>

      <h3 style="${sectionTitleStyle}">4.0 STRATEGIC ROADMAP</h3>
      ${generateStrategicRoadmap([
      {
        title: 'Defensive Red-lining',
        timeline: 'Week 1',
        desc: 'Execute the SCIS (Standard Corporate Indemnity Shield) re-draft for Section 12.4 and 14.2.',
        milestones: ['Red-line Draft', 'Risk Mapping', 'Board Approval']
      },
      {
        title: 'Vendor Escalation',
        timeline: 'Week 2',
        desc: 'Trigger the "Material Non-Compliance" flag to the vendor procurement lead to force negotiation.',
        milestones: ['Escalation Trigger', 'Lead Triage', 'Counter-offer']
      },
      {
        title: 'Autonomous Compliance',
        timeline: 'Week 4+',
        desc: 'Deploy the RAG-CLM (Contract Lifecycle Management) bridge to automatically flag Article 17 violations in all future sub-vendor agreements.',
        milestones: ['CLM API Sync', 'Model Tuning', 'Full Rollout']
      }
    ])}

      <h3 style="${sectionTitleStyle}">5.0 EXECUTIVE SUMMARY (GENERAL COUNSEL)</h3>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; font-size: 13px; color: #334155;">
        <p style="margin: 0 0 12px 0;"><strong>Strategic Verdict:</strong> The current MSA is a **"Nuclear Liability"**. Section 12.4 effectively waives your right to cap damages, creating an uninsurable risk profile for the upcoming fiscal quarter.</p>
        <p style="margin: 0;"><strong>Immediate Recommendation:</strong> Strike the "Perpetual" terminology from the IP clause today and cap the liability at 1x annual fees.</p>
      </div>

      ${generateActionPlan([
      { title: 'Clause Re-Draft (IP/Indemnity)', desc: 'Replace Section 12.4 and 14.2 with the SCIS-compliant language immediately.' },
      { title: 'Vendor Push-Back Trigger', desc: 'Escalate the Termination-for-Convenience clause to the Procurement lead for hard negotiation.' },
      { title: 'Regulatory Compliance Audit', desc: 'Verify the data-deletion protocol to ensure alignment with Article 17 requirements.' }
    ], { highlightBoxStyle })}

      ${generateGuidedPrompts([
      'generate a red-lined counter-offer for the Intellectual Property clause',
      'benchmark this risk profile against standard S&P 500 MSAs',
      'analyze the data sovereignty impact of the current vendor cloud setup'
    ])}
    `;

    // --- SCENARIO 5: FINANCE & BANKING (Precision Standard) ---
  } else if (isFinance) {
    const isFraud = /fraud/i.test(problemTitle);
    type = isFraud ? 'fraud_detection' : 'finance_audit';
    summaryText = isFraud
      ? "Linguistic Anomaly Detected. Flagged Account Takeover (ATO) attempt."
      : "Financial Control Audit Complete. Identified $124k in OpEx leakage.";

    metrics.visualMetrics = isFraud ? [
      { label: 'Threat Resiliency', value: 92, color: 'red' },
      { label: 'Anomaly Detection', value: 88, color: 'blue' }
    ] : [
      { label: 'Capital Leakage', value: 85, color: 'emerald' },
      { label: 'Budget Precision', value: 94, color: 'blue' }
    ];

    bodyHtml = `
      <div style="background: ${isFraud ? '#7f1d1d' : '#065f46'}; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; margin-bottom: 12px; opacity: 0.9; font-weight: 700;">Capital Intelligence Protocol: FIN-V22</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.2;">💰 ${isFraud ? 'FORENSIC FRAUD DIAGNOSTIC' : 'CAPITAL INTELLIGENCE AUDIT'}</h1>
        <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="font-size: 13px;"><strong>Node:</strong> ${problemTitle}</div>
          <div style="font-size: 13px;"><strong>Standard:</strong> ASMP-FIN-001</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #15803d; font-weight: 700;">Data Sync</div>
          <div style="font-size: 18px; font-weight: 800; color: #166534;">100%</div>
        </div>
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #b91c1c; font-weight: 700;">${isFraud ? 'Risk Score' : 'Variance'}</div>
          <div style="font-size: 18px; font-weight: 800; color: #991b1b;">${isFraud ? '88/100' : '+$124k'}</div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #1e40af; font-weight: 700;">Stability</div>
          <div style="font-size: 18px; font-weight: 800; color: #1e3a8a;">CRITICAL</div>
        </div>
      </div>

      <h3 style="${sectionTitleStyle}">${isFraud ? '1.0 ANOMALY DETECTION' : '1.0 VARIANCE ANALYSIS'}</h3>
      <p style="font-size: 13px; color: #4b5563; margin-bottom: 16px;">
        ${isFraud ? 'Analyzing interaction metadata for <strong>deceptive linguistic markers</strong>, IP-velocity anomalies, and behavioral fingerprints.' : 'Reconciling GL Line items against Q3 budget allocations. Identifying double-spend and unauthorized accessorials.'}
      </p>

      ${generateVisualChart(isFraud ? 'Risk Vector Analysis' : 'Budget Variance Breakdown', isFraud ? [
      { label: 'Linguistic Deception', value: 92, color: '#ef4444' },
      { label: 'IP Velocity Leakage', value: 78, color: '#f59e0b' },
      { label: 'Behavioral Mismatch', value: 84, color: '#3b82f6' },
      { label: 'Synthetic ID Signal', value: 42, color: '#111827' }
    ] : [
      { label: 'SaaS Over-provisioning', value: 85, color: '#10b981' },
      { label: 'Double-Billing Loop', value: 64, color: '#f59e0b' },
      { label: 'Vendor Surcharges', value: 72, color: '#3b82f6' },
      { label: 'Abandoned Projects', value: 31, color: '#ef4444' }
    ])}

      <h3 style="${sectionTitleStyle}">2.0 RECOVERY & PROTECTION MODEL</h3>
      ${isFraud ? generateROITable([
      { lever: 'ATO Prevention', current: '2.4% Leak', optimized: '<0.1% Leak', impact: '$420,000' },
      { lever: 'False Positives', current: '12% Rate', optimized: '1.2% Rate', impact: '$12,000' },
      { lever: 'Chargebacks', current: '$18k/mo', optimized: '$400/mo', impact: '$211,000/yr' },
      { lever: 'KYC Friction Delay', current: '48 Hours', optimized: '2 Minutes', impact: '$18,400' }
    ], { tableStyle, thStyle, tdStyle }) : generateROITable([
      { lever: 'Double Billing Slop', current: '4.2% Flow', optimized: '0.0% Flow', impact: '$82,000' },
      { lever: 'Unused SaaS Seats', current: '142 units', optimized: '12 units', impact: '$31,400' },
      { lever: 'Vendor Overcharge', current: '$12k/mo', optimized: '$0/mo', impact: '$144,000/yr' },
      { lever: 'CapEx Arbitrage', current: 'Static', optimized: 'Dynamic', impact: '$112,000' }
    ], { tableStyle, thStyle, tdStyle })}

      <h3 style="${sectionTitleStyle}">${isFraud ? '3.0 LINGUISTIC EVIDENCE' : '3.0 STRATEGIC LEVER'}</h3>
      <div style="${highlightBoxStyle} border-left-color: ${isFraud ? '#dc2626' : '#0d9488'}; background: ${isFraud ? '#fff1f2' : '#f0fdfa'};">
        <div style="font-weight: 800; font-size: 14px; color: ${isFraud ? '#991b1b' : '#065f46'}; margin-bottom: 8px;">TECHNICAL FINDING: ${isFraud ? 'DECEPTION SIGNAL' : 'ZOMBIE OPEX'}</div>
        <p style="font-size: 13px; color: ${isFraud ? '#7f1d1d' : '#064e3b'}; margin: 0;">
          ${isFraud ? 'Interaction #7721 shows "Over-justification" and "Identity Distancing" markers. Customer claims to be CEO but provides incorrect ZIP code on 3rd attempt.' : 'Detected $42k in recurring AWS costs from a "Zombie Project" (Project-X-2024) abandoned in Q1. Triggering immediate instance termination protocol.'}
        </p>
        <ul style="font-size: 12px; margin: 12px 0 0 0; color: ${isFraud ? '#7f1d1d' : '#064e3b'};">
          ${isFraud ? `
            <li><strong>Linguistic Mark:</strong> High frequency of "honestly" and "to tell the truth" (Distancing).</li>
            <li><strong>IP Check:</strong> Originating from a high-velocity residential proxy in a Tier-3 risk zone.</li>
            <li><strong>Identity:</strong> 0% overlap with historical behavioral fingerprint.</li>
          ` : `
            <li><strong>Asset Life:</strong> 142 orphaned microservices detected with zero (0) traffic.</li>
            <li><strong>Cost Slop:</strong> $14.2/hour in unallocated compute cycles.</li>
            <li><strong>Ownership:</strong> Project owner (Employee #4492) left the company in February.</li>
          `}
        </ul>
      </div>

      <h3 style="${sectionTitleStyle}">4.0 STRATEGIC ROADMAP</h3>
      ${generateStrategicRoadmap([
      {
        title: 'Infrastructure Triage',
        timeline: 'Week 1',
        desc: isFraud ? 'Lock Account #8821 and initiate Level 2 multi-factor verification.' : 'Execute the "Zombie Kill" protocol for Project-X-2024 and re-allocate budget.',
        milestones: [isFraud ? 'Account Lock' : 'Asset Kill', 'Verification Trigger', 'Stability Audit']
      },
      {
        title: 'Audit Automation',
        timeline: 'Week 2-4',
        desc: isFraud ? 'Update the fraud engine to weight "Linguistic Urgency" markers 4x higher for the 75+ age group.' : 'Deploy the RAG-audit bot to scan GL lines every Sunday night for double-spend.',
        milestones: ['Model Update', 'Policy Tuning', 'Live Pilot']
      },
      {
        title: 'Capital Intelligence',
        timeline: 'Week 8+',
        desc: isFraud ? 'Integrate behavioral biometrics into the primary login loop.' : 'Connect RAG-audit to Procurement API for real-time vendor overcharge rejection.',
        milestones: ['Biometric Sync', 'API Bridge', 'Full Rollout']
      }
    ])}

      <h3 style="${sectionTitleStyle}">5.0 EXECUTIVE SUMMARY (CFO)</h3>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; font-size: 13px; color: #334155;">
        <p style="margin: 0 0 12px 0;"><strong>Strategic Verdict:</strong> ${isFraud ? 'Your digital perimeter is being tested by **"Synthetic Identity"** attacks. The current ruleset is missing the linguistic nuances of account takeover attempts.' : 'Your OpEx is suffering from **"Capital Leakage"**. Unallocated compute and unused SaaS seats are costing the company $31.4k per month in pure waste.'}</p>
        <p style="margin: 0;"><strong>Immediate Recommendation:</strong> ${isFraud ? 'Freeze Account #8821 immediately and re-verify the identity via the Empathy Loop protocol.' : 'Terminate the Project-X internal instances to recover $42k in monthly cloud spend.'}</p>
      </div>

      ${generateActionPlan([
      { title: isFraud ? 'Account Freeze Trigger' : 'Zombie Project Termination', desc: isFraud ? 'Lock Account #8821 and trigger Level 2 ID verification to prevent ATO completion.' : 'Execute the immediate termination of the 142 microservices tied to Project-X.' },
      { title: isFraud ? 'Engine Weight Update' : 'Budget Re-Allocation', desc: isFraud ? 'Increase the weighting of "Behavioral Mismatch" in the real-time scoring engine.' : 'Move recovered $124k leakage into the Q4 R&D innovation fund for high-priority items.' },
      { title: isFraud ? 'Linguistic Training' : 'SaaS Seat Audit', desc: isFraud ? 'Feed the flagged interaction logs into the training set for the next model iteration.' : 'Cancel the 142 unused SaaS licenses identified in the GL reconciliation.' }
    ], { highlightBoxStyle })}

      ${generateGuidedPrompts([
      isFraud ? 'analyze the geographic origin of the social engineering attempt' : 'break down the OpEx leakage by department',
      isFraud ? 'generate a security awareness retraining module for high-risk targets' : 'simulate the ROI of moving to a zero-trust budget model',
      isFraud ? 'trigger a full account-activity audit for the last 48 hours' : 'allocate the recovered funds to the SaaS consolidation project'
    ])}
    `;

    // --- SCENARIO 6: HEALTHCARE & PATIENT ENGAGEMENT (Precision Standard) ---
  } else if (isHealthcare) {
    type = 'healthcare_analysis';
    summaryText = "Clinical Feasibility Audit Complete. Identified 14.2% engagement lift potential.";
    metrics.visualMetrics = [
      { label: 'Adherence Lift', value: 62, color: 'emerald' },
      { label: 'Digital Inclusion', value: 41, color: 'blue' }
    ];
    bodyHtml = `
      <div style="background: #0c4a6e; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; margin-bottom: 12px; opacity: 0.9; font-weight: 700;">Clinical Engagement Strategic Protocol: MED-V4</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.2;">🏥 CLINICAL ADHERENCE DIAGNOSTIC</h1>
        <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="font-size: 13px;"><strong>Node:</strong> ${problemTitle}</div>
          <div style="font-size: 13px;"><strong>Standard:</strong> HIPAA-AI-SECURE</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <div style="background: #f0fdfa; border: 1px solid #99f6e4; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #0d9488; font-weight: 700;">Adherence</div>
          <div style="font-size: 18px; font-weight: 800; color: #0f766e;">62.4%</div>
        </div>
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #b91c1c; font-weight: 700;">Risk Score</div>
          <div style="font-size: 18px; font-weight: 800; color: #991b1b;">78/100</div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #1e40af; font-weight: 700;">Engagement</div>
          <div style="font-size: 18px; font-weight: 800; color: #1e3a8a;">Low</div>
        </div>
      </div>

      <h3 style="${sectionTitleStyle}">1.0 BEHAVIORAL FRICTION AUDIT</h3>
      <p style="font-size: 13px; color: #4b5563; margin-bottom: 16px;">
        Analyzing <strong>EMR/Pharmacy telemetry</strong>. Reconciling digital literacy gaps against socio-economic barriers (SDOH) for the 65+ age cohort.
      </p>

      ${generateVisualChart('Patient Behavioral Metrics', [
      { label: 'Medication Adherence', value: 62, color: '#10b981' },
      { label: 'Portal Engagement', value: 24, color: '#ef4444' },
      { label: 'Appointment Completion', value: 78, color: '#3b82f6' },
      { label: 'Health Literacy Index', value: 41, color: '#f59e0b' }
    ])}

      <h3 style="${sectionTitleStyle}">2.0 CLINICAL OUTCOME MODEL</h3>
      ${generateROITable([
      { lever: 'Readmission Risk', current: '18.4%', optimized: '12.1%', impact: '$412,000' },
      { lever: 'Nurse Follow-up', current: '30h/wk', optimized: '12h/wk', impact: '$84,000' },
      { lever: 'Patient Retention', current: '62%', optimized: '88%', impact: '$112,000' },
      { lever: 'ER Diversion', current: 'High', optimized: 'Low', impact: '$94,000' }
    ], { tableStyle, thStyle, tdStyle })}

      <h3 style="${sectionTitleStyle}">3.0 TECHNICAL ROOT CAUSE</h3>
      <div style="${highlightBoxStyle} border-left-color: #0284c7; background: #f0f9ff;">
        <div style="font-weight: 800; font-size: 14px; color: #075985; margin-bottom: 8px;">SYSTEMIC DIAGNOSTIC: EMPATHY GAP</div>
        <p style="font-size: 13px; color: #0c4a6e; margin: 0;">
          Detected a <strong>"Technical Literacy Ceiling"</strong> for the primary target demographic. Patients are not "forgetting" their medication; they are struggling to navigate the multi-factor authentication (MFA) required by the patient portal. 
        </p>
        <ul style="font-size: 12px; margin: 12px 0 0 0; color: #0c4a6e;">
          <li><strong>Wait Time:</strong> Average 18 hours latency between prescription fill and pick-up reminder.</li>
          <li><strong>Digital Divide:</strong> 72% of the cohort uses landlines or non-smart feature phones.</li>
          <li><strong>SDOH Marker:</strong> High correlation between pharmacy abandonment and lack of transportation coordination.</li>
        </ul>
      </div>

      <h3 style="${sectionTitleStyle}">4.0 STRATEGIC ROADMAP</h3>
      ${generateStrategicRoadmap([
      {
        title: 'Infrastructure Simplification',
        timeline: 'Week 1-2',
        desc: 'Deploy the RAG-based SMS simplifier to reduce all portal notifications to a 4th-grade reading level with landline compatibility.',
        milestones: ['SMS Triage', 'Reading Level Audit', 'Voice-to-Text Pilot']
      },
      {
        title: 'Pharmacy Loop Closing',
        timeline: 'Week 3-4',
        desc: 'Integrate the Surescripts RTPB API to reduce pharmacy pick-up latency and automate transportation vouchers.',
        milestones: ['API Integration', 'Voucher Automation', 'Latency Audit']
      },
      {
        title: 'Autonomous Clinical Coaching',
        timeline: 'Week 6+',
        desc: 'Activate the full AI Patient-Coach for real-time medication counseling and SDOH-aware obstacle removal.',
        milestones: ['Coach Model Tuning', 'Shadow Mode Test', 'Full Deployment']
      }
    ])}

      <h3 style="${sectionTitleStyle}">5.0 EXECUTIVE SUMMARY (CMO)</h3>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; font-size: 13px; color: #334155;">
        <p style="margin: 0 0 12px 0;"><strong>Strategic Verdict:</strong> Your clinical outcomes are being throttled by **"Digital Friction"**. You are treating a medical adherence issue with technical complexity, which is driving the 24% engagement gap.</p>
        <p style="margin: 0;"><strong>Immediate Recommendation:</strong> Activate the landline-compatible voice-reminder protocol for the high-risk CHF cohort immediately.</p>
      </div>

      ${generateActionPlan([
      { title: 'Landline Voice Pilot Activation', desc: 'Deploy automated voice reminders for Account #9921 for the 200-patient "High-Risk CHF" cohort starting Monday.' },
      { title: 'MFA Simplification', desc: 'Enable one-click SMS verification to bypass the technical ceiling identified in the 65+ demographic.' },
      { title: 'Transportation Voucher Trigger', desc: 'Automate Uber/Lyft health vouchers for any pharmacy pick-up reminder that remains unacknowledged for >4 hours.' }
    ], { highlightBoxStyle })}

      ${generateGuidedPrompts([
      'analyze clinical outcome variance by patient age demographic',
      'refine the conversational tone for the high-friction engagement nudge',
      'simulate the long-term cost savings of the 14.2% engagement lift'
    ])}
    `;

    // --- SCENARIO 7: SALES & MARKETING (Precision Standard) ---
  } else if (isSales) {
    type = 'gtm_optimization';
    summaryText = "Revenue Velocity Audit Complete. Identified $420k in immediate GTM lift.";
    metrics.visualMetrics = [
      { label: 'Funnel Velocity', value: 92, color: 'emerald' },
      { label: 'Lead Resilience', value: 68, color: 'blue' }
    ];
    bodyHtml = `
      <div style="background: #581c87; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; margin-bottom: 12px; opacity: 0.9; font-weight: 700;">Revenue Operations Strategic Protocol: GTM-V15</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.2;">🚀 REVENUE VELOCITY AUDIT</h1>
        <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="font-size: 13px;"><strong>Node:</strong> ${problemTitle}</div>
          <div style="font-size: 13px;"><strong>Model:</strong> V-CORE GTM Metric</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #15803d; font-weight: 700;">Response Speed</div>
          <div style="font-size: 18px; font-weight: 800; color: #166534;">2.4 Min</div>
        </div>
        <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #b91c1c; font-weight: 700;">MQL Leakage</div>
          <div style="font-size: 18px; font-weight: 800; color: #991b1b;">32.1%</div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #1e40af; font-weight: 700;">Lift Potential</div>
          <div style="font-size: 18px; font-weight: 800; color: #1e3a8a;">$420k</div>
        </div>
      </div>

      <h3 style="${sectionTitleStyle}">1.0 FUNNEL TELEMETRY ANALYSIS</h3>
      <p style="font-size: 13px; color: #4b5563; margin-bottom: 16px;">
        Analyzing <strong>Salesforce/HubSpot</strong> funnel velocity. Reconciling intent signals against SDR response latency and "Static Hook" decay.
      </p>

      ${generateVisualChart('GTM Efficiency Metrics', [
      { label: 'Lead Triage Speed', value: 92, color: '#10b981' },
      { label: 'Hook Personalization', value: 18, color: '#ef4444' },
      { label: 'Enterprise Win Rate', value: 34, color: '#f59e0b' },
      { label: 'Churn Resilience', value: 68, color: '#3b82f6' }
    ])}

      <h3 style="${sectionTitleStyle}">2.0 REVENUE ACCELERATION MODEL</h3>
      ${generateROITable([
      { lever: 'Lead Triage Speed', current: '252m', optimized: '2m', impact: '$211,000' },
      { lever: 'Personalized Hook', current: 'Static', optimized: 'AI-Dynamic', impact: '14% Conv. Lift' },
      { lever: 'SDR Burnout Transfer', current: 'High', optimized: 'Low', impact: '$45,000' },
      { lever: 'Tier-1 Re-engagement', current: '0% Manual', optimized: '84% Auto', impact: '$164,000' }
    ], { tableStyle, thStyle, tdStyle })}

      <h3 style="${sectionTitleStyle}">3.0 TECHNICAL ROOT CAUSE</h3>
      <div style="${highlightBoxStyle} border-left-color: #7c3aed; background: #f5f3ff;">
        <div style="font-weight: 800; font-size: 14px; color: #581c87; margin-bottom: 8px;">SYSTEMIC DIAGNOSTIC: INTENT MISMATCH</div>
        <p style="font-size: 13px; color: #4c1d95; margin: 0;">
          Detected severe **"Intent Decay"** in the Mid-Market segment. 42% of Enterprise leads are viewing "Pricing" 3x or more but receiving a generic "Top Funnel" ebook follow-up. 
        </p>
        <ul style="font-size: 12px; margin: 12px 0 0 0; color: #4c1d95;">
          <li><strong>Signal Leak:</strong> Pricing-page intent is not triggering a high-priority SDR alert.</li>
          <li><strong>Content Slop:</strong> Generic follow-up hooks have a 0.8% click-through rate (CTR).</li>
          <li><strong>Latency Gap:</strong> Account owners take average 4.2 hours to acknowledge high-intent signals.</li>
        </ul>
      </div>

      <h3 style="${sectionTitleStyle}">4.0 STRATEGIC ROADMAP</h3>
      ${generateStrategicRoadmap([
      {
        title: 'Intent Harmonization',
        timeline: 'Week 1-2',
        desc: 'Deploy the RAG-based intent-triage layer to re-route all pricing-page visitors directly to Solution Architects.',
        milestones: ['API Redirect', 'Signal Optimization', 'SA Training']
      },
      {
        title: 'Dynamic Hook Activation',
        timeline: 'Week 3-4',
        desc: 'Automate LinkedIn-informed personalized hooks for the top 50 Enterprise targets.',
        milestones: ['Personalization Audit', 'Hook Rollout', 'CTR Baseline']
      },
      {
        title: 'Predictive Revenue Loop',
        timeline: 'Week 8+',
        desc: 'Activate the real-time revenue velocity monitor to automatically re-allocate marketing spend to high-intent channels.',
        milestones: ['Velocity Monitor', 'Spend Arbitrage', 'Full Deployment']
      }
    ])}

      <h3 style="${sectionTitleStyle}">5.0 EXECUTIVE SUMMARY (CRO)</h3>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; font-size: 13px; color: #334155;">
        <p style="margin: 0 0 12px 0;"><strong>Strategic Verdict:</strong> Your GTM engine is suffering from **"Signal Blindness"**. You are treating Enterprise intent like high-volume MQL noise, which is costing you $420k in immediate win-rate lift.</p>
        <p style="margin: 0;"><strong>Immediate Recommendation:</strong> Execute the "Spear Mode" re-routing protocol for all Tier-1 accounts with >3 pricing views today.</p>
      </div>

      ${generateActionPlan([
      { title: 'Spear Mode Re-routing', desc: 'Notify account owners and Solution Architects of the 12 high-intent leads identified in this audit snippet.' },
      { title: 'Dynamic Hook Rollout', desc: 'Deploy the AI-personalized follow-up sequence for the Mid-Market "Pricing View" cohort.' },
      { title: 'SDR Triage Bypass', desc: 'Deactivate the generic SDR gate for any lead matching the "Enterprise Intent" fingerprint.' }
    ], { highlightBoxStyle })}

      ${generateGuidedPrompts([
      'analyze the conversion lift of the initial 12 "Spear Mode" leads',
      'generate an A/B test plan for the dynamic vs. static hook sequences',
      'simulate the impact on quota attainment if SDR response time hits <5 minutes'
    ])}
    `;

    // --- SCENARIO 8: GENERIC BUSINESS FALLBACK (Precision Standard) ---
  } else {
    type = 'strategic_analysis';
    summaryText = `Precision Analysis complete for ${title}. Identified high-impact optimization levers.`;
    bodyHtml = `
      <div style="background: #111827; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; margin-bottom: 12px; opacity: 0.9; font-weight: 700;">Executive Strategic Protocol: EXEC-V1</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; line-height: 1.2;">🔍 PRECISION SITUATIONAL ANALYSIS</h1>
        <div style="margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="font-size: 13px;"><strong>Node:</strong> ${problemTitle}</div>
          <div style="font-size: 13px;"><strong>Domain:</strong> Enterprise Strategy</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: 700;">Complexity</div>
          <div style="font-size: 18px; font-weight: 800; color: #111827;">High</div>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #15803d; font-weight: 700;">Confidence</div>
          <div style="font-size: 18px; font-weight: 800; color: #166534;">94%</div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 6px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #1e40af; font-weight: 700;">Priority</div>
          <div style="font-size: 18px; font-weight: 800; color: #1e3a8a;">Tier-1</div>
        </div>
      </div>

      <h3 style="${sectionTitleStyle}">1.0 DATA TERRAFORMING DIAGNOSTIC</h3>
      <p style="font-size: 13px; color: #4b5563; margin-bottom: 16px;">
        Executing a multi-vector scan of the operational environment. Identifying systemic bottlenecks and "Ghost Levers" for rapid optimization.
      </p>

      ${generateVisualChart('Situational Variance Factors', [
      { label: 'Operational Velocity', value: 82, color: '#10b981' },
      { label: 'Automation Readiness', value: 45, color: '#f59e0b' },
      { label: 'Infrastructure Decay', value: 68, color: '#ef4444' },
      { label: 'Strategic Alignment', value: 92, color: '#3b82f6' }
    ])}

      <h3 style="${sectionTitleStyle}">2.0 STRATEGIC ROI MODEL</h3>
      ${generateROITable([
      { lever: 'Operational Velocity', current: 'Baseline', optimized: '+24%', impact: '$142,000' },
      { lever: 'Automation Yield', current: '12% Coverage', optimized: '78% Coverage', impact: '$84,000' },
      { lever: 'Risk Exposure', current: 'Moderate', optimized: 'Minimized', impact: 'Asset Shield' },
      { lever: 'Resource Density', current: 'High', optimized: 'Optimized', impact: '$62,400' }
    ], { tableStyle, thStyle, tdStyle })}

      <h3 style="${sectionTitleStyle}">3.0 TECHNICAL ROOT CAUSE</h3>
      <div style="${highlightBoxStyle} border-left-color: #111827; background: #f9fafb;">
        <div style="font-weight: 800; font-size: 14px; color: #111827; margin-bottom: 8px;">SYSTEMIC DIAGNOSTIC: INFRASTRUCTURE SLOP</div>
        <p style="font-size: 13px; color: #374151; margin: 0;">
          Detected evidence of **"Strategic Drift"** in the core operational loop. Current processes are optimized for legacy constraints that no longer exist in the data environment.
        </p>
        <ul style="font-size: 12px; margin: 12px 0 0 0; color: #4b5563;">
          <li><strong>Wait Time:</strong> Systemic delays identified in cross-departmental approval cycles.</li>
          <li><strong>Data Slop:</strong> 18% error rate in manual entry points for the primary ERP.</li>
          <li><strong>Risk Marker:</strong> Lack of autonomous guardrails in the decision-making loop.</li>
        </ul>
      </div>

      <h3 style="${sectionTitleStyle}">4.0 STRATEGIC ROADMAP</h3>
      ${generateStrategicRoadmap([
      {
        title: 'Infrastructure Stabilization',
        timeline: 'Week 1-2',
        desc: 'Redirect all high-velocity data points through the RAG-audit layer to stabilize the operational baseline.',
        milestones: ['Baseline Audit', 'Loop Stabilization', 'Security Check']
      },
      {
        title: 'Autonomous Rollout',
        timeline: 'Week 3-4',
        desc: 'Activate the AI-augmented decision support systems to bypass manual bottlenecks.',
        milestones: ['Decision Sync', 'Shadow Testing', 'Live Pilot']
      },
      {
        title: 'Predictive Maturity',
        timeline: 'Week 8+',
        desc: 'Deploy full predictive monitors to handle 100% of exception-based alerting and recovery.',
        milestones: ['Predictive Tuning', 'API Integration', 'Full Scale']
      }
    ])}

      <h3 style="${sectionTitleStyle}">5.0 EXECUTIVE SUMMARY</h3>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 6px; font-size: 13px; color: #334155;">
        <p style="margin: 0 0 12px 0;"><strong>Strategic Verdict:</strong> Your operational environment is being throttled by **"Legacy Friction"**. You are treating modern complexity with static tools, which is creating the current performance gap.</p>
        <p style="margin: 0;"><strong>Immediate Recommendation:</strong> Execute the Infrastructure Stabilization protocol immediately to recover the $142,000 in identified leakage.</p>
      </div>

      ${generateActionPlan([
      { title: 'Baseline Stabilization', desc: 'Secure the data entry points and deploy the RAG-auditor to prevent further leakage.' },
      { title: 'Decision Loop Acceleration', desc: 'Implement the automated approval bypass for Tier-3 operational tasks.' },
      { title: 'Resource Re-allocation', desc: 'Move identified capital slop into the Q4 R&D innovation fund.' }
    ], { highlightBoxStyle })}

      ${generateGuidedPrompts([
      'drill down into the specific operational bottlenecks identified',
      'simulate the long-term ROI of the full autonomous rollout',
      'generate a risk-mitigation checklist for the phased implementation'
    ])}
    `;
  }

  // Final Wrapper
  const finalHtml = `
    <div style="${containerStyle}">
      ${bodyHtml}
      ${riskMitigationHtml}
    </div>
  `;

  return {
    html: finalHtml,
    summary: summaryText,
    format: 'html',
    type: type,
    metrics: metrics
  };
}

/**
 * Generate using LLM API
 */
async function generateLLM(augmentedPrompt, promptMetadata, startTime, options = {}) {
  let apiProvider = options.provider || process.env.LLM_PROVIDER || 'anthropic';
  let apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

  // Auto-detect provider based on key prefix if injected from UI
  if (options.apiKey) {
    if (options.apiKey.startsWith('sk-ant')) apiProvider = 'anthropic';
    else if (options.apiKey.startsWith('sk-')) apiProvider = 'openai';
  }

  if (!apiKey) {
    throw new Error(`No API key provided for ${apiProvider}. Please enter a key in the Workbench or set ${apiProvider.toUpperCase()}_API_KEY environment variable.`);
  }

  let response;
  let model;

  const systemPrompt = `You are the Precision AI Architect. 
Your responses must be exhaustive, technical, and data-rich. 
Use professional structural Markdown (tables, nested lists, headers). 
Every claim must be supported by realistic data, ROI calculations, or industry benchmarks. 
End every response with a "Monday Morning Action Plan" for executive decision-makers. 
Adhere to industrial standards (e.g., ASMP, CSCMP, HIPAA, SOX). 
NEVER provide short or generic answers.
At the end of every response, you MUST provide exactly three guided follow-up prompts for the user in the format: "Would you like to [actionable step]?". Each prompt must be strategic and technical.`;

  try {
    if (apiProvider === 'anthropic') {
      const Anthropic = require('@anthropic-ai/sdk');
      const anthropic = new Anthropic({ apiKey });

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: augmentedPrompt
        }]
      });

      response = message.content[0].type === 'text' ? message.content[0].text : '';
      model = 'claude-3-5-sonnet';

    } else if (apiProvider === 'openai') {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: augmentedPrompt }
        ],
        max_tokens: 4096,
        temperature: 0.7
      });

      response = completion.choices[0].message.content;
      model = 'gpt-4-turbo';

    } else if (apiProvider === 'ollama') {
      // Local Ollama for development/testing
      const fetch = require('node-fetch');

      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: options.model || 'neural-chat',
          prompt: augmentedPrompt,
          stream: false
        })
      });

      const data = await res.json();
      response = data.response;
      model = options.model || 'neural-chat';

    } else {
      throw new Error(`Unsupported LLM provider: ${apiProvider}`);
    }

    // Parse structured output if possible
    let parsedOutput;
    try {
      // Look for JSON blocks
      const jsonMatch = response.match(/```json\n([\s\S]+?)\n```/);
      if (jsonMatch) {
        parsedOutput = JSON.parse(jsonMatch[1]);
      } else {
        parsedOutput = { rawText: response };
      }
    } catch (e) {
      parsedOutput = { rawText: response };
    }

    return {
      success: true,
      mode: 'llm',
      timestamp: new Date().toISOString(),
      promptId: promptMetadata.id,
      output: parsedOutput,
      metadata: {
        executionTime: (Date.now() - startTime) + 'ms',
        model,
        provider: apiProvider,
        status: 'SUCCESS',
        tokenEstimate: Math.ceil(response.split(/\s+/).length / 0.75) // Rough estimation
      }
    };

  } catch (error) {
    let finalMessage = error.message;

    // Enrich specific error types
    if (error.message.includes('Connection error')) {
      finalMessage = `Cloud Connection Error: The engine could not reach the ${apiProvider} API. This usually indicates a network restriction, proxy issue, or a temporary outage at the provider.`;
    } else if (error.status === 401) {
      finalMessage = `Authentication Failed: The provided ${apiProvider} API key is invalid or has expired.`;
    } else if (error.status === 429) {
      finalMessage = `Rate Limit Bound: Your ${apiProvider} account has reached its usage limit.`;
    }

    console.error('[RAG] LLM generation failed:', finalMessage);

    // Fallback to mock for demo purposes
    if (options.fallbackToMock) {
      console.log('[RAG] Falling back to mock mode');
      return generateMock(promptMetadata, startTime);
    }

    throw new Error(finalMessage);
  }
}

/**
 * Validate LLM response structure
 */
function validateResponse(response) {
  const issues = [];

  if (!response.output) {
    issues.push('Response missing output field');
  }

  if (!response.timestamp) {
    issues.push('Response missing timestamp');
  }

  if (!response.metadata) {
    issues.push('Response missing metadata');
  } else {
    if (!response.metadata.executionTime) {
      issues.push('Metadata missing executionTime');
    }
    if (!response.metadata.model) {
      issues.push('Metadata missing model information');
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Compare mock vs LLM output structure
 */
function compareOutputFormats(mockOutput, llmOutput) {
  const comparison = {
    mockKeys: Object.keys(mockOutput),
    llmKeys: Object.keys(llmOutput),
    matching: [],
    missingInLLM: [],
    extraInLLM: []
  };

  // Check for matching keys
  comparison.mockKeys.forEach(key => {
    if (comparison.llmKeys.includes(key)) {
      comparison.matching.push(key);
    } else {
      comparison.missingInLLM.push(key);
    }
  });

  // Check for extra keys
  comparison.llmKeys.forEach(key => {
    if (!comparison.mockKeys.includes(key)) {
      comparison.extraInLLM.push(key);
    }
  });

  return comparison;
}

/**
 * Generate execution summary for UI display
 */
function generateExecutionSummary(response) {
  return {
    status: response.success ? 'SUCCESS' : 'FAILED',
    mode: response.mode,
    promptId: response.promptId,
    executedAt: response.timestamp,
    executionTime: response.metadata?.executionTime || 'Unknown',
    model: response.metadata?.model || 'Unknown',
    errorMessage: response.error || null,
    outputPreview: truncateOutput(response.output, 200)
  };
}

/**
 * Truncate output for preview
 */
function truncateOutput(output, maxLength = 200) {
  if (!output) return '(No output)';

  let text;
  if (typeof output === 'string') {
    text = output;
  } else if (typeof output === 'object') {
    text = JSON.stringify(output, null, 2);
  } else {
    text = String(output);
  }

  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '... (truncated)';
  }

  return text;
}

module.exports = {
  generate,
  generateMock,
  generateLLM,
  validateResponse,
  compareOutputFormats,
  generateExecutionSummary
};

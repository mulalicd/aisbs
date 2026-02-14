
const fs = require('fs');
const path = require('path');

const ustavPath = path.join(__dirname, '../../data/ustav.json');
const outputPath = path.join(__dirname, '../../data/searchIndex.json');

const ustav = JSON.parse(fs.readFileSync(ustavPath, 'utf8'));

const index = [];

// Helper to clean up markdown/ext for indexing
function cleanText(text) {
    if (!text) return '';
    return text.replace(/[#*`_]/g, ' ').replace(/\s+/g, ' ').trim();
}

// 1. Index Preface (Static content - keeping it simple for now)
index.push({
    id: 'preface',
    type: 'section',
    title: 'PREFACE',
    subtitle: 'A Manager’s Workbook',
    content: "Your phone rings at 2:00 AM. It's not a security alarm. It's the Port of Long Beach telling you that your priority containers, the ones holding components for your Q3 product launch, are stuck behind a vessel that just lost power in the channel... (This is not an AI problem. This is a business problem that AI can help you solve, if you know what you're doing.)",
    keywords: ['preface', 'introduction', 'manager', 'tactics']
});

// 2. Index Chapters
ustav.chapters.forEach(chapter => {
    index.push({
        id: `ch-${chapter.number}`,
        type: 'chapter',
        chapterId: chapter.number,
        title: chapter.title,
        subtitle: chapter.subtitle || '',
        content: cleanText(chapter.intro),
        keywords: [chapter.title, 'chapter', `chapter ${chapter.number}`],
        metadata: {
            industry: chapter.title.split(' - ')[0]
        }
    });

    // 3. Index Problems
    (chapter.problems || []).forEach(problem => {
        let problemContent = '';
        const sections = problem.sections || {};

        // Combine all sections for indexing
        if (typeof sections === 'object' && !Array.isArray(sections)) {
            Object.values(sections).forEach(s => {
                if (typeof s === 'string') problemContent += s + ' ';
                else if (s && s.content) problemContent += s.content + ' ';
            });
        } else if (Array.isArray(sections)) {
            sections.forEach(s => {
                problemContent += (s.content || '') + ' ';
            });
        }

        // Add failure modes
        (problem.failureModes || []).forEach(fm => {
            problemContent += `${fm.symptom} ${fm.rootCause} ${fm.recovery} `;
        });

        index.push({
            id: `p-${chapter.id}-${problem.id}`,
            type: 'problem',
            chapterId: chapter.number,
            problemId: problem.id,
            title: problem.title,
            content: cleanText(problemContent),
            keywords: [problem.title, 'problem', `${chapter.number}.${problem.number}`],
            metadata: {
                industry: chapter.title.split(' - ')[0]
            }
        });
    });
});

// 4. Index Index of Terms (Hardcoded from my recent work for now, or could parse the file)
index.push({
    id: 'index-of-terms',
    type: 'section',
    title: 'INDEX OF TERMS',
    content: 'Administrative Bloat Adverse Events (AE) AML (Anti-Money Laundering) API Chokepoint ATS (Applicant Tracking System) Audit Escapism Basis Points (bps) Batch and Blast Battlecards Beneficial Ownership (UBO) BOM (Bill of Materials) Burnout Multiplier CAC (Customer Acquisition Cost) Carrier Ransom Changeover Matrix Churn Radar CMMS (Computerized Maintenance Management System) Compliance Clock Context Window Dark Data Decision Gap Denial Defender DSCR (Debt Service Coverage Ratio) DSO (Days Sales Outstanding) EHR/EMR (Electronic Health Record) Enrollment Cliff ESG (Environmental, Social, and Governance) Evidence Latency Excel Warriors Fact-Integrity Guardrail FERPA FinOps Freight Leak Functional Specification GIGO (Garbage In, Garbage Out) GL Variance Grant Weaver Green-hushing Hallucination HCC (Hierarchical Condition Category) HCM (Human Capital Management) HIPAA Human Middleware Impact Mirage Inclusion/Exclusion Criteria Inventory Seesaw IoT (Internet of Things) ITSM (IT Service Management) KYC (Know Your Customer) Latency Tax Lead Decay Legacy Librarian LMM (Large Multimodal Model) LTV (Lifetime Value) Maintenance Moat Markdown Madness MedDRA MTTR (Mean Time to Repair) OEE (Overall Equipment Effectiveness) OCR (Optical Character Recognition) OTIF (On-Time-In-Full) PDP (Product Detail Page) PHI (Protected Health Information) PLC (Programmable Logic Controller) Precision Collapse Prompt Engineering RAF Score (Risk Adjustment Factor) RAG (Retrieval-Augmented Generation) Recency Bias ROI Revolt SaaS Waste Scope 1, 2, and 3 SDR (Sales Development Rep) Shadow IT SIS (Student Information System) SKU Overhang SOP (Standard Operating Procedure) Talent Velocity Trap Technical Debt Theory of Change Time-to-Fill Tribal Knowledge Uncanny Valley (Marketing) Unstructured Data Value-Proposition Collapse Variance Analysis Visibility Paradox WMS (Warehouse Management System)',
    keywords: ['terms', 'definitions', 'glossary']
});

// 5. Index Master Bibliography
index.push({
    id: 'master-bibliography',
    type: 'section',
    title: 'MASTER BIBLIOGRAPHY',
    content: 'Gartner Logistics Management Capgemini Research Institute Council of Supply Chain Management Professionals (CSCMP) Aberdeen Strategy & Research Supply Chain Dive Deloitte Harris Poll The Chronicle of Higher Education Inside Higher Ed National Association of College and University Business Officers (NACUBO) Chronicle Intelligence Gartner Education Society for Human Resource Management (SHRM) Workhuman iQ Gallup LinkedIn Economic Graph Harvard Business Review National Association of Manufacturers (NAM) Deloitte Smart Factory Study IndustryWeek McKinsey & Company Manufacturer’s Alliance National Retail Federation (NRF) Optoro Shopify Klaviyo Kaiser Family Foundation (KFF) American Hospital Association Healthcare Financial Management Association (HFMA) American Medical Association (AMA) MGMA Clinical Trials Arena Tufts Center for the Study of Drug Development PhRMA Oliver Wyman Accenture Reuters Financial Action Task Force (FATF) PwC Aite-Novarica Forbes LeadResponseManagement.org Gong.ai Computerworld Flexera Splunk Datadog DORA Google Cloud ESG Today Philanthropy News Digest Stanford Social Innovation GrantStation Oxford Economics South Pole Blackbaud',
    keywords: ['bibliography', 'sources', 'research', 'citations']
});

// 6. Index Afterword
index.push({
    id: 'afterword',
    type: 'section',
    title: 'AFTERWORD',
    subtitle: 'The Architect of the New Precision',
    content: 'The "Human Middleware" era is over. For the last twenty years, we have built a world where our most talented people were used as manual data-bridges. AI is not a technology project. AI is an organizational reset. The transition from Firefighter to Orchestrator is not a simple software update...',
    keywords: ['afterword', 'conclusion', 'future', 'precision']
});

fs.writeFileSync(outputPath, JSON.stringify({ documents: index }, null, 2));

console.log(`Search index built with ${index.length} documents.`);

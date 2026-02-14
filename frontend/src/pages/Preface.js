
import React from 'react';

const Preface = () => {
    return (
        <div className="max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8 md:py-12">
            <h2 className="section-title text-3xl mb-8">PREFACE</h2>

            <div className="book-content space-y-6 text-lg leading-relaxed text-gray-800">
                <p className="font-medium italic border-l-4 border-[var(--primary)] pl-6 py-2 mb-8">
                    Your phone rings at 2:00 AM. It's not a security alarm. It's the Port of Long Beach telling you that your priority containers, the ones holding components for your Q3 product launch, are stuck behind a vessel that just lost power in the channel.
                </p>

                <p>
                    By 8:00 AM, your CFO will ask why "transportation variable costs" are decoupling from revenue. By 10:00 AM, the board will want to know about "working capital efficiency." By noon, you'll be explaining why the AI pilot you approved three months ago hasn't prevented this exact scenario.
                </p>

                <p>
                    This is not an AI problem. This is a business problem that AI can help you solve, if you know what you're doing.
                </p>

                <p>
                    Most books about AI will tell you it's transformative. They'll show you case studies of companies that "revolutionized their operations" and invite you to imagine similar success. They'll use words like "paradigm shift" and "strategic imperative" and "digital transformation."
                </p>

                <p>This book will not do that.</p>

                <p>
                    Instead, it will give you fifty specific business problems, fifty executable prompts, and 150 documented failure modes with recovery playbooks. It will show you the math. It will cite its sources. It will tell you what goes wrong, why it goes wrong, and exactly how to fix it when it does.
                </p>

                <p>Why? Because you don't need inspiration. You need Monday morning tactics.</p>

                <h3 className="text-2xl font-bold mt-12 mb-4">WHAT'S ACTUALLY HAPPENING</h3>
                <p>
                    If you're a Chief Supply Chain Officer, VP of Operations, CFO, or CIO at a mid-market company ($50M-$500M revenue), you already know the conversation around AI has become theater.
                </p>
                <p>The consultants tell you: "AI will transform your supply chain."</p>
                <p>The vendors tell you: "Our platform delivers 40-60% improvement."</p>
                <p>Your board tells you: "Why aren't we doing this?"</p>

                <h4 className="text-xl font-bold mt-8 mb-2">What they don't tell you</h4>
                <ul className="list-disc pl-8 space-y-2">
                    <li>40% of first AI pilots fail due to data quality issues you can't see until week three</li>
                    <li>Your IT department will demand an 18-month architecture review (real reason: the last AI project failed and they got blamed)</li>
                    <li>Your best implementation will hit a failure mode—GPS latency, CSV format errors, carrier relationship friction—that no case study warned you about</li>
                    <li>When your pilot breaks at 4 PM on a Friday, you'll need an email template to send your CEO, not a vision statement</li>
                </ul>
                <p>This book exists because you need the second conversation, not the first.</p>

                <h3 className="text-2xl font-bold mt-12 mb-4">WHAT MAKES THIS DIFFERENT</h3>

                <h4 className="text-xl font-bold mt-6 mb-2">1. Every Problem Is Promptable (No ML Engineering Required)</h4>
                <p>Other AI books describe solutions that require data science teams, custom model training, and GPU infrastructure. Those aren't promptable; they're engineering projects disguised as AI solutions.</p>
                <p>Every problem in this book scores ≥7.0 on the Promptability Index:</p>
                <ul className="list-disc pl-8 space-y-2">
                    <li>You can test the core concept with ChatGPT, Claude, or Gemini today</li>
                    <li>No custom ML models, no fine-tuning, no data science team</li>
                    <li>Standard LLM APIs + your existing data = deployable solution</li>
                </ul>

                <h4 className="text-xl font-bold mt-6 mb-2">2. Conservative Financial Estimates (Lower Quartile, Not Median)</h4>
                <p>Consultants use median improvements to look impressive. We use lower quartile (25th percentile) from case studies.</p>
                <p>When you deliver 40%, you look prophetic. When consultants promise 43% and deliver 35%, they look incompetent.</p>

                <h4 className="text-xl font-bold mt-6 mb-2">3. Failure Modes = Competitive Advantage</h4>
                <p>McKinsey celebrates success. HBR publishes case studies of companies that "got it right." We document what goes wrong.</p>
                <p>150+ failure modes across 50 problems, including symptoms, root causes, diagnostics, recovery plans, and email templates for when things break on Friday afternoon.</p>

                <h3 className="text-2xl font-bold mt-12 mb-4">THE METHOD</h3>
                <p className="italic mb-4">Nemo huc sana mente carens ingrediatur<br />"Let no one lacking sanity enter here"</p>

                <p>If you bought this book thinking AI is magic, return it. If you bought it thinking AI is irrelevant, same advice. What's here is structured method.</p>

                <h3 className="text-2xl font-bold mt-12 mb-4">THE CORE EPISTEMOLOGICAL PROBLEM</h3>
                <p className="italic border-l-4 border-gray-300 pl-6 py-2 mb-4">
                    "Man, as the minister and interpreter of nature, does and understands only as much as he has observed of the order of nature by fact or mental reflection, beyond this he neither knows nor is able to do anything."
                </p>
                <p>Francis Bacon understood 400 years ago what most AI users don't grasp today: we can only work with what we observe.</p>

                <p>AI has the same limitation. It processes data. It finds patterns. It generates outputs based on statistical likelihood. It cannot verify whether those outputs are true. It cannot account for what it hasn't seen. It cannot tell you when it's wrong.</p>

                <p className="font-bold mt-8">It’s time to stop counting the past and start building the precision era.</p>
                <p className="font-bold">Go get started.</p>
            </div>
        </div>
    );
};

export default Preface;

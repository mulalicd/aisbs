import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import MarkdownRenderer from '../components/MarkdownRenderer';

function ChapterView() {
  const { chapterId } = useParams();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/api/chapters/${chapterId}`)
      .then(response => {
        setChapter(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [chapterId]);

  if (loading) return <div className="loading-container">Synchronizing Chapter Intelligence...</div>;
  if (error) return <div className="error-container">Sync Error: {error}</div>;
  if (!chapter) return <div className="error-container">Domain not found in workbook.</div>;

  return (
    <div className="chapter-view-container">
      <header className="problem-header">
        <div className="problem-meta">Sector Overview / Chapter {chapter.number}</div>
        <h1 className="problem-main-title">{chapter.title}</h1>
        {chapter.subtitle && <p className="dashboard-subtitle">{chapter.subtitle}</p>}
      </header>

      {chapter.intro && (
        <section className="problem-section-card" style={{ background: '#f8fafc', borderLeft: '4px solid var(--primary)' }}>
          <h2 className="nav-label">Executive Brief</h2>
          <div className="markdown-content">
            <p style={{ whiteSpace: 'pre-wrap' }}>{chapter.intro}</p>
          </div>
        </section>
      )}

      <section className="problems-section" style={{ marginTop: '4rem' }}>
        <h2 className="section-title">Strategic Challenges</h2>
        <div className="problems-grid-modern" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100%, 1fr))', gap: '1.5rem' }}>
          {(chapter.problems || []).map((problem) => (
            <Link
              key={problem.id}
              to={`/chapter/${chapterId}/problem/${problem.id}`}
              className="chapter-luxury-card"
              style={{ flexDirection: 'row', alignItems: 'center', gap: '2rem', padding: '1.5rem 2.5rem' }}
            >
              <div style={{
                width: '80px',
                height: '80px',
                background: 'var(--secondary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: '900',
                borderRadius: '16px',
                flexShrink: 0
              }}>
                {problem.number}
              </div>

              <div style={{ flex: 1 }}>
                <div className="chapter-card-meta">Problem {chapter.number}.{problem.number}</div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>
                  {problem.title}
                </h4>
                {problem.sections?.operationalReality?.content && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                    {problem.sections.operationalReality.content.substring(0, 180)}...
                  </p>
                )}
              </div>

              <div className="arrow" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>→</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ChapterView;

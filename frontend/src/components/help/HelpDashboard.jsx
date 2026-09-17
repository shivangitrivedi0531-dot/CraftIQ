import React, { useState, useEffect, useRef } from 'react';
import { searchTopics, getTopicById, getTopicsBySubModule, topics } from './searchEngine';
import './HelpDashboard.css';

const SUGGESTED = [
  "How do I add a new vendor?",
  "How can I create a Purchase Order?",
  "Where can I find previous POs?",
  "How do I add an item?",
  "How can I import BOQ items from Excel?",
  "How do I apply for leave?",
  "Where can I check my leave history?",
  "How do I create a Dispatch Instruction?",
  "How can I find a Purchase Request?",
  "Why can't I find a material while creating a PO?"
];

const SUB_MODULES = [
  { name: "Items", icon: "📋", desc: "BOQ items, manual entry, Excel import" },
  { name: "Vendor", icon: "👥", desc: "Vendor registration, status & bank info" },
  { name: "Purchase Orders", icon: "🛒", desc: "Project & Office PO creation, filters" },
  { name: "Purchase Requests", icon: "📄", desc: "Material requests & supervisor roles" },
  { name: "Dispatch Instructions", icon: "🚚", desc: "PO dispatch, approval tracking" },
  { name: "Attendance", icon: "⏰", desc: "GPS Punch in/out & Leave management" }
];

export default function HelpDashboard({ onNavigateRoute }) {
  const [view, setView] = useState('home'); // 'home' | 'results' | 'answer'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recent_searches') || '[]');
    } catch {
      return [];
    }
  });

  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (searchQuery) => {
    const trimmed = (searchQuery || '').trim();
    if (!trimmed) return;

    if (!recent.includes(trimmed)) {
      const updated = [trimmed, ...recent].slice(0, 5);
      setRecent(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    }

    const matches = searchTopics(trimmed);
    if (matches.length === 1) {
      setSelectedTopic(matches[0]);
      setView('answer');
    } else {
      setResults(matches);
      setView('results');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectModule = (moduleName) => {
    const matches = getTopicsBySubModule(moduleName);
    setQuery(moduleName);
    setResults(matches);
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTopic = (id) => {
    const topic = getTopicById(id);
    if (topic) {
      setSelectedTopic(topic);
      setView('answer');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoHome = () => {
    setView('home');
    setQuery('');
    setSelectedTopic(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearRecent = () => {
    setRecent([]);
    localStorage.removeItem('recent_searches');
  };

  const handleRedirect = (id, title, route) => {
    setToastMessage(`Redirecting to route: ${route}`);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);

    if (onNavigateRoute) {
      onNavigateRoute(route);
    }
  };

  const relatedTopics = selectedTopic
    ? (selectedTopic.relatedTopicIds || []).map(rid => getTopicById(rid)).filter(Boolean)
    : [];

  return (
    <div className={`help-root ${isDark ? 'dark' : 'light'}`}>
      <div className="container">
        {/* Header */}
        <div className="header">
          <button className="brand" onClick={handleGoHome}>
            <div className="logo">SG</div>
            <div>
              <div className="brand-title">Software Guidance Center</div>
              <div className="brand-sub">CraftIQ Enterprise Management</div>
            </div>
          </button>
          <div className="header-actions">
            <span className="doc-badge">{topics.length} Workflows Documented</span>
            <button 
              className="theme-toggle" 
              onClick={() => setIsDark(!isDark)} 
              title="Toggle dark/light mode"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* HOME VIEW */}
        {view === 'home' && (
          <div className="view-home">
            <h1 className="hero display">How can we help you today?</h1>
            <p className="hero-sub">Get instant navigation paths, step-by-step instructions, and direct software links.</p>

            <form className="search-wrapper" onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}>
              <div className="searchbar">
                <span className="search-icon">🔍</span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask e.g. 'How to add a vendor?' or 'How do I apply for leave?'"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <span className="kbd-shortcut">/</span>
                <button type="submit" className="search-btn">Search</button>
              </div>
            </form>

            <p className="section-label">Suggested Questions</p>
            <div className="chips">
              {SUGGESTED.map((q, idx) => (
                <button 
                  key={idx} 
                  className="chip" 
                  onClick={() => { setQuery(q); handleSearch(q); }}
                >
                  {q}
                </button>
              ))}
            </div>

            <p className="section-label">Explore by Module</p>
            <div className="modgrid">
              {SUB_MODULES.map((m, idx) => {
                const count = topics.filter(t => t.subModule === m.name).length;
                return (
                  <button key={idx} className="modcard" onClick={() => handleSelectModule(m.name)}>
                    <div className="modcard-header">
                      <div className="modicon">{m.icon}</div>
                      <div>
                        <div className="modtitle">{m.name}</div>
                      </div>
                    </div>
                    <div className="moddesc">{m.desc}</div>
                    <div className="modcount">{count} documented workflows →</div>
                  </button>
                );
              })}
            </div>

            {recent.length > 0 && (
              <div className="recent-wrap">
                <p className="section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Recent Searches</span>
                  <button 
                    onClick={handleClearRecent} 
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                </p>
                <div className="chips">
                  {recent.map((r, idx) => (
                    <button 
                      key={idx} 
                      className="chip recent" 
                      onClick={() => { setQuery(r); handleSearch(r); }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESULTS VIEW */}
        {view === 'results' && (
          <div className="view-results">
            <button className="backlink" onClick={handleGoHome}>← Back to Overview</button>

            <form className="searchbar" style={{ marginBottom: '24px' }} onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}>
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search documentation…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">Search</button>
            </form>

            {results.length === 0 ? (
              <div className="empty">
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>❔</div>
                <p style={{ fontWeight: 600, fontSize: '18px', margin: '0 0 8px', color: 'var(--ink)' }}>
                  I couldn't find instructions for this in the available software documentation.
                </p>
                <p style={{ fontSize: '14px', color: 'var(--ink-soft)', margin: '0 0 20px' }}>
                  Please contact your administrator for further assistance.
                </p>
                <button className="cta-btn" style={{ margin: '0 auto' }} onClick={handleGoHome}>
                  View All Documented Modules
                </button>
              </div>
            ) : (
              <div className="results-list">
                {results.map((t) => (
                  <button key={t.id} className="resultitem" onClick={() => handleSelectTopic(t.id)}>
                    <div>
                      <div className="resulttitle">{t.title}</div>
                      <div className="resultsub">
                        <strong style={{ color: 'var(--accent)' }}>{t.subModule}</strong> · {t.shortDescription}
                      </div>
                    </div>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANSWER VIEW */}
        {view === 'answer' && selectedTopic && (
          <div className="view-answer">
            <button className="backlink" onClick={handleGoHome}>← Back to Overview</button>

            <div className="card">
              <span className="pill-module">{selectedTopic.module} → {selectedTopic.subModule}</span>
              <h2 className="display">{selectedTopic.title}</h2>
              <p className="short">{selectedTopic.shortDescription}</p>

              {/* Navigation Path */}
              <div className="section">
                <p className="section-label">Exact Navigation Path</p>
                <div className="navpath mono">
                  {selectedTopic.navigation.map((seg, idx) => (
                    <React.Fragment key={idx}>
                      <span className="navseg">{seg}</span>
                      {idx < selectedTopic.navigation.length - 1 && <span className="arrow">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              {selectedTopic.steps && selectedTopic.steps.length > 0 && (
                <div className="section">
                  <p className="section-label">Step-by-Step Instructions</p>
                  <ol className="steps">
                    {selectedTopic.steps.map((step, idx) => (
                      <li key={idx}>
                        <span className="stepnum">{idx + 1}</span>
                        <span className="steptext">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Fields Overview */}
              {(selectedTopic.requiredFields.length > 0 || (selectedTopic.optionalFields && selectedTopic.optionalFields.length > 0)) && (
                <div className="section">
                  <p className="section-label">Fields Overview</p>
                  <div className="fieldscols">
                    {selectedTopic.requiredFields.length > 0 && (
                      <div>
                        <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent-ink)' }}>Required</strong>
                        <ul className="fieldlist" style={{ marginTop: '6px' }}>
                          {selectedTopic.requiredFields.map((f, idx) => <li key={idx}>{f}</li>)}
                        </ul>
                      </div>
                    )}
                    {selectedTopic.optionalFields && selectedTopic.optionalFields.length > 0 && (
                      <div>
                        <strong style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--ink-soft)' }}>Optional</strong>
                        <ul className="fieldlist optional" style={{ marginTop: '6px' }}>
                          {selectedTopic.optionalFields.map((f, idx) => <li key={idx}>{f}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Warnings & Rules */}
              {selectedTopic.warnings && selectedTopic.warnings.length > 0 && (
                <div className="section">
                  <p className="section-label">Important Warnings & Rules</p>
                  {selectedTopic.warnings.map((w, idx) => (
                    <div key={idx} className="warning">
                      <span>⚠️</span>
                      <div>{w}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Result Note */}
              {selectedTopic.result && (
                <div className="result-note">
                  <span>✓</span>
                  <span>{selectedTopic.result}</span>
                </div>
              )}

              {/* Action / Redirect Row */}
              <div className="cta-row">
                <button 
                  className="cta-btn" 
                  onClick={() => handleRedirect(selectedTopic.id, selectedTopic.title, selectedTopic.route)}
                >
                  <span>Go to {selectedTopic.title}</span>
                  <span>→</span>
                </button>
                <span className="route-tag mono">{selectedTopic.route}</span>
              </div>
            </div>

            {/* Related Workflows */}
            {relatedTopics.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <p className="section-label">Related Workflows</p>
                <div className="chips">
                  {relatedTopics.map((rt) => (
                    <button 
                      key={rt.id} 
                      className="chip" 
                      onClick={() => handleSelectTopic(rt.id)}
                    >
                      {rt.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Toast Notification */}
        <div className={`toast ${toastMessage ? 'show' : ''}`}>
          <span>🚀</span>
          <span>{toastMessage}</span>
        </div>
      </div>
    </div>
  );
}

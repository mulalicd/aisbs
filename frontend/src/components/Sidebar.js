import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useUstav } from '../App';

const Sidebar = ({ className, onClose }) => {
  const { ustav, loading } = useUstav();

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${className || ''}`}>
      <Link to="/" className="sidebar-logo" onClick={handleNavClick}>
        AI SOLVED<br />BUSINESS<br />PROBLEMS
      </Link>

      <nav className="nav-container">
        <div className="nav-group">
          <span className="nav-label">Main</span>
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            onClick={handleNavClick}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/preface"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            onClick={handleNavClick}
          >
            Preface
          </NavLink>
          <NavLink
            to="/index-of-terms"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            onClick={handleNavClick}
          >
            Index of Terms
          </NavLink>
          <NavLink
            to="/bibliography"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            onClick={handleNavClick}
          >
            Master Bibliography
          </NavLink>
          <NavLink
            to="/afterword"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            onClick={handleNavClick}
          >
            Afterword
          </NavLink>
        </div>

        <div className="nav-group">
          <span className="nav-label">Chapters</span>
          {loading ? (
            <div className="nav-link">Loading...</div>
          ) : (
            ustav?.chapters?.map((chapter) => (
              <NavLink
                key={chapter.id}
                to={`/chapter/${chapter.id}`}
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                onClick={handleNavClick}
              >
                {chapter.title}
              </NavLink>
            ))
          )}
        </div>
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>© 2026 Davor Mulalić</p>
      </div>
    </aside>
  );
};

export default Sidebar;

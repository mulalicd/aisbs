import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Home from './pages/Home';
import ChapterView from './pages/ChapterView';
import ProblemView from './pages/ProblemView';
import PromptExecution from './pages/PromptExecution';
import Preface from './pages/Preface';
import IndexTerms from './pages/IndexTerms';
import Bibliography from './pages/Bibliography';

import './App.css';

// Context for USTAV data
const UstavContext = createContext();

export const useUstav = () => {
  const context = useContext(UstavContext);
  if (!context) {
    throw new Error('useUstav must be used within UstavProvider');
  }
  return context;
};

export const UstavProvider = ({ children }) => {
  const [ustav, setUstav] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUstav = async () => {
      try {
        const response = await axios.get('/api/ustav');
        setUstav(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUstav();
  }, []);

  return (
    <UstavContext.Provider value={{ ustav, loading, error }}>
      {children}
    </UstavContext.Provider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <UstavProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/preface" element={<Preface />} />
              <Route path="/index-of-terms" element={<IndexTerms />} />
              <Route path="/bibliography" element={<Bibliography />} />
              <Route path="/chapter/:chapterId" element={<ChapterView />} />
              <Route path="/chapter/:chapterId/problem/:problemId" element={<ProblemView />} />
              <Route
                path="/chapter/:chapterId/problem/:problemId/prompt/:promptId"
                element={<PromptExecution />}
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </UstavProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useUstav } from '../App';
import Breadcrumbs from '../components/Breadcrumbs';
import PromptSplitView from '../components/PromptSplitView';

const PromptExecution = () => {
  const { chapterId, problemId, promptId } = useParams();
  const { ustav, loading: ustavLoading, error: ustavError } = useUstav();
  const [output, setOutput] = useState(null);

  if (ustavLoading) return <div className="loading-container">Initializing Neural Workbench...</div>;
  if (ustavError) return <div className="error-container">System Error: {ustavError}</div>;
  if (!ustav) return null;

  const chapter = ustav.chapters.find((ch) => ch.id === chapterId);
  if (!chapter) return <div className="error-container">Sector Chapter Not Found</div>;

  const problem = chapter.problems.find((p) => p.id === problemId);
  if (!problem) return <div className="error-container">Business Problem Not Found</div>;

  const prompt = problem.prompts.find((pr) => pr.id === promptId);
  if (!prompt) return <div className="error-container">Execution Prompt Not Found</div>;

  const handleExecute = async (inputs, mode) => {
    try {
      const response = await axios.post('http://localhost:5000/api/rag/execute', {
        promptId,
        userData: inputs,
        mode,
      });
      setOutput(response.data);
      return response.data;
    } catch (error) {
      console.error('[PromptExecution] API Error:', error.response?.data || error.message);
      const errorData = error.response?.data;
      if (errorData && errorData.error) {
        throw new Error(`${errorData.error}: ${errorData.message}`);
      }
      throw new Error(errorData?.message || error.message);
    }
  };

  const breadcrumbItems = [
    { label: chapter.title, link: `/chapter/${chapterId}` },
    { label: `Problem ${problem.number}`, link: `/chapter/${chapterId}/problem/${problemId}` },
    { label: prompt.title, link: null },
  ];

  return (
    <div className="prompt-execution-wrapper">
      <header className="problem-header">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="problem-meta">Intelligent Asset / Execution Controller</div>
        <h1 className="problem-main-title">{prompt.title}</h1>
        <p className="dashboard-subtitle">
          Operationalizing Problem {problem.number} in the {chapter.title} Domain
        </p>
      </header>

      <PromptSplitView prompt={prompt} onExecute={handleExecute} />
    </div>
  );
};

export default PromptExecution;

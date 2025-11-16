import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReleases } from '../api'; // Aapki API
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Markdown tables ke liye
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'; // Icons
import './ReleaseViewPage.css'; 

// --- CATEGORIZE KARNE WALA FUNCTION (FIXED) ---
const formatContent = (rawContent) => {
  if (!rawContent) return ""; 
  const categories = { features: [], improvements: [], bugFixes: [], other: [] };
  
  // 1. Saari lines ko split karein
  const allLines = rawContent.split(/[\n\r]+/).filter(line => line.trim().length > 0);

  // 2. Pehli line (Title) ko chhod kar, baaki lines ko process karein
  const changeLines = allLines.slice(1); 

  changeLines.forEach(line => {
    
    // --- YEH RAHA FIX ---
    // Pehle: const text = line.replace(/^- /, '').trim();
    // Naya: Yeh line ke shuru se sabhi *, -, aur spaces ko hata dega
    const text = line.replace(/^[\s*-]+/, '').trim();
    // --- END OF FIX ---

    const lowerText = text.toLowerCase(); 

    // Keywords ke basis par categorize karein
    if (lowerText.startsWith('added') || lowerText.startsWith('feat:')|| lowerText.startsWith('introduced')) {
      categories.features.push(text);
    } else if (lowerText.startsWith('improved') || lowerText.startsWith('perf:') || lowerText.startsWith('tech-debt:') || lowerText.startsWith('refactor:')) {
      categories.improvements.push(text);
    } else if (lowerText.startsWith('fixed') || lowerText.startsWith('ui-fix:') || lowerText.startsWith('auth-')) {
      categories.bugFixes.push(text);
    } else if (text.length > 0) { // Khali lines ko ignore karein
      categories.other.push(text); 
    }
  });

  // 4. Naya Markdown string banayein
  let newContent = "";
  const buildSection = (title, items) => {
    if (items.length === 0) return "";
    let section = `### ${title}\n\n`;
    items.forEach(item => { section += `- ${item}\n`; });
    section += "\n";
    return section;
  };

  newContent += buildSection("🚀 New Features", categories.features);
  newContent += buildSection("✨ Improvements", categories.improvements);
  newContent += buildSection("🐛 Bug Fixes", categories.bugFixes);
  
  if (categories.other.length > 0) {
     newContent += buildSection("📋 Other Changes", categories.other);
  }

  return newContent;
};
// --- END OF FUNCTION ---


function ReleaseViewPage() {
    const { projectKey } = useParams();
    const navigate = useNavigate();
    const [releases, setReleases] = useState([]); 
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReleases = async () => {
            if (!projectKey) return; 
            try {
                setLoading(true);
                setError(null);
                const response = await getReleases();
                const filtered = response.data
                    .filter(r => r.projectKey?.toUpperCase() === projectKey?.toUpperCase());
                
                if (filtered.length === 0) {
                    setError(`No releases found for project ${projectKey}.`);
                    setReleases([]);
                } else {
                    const sorted = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setReleases(sorted); 
                    setCurrentIndex(0); 
                }
            } catch (error) {
                console.error("Failed to fetch releases:", error);
                setError("Failed to load releases. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchReleases();
    }, [projectKey]); 

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    // --- Pagination Handlers ---
    const handleNext = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1); // Newer
        }
    };
    const handlePrev = () => {
        if (currentIndex < releases.length - 1) {
            setCurrentIndex(currentIndex + 1); // Older
        }
    };

    // --- Loading aur Error states ---
    if (loading) {
        return <div className="release-page-state">Loading project releases...</div>;
    }

    if (error) {
        return (
          <div className="release-page-state">
            <p>{error}</p>
            <button className="back-button" onClick={() => navigate('/releases')}>
              &larr; Back to Releases
            </button>
          </div>
        );
    }
    
    if (releases.length === 0) {
       return (
          <div className="release-page-state">
            <p>No releases found for this project.</p>
             <button className="back-button" onClick={() => navigate('/releases')}>
              &larr; Back to Releases
            </button>
          </div>
        );
    }

    // --- Current Release Data ---
    const currentRelease = releases[currentIndex];
    const formattedContent = formatContent(currentRelease.content);
    const isNewest = currentIndex === 0;
    const isOldest = currentIndex === releases.length - 1;

    return (
        <div className="release-view-page">
            
            <nav className="release-nav">
                <button className="back-button" onClick={() => navigate('/releases')}>
                    &larr; Back to All Releases
                </button>
            </nav>

            <main className="release-document">
                <header className="release-header">
                    <div className="ai-generated-tag">
                        <Sparkles size={14} />
                        <span>AI Generated</span>
                    </div>
                    <h1>Release Notes: {currentRelease.title}</h1>
                    <p className="release-subtitle">
                        <span>{currentRelease.projectKey}</span>
                        <span>•</span>
                        <span>{formatDate(currentRelease.createdAt)}</span>
                    </p>
                </header>

                <div className="release-content-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {formattedContent}
                    </ReactMarkdown>
                </div>
            </main>

            <footer className="release-pagination-footer">
                <button onClick={handlePrev} disabled={isOldest} className="pagination-btn">
                    <ChevronLeft size={16} /> Older
                </button>
                <span>
                    Version {releases.length - currentIndex} of {releases.length}
                </span>
                <button onClick={handleNext} disabled={isNewest} className="pagination-btn">
                    Newer <ChevronRight size={16} />
                </button>
            </footer>
        </div>
    );
}

export default ReleaseViewPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar'; 
import { getReleases } from '../api';
import './ReleasesDashboard.css';
import './Dashboard.css'; 

// Group releases by projectKey
const groupReleasesByProject = (releases) => {
    const sorted = releases.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const grouped = sorted.reduce((acc, release) => {
        const key = release.projectKey?.toUpperCase(); // Normalize keys
        if (!acc[key]) {
            acc[key] = {
                projectKey: key,
                count: 0,
                latestRelease: release,
                releases: []
            };
        }
        acc[key].releases.push(release);
        acc[key].count = acc[key].releases.length;

        return acc;
    }, {});

    return Object.values(grouped);
};

function ReleasesDashboard() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [groupedReleases, setGroupedReleases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    useEffect(() => {
        const loadReleases = async () => {
            try {
                setLoading(true);
                const response = await getReleases();
                const grouped = groupReleasesByProject(response.data);
                setGroupedReleases(grouped);
            } catch (err) {
                console.error("Failed to load releases", err);
                setError("Could not load releases.");
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) loadReleases();
    }, [currentUser]);

    const handleNavigate = (view) => {
        if (view === 'dashboard') navigate('/dashboard');
        else if (view === 'releases') navigate('/releases');
        else if (view === 'settings') navigate('/dashboard');
    };

    const goToProjectReleases = (projectKey) => {
        navigate(`/releases/${projectKey.toUpperCase()}`);
    };

    return (
        <div className={`dashboard-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar 
                activeView="releases" 
                onNavigate={handleNavigate} 
                isCollapsed={isCollapsed}
                onToggle={toggleSidebar}
            />

            <div className="main-content">
                <div className="content-wrapper">
                    <div className="releases-page">
                    <h2>My Project Releases</h2>
                    <p className="releaseDesc">View all generated releases grouped by project.</p>
                    </div>
                    {loading ? (
                        <p>Loading project groups...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : groupedReleases.length === 0 ? (
                        <p>You haven't generated any releases yet.</p>
                    ) : (
                        <div className="releases-list-container">
                            {groupedReleases.map(group => (
                                <div 
                                    key={group.projectKey} 
                                    className="release-card"
                                    onClick={() => goToProjectReleases(group.projectKey)}
                                >
                                    <h3>{group.projectKey}</h3>
                                    <p>Latest: <strong>{group.latestRelease.title}</strong></p>
                                    <p>Status: <span className={`status-${group.latestRelease.status}`}>{group.latestRelease.status}</span></p>
                                    <p>Last Generated: {new Date(group.latestRelease.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReleasesDashboard;

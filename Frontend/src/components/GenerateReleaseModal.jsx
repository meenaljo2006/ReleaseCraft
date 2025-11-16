import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReleaseFromFilters } from '../api';
import './GenerateReleaseModal.css';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const GenerateReleaseModal = ({ isOpen, onClose, projectKey }) => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 Reset values every time modal opens
  useEffect(() => {
    if (isOpen) {
      const today = getTodayDate();
      setTitle(`Release for ${projectKey} - ${today}`);
      setStartDate(today);
      setEndDate(today);
    }
  }, [isOpen, projectKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      setError("All fields are required.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await createReleaseFromFilters({
        title,
        projectKey,
        filters: {
          status: "Done",
          startDate,
          endDate
        }
      });

      alert("Release generation has started!");
      onClose();
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError("Error starting generation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        <h2>Generate Release Notes</h2>
        <p>
          This will generate notes for <strong>{projectKey}</strong>.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Release Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="date-group">

            <div className="form-group">
              <label>From Date</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>To Date</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="cta-button" disabled={isLoading}>
              {isLoading ? "Generating..." : "Start Generation"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default GenerateReleaseModal;

// src/services/api.js
import axios from 'axios';
import { auth } from './firebase'; // Import auth from your firebase.js

// 1. Create a central axios instance
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Your backend URL
});

// 2. This is the "Gatekeeper" (Interceptor)
// It runs *before* every single request
api.interceptors.request.use(
  async (config) => {
    // Get the current user from Firebase
    const user = auth.currentUser;

    if (user) {
      // Get their "passport" (ID Token)
      const token = await user.getIdToken();
      // Attach it to the request header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 3. Define all your API functions ---

// Jira Functions
export const getJiraProjects = () => api.get('/jira/me/projects');
export const getJiraAuthUrl = () => api.get('/jira/auth/connect'); // We will fix this route
export const disconnectJira = () => api.post('/jira/auth/disconnect');
export const getTicketsForProject = (projectKey) => 
  api.get(`/jira/me/projects/${projectKey}/tickets`);

// Release Functions
export const getReleases = () => api.get('/releases');
export const createRelease = (data) => api.post('/releases', data);
export const generateRelease = (releaseId) => api.post(`/releases/${releaseId}/generate`);
export const getReleaseDetails = (releaseId) => api.get(`/releases/${releaseId}`);

// ... (existing imports)

// --- 1. YEH FUNCTION TICKETS LAANE KE LIYE ---
export const getTicketsForUser = (projectKey, status, startDate, endDate) => {
  return api.get('/jira/me/tickets', {
    params: {
      projectKey: projectKey,
      status: status,
      startDate: startDate,
      endDate: endDate
    }
  });
};

// --- 2. YEH FUNCTION RELEASE GENERATE KARNE KE LIYE ---
export const createReleaseFromFilters = (data) => {
  return api.post('/releases/generate-from-filters', data);
};

export default api;
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Generic CRUD factory
const crud = (resource) => ({
  getAll: () => API.get(`/${resource}`),
  getById: (id) => API.get(`/${resource}/${id}`),
  create: (data) => API.post(`/${resource}`, data),
  update: (id, data) => API.put(`/${resource}/${id}`, data),
  delete: (id) => API.delete(`/${resource}/${id}`),
});

export const roadmapAPI = crud('roadmap');
export const featuresAPI = crud('features');
export const storiesAPI = crud('stories');
export const sprintsAPI = crud('sprints');
export const stakeholdersAPI = crud('stakeholders');
export const researchAPI = crud('research');
export const competitorsAPI = crud('competitors');
export const metricsAPI = crud('metrics');
export const feedbackAPI = crud('feedback');
export const releasesAPI = crud('releases');
export const abtestsAPI = crud('abtests');
export const requirementsAPI = crud('requirements');
export const risksAPI = crud('risks');
export const capacityAPI = crud('capacity');
export const okrsAPI = crud('okrs');

// AI
export const aiGenerate = (data) => API.post('/ai/generate', data);
export const aiPrioritize = (data) => API.post('/ai/prioritize', data);
export const aiGenerateStories = (data) => API.post('/ai/generate-stories', data);
export const aiMarketResearch = (data) => API.post('/ai/market-research', data);
export const aiCompetitiveAnalysis = (data) => API.post('/ai/competitive-analysis', data);
export const aiAnalyzeFeedback = (data) => API.post('/ai/analyze-feedback', data);
export const aiGeneratePRD = (data) => API.post('/ai/generate-prd', data);
export const aiAssessRisk = (data) => API.post('/ai/assess-risk', data);

export default API;

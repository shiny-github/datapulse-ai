import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000" });

export const uploadFile = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/upload", form);
};

export const runPipeline = () => api.post("/pipeline/run");
export const getPipelineStatus = () => api.get("/pipeline/status");
export const queryData = (question) => api.post("/query", { question });
export const getInsights = () => api.get("/insights");
export const getProfile = () => api.get("/profile");
export const getDomains = () => api.get("/domains");

export default api;

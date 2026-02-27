import axios from "axios";

// On ajoute /api à la fin de l'URL
const API_URL = "https://adbwallet-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
});

// Optionnel mais recommandé : Ajouter le token automatiquement s'il existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
export { API_URL };

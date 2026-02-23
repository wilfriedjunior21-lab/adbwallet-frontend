import axios from "axios";

const API_URL = "https://adbwallet-backend.onrender.com";

const api = axios.create({
  baseURL: API_URL,
});

export default api;
export { API_URL };

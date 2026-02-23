import React, { useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { FiLock, FiMail } from "react-icons/fi";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // --- PHASE UNIQUE : LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // 1. Stockage local des informations retournées par le backend
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("userName", res.data.name);
      localStorage.setItem("userEmail", formData.email.trim().toLowerCase());

      toast.success("Connexion réussie ! Redirection...");

      // 2. Redirection selon le rôle
      setTimeout(() => {
        const role = res.data.role;
        if (role === "admin") {
          window.location.href = "/admin";
        } else if (role === "actionnaire") {
          window.location.href = "/dashboard-actionnaire";
        } else {
          window.location.href = "/dashboard-acheteur";
        }
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-white">
      <Toaster />

      <div className="bg-slate-900 p-8 rounded-[2.5rem] w-full max-w-md border border-slate-800 shadow-2xl">
        <h2 className="text-3xl font-black italic mb-8 text-center uppercase tracking-tighter">
          ADB<span className="text-blue-500">WALLET</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              name="email"
              placeholder="EMAIL"
              required
              className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 transition-all"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              name="password"
              placeholder="MOT DE PASSE"
              required
              className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 transition-all"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all ${
              loading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20"
            }`}
          >
            {loading ? "Chargement..." : "Se connecter"}
          </button>
          <p className="mt-6 text-center text-[10px] text-slate-500 uppercase font-black tracking-widest">
            Pas de compte ?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              S'inscrire
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { FiLock, FiMail, FiArrowRight } from "react-icons/fi";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Nettoyage des données
    const cleanEmail = formData.email.trim().toLowerCase();

    try {
      // Note: Utilisation de /auth/login (vérifie si ton instance axios inclut déjà /api)
      const res = await api.post("/auth/login", {
        email: cleanEmail,
        password: formData.password,
      });

      // 1. Stockage sécurisé des données de session
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("userName", res.data.name || "Utilisateur");
      localStorage.setItem("userEmail", cleanEmail);

      toast.success("Authentification réussie !");

      // 2. Redirection intelligente selon le rôle
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
      console.error("Erreur login:", err);
      toast.error(err.response?.data?.error || "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-white font-sans">
      <Toaster position="top-center" />

      <div className="bg-slate-900 p-10 rounded-[3rem] w-full max-w-md border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Décoration subtile en arrière-plan */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <header className="text-center mb-10">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              ADB<span className="text-blue-500">WALLET</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
              Secure Terminal Access
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-4 tracking-widest">
                Identifiant Email
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="nom@exemple.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 p-5 pl-14 rounded-3xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-bold text-sm"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-500 ml-4 tracking-widest">
                Mot de passe
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 p-5 pl-14 rounded-3xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-bold text-sm"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 mt-4 ${
                loading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/20 active:scale-95 text-white"
              }`}
            >
              {loading ? (
                "Initialisation..."
              ) : (
                <>
                  Se connecter <FiArrowRight size={16} />
                </>
              )}
            </button>

            <div className="pt-6 text-center">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                Nouvel utilisateur ?{" "}
                <Link
                  to="/register"
                  className="text-blue-500 hover:text-blue-400 transition-colors underline decoration-blue-500/30 underline-offset-4"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

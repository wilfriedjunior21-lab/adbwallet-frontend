import React, { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "acheteur",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/auth/register", formData);
      toast.success("Compte créé ! Connectez-vous.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur d'inscription");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-white">
      <Toaster />
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 rounded-[2.5rem] w-full max-w-md border border-slate-800"
      >
        <h2 className="text-2xl font-black italic mb-8 text-center uppercase">
          Inscription
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="NOM COMPLET"
            required
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-blue-500"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="EMAIL"
            required
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-blue-500"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="MOT DE PASSE"
            required
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-blue-500"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <select
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-blue-500 text-slate-400"
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="acheteur">Acheteur d'actions</option>
            <option value="actionnaire">Vendeur/Actionnaire</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all"
          >
            Créer mon compte
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500 uppercase font-bold">
          Déjà inscrit ?{" "}
          <Link to="/login" className="text-blue-500">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

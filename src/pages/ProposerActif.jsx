import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiDollarSign,
  FiLayers,
  FiFileText,
  FiArrowLeft,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const ProposerActif = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    totalQuantity: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/actions/propose", {
        ...formData,
        creatorId: userId,
        price: Number(formData.price),
        totalQuantity: Number(formData.totalQuantity),
      });

      toast.success("Proposition envoyée avec succès !");
      setTimeout(() => navigate("/dashboard-actionnaire"), 2000);
    } catch (err) {
      toast.error("Erreur lors de l'envoi de la proposition");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Toaster />
      <div className="max-w-3xl mx-auto">
        {/* RETOUR */}
        <button
          onClick={() => navigate("/dashboard-actionnaire")}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-xs font-black uppercase tracking-widest"
        >
          <FiArrowLeft /> Retour au Dashboard
        </button>

        <header className="mb-10">
          <h1 className="text-4xl font-black uppercase italic">
            Proposer un <span className="text-blue-500">Nouvel Actif</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Remplissez les détails de votre entreprise ou projet pour lever des
            fonds.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* NOM DE L'ACTIF */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                  Nom de l'entreprise / Projet
                </label>
                <div className="relative">
                  <FiPackage className="absolute left-5 top-5 text-blue-500" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Solaire Plus"
                    className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* PRIX PAR PART */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                  Prix par part (F CFA)
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-5 top-5 text-emerald-500" />
                  <input
                    type="number"
                    required
                    placeholder="Ex: 5000"
                    className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* QUANTITÉ TOTALE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                  Nombre de parts totales
                </label>
                <div className="relative">
                  <FiLayers className="absolute left-5 top-5 text-purple-500" />
                  <input
                    type="number"
                    required
                    placeholder="Ex: 100"
                    className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalQuantity: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* DESCRIPTION COURTE */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-2">
                  Description du projet
                </label>
                <div className="relative">
                  <FiFileText className="absolute left-5 top-5 text-slate-500" />
                  <textarea
                    required
                    rows="4"
                    placeholder="Expliquez brièvement votre projet aux investisseurs..."
                    className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all ${
              loading
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-white hover:text-black shadow-xl shadow-blue-900/20"
            }`}
          >
            {loading ? "Envoi en cours..." : "Soumettre la proposition"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProposerActif;

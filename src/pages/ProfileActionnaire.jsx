import React, { useState } from "react";
import api from "../api";
import {
  FiFileText,
  FiUser,
  FiCreditCard,
  FiUploadCloud,
  FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const ProfilActionnaire = () => {
  const [formData, setFormData] = useState({
    niu: "",
    nomDirigeant: "",
    cni: null,
  });
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Utilisation de FormData pour l'envoi du fichier CNI
    const data = new FormData();
    data.append("niu", formData.niu);
    data.append("nomDirigeant", formData.nomDirigeant);
    data.append("cni", formData.cni);

    try {
      await api.post("/user/upgrade-to-shareholder", data);
      toast.success("Documents envoyés avec succès !");
      setIsSent(true);
    } catch (err) {
      toast.error("Erreur lors de l'envoi des documents");
    } finally {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-slate-900 rounded-[2.5rem] border border-slate-800">
        <FiCheckCircle size={60} className="text-emerald-500 mb-4" />
        <h2 className="text-2xl font-black uppercase italic">
          Dossier en cours d'examen
        </h2>
        <p className="text-slate-500 mt-2">
          Nos administrateurs vérifient vos informations. Vous recevrez une
          notification dès validation.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl text-white">
      <div className="mb-8">
        <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
          <FiFileText className="text-blue-500" /> Identification
          Professionnelle
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          Complétez votre profil pour émettre des actifs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NIU */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-2 text-left">
            Numéro d'Identifiant Unique (NIU)
          </label>
          <div className="relative">
            <FiFileText className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              required
              placeholder="Ex: M0123456789"
              className="w-full p-5 pl-14 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm"
              onChange={(e) =>
                setFormData({ ...formData, niu: e.target.value })
              }
            />
          </div>
        </div>

        {/* Nom du Dirigeant */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-2 text-left">
            Nom complet du Dirigeant
          </label>
          <div className="relative">
            <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              required
              placeholder="Nom et Prénom"
              className="w-full p-5 pl-14 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-sm"
              onChange={(e) =>
                setFormData({ ...formData, nomDirigeant: e.target.value })
              }
            />
          </div>
        </div>

        {/* Upload CNI */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-2 text-left">
            Copie de la CNI (Recto/Verso)
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-800/30 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FiUploadCloud size={30} className="text-slate-500 mb-2" />
              <p className="text-xs text-slate-500 font-bold uppercase italic">
                {formData.cni
                  ? formData.cni.name
                  : "Cliquez pour uploader le fichier"}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={(e) =>
                setFormData({ ...formData, cni: e.target.files[0] })
              }
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-white hover:text-blue-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl disabled:bg-slate-800 disabled:text-slate-500"
        >
          {loading ? "Traitement..." : "Soumettre mon dossier"}
        </button>
      </form>
    </div>
  );
};

export default ProfilActionnaire;

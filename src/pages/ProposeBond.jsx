import React, { useState } from "react";
// Import de l'instance API personnalisée au lieu d'axios direct
import api from "../api";
import { useNavigate } from "react-router-dom";

const ProposeBond = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    titre: "",
    montantCible: "",
    tauxInteret: "",
    dureeMois: "",
    frequence: "Annuel",
    garantie: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Reset du message au début de l'envoi

    try {
      // On ajoute l'ID de l'actionnaire aux données
      const dataToSend = { ...formData, actionnaireId: userId };

      // UTILISATION DE L'INSTANCE API (Configuree pour Render)
      // On retire l'URL complète "http://localhost..." car elle est déjà dans api.js
      const response = await api.post("/bonds/propose", dataToSend);

      setMessage(
        "✅ Votre proposition d'obligation a été envoyée avec succès !"
      );

      // Redirection après 3 secondes
      setTimeout(() => navigate("/dashboard-actionnaire"), 3000);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      // On essaye de récupérer le message d'erreur du backend s'il existe
      const errorMsg =
        error.response?.data?.message ||
        "Erreur lors de l'envoi de la proposition.";
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-xl mt-10 text-white">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">
        Proposer une Obligation
      </h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded text-center font-bold ${
            message.includes("✅")
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Titre du projet
          </label>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            required
            className="w-full p-2 bg-gray-800 rounded border border-gray-700 outline-none focus:border-blue-500"
            placeholder="Ex: Expansion Ferme Solaire"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Montant Cible (FCFA)
            </label>
            <input
              type="number"
              name="montantCible"
              value={formData.montantCible}
              onChange={handleChange}
              required
              className="w-full p-2 bg-gray-800 rounded border border-gray-700 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Taux d'intérêt (%)
            </label>
            <input
              type="number"
              name="tauxInteret"
              value={formData.tauxInteret}
              onChange={handleChange}
              required
              className="w-full p-2 bg-gray-800 rounded border border-gray-700 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Durée (en mois)
            </label>
            <input
              type="number"
              name="dureeMois"
              value={formData.dureeMois}
              onChange={handleChange}
              required
              className="w-full p-2 bg-gray-800 rounded border border-gray-700 outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Fréquence de paiement
            </label>
            <select
              name="frequence"
              value={formData.frequence}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 rounded border border-gray-700 outline-none focus:border-blue-500 text-white"
            >
              <option value="Mensuel">Mensuel</option>
              <option value="Trimestriel">Trimestriel</option>
              <option value="Annuel">Annuel</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Valeur de la Garantie (FCFA)
          </label>
          <input
            type="number"
            name="garantie"
            value={formData.garantie}
            onChange={handleChange}
            required
            className="w-full p-2 bg-gray-800 rounded border border-gray-700 outline-none focus:border-blue-500"
            placeholder="Valeur estimée des actifs en garantie"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description détaillée
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full p-2 bg-gray-800 rounded border border-gray-700 outline-none focus:border-blue-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold transition duration-200 ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Envoi en cours..." : "Soumettre l'obligation"}
        </button>
      </form>
    </div>
  );
};

export default ProposeBond;

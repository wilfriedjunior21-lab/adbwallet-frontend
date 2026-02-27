import React, { useState } from "react";
import axios from "axios";
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
    try {
      // On ajoute l'ID de l'actionnaire aux données
      const dataToSend = { ...formData, actionnaireId: userId };

      const response = await axios.post(
        "http://localhost:5000/api/bonds/propose",
        dataToSend
      );

      setMessage(
        "✅ Votre proposition d'obligation a été envoyée avec succès !"
      );
      setTimeout(() => navigate("/dashboard-actionnaire"), 3000);
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      setMessage("❌ Erreur lors de l'envoi de la proposition.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-xl mt-10">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">
        Proposer une Obligation
      </h2>

      {message && (
        <p className="mb-4 p-3 bg-gray-800 rounded text-center">{message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Titre du projet</label>
          <input
            type="text"
            name="titre"
            onChange={handleChange}
            required
            className="w-full p-2 bg-gray-800 rounded border border-gray-700"
            placeholder="Ex: Expansion Ferme Solaire"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">
              Montant Cible (FCFA)
            </label>
            <input
              type="number"
              name="montantCible"
              onChange={handleChange}
              required
              className="w-full p-2 bg-gray-800 rounded border border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Taux d'intérêt (%)
            </label>
            <input
              type="number"
              name="tauxInteret"
              onChange={handleChange}
              required
              className="w-full p-2 bg-gray-800 rounded border border-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Durée (en mois)</label>
            <input
              type="number"
              name="dureeMois"
              onChange={handleChange}
              required
              className="w-full p-2 bg-gray-800 rounded border border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              Fréquence de paiement
            </label>
            <select
              name="frequence"
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 rounded border border-gray-700"
            >
              <option value="Mensuel">Mensuel</option>
              <option value="Trimestriel">Trimestriel</option>
              <option value="Annuel">Annuel</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Valeur de la Garantie (FCFA)
          </label>
          <input
            type="number"
            name="garantie"
            onChange={handleChange}
            required
            className="w-full p-2 bg-gray-800 rounded border border-gray-700"
            placeholder="Valeur estimée des actifs en garantie"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Description détaillée
          </label>
          <textarea
            name="description"
            onChange={handleChange}
            rows="4"
            className="w-full p-2 bg-gray-800 rounded border border-gray-700"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition duration-200"
        >
          {loading ? "Envoi en cours..." : "Soumettre l'obligation"}
        </button>
      </form>
    </div>
  );
};

// --- TRÈS IMPORTANT : L'EXPORT ---
export default ProposeBond;

import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api"; // On utilise ton instance axios existante
import { FiPhone, FiDollarSign, FiCheckCircle } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const MobileDeposit = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");

  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleMobilePay = async (e) => {
    e.preventDefault();
    if (!userId) return toast.error("ID Utilisateur manquant dans le scan");

    setLoading(true);
    try {
      await api.post("/api/transactions/mtn/pay", {
        userId,
        amount: Number(amount),
        phone,
      });
      setSuccess(true);
      toast.success("Demande envoyée !");
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center text-white bg-black">
        <FiCheckCircle size={80} className="mb-6 text-emerald-500" />
        <h1 className="mb-2 text-2xl italic font-black uppercase">
          Demande Reçue !
        </h1>
        <p className="text-sm font-bold text-slate-400">
          Veuillez maintenant valider le message USSD qui vient d'apparaître sur
          votre téléphone MTN.
        </p>
        <p className="mt-6 text-[10px] text-blue-500 uppercase font-black">
          ADB Wallet - Paiement Sécurisé
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 font-sans text-white bg-black">
      <Toaster />
      <div className="max-w-md pt-10 mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl italic font-black text-blue-500 uppercase">
            ADB <span className="text-white">Pay</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">
            Dépôt Rapide via Scan
          </p>
        </div>

        <form
          onSubmit={handleMobilePay}
          className="space-y-6 bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800"
        >
          <div className="space-y-4">
            <div className="relative">
              <FiPhone className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-500" />
              <input
                type="tel"
                placeholder="Votre numéro MTN"
                className="w-full p-4 pl-12 font-bold bg-black border outline-none border-slate-800 rounded-2xl focus:border-blue-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <FiDollarSign className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-500" />
              <input
                type="number"
                placeholder="Montant (XAF)"
                className="w-full p-4 pl-12 text-lg font-bold bg-black border outline-none border-slate-800 rounded-2xl focus:border-blue-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
              loading
                ? "bg-slate-700"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
            }`}
          >
            {loading ? "Traitement..." : "Confirmer le Dépôt"}
          </button>
        </form>

        <p className="text-center text-[9px] text-slate-600 uppercase font-bold mt-10 tracking-widest">
          Sécurisé par MTN MoMo API & ADB Wallet
        </p>
      </div>
    </div>
  );
};

export default MobileDeposit;

import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import {
  FiPhone,
  FiDollarSign,
  FiCheckCircle,
  FiShield,
  FiArrowRight,
} from "react-icons/fi";
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
    if (!userId)
      return toast.error(
        "ID Utilisateur manquant (Veuillez scanner le QR Code à nouveau)"
      );

    // Validation basique du numéro (exemple pour 9 chiffres)
    if (phone.length < 8) return toast.error("Numéro de téléphone invalide");

    setLoading(true);
    try {
      await api.post("/transactions/mtn/pay", {
        userId,
        amount: Number(amount),
        phone,
      });
      setSuccess(true);
      toast.success("Demande de paiement envoyée !");
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Le service MTN est temporairement indisponible"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- ÉCRAN DE SUCCÈS ---
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center text-white bg-slate-950">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
          <FiCheckCircle size={100} className="relative text-emerald-500" />
        </div>
        <h1 className="mb-4 text-3xl italic font-black uppercase tracking-tighter">
          Demande <span className="text-emerald-500">Reçue</span>
        </h1>
        <div className="max-w-xs p-6 border bg-slate-900 border-slate-800 rounded-3xl">
          <p className="text-sm font-bold leading-relaxed text-slate-400">
            Un message de confirmation{" "}
            <span className="text-white">MTN MoMo</span> vient d'être envoyé au{" "}
            <span className="text-blue-500">{phone}</span>.
          </p>
          <div className="h-px my-4 bg-slate-800"></div>
          <p className="text-[11px] uppercase font-black text-slate-500 tracking-widest">
            Entrez votre code secret sur votre téléphone pour finaliser.
          </p>
        </div>
        <p className="mt-12 text-[9px] text-blue-500 uppercase font-black tracking-[0.4em] opacity-50">
          ADB Wallet - Terminal de Paiement
        </p>
      </div>
    );
  }

  // --- ÉCRAN DE FORMULAIRE ---
  return (
    <div className="min-h-screen p-6 font-sans text-white bg-slate-950">
      <Toaster position="top-center" />
      <div className="max-w-md pt-12 mx-auto">
        {/* LOGO SECTION */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 bg-blue-600/10 rounded-2xl">
            <FiShield className="text-blue-500" size={28} />
          </div>
          <h1 className="text-4xl italic font-black text-white uppercase tracking-tighter">
            ADB <span className="text-blue-500">PAY</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
            Passerelle de dépôt sécurisée
          </p>
        </div>

        {/* CARD FORM */}
        <div className="relative group">
          <div className="absolute inset-0 transition-all duration-500 opacity-20 bg-blue-600 blur-3xl group-hover:opacity-30"></div>

          <form
            onSubmit={handleMobilePay}
            className="relative space-y-6 bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-2xl"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">
                  Numéro Mobile Money
                </label>
                <div className="relative">
                  <FiPhone
                    className="absolute -translate-y-1/2 left-5 top-1/2 text-slate-600"
                    size={18}
                  />
                  <input
                    type="tel"
                    placeholder="6xx xxx xxx"
                    className="w-full p-5 pl-14 font-black bg-slate-950 border outline-none border-slate-800 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-700"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-4 tracking-widest">
                  Montant du Dépôt
                </label>
                <div className="relative">
                  <FiDollarSign
                    className="absolute -translate-y-1/2 left-5 top-1/2 text-slate-600"
                    size={18}
                  />
                  <input
                    type="number"
                    placeholder="Montant (XAF)"
                    className="w-full p-5 pl-14 text-xl font-black bg-slate-950 border outline-none border-slate-800 rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-700 text-blue-400"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 ${
                loading
                  ? "bg-slate-800 text-slate-600 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 active:scale-95 text-white"
              }`}
            >
              {loading ? (
                "Traitement en cours..."
              ) : (
                <>
                  Confirmer le paiement <FiArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col items-center gap-4 mt-12 opacity-40">
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-black uppercase tracking-widest">
              MTN MOMO API
            </span>
            <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
            <span className="text-[9px] font-black uppercase tracking-widest">
              SLL ENCRYPTION
            </span>
          </div>
          <p className="text-[8px] text-slate-600 uppercase font-bold tracking-widest">
            © 2026 ADB WALLET CORE SYSTEM
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileDeposit;

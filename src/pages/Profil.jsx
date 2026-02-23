import React, { useState, useEffect } from "react";
import api from "../api";
import { toast, Toaster } from "react-hot-toast";
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiUser,
  FiMail,
  FiWallet,
} from "react-icons/fi";

const Profil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docUrl, setDocUrl] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!userId) return;
        const res = await api.get(`/api/user/${userId}`);
        setUser(res.data);
      } catch (err) {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleSubmitKYC = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/user/submit-kyc", { userId, documentUrl: docUrl });
      toast.success("Demande envoyée !");
      setUser({ ...user, kycStatus: "en_attente" });
    } catch (err) {
      toast.error("Échec de l'envoi");
    }
  };

  if (loading) return <div className="p-10 text-white">Chargement...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">
      <Toaster />
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-10">
        MON <span className="text-blue-500">PROFIL</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
          <div className="space-y-6">
            <div>
              <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">
                Nom
              </label>
              <p className="text-xl font-bold">{user?.name}</p>
            </div>
            <div>
              <label className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-2">
                Email
              </label>
              <p className="text-lg">{user?.email}</p>
            </div>
            <div className="pt-6 border-t border-slate-800">
              <label className="text-emerald-500 text-[10px] font-black uppercase tracking-widest block mb-2">
                Solde
              </label>
              <p className="text-3xl font-black">{user?.balance || 0} FCFA</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6 text-center">
            Statut KYC
          </p>

          <div className="flex flex-col items-center text-center">
            {user?.kycStatus === "valide" ? (
              <>
                <FiCheckCircle size={50} className="text-emerald-500 mb-4" />
                <p className="font-bold uppercase italic text-emerald-500">
                  Vérifié
                </p>
              </>
            ) : user?.kycStatus === "en_attente" ? (
              <>
                <FiClock size={50} className="text-blue-500 mb-4" />
                <p className="font-bold uppercase italic text-blue-500">
                  En attente
                </p>
              </>
            ) : (
              <div className="w-full">
                <FiAlertCircle
                  size={50}
                  className="text-orange-500 mx-auto mb-4"
                />
                <p className="font-bold uppercase italic text-orange-500 mb-6">
                  Non Vérifié
                </p>
                <form onSubmit={handleSubmitKYC} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Lien de la pièce (Drive/URL)"
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs outline-none focus:border-blue-500"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                  >
                    Vérifier mon compte
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;

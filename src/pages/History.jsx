import React, { useEffect, useState } from "react";
import api from "../api";
import {
  FiClock,
  FiCheckCircle,
  FiActivity,
  FiArrowDownRight,
  FiArrowUpRight,
} from "react-icons/fi";

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;
      try {
        // Ajustement de l'URL pour correspondre à ton instance Axios
        const res = await api.get(`/transactions/user/${userId}`);
        setTransactions(res.data || []);
      } catch (err) {
        console.error("Erreur de chargement de l'historique", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-10 text-center animate-pulse text-slate-500 font-black uppercase tracking-widest text-[10px]">
        Chargement du journal...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
      {/* HEADER */}
      <div className="p-6 border-b border-slate-800 bg-slate-800/20 flex items-center justify-between">
        <div>
          <h2 className="text-lg italic font-black uppercase tracking-tighter text-white">
            Activités <span className="text-blue-500">Récentes</span>
          </h2>
          <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">
            Flux de transactions live
          </p>
        </div>
        <FiActivity className="text-slate-600" size={20} />
      </div>

      {/* LISTE */}
      <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
        {transactions.length > 0 ? (
          transactions.map((t) => (
            <div
              key={t._id}
              className="flex justify-between items-center p-5 hover:bg-white/5 border-b border-slate-800/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* ICON DYNAMIQUE */}
                <div
                  className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${
                    t.type === "achat" || t.type === "retrait"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {t.status === "valide" ? (
                    t.type === "achat" ? (
                      <FiArrowDownRight size={18} />
                    ) : (
                      <FiArrowUpRight size={18} />
                    )
                  ) : (
                    <FiClock size={18} className="animate-spin-slow" />
                  )}
                </div>

                <div>
                  <p className="font-black text-xs uppercase tracking-tight text-white">
                    {t.action?.name || t.type || "Transaction"}
                  </p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">
                    {new Date(t.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`font-black text-sm ${
                    t.type === "achat" || t.type === "retrait"
                      ? "text-white"
                      : "text-emerald-400"
                  }`}
                >
                  {t.type === "achat" || t.type === "retrait" ? "-" : "+"}
                  {t.amount?.toLocaleString()}{" "}
                  <span className="text-[10px]">F</span>
                </p>

                <div className="flex items-center justify-end gap-1 mt-1">
                  <span
                    className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${
                      t.status === "valide"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.2em] italic">
              Aucun mouvement détecté
            </p>
          </div>
        )}
      </div>

      {/* FOOTER STATIQUE OPTIONNEL */}
      <div className="p-4 bg-black/20 text-center border-t border-slate-800">
        <button className="text-[9px] font-black uppercase text-blue-500 hover:text-white transition-colors tracking-widest">
          Exporter le relevé (PDF)
        </button>
      </div>
    </div>
  );
};

export default History;

import React, { useEffect, useState } from "react";
import api from "../api";

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/api/user/transactions/${userId}`);
        setTransactions(res.data);
      } catch (err) {
        console.error("Erreur historique");
      }
    };
    fetchHistory();
  }, [userId]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-slate-800">
        Activités Récentes
      </h2>
      <div className="space-y-4">
        {transactions.map((t) => (
          <div
            key={t._id}
            className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition"
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  t.status === "valide"
                    ? "bg-green-100 text-green-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                {t.status === "valide" ? "✓" : "⌛"}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-700">
                  {t.action?.companyName || "Transaction"}
                </p>
                <p className="text-[10px] text-slate-400">
                  {new Date(t.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-800">
                -{t.amount.toLocaleString()} F
              </p>
              <p className="text-[9px] uppercase font-bold text-slate-400">
                {t.status}
              </p>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="text-center text-slate-400 py-4 italic text-sm">
            Aucun historique disponible.
          </p>
        )}
      </div>
    </div>
  );
};

export default History;

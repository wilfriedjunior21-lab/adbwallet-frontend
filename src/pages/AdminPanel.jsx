import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import api from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FiUsers,
  FiPackage,
  FiCheck,
  FiX,
  FiShield,
  FiDollarSign,
  FiClock,
  FiPieChart,
  FiSend,
  FiArrowUpRight,
  FiTrash2,
  FiPhone,
  FiBriefcase,
  FiTrendingUp,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bonds, setBonds] = useState([]);
  const [tab, setTab] = useState("kyc");

  // Nouveaux états pour les stats
  const [statsData, setStatsData] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [selectedAction, setSelectedAction] = useState("");
  const [amountPerShare, setAmountPerShare] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async (isAutoRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const [uRes, aRes, tRes, bRes, sRes] = await Promise.all([
        api.get("/admin/users", { signal: abortControllerRef.current.signal }),
        api.get("/admin/actions", {
          signal: abortControllerRef.current.signal,
        }),
        api.get("/admin/transactions", {
          signal: abortControllerRef.current.signal,
        }),
        api.get("/admin/bonds", { signal: abortControllerRef.current.signal }),
        api.get("/admin/stats/transactions", {
          signal: abortControllerRef.current.signal,
        }),
      ]);
      setUsers(uRes.data);
      setActions(aRes.data);
      setTransactions(tRes.data);
      setBonds(bRes.data || []);
      // Mise à jour des stats
      setTotalTransactions(sRes.data.total);
      setStatsData(sRes.data.chartData);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Erreur de rafraîchissement auto:", err);
      if (!isAutoRefresh) {
        toast.error("Erreur de chargement des données");
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData(true);
    }, 5000);
    return () => {
      clearInterval(intervalId);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchData]);

  // --- LOGIQUE D'ENVOI NOTIFICATION (AJOUTÉE) ---
  const triggerNotification = async (userId, type, message) => {
    try {
      await api.post("/admin/send-notification", { userId, type, message });
    } catch (err) {
      console.warn(
        "La notification n'a pas pu être envoyée, mais la validation est faite."
      );
    }
  };

  const handleValidateKYC = async (id, status) => {
    try {
      await api.patch(`/admin/kyc/${id}`, { status });

      if (status === "valide") {
        await triggerNotification(
          id,
          "KYC_SUCCESS",
          "Votre compte a été validé avec succès."
        );
      }

      toast.success(`Utilisateur mis à jour : ${status}`);
      fetchData();
    } catch (err) {
      toast.error("Erreur mise à jour KYC");
    }
  };

  const handleValidateAction = async (id) => {
    try {
      await api.patch(`/admin/actions/${id}/validate`);

      const action = actions.find((a) => a._id === id);
      if (action) {
        await triggerNotification(
          action.creatorId,
          "ASSET_VALIDATED",
          `Votre actif ${action.name} est en ligne.`
        );
      }

      toast.success("Action publiée sur le marché !");
      fetchData();
    } catch (err) {
      toast.error("Erreur publication actif");
    }
  };

  const handleValidateDeposit = async (id) => {
    try {
      await api.patch(`/admin/transactions/${id}/validate`);

      const trans = transactions.find((t) => t._id === id);
      if (trans) {
        await triggerNotification(
          trans.userId?._id,
          "DEPOSIT_CONFIRMED",
          `Votre dépôt de ${trans.amount} F a été validé.`
        );
      }

      toast.success("Dépôt validé et compte crédité !");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la validation du dépôt");
    }
  };

  const handleValidateWithdrawal = async (id) => {
    if (
      !window.confirm(
        "Confirmez-vous avoir envoyé l'argent manuellement au client ?"
      )
    )
      return;
    try {
      await api.patch(`/admin/transactions/${id}/validate`);

      const trans = transactions.find((t) => t._id === id);
      if (trans) {
        await triggerNotification(
          trans.userId?._id,
          "WITHDRAW_SUCCESS",
          `Votre retrait de ${trans.amount} F a été traité.`
        );
      }

      toast.success("Retrait marqué comme terminé !");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la validation du retrait");
    }
  };

  const handleRejectWithdrawal = async (id) => {
    const reason = window.prompt(
      "Motif du refus (sera visible par le client) :"
    );
    if (reason === null) return;
    try {
      await api.patch(`/admin/transactions/${id}/reject`, { reason });
      toast.success("Retrait refusé. L'utilisateur a été recrédité.");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors du rejet du retrait");
    }
  };

  const handleDistributeDividends = async (e) => {
    e.preventDefault();
    if (!selectedAction || !amountPerShare)
      return toast.error("Veuillez remplir tous les champs");
    const confirmDist = window.confirm(`Confirmez-vous la distribution ?`);
    if (!confirmDist) return;
    setIsProcessing(true);
    try {
      const res = await api.post("/admin/distribute-dividends", {
        actionId: selectedAction,
        amountPerShare: Number(amountPerShare),
      });
      toast.success(res.data.message);
      setAmountPerShare("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur distribution");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleValidateBond = async (id) => {
    try {
      await api.patch(`/admin/bonds/${id}/validate`);

      const bond = bonds.find((b) => b._id === id);
      if (bond) {
        await triggerNotification(
          bond.actionnaireId?._id,
          "BOND_VALIDATED",
          `Votre obligation ${bond.titre} est maintenant active.`
        );
      }

      toast.success("Obligation approuvée et mise en ligne !");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la validation de l'obligation");
    }
  };

  const handleRejectBond = async (id) => {
    if (!window.confirm("Voulez-vous vraiment rejeter cette obligation ?"))
      return;
    try {
      await api.delete(`/admin/bonds/${id}`);
      toast.success("Obligation rejetée");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors du rejet");
    }
  };

  return (
    <div className="p-6 mx-auto text-white max-w-7xl">
      <Toaster />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-16 h-16 rounded-full border-2 border-blue-500 shadow-lg object-cover"
          />
          <div>
            <h1 className="text-3xl italic font-black uppercase leading-none">
              Adb <span className="text-blue-500">Wallet</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">
              Administration
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
          Live Auto-Sync (5s)
        </div>
      </div>

      {/* --- STATISTIQUES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
            <FiUsers size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">
              Total Utilisateurs
            </p>
            <p className="text-3xl font-black italic">{users.length}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl">
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500">
            <FiCheck size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">
              KYC Validés
            </p>
            <p className="text-3xl font-black italic">
              {users.filter((u) => u.kycStatus === "valide").length}
            </p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl">
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500">
            <FiBriefcase size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">
              Obligations Actives
            </p>
            <p className="text-3xl font-black italic">
              {bonds.filter((b) => b.status === "valide").length}
            </p>
          </div>
        </div>
      </div>

      {/* --- ANALYTICS (TRANSACTIONS) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-center">
          <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500 w-fit mb-4">
            <FiTrendingUp size={28} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-500">
            Volume Transactions
          </p>
          <p className="text-4xl font-black italic mb-2">{totalTransactions}</p>
          <p className="text-[10px] text-slate-400 font-bold">
            Total cumulé sur la plateforme
          </p>
        </div>

        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl min-h-[300px]">
          <h3 className="text-xs font-black uppercase text-slate-500 mb-6 flex items-center gap-2">
            Activité des 7 derniers jours
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString("fr-FR", {
                      weekday: "short",
                    });
                  }}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#3b82f6", fontWeight: "bold" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setTab("kyc")}
          className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${
            tab === "kyc"
              ? "bg-blue-600"
              : "bg-slate-900 border border-slate-800 text-slate-500"
          }`}
        >
          <FiUsers /> KYC (
          {users.filter((u) => u.kycStatus === "en_attente").length})
        </button>

        <button
          onClick={() => setTab("actions")}
          className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${
            tab === "actions"
              ? "bg-blue-600"
              : "bg-slate-900 border border-slate-800 text-slate-500"
          }`}
        >
          <FiPackage /> Actifs (
          {actions.filter((a) => a.status === "en_attente").length})
        </button>

        <button
          onClick={() => setTab("bonds")}
          className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${
            tab === "bonds"
              ? "bg-amber-600"
              : "bg-slate-900 border border-slate-800 text-slate-500"
          }`}
        >
          <FiBriefcase /> Obligations (
          {bonds.filter((b) => b.status === "en_attente").length})
        </button>

        <button
          onClick={() => setTab("deposits")}
          className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${
            tab === "deposits"
              ? "bg-emerald-600"
              : "bg-slate-900 border border-slate-800 text-slate-500"
          }`}
        >
          <FiDollarSign /> Dépôts (
          {
            transactions.filter(
              (t) => t.type === "depot" && t.status === "en_attente"
            ).length
          }
          )
        </button>

        <button
          onClick={() => setTab("withdrawals")}
          className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${
            tab === "withdrawals"
              ? "bg-red-600"
              : "bg-slate-900 border border-slate-800 text-slate-500"
          }`}
        >
          <FiArrowUpRight /> Retraits (
          {
            transactions.filter(
              (t) => t.type === "retrait" && t.status === "en_attente"
            ).length
          }
          )
        </button>

        <button
          onClick={() => setTab("dividends")}
          className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${
            tab === "dividends"
              ? "bg-purple-600"
              : "bg-slate-900 border border-slate-800 text-slate-500"
          }`}
        >
          <FiPieChart /> Dividendes
        </button>
      </div>

      {/* --- SECTIONS DE CONTENU --- */}

      {tab === "kyc" && (
        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-6">Utilisateur</th>
                <th className="p-6">Document</th>
                <th className="p-6">Statut</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="transition-colors hover:bg-slate-800/50"
                >
                  <td className="p-6 font-bold">
                    {u.name} <br />
                    <span className="text-[10px] text-slate-500">
                      {u.email}
                    </span>
                  </td>
                  <td className="p-6 text-xs text-blue-500 underline">
                    {u.kycDocUrl ? (
                      <a href={u.kycDocUrl} target="_blank" rel="noreferrer">
                        Voir la pièce
                      </a>
                    ) : (
                      "Aucun"
                    )}
                  </td>
                  <td className="p-6">
                    <span
                      className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                        u.kycStatus === "valide"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-orange-500/10 text-orange-500"
                      }`}
                    >
                      {u.kycStatus}
                    </span>
                  </td>
                  <td className="p-6 space-x-2 text-right">
                    {u.kycStatus === "en_attente" && (
                      <>
                        <button
                          onClick={() => handleValidateKYC(u._id, "valide")}
                          className="p-3 bg-emerald-600 rounded-xl hover:bg-emerald-500"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() =>
                            handleValidateKYC(u._id, "non_verifie")
                          }
                          className="p-3 bg-red-600 rounded-xl hover:bg-red-500"
                        >
                          <FiX />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "actions" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {actions.map((a) => (
            <div
              key={a._id}
              className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl italic font-black uppercase">
                  {a.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    a.status === "valide"
                      ? "bg-emerald-500 text-black"
                      : "bg-blue-500/20 text-blue-500"
                  }`}
                >
                  {a.status}
                </span>
              </div>
              <p className="mb-6 text-xs text-slate-500">{a.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-950 rounded-2xl">
                  <p className="text-[8px] text-slate-500 uppercase font-black">
                    Prix / Part
                  </p>
                  <p className="font-bold text-blue-400">{a.price} F</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl">
                  <p className="text-[8px] text-slate-500 uppercase font-black">
                    Quantité
                  </p>
                  <p className="font-bold">{a.totalQuantity} unités</p>
                </div>
              </div>
              {a.status === "en_attente" && (
                <button
                  onClick={() => handleValidateAction(a._id)}
                  className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  Approuver et Mettre en vente
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "bonds" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {bonds.length === 0 ? (
            <p className="text-slate-500 italic p-10 bg-slate-900 rounded-[2rem] border border-slate-800 text-center col-span-2">
              Aucune obligation trouvée.
            </p>
          ) : (
            bonds.map((b) => (
              <div
                key={b._id}
                className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl italic font-black uppercase text-amber-500">
                      {b.titre}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Émis par: {b.actionnaireId?.name || "Actionnaire"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                      b.status === "valide"
                        ? "bg-emerald-500 text-black"
                        : "bg-amber-500/20 text-amber-500"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 bg-slate-950 rounded-xl">
                    <p className="text-[8px] text-slate-500 uppercase font-black">
                      Rendement
                    </p>
                    <p className="font-bold text-emerald-400">
                      {b.tauxInteret}%
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl">
                    <p className="text-[8px] text-slate-500 uppercase font-black">
                      Durée
                    </p>
                    <p className="font-bold">{b.dureeMois} mois</p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl">
                    <p className="text-[8px] text-slate-500 uppercase font-black">
                      Fréquence
                    </p>
                    <p className="font-bold text-xs">{b.frequence}</p>
                  </div>
                </div>
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1">
                      <FiShield className="text-blue-500" /> Garantie bloquée
                    </span>
                    <span className="font-black text-blue-400">
                      {b.garantie?.toLocaleString()} F
                    </span>
                  </div>
                </div>
                {b.status === "en_attente" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleValidateBond(b._id)}
                      className="flex-1 bg-amber-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-amber-600 transition-all"
                    >
                      Valider l'obligation
                    </button>
                    <button
                      onClick={() => handleRejectBond(b._id)}
                      className="px-6 bg-red-600/20 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "deposits" && (
        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-6">Utilisateur</th>
                <th className="p-6">Montant</th>
                <th className="p-6">Statut</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions
                .filter((t) => t.type === "depot")
                .map((t) => (
                  <tr
                    key={t._id}
                    className="transition-colors hover:bg-slate-800/50"
                  >
                    <td className="p-6 font-bold">
                      {t.userId?.name || "Inconnu"} <br />
                      <span className="text-[10px] text-slate-500">
                        {t.userId?.email}
                      </span>
                    </td>
                    <td className="p-6 font-black text-emerald-500">
                      {t.amount.toLocaleString()} F
                    </td>
                    <td className="p-6 text-[9px] font-black uppercase italic flex items-center gap-2">
                      {t.status === "en_attente" ? (
                        <>
                          <FiClock className="text-orange-500" />
                          <span className="text-orange-500">{t.status}</span>
                        </>
                      ) : (
                        <>
                          <FiCheck className="text-emerald-500" />
                          <span className="text-emerald-500">{t.status}</span>
                        </>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      {t.status === "en_attente" && (
                        <button
                          onClick={() => handleValidateDeposit(t._id)}
                          className="p-3 shadow-lg bg-emerald-600 rounded-xl hover:bg-emerald-500"
                        >
                          <FiCheck />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "withdrawals" && (
        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-6">Utilisateur</th>
                <th className="p-6">Montant Demandé</th>
                <th className="p-6 text-blue-400">Numéro de Paiement</th>
                <th className="p-6">Statut</th>
                <th className="p-6 text-right">Actions Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions
                .filter((t) => t.type === "retrait")
                .map((t) => (
                  <tr
                    key={t._id}
                    className="transition-colors hover:bg-slate-800/50"
                  >
                    <td className="p-6 font-bold">
                      {t.userId?.name || "Inconnu"} <br />
                      <span className="text-[10px] text-slate-500">
                        {t.userId?.email}
                      </span>
                    </td>
                    <td className="p-6 font-black text-red-500">
                      -{t.amount.toLocaleString()} F
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 px-3 py-2 border bg-black/40 border-slate-800 rounded-xl w-fit">
                        <FiPhone className="text-blue-500" size={14} />
                        <span className="text-xs font-black tracking-wider text-white">
                          {t.recipientPhone || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                          t.status === "en_attente"
                            ? "bg-orange-500/10 text-orange-500"
                            : t.status === "valide"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-6 space-x-2 text-right">
                      {t.status === "en_attente" && (
                        <>
                          <button
                            onClick={() => handleValidateWithdrawal(t._id)}
                            className="p-3 shadow-lg bg-emerald-600 hover:bg-white hover:text-emerald-600 rounded-xl"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => handleRejectWithdrawal(t._id)}
                            className="p-3 bg-red-600 shadow-lg hover:bg-white hover:text-red-600 rounded-xl"
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "dividends" && (
        <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 text-purple-500 bg-purple-500/10 rounded-2xl">
              <FiPieChart size={32} />
            </div>
            <div>
              <h2 className="text-2xl italic font-black text-white uppercase">
                Distribuer des Dividendes
              </h2>
              <p className="text-xs font-bold tracking-wider uppercase text-slate-500">
                Rémunérer les détenteurs d'actifs
              </p>
            </div>
          </div>
          <form onSubmit={handleDistributeDividends} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-2">
                Sélectionner l'entreprise
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full p-5 text-sm font-bold text-white transition-all border outline-none bg-slate-950 border-slate-800 rounded-2xl focus:border-purple-500"
              >
                <option value="">Choisir un actif valide...</option>
                {actions
                  .filter((a) => a.status === "valide")
                  .map((action) => (
                    <option key={action._id} value={action._id}>
                      {action.name} ({action.price} F / part)
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-2">
                Montant à verser par part possédée
              </label>
              <div className="relative">
                <FiDollarSign className="absolute text-purple-500 -translate-y-1/2 left-5 top-1/2" />
                <input
                  type="number"
                  placeholder="Exemple: 50"
                  value={amountPerShare}
                  onChange={(e) => setAmountPerShare(e.target.value)}
                  className="w-full p-5 pl-12 text-sm font-bold text-white transition-all border outline-none bg-slate-950 border-slate-800 rounded-2xl focus:border-purple-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl ${
                isProcessing
                  ? "bg-slate-800 text-slate-600"
                  : "bg-purple-600 hover:bg-white hover:text-purple-600"
              }`}
            >
              <FiSend />{" "}
              {isProcessing
                ? "Traitement en cours..."
                : "Lancer la distribution"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api";
import NavbarActionnaire from "./NavbarActionnaire";
import {
  FiTrendingUp,
  FiArrowUpRight,
  FiActivity,
  FiEdit2,
  FiSave,
  FiPackage,
  FiMessageSquare,
  FiSend,
  FiPhone,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast, Toaster } from "react-hot-toast";

const DashboardActionnaire = () => {
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({
    nombreVentes: 0,
    actionsCount: 0,
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [mesActions, setMesActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ price: 0, description: "" });

  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState({});

  const userId = localStorage.getItem("userId");

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      // Note: Suppression des /api/ si ton instance axios (api.js) a déjà baseURL: .../api
      const [userRes, transRes, actionsRes, messagesRes] = await Promise.all([
        api.get(`/user/${userId}`),
        api.get(`/transactions/user/${userId}`),
        api.get(`/actions`),
        api.get(`/messages/owner/${userId}`),
      ]);

      setBalance(userRes.data.balance || 0);
      setTransactions(transRes.data || []);
      setMessages(messagesRes.data || []);

      const ventes = (transRes.data || []).filter((t) => t.type === "vente");
      const filteredActions = (actionsRes.data || []).filter(
        (a) => a.creatorId === userId
      );

      setMesActions(filteredActions);
      setStats({
        nombreVentes: ventes.length,
        actionsCount: filteredActions.length,
      });
    } catch (err) {
      console.error("Erreur Dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // --- GESTION DES ACTIFS ---
  const startEdit = (action) => {
    setEditingId(action._id);
    setEditForm({ price: action.price, description: action.description || "" });
  };

  const handleUpdateAction = async (id) => {
    try {
      await api.patch(`/actions/${id}`, editForm);
      toast.success("Actif mis à jour !");
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la modification");
    }
  };

  // --- CALCUL DES DONNÉES GRAPHIQUE ---
  const chartData = useMemo(() => {
    const gains = transactions
      .filter(
        (t) =>
          (t.type === "vente" || t.type === "dividende") &&
          t.status === "valide"
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let cumul = 0;
    return gains.map((t) => {
      cumul += t.amount;
      return {
        name: new Date(t.date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
        }),
        montant: cumul,
      };
    });
  }, [transactions]);

  // --- LOGIQUE DE RETRAIT ---
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (amount <= 0) return toast.error("Montant invalide");
    if (amount > balance) return toast.error("Solde insuffisant");
    if (withdrawPhone.length < 8)
      return toast.error("Numéro de téléphone invalide");

    try {
      await api.post("/transactions/withdraw", {
        userId,
        amount,
        recipientPhone: withdrawPhone,
      });
      toast.success("Demande de retrait envoyée !");
      setWithdrawAmount("");
      setWithdrawPhone("");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors du retrait");
    }
  };

  // --- RÉPONSE SUPPORT ---
  const handleSendReply = async (messageId) => {
    const replyText = replies[messageId];
    if (!replyText?.trim()) return toast.error("Le message est vide");
    try {
      await api.patch(`/messages/reply/${messageId}`, { reply: replyText });
      toast.success("Réponse envoyée !");
      setReplies({ ...replies, [messageId]: "" });
      fetchData();
    } catch (err) {
      toast.error("Erreur d'envoi");
    }
  };

  if (loading && !mesActions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-blue-500 font-black animate-pulse tracking-[0.3em] uppercase">
          Synchronisation Business...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-black">
      <NavbarActionnaire />
      <div className="max-w-6xl p-6 mx-auto">
        <Toaster position="top-right" />

        <header className="mt-8 mb-10">
          <h1 className="text-4xl italic font-black uppercase">
            Espace <span className="text-blue-500">Business</span>
          </h1>
          <p className="mt-2 text-[10px] font-black tracking-widest uppercase text-slate-500">
            Flux financier en temps réel
          </p>
        </header>

        {/* --- SECTION PERFORMANCE --- */}
        <div className="mb-10 bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg italic font-black uppercase tracking-tighter">
              Performance de Croissance
            </h3>
            <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl">
              <FiTrendingUp size={20} />
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}F`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="montant"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={0.1}
                  fill="#10b981"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- GRID MES ACTIFS --- */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <FiPackage className="text-blue-500" size={24} />
            <h2 className="text-xl italic font-black uppercase">
              Actifs sous Gestion
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {mesActions.map((action) => (
              <div
                key={action._id}
                className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] hover:border-blue-500/40 transition-all"
              >
                {editingId === action._id ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-black rounded-xl border border-slate-700">
                      <label className="text-[8px] font-black uppercase text-slate-500">
                        Prix unitaire
                      </label>
                      <input
                        type="number"
                        className="w-full bg-transparent outline-none text-emerald-400 font-black"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({ ...editForm, price: e.target.value })
                        }
                      />
                    </div>
                    <textarea
                      placeholder="Description de l'actif..."
                      className="w-full h-20 p-4 bg-black border outline-none border-slate-700 rounded-xl text-slate-300 text-xs"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={() => handleUpdateAction(action._id)}
                      className="w-full bg-emerald-600 py-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-emerald-500"
                    >
                      <FiSave /> Enregistrer les modifications
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-black uppercase tracking-tighter">
                        {action.name}
                      </h3>
                      <button
                        onClick={() => startEdit(action)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600 transition-colors"
                      >
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-black text-white">
                          {action.price?.toLocaleString()}{" "}
                          <span className="text-sm text-blue-500">F</span>
                        </p>
                        <p className="text-[9px] text-slate-500 uppercase font-black mt-1">
                          {action.availableQuantity} parts disponibles au marché
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] font-black bg-white/5 px-2 py-1 rounded text-slate-400 uppercase">
                          Live
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- STATS & SUPPORT --- */}
        <div className="grid grid-cols-1 gap-8 mb-12 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-6">
              <FiMessageSquare className="text-purple-500" size={24} />
              <h2 className="text-xl italic font-black uppercase">
                Support Clients
              </h2>
            </div>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-4 scrollbar-hide">
              {messages.length === 0 && (
                <p className="text-slate-600 italic text-sm">
                  Aucun message pour le moment.
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className="p-5 border bg-black/20 border-slate-800 rounded-3xl"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-[9px] font-black text-purple-400 uppercase">
                      De: {msg.senderId?.name || "Investisseur"}
                    </span>
                    <span className="text-[8px] text-slate-600">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mb-4 text-sm text-slate-300 font-medium">
                    "{msg.content}"
                  </p>
                  {msg.reply ? (
                    <div className="p-3 text-[11px] border-l-2 bg-emerald-500/5 text-slate-400 border-emerald-500 rounded-r-xl italic">
                      <span className="text-[8px] font-black text-emerald-500 uppercase block mb-1">
                        Ma réponse :
                      </span>
                      {msg.reply}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Répondre au client..."
                        className="flex-1 p-3 text-xs bg-black border rounded-2xl outline-none border-slate-800 focus:border-purple-500"
                        value={replies[msg._id] || ""}
                        onChange={(e) =>
                          setReplies({ ...replies, [msg._id]: e.target.value })
                        }
                      />
                      <button
                        onClick={() => handleSendReply(msg._id)}
                        className="p-4 bg-purple-600 rounded-2xl hover:bg-purple-500 transition-colors"
                      >
                        <FiSend size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center">
              <p className="text-[10px] font-black uppercase text-slate-500 mb-2">
                Solde Retirable
              </p>
              <h2 className="text-4xl font-black text-blue-500">
                {balance.toLocaleString()} F
              </h2>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex items-center gap-6">
              <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                <FiActivity size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">{stats.nombreVentes}</h2>
                <p className="text-[9px] font-black uppercase text-slate-500">
                  Ventes réalisées
                </p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex items-center gap-6">
              <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl">
                <FiTrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black">{stats.actionsCount}</h2>
                <p className="text-[9px] font-black uppercase text-slate-500">
                  Actifs en ligne
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- RETRAIT & HISTORIQUE --- */}
        <div className="grid grid-cols-1 gap-8 pb-20 lg:grid-cols-2">
          <div className="bg-gradient-to-br from-slate-900 to-black border border-slate-800 p-10 rounded-[3rem] shadow-2xl">
            <h3 className="mb-2 text-2xl italic font-black uppercase tracking-tighter">
              Retrait de fonds
            </h3>
            <p className="mb-8 text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Configuration du transfert mobile
            </p>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <input
                type="number"
                placeholder="Montant (FCFA)"
                className="w-full p-5 text-xl font-black bg-black border outline-none border-slate-800 rounded-3xl focus:border-blue-500"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-5 top-1/2 text-slate-500">
                  <FiPhone size={20} />
                </span>
                <input
                  type="tel"
                  placeholder="Numéro Mobile Money"
                  className="w-full p-5 text-lg font-black bg-black border outline-none pl-14 border-slate-800 rounded-3xl focus:border-emerald-500"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-3"
              >
                Initier le virement <FiArrowUpRight size={18} />
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-800 bg-slate-800/20 uppercase text-[10px] font-black text-slate-400 tracking-widest">
              Journal des flux financiers
            </div>
            <div className="flex-1 overflow-y-auto max-h-[400px] scrollbar-hide">
              {transactions.length === 0 && (
                <div className="p-10 text-center text-slate-600 text-xs">
                  Aucune transaction enregistrée
                </div>
              )}
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between p-6 border-b border-slate-800/50 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-2xl ${
                        t.type === "vente"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-orange-500/10 text-orange-500"
                      }`}
                    >
                      {t.type === "vente" ? (
                        <FiTrendingUp size={18} />
                      ) : (
                        <FiArrowUpRight size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase">
                        {t.type === "vente" ? "Revenu Vente" : "Retrait Cash"}
                      </p>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                        {new Date(t.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-black text-lg ${
                        t.type === "vente"
                          ? "text-emerald-400"
                          : "text-orange-400"
                      }`}
                    >
                      {t.type === "vente" ? "+" : "-"}{" "}
                      {t.amount.toLocaleString()} F
                    </p>
                    <span
                      className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${
                        t.status === "valide"
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardActionnaire;

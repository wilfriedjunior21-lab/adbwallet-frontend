import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api";
import NavbarActionnaire from "./NavbarActionnaire";
import {
  FiDollarSign,
  FiTrendingUp,
  FiArrowUpRight,
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiEdit2,
  FiSave,
  FiX,
  FiPackage,
  FiMessageSquare,
  FiSend,
  FiAlertCircle,
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
  const [withdrawPhone, setWithdrawPhone] = useState(""); // NOUVEAU : État pour le numéro
  const [transactions, setTransactions] = useState([]);
  const [mesActions, setMesActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ price: 0, description: "" });

  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState({});

  const userId = localStorage.getItem("userId");

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      const [userRes, transRes, actionsRes, messagesRes] = await Promise.all([
        api.get(`/api/user/${userId}`),
        api.get(`/api/transactions/user/${userId}`),
        api.get(`/api/actions`),
        api.get(`/api/messages/owner/${userId}`),
      ]);

      setBalance(userRes.data.balance || 0);
      setTransactions(transRes.data);
      setMessages(messagesRes.data);

      const ventes = transRes.data.filter((t) => t.type === "vente");
      const filteredActions = actionsRes.data.filter(
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

  const startEdit = (action) => {
    setEditingId(action._id);
    setEditForm({ price: action.price, description: action.description || "" });
  };

  const handleUpdateAction = async (id) => {
    try {
      await api.patch(`/api/actions/${id}`, editForm);
      toast.success("Actif mis à jour !");
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la modification");
    }
  };

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

  // --- LOGIQUE DE RETRAIT MISE À JOUR ---
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (amount <= 0) return toast.error("Montant invalide");
    if (amount > balance) return toast.error("Solde insuffisant");
    if (withdrawPhone.length < 8)
      return toast.error("Numéro de téléphone invalide");

    try {
      // On envoie le montant ET le numéro de téléphone à l'API
      await api.post("/api/transactions/withdraw", {
        userId,
        amount,
        recipientPhone: withdrawPhone, // Ce champ sera reçu par l'admin
      });
      toast.success("Demande de retrait envoyée !");
      setWithdrawAmount("");
      setWithdrawPhone("");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors du retrait");
    }
  };

  const handleSendReply = async (messageId) => {
    const replyText = replies[messageId];
    if (!replyText?.trim()) return toast.error("Le message est vide");
    try {
      await api.patch(`/api/messages/reply/${messageId}`, { reply: replyText });
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
          <p className="mt-2 text-sm font-bold tracking-wider uppercase text-slate-500">
            Flux financier en temps réel
          </p>
        </header>

        {/* GRAPHIQUE */}
        <div className="mb-10 bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center justify-between px-4 mb-6">
            <div>
              <h3 className="text-lg italic font-black uppercase">
                Performance
              </h3>
            </div>
            <FiTrendingUp className="text-emerald-500" size={24} />
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
                  tickFormatter={(val) => `${val} F`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="montant"
                  stroke="#10b981"
                  fillOpacity={0.2}
                  fill="#10b981"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GESTION ACTIFS */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FiPackage className="text-blue-500" size={24} />
            <h2 className="text-xl italic font-black uppercase">Mes Actifs</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {mesActions.map((action) => (
              <div
                key={action._id}
                className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] relative"
              >
                {editingId === action._id ? (
                  <div className="space-y-4">
                    <input
                      type="number"
                      className="w-full p-3 bg-black border outline-none border-slate-700 rounded-xl text-emerald-400"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: e.target.value })
                      }
                    />
                    <textarea
                      className="w-full h-20 p-3 bg-black border outline-none border-slate-700 rounded-xl text-slate-300"
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
                      className="w-full bg-emerald-600 p-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2"
                    >
                      <FiSave /> Enregistrer
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-black uppercase">
                        {action.name}
                      </h3>
                      <button
                        onClick={() => startEdit(action)}
                        className="p-2 rounded-full bg-slate-800 hover:bg-blue-600"
                      >
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                    <p className="text-2xl font-black text-emerald-400">
                      {action.price.toLocaleString()} F
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase mt-2">
                      {action.availableQuantity} parts restantes
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SUPPORT CHAT */}
        <div className="mb-12 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
          <div className="flex items-center gap-3 mb-6">
            <FiMessageSquare className="text-purple-500" size={24} />
            <h2 className="text-xl italic font-black uppercase">Support</h2>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className="p-4 border bg-slate-800/30 border-slate-800 rounded-2xl"
              >
                <p className="text-[10px] font-black text-purple-400 uppercase mb-1">
                  De: {msg.senderId?.name || "Client"}
                </p>
                <p className="mb-3 text-sm italic text-slate-300">
                  "{msg.content}"
                </p>
                {msg.reply ? (
                  <div className="p-2 text-xs border-l-2 rounded-lg bg-black/40 text-slate-400 border-emerald-500">
                    <span className="text-[8px] font-black text-emerald-500 uppercase block">
                      Ma réponse:
                    </span>
                    {msg.reply}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Votre réponse..."
                      className="flex-1 p-2 text-xs bg-black border rounded-lg outline-none border-slate-700 focus:border-purple-500"
                      value={replies[msg._id] || ""}
                      onChange={(e) =>
                        setReplies({ ...replies, [msg._id]: e.target.value })
                      }
                    />
                    <button
                      onClick={() => handleSendReply(msg._id)}
                      className="p-2 bg-purple-600 rounded-lg"
                    >
                      <FiSend />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STATS RAPIDES */}
        <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
            <p className="text-[10px] font-black uppercase text-slate-500 mb-2">
              Solde Retirable
            </p>
            <h2 className="text-4xl font-black text-blue-500">
              {balance.toLocaleString()} F
            </h2>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
            <FiActivity className="mb-4 text-emerald-500" size={30} />
            <h2 className="text-3xl font-black">{stats.nombreVentes} Ventes</h2>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
            <FiTrendingUp className="mb-4 text-purple-500" size={30} />
            <h2 className="text-3xl font-black">{stats.actionsCount} Actifs</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 pb-20 lg:grid-cols-2">
          {/* FORMULAIRE RETRAIT MIS À JOUR AVEC CHAMP NUMÉRO */}
          <div className="bg-gradient-to-br from-slate-900 to-black border border-slate-800 p-10 rounded-[3rem] shadow-2xl">
            <h3 className="mb-2 text-2xl italic font-black uppercase">
              Retrait
            </h3>
            <p className="mb-8 text-xs font-bold uppercase text-slate-500">
              Configuraton du transfert
            </p>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Montant (XAF)"
                  className="w-full p-5 text-xl font-black bg-black border outline-none border-slate-800 rounded-2xl focus:border-blue-500"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                />
              </div>
              {/* NOUVEAU : Champ pour le numéro de téléphone */}
              <div className="relative">
                <span className="absolute -translate-y-1/2 left-5 top-1/2 text-slate-500">
                  <FiPhone size={20} />
                </span>
                <input
                  type="tel"
                  placeholder="Numéro Mobile Money"
                  className="w-full p-5 text-lg font-black bg-black border outline-none pl-14 border-slate-800 rounded-2xl focus:border-emerald-500"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
              >
                Demander le virement <FiArrowUpRight />
              </button>
            </form>
          </div>

          {/* HISTORIQUE */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-800/20 uppercase text-[10px] font-black text-slate-400">
              Journal financier
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between p-6 transition-all border-b border-slate-800/50 hover:bg-slate-800/30"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        t.type === "vente"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-orange-500/10 text-orange-500"
                      }`}
                    >
                      {t.type === "vente" ? (
                        <FiTrendingUp size={20} />
                      ) : (
                        <FiArrowUpRight size={20} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm italic font-black uppercase">
                        {t.type === "vente" ? "Vente" : "Retrait"}
                      </p>
                      <p className="text-[9px] text-slate-500 font-bold">
                        {new Date(t.date).toLocaleDateString()}
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
                    <span className="text-[8px] uppercase font-black opacity-50">
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

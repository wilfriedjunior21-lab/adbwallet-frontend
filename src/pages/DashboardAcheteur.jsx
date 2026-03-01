import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import {
  FiShield,
  FiAlertCircle,
  FiTrendingUp,
  FiActivity,
  FiMessageSquare,
  FiSend,
  FiPlusCircle,
  FiX,
  FiCalendar,
  FiLayers,
  FiUser,
} from "react-icons/fi";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { toast, Toaster } from "react-hot-toast";

const DashboardAcheteur = () => {
  const [user, setUser] = useState(null);
  const [actions, setActions] = useState([]);
  const [bonds, setBonds] = useState([]);
  const [activeTab, setActiveTab] = useState("actions");
  const [kycDoc, setKycDoc] = useState("");
  const [buyQty, setBuyQty] = useState({});
  const [bondInvestAmount, setBondInvestAmount] = useState({});
  const [loading, setLoading] = useState(true);

  // --- ÉTATS POUR LE SUPPORT RÉEL ---
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // --- ÉTATS POUR LE DÉPÔT ---
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const userId = localStorage.getItem("userId");

  // --- LOGIQUE DE CALCUL DES STATS ---
  const calculatePortfolioStats = () => {
    if (!user) return { totalActifs: 0, totalProfit: 0 };
    const actionsValue =
      user.portfolio?.reduce((acc, item) => {
        const currentPrice = item.actionId?.price || 0;
        return acc + Number(item.quantity || 0) * Number(currentPrice);
      }, 0) || 0;
    const bondsValue =
      user.bonds?.reduce((acc, b) => {
        return acc + Number(b.amount || 0);
      }, 0) || 0;
    const profit = Number(user.totalProfitGained || 0);
    return { totalActifs: actionsValue + bondsValue, totalProfit: profit };
  };

  const stats = calculatePortfolioStats();

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      const [userRes, actionsRes, bondsRes] = await Promise.all([
        api.get(`/user/${userId}`),
        api.get("/actions"),
        api.get("/bonds"),
      ]);
      setUser(userRes.data);
      setActions(actionsRes.data);
      setBonds(bondsRes.data || []);

      // OPTIMISATION : Si l'email n'est pas en local, on le remet
      if (userRes.data.email && !localStorage.getItem("email")) {
        localStorage.setItem("email", userRes.data.email);
      }
    } catch (err) {
      console.error("Erreur de chargement", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // --- CHARGEMENT DES MESSAGES ---
  useEffect(() => {
    if (activeChat && userId) {
      const fetchMessages = async () => {
        try {
          const res = await api.get(`/messages/chat/${activeChat}/${userId}`);
          setMessages(res.data);
        } catch (err) {
          console.error("Erreur messages");
        }
      };
      fetchMessages();
      const msgInterval = setInterval(fetchMessages, 5000);
      return () => clearInterval(msgInterval);
    }
  }, [activeChat, userId]);

  // --- ACTIONS UTILISATEUR ---
  const handleKycSubmit = async () => {
    if (!kycDoc) return toast.error("Veuillez entrer l'URL du document");
    try {
      await api.post("/user/submit-kyc", { userId, documentUrl: kycDoc });
      toast.success("Document envoyé pour validation !");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleBuy = async (actionId, price) => {
    const qty = buyQty[actionId] || 1;
    const totalCost = price * qty;
    if (!user || user.balance < totalCost) {
      return toast.error(
        `Solde insuffisant (${totalCost.toLocaleString()} F requis)`
      );
    }
    try {
      const res = await api.post("/transactions/buy", {
        userId,
        actionId,
        quantity: qty,
      });
      toast.success(res.data.message || "Achat réussi !");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'achat");
    }
  };

  const handleSubscribeBond = async (bondId) => {
    const amount = parseFloat(bondInvestAmount[bondId]);
    if (!amount || amount <= 0)
      return toast.error("Veuillez saisir un montant valide.");
    if (!user || user.balance < amount)
      return toast.error(`Solde insuffisant.`);
    try {
      const res = await api.post("/transactions/subscribe-bond", {
        userId,
        bondId,
        amount: amount,
      });
      toast.success(res.data.message || "Souscription réussie !");
      setBondInvestAmount({ ...bondInvestAmount, [bondId]: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur de souscription");
    }
  };

  // --- FONCTION DE DÉPÔT CORRIGÉE ---
  const handleDepositSubmit = async () => {
    const amount = parseFloat(depositAmount);

    // Priorité à l'email chargé depuis la base de données (user.email)
    // sinon on prend celui du localStorage
    const emailToUse = user?.email || localStorage.getItem("email");
    const nameToUse =
      user?.name || localStorage.getItem("name") || "Utilisateur";

    if (!amount || amount < 100) return toast.error("Minimum 100 FCFA");
    if (!userId) return toast.error("Session expirée, reconnectez-vous.");
    if (!emailToUse)
      return toast.error("Email introuvable. Veuillez rafraîchir la page.");

    setIsRedirecting(true);
    try {
      const res = await api.post("/payments/paymooney/init", {
        userId: userId,
        amount: amount,
        email: emailToUse,
        name: nameToUse,
      });
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors du dépôt");
      setIsRedirecting(false);
    }
  };

  const handleSendMessage = async (actionId, receiverId) => {
    if (!newMessage.trim()) return;
    try {
      const res = await api.post("/messages/send", {
        actionId,
        senderId: userId,
        receiverId,
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      toast.error("Erreur d'envoi");
    }
  };

  if (loading && !actions.length) {
    return (
      <div className="p-20 font-black tracking-widest text-center text-white uppercase animate-pulse">
        Connexion au Marché Live...
      </div>
    );
  }

  return (
    <div className="max-w-6xl p-6 mx-auto text-white pb-24">
      <Toaster position="top-right" />

      {/* --- MODALE DE DÉPÔT --- */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl italic font-black uppercase">
                Déposer des <span className="text-blue-500">Fonds</span>
              </h2>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-slate-500 hover:text-white"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 border bg-slate-950 border-slate-800 rounded-2xl">
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 5000"
                  className="w-full text-xl font-black text-white bg-transparent outline-none"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <button
                onClick={handleDepositSubmit}
                disabled={isRedirecting}
                className="w-full py-4 font-black tracking-widest text-white uppercase bg-blue-600 hover:bg-blue-500 rounded-2xl disabled:opacity-50"
              >
                {isRedirecting ? "Redirection..." : "Confirmer le dépôt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="flex flex-col gap-8 mb-10">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-blue-500/30 p-1 bg-slate-800 overflow-hidden">
              <img
                src={
                  user?.profilePic ||
                  "https://ui-avatars.com/api/?name=" + (user?.name || "User")
                }
                className="w-full h-full rounded-full object-cover"
                alt="Profil"
              />
            </div>
            <div>
              <h1 className="text-3xl italic font-black leading-none uppercase">
                Marché <span className="text-blue-500">Live</span>
              </h1>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">
                Trader : {user?.name || "Chargement..."}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDepositModal(true)}
            className="p-4 bg-blue-600 shadow-lg rounded-3xl hover:bg-blue-500 group"
          >
            <FiPlusCircle
              size={24}
              className="group-hover:rotate-90 transition-transform"
            />
          </button>
        </div>

        {/* GRILLE DES COMPTEURS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 px-6 py-4 border bg-slate-900 border-slate-800 rounded-3xl">
            <div className="p-3 text-blue-500 bg-blue-500/10 rounded-2xl">
              <FiActivity />
            </div>
            <div>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">
                Mon Solde
              </p>
              <p className="text-xl font-black">
                {(user?.balance || 0).toLocaleString()}{" "}
                <span className="text-sm text-blue-500">FCFA</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6 py-4 border bg-slate-900 border-slate-800 rounded-3xl">
            <div className="p-3 text-emerald-500 bg-emerald-500/10 rounded-2xl">
              <FiLayers />
            </div>
            <div>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">
                Actifs Totaux
              </p>
              <p className="text-xl font-black">
                {(stats.totalActifs || 0).toLocaleString()}{" "}
                <span className="text-sm text-emerald-500">FCFA</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6 py-4 border bg-slate-900 border-slate-800 rounded-3xl">
            <div className="p-3 text-amber-500 bg-amber-500/10 rounded-2xl">
              <FiTrendingUp />
            </div>
            <div>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">
                Profit Global
              </p>
              <p className="text-xl font-black">
                {(stats.totalProfit || 0).toLocaleString()}{" "}
                <span className="text-sm text-amber-500">FCFA</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* --- NAVIGATION --- */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("actions")}
          className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
            activeTab === "actions"
              ? "bg-blue-600 shadow-lg"
              : "bg-slate-900 border border-slate-800 text-slate-500"
          }`}
        >
          <FiTrendingUp className="inline mr-2" /> Actions
        </button>
        <button
          onClick={() => setActiveTab("bonds")}
          className={`px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
            activeTab === "bonds"
              ? "bg-amber-600 shadow-lg"
              : "bg-slate-900 border border-slate-800 text-slate-500"
          }`}
        >
          <FiShield className="inline mr-2" /> Obligations
        </button>
      </div>

      {/* --- KYC WARNING --- */}
      {user?.kycStatus === "non_verifie" && (
        <div className="bg-orange-600/10 border border-orange-600/20 p-8 rounded-[2rem] mb-10">
          <div className="flex items-center gap-3 mb-4 text-orange-500">
            <FiAlertCircle size={24} />
            <h2 className="text-xl italic font-black uppercase">
              Vérification requise
            </h2>
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              placeholder="URL de votre pièce d'identité..."
              className="flex-1 p-4 border bg-slate-950 border-slate-800 rounded-2xl focus:border-orange-500 outline-none"
              onChange={(e) => setKycDoc(e.target.value)}
            />
            <button
              onClick={handleKycSubmit}
              className="bg-orange-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest"
            >
              Soumettre
            </button>
          </div>
        </div>
      )}

      {/* --- GRID D'ACTIFS --- */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {activeTab === "actions"
          ? actions.map((action) => (
              <div
                key={action._id}
                className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] hover:border-blue-500/50 transition-all shadow-xl flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full border border-blue-500/20 overflow-hidden bg-black flex items-center justify-center">
                    {action.creatorId?.profilePic ? (
                      <img
                        src={action.creatorId.profilePic}
                        className="w-full h-full object-cover"
                        alt="Logo"
                      />
                    ) : (
                      <FiUser className="text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg italic font-black uppercase leading-tight">
                      {action.name}
                    </h3>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                      Par {action.creatorId?.name || "Actionnaire"}
                    </p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-xl text-[10px] font-black">
                    {action.price?.toLocaleString()} F
                  </span>
                </div>

                <div className="w-full h-24 p-2 my-2 border bg-black/40 rounded-3xl border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={action.priceHistory || []}>
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={false}
                      />
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "10px",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-auto space-y-3">
                  {user?.kycStatus === "valide" && (
                    <div className="flex items-center gap-2 p-2 border bg-slate-950 rounded-2xl border-slate-800">
                      <span className="text-[9px] font-black uppercase ml-3 text-slate-500">
                        Qté
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={buyQty[action._id] || 1}
                        onChange={(e) =>
                          setBuyQty({
                            ...buyQty,
                            [action._id]: Math.max(
                              1,
                              parseInt(e.target.value) || 1
                            ),
                          })
                        }
                        className="w-full text-sm font-black text-center text-blue-500 bg-transparent outline-none"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBuy(action._id, action.price)}
                      disabled={
                        user?.kycStatus !== "valide" ||
                        action.availableQuantity <= 0
                      }
                      className="flex-[2] py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] hover:bg-blue-600 hover:text-white disabled:opacity-30"
                    >
                      Acheter
                    </button>
                    <button
                      onClick={() =>
                        setActiveChat(
                          activeChat === action._id ? null : action._id
                        )
                      }
                      className={`flex-1 rounded-2xl flex items-center justify-center ${
                        activeChat === action._id
                          ? "bg-blue-600 shadow-lg"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <FiMessageSquare size={18} />
                    </button>
                  </div>
                </div>

                {activeChat === action._id && (
                  <div className="pt-4 mt-4 border-t border-slate-800 animate-in slide-in-from-top-2">
                    <div className="mb-3 space-y-2 overflow-y-auto max-h-32 scrollbar-hide">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-lg text-[10px] ${
                            msg.senderId === userId
                              ? "bg-blue-600/20 border-blue-500/30 ml-4"
                              : "bg-slate-800 mr-4"
                          }`}
                        >
                          <p>{msg.content}</p>
                          {msg.reply && (
                            <p className="text-emerald-400 mt-1 pt-1 border-t border-white/5">
                              Réponse: {msg.reply}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Question..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-black border border-slate-800 rounded-xl px-3 py-2 text-[10px] outline-none"
                      />
                      <button
                        onClick={() =>
                          handleSendMessage(action._id, action.creatorId)
                        }
                        className="p-2 bg-blue-600 rounded-xl"
                      >
                        <FiSend size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          : bonds.map((bond) => (
              <div
                key={bond._id}
                className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] hover:border-amber-500/50 shadow-xl flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-amber-500 leading-tight">
                      {bond.titre}
                    </h3>
                    <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mt-1">
                      {bond.description?.substring(0, 50)}...
                    </p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1.5 rounded-xl">
                    +{bond.tauxInteret}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <FiCalendar className="text-amber-500 mb-1" size={14} />
                    <p className="text-[8px] text-slate-500 uppercase font-black">
                      Durée
                    </p>
                    <p className="text-xs font-black">{bond.dureeMois} Mois</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <FiLayers className="text-blue-500 mb-1" size={14} />
                    <p className="text-[8px] text-slate-500 uppercase font-black">
                      Cible
                    </p>
                    <p className="text-xs font-black">
                      {bond.montantCible?.toLocaleString()} F
                    </p>
                  </div>
                </div>
                <div className="mt-auto">
                  {user?.kycStatus === "valide" && (
                    <div className="mb-4 p-3 border bg-slate-950 rounded-2xl border-slate-800">
                      <label className="text-[8px] font-black uppercase text-slate-500 block mb-1">
                        Montant à investir
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 10000"
                        value={bondInvestAmount[bond._id] || ""}
                        onChange={(e) =>
                          setBondInvestAmount({
                            ...bondInvestAmount,
                            [bond._id]: e.target.value,
                          })
                        }
                        className="w-full bg-transparent text-sm font-black text-amber-500 outline-none"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => handleSubscribeBond(bond._id)}
                    disabled={user?.kycStatus !== "valide"}
                    className="w-full bg-amber-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-amber-600 shadow-lg"
                  >
                    Investir maintenant
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default DashboardAcheteur;

import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import {
  FiShield,
  FiAlertCircle,
  FiTrendingUp,
  FiShoppingBag,
  FiActivity,
  FiMessageSquare,
  FiSend,
  FiPlusCircle,
  FiX,
  FiCalendar,
  FiLayers,
} from "react-icons/fi";
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { toast, Toaster } from "react-hot-toast";

const DashboardAcheteur = () => {
  const [user, setUser] = useState(null);
  const [actions, setActions] = useState([]);
  const [bonds, setBonds] = useState([]); // Nouvel état pour les obligations
  const [activeTab, setActiveTab] = useState("actions"); // Onglet actif
  const [kycDoc, setKycDoc] = useState("");
  const [buyQty, setBuyQty] = useState({});
  const [loading, setLoading] = useState(true);

  // --- ÉTATS POUR LE SUPPORT RÉEL ---
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // --- ÉTATS POUR LE DÉPÔT PAYMOONEY ---
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const userId = localStorage.getItem("userId");

  const fetchData = useCallback(async () => {
    try {
      const [userRes, actionsRes, bondsRes] = await Promise.all([
        api.get(`/api/user/${userId}`),
        api.get("/api/actions"),
        api.get("/api/bonds"), // Récupération des obligations
      ]);
      setUser(userRes.data);
      setActions(actionsRes.data);
      setBonds(bondsRes.data || []);
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

  // Charger les messages quand on ouvre un chat
  useEffect(() => {
    if (activeChat) {
      const fetchMessages = async () => {
        try {
          const res = await api.get(
            `/api/messages/chat/${activeChat}/${userId}`
          );
          setMessages(res.data);
        } catch (err) {
          console.error("Erreur chargement messages");
        }
      };
      fetchMessages();
      const msgInterval = setInterval(fetchMessages, 5000);
      return () => clearInterval(msgInterval);
    }
  }, [activeChat, userId]);

  const handleKycSubmit = async () => {
    if (!kycDoc) return toast.error("Veuillez entrer l'URL du document");
    try {
      await api.post("/api/user/submit-kyc", { userId, documentUrl: kycDoc });
      toast.success("Document envoyé pour validation !");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleBuy = async (actionId, price) => {
    const qty = buyQty[actionId] || 1;
    const totalCost = price * qty;

    if (user.balance < totalCost) {
      return toast.error(
        `Solde insuffisant (${totalCost.toLocaleString()} F requis)`
      );
    }

    try {
      const res = await api.post("/api/transactions/buy", {
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

  // --- LOGIQUE ACHAT OBLIGATION ---
  const handleSubscribeBond = async (bondId, price) => {
    if (user.balance < price) {
      return toast.error("Solde insuffisant pour cette obligation.");
    }
    try {
      await api.post("/api/transactions/subscribe-bond", { userId, bondId });
      toast.success("Souscription à l'obligation réussie !");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur de souscription");
    }
  };

  // --- LOGIQUE DE DÉPÔT PAYMOONEY ---
  const handleDepositSubmit = async () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 100) {
      return toast.error("Le montant minimum est de 100 FCFA");
    }
    const userEmail = localStorage.getItem("email") || "client@email.com";
    const userName = localStorage.getItem("name") || "Utilisateur";
    setIsRedirecting(true);

    try {
      const res = await api.post("/api/payments/paymooney/init", {
        userId,
        amount: amount,
        email: userEmail,
        name: userName,
      });
      const { payment_url } = res.data;
      if (payment_url) {
        toast.success("Redirection vers la plateforme de paiement...");
        window.location.href = payment_url;
      } else {
        throw new Error("L'URL de paiement n'a pas été générée.");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Erreur lors de l'initialisation";
      toast.error(errorMsg);
      setIsRedirecting(false);
    }
  };

  // --- LOGIQUE DU SUPPORT RÉELLE ---
  const handleSendMessage = async (actionId, receiverId) => {
    if (!newMessage.trim()) return;
    try {
      const res = await api.post("/api/messages/send", {
        actionId,
        senderId: userId,
        receiverId,
        content: newMessage,
      });
      setMessages([...messages, res.data]);
      setNewMessage("");
      toast.success("Message envoyé !");
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
    <div className="max-w-6xl p-6 mx-auto text-white">
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
                className="w-full py-4 font-black tracking-widest text-white uppercase transition-all bg-blue-600 hover:bg-blue-500 rounded-2xl disabled:opacity-50"
              >
                {isRedirecting ? "Redirection..." : "Confirmer le dépôt"}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col items-start justify-between gap-4 mb-10 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl italic font-black leading-none uppercase">
            Marché <span className="italic text-blue-500">Live</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">
            Trading d'actifs en temps réel
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 px-6 py-4 border shadow-2xl bg-slate-900 border-slate-800 rounded-3xl">
              <div className="p-3 text-blue-500 bg-blue-500/10 rounded-2xl">
                <FiActivity />
              </div>
              <div>
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">
                  Mon Solde Disponible
                </p>
                <p className="text-xl font-black text-white">
                  {user.balance?.toLocaleString()}{" "}
                  <span className="text-sm text-blue-500">FCFA</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDepositModal(true)}
              className="p-4 transition-all bg-blue-600 shadow-lg rounded-3xl hover:bg-blue-500 shadow-blue-900/20 group"
              title="Déposer des fonds"
            >
              <FiPlusCircle
                size={24}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
            </button>
          </div>
        )}
      </header>

      {/* --- SÉLECTEUR D'ONGLETS --- */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("actions")}
          className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
            activeTab === "actions"
              ? "bg-blue-600 shadow-lg"
              : "bg-slate-900 border border-slate-800 text-slate-500"
          }`}
        >
          <FiTrendingUp className="inline mr-2" /> Actions
        </button>
        <button
          onClick={() => setActiveTab("bonds")}
          className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
            activeTab === "bonds"
              ? "bg-amber-600 shadow-lg"
              : "bg-slate-900 border border-slate-800 text-slate-500"
          }`}
        >
          <FiShield className="inline mr-2" /> Obligations
        </button>
      </div>

      {/* --- BLOC KYC --- */}
      {user && user.kycStatus === "non_verifie" && (
        <div className="bg-orange-600/10 border border-orange-600/20 p-8 rounded-[2rem] mb-10 shadow-xl">
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
              className="flex-1 p-4 text-sm font-bold transition-all border outline-none bg-slate-950 border-slate-800 rounded-2xl focus:border-orange-500"
              onChange={(e) => setKycDoc(e.target.value)}
            />
            <button
              onClick={handleKycSubmit}
              className="bg-orange-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all shadow-lg"
            >
              Soumettre le KYC
            </button>
          </div>
        </div>
      )}

      {/* --- LISTE DES ACTIFS --- */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {activeTab === "actions"
          ? actions.map((action) => {
              const stockRatio =
                action.availableQuantity / action.totalQuantity;
              const isLowStock =
                stockRatio <= 0.15 && action.availableQuantity > 0;

              return (
                <div
                  key={action._id}
                  className={`bg-slate-900 border ${
                    isLowStock ? "border-orange-500/30" : "border-slate-800"
                  } p-6 rounded-[2.5rem] hover:border-blue-500/50 transition-all group relative overflow-hidden shadow-xl`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl italic font-black tracking-tighter uppercase group-hover:text-blue-400">
                        {action.name}
                      </h3>
                      {isLowStock && (
                        <span className="text-[8px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">
                          Rareté Critique
                        </span>
                      )}
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-xl text-xs font-black">
                      {action.price.toLocaleString()} F
                    </span>
                  </div>

                  {/* Graphe des prix (Action uniquement) */}
                  <div className="w-full h-24 p-2 my-4 border bg-black/40 rounded-3xl border-white/5">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={action.priceHistory || []}>
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={isLowStock ? "#f97316" : "#3b82f6"}
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

                  <div className="space-y-3">
                    {user?.kycStatus === "valide" &&
                      action.availableQuantity > 0 && (
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
                        className="flex-[2] py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30"
                      >
                        Acheter
                      </button>
                      <button
                        onClick={() =>
                          setActiveChat(
                            activeChat === action._id ? null : action._id
                          )
                        }
                        className={`flex-1 rounded-2xl flex items-center justify-center transition-all ${
                          activeChat === action._id
                            ? "bg-blue-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        <FiMessageSquare size={18} />
                      </button>
                    </div>
                  </div>

                  {/* CHAT INTÉGRÉ DANS LA CARD */}
                  {activeChat === action._id && (
                    <div className="pt-4 mt-4 border-t border-slate-800 animate-in slide-in-from-top-2">
                      <div className="pr-2 mb-3 space-y-2 overflow-y-auto max-h-32 scrollbar-hide">
                        {messages.length === 0 && (
                          <p className="text-[9px] text-center text-slate-600 italic">
                            Aucun message.
                          </p>
                        )}
                        {messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg text-[10px] ${
                              msg.senderId === userId
                                ? "bg-blue-600/20 border-blue-500/30 ml-4"
                                : "bg-slate-800 mr-4 border-slate-700"
                            }`}
                          >
                            <p className="font-medium">{msg.content}</p>
                            {msg.reply && (
                              <div className="pt-2 mt-2 border-t border-blue-500/20 text-emerald-400">
                                <p className="text-[8px] font-black uppercase">
                                  Réponse :
                                </p>
                                <p>{msg.reply}</p>
                              </div>
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
              );
            })
          : /* --- RENDU DES OBLIGATIONS --- */
            bonds.map((bond) => (
              <div
                key={bond._id}
                className="bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] hover:border-amber-500/50 transition-all shadow-xl group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-amber-500">
                      {bond.titre}
                    </h3>
                    <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">
                      {bond.emetteur}
                    </p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-3 py-1.5 rounded-xl border border-emerald-500/20">
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
                      Prix Ticket
                    </p>
                    <p className="text-xs font-black">
                      {bond.prixUnitaire?.toLocaleString()} F
                    </p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <p className="text-[8px] text-slate-500 uppercase font-black mb-1">
                    Garantie du Projet
                  </p>
                  <p className="text-sm font-black text-white">
                    {bond.garantie?.toLocaleString()} FCFA
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleSubscribeBond(bond._id, bond.prixUnitaire)
                  }
                  disabled={user?.kycStatus !== "valide"}
                  className="w-full bg-amber-600 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-amber-600 transition-all shadow-lg shadow-amber-900/20 disabled:opacity-30"
                >
                  Investir maintenant
                </button>
              </div>
            ))}
      </div>
    </div>
  );
};

export default DashboardAcheteur;

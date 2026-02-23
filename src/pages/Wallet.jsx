import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import {
  FiPlus,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiTrash2,
  FiDownload,
  FiArrowUpLeft,
  FiPhone,
  FiMaximize,
  FiAlertCircle,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

// --- IMPORTS POUR LE PDF ET LE GRAPHIQUE ---
import { exportTransactionsPDF } from "../utils/exportPDF";
import DepositQR from "../components/DepositQR";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("deposit");

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Utilisateur";

  const loadWalletData = useCallback(async () => {
    if (!userId) return;
    try {
      const [balanceRes, transRes] = await Promise.all([
        api.get(`/api/users/${userId}/balance`),
        api.get(`/api/transactions/user/${userId}`),
      ]);

      const allTrans = transRes.data;
      setBalance(balanceRes.data.balance);
      setTransactions(allTrans);

      const sortedForChart = [...allTrans].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      let runningBalance = 0;
      const history = sortedForChart.map((t) => {
        if (t.status === "valide") {
          if (["depot", "vente", "dividende"].includes(t.type))
            runningBalance += t.amount;
          if (["achat", "retrait"].includes(t.type)) runningBalance -= t.amount;
        }
        return {
          date: new Date(t.date).toLocaleDateString(undefined, {
            day: "2-digit",
            month: "short",
          }),
          solde: runningBalance,
        };
      });
      setChartData(history);

      let currentPortfolioValue = 0;
      let accumulatedProfit = 0;

      allTrans.forEach((t) => {
        if (t.type === "achat" && t.actionId && t.status === "valide") {
          const prixActuel = t.actionId.price;
          const prixAchatTotal = t.amount;
          const valeurActuelle = t.quantity * prixActuel;

          currentPortfolioValue += valeurActuelle;
          accumulatedProfit += valeurActuelle - prixAchatTotal;
        }
      });

      setPortfolioValue(currentPortfolioValue);
      setTotalProfit(accumulatedProfit);
    } catch (err) {
      console.error("Erreur Wallet:", err);
      toast.error("Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadWalletData();
    const interval = setInterval(loadWalletData, 10000);
    return () => clearInterval(interval);
  }, [loadWalletData]);

  // Gardé en mémoire pour la logique API (même si le formulaire est masqué)
  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100) {
      return toast.error("Le montant minimum est de 100 F CFA");
    }
    if (!phone) {
      return toast.error("Veuillez entrer votre numéro de paiement");
    }

    const loadingToast = toast.loading("Redirection vers PayMooney...");

    try {
      const response = await api.post("/api/transactions/paymooney/pay", {
        userId,
        amount: Number(amount),
        phone: phone,
      });

      toast.dismiss(loadingToast);

      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        toast.success("Paiement initié ! Suivez les instructions PayMooney.");
        const { referenceId } = response.data;

        const checkStatus = setInterval(async () => {
          try {
            const statusRes = await api.get(
              `/api/transactions/paymooney/status/${referenceId}`
            );
            if (statusRes.data.status === "SUCCESSFUL") {
              clearInterval(checkStatus);
              toast.success("Dépôt validé !");
              loadWalletData();
              setAmount("");
              setPhone("");
            } else if (statusRes.data.status === "FAILED") {
              clearInterval(checkStatus);
              toast.error("Le paiement a échoué.");
            }
          } catch (err) {
            console.error("Erreur polling", err);
          }
        }, 5000);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.error || "Erreur service PayMooney");
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) < 1000) {
      return toast.error("Le montant minimum de retrait est de 1000 F CFA");
    }
    if (Number(amount) > balance) {
      return toast.error("Solde insuffisant pour ce retrait");
    }
    if (!phone) {
      return toast.error("Veuillez entrer le numéro de réception");
    }

    const loadingToast = toast.loading("Envoi de la demande...");
    try {
      await api.post("/api/transactions/withdraw", {
        userId,
        amount: Number(amount),
        phone: phone,
      });
      toast.dismiss(loadingToast);
      toast.success("Demande envoyée !");
      setAmount("");
      setPhone("");
      loadWalletData();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.error || "Erreur retrait");
    }
  };

  const handleSell = async (transactionId) => {
    if (!window.confirm("Revendre cet actif ?")) return;
    try {
      await api.post("/api/transactions/sell", { transactionId, userId });
      toast.success("Vente réussie !");
      loadWalletData();
    } catch (err) {
      toast.error("Erreur revente");
    }
  };

  if (loading)
    return (
      <div className="p-20 font-black tracking-widest text-center text-white uppercase animate-pulse">
        Synchronisation du Wallet...
      </div>
    );

  return (
    <div className="min-h-screen p-6 text-white bg-black">
      <Toaster />
      <div className="max-w-6xl mx-auto">
        <header className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-4xl italic font-black uppercase">
              Mon <span className="text-blue-500">Portefeuille</span>
            </h1>
            <p className="mt-2 text-xs font-bold tracking-widest uppercase text-slate-500">
              Gestion via PayMooney
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => exportTransactionsPDF(transactions, userName)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <FiDownload size={14} /> Historique PDF
            </button>
            <div className="hidden text-right md:block">
              <p className="text-[10px] font-black text-slate-500 uppercase">
                Valeur Totale
              </p>
              <p className="text-2xl font-black">
                {(balance + portfolioValue).toLocaleString()} F
              </p>
            </div>
          </div>
        </header>

        {/* --- GRAPHIQUE --- */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] mb-12">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSolde" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="solde"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fill="url(#colorSolde)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- RÉSUMÉS --- */}
        <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
            <p className="text-xs font-black text-blue-400 uppercase opacity-50">
              Cash
            </p>
            <h2 className="text-4xl font-black">
              {balance.toLocaleString()} F
            </h2>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
            <p className="text-xs font-black text-blue-400 uppercase opacity-50">
              Actifs
            </p>
            <h2 className="text-4xl font-black text-blue-500">
              {portfolioValue.toLocaleString()} F
            </h2>
          </div>
          <div
            className={`p-8 rounded-[2.5rem] border ${
              totalProfit >= 0
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <p className="text-xs font-black uppercase opacity-50">
              Profit Global
            </p>
            <h2
              className={`text-4xl font-black ${
                totalProfit >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {totalProfit >= 0 ? "+" : ""}
              {totalProfit.toLocaleString()} F
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* --- SECTION DÉPÔT / RETRAIT --- */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] sticky top-6">
              <div className="flex gap-4 p-1 mb-6 bg-black border rounded-2xl border-slate-800">
                <button
                  onClick={() => setActiveTab("deposit")}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === "deposit"
                      ? "bg-white text-black"
                      : "text-slate-500"
                  }`}
                >
                  Dépôt
                </button>
                <button
                  onClick={() => setActiveTab("withdraw")}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === "withdraw"
                      ? "bg-white text-black"
                      : "text-slate-500"
                  }`}
                >
                  Retrait
                </button>
              </div>

              {activeTab === "deposit" ? (
                <div className="flex flex-col items-center space-y-6">
                  <div className="text-center">
                    <FiMaximize
                      className="mx-auto mb-2 text-blue-500"
                      size={24}
                    />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-white">
                      Scanner pour déposer
                    </h3>
                    <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase">
                      Utilisez l'application qrcode scanner dispo sur playstore
                    </p>
                  </div>

                  {/* ESPACE QR CODE UNIQUEMENT */}
                  <div className="p-4 bg-white shadow-2xl rounded-3xl">
                    <DepositQR userId={userId} gateway="paymooney" />
                  </div>

                  <div className="w-full p-4 border border-slate-800 bg-black/40 rounded-2xl">
                    <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed text-center italic">
                      Le solde sera crédité dès la confirmation du paiement.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <FiPhone className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-500" />
                      <input
                        type="tel"
                        placeholder="Numéro de réception"
                        className="w-full p-4 pl-12 font-bold bg-black border outline-none border-slate-800 rounded-2xl focus:border-red-500"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <FiDollarSign className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-500" />
                      <input
                        type="number"
                        placeholder="Montant à retirer"
                        className="w-full p-4 pl-12 text-lg font-bold bg-black border outline-none border-slate-800 rounded-2xl focus:border-red-500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 text-xs font-black text-white uppercase transition-all bg-red-600 shadow-lg rounded-2xl hover:bg-red-700"
                  >
                    Confirmer le retrait{" "}
                    <FiArrowUpLeft className="inline ml-1" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* --- TRANSACTIONS --- */}
          <div className="space-y-8 lg:col-span-2">
            <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] overflow-hidden">
              <div className="flex items-center gap-2 p-8 border-b border-slate-800">
                <FiClock className="text-blue-500" />
                <h3 className="text-sm font-black tracking-widest uppercase">
                  Mouvements récents
                </h3>
              </div>
              <div className="divide-y divide-slate-800">
                {transactions.length > 0 ? (
                  transactions.map((t) => {
                    const isEntree = ["depot", "vente", "dividende"].includes(
                      t.type
                    );
                    return (
                      <div
                        key={t._id}
                        className="p-6 transition-colors hover:bg-white/5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-2xl ${
                                t.type === "depot"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-blue-500/10 text-blue-500"
                              }`}
                            >
                              {isEntree ? (
                                <FiArrowDownLeft size={20} />
                              ) : (
                                <FiArrowUpRight size={20} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-white uppercase">
                                {t.type === "depot"
                                  ? "Dépôt PayMooney"
                                  : t.actionId?.name || t.type}
                              </p>
                              <p className="text-[10px] text-slate-500 font-bold">
                                {new Date(t.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-black ${
                                isEntree ? "text-emerald-500" : "text-white"
                              }`}
                            >
                              {isEntree ? "+" : "-"} {t.amount.toLocaleString()}{" "}
                              F
                            </p>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                                t.status === "valide"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-orange-500/10 text-orange-500"
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                        </div>
                        {t.status === "rejete" && t.comment && (
                          <div className="flex items-start gap-2 p-3 mt-4 border border-red-500/20 bg-red-500/5 rounded-2xl">
                            <FiAlertCircle
                              className="text-red-500 mt-0.5"
                              size={14}
                            />
                            <p className="text-[10px] text-red-400 font-bold uppercase italic">
                              Refus : {t.comment}
                            </p>
                          </div>
                        )}
                        {/* Optionnel : Bouton vendre si achat validé */}
                        {t.type === "achat" && t.status === "valide" && (
                          <button
                            onClick={() => handleSell(t._id)}
                            className="mt-3 text-[9px] font-black uppercase text-red-500 hover:text-white transition-colors"
                          >
                            Revente immédiate
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="p-20 text-xs italic font-bold text-center uppercase text-slate-500">
                    Aucune transaction
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;

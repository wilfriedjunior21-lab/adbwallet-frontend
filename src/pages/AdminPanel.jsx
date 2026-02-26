import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
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
  FiBarChart2, // Nouvelle icône pour les stats
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tab, setTab] = useState("kyc");

  const [selectedAction, setSelectedAction] = useState("");
  const [amountPerShare, setAmountPerShare] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async (isAutoRefresh = false) => {
    try {
      const [uRes, aRes, tRes] = await Promise.all([
        api.get("/api/admin/users"),
        api.get("/api/admin/actions"),
        api.get("/api/admin/transactions"),
      ]);
      setUsers(uRes.data);
      setActions(aRes.data);
      setTransactions(tRes.data);
    } catch (err) {
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
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handleValidateKYC = async (id, status) => {
    try {
      await api.patch(`/api/admin/kyc/${id}`, { status });
      toast.success(`Utilisateur mis à jour : ${status}`);
      fetchData();
    } catch (err) {
      toast.error("Erreur mise à jour KYC");
    }
  };

  const handleValidateAction = async (id) => {
    try {
      await api.patch(`/api/admin/actions/${id}/validate`);
      toast.success("Action publiée sur le marché !");
      fetchData();
    } catch (err) {
      toast.error("Erreur publication actif");
    }
  };

  const handleValidateDeposit = async (id) => {
    try {
      await api.patch(`/api/admin/transactions/${id}/validate`);
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
      await api.patch(`/api/admin/transactions/${id}/validate`);
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
      await api.patch(`/api/admin/transactions/${id}/reject`, { reason });
      toast.success("Retrait refusé. L'utilisateur a été recrédité.");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors du rejet du retrait");
    }
  };

  const handleDistributeDividends = async (e) => {
    e.preventDefault();
    if (!selectedAction || !amountPerShare) {
      return toast.error("Veuillez remplir tous les champs");
    }

    const confirmDist = window.confirm(
      `Confirmez-vous la distribution de ${amountPerShare} F par part ? Cette action créditera immédiatement tous les actionnaires concernés.`
    );

    if (!confirmDist) return;

    setIsProcessing(true);
    try {
      const res = await api.post("/api/admin/distribute-dividends", {
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

  return (
    <div className="p-6 mx-auto text-white max-w-7xl">
      <Toaster />

      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl italic font-black uppercase">
          Panel <span className="text-blue-500">Administration</span>
        </h1>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Auto-Sync (5s)
        </div>
      </div>

      {/* --- NOUVELLE SECTION STATISTIQUES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500">
            <FiUsers size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
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
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              KYC Validés
            </p>
            <p className="text-3xl font-black italic">
              {users.filter((u) => u.kycStatus === "valide").length}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl">
          <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500">
            <FiBarChart2 size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Actifs en vente
            </p>
            <p className="text-3xl font-black italic">
              {actions.filter((a) => a.status === "valide").length}
            </p>
          </div>
        </div>
      </div>
      {/* --- FIN NOUVELLE SECTION STATISTIQUES --- */}

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

      {/* SECTION KYC */}
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
                          className="p-3 transition-all bg-emerald-600 rounded-xl hover:bg-emerald-500"
                        >
                          <FiCheck />
                        </button>
                        <button
                          onClick={() =>
                            handleValidateKYC(u._id, "non_verifie")
                          }
                          className="p-3 transition-all bg-red-600 rounded-xl hover:bg-red-500"
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

      {/* SECTION ACTIONS */}
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

      {/* SECTION DÉPÔTS */}
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
                    <td className="p-6 text-[9px] font-black uppercase italic">
                      <div className="flex items-center gap-2">
                        {t.status === "en_attente" ? (
                          <>
                            <FiClock className="text-orange-500" />{" "}
                            <span className="text-orange-500">{t.status}</span>
                          </>
                        ) : (
                          <>
                            <FiCheck className="text-emerald-500" />{" "}
                            <span className="text-emerald-500">{t.status}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      {t.status === "en_attente" && (
                        <button
                          onClick={() => handleValidateDeposit(t._id)}
                          className="p-3 transition-all shadow-lg bg-emerald-600 rounded-xl hover:bg-emerald-500"
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

      {/* SECTION RETRAITS */}
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
                          {t.phoneNumber || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-[9px] font-black uppercase italic">
                      <span
                        className={`px-3 py-1 rounded-full ${
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
                            className="p-3 transition-all shadow-lg bg-emerald-600 hover:bg-white hover:text-emerald-600 rounded-xl"
                            title="Confirmer l'envoi de l'argent"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => handleRejectWithdrawal(t._id)}
                            className="p-3 transition-all bg-red-600 shadow-lg hover:bg-white hover:text-red-600 rounded-xl"
                            title="Refuser et recréditer"
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

      {/* SECTION DIVIDENDES */}
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
          <div className="p-6 mt-8 border bg-purple-500/5 border-purple-500/10 rounded-3xl">
            <p className="text-[10px] text-purple-300 font-medium leading-relaxed italic">
              * Note: Le montant sera multiplié par le nombre de parts détenues
              par chaque acheteur.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

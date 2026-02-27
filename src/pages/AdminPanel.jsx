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
  FiBarChart2,
  FiBriefcase,
  FiPlus, // Icône pour l'ajout
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bonds, setBonds] = useState([]);
  const [tab, setTab] = useState("kyc");

  const [selectedAction, setSelectedAction] = useState("");
  const [amountPerShare, setAmountPerShare] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // États pour la création directe par l'admin
  const [showCreateModal, setShowCreateModal] = useState(null); // 'action' ou 'bond' ou null
  const [newActionData, setNewActionData] = useState({
    name: "",
    price: "",
    totalQuantity: "",
    description: "",
  });
  const [newBondData, setNewBondData] = useState({
    titre: "",
    montantCible: "",
    tauxInteret: "",
    dureeMois: "",
    frequence: "Annuel",
    garantie: "",
    description: "",
  });

  const fetchData = useCallback(async (isAutoRefresh = false) => {
    try {
      const [uRes, aRes, tRes, bRes] = await Promise.all([
        api.get("/api/admin/users"),
        api.get("/api/admin/actions"),
        api.get("/api/admin/transactions"),
        api.get("/api/admin/bonds"),
      ]);
      setUsers(uRes.data);
      setActions(aRes.data);
      setTransactions(tRes.data);
      setBonds(bRes.data || []);
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

  // --- FONCTIONS EXISTANTES CONSERVÉES ---
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
    if (!selectedAction || !amountPerShare)
      return toast.error("Veuillez remplir tous les champs");
    const confirmDist = window.confirm(`Confirmez-vous la distribution ?`);
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

  const handleValidateBond = async (id) => {
    try {
      await api.patch(`/api/admin/bonds/${id}/validate`);
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
      await api.delete(`/api/admin/bonds/${id}`);
      toast.success("Obligation rejetée");
      fetchData();
    } catch (err) {
      toast.error("Erreur lors du rejet");
    }
  };

  // --- NOUVELLES FONCTIONS : CRÉATION DIRECTE ADMIN ---
  const createActionAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/admin/actions/create", newActionData);
      toast.success("Action créée avec succès !");
      setShowCreateModal(null);
      setNewActionData({
        name: "",
        price: "",
        totalQuantity: "",
        description: "",
      });
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la création de l'action");
    }
  };

  const createBondAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/admin/bonds/create", newBondData);
      toast.success("Obligation créée avec succès !");
      setShowCreateModal(null);
      setNewBondData({
        titre: "",
        montantCible: "",
        tauxInteret: "",
        dureeMois: "",
        frequence: "Annuel",
        garantie: "",
        description: "",
      });
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la création de l'obligation");
    }
  };

  return (
    <div className="p-6 mx-auto text-white max-w-7xl relative">
      <Toaster />

      {/* --- MODAL DE CRÉATION (S'affiche par dessus) --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase italic">
                {showCreateModal === "action"
                  ? "Nouvelle Action"
                  : "Nouvelle Obligation"}
              </h2>
              <button
                onClick={() => setShowCreateModal(null)}
                className="p-2 bg-slate-800 rounded-full hover:bg-red-500 transition-colors"
              >
                <FiX />
              </button>
            </div>

            {showCreateModal === "action" ? (
              <form onSubmit={createActionAdmin} className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom de l'entreprise"
                  required
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-blue-500"
                  value={newActionData.name}
                  onChange={(e) =>
                    setNewActionData({ ...newActionData, name: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Prix par part (F)"
                  required
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-blue-500"
                  value={newActionData.price}
                  onChange={(e) =>
                    setNewActionData({
                      ...newActionData,
                      price: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  placeholder="Quantité totale"
                  required
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-blue-500"
                  value={newActionData.totalQuantity}
                  onChange={(e) =>
                    setNewActionData({
                      ...newActionData,
                      totalQuantity: e.target.value,
                    })
                  }
                />
                <textarea
                  placeholder="Description"
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl outline-none focus:border-blue-500 h-24"
                  value={newActionData.description}
                  onChange={(e) =>
                    setNewActionData({
                      ...newActionData,
                      description: e.target.value,
                    })
                  }
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  Créer l'Action
                </button>
              </form>
            ) : (
              <form onSubmit={createBondAdmin} className="space-y-4">
                <input
                  type="text"
                  placeholder="Titre de l'obligation"
                  required
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500"
                  value={newBondData.titre}
                  onChange={(e) =>
                    setNewBondData({ ...newBondData, titre: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Cible (F)"
                    required
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500"
                    value={newBondData.montantCible}
                    onChange={(e) =>
                      setNewBondData({
                        ...newBondData,
                        montantCible: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Intérêt (%)"
                    required
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500"
                    value={newBondData.tauxInteret}
                    onChange={(e) =>
                      setNewBondData({
                        ...newBondData,
                        tauxInteret: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Mois"
                    required
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500"
                    value={newBondData.dureeMois}
                    onChange={(e) =>
                      setNewBondData({
                        ...newBondData,
                        dureeMois: e.target.value,
                      })
                    }
                  />
                  <select
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500"
                    value={newBondData.frequence}
                    onChange={(e) =>
                      setNewBondData({
                        ...newBondData,
                        frequence: e.target.value,
                      })
                    }
                  >
                    <option value="Mensuel">Mensuel</option>
                    <option value="Trimestriel">Trimestriel</option>
                    <option value="Annuel">Annuel</option>
                  </select>
                </div>
                <input
                  type="number"
                  placeholder="Garantie (F)"
                  required
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-amber-500"
                  value={newBondData.garantie}
                  onChange={(e) =>
                    setNewBondData({ ...newBondData, garantie: e.target.value })
                  }
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-amber-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  Créer l'Obligation
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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

        {/* BOUTONS D'AJOUT RAPIDE */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal("action")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/30 rounded-xl text-blue-500 text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all"
          >
            <FiPlus /> Action
          </button>
          <button
            onClick={() => setShowCreateModal("bond")}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600/10 border border-amber-600/30 rounded-xl text-amber-500 text-[10px] font-black uppercase hover:bg-amber-600 hover:text-white transition-all"
          >
            <FiPlus /> Obligation
          </button>
        </div>
      </div>

      {/* --- STATISTIQUES --- (Tes stats actuelles) */}
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

      {/* TABS NAVIGATION (Tes onglets actuels) */}
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

      {/* --- SECTIONS DE CONTENU (Gardées telles quelles) --- */}
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
                      Émis par: {b.actionnaireId?.name || "ADMIN"}
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
                      <FiShield className="text-blue-500" /> Garantie
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

      {/* --- DÉPÔTS / RETRAITS / DIVIDENDES (Gardés tels quels) --- */}
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
                <th className="p-6">Montant</th>
                <th className="p-6 text-blue-400">Numéro</th>
                <th className="p-6">Statut</th>
                <th className="p-6 text-right">Actions</th>
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

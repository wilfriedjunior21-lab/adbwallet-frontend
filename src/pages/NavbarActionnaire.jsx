import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
//import ThemeToggle from "../components/ThemeToggle"; // Ajuste le chemin si nécessaire
import {
  FiPlusCircle,
  FiLogOut,
  FiBriefcase,
  FiPieChart,
} from "react-icons/fi";

const NavbarActionnaire = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 p-4 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* LOGO BUSINESS AVEC IMAGE */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard-actionnaire"
            className="flex items-center gap-3 group"
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-full border border-blue-500/30 group-hover:border-blue-500 transition-all object-cover"
            />
            <span className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
              ADB<span className="text-blue-500">Business</span>
            </span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-800 hidden md:block"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block">
            Panel Partenaire : {userName}
          </span>
        </div>

        {/* ACTIONS SPECIFIQUES */}
        <div className="flex gap-3 items-center">
          {/* LIEN : CRÉER OBLIGATION (CORRIGÉ ICI) */}
          <Link
            to="/propose-bond"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              location.pathname === "/propose-bond"
                ? "bg-green-600 text-white shadow-lg shadow-green-500/20"
                : "bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-green-600 dark:hover:text-white border border-slate-200 dark:border-slate-800"
            }`}
          >
            <FiBriefcase size={14} />
            <span className="hidden sm:inline">Obligation</span>
          </Link>

          {/* LIEN : NOUVEL ACTIF */}
          <Link
            to="/proposer-actif"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${
              location.pathname === "/proposer-actif"
                ? "bg-blue-600 text-white"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20"
            }`}
          >
            <FiPlusCircle size={14} />
            <span className="hidden sm:inline">Nouvel Actif</span>
          </Link>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* BOUTON DÉCONNEXION */}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-red-500 transition-colors bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
            title="Déconnexion"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarActionnaire;

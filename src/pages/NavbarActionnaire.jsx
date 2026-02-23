import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiPlusCircle, FiLogOut, FiBriefcase } from "react-icons/fi";

const NavbarActionnaire = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload(); // Pour réinitialiser l'état de l'application
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-900 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* LOGO BUSINESS */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard-actionnaire"
            className="text-xl font-black italic uppercase tracking-tighter text-white"
          >
            ADB<span className="text-blue-500">Business</span>
          </Link>
          <div className="h-4 w-[1px] bg-slate-800 hidden md:block"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:block">
            Panel Partenaire : {userName}
          </span>
        </div>

        {/* ACTIONS SPECIFIQUES */}
        <div className="flex gap-3 items-center">
          <Link
            to="/proposer-actif"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
          >
            <FiPlusCircle size={14} />
            <span className="hidden sm:inline">Nouvel Actif</span>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-red-500 transition-colors bg-slate-900 rounded-xl border border-slate-800"
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

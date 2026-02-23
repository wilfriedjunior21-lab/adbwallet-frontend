import React from "react";
import { Link, useLocation } from "react-router-dom";
// Changement de FiWallet par FiCreditCard pour éviter l'erreur
import {
  FiCreditCard,
  FiTrendingUp,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

const Navbar = () => {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (!userId) return null; // Ne pas afficher la navbar si pas connecté

  return (
    <nav className="bg-slate-950 border-b border-slate-900 p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* LOGO */}
        <Link
          to="/"
          className="text-xl font-black italic uppercase tracking-tighter"
        >
          ADB<span className="text-blue-500">Wallet</span>
        </Link>

        {/* LIENS */}
        <div className="flex gap-4 items-center">
          {/* Dashboard selon le rôle */}
          {role === "acheteur" && (
            <>
              <Link
                to="/dashboard-acheteur"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  location.pathname === "/dashboard-acheteur"
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                <FiTrendingUp /> Marché
              </Link>

              <Link
                to="/wallet"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  location.pathname === "/wallet"
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                <FiCreditCard /> Portefeuille
              </Link>
            </>
          )}

          {role === "admin" && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                location.pathname === "/admin"
                  ? "bg-red-600 text-white"
                  : "text-red-500"
              }`}
            >
              <FiSettings /> Admin
            </Link>
          )}

          {/* BOUTON DÉCONNEXION */}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-red-500 transition-colors"
            title="Déconnexion"
          >
            <FiLogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

// TRÈS IMPORTANT : L'export par défaut pour corriger l'erreur App.js
export default Navbar;

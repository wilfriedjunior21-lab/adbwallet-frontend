import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api"; // Import de ton instance axios configurée
import {
  FiPlusCircle,
  FiLogOut,
  FiBriefcase,
  FiUser, // Ajouté pour l'icône profil
  FiFileText, // Ajouté pour l'icône Identité Pro
} from "react-icons/fi";

const NavbarActionnaire = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("name");
  const userId = localStorage.getItem("userId");

  // État pour stocker les infos du profil (notamment la photo)
  const [userProfile, setUserProfile] = useState(null);

  // RÉCUPÉRATION DU PROFIL (CORRIGÉE POUR ÉVITER LA 404)
  useEffect(() => {
    const fetchProfile = async () => {
      // Sécurité : on ne lance l'appel que si l'ID est valide
      if (!userId || userId === "undefined" || userId === "null") return;

      try {
        // Utilisation de la route standard définie dans ton server.js
        const res = await api.get(`/user/${userId}`);
        setUserProfile(res.data);
      } catch (err) {
        // Log discret en cas d'erreur
        console.error("Profil Navbar : Utilisateur non trouvé ou ID invalide");
      }
    };

    fetchProfile();
  }, [userId, location.pathname]); // Se rafraîchit si on change de page ou d'utilisateur

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 p-4 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* LOGO BUSINESS AVEC IMAGE DYNAMIQUE */}
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard-actionnaire"
            className="flex items-center gap-3 group"
          >
            {/* On utilise ici le logo de l'utilisateur s'il existe, sinon le logo par défaut */}
            <div className="w-10 h-10 rounded-full border border-blue-500/30 group-hover:border-blue-500 transition-all overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={userProfile?.profilePic || "/logo.png"}
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://ui-avatars.com/api/?name=" + userName;
                }}
              />
            </div>
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
          {/* LIEN : IDENTITÉ PRO (AJOUTÉ) */}
          <Link
            to="/profil-actionnaire"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              location.pathname === "/profil-actionnaire"
                ? "bg-blue-600/20 text-blue-500 border border-blue-500/50 shadow-lg shadow-blue-500/10"
                : "bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800"
            }`}
          >
            <FiFileText size={14} />
            <span className="hidden sm:inline text-blue-500">Identité Pro</span>
          </Link>

          {/* LIEN : CRÉER OBLIGATION */}
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

          {/* --- NOUVEAU BOUTON : ACCÈS PROFIL --- */}
          <Link
            to="/profile"
            className={`p-1.5 rounded-xl border transition-all flex items-center justify-center ${
              location.pathname === "/profile"
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:border-blue-400"
            }`}
            title="Mon Profil"
          >
            {userProfile?.profilePic ? (
              <img
                src={userProfile.profilePic}
                className="w-6 h-6 rounded-lg object-cover"
                alt="Mini Profil"
              />
            ) : (
              <FiUser size={18} />
            )}
          </Link>

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

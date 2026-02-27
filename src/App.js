import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// --- IMPORTS DES COMPOSANTS ---
import Navbar from "./pages/Navbar";
import NavbarActionnaire from "./pages/NavbarActionnaire";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardAcheteur from "./pages/DashboardAcheteur";
import DashboardActionnaire from "./pages/DashboardActionnaire";
import AdminPanel from "./pages/AdminPanel";
import Wallet from "./pages/Wallet";
import ProposerActif from "./pages/ProposerActif";

// NOUVEL IMPORT : La page qui reçoit le scan du QR Code
import MobileDeposit from "./pages/MobileDeposit";

// AJOUT : Importation de la page de succès de paiement
import Success from "./pages/Success";

function App() {
  // Récupération des informations de session
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const isAuthenticated = token && token !== "undefined";

  return (
    <Router>
      {/* MODIFICATION ICI : 
          - On remplace "bg-black text-white" par des classes dynamiques.
          - "dark:bg-black dark:text-white" garde ton style actuel en mode sombre.
          - "bg-white text-slate-900" définit le style pour le mode clair.
      */}
      <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
        {/* --- NAVIGATION DYNAMIQUE --- */}
        {/* La barre de navigation ne s'affiche que si l'utilisateur est connecté */}
        {isAuthenticated && (
          <>{role === "actionnaire" ? <NavbarActionnaire /> : <Navbar />}</>
        )}

        <Routes>
          {/* --- ROUTE D'ACCUEIL / LOGIN --- */}
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <Login />
              ) : (
                /* Redirection automatique vers le bon dashboard si déjà connecté */
                <Navigate
                  to={
                    role === "admin"
                      ? "/admin"
                      : role === "actionnaire"
                      ? "/dashboard-actionnaire"
                      : "/dashboard-acheteur"
                  }
                />
              )
            }
          />

          {/* --- INSCRIPTION --- */}
          <Route path="/register" element={<Register />} />

          {/* --- NOUVELLE ROUTE : MOBILE DEPOSIT (ACCESSIBLE VIA QR CODE) --- */}
          <Route path="/mobile-deposit" element={<MobileDeposit />} />

          {/* --- AJOUT ROUTE SUCCÈS PAIEMENT --- */}
          {/* Accessible pour confirmer le retour de PayMooney */}
          <Route path="/success" element={<Success />} />

          {/* --- ROUTES ACHETEUR --- */}
          <Route
            path="/dashboard-acheteur"
            element={
              isAuthenticated && role === "acheteur" ? (
                <DashboardAcheteur />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/wallet"
            element={
              isAuthenticated && role === "acheteur" ? (
                <Wallet />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* --- ROUTES ACTIONNAIRE --- */}
          <Route
            path="/dashboard-actionnaire"
            element={
              isAuthenticated && role === "actionnaire" ? (
                <DashboardActionnaire />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/proposer-actif"
            element={
              isAuthenticated && role === "actionnaire" ? (
                <ProposerActif />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* --- ROUTE ADMIN --- */}
          <Route
            path="/admin"
            element={
              isAuthenticated && role === "admin" ? (
                <AdminPanel />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* --- REDIRECTION PAR DÉFAUT (404) --- */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

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

// IMPORT CORRIGÉ : On importe ProposeBond (et non ProposerActif une deuxième fois)
import ProposeBond from "./pages/ProposeBond";

// --- NOUVEL IMPORT PROFIL ---
import Profile from "./pages/Profile";

// AUTRES IMPORTS
import MobileDeposit from "./pages/MobileDeposit";
import Success from "./pages/Success";

function App() {
  // Récupération des informations de session
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const isAuthenticated = token && token !== "undefined";

  return (
    <Router>
      <div className="min-h-screen text-white bg-black">
        {/* --- NAVIGATION DYNAMIQUE --- */}
        {isAuthenticated && (
          <>{role === "actionnaire" ? <NavbarActionnaire /> : <Navbar />}</>
        )}

        <Routes>
          {/* --- ACCUEIL / AUTH --- */}
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <Login />
              ) : (
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

          <Route path="/register" element={<Register />} />
          <Route path="/mobile-deposit" element={<MobileDeposit />} />
          <Route path="/success" element={<Success />} />

          {/* --- ROUTE PROFIL (ACCESSIBLE À TOUT UTILISATEUR CONNECTÉ) --- */}
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/" />}
          />

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

          {/* NOUVELLE ROUTE OBLIGATIONS */}
          <Route
            path="/propose-bond"
            element={
              isAuthenticated && role === "actionnaire" ? (
                <ProposeBond />
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

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

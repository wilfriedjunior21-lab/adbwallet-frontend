import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation, // Ajouté pour détecter le changement de page
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion"; // Ajouté pour les animations

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
import ProposeBond from "./pages/ProposeBond";
import Profile from "./pages/Profile";
import MobileDeposit from "./pages/MobileDeposit";
import Success from "./pages/Success";

// --- PETIT COMPOSANT D'ANIMATION (Interne pour ne rien supprimer) ---
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

// On crée un composant intermédiaire pour utiliser useLocation()
function AnimatedRoutes({ isAuthenticated, role }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* --- ACCUEIL / AUTH --- */}
        <Route
          path="/"
          element={
            <PageWrapper>
              {!isAuthenticated ? (
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
              )}
            </PageWrapper>
          }
        />

        <Route
          path="/register"
          element={
            <PageWrapper>
              <Register />
            </PageWrapper>
          }
        />
        <Route
          path="/mobile-deposit"
          element={
            <PageWrapper>
              <MobileDeposit />
            </PageWrapper>
          }
        />
        <Route
          path="/success"
          element={
            <PageWrapper>
              <Success />
            </PageWrapper>
          }
        />

        {/* --- ROUTE PROFIL --- */}
        <Route
          path="/profile"
          element={
            <PageWrapper>
              {isAuthenticated ? <Profile /> : <Navigate to="/" />}
            </PageWrapper>
          }
        />

        {/* --- ROUTES ACHETEUR --- */}
        <Route
          path="/dashboard-acheteur"
          element={
            <PageWrapper>
              {isAuthenticated && role === "acheteur" ? (
                <DashboardAcheteur />
              ) : (
                <Navigate to="/" />
              )}
            </PageWrapper>
          }
        />
        <Route
          path="/wallet"
          element={
            <PageWrapper>
              {isAuthenticated && role === "acheteur" ? (
                <Wallet />
              ) : (
                <Navigate to="/" />
              )}
            </PageWrapper>
          }
        />

        {/* --- ROUTES ACTIONNAIRE --- */}
        <Route
          path="/dashboard-actionnaire"
          element={
            <PageWrapper>
              {isAuthenticated && role === "actionnaire" ? (
                <DashboardActionnaire />
              ) : (
                <Navigate to="/" />
              )}
            </PageWrapper>
          }
        />
        <Route
          path="/proposer-actif"
          element={
            <PageWrapper>
              {isAuthenticated && role === "actionnaire" ? (
                <ProposerActif />
              ) : (
                <Navigate to="/" />
              )}
            </PageWrapper>
          }
        />

        <Route
          path="/propose-bond"
          element={
            <PageWrapper>
              {isAuthenticated && role === "actionnaire" ? (
                <ProposeBond />
              ) : (
                <Navigate to="/" />
              )}
            </PageWrapper>
          }
        />

        {/* --- ROUTE ADMIN --- */}
        <Route
          path="/admin"
          element={
            <PageWrapper>
              {isAuthenticated && role === "admin" ? (
                <AdminPanel />
              ) : (
                <Navigate to="/" />
              )}
            </PageWrapper>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
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

        <AnimatedRoutes isAuthenticated={isAuthenticated} role={role} />
      </div>
    </Router>
  );
}

export default App;

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirige vers le dashboard après 5 secondes
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 style={{ color: "#2ecc71" }}>✅ Paiement Réussi !</h1>
      <p>
        Merci pour votre dépôt. Votre solde sera mis à jour dans quelques
        instants.
      </p>
      <p>Vous allez être redirigé vers votre tableau de bord...</p>
      <button onClick={() => navigate("/dashboard")}>
        Retourner au Dashboard
      </button>
    </div>
  );
};

export default Success;

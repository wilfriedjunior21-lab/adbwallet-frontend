import React from "react";
import { QRCodeSVG } from "qrcode.react";

const DepositQR = ({ userId }) => {
  // L'URL vers laquelle le scan va diriger l'utilisateur
  // Remplace l'URL par celle de ton site réel une fois en ligne
  const paymentUrl = `https://adbwallet-backend.onrender.com/mobile-deposit?userId=${userId}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "15px",
      }}
    >
      <h3 style={{ color: "#333", marginBottom: "15px" }}>
        Dépôt Express via QR Code
      </h3>

      <div style={{ border: "10px solid #f8f9fa", borderRadius: "10px" }}>
        <QRCodeSVG
          value={paymentUrl}
          size={200}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"L"}
          includeMargin={false}
        />
      </div>

      <p
        style={{
          marginTop: "15px",
          fontSize: "14px",
          color: "#666",
          textAlign: "center",
        }}
      >
        Scannez ce code avec votre téléphone <br />
        <strong>.</strong> pour payer rapidement.
      </p>
    </div>
  );
};

export default DepositQR;

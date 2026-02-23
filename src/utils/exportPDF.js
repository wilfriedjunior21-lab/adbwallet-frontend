import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportTransactionsPDF = (transactions, userName) => {
  const doc = new jsPDF();

  // --- DESIGN DU HEADER ---
  doc.setFontSize(20);
  doc.setTextColor(40, 44, 52);
  doc.text("ADB WALLET - RELEVÉ DE COMPTE", 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Client : ${userName.toUpperCase()}`, 14, 30);
  doc.text(`Date du relevé : ${new Date().toLocaleDateString()}`, 14, 35);

  // --- PRÉPARATION DES DONNÉES ---
  const tableColumn = ["Date", "Type", "Actif", "Quantité", "Montant (F)"];
  const tableRows = [];

  transactions.forEach((tx) => {
    const transactionData = [
      new Date(tx.date).toLocaleDateString(),
      tx.type.toUpperCase(),
      tx.actionId ? tx.actionId.name : "N/A",
      tx.quantity || "-",
      `${tx.amount.toLocaleString()} F`,
    ];
    tableRows.push(transactionData);
  });

  // --- GÉNÉRATION DU TABLEAU ---
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: "grid",
    headStyles: { fillGray: [30, 41, 59], textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
  });

  // --- PIED DE PAGE ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
  }

  // Sauvegarde
  doc.save(`ADB_Wallet_Transactions_${userName}.pdf`);
};

import React, { useState, useEffect, useRef } from "react";
import api, { BASE_URL } from "../api"; // Importation de ton instance axios et de l'URL de base
import {
  User,
  Camera,
  Mail,
  Wallet,
  ShieldCheck,
  Loader2,
  LogOut,
} from "lucide-react";
import { toast } from "react-hot-toast";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetchProfile();
    } else {
      setLoading(false);
      toast.error("Utilisateur non connecté");
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      // Utilisation de l'instance 'api' qui gère déjà le BASE_URL
      const res = await api.get(`/api/user/profile/${userId}`);
      setUser(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.startsWith("image/")) {
      toast.error("Format d'image non supporté");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      // Envoi vers la route du serveur configurée avec Multer
      const res = await api.post(
        `/api/user/upload-profile-pic/${userId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setUser(res.data); // Mise à jour locale avec les données renvoyées par le serveur
      toast.success("Logo/Photo mis à jour !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'importation");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (loading)
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-28 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black uppercase border-l-4 border-blue-600 pl-4 tracking-tighter">
          Mon Profil
        </h1>
        <button
          onClick={handleLogout}
          className="p-2 bg-red-600/10 text-red-500 rounded-full"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* SECTION LOGO / AVATAR */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-blue-600/20 overflow-hidden bg-slate-900 flex items-center justify-center shadow-2xl">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://ui-avatars.com/api/?name=" + user.name;
                }}
              />
            ) : (
              <User className="w-16 h-16 text-slate-700" />
            )}
          </div>

          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 bg-blue-600 p-3 rounded-full hover:bg-blue-500 active:scale-90 transition-all shadow-lg border-2 border-black"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
        <p className="mt-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
          Identité visuelle de l'actionnaire
        </p>
      </div>

      {/* GRILLE D'INFORMATIONS */}
      <div className="grid gap-4">
        <InfoRow
          icon={<User size={18} />}
          label="Nom complet / Entité"
          value={user?.name}
          color="blue"
        />
        <InfoRow
          icon={<Mail size={18} />}
          label="Contact Email"
          value={user?.email}
          color="purple"
        />
        <InfoRow
          icon={<Wallet size={18} />}
          label="Solde du Wallet"
          value={`${user?.balance?.toLocaleString()} F CFA`}
          color="green"
          highlight
        />
        <InfoRow
          icon={<ShieldCheck size={18} />}
          label="Certification KYC"
          value={user?.kycStatus?.replace("_", " ")}
          color={user?.kycStatus === "valide" ? "green" : "orange"}
          isStatus
        />
      </div>

      {/* Petit message d'aide */}
      <div className="mt-8 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
        <p className="text-[10px] text-blue-400 text-center leading-relaxed">
          Votre logo sera visible par tous les acheteurs sur le marché à côté de
          vos actions publiées.
        </p>
      </div>
    </div>
  );
};

// Composant réutilisable pour les lignes d'info
const InfoRow = ({ icon, label, value, color, highlight, isStatus }) => (
  <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-slate-900/60">
    <div className={`p-3 rounded-xl bg-${color}-600/10 text-${color}-500`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[9px] text-slate-500 font-black uppercase tracking-tight mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm tracking-tight ${
          highlight
            ? "text-xl font-black text-green-400"
            : "font-bold text-slate-200"
        } ${isStatus ? "capitalize" : ""}`}
      >
        {value || "Non renseigné"}
      </p>
    </div>
  </div>
);

export default Profile;

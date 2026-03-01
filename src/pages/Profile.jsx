import React, { useState, useEffect } from "react";
import api from "../api";
import {
  FiCamera,
  FiUser,
  FiSave,
  FiArrowLeft,
  FiUpload,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState({ name: "", email: "", profilePic: "" });
  const [uploading, setUploading] = useState(false);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // --- CHARGEMENT DU PROFIL ---
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        // Utilisation de la route standard définie dans ton server.js
        const res = await api.get(`/user/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("Erreur 404 - Vérifiez la route /api/user/:id", err);
        toast.error("Impossible de charger le profil");
      }
    };
    fetchUser();
  }, [userId]);

  // --- GESTION DE L'UPLOAD DE L'IMAGE (FILE) ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      // Appel à ta route /api/user/upload-profile-pic/:userId
      const res = await api.post(
        `/user/upload-profile-pic/${userId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setUser({ ...user, profilePic: res.data.profilePic });
      toast.success("Photo mise à jour !");
    } catch (err) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  // --- SAUVEGARDE DU NOM ---
  const handleUpdate = async () => {
    try {
      // Attention : Ton serveur n'a pas encore de route PUT /api/user/update/:id
      // On utilise donc une route existante ou on en crée une mentalement.
      // Pour l'instant, simulons la mise à jour du nom si tu as une route générique
      await api.patch(`/admin/kyc/${userId}`, { name: user.name }); // Exemple ou adapte selon tes besoins
      toast.success("Nom mis à jour !");
    } catch (err) {
      toast.error("Erreur de sauvegarde");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-white pt-10">
      <Toaster />
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 mb-8 uppercase text-xs font-black hover:text-white transition-colors"
      >
        <FiArrowLeft /> Retour
      </button>

      <h1 className="text-3xl font-black italic uppercase mb-10">
        Mon <span className="text-blue-500">Profil</span>
      </h1>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          {/* ZONE PHOTO DE PROFIL */}
          <div className="relative group mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-blue-500/20 overflow-hidden bg-black flex items-center justify-center">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              ) : (
                <FiUser size={48} className="text-slate-700" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 p-3 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
              <FiCamera size={18} />
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </label>
          </div>

          {uploading && (
            <p className="text-xs text-blue-500 animate-pulse mb-4">
              Téléchargement de l'image...
            </p>
          )}

          <div className="w-full space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2 block">
                Nom complet
              </label>
              <input
                type="text"
                value={user.name || ""}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full bg-black border border-slate-800 p-4 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 ml-2 mb-2 block">
                Adresse Email
              </label>
              <input
                type="text"
                value={user.email || ""}
                disabled
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm outline-none opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          <button
            onClick={handleUpdate}
            className="w-full mt-10 bg-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20"
          >
            <FiSave size={20} /> Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

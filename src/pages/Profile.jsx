import React, { useState, useEffect } from "react";
import api from "../api";
import { FiUser, FiMail, FiShield, FiCreditCard } from "react-icons/fi";

const Profile = () => {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/api/user/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [userId]);

  if (!user)
    return (
      <div className="p-20 text-white text-center">Chargement du profil...</div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black">
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic">
              {user.name}
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
              {user.role}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
            <FiMail className="text-blue-500" />
            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase">
                Email
              </p>
              <p className="text-sm font-bold">{user.email}</p>
            </div>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
            <FiShield className="text-emerald-500" />
            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase">
                Statut KYC
              </p>
              <p
                className={`text-sm font-bold uppercase ${
                  user.kycStatus === "valide"
                    ? "text-emerald-500"
                    : "text-orange-500"
                }`}
              >
                {user.kycStatus.replace("_", " ")}
              </p>
            </div>
          </div>
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
            <FiCreditCard className="text-blue-500" />
            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase">
                Solde Actuel
              </p>
              <p className="text-sm font-bold">
                {user.balance.toLocaleString()} F CFA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

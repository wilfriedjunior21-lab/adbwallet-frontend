import React, { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-hot-toast";

const MarketPlace = ({ onBuy }) => {
  const [actions, setActions] = useState([]);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const res = await api.get("/api/actions");
        setActions(res.data);
      } catch (err) {
        toast.error("Erreur lors de la récupération du marché");
      }
    };
    fetchActions();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {actions.map((action) => (
        <div
          key={action._id}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <h3 className="text-lg font-bold text-slate-800">
            {action.companyName}
          </h3>
          <p className="text-2xl font-black text-blue-600 my-2">
            {action.price.toLocaleString()} XAF
          </p>
          <button
            onClick={() => onBuy(action)}
            className="w-full bg-blue-50 text-blue-600 py-2 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition"
          >
            Investir
          </button>
        </div>
      ))}
    </div>
  );
};

export default MarketPlace;

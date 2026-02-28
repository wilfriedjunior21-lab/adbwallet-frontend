import React, { useState, useEffect } from "react";
import api from "../api";
import { FiBell } from "react-icons/fi";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);
  const userId = localStorage.getItem("userId");

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 30000); // Check toutes les 30s
    return () => clearInterval(timer);
  }, []);

  const markAsRead = async () => {
    setShow(!show);
    if (!show) {
      await api.patch("/notifications/mark-read", { userId });
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={markAsRead}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
      >
        <FiBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {show && (
        <div className="absolute right-0 mt-4 w-80 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-black uppercase text-xs tracking-widest text-blue-500">
            Alertes Récentes
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 border-b border-slate-800/50 ${
                    !n.read ? "bg-blue-500/5" : ""
                  }`}
                >
                  <p className="font-bold text-xs uppercase">{n.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{n.message}</p>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-slate-500 text-[10px] uppercase font-bold italic">
                Aucune alerte
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

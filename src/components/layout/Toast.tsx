"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { notifications, removeNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {notifications.map((n) => {
        let bgColor = "bg-slate-900 text-white border-slate-700";
        let Icon = Info;
        let iconColor = "text-blue-400";

        if (n.type === "success") {
          bgColor = "bg-emerald-950/90 text-emerald-100 border-emerald-700";
          Icon = CheckCircle2;
          iconColor = "text-emerald-400";
        } else if (n.type === "error") {
          bgColor = "bg-rose-950/90 text-rose-100 border-rose-700";
          Icon = AlertCircle;
          iconColor = "text-rose-400";
        } else if (n.type === "warning") {
          bgColor = "bg-amber-950/90 text-amber-100 border-amber-700";
          Icon = AlertTriangle;
          iconColor = "text-amber-400";
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 ${bgColor}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 text-sm">
              <h5 className="font-semibold">{n.title}</h5>
              {n.message && <p className="text-xs opacity-90 mt-0.5">{n.message}</p>}
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

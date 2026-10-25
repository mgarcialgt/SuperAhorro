"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X, 
  Check, 
  Sparkles,
  BellRing
} from "lucide-react";

export function ToastContainer() {
  const { notifications, removeNotification } = useApp();
  const [progress, setProgress] = useState(100);

  // Take the most recent notification as the active PopUp
  const activeNotification = notifications[notifications.length - 1];

  // Auto-progress animation for the active PopUp
  useEffect(() => {
    if (!activeNotification) return;

    setProgress(100);
    const duration = 4800; // ms
    const intervalTime = 50;
    const decrement = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return Math.max(0, prev - decrement);
      });
    }, intervalTime);

    // Keyboard listener for Escape key to close PopUp
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        removeNotification(activeNotification.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeNotification?.id, removeNotification]);

  if (!activeNotification) return null;

  let Icon = Info;
  let iconBg = "bg-blue-500/15 text-blue-400 border-blue-500/30";
  let borderClass = "border-slate-800";
  let badgeText = "NOTIFICACIÓN DEL SISTEMA";
  let badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30";
  let progressBarColor = "bg-blue-500";
  let btnClass = "bg-blue-600 hover:bg-blue-500 text-white";

  if (activeNotification.type === "success") {
    Icon = CheckCircle2;
    iconBg = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    borderClass = "border-emerald-500/30";
    badgeText = "ACCIÓN COMPLETADA";
    badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    progressBarColor = "bg-emerald-500";
    btnClass = "bg-emerald-600 hover:bg-emerald-500 text-white";
  } else if (activeNotification.type === "error") {
    Icon = AlertCircle;
    iconBg = "bg-rose-500/15 text-rose-400 border-rose-500/30";
    borderClass = "border-rose-500/30";
    badgeText = "ERROR OPERATIVO";
    badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
    progressBarColor = "bg-rose-500";
    btnClass = "bg-rose-600 hover:bg-rose-500 text-white";
  } else if (activeNotification.type === "warning") {
    Icon = AlertTriangle;
    iconBg = "bg-amber-500/15 text-amber-400 border-amber-500/30";
    borderClass = "border-amber-500/30";
    badgeText = "ALERTA DE SISTEMA";
    badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
    progressBarColor = "bg-amber-500";
    btnClass = "bg-amber-600 hover:bg-amber-500 text-white";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in">
      {/* Click outside to dismiss */}
      <div 
        className="absolute inset-0" 
        onClick={() => removeNotification(activeNotification.id)} 
      />

      {/* PopUp Card */}
      <div 
        className={`relative z-10 w-full max-w-md bg-[#111827] border ${borderClass} rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/10`}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${iconBg} shadow-xs`}>
              <Icon className="w-6 h-6 animate-in zoom-in-50 duration-300" />
            </div>
            <div>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeColor}`}>
                <BellRing className="w-3 h-3" />
                {badgeText}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white mt-1 tracking-tight leading-snug">
                {activeNotification.title}
              </h4>
            </div>
          </div>

          <button
            onClick={() => removeNotification(activeNotification.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Cerrar ventana emergente"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        {activeNotification.message && (
          <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed pl-14">
            {activeNotification.message}
          </p>
        )}

        {/* Bottom Actions */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 font-mono">
            {notifications.length > 1 && (
              <span>
                Pendientes: <strong className="text-white">+{notifications.length - 1}</strong>
              </span>
            )}
            {notifications.length <= 1 && (
              <span>Cierre automático en segundos</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => removeNotification(activeNotification.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 ${btnClass}`}
            >
              <Check className="w-4 h-4" />
              <span>Aceptar</span>
            </button>
          </div>
        </div>

        {/* Progress Bar auto-dismiss indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/50">
          <div
            className={`h-full ${progressBarColor} transition-all duration-100 linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

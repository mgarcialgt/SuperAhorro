"use client";

import React, { useState, useEffect } from "react";
import { Store, ShieldCheck, Database, Check } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Cargando módulos del sistema...");
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const steps = [
      { pct: 25, text: "Verificando conexión con PostgreSQL / Supabase..." },
      { pct: 55, text: "Sincronizando inventario central de las 5 sucursales..." },
      { pct: 80, text: "Cargando catálogo EAN-13 y reglas de promociones..." },
      { pct: 100, text: "Terminal y servicios listos. ¡Bienvenido a SuperAhorro!" },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].pct);
        setStatusText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            onFinish();
          }, 400);
        }, 300);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#0b0f17] text-slate-100 transition-opacity duration-400 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background ambient texture (subtle, authentic enterprise style, no neon slop) */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md px-6 text-center space-y-6">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-500/30 mb-2">
          <Store className="w-8 h-8" />
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">SuperAhorro</h1>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              S.A.
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Sistema Integral de Gestión de Supermercados
          </p>
          <p className="text-[11px] text-slate-400">
            Red Multisede • Control de Inventario • Terminal POS
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2 pt-2">
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden ring-1 ring-slate-700/60">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="truncate max-w-[280px] text-left">{statusText}</span>
            <span className="font-bold text-slate-300 ml-2">{progress}%</span>
          </div>
        </div>

        {/* Quick entry button */}
        <div className="pt-2">
          <button
            onClick={() => {
              setIsFadingOut(true);
              setTimeout(onFinish, 300);
            }}
            className="text-xs text-slate-400 hover:text-white transition underline underline-offset-4 cursor-pointer"
          >
            Ingresar al sistema directamente &rarr;
          </button>
        </div>

        {/* System Credentials/Version footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Entorno Seguro SAT / DTE
          </span>
          <span className="font-mono">v2.0.4 Enterprise</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Menu, 
  MapPin, 
  UserCheck, 
  ShoppingCart, 
  ChevronDown, 
  Building2,
  Check
} from "lucide-react";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const { 
    sucursales, 
    currentSucursal, 
    setCurrentSucursal, 
    usuarios, 
    currentUser, 
    setCurrentUser,
    setActiveModule,
    showNotification
  } = useApp();

  const [showSucursalesMenu, setShowSucursalesMenu] = useState(false);
  const [showUsersMenu, setShowUsersMenu] = useState(false);

  return (
    <header className="sticky top-0 z-20 h-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & current module indicator */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <span>SuperAhorro S.A.</span>
            <span className="text-xs font-normal text-slate-400">|</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
              Versión 2.0 Prototipo
            </span>
          </h1>
        </div>
      </div>

      {/* Right Controls: Branch Switcher, POS shortcut, User/Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Branch Switcher (5 Sucursales) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSucursalesMenu(!showSucursalesMenu);
              setShowUsersMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition"
          >
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-left hidden md:block">
              <p className="text-[10px] text-slate-400 font-medium leading-none">Sucursal Activa</p>
              <p className="font-semibold text-slate-100 truncate max-w-[140px] leading-tight mt-0.5">
                {currentSucursal?.nombre.replace("SuperAhorro ", "") || "Seleccionar..."}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {showSucursalesMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Seleccionar Sucursal (5 Red Central)
              </div>
              <div className="py-1 space-y-1">
                {sucursales.map((suc) => {
                  const isSelected = currentSucursal?.id === suc.id;
                  return (
                    <button
                      key={suc.id}
                      onClick={() => {
                        setCurrentSucursal(suc);
                        setShowSucursalesMenu(false);
                        showNotification("info", "Sucursal Cambiada", `Ahora operando en ${suc.nombre}`);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition ${
                        isSelected 
                          ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30" 
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Building2 className={`w-4 h-4 mt-0.5 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                      <div className="flex-1 truncate">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold truncate">{suc.nombre}</span>
                          {suc.es_matriz && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">
                              MATRIZ
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{suc.direccion}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 self-center" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Quick POS Action Button */}
        <button
          onClick={() => setActiveModule("pos")}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva Venta POS</span>
        </button>

        {/* User / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUsersMenu(!showUsersMenu);
              setShowSucursalesMenu(false);
            }}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                currentUser?.nombre_completo.charAt(0) || "U"
              )}
            </div>
            <div className="text-left hidden md:block">
              <p className="font-semibold text-slate-100 text-xs leading-none truncate max-w-[120px]">
                {currentUser?.nombre_completo || "Usuario"}
              </p>
              <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider leading-tight mt-0.5">
                {currentUser?.rol.replace("_", " ") || "Rol"}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
          </button>

          {showUsersMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Cambiar Rol Activo (Simulación RBAC)
              </div>
              <div className="py-1 space-y-1">
                {usuarios.map((u) => {
                  const isSelected = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowUsersMenu(false);
                        showNotification("success", "Usuario Cambiado", `Sesión activa como: ${u.nombre_completo} (${u.rol})`);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs transition ${
                        isSelected 
                          ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30" 
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <UserCheck className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                      <div className="flex-1 truncate">
                        <p className="font-semibold truncate">{u.nombre_completo}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{u.rol.replace("_", " ")}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

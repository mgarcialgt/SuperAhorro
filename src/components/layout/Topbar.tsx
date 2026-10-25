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
  Check,
  Store,
  PanelLeft
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
    activeModule,
    setActiveModule,
    showNotification,
    isSidebarCollapsed,
    toggleSidebarCollapse
  } = useApp();

  const [showSucursalesMenu, setShowSucursalesMenu] = useState(false);
  const [showUsersMenu, setShowUsersMenu] = useState(false);

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#0e1420]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between transition-all duration-300">
      {/* Left: Mobile hamburger & Desktop collapse toggle & Brand */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Hamburger Drawer */}
        <button
          onClick={onToggleSidebar}
          aria-label="Abrir menú"
          className="lg:hidden p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse/Expand Rail Button */}
        <button
          onClick={toggleSidebarCollapse}
          title={isSidebarCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
          className="hidden lg:flex items-center justify-center p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition active:scale-95"
        >
          <PanelLeft className={`w-4 h-4 transition-transform duration-300 ${isSidebarCollapsed ? "text-emerald-400 rotate-180" : ""}`} />
        </button>

        <div className="flex items-center gap-2">
          <div className="lg:hidden w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">SuperAhorro</span>
              <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                S.A.
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
              Sistema Integral de Supermercados
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Branch Switcher, Quick POS, Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Branch Switcher (5 Sucursales) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSucursalesMenu(!showSucursalesMenu);
              setShowUsersMenu(false);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="text-left hidden sm:block">
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider leading-none">Sucursal</p>
              <p className="font-bold text-slate-100 truncate max-w-[120px] md:max-w-[150px] leading-tight mt-0.5">
                {currentSucursal ? currentSucursal.nombre.replace("SuperAhorro ", "") : "Cargando..."}
              </p>
            </div>
            <span className="sm:hidden text-xs font-semibold text-slate-200">
              {currentSucursal?.codigo || "Sede"}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {showSucursalesMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-[#111827] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Cambiar Sucursal Activa
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
                        showNotification("info", "Sucursal Seleccionada", `Operando en ${suc.nombre}`);
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

        {/* Quick POS Button (Desktop) */}
        <button
          onClick={() => setActiveModule("pos")}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition active:scale-95"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Caja POS</span>
        </button>

        {/* User / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUsersMenu(!showUsersMenu);
              setShowSucursalesMenu(false);
            }}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 transition"
          >
            <div className="w-6 h-6 rounded-md bg-emerald-700 flex items-center justify-center font-bold text-white text-xs overflow-hidden shrink-0">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                currentUser?.nombre_completo.charAt(0) || "U"
              )}
            </div>
            <div className="text-left hidden lg:block">
              <p className="font-semibold text-slate-100 text-xs leading-none truncate max-w-[110px]">
                {currentUser?.nombre_completo.split(" ")[0]}
              </p>
              <p className="text-[9px] text-emerald-400 uppercase font-bold tracking-wider leading-tight mt-0.5">
                {currentUser?.rol.replace("_", " ") || "Rol"}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>

          {showUsersMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-[#111827] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Cambiar Perfil Operativo (RBAC)
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
                        showNotification("success", "Usuario Cambiado", `Sesión activa como: ${u.nombre_completo}`);
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

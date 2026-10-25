"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Warehouse, 
  CalendarClock, 
  Truck, 
  Building2, 
  Users, 
  Tag, 
  BarChart3, 
  ShieldCheck, 
  ClipboardList, 
  RotateCcw,
  Store,
  Database,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  MapPin
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { 
    activeModule, 
    setActiveModule, 
    currentSucursal, 
    isSupabaseActive, 
    showNotification,
    isSidebarCollapsed,
    toggleSidebarCollapse
  } = useApp();

  const menuSections = [
    {
      title: "OPERACIÓN",
      items: [
        { id: "dashboard", label: "Dashboard Gerencial", icon: LayoutDashboard },
        { id: "pos", label: "Punto de Venta (POS)", icon: ShoppingCart, highlight: true },
      ],
    },
    {
      title: "LOGÍSTICA & STOCK",
      items: [
        { id: "productos", label: "Catálogo de Productos", icon: Package },
        { id: "inventario", label: "Inventario (5 Sucursales)", icon: Warehouse },
        { id: "lotes", label: "Lotes y Vencimientos", icon: CalendarClock },
        { id: "compras", label: "Compras & Recepción", icon: Truck },
      ],
    },
    {
      title: "COMERCIAL",
      items: [
        { id: "clientes", label: "Clientes & Fidelización", icon: Users },
        { id: "proveedores", label: "Proveedores", icon: Building2 },
        { id: "promociones", label: "Precios y Promociones", icon: Tag },
      ],
    },
    {
      title: "ADMINISTRACIÓN",
      items: [
        { id: "reportes", label: "Reportes & KPIs", icon: BarChart3 },
        { id: "usuarios", label: "Usuarios y Roles", icon: ShieldCheck },
        { id: "auditoria", label: "Bitácora de Auditoría", icon: ClipboardList },
      ],
    },
  ];

  const handleResetData = () => {
    if (confirm("¿Estás seguro de que deseas restablecer los datos de demostración a su estado inicial?")) {
      SuperAhorroDB.resetDemoDatabase();
      showNotification("info", "Datos Restablecidos", "Se ha reinicializado la base de datos");
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/70 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0e1420] border-r border-slate-800 text-slate-200 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "w-72 lg:w-20" : "w-72 lg:w-72"}`}
      >
        {/* Brand Header */}
        <div className={`h-16 flex items-center border-b border-slate-800/80 bg-[#0a0e17] transition-all duration-300 ${
          isSidebarCollapsed ? "px-3 justify-center lg:justify-between" : "px-4 justify-between"
        }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div 
              onClick={() => setActiveModule("dashboard")}
              title="SuperAhorro S.A."
              className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0 cursor-pointer hover:bg-emerald-500 transition active:scale-95"
            >
              <Store className="w-5 h-5 text-white" />
            </div>
            
            {/* Expanded brand title */}
            <div className={`transition-opacity duration-200 whitespace-nowrap ${isSidebarCollapsed ? "lg:hidden" : "block"}`}>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">SuperAhorro</span>
                <span className="text-[9px] font-bold uppercase px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">S.A.</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Plataforma Multisede</p>
            </div>
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebarCollapse}
            title={isSidebarCollapsed ? "Expandir menú completo" : "Contraer a solo iconos"}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition active:scale-95"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Current Active Branch Chip */}
        <div className={`border-b border-slate-800/80 bg-slate-900/50 transition-all duration-200 ${
          isSidebarCollapsed ? "p-2 flex justify-center" : "px-4 py-2 flex items-center justify-between"
        }`}>
          {isSidebarCollapsed ? (
            <div 
              title={`Sucursal: ${currentSucursal?.nombre || "Cargando..."}`}
              className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400 relative cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1"></span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 truncate">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-400 truncate text-[11px]">Sede:</span>
                <span className="font-bold text-slate-200 truncate text-xs">
                  {currentSucursal ? currentSucursal.nombre.replace("SuperAhorro ", "") : "Cargando..."}
                </span>
              </div>
              {currentSucursal?.es_matriz && (
                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1 rounded font-mono font-bold">
                  MATRIZ
                </span>
              )}
            </>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-3 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-700">
          {menuSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              {/* Section Header */}
              {isSidebarCollapsed ? (
                <div className="h-px bg-slate-800/80 my-2 mx-1" />
              ) : (
                <p className="px-2.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  {sec.title}
                </p>
              )}

              <div className="space-y-1">
                {sec.items.map((item) => {
                  const isActive = activeModule === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        if (window.innerWidth < 1024) setIsOpen(false);
                      }}
                      title={item.label}
                      className={`w-full flex items-center rounded-xl text-xs font-medium transition-all duration-150 relative group ${
                        isSidebarCollapsed 
                          ? "justify-center p-2.5" 
                          : "gap-2.5 px-3 py-2 text-left"
                      } ${
                        isActive
                          ? "bg-emerald-600 text-white font-bold shadow-xs active:scale-[0.98]"
                          : item.highlight
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-semibold"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? "text-white" : item.highlight ? "text-emerald-400" : "text-slate-400"
                      }`} />

                      {/* Text label when expanded */}
                      <span className={`truncate ${isSidebarCollapsed ? "lg:hidden" : "block"}`}>
                        {item.label}
                      </span>

                      {/* Highlight badges */}
                      {item.highlight && !isActive && (
                        isSidebarCollapsed ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 animate-pulse" />
                        ) : (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 uppercase">
                            POS
                          </span>
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom System Status & Quick Actions */}
        <div className={`border-t border-slate-800/80 bg-[#0a0e17] transition-all duration-300 ${
          isSidebarCollapsed ? "p-2 space-y-2 flex flex-col items-center" : "p-3 space-y-2"
        }`}>
          {/* Database status indicator */}
          {isSidebarCollapsed ? (
            <div 
              title={`Base de Datos: ${isSupabaseActive ? "Supabase Cloud" : "Local Reactiva"}`}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${isSupabaseActive ? "bg-emerald-400" : "bg-amber-400"} animate-pulse`}></span>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-slate-500" />
                Base de Datos:
              </span>
              <span className={`font-semibold flex items-center gap-1 ${isSupabaseActive ? "text-emerald-400" : "text-amber-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseActive ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                {isSupabaseActive ? "Supabase Cloud" : "Local Reactiva"}
              </span>
            </div>
          )}

          {/* Reset Demo Database button */}
          <button
            onClick={handleResetData}
            title="Restaura todos los datos de demostración a su estado inicial"
            className={`flex items-center justify-center rounded-lg border border-slate-700/60 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition active:scale-95 ${
              isSidebarCollapsed 
                ? "w-8 h-8 p-1.5" 
                : "w-full gap-1.5 py-1.5 px-2.5 text-[11px] font-medium"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className={`${isSidebarCollapsed ? "lg:hidden" : "inline"}`}>Reiniciar Datos</span>
          </button>
        </div>
      </aside>
    </>
  );
}

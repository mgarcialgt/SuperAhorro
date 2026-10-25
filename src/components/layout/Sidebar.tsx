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
  Database
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { activeModule, setActiveModule, currentSucursal, isSupabaseActive, showNotification } = useApp();

  const menuSections = [
    {
      title: "PRINCIPAL",
      items: [
        { id: "dashboard", label: "Dashboard Gerencial", icon: LayoutDashboard },
        { id: "pos", label: "Punto de Venta (POS)", icon: ShoppingCart, highlight: true },
      ],
    },
    {
      title: "CADENA DE SUMINISTRO",
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
      title: "GESTIÓN Y AUDITORÍA",
      items: [
        { id: "reportes", label: "Reportes & KPIs", icon: BarChart3 },
        { id: "usuarios", label: "Usuarios y Roles", icon: ShieldCheck },
        { id: "auditoria", label: "Bitácora de Auditoría", icon: ClipboardList },
      ],
    },
  ];

  const handleResetData = () => {
    if (confirm("¿Estás seguro de que deseas restablecer los datos de demostración a su estado inicial? Esto recargará los 5 almacenes, lotes y catálogo.")) {
      SuperAhorroDB.resetDemoDatabase();
      showNotification("info", "Datos Restablecidos", "Se ha reinicializado la base de datos de demostración");
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white font-black text-xl">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">SuperAhorro</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">S.A.</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Sistema Integral Multisede</p>
          </div>
        </div>

        {/* Current Branch Active Indicator */}
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400 truncate">Sede:</span>
            <span className="font-semibold text-emerald-300 truncate">
              {currentSucursal ? currentSucursal.nombre.replace("SuperAhorro ", "") : "Cargando..."}
            </span>
          </div>
          {currentSucursal?.es_matriz && (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">
              MATRIZ
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {menuSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-slate-400 tracking-wider">
                {sec.title}
              </p>
              <div className="space-y-1 mt-1">
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
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                        isActive
                          ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/40"
                          : item.highlight
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.highlight ? "text-emerald-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                      {item.highlight && !isActive && (
                        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 uppercase">
                          Caja
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom System Status & Data Reset */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              Base de Datos:
            </span>
            <span className={`font-semibold flex items-center gap-1 ${isSupabaseActive ? "text-emerald-400" : "text-amber-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseActive ? "bg-emerald-400" : "bg-amber-400"}`}></span>
              {isSupabaseActive ? "PostgreSQL Supabase" : "Simulación Local Activa"}
            </span>
          </div>

          <button
            onClick={handleResetData}
            title="Restaura todos los productos, inventarios y ventas a los valores iniciales"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Restaurar Datos Semilla</span>
          </button>
        </div>
      </aside>
    </>
  );
}

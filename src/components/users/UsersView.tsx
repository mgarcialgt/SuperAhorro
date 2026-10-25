"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { Usuario, RolUsuario } from "@/types";
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Building2, 
  Lock, 
  CheckCircle,
  KeyRound
} from "lucide-react";

export function UsersView() {
  const { usuarios, currentUser, setCurrentUser, showNotification } = useApp();

  const rolePermissions: Record<RolUsuario, string[]> = {
    admin: ["Acceso Total al Sistema", "Gestión de Precios & Promociones", "Creación y Baja de Productos", "Auditoría Completa", "Configuración de Sucursales"],
    gerente_sucursal: ["Supervisión de Sucursal Asignada", "Cierre y Arqueo de Cajas", "Aprobación de Mermas y Ajustes", "Reportes Financieros Locales"],
    cajero: ["Punto de Venta POS", "Cobro con Tarjetas & Efectivo", "Canje de Puntos de Clientes", "Emisión de Tickets DTE/FEL"],
    encargado_inventario: ["Control de Existencias", "Traslados Inter-Sucursales", "Recepción de Mercancía", "Gestión de Lotes & Vencimientos"],
    encargado_compras: ["Directorio de Proveedores", "Generación de Órdenes de Compra", "Negociación de Costos", "Control de Plazos de Crédito"],
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Control de Accesos Basado en Roles (RBAC)</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Usuarios, Roles y Matriz de Permisos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Administración de perfiles operativos y asignación de sucursales en la red SuperAhorro S.A.
          </p>
        </div>
      </div>

      {/* Active User Card */}
      {currentUser && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg overflow-hidden border border-emerald-400/40">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                currentUser.nombre_completo.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Sesión Actual Activa</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h3 className="text-lg font-bold text-white">{currentUser.nombre_completo}</h3>
              <p className="text-xs text-slate-300">
                Rol: <strong className="text-emerald-300 uppercase">{currentUser.rol.replace("_", " ")}</strong> | Sede: {currentUser.sucursal_asignada_nombre || "Global"}
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Email: <strong className="text-slate-200">{currentUser.email}</strong>
          </div>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {usuarios.map((u) => {
          const isCurrent = currentUser?.id === u.id;
          const perms = rolePermissions[u.rol] || [];

          return (
            <div
              key={u.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                isCurrent
                  ? "bg-slate-900/90 border-emerald-500 shadow-xl shadow-emerald-950/30"
                  : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.nombre_completo} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-white">
                          {u.nombre_completo.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{u.nombre_completo}</h4>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    u.rol === "admin"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                      : u.rol === "cajero"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : u.rol === "gerente_sucursal"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}>
                    {u.rol.replace("_", " ")}
                  </span>
                </div>

                <div className="py-2 border-y border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{u.sucursal_asignada_nombre || "Asignación Matriz"}</span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Permisos Habilitados:</p>
                  {perms.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800">
                <button
                  disabled={isCurrent}
                  onClick={() => {
                    setCurrentUser(u);
                    showNotification("success", "Sesión Cambiada", `Ahora operando como ${u.nombre_completo}`);
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isCurrent ? "Sesión Activa" : "Conectar como este Usuario"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

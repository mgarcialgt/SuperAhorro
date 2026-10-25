"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { AuditoriaLog } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { 
  ClipboardList, 
  Search, 
  ShieldCheck, 
  Filter, 
  Terminal,
  Activity
} from "lucide-react";

export function AuditView() {
  const { refreshKey } = useApp();
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");

  useEffect(() => {
    async function load() {
      const data = await SuperAhorroDB.getAuditoriaLogs();
      setLogs(data);
    }
    load();
  }, [refreshKey]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.usuario_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entidad_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMod = selectedModule === "all" || log.modulo === selectedModule;
    return matchesSearch && matchesMod;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <ClipboardList className="w-4 h-4" />
            <span>Seguridad y Cumplimiento Normativo</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Bitácora de Auditoría y Trazabilidad de Eventos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro inmutable de todas las transacciones, modificaciones de stock, accesos y operaciones críticas.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuario, acción o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos los Módulos</option>
            <option value="pos">Punto de Venta (POS)</option>
            <option value="inventario">Inventario & Traslados</option>
            <option value="productos">Catálogo de Productos</option>
            <option value="compras">Compras & Recepción</option>
            <option value="clientes">Clientes & Puntos</option>
            <option value="sistema">Sistema</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-4 px-4">Fecha / Hora</th>
                <th className="py-4 px-3">Usuario Operador</th>
                <th className="py-4 px-3">Acción Registrada</th>
                <th className="py-4 px-3">Módulo</th>
                <th className="py-4 px-3">Detalles JSON</th>
                <th className="py-4 px-4 text-right">Dirección IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>

                  <td className="py-3 px-3 font-sans font-semibold text-slate-200">
                    {log.usuario_nombre}
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                      {log.accion}
                    </span>
                  </td>

                  <td className="py-3 px-3 uppercase text-slate-400 font-bold">
                    {log.modulo}
                  </td>

                  <td className="py-3 px-3 max-w-[280px] truncate text-slate-400">
                    <span title={JSON.stringify(log.detalles_json)}>
                      {JSON.stringify(log.detalles_json)}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right text-slate-500">
                    {log.ip_origen}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

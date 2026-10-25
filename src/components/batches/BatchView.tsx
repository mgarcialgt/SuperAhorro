"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { Lote, Producto } from "@/types";
import { formatDate, calculateDaysUntil } from "@/lib/utils";
import { 
  CalendarClock, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  X,
  ShieldCheck
} from "lucide-react";

export function BatchView() {
  const { currentSucursal, sucursales, refreshKey, refreshData, showNotification, currentUser } = useApp();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Lote>>({
    producto_id: "",
    sucursal_id: currentSucursal?.id || "",
    numero_lote: "",
    fecha_fabricacion: new Date().toISOString().split("T")[0],
    fecha_vencimiento: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
    cantidad_inicial: 50,
    costo_compra: 10.50,
    notas: "",
  });

  useEffect(() => {
    async function load() {
      const data = await SuperAhorroDB.getLotes();
      const prods = await SuperAhorroDB.getProductos();
      setLotes(data);
      setProductos(prods);

      if (prods.length > 0 && !formData.producto_id) {
        setFormData(prev => ({
          ...prev,
          producto_id: prods.find(p => p.es_perecedero)?.id || prods[0].id,
          sucursal_id: currentSucursal?.id || sucursales[0]?.id || "",
          numero_lote: `LOT-${Date.now().toString().slice(-6)}`,
        }));
      }
    }
    load();
  }, [refreshKey, currentSucursal, sucursales]);

  const handleSaveLote = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = productos.find(p => p.id === formData.producto_id);
    const suc = sucursales.find(s => s.id === formData.sucursal_id);

    try {
      await SuperAhorroDB.saveLote({
        ...formData,
        producto_nombre: prod?.nombre,
        producto_sku: prod?.sku,
        sucursal_nombre: suc?.nombre,
      }, currentUser?.nombre_completo);

      showNotification("success", "Lote Registrado", `Lote ${formData.numero_lote} guardado exitosamente`);
      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      showNotification("error", "Error", err.message || "No se pudo guardar el lote");
    }
  };

  const filteredLotes = lotes.filter((l) => {
    const daysLeft = calculateDaysUntil(l.fecha_vencimiento);
    const matchesSearch = 
      l.numero_lote.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.producto_nombre && l.producto_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesEstado = true;
    if (filterEstado === "por_vencer") matchesEstado = daysLeft <= 15 && daysLeft > 0;
    else if (filterEstado === "vencido") matchesEstado = daysLeft <= 0;
    else if (filterEstado === "vigente") matchesEstado = daysLeft > 15;

    return matchesSearch && matchesEstado;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <CalendarClock className="w-4 h-4" />
            <span>Trazabilidad y Calidad Alimentaria</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Control de Lotes y Vencimientos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoreo preventivo de caducidad para productos perecederos (lácteos, carnes, embutidos y panadería).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Lote</span>
        </button>
      </div>

      {/* Summary Alert Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Lotes Vigentes</p>
            <p className="text-xl font-bold text-emerald-400 font-mono">
              {lotes.filter(l => calculateDaysUntil(l.fecha_vencimiento) > 15).length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-amber-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Próximos a Vencer (&le; 15 días)</p>
            <p className="text-xl font-bold text-amber-300 font-mono">
              {lotes.filter(l => {
                const d = calculateDaysUntil(l.fecha_vencimiento);
                return d <= 15 && d > 0;
              }).length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-rose-900/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Caducados o Vencidos</p>
            <p className="text-xl font-bold text-rose-400 font-mono">
              {lotes.filter(l => calculateDaysUntil(l.fecha_vencimiento) <= 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por lote o producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Estado:</span>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos los Estados</option>
            <option value="vigente">Vigentes (&gt; 15 días)</option>
            <option value="por_vencer">Próximos a Vencer (&le; 15 días)</option>
            <option value="vencido">Vencidos</option>
          </select>
        </div>
      </div>

      {/* Batches Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-4 px-4">Lote & Producto</th>
                <th className="py-4 px-3">Sucursal Asignada</th>
                <th className="py-4 px-3">Fecha Fabricación</th>
                <th className="py-4 px-3">Fecha Vencimiento</th>
                <th className="py-4 px-3 text-center">Días Restantes</th>
                <th className="py-4 px-3 text-center">Disponibles</th>
                <th className="py-4 px-4 text-center">Estado Alerta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLotes.map((lote) => {
                const days = calculateDaysUntil(lote.fecha_vencimiento);
                const isExpired = days <= 0;
                const isNearExpiry = days > 0 && days <= 15;

                return (
                  <tr key={lote.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white text-xs flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                          {lote.numero_lote}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-200 mt-0.5">{lote.producto_nombre}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{lote.producto_sku}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-200">{lote.sucursal_nombre}</span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {formatDate(lote.fecha_fabricacion)}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-200 text-xs">
                      {formatDate(lote.fecha_vencimiento)}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {isExpired ? (
                        <span className="text-rose-400">Vencido ({Math.abs(days)}d)</span>
                      ) : (
                        <span className={isNearExpiry ? "text-amber-400" : "text-emerald-400"}>
                          {days} días
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-sm text-white">
                      {lote.cantidad_disponible} <span className="text-xs font-normal text-slate-400">/ {lote.cantidad_inicial}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          Vencido
                        </span>
                      ) : isNearExpiry ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          Por Vencer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Vigente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Crear Lote */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Registrar Lote de Producción</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLote} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Producto Perecedero *</label>
                <select
                  value={formData.producto_id}
                  onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sucursal *</label>
                  <select
                    value={formData.sucursal_id}
                    onChange={(e) => setFormData({ ...formData, sucursal_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Número de Lote *</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_lote}
                    onChange={(e) => setFormData({ ...formData, numero_lote: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Fabricación</label>
                  <input
                    type="date"
                    value={formData.fecha_fabricacion}
                    onChange={(e) => setFormData({ ...formData, fecha_fabricacion: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Vencimiento *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_vencimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cantidad Inicial (Uds) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.cantidad_inicial}
                    onChange={(e) => setFormData({ ...formData, cantidad_inicial: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Costo Unitario Compra (Q)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costo_compra}
                    onChange={(e) => setFormData({ ...formData, costo_compra: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Guardar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { InventarioSucursal, Producto, Sucursal, MovimientoStock } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { 
  Warehouse, 
  ArrowLeftRight, 
  AlertOctagon, 
  History, 
  Search, 
  Building2, 
  CheckCircle2, 
  X,
  FileSpreadsheet
} from "lucide-react";

export function InventoryView() {
  const { currentSucursal, sucursales, refreshKey, refreshData, showNotification, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<"matriz" | "traslados" | "mermas" | "kardex">("matriz");
  const [inventario, setInventario] = useState<InventarioSucursal[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSucursalId, setFilterSucursalId] = useState<string>("all");

  // Transfer modal
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    sucursalOrigenId: currentSucursal?.id || "",
    sucursalDestinoId: "",
    productoId: "",
    cantidad: 10,
    motivo: "Reabastecimiento regular de sucursal",
  });

  // Merma modal
  const [isMermaOpen, setIsMermaOpen] = useState(false);
  const [mermaData, setMermaData] = useState({
    sucursalId: currentSucursal?.id || "",
    productoId: "",
    cantidad: 1,
    motivo: "Rotura de empaque en góndola",
  });

  useEffect(() => {
    async function load() {
      const inv = await SuperAhorroDB.getInventario();
      const prods = await SuperAhorroDB.getProductos();
      const movs = await SuperAhorroDB.getMovimientos();
      setInventario(inv);
      setProductos(prods);
      setMovimientos(movs);

      // Default destinations
      if (sucursales.length > 1 && !transferData.sucursalDestinoId) {
        const dest = sucursales.find(s => s.id !== currentSucursal?.id) || sucursales[1];
        setTransferData(prev => ({ 
          ...prev, 
          sucursalOrigenId: currentSucursal?.id || sucursales[0].id,
          sucursalDestinoId: dest.id,
          productoId: prods[0]?.id || "",
        }));
        setMermaData(prev => ({
          ...prev,
          sucursalId: currentSucursal?.id || sucursales[0].id,
          productoId: prods[0]?.id || "",
        }));
      }
    }
    load();
  }, [refreshKey, currentSucursal, sucursales]);

  // Handle Transfer submit
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferData.sucursalOrigenId === transferData.sucursalDestinoId) {
      showNotification("error", "Error en Traslado", "La sucursal de origen y destino no pueden ser iguales");
      return;
    }
    if (transferData.cantidad <= 0) {
      showNotification("error", "Cantidad inválida", "La cantidad debe ser mayor a 0");
      return;
    }

    try {
      await SuperAhorroDB.transferStock(
        transferData.sucursalOrigenId,
        transferData.sucursalDestinoId,
        transferData.productoId,
        transferData.cantidad,
        currentUser?.nombre_completo || "Encargado Bodega",
        transferData.motivo
      );
      showNotification("success", "Traslado Completado", `Se transfirieron ${transferData.cantidad} unidades exitosamente`);
      setIsTransferOpen(false);
      refreshData();
    } catch (err: any) {
      showNotification("error", "Fallo de traslado", err.message || "Error al transferir existencias");
    }
  };

  // Handle Merma submit
  const handleExecuteMerma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mermaData.cantidad <= 0) {
      showNotification("error", "Cantidad inválida", "La merma debe ser mayor a 0");
      return;
    }

    try {
      await SuperAhorroDB.adjustStockMerma(
        mermaData.sucursalId,
        mermaData.productoId,
        mermaData.cantidad,
        mermaData.motivo,
        currentUser?.nombre_completo || "Encargado Inventario"
      );
      showNotification("warning", "Ajuste por Merma Registrado", `Se descontaron ${mermaData.cantidad} unidades por merma/daño`);
      setIsMermaOpen(false);
      refreshData();
    } catch (err: any) {
      showNotification("error", "Error", err.message || "No se pudo registrar la merma");
    }
  };

  // Matriz filter
  const filteredInventory = inventario.filter((item) => {
    const matchesSearch = 
      item.producto?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.producto?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.producto?.barcode.includes(searchTerm);
    const matchesSuc = filterSucursalId === "all" || item.sucursal_id === filterSucursalId;
    return matchesSearch && matchesSuc;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Warehouse className="w-4 h-4" />
            <span>Control de Stock Centralizado</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Inventario Multisede (Red de 5 Sucursales)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Existencias en tiempo real, traslados inter-sucursales, registro de mermas y Kardex de trazabilidad.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <button
            onClick={() => setIsTransferOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs transition"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Traslado entre Sucursales</span>
          </button>
          <button
            onClick={() => setIsMermaOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-xs transition"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Ajuste / Merma</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: "matriz", label: "Existencias por Sucursal", icon: Warehouse },
          { id: "kardex", label: "Kardex / Historial de Movimientos", icon: History },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: Matriz */}
      {activeTab === "matriz" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-[#111827] border border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por producto o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 whitespace-nowrap">Filtrar Sede:</span>
              <select
                value={filterSucursalId}
                onChange={(e) => setFilterSucursalId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Todas las 5 Sucursales</option>
                {sucursales.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0e1420] border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-4 px-4">Producto</th>
                    <th className="py-4 px-3">Sucursal Almacén</th>
                    <th className="py-4 px-3">Ubicación Góndola</th>
                    <th className="py-4 px-3 text-center">Stock Mínimo</th>
                    <th className="py-4 px-3 text-center">Stock Actual</th>
                    <th className="py-4 px-3 text-center">Estado Operativo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredInventory.map((item) => {
                    const isCritical = item.stock_actual <= (item.stock_minimo_local || 10);
                    const isOptimal = item.stock_actual > (item.stock_minimo_local || 10) * 2;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{item.producto?.nombre}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {item.producto?.sku} | {item.producto?.unidad_medida}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-200">{item.sucursal_nombre}</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                            {item.pasillo_ubicacion}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center font-mono text-slate-400">
                          {item.stock_minimo_local} uds
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                          <span className={isCritical ? "text-rose-400" : isOptimal ? "text-emerald-400" : "text-amber-400"}>
                            {item.stock_actual} uds
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center">
                          {isCritical ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                              Crítico / Reabastecer
                            </span>
                          ) : isOptimal ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Óptimo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              Alerta Regular
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
        </div>
      )}

      {/* Tab Content 2: Kardex */}
      {activeTab === "kardex" && (
        <div className="space-y-4">
          <div className="rounded-xl bg-[#111827] border border-slate-800 overflow-hidden shadow-xs">
            <div className="p-3.5 sm:p-4 bg-[#0e1420] border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Libro Mayor de Kardex (Trazabilidad Total)
              </h4>
              <span className="text-xs text-slate-400">Total movimientos: <strong className="text-white font-mono">{movimientos.length}</strong></span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0e1420] border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-4 px-4">Fecha / Hora</th>
                    <th className="py-4 px-3">Tipo Movimiento</th>
                    <th className="py-4 px-3">Producto</th>
                    <th className="py-4 px-3">Origen / Destino</th>
                    <th className="py-4 px-3 text-center">Cantidad</th>
                    <th className="py-4 px-3">Referencia & Motivo</th>
                    <th className="py-4 px-4">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {movimientos.map((m) => {
                    let badgeClass = "bg-slate-800 text-slate-300";
                    let sign = "";

                    if (m.tipo_movimiento.includes("entrada")) {
                      badgeClass = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
                      sign = "+";
                    } else if (m.tipo_movimiento.includes("salida") || m.tipo_movimiento === "ajuste_merma") {
                      badgeClass = "bg-rose-500/20 text-rose-300 border border-rose-500/30";
                      sign = "-";
                    } else {
                      badgeClass = "bg-blue-500/20 text-blue-300 border border-blue-500/30";
                    }

                    return (
                      <tr key={m.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {formatDateTime(m.created_at)}
                        </td>

                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeClass}`}>
                            {m.tipo_movimiento.replace("_", " ")}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <p className="font-bold text-white truncate max-w-[180px]">{m.producto_nombre}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{m.producto_sku}</p>
                        </td>

                        <td className="py-3 px-3 text-slate-300 text-[11px]">
                          {m.sucursal_origen_nombre && <div>De: {m.sucursal_origen_nombre}</div>}
                          {m.sucursal_destino_nombre && <div>A: {m.sucursal_destino_nombre}</div>}
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                          <span className={sign === "+" ? "text-emerald-400" : sign === "-" ? "text-rose-400" : "text-white"}>
                            {sign}{m.cantidad} uds
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-mono text-[11px] text-slate-300 font-semibold">{m.referencia_id}</span>
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{m.motivo}</p>
                        </td>

                        <td className="py-3 px-4 text-slate-300 text-[11px]">
                          {m.usuario_nombre}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Traslados entre Sucursales */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Traslado de Mercancía Inter-Sucursal</h3>
              </div>
              <button onClick={() => setIsTransferOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Producto a Transferir *</label>
                <select
                  value={transferData.productoId}
                  onChange={(e) => setTransferData({ ...transferData, productoId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sucursal Origen *</label>
                  <select
                    value={transferData.sucursalOrigenId}
                    onChange={(e) => setTransferData({ ...transferData, sucursalOrigenId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sucursal Destino *</label>
                  <select
                    value={transferData.sucursalDestinoId}
                    onChange={(e) => setTransferData({ ...transferData, sucursalDestinoId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cantidad de Unidades a Mover *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferData.cantidad}
                  onChange={(e) => setTransferData({ ...transferData, cantidad: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Motivo / Orden de Traslado</label>
                <input
                  type="text"
                  value={transferData.motivo}
                  onChange={(e) => setTransferData({ ...transferData, motivo: e.target.value })}
                  placeholder="Ej. Reabastecimiento por alta demanda de fin de semana"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTransferOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Confirmar y Transferir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Merma */}
      {isMermaOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">Ajuste de Inventario por Merma o Avería</h3>
              </div>
              <button onClick={() => setIsMermaOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteMerma} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sucursal Afectada *</label>
                <select
                  value={mermaData.sucursalId}
                  onChange={(e) => setMermaData({ ...mermaData, sucursalId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  {sucursales.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Producto Dañado / Descartado *</label>
                <select
                  value={mermaData.productoId}
                  onChange={(e) => setMermaData({ ...mermaData, productoId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cantidad a Dar de Baja *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={mermaData.cantidad}
                  onChange={(e) => setMermaData({ ...mermaData, cantidad: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Causa de la Merma *</label>
                <select
                  value={mermaData.motivo}
                  onChange={(e) => setMermaData({ ...mermaData, motivo: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  <option value="Rotura de empaque en góndola">Rotura de empaque en góndola</option>
                  <option value="Vencimiento de fecha en perecedero">Vencimiento de fecha en perecedero</option>
                  <option value="Falla en equipo de refrigeración">Falla en equipo de refrigeración</option>
                  <option value="Daño durante descarga logística">Daño durante descarga logística</option>
                  <option value="Descuadre en auditoría física">Descuadre en auditoría física</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMermaOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  Confirmar Baja de Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

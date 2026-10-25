"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { Venta, Sucursal, MovimientoStock } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  BarChart3, 
  Download, 
  Printer, 
  Building2, 
  CreditCard, 
  Users, 
  TrendingUp, 
  FileText
} from "lucide-react";

export function ReportsView() {
  const { sucursales, refreshKey } = useApp();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const v = await SuperAhorroDB.getVentas();
      const m = await SuperAhorroDB.getMovimientos();
      setVentas(v);
      setMovimientos(m);
    }
    load();
  }, [refreshKey]);

  const filteredVentas = selectedBranchFilter === "all" 
    ? ventas 
    : ventas.filter(v => v.sucursal_id === selectedBranchFilter);

  const totalVentas = filteredVentas.reduce((sum, v) => sum + v.total, 0);
  const totalIva = filteredVentas.reduce((sum, v) => sum + v.iva, 0);
  const totalDescuentos = filteredVentas.reduce((sum, v) => sum + v.descuento, 0);

  // Ventas agrupadas por método de pago
  const porMetodo = filteredVentas.reduce((acc: Record<string, number>, v) => {
    acc[v.metodo_pago] = (acc[v.metodo_pago] || 0) + v.total;
    return acc;
  }, {});

  // Mermas report
  const mermas = movimientos.filter(m => m.tipo_movimiento === "ajuste_merma");
  const totalMermasQ = mermas.reduce((sum, m) => sum + (m.cantidad * m.costo_unitario), 0);

  // CSV export
  const exportToCSV = () => {
    const headers = "Factura,Sucursal,Cliente,NIT,Cajero,Total,Metodo,Fecha\n";
    const rows = filteredVentas.map(v => 
      `"${v.numero_factura}","${v.sucursal_nombre}","${v.cliente_nombre}","${v.cliente_nit}","${v.cajero_nombre}",${v.total},"${v.metodo_pago}","${v.created_at}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reporte_ventas_superahorro_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Módulo de Inteligencia de Negocio</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Reportes Gerenciales y KPIs de Rendimiento
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cortes de caja, análisis de ventas multisede, recaudación de IVA y balance de mermas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Overview Cards */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">Filtrar Sucursal:</span>
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las 5 Sucursales</option>
            {sucursales.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>Total Facturas: <strong className="text-white">{filteredVentas.length}</strong></span>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recaudación Total</span>
          <h3 className="text-2xl font-black text-emerald-400 font-mono mt-2">
            {formatCurrency(totalVentas)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Ventas brutas consolidadas</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">IVA Fiscal SAT (12%)</span>
          <h3 className="text-2xl font-black text-blue-400 font-mono mt-2">
            {formatCurrency(totalIva)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Crédito/Débito fiscal tributario</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descuentos & Puntos</span>
          <h3 className="text-2xl font-black text-amber-400 font-mono mt-2">
            {formatCurrency(totalDescuentos)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Beneficios otorgados a clientes</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Costos de Merma</span>
          <h3 className="text-2xl font-black text-rose-400 font-mono mt-2">
            {formatCurrency(totalMermasQ)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{mermas.length} bajas registradas</p>
        </div>
      </div>

      {/* Breakdown by Payment Method & Cashier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Distribución por Método de Cobro
          </h4>

          <div className="space-y-3">
            {Object.entries(porMetodo).map(([metodo, monto]) => {
              const pct = totalVentas > 0 ? ((monto / totalVentas) * 100).toFixed(1) : 0;
              return (
                <div key={metodo} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 capitalize">{metodo.replace("_", " ")}</span>
                    <span className="font-mono text-emerald-400 font-bold">{formatCurrency(monto)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div style={{ width: `${pct}%` }} className="h-full bg-emerald-500 rounded-full"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ventas por Sucursal */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            Ventas Totales por Sucursal
          </h4>

          <div className="space-y-3">
            {sucursales.map((suc) => {
              const sucVentas = ventas.filter(v => v.sucursal_id === suc.id).reduce((s, v) => s + v.total, 0);
              const pct = totalVentas > 0 ? ((sucVentas / totalVentas) * 100).toFixed(1) : 0;

              return (
                <div key={suc.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[200px]">{suc.nombre}</span>
                    <span className="font-mono text-white font-bold">{formatCurrency(sucVentas)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div style={{ width: `${pct}%` }} className="h-full bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Historical Sales Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Registro Detallado de Facturas Fiscales
          </h4>
          <span className="text-xs text-slate-400 font-mono">Consolidado general</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-4 px-4">No. Factura</th>
                <th className="py-4 px-3">Sucursal</th>
                <th className="py-4 px-3">Cliente / NIT</th>
                <th className="py-4 px-3">Cajero</th>
                <th className="py-4 px-3">Método Pago</th>
                <th className="py-4 px-3 text-right">Subtotal</th>
                <th className="py-4 px-3 text-right">Total</th>
                <th className="py-4 px-4">Autorización FEL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVentas.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {v.numero_factura}
                    <div className="text-[10px] text-slate-400 font-normal">{formatDate(v.created_at)}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-slate-300 font-medium">{v.sucursal_nombre}</span>
                  </td>

                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-200">{v.cliente_nombre}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{v.cliente_nit}</p>
                  </td>

                  <td className="py-3 px-3 text-slate-300">
                    {v.cajero_nombre}
                  </td>

                  <td className="py-3 px-3 capitalize">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                      {v.metodo_pago.replace("_", " ")}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {formatCurrency(v.subtotal)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                    {formatCurrency(v.total)}
                  </td>

                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400 truncate max-w-[150px]">
                    {v.autorizacion_fel || "Simulado FEL"}
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

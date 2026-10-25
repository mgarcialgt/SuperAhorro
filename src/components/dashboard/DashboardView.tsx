"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { DashboardMetrics, Venta, InventarioSucursal, Lote } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  TrendingUp, 
  Receipt, 
  AlertTriangle, 
  CalendarClock, 
  PackageSearch, 
  ArrowUpRight, 
  Building2,
  ShoppingCart,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export function DashboardView() {
  const { currentSucursal, refreshKey, setActiveModule } = useApp();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentSales, setRecentSales] = useState<Venta[]>([]);
  const [criticalStock, setCriticalStock] = useState<InventarioSucursal[]>([]);
  const [expiringBatches, setExpiringBatches] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const m = await SuperAhorroDB.getDashboardMetrics(currentSucursal?.id);
      const sales = await SuperAhorroDB.getVentas(currentSucursal?.id);
      const inv = await SuperAhorroDB.getInventario(currentSucursal?.id);
      const lotes = await SuperAhorroDB.getLotes(currentSucursal?.id);

      setMetrics(m);
      setRecentSales(sales.slice(0, 5));

      // Items en stock crítico (menor o igual al mínimo)
      const critical = inv.filter(i => i.stock_actual <= (i.stock_minimo_local || 10)).slice(0, 4);
      setCriticalStock(critical);

      // Lotes próximos a vencer (menos de 15 días)
      const nowTime = new Date().getTime();
      const expiring = lotes.filter(l => {
        const expTime = new Date(l.fecha_vencimiento).getTime();
        const diff = Math.ceil((expTime - nowTime) / (1000 * 3600 * 24));
        return diff <= 15 && l.cantidad_disponible > 0;
      }).slice(0, 4);
      setExpiringBatches(expiring);

      setLoading(false);
    }

    loadData();
  }, [currentSucursal, refreshKey]);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Cargando métricas de SuperAhorro S.A...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner de Bienvenida y Filtro Activo */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Tablero de Control Gerencial
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentSucursal?.nombre || "SuperAhorro S.A."}
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Monitoreo transaccional en tiempo real, inventario multisede, rotación de productos y trazabilidad de lotes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveModule("pos")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-950/40"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Abrir Caja POS</span>
            </button>
            <button
              onClick={() => setActiveModule("inventario")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition"
            >
              <PackageSearch className="w-4 h-4" />
              <span>Matriz de Inventario</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Ventas Hoy */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas de Hoy</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {formatCurrency(metrics.ventas_totales_hoy)}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="flex items-center font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{metrics.comparativo_semana_anterior_pct}%
              </span>
              <span className="text-slate-400">vs. semana anterior</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Transacciones y Ticket Promedio */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {formatCurrency(metrics.ticket_promedio)}
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              <span className="font-bold text-slate-200">{metrics.transacciones_hoy}</span> transacciones registradas hoy
            </p>
          </div>
        </div>

        {/* KPI 3: Stock Crítico Alertas */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Crítico</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-300">
              {metrics.productos_stock_critico} <span className="text-sm font-normal text-slate-400">productos</span>
            </h3>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Bajo umbral de stock mínimo local
            </p>
          </div>
        </div>

        {/* KPI 4: Lotes Próximos a Vencer */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lotes por Vencer</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-300">
              {metrics.lotes_por_vencer} <span className="text-sm font-normal text-slate-400">lotes</span>
            </h3>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              Caducan en menos de 15 días
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos Visuales y Comparativa Semanal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Ventas Semanal por Día */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-white">Comportamiento Semanal de Ventas</h4>
              <p className="text-xs text-slate-400">Total transaccionado en quetzales por día de la semana</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Semana Actual
            </span>
          </div>

          {/* Bar Chart Representation with SVG */}
          <div className="space-y-4">
            <div className="h-56 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 border-b border-slate-800">
              {[
                { dia: "Lun", val: 840, pct: 45 },
                { dia: "Mar", val: 1120, pct: 60 },
                { dia: "Mié", val: 980, pct: 52 },
                { dia: "Jue", val: 1450, pct: 78 },
                { dia: "Vie", val: 1890, pct: 100 },
                { dia: "Sáb", val: 2150, pct: 115 },
                { dia: "Hoy", val: metrics.ventas_totales_hoy || 950, pct: 70, today: true },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition truncate">
                    Q{item.val}
                  </span>
                  <div
                    style={{ height: `${Math.min(100, Math.max(15, (item.val / 2200) * 100))}%` }}
                    className={`w-full max-w-[42px] rounded-t-lg transition-all duration-500 ${
                      item.today
                        ? "bg-gradient-to-t from-emerald-600 to-teal-400 shadow-lg shadow-emerald-900/40"
                        : "bg-slate-700/80 hover:bg-slate-600"
                    }`}
                  ></div>
                  <span className={`text-xs font-medium ${item.today ? "font-bold text-emerald-400" : "text-slate-400"}`}>
                    {item.dia}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Pico de afluencia: Viernes y Sábado</span>
              <span className="font-semibold text-emerald-400">Meta Semanal Superada en 112%</span>
            </div>
          </div>
        </div>

        {/* Participación por Categoría */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white mb-1">Ventas por Categoría</h4>
            <p className="text-xs text-slate-400 mb-5">Participación estimada de inventario vendido</p>

            <div className="space-y-4">
              {[
                { cat: "Lácteos y Huevos", pct: 32, color: "bg-blue-500" },
                { cat: "Abarrotes y Despensa", pct: 28, color: "bg-amber-500" },
                { cat: "Carnes y Aves", pct: 18, color: "bg-rose-500" },
                { cat: "Bebidas y Refrescos", pct: 14, color: "bg-cyan-500" },
                { cat: "Otros", pct: 8, color: "bg-purple-500" },
              ].map((item) => (
                <div key={item.cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.cat}</span>
                    <span className="font-bold text-white font-mono">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${item.pct}%` }}
                      className={`h-full rounded-full ${item.color}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Mayor rotación:</span>
            <span className="font-semibold text-slate-200">Lácteos Trebolac 1L</span>
          </div>
        </div>
      </div>

      {/* Secciones de Alertas de Inventario & Últimas Ventas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Widget 1: Alertas de Stock Crítico y Vencimientos */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Alertas Operativas de Inventario</h4>
                <p className="text-xs text-slate-400">Rotura inminente y control de caducidad</p>
              </div>
            </div>
            <button
              onClick={() => setActiveModule("lotes")}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Ver Lotes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lotes por vencer */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5" />
              Productos Próximos a Vencer (Cadena de Perecederos)
            </h5>
            {expiringBatches.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No hay lotes con fecha crítica de caducidad.</p>
            ) : (
              expiringBatches.map((lote) => (
                <div
                  key={lote.id}
                  className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-rose-200">{lote.producto_nombre}</p>
                    <p className="text-[11px] text-rose-300/80">
                      Lote: <span className="font-mono">{lote.numero_lote}</span> | Disp: <span className="font-bold">{lote.cantidad_disponible} uds</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                      Vence: {formatDate(lote.fecha_vencimiento)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Stock mínimo crítico */}
          <div className="space-y-2.5 pt-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Productos con Existencias Bajas
            </h5>
            {criticalStock.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">Todas las líneas se encuentran sobre el stock mínimo.</p>
            ) : (
              criticalStock.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-amber-200">{inv.producto?.nombre || "Producto"}</p>
                    <p className="text-[11px] text-amber-300/80">
                      Ubicación: {inv.pasillo_ubicacion} | Mínimo requerido: {inv.stock_minimo_local} uds
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs">
                      {inv.stock_actual} uds
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 2: Últimas Ventas en Tiempo Real */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-sm font-bold text-white">Últimas Transacciones Registradas</h4>
              <p className="text-xs text-slate-400">Emisión de facturas y boletas en mostrador</p>
            </div>
            <button
              onClick={() => setActiveModule("reportes")}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Ver Reporte</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentSales.map((v) => (
              <div
                key={v.id}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between gap-3 hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="truncate text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{v.numero_factura}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                        {v.metodo_pago.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-slate-400 truncate mt-0.5">
                      Cliente: <span className="text-slate-200">{v.cliente_nombre}</span> ({v.cliente_nit})
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold text-emerald-400 text-sm font-mono">
                    {formatCurrency(v.total)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

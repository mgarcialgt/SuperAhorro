"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { OrdenCompra, Proveedor, Sucursal, Producto } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  Truck, 
  Plus, 
  CheckCircle, 
  Clock, 
  X, 
  Building2, 
  PackageCheck,
  Search,
  Eye
} from "lucide-react";

export function PurchasesView() {
  const { currentSucursal, sucursales, refreshKey, refreshData, showNotification, currentUser } = useApp();
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [receivingOrder, setReceivingOrder] = useState<OrdenCompra | null>(null);

  // New order form
  const [newOrderData, setNewOrderData] = useState({
    proveedor_id: "",
    sucursal_destino_id: currentSucursal?.id || "",
    fecha_esperada: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
    notas: "Reabastecimiento regular de inventario",
    detalles: [
      {
        producto_id: "",
        producto_nombre: "",
        producto_sku: "",
        cantidad_solicitada: 50,
        costo_unitario: 10.50,
        subtotal: 525.00,
        numero_lote: `LOT-${Date.now().toString().slice(-5)}`,
        fecha_vencimiento: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
      }
    ]
  });

  useEffect(() => {
    async function load() {
      const ords = await SuperAhorroDB.getOrdenesCompra();
      const provs = await SuperAhorroDB.getProveedores();
      const prods = await SuperAhorroDB.getProductos();
      setOrdenes(ords);
      setProveedores(provs);
      setProductos(prods);

      if (provs.length > 0 && prods.length > 0 && !newOrderData.proveedor_id) {
        setNewOrderData(prev => ({
          ...prev,
          proveedor_id: provs[0].id,
          sucursal_destino_id: currentSucursal?.id || sucursales[0]?.id || "",
          detalles: [
            {
              producto_id: prods[0].id,
              producto_nombre: prods[0].nombre,
              producto_sku: prods[0].sku,
              cantidad_solicitada: 50,
              costo_unitario: prods[0].costo_promedio,
              subtotal: 50 * prods[0].costo_promedio,
              numero_lote: `LOT-${Date.now().toString().slice(-5)}`,
              fecha_vencimiento: new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0],
            }
          ]
        }));
      }
    }
    load();
  }, [refreshKey, currentSucursal, sucursales]);

  // Handle Save New Order
  const handleSaveNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const prov = proveedores.find(p => p.id === newOrderData.proveedor_id);
    const suc = sucursales.find(s => s.id === newOrderData.sucursal_destino_id);

    const subtotal = newOrderData.detalles.reduce((sum, d) => sum + d.subtotal, 0);
    const iva = Number(((subtotal * 0.12) / 1.12).toFixed(2));
    const total = subtotal;

    try {
      await SuperAhorroDB.saveOrdenCompra({
        ...newOrderData,
        proveedor_nombre: prov?.nombre_comercial,
        sucursal_destino_nombre: suc?.nombre,
        estado: "solicitada",
        subtotal,
        iva,
        total,
      }, currentUser?.nombre_completo || "Compras");

      showNotification("success", "Orden de Compra Creada", `Orden enviada al proveedor ${prov?.nombre_comercial}`);
      setIsNewModalOpen(false);
      refreshData();
    } catch (err: any) {
      showNotification("error", "Error", err.message || "No se pudo generar la orden");
    }
  };

  // Handle Reception of Order
  const handleConfirmReception = async (ordenId: string) => {
    try {
      await SuperAhorroDB.recibirOrdenCompra(ordenId, currentUser?.nombre_completo || "Encargado Bodega");
      showNotification("success", "Mercancía Ingresada al Almacén", "Las existencias y lotes fueron incorporados al inventario de la sucursal");
      setReceivingOrder(null);
      refreshData();
    } catch (err: any) {
      showNotification("error", "Error en Recepción", err.message || "Fallo al procesar ingreso de mercancía");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Truck className="w-4 h-4" />
            <span>Módulo de Abastecimiento</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Órdenes de Compra y Recepción
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestión de pedidos a proveedores mayoristas, actualización de costos y recepción directa al inventario.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden de Compra</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-4 px-4">No. Orden</th>
                <th className="py-4 px-3">Proveedor</th>
                <th className="py-4 px-3">Sede Destino</th>
                <th className="py-4 px-3">Emisión / Esperada</th>
                <th className="py-4 px-3 text-right">Monto Total</th>
                <th className="py-4 px-3 text-center">Estado</th>
                <th className="py-4 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {ordenes.map((o) => {
                const isRecibida = o.estado === "recibida";

                return (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-white text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {o.numero_orden}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">Por: {o.creado_por}</p>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-200">{o.proveedor_nombre}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-300">{o.sucursal_destino_nombre}</span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      <div>Emi: {formatDate(o.fecha_emision)}</div>
                      <div>Esp: {formatDate(o.fecha_esperada)}</div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(o.total)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {isRecibida ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Recibida en Bodega
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          <Clock className="w-3 h-3" />
                          Pendiente de Entrega
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {!isRecibida ? (
                        <button
                          onClick={() => setReceivingOrder(o)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition mx-auto"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Recibir en Almacén</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Ingresado ({formatDate(o.fecha_recepcion)})
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

      {/* Modal de Crear Nueva Orden */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Crear Orden de Compra a Proveedor</h3>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewOrder} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Proveedor *</label>
                  <select
                    value={newOrderData.proveedor_id}
                    onChange={(e) => setNewOrderData({ ...newOrderData, proveedor_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    {proveedores.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre_comercial}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sucursal Destino *</label>
                  <select
                    value={newOrderData.sucursal_destino_id}
                    onChange={(e) => setNewOrderData({ ...newOrderData, sucursal_destino_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    {sucursales.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Producto a Solicitar *</label>
                <select
                  value={newOrderData.detalles[0].producto_id}
                  onChange={(e) => {
                    const selProd = productos.find(p => p.id === e.target.value);
                    if (selProd) {
                      setNewOrderData({
                        ...newOrderData,
                        detalles: [{
                          ...newOrderData.detalles[0],
                          producto_id: selProd.id,
                          producto_nombre: selProd.nombre,
                          producto_sku: selProd.sku,
                          costo_unitario: selProd.costo_promedio,
                          subtotal: newOrderData.detalles[0].cantidad_solicitada * selProd.costo_promedio,
                        }]
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                >
                  {productos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cantidad Solicitada (Uds) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newOrderData.detalles[0].cantidad_solicitada}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value) || 1;
                      setNewOrderData({
                        ...newOrderData,
                        detalles: [{
                          ...newOrderData.detalles[0],
                          cantidad_solicitada: qty,
                          subtotal: qty * newOrderData.detalles[0].costo_unitario,
                        }]
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Costo Unitario (Q) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOrderData.detalles[0].costo_unitario}
                    onChange={(e) => {
                      const cost = parseFloat(e.target.value) || 0;
                      setNewOrderData({
                        ...newOrderData,
                        detalles: [{
                          ...newOrderData.detalles[0],
                          costo_unitario: cost,
                          subtotal: newOrderData.detalles[0].cantidad_solicitada * cost,
                        }]
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lote Esperado</label>
                  <input
                    type="text"
                    value={newOrderData.detalles[0].numero_lote}
                    onChange={(e) => {
                      setNewOrderData({
                        ...newOrderData,
                        detalles: [{
                          ...newOrderData.detalles[0],
                          numero_lote: e.target.value,
                        }]
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Vencimiento Estimada</label>
                  <input
                    type="date"
                    value={newOrderData.detalles[0].fecha_vencimiento}
                    onChange={(e) => {
                      setNewOrderData({
                        ...newOrderData,
                        detalles: [{
                          ...newOrderData.detalles[0],
                          fecha_vencimiento: e.target.value,
                        }]
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Total Estimado de la Orden:</span>
                <span className="text-lg font-black font-mono text-emerald-400">
                  {formatCurrency(newOrderData.detalles[0].subtotal)}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Generar Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Recepción */}
      {receivingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <PackageCheck className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">Confirmar Recepción de Mercancía</h3>
            </div>

            <p className="text-xs text-slate-300">
              Al confirmar, las existencias de la orden <strong className="text-white font-mono">{receivingOrder.numero_orden}</strong> ingresarán automáticamente a la sucursal <strong className="text-emerald-400">{receivingOrder.sucursal_destino_nombre}</strong>, actualizando el Kardex y creando el lote respectivo.
            </p>

            <div className="p-3 rounded-xl bg-slate-800/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Proveedor:</span>
                <span className="font-bold text-white">{receivingOrder.proveedor_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Mercancía:</span>
                <span className="font-bold text-emerald-400 font-mono">{formatCurrency(receivingOrder.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Items a ingresar:</span>
                <span className="font-bold text-white">{receivingOrder.detalles?.length || 1} producto(s)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setReceivingOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmReception(receivingOrder.id)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Aceptar y Cargar Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

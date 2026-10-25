"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { Promocion, Categoria } from "@/types";
import { formatDate } from "@/lib/utils";
import { 
  Tag, 
  Plus, 
  Calendar, 
  Percent, 
  CheckCircle2, 
  X,
  Sparkles
} from "lucide-react";

export function PromotionsView() {
  const { refreshKey, refreshData, showNotification, currentUser } = useApp();
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Promocion>>({
    titulo: "",
    descripcion: "",
    tipo: "porcentaje",
    valor_descuento: 15,
    categoria_id: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
    activo: true,
  });

  useEffect(() => {
    async function load() {
      const data = await SuperAhorroDB.getPromociones();
      const cats = await SuperAhorroDB.getCategorias();
      setPromociones(data);
      setCategorias(cats);

      if (cats.length > 0 && !formData.categoria_id) {
        setFormData(prev => ({ ...prev, categoria_id: cats[0].id }));
      }
    }
    load();
  }, [refreshKey]);

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo) {
      showNotification("error", "Campo requerido", "El título de la promoción es obligatorio");
      return;
    }

    try {
      const cat = categorias.find(c => c.id === formData.categoria_id);
      await SuperAhorroDB.savePromocion({
        ...formData,
        categoria_nombre: cat?.nombre,
      }, currentUser?.nombre_completo);

      showNotification("success", "Promoción Activada", `${formData.titulo} ya está vigente en cajas POS`);
      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      showNotification("error", "Error", err.message || "Fallo al guardar promoción");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Tag className="w-4 h-4" />
            <span>Motor de Precios y Campañas</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Políticas de Precios y Promociones Dinámicas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configuración de descuentos automáticos en mostrador POS por categoría o línea de producto.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Promoción</span>
        </button>
      </div>

      {/* Promotions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {promociones.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl flex flex-col justify-between hover:border-emerald-500/40 transition relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-emerald-500/10 to-transparent pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
                  <Percent className="w-3.5 h-3.5" />
                  {p.valor_descuento}% Descuento
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Activa
                </span>
              </div>

              <h3 className="font-bold text-white text-base leading-snug">{p.titulo}</h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{p.descripcion}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500">Aplica a:</span>
                  <span className="font-semibold text-slate-200">{p.categoria_nombre || "Categoría General"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span>Vigencia:</span>
                  <span>{formatDate(p.fecha_inicio)} al {formatDate(p.fecha_fin)}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Aplicación en caja
              </span>
              <span className="text-slate-400 text-[11px]">Automático POS</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Crear Regla de Promoción</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título de la Campaña *</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej. Quincena de Ahorro en Carnes"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción / Términos</label>
                <textarea
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Aplica en carnicería y embutidos de 1 lb en adelante"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría Destino</label>
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">% de Descuento *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={formData.valor_descuento}
                    onChange={(e) => setFormData({ ...formData, valor_descuento: parseInt(e.target.value) || 10 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-bold"
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
                  Activar Promoción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

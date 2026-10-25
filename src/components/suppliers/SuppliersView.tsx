"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { Proveedor } from "@/types";
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Edit3, 
  X, 
  Calendar,
  Truck
} from "lucide-react";

export function SuppliersView() {
  const { refreshKey, refreshData, showNotification, currentUser, setActiveModule } = useApp();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Partial<Proveedor> | null>(null);

  const [formData, setFormData] = useState<Partial<Proveedor>>({
    nit: "",
    razon_social: "",
    nombre_comercial: "",
    contacto_nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    dias_credito: 30,
  });

  useEffect(() => {
    async function load() {
      const data = await SuperAhorroDB.getProveedores();
      setProveedores(data);
    }
    load();
  }, [refreshKey]);

  const handleOpenModal = (prov?: Proveedor) => {
    if (prov) {
      setEditingProveedor(prov);
      setFormData(prov);
    } else {
      setEditingProveedor(null);
      setFormData({
        nit: `${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(Math.random() * 9)}`,
        razon_social: "",
        nombre_comercial: "",
        contacto_nombre: "",
        email: "",
        telefono: "+502 ",
        direccion: "Zona Industrial, Guatemala",
        dias_credito: 30,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.razon_social || !formData.nit) {
      showNotification("error", "Campos requeridos", "El NIT y la Razón Social son obligatorios");
      return;
    }

    try {
      await SuperAhorroDB.saveProveedor(formData, currentUser?.nombre_completo);
      showNotification("success", "Proveedor Guardado", `${formData.nombre_comercial || formData.razon_social} registrado exitosamente`);
      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      showNotification("error", "Error", err.message || "Fallo al guardar proveedor");
    }
  };

  const filtered = proveedores.filter((p) => {
    return (
      p.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nit.includes(searchTerm) ||
      (p.nombre_comercial && p.nombre_comercial.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Directorio de Proveedores y Fabricantes</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Gestión de Proveedores y Plazos de Crédito
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Condiciones comerciales, contactos y canales de abastecimiento directo a supermercado.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Proveedor</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por NIT o razón social..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            Proveedores activos: <strong className="text-white font-mono">{filtered.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-4 px-4">Proveedor / Razón Social</th>
                <th className="py-4 px-3">NIT Fiscal</th>
                <th className="py-4 px-3">Contacto Comercial</th>
                <th className="py-4 px-3">Medios de Contacto</th>
                <th className="py-4 px-3 text-center">Plazo de Crédito</th>
                <th className="py-4 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-white text-xs">{p.nombre_comercial || p.razon_social}</p>
                    <p className="text-[11px] text-slate-400">{p.razon_social}</p>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                      {p.nit}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-200">{p.contacto_nombre}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{p.direccion}</p>
                  </td>

                  <td className="py-3 px-3 text-[11px] space-y-0.5 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{p.telefono}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-400 truncate max-w-[160px]">{p.email}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                      <Calendar className="w-3 h-3" />
                      {p.dias_credito} días
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setActiveModule("compras")}
                        title="Crear orden para este proveedor"
                        className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition"
                      >
                        <Truck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(p)}
                        title="Editar datos de proveedor"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  {editingProveedor ? "Editar Proveedor" : "Registrar Proveedor Mayorista"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProveedor} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Comercial *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre_comercial}
                    onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
                    placeholder="Ej. Trebolac Lácteos"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">NIT Fiscal *</label>
                  <input
                    type="text"
                    required
                    value={formData.nit}
                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                    placeholder="Ej. 1234567-8"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Razón Social *</label>
                <input
                  type="text"
                  required
                  value={formData.razon_social}
                  onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                  placeholder="Ej. Lácteos Trebolac Sociedad Anónima"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contacto Ejecutivo</label>
                  <input
                    type="text"
                    value={formData.contacto_nombre}
                    onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })}
                    placeholder="Ej. Lic. Fernando Prado"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Días de Crédito</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.dias_credito}
                    onChange={(e) => setFormData({ ...formData, dias_credito: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+502 2400-0000"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Pedidos</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="pedidos@proveedor.gt"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
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
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

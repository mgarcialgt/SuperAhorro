"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { Cliente, NivelFidelizacion } from "@/types";
import { 
  Users, 
  Plus, 
  Search, 
  Sparkles, 
  Award, 
  Phone, 
  Mail, 
  Edit3, 
  X,
  CreditCard
} from "lucide-react";

export function CustomersView() {
  const { refreshKey, refreshData, showNotification, currentUser } = useApp();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Partial<Cliente> | null>(null);

  const [formData, setFormData] = useState<Partial<Cliente>>({
    tipo_documento: "NIT",
    numero_documento: "",
    nombre_completo: "",
    email: "",
    telefono: "",
    direccion: "Ciudad de Guatemala",
    puntos_acumulados: 0,
    nivel_fidelizacion: "Bronce",
  });

  useEffect(() => {
    async function load() {
      const data = await SuperAhorroDB.getClientes();
      setClientes(data);
    }
    load();
  }, [refreshKey]);

  const handleOpenModal = (cli?: Cliente) => {
    if (cli) {
      setEditingCliente(cli);
      setFormData(cli);
    } else {
      setEditingCliente(null);
      setFormData({
        tipo_documento: "NIT",
        numero_documento: `${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(Math.random() * 9)}`,
        nombre_completo: "",
        email: "",
        telefono: "+502 ",
        direccion: "Ciudad de Guatemala",
        puntos_acumulados: 50,
        nivel_fidelizacion: "Bronce",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_completo || !formData.numero_documento) {
      showNotification("error", "Datos incompletos", "El nombre y documento son obligatorios");
      return;
    }

    try {
      await SuperAhorroDB.saveCliente(formData, currentUser?.nombre_completo);
      showNotification(
        "success", 
        editingCliente ? "Cliente Actualizado" : "Cliente Afiliado", 
        `${formData.nombre_completo} afiliado al Club SuperAhorro.`
      );
      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      showNotification("error", "Error", err.message || "No se pudo guardar el cliente");
    }
  };

  const filteredClientes = clientes.filter((c) => {
    return (
      c.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numero_documento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Club de Clientes y Fidelización</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Programa de Puntos y Fidelización
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            1 punto por cada Q10.00 consumidos | 100 puntos = Q10.00 de descuento directo en caja POS.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Afiliar Nuevo Cliente</span>
        </button>
      </div>

      {/* Loyalty Tiers Preview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { nivel: "Bronce", req: "0 - 149 pts", benefit: "Acumula 1x puntos", color: "from-amber-800 to-amber-950 border-amber-700/50 text-amber-200" },
          { nivel: "Plata", req: "150 - 399 pts", benefit: "Canje exprés + 5% extra", color: "from-slate-600 to-slate-800 border-slate-500/50 text-slate-200" },
          { nivel: "Oro", req: "400 - 799 pts", benefit: "Doble puntaje fines de semana", color: "from-yellow-600 to-amber-800 border-yellow-500/50 text-yellow-200" },
          { nivel: "Diamante", req: "800+ pts", benefit: "Atención prioritaria y cupones", color: "from-cyan-600 to-blue-900 border-cyan-500/50 text-cyan-200" },
        ].map((t) => (
          <div key={t.nivel} className={`p-4 rounded-2xl bg-gradient-to-br ${t.color} border shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-sm tracking-wider uppercase">{t.nivel}</span>
              <Award className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-xs font-mono font-bold">{t.req}</p>
            <p className="text-[10px] opacity-80 mt-1">{t.benefit}</p>
          </div>
        ))}
      </div>

      {/* Search and Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por NIT, DPI o nombre de cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">
            Clientes registrados: <strong className="text-white font-mono">{filteredClientes.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-4 px-4">Cliente</th>
                <th className="py-4 px-3">Identificación</th>
                <th className="py-4 px-3">Contacto</th>
                <th className="py-4 px-3 text-center">Puntos Acumulados</th>
                <th className="py-4 px-3 text-center">Nivel Club</th>
                <th className="py-4 px-3 text-right">Valor Canjeable</th>
                <th className="py-4 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredClientes.map((c) => {
                const valorQ = ((c.puntos_acumulados / 100) * 10).toFixed(2);

                return (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-white text-xs">{c.nombre_completo}</p>
                      <p className="text-[11px] text-slate-400">{c.direccion}</p>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                        {c.tipo_documento}: {c.numero_documento}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[11px] space-y-0.5 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{c.telefono || "No registrado"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-400 truncate max-w-[150px]">{c.email || "N/A"}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-sm text-amber-300">
                      {c.puntos_acumulados} <span className="text-[10px] font-normal text-slate-400">pts</span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        c.nivel_fidelizacion === "Diamante"
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : c.nivel_fidelizacion === "Oro"
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                          : c.nivel_fidelizacion === "Plata"
                          ? "bg-slate-500/20 text-slate-200 border-slate-500/40"
                          : "bg-amber-800/20 text-amber-300 border-amber-700/40"
                      }`}>
                        {c.nivel_fidelizacion}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-xs">
                      Q{valorQ}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Afiliar / Editar Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  {editingCliente ? "Editar Cliente" : "Afiliar Cliente al Club SuperAhorro"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCliente} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  placeholder="Ej. Juan Carlos Perez"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo Doc.</label>
                  <select
                    value={formData.tipo_documento}
                    onChange={(e) => setFormData({ ...formData, tipo_documento: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="NIT">NIT</option>
                    <option value="DPI">DPI (CUI)</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">No. Documento *</label>
                  <input
                    type="text"
                    required
                    value={formData.numero_documento}
                    onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
                    placeholder="Ej. 7894561-2 o CF"
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
                    placeholder="+502 5555-0000"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cliente@email.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Puntos Acumulados Iniciales</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.puntos_acumulados}
                    onChange={(e) => setFormData({ ...formData, puntos_acumulados: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nivel Club</label>
                  <select
                    value={formData.nivel_fidelizacion}
                    onChange={(e) => setFormData({ ...formData, nivel_fidelizacion: e.target.value as NivelFidelizacion })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    <option value="Bronce">Bronce</option>
                    <option value="Plata">Plata</option>
                    <option value="Oro">Oro</option>
                    <option value="Diamante">Diamante</option>
                  </select>
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
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

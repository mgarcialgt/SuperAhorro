"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { Producto, Categoria, Marca } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Barcode, 
  X, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

export function ProductView() {
  const { refreshKey, refreshData, showNotification, currentUser } = useApp();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Producto> | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<Producto>>({
    nombre: "",
    sku: "",
    barcode: "",
    descripcion: "",
    categoria_id: "",
    marca_id: "",
    unidad_medida: "Unidad",
    costo_promedio: 0,
    precio_venta: 0,
    precio_mayoreo: 0,
    stock_minimo: 10,
    stock_maximo: 200,
    es_perecedero: false,
    imagen_url: "",
  });

  useEffect(() => {
    async function load() {
      const prods = await SuperAhorroDB.getProductos();
      const cats = await SuperAhorroDB.getCategorias();
      const brs = await SuperAhorroDB.getMarcas();
      setProductos(prods);
      setCategorias(cats);
      setMarcas(brs);
    }
    load();
  }, [refreshKey]);

  const filteredProducts = productos.filter((p) => {
    const matchesSearch = 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || p.categoria_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (prod?: Producto) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData(prod);
    } else {
      setEditingProduct(null);
      setFormData({
        nombre: "",
        sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
        barcode: `740100${Math.floor(1000000 + Math.random() * 9000000)}`,
        descripcion: "",
        categoria_id: categorias[0]?.id || "",
        marca_id: marcas[0]?.id || "",
        unidad_medida: "Unidad",
        costo_promedio: 10.00,
        precio_venta: 15.00,
        precio_mayoreo: 13.50,
        stock_minimo: 15,
        stock_maximo: 300,
        es_perecedero: false,
        imagen_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio_venta) {
      showNotification("error", "Datos incompletos", "El nombre y precio de venta son requeridos");
      return;
    }

    try {
      const selectedCat = categorias.find(c => c.id === formData.categoria_id);
      const selectedMarca = marcas.find(m => m.id === formData.marca_id);

      await SuperAhorroDB.saveProducto({
        ...formData,
        categoria_nombre: selectedCat?.nombre,
        marca_nombre: selectedMarca?.nombre,
      }, currentUser?.nombre_completo);

      showNotification(
        "success", 
        editingProduct ? "Producto Actualizado" : "Producto Registrado", 
        `${formData.nombre} ha sido guardado exitosamente.`
      );
      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      showNotification("error", "Error", err.message || "No se pudo guardar el producto");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar el producto "${name}"?`)) {
      await SuperAhorroDB.deleteProducto(id, currentUser?.nombre_completo);
      showNotification("info", "Producto Eliminado", `${name} fue retirado del catálogo.`);
      refreshData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Package className="w-4 h-4" />
            <span>Módulo de Productos</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Catálogo Central de Supermercado
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Administración unificada de SKUs, códigos de barra EAN-13, precios de venta e impuestos.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o código de barra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las Categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            Total: <span className="font-bold text-white font-mono">{filteredProducts.length}</span>
          </span>
        </div>
      </div>

      {/* Product Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-4 px-4">Producto</th>
                <th className="py-4 px-3">SKU & Código EAN</th>
                <th className="py-4 px-3">Categoría / Marca</th>
                <th className="py-4 px-3 text-right">Costo Prom.</th>
                <th className="py-4 px-3 text-right">Precio Venta</th>
                <th className="py-4 px-3 text-center">Tipo</th>
                <th className="py-4 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No se encontraron productos con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                          {p.imagen_url ? (
                            <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold">
                              IMG
                            </div>
                          )}
                        </div>
                        <div className="truncate max-w-[240px]">
                          <p className="font-bold text-white truncate">{p.nombre}</p>
                          <p className="text-[11px] text-slate-400 truncate">{p.descripcion || p.unidad_medida}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                          {p.sku}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                          <Barcode className="w-3.5 h-3.5 text-slate-500" />
                          <span>{p.barcode}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div>
                        <span className="font-medium text-slate-200">{p.categoria_nombre || "General"}</span>
                        <p className="text-[11px] text-slate-400">{p.marca_nombre || "SuperAhorro"}</p>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-400">
                      {formatCurrency(p.costo_promedio)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(p.precio_venta)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {p.es_perecedero ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          Perecedero
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          Seco / No Perecedero
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(p)}
                          title="Editar producto"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.nombre)}
                          title="Eliminar producto"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Crear / Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  {editingProduct ? "Editar Producto" : "Registrar Nuevo Producto en Catálogo"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Comercial del Producto *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Leche Semidescremada 1L Tetra Pak"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Código de Barras (EAN-13) *</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={formData.categoria_id}
                    onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Marca</label>
                  <select
                    value={formData.marca_id}
                    onChange={(e) => setFormData({ ...formData, marca_id: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {marcas.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Costo de Compra Promedio (Q)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costo_promedio}
                    onChange={(e) => setFormData({ ...formData, costo_promedio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Precio de Venta al Público (Q) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.precio_venta}
                    onChange={(e) => setFormData({ ...formData, precio_venta: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unidad de Medida</label>
                  <select
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Unidad">Unidad</option>
                    <option value="Litro">Litro</option>
                    <option value="Kg">Kilogramo / Libra</option>
                    <option value="Paquete">Paquete</option>
                    <option value="Caja">Caja</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                    <input
                      type="checkbox"
                      checked={formData.es_perecedero}
                      onChange={(e) => setFormData({ ...formData, es_perecedero: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-800 border-slate-700"
                    />
                    <span>Producto Perecedero (Requiere Lote y Vencimiento)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

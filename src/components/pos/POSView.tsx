"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { SuperAhorroDB } from "@/lib/storage";
import { Producto, Cliente, CartItem, Venta, InventarioSucursal } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  ShoppingCart, 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  UserCheck, 
  CreditCard, 
  Banknote, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Sparkles,
  ArrowRight,
  Store,
  Keyboard
} from "lucide-react";

export function POSView() {
  const { currentSucursal, currentUser, refreshKey, refreshData, showNotification } = useApp();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [inventario, setInventario] = useState<InventarioSucursal[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Selected customer
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [puntosACanjear, setPuntosACanjear] = useState<number>(0);

  // Mobile cart drawer state
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [metodoPago, setMetodoPago] = useState<Venta["metodo_pago"]>("efectivo");
  const [montoRecibido, setMontoRecibido] = useState<number>(0);
  const [completedSale, setCompletedSale] = useState<Venta | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Barcode input ref for fast keyboard scanning
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const prods = await SuperAhorroDB.getProductos();
      const inv = await SuperAhorroDB.getInventario(currentSucursal?.id);
      const clis = await SuperAhorroDB.getClientes();
      setProductos(prods);
      setInventario(inv);
      setClientes(clis);

      // Default customer to CF
      if (!selectedCliente && clis.length > 0) {
        setSelectedCliente(clis[0]);
      }
    }
    load();
  }, [refreshKey, currentSucursal]);

  // Keyboard shortcut listener (F2 = Cobrar, F4 = Vaciar, Esc = Cerrar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        handleProceedToPayment();
      } else if (e.key === "F4") {
        e.preventDefault();
        handleClearCart();
      } else if (e.key === "Escape") {
        setIsPaymentModalOpen(false);
        setIsMobileCartOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Stock lookup helper
  const getProductStock = (prodId: string): number => {
    const invItem = inventario.find(i => i.producto_id === prodId && i.sucursal_id === currentSucursal?.id);
    return invItem ? invItem.stock_actual : 0;
  };

  // Add to cart
  const handleAddToCart = (product: Producto) => {
    const stockAvailable = getProductStock(product.id);
    const existingIndex = cart.findIndex(item => item.producto.id === product.id);
    const currentQtyInCart = existingIndex !== -1 ? cart[existingIndex].cantidad : 0;

    if (currentQtyInCart + 1 > stockAvailable) {
      showNotification("warning", "Stock Insuficiente", `Existencias en ${currentSucursal?.nombre}: ${stockAvailable} uds`);
      return;
    }

    if (existingIndex !== -1) {
      const updated = [...cart];
      updated[existingIndex].cantidad += 1;
      const subtotal = updated[existingIndex].cantidad * product.precio_venta;
      const iva = (subtotal * 0.12) / 1.12;
      updated[existingIndex].subtotal = subtotal;
      updated[existingIndex].iva = Number(iva.toFixed(2));
      updated[existingIndex].total = subtotal;
      setCart(updated);
    } else {
      const subtotal = product.precio_venta;
      const iva = (subtotal * 0.12) / 1.12;
      setCart([
        ...cart,
        {
          producto: product,
          cantidad: 1,
          precio_unitario: product.precio_venta,
          descuento: 0,
          subtotal,
          iva: Number(iva.toFixed(2)),
          total: subtotal,
          stock_disponible: stockAvailable,
        }
      ]);
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const item = cart[index];
    const newQty = item.cantidad + delta;
    const stockAvailable = getProductStock(item.producto.id);

    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }

    if (newQty > stockAvailable) {
      showNotification("warning", "Stock Máximo Alcanzado", `Existencias disponibles: ${stockAvailable} uds`);
      return;
    }

    const updated = [...cart];
    updated[index].cantidad = newQty;
    const subtotal = newQty * item.precio_unitario;
    const iva = (subtotal * 0.12) / 1.12;
    updated[index].subtotal = subtotal;
    updated[index].iva = Number(iva.toFixed(2));
    updated[index].total = subtotal - (updated[index].descuento || 0);
    setCart(updated);
  };

  const handleRemoveItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    if (cart.length > 0 && confirm("¿Deseas vaciar la canasta de compra actual?")) {
      setCart([]);
      setPuntosACanjear(0);
    }
  };

  // Calculations
  const totalUnits = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const subtotalCart = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const descuentoPuntos = (puntosACanjear / 100) * 10;
  const totalCart = Math.max(0, subtotalCart - descuentoPuntos);
  const ivaCart = Number(((totalCart * 0.12) / 1.12).toFixed(2));

  // Open Payment modal
  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      showNotification("warning", "Canasta Vacía", "Selecciona al menos un producto para cobrar");
      return;
    }
    setMontoRecibido(totalCart);
    setIsMobileCartOpen(false);
    setIsPaymentModalOpen(true);
  };

  // Process transaction
  const handleFinalizeSale = async () => {
    if (!currentSucursal) return;
    if (metodoPago === "efectivo" && montoRecibido < totalCart) {
      showNotification("error", "Efectivo Insuficiente", "El dinero recibido debe ser igual o superior al total");
      return;
    }

    setIsProcessing(true);
    try {
      const venta = await SuperAhorroDB.procesarVentaPOS({
        sucursal_id: currentSucursal.id,
        caja_id: "20000000-0000-0000-0000-000000000001",
        cliente_id: selectedCliente?.id,
        cliente_nombre: selectedCliente?.nombre_completo || "Consumidor Final",
        cliente_nit: selectedCliente?.numero_documento || "CF",
        cajero_nombre: currentUser?.nombre_completo || "Cajero Principal",
        items: cart,
        metodo_pago: metodoPago,
        monto_recibido: montoRecibido,
        puntos_a_canjear: puntosACanjear,
      });

      setCompletedSale(venta);
      setCart([]);
      setPuntosACanjear(0);
      showNotification("success", "Venta Completada", `Factura ${venta.numero_factura} emitida exitosamente`);
      refreshData();
    } catch (err: any) {
      showNotification("error", "Fallo al procesar venta", err.message || "Error al descontar inventario");
    } finally {
      setIsProcessing(false);
    }
  };

  // Barcode / Name search filter
  const filteredProducts = productos.filter((p) => {
    const matchesSearch = 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "all" || p.categoria_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Fast Barcode Enter Handler
  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      const exactMatch = productos.find(p => p.barcode === searchTerm.trim() || p.sku.toLowerCase() === searchTerm.trim().toLowerCase());
      if (exactMatch) {
        handleAddToCart(exactMatch);
        setSearchTerm("");
        showNotification("info", "Producto Agregado", `${exactMatch.nombre}`);
      }
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 pb-16 lg:pb-0">
      {/* Top Header Card (Enterprise Retail Style) */}
      <div className="rounded-xl bg-[#111827] border border-slate-800 p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Caja de Cobro POS</h2>
              <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Turno Abierto
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sede: <strong className="text-emerald-400">{currentSucursal?.nombre.replace("SuperAhorro ", "")}</strong> • Cajero: <strong className="text-slate-200">{currentUser?.nombre_completo.split(" ")[0]}</strong>
            </p>
          </div>
        </div>

        {/* Customer Selector & Quick Shortcuts Help */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Customer selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 w-full sm:w-auto">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedCliente?.id || ""}
              onChange={(e) => {
                const cli = clientes.find(c => c.id === e.target.value);
                setSelectedCliente(cli || null);
                setPuntosACanjear(0);
              }}
              className="bg-transparent text-xs text-slate-100 focus:outline-none w-full sm:w-auto"
            >
              {clientes.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.nombre_completo} ({c.tipo_documento}: {c.numero_documento})
                </option>
              ))}
            </select>
          </div>

          {/* Loyalty Badge */}
          {selectedCliente && selectedCliente.puntos_acumulados > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 font-bold font-mono">{selectedCliente.puntos_acumulados}</span>
              <span className="text-amber-400/80 text-[10px] hidden sm:inline">pts ({selectedCliente.nivel_fidelizacion})</span>
            </div>
          )}

          {/* Keyboard hints tooltip (Desktop only) */}
          <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-400 font-mono bg-slate-800/40 px-2 py-1 rounded-md border border-slate-800">
            <Keyboard className="w-3.5 h-3.5 text-slate-400" />
            <span>F2: Cobrar</span>
            <span>•</span>
            <span>F4: Vaciar</span>
          </div>
        </div>
      </div>

      {/* Main POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Product Grid & Barcode Search (7 cols on Desktop) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Barcode Search Bar */}
          <div className="relative">
            <Barcode className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Escanear código de barras EAN o escribir producto... (Enter)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#111827] border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono shadow-xs"
            />
          </div>

          {/* Product Cards Grid (Responsive 2 cols on mobile, 3 on tablet/desktop) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredProducts.map((p) => {
              const stock = getProductStock(p.id);
              const isOutOfStock = stock <= 0;

              return (
                <button
                  key={p.id}
                  disabled={isOutOfStock}
                  onClick={() => handleAddToCart(p)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition active:scale-[0.98] ${
                    isOutOfStock
                      ? "bg-slate-900/40 border-slate-800/50 opacity-40 cursor-not-allowed"
                      : "bg-[#111827] border-slate-800 hover:border-emerald-500/50 hover:bg-[#151f33] shadow-xs cursor-pointer"
                  }`}
                >
                  <div className="w-full h-20 sm:h-24 rounded-lg bg-slate-800 overflow-hidden mb-2 relative">
                    {p.imagen_url ? (
                      <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold text-xs">
                        IMG
                      </div>
                    )}
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono font-bold text-white">
                      {stock} uds
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-100 text-xs line-clamp-2 leading-tight">
                      {p.nombre}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{p.sku}</p>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-1.5">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {formatCurrency(p.precio_venta)}
                    </span>
                    <span className="w-6 h-6 rounded-md bg-emerald-600/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Desktop Cart Panel (Hidden on mobile unless opened, visible on desktop) */}
        <div className="hidden lg:flex lg:col-span-5 rounded-xl bg-[#111827] border border-slate-800 p-4 flex-col justify-between shadow-xs min-h-[580px]">
          {/* Reusable Cart Contents Component */}
          <CartSectionContent
            cart={cart}
            totalUnits={totalUnits}
            subtotalCart={subtotalCart}
            totalCart={totalCart}
            ivaCart={ivaCart}
            descuentoPuntos={descuentoPuntos}
            selectedCliente={selectedCliente}
            puntosACanjear={puntosACanjear}
            setPuntosACanjear={setPuntosACanjear}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onProceedToPayment={handleProceedToPayment}
          />
        </div>
      </div>

      {/* Floating Bottom Cart Bar for Mobile Devices */}
      <div className="lg:hidden fixed bottom-16 left-3 right-3 z-20">
        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-lg shadow-emerald-950/60 active:scale-98 transition"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            <span>Ver Canasta ({totalUnits} uds)</span>
          </div>
          <span className="font-mono text-sm">{formatCurrency(totalCart)}</span>
        </button>
      </div>

      {/* Mobile Cart Slide-Over Drawer */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in">
          <div className="bg-[#111827] border-t border-slate-700 rounded-t-2xl p-4 max-h-[85vh] flex flex-col justify-between shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <span className="font-bold text-white text-sm">Canasta de Venta ({totalUnits} uds)</span>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[55vh]">
              <CartSectionContent
                cart={cart}
                totalUnits={totalUnits}
                subtotalCart={subtotalCart}
                totalCart={totalCart}
                ivaCart={ivaCart}
                descuentoPuntos={descuentoPuntos}
                selectedCliente={selectedCliente}
                puntosACanjear={puntosACanjear}
                setPuntosACanjear={setPuntosACanjear}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                onProceedToPayment={handleProceedToPayment}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg bg-[#111827] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0e1420]">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm sm:text-base">Cobro y Facturación Transaccional</h3>
              </div>
              <button
                onClick={() => {
                  if (!completedSale) setIsPaymentModalOpen(false);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!completedSale ? (
              <div className="p-4 sm:p-6 space-y-4">
                {/* Total box */}
                <div className="text-center p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Monto Total a Cancelar</p>
                  <p className="text-3xl font-black text-emerald-400 font-mono mt-1">
                    {formatCurrency(totalCart)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Cliente: <strong className="text-slate-200">{selectedCliente?.nombre_completo}</strong> ({selectedCliente?.numero_documento})
                  </p>
                </div>

                {/* Métodos de Pago */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Forma de Pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "efectivo", label: "Efectivo", icon: Banknote },
                      { id: "tarjeta_credito", label: "Crédito", icon: CreditCard },
                      { id: "tarjeta_debito", label: "Débito", icon: CreditCard },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSel = metodoPago === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setMetodoPago(m.id as any);
                            if (m.id !== "efectivo") setMontoRecibido(totalCart);
                          }}
                          className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition ${
                            isSel
                              ? "bg-emerald-600/20 border-emerald-500 text-white"
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSel ? "text-emerald-400" : "text-slate-400"}`} />
                          <span className="text-xs font-bold">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Monto recibido y cambio (efectivo) */}
                {metodoPago === "efectivo" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Efectivo Recibido (Q)</label>
                      <input
                        type="number"
                        step="0.5"
                        min={totalCart}
                        value={montoRecibido}
                        onChange={(e) => setMontoRecibido(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-base text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Cambio / Vuelto:</span>
                      <span className="text-base font-black font-mono text-emerald-400">
                        {formatCurrency(Math.max(0, montoRecibido - totalCart))}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Volver
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={handleFinalizeSale}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-2"
                  >
                    {isProcessing ? "Procesando..." : "Emitir Factura FEL"}
                  </button>
                </div>
              </div>
            ) : (
              /* Thermal Ticket Screen */
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold text-xs sm:text-sm">Venta Registrada Exitosamente</span>
                </div>

                {/* Printable Ticket Box */}
                <div id="printable-ticket" className="p-4 sm:p-5 rounded-lg bg-white text-slate-900 font-mono text-xs space-y-2.5 shadow-sm border border-slate-300">
                  <div className="text-center border-b border-dashed border-slate-400 pb-2">
                    <p className="font-black text-sm uppercase tracking-wide">SUPERAHORRO S.A.</p>
                    <p className="text-[10px]">NIT: 4455889-1</p>
                    <p className="text-[10px]">{completedSale.sucursal_nombre}</p>
                    <p className="text-[10px]">DOCUMENTO TRIBUTARIO ELECTRÓNICO</p>
                    <p className="font-bold text-[11px] mt-1">{completedSale.numero_factura}</p>
                  </div>

                  <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-400 pb-2">
                    <p>Fecha: {formatDate(completedSale.created_at)}</p>
                    <p>Cliente: {completedSale.cliente_nombre}</p>
                    <p>NIT/DPI: {completedSale.cliente_nit}</p>
                    <p>Cajero: {completedSale.cajero_nombre}</p>
                  </div>

                  <div className="space-y-1 border-b border-dashed border-slate-400 pb-2 text-[10px]">
                    <div className="flex justify-between font-bold">
                      <span>DESCRIPCIÓN</span>
                      <span>TOTAL</span>
                    </div>
                    {completedSale.detalles?.map((d, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="truncate max-w-[190px]">{d.cantidad}x {d.producto_nombre}</span>
                        <span>{formatCurrency(d.total)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] space-y-1 font-bold pt-1">
                    <div className="flex justify-between">
                      <span>SUBTOTAL:</span>
                      <span>{formatCurrency(completedSale.subtotal)}</span>
                    </div>
                    {completedSale.descuento > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>DESCUENTO:</span>
                        <span>-{formatCurrency(completedSale.descuento)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>IVA INCLUIDO:</span>
                      <span>{formatCurrency(completedSale.iva)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black border-t border-slate-800 pt-1">
                      <span>TOTAL PAGADO:</span>
                      <span>{formatCurrency(completedSale.total)}</span>
                    </div>
                  </div>

                  <div className="text-[9px] text-center text-slate-600 border-t border-dashed border-slate-400 pt-2 space-y-0.5">
                    <p className="font-bold">AUTORIZACIÓN FEL:</p>
                    <p className="break-all">{completedSale.autorizacion_fel}</p>
                    <p className="pt-1">Puntos acumulados ganados: +{completedSale.puntos_otorgados} pts</p>
                    <p className="font-semibold text-slate-800 pt-1">¡Gracias por preferir SuperAhorro S.A.!</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir</span>
                  </button>
                  <button
                    onClick={() => {
                      setCompletedSale(null);
                      setIsPaymentModalOpen(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    Nueva Venta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Cart Section Component
function CartSectionContent({
  cart,
  totalUnits,
  subtotalCart,
  totalCart,
  ivaCart,
  descuentoPuntos,
  selectedCliente,
  puntosACanjear,
  setPuntosACanjear,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToPayment
}: {
  cart: CartItem[];
  totalUnits: number;
  subtotalCart: number;
  totalCart: number;
  ivaCart: number;
  descuentoPuntos: number;
  selectedCliente: Cliente | null;
  puntosACanjear: number;
  setPuntosACanjear: (n: number) => void;
  onUpdateQuantity: (i: number, delta: number) => void;
  onRemoveItem: (i: number) => void;
  onClearCart: () => void;
  onProceedToPayment: () => void;
}) {
  return (
    <>
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-xs sm:text-sm">Canasta de Venta</h3>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {cart.length} líneas
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Vaciar</span>
            </button>
          )}
        </div>

        {/* Cart Item Rows */}
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-1">
              <ShoppingCart className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-xs">No hay productos en la caja.</p>
              <p className="text-[10px] text-slate-600">Haz clic en un producto para agregarlo.</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={index}
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-800 flex items-center justify-between gap-2"
              >
                <div className="truncate flex-1">
                  <p className="font-bold text-slate-100 text-xs truncate">{item.producto.nombre}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {formatCurrency(item.precio_unitario)} x {item.cantidad}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center rounded bg-slate-900 border border-slate-700">
                    <button
                      onClick={() => onUpdateQuantity(index, -1)}
                      className="p-1 hover:text-white text-slate-400"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-1.5 text-xs font-bold text-white font-mono">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(index, 1)}
                      className="p-1 hover:text-white text-slate-400"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-bold text-emerald-400 font-mono text-xs min-w-[55px] text-right">
                    {formatCurrency(item.total)}
                  </span>

                  <button
                    onClick={() => onRemoveItem(index)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cart Summary & Checkout */}
      <div className="border-t border-slate-800 pt-3 space-y-2 mt-3">
        {selectedCliente && selectedCliente.puntos_acumulados >= 100 && (
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
            <span className="text-amber-300 font-medium text-[11px]">Canje Puntos (Disp: {selectedCliente.puntos_acumulados})</span>
            <select
              value={puntosACanjear}
              onChange={(e) => setPuntosACanjear(parseInt(e.target.value) || 0)}
              className="px-2 py-0.5 rounded bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold"
            >
              <option value={0}>No canjear</option>
              {selectedCliente.puntos_acumulados >= 100 && <option value={100}>100 pts (-Q10)</option>}
              {selectedCliente.puntos_acumulados >= 200 && <option value={200}>200 pts (-Q20)</option>}
              {selectedCliente.puntos_acumulados >= 400 && <option value={400}>400 pts (-Q40)</option>}
            </select>
          </div>
        )}

        <div className="space-y-1 text-xs text-slate-400">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-mono text-slate-200">{formatCurrency(subtotalCart)}</span>
          </div>
          {descuentoPuntos > 0 && (
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span>Descuento por Puntos:</span>
              <span className="font-mono">-{formatCurrency(descuentoPuntos)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>IVA (12%):</span>
            <span className="font-mono">{formatCurrency(ivaCart)}</span>
          </div>
          <div className="flex justify-between text-base font-black text-white pt-1.5 border-t border-slate-800">
            <span>TOTAL:</span>
            <span className="text-emerald-400 font-mono text-lg">{formatCurrency(totalCart)}</span>
          </div>
        </div>

        <button
          disabled={cart.length === 0}
          onClick={onProceedToPayment}
          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 ${
            cart.length === 0
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
          }`}
        >
          <span>Proceder al Cobro</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}

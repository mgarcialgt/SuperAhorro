"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

import { DashboardView } from "@/components/dashboard/DashboardView";
import { POSView } from "@/components/pos/POSView";
import { ProductView } from "@/components/products/ProductView";
import { InventoryView } from "@/components/inventory/InventoryView";
import { BatchView } from "@/components/batches/BatchView";
import { PurchasesView } from "@/components/purchases/PurchasesView";
import { CustomersView } from "@/components/customers/CustomersView";
import { SuppliersView } from "@/components/suppliers/SuppliersView";
import { PromotionsView } from "@/components/promotions/PromotionsView";
import { ReportsView } from "@/components/reports/ReportsView";
import { UsersView } from "@/components/users/UsersView";
import { AuditView } from "@/components/audit/AuditView";

export default function SuperAhorroApp() {
  const { activeModule } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActiveModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <DashboardView />;
      case "pos":
        return <POSView />;
      case "productos":
        return <ProductView />;
      case "inventario":
        return <InventoryView />;
      case "lotes":
        return <BatchView />;
      case "compras":
        return <PurchasesView />;
      case "clientes":
        return <CustomersView />;
      case "proveedores":
        return <SuppliersView />;
      case "promociones":
        return <PromotionsView />;
      case "reportes":
        return <ReportsView />;
      case "usuarios":
        return <UsersView />;
      case "auditoria":
        return <AuditView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Layout with margin for Sidebar */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <Topbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Dynamic Module Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveModule()}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SuperAhorro S.A.</span>
            <span>&copy; 2026 Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>FEL: En línea SAT</span>
            <span>•</span>
            <span>Versión: 2.0 Prototipo Académico</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Warehouse, 
  CalendarClock, 
  Menu 
} from "lucide-react";

interface MobileNavProps {
  onOpenSidebar: () => void;
}

export function MobileNav({ onOpenSidebar }: MobileNavProps) {
  const { activeModule, setActiveModule } = useApp();

  const navItems = [
    { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
    { id: "pos", label: "Caja POS", icon: ShoppingCart, highlight: true },
    { id: "inventario", label: "Stock", icon: Warehouse },
    { id: "lotes", label: "Lotes", icon: CalendarClock },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0e1420]/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl safe-area-inset-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeModule === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition text-[11px] font-medium ${
              isActive
                ? "text-emerald-400 font-bold"
                : item.highlight
                ? "text-emerald-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? "bg-emerald-500/20 text-emerald-400" : ""}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* Button to open complete menu */}
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-[11px] font-medium"
      >
        <div className="p-1">
          <Menu className="w-5 h-5" />
        </div>
        <span>Menú</span>
      </button>
    </div>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Sucursal, Usuario } from "@/types";
import { SuperAhorroDB } from "@/lib/storage";
import { isSupabaseConnected } from "@/lib/supabaseClient";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
}

interface AppContextType {
  sucursales: Sucursal[];
  currentSucursal: Sucursal | null;
  setCurrentSucursal: (sucursal: Sucursal) => void;
  usuarios: Usuario[];
  currentUser: Usuario | null;
  setCurrentUser: (usuario: Usuario) => void;
  notifications: ToastMessage[];
  showNotification: (type: ToastMessage["type"], title: string, message?: string) => void;
  removeNotification: (id: string) => void;
  refreshData: () => void;
  refreshKey: number;
  isSupabaseActive: boolean;
  activeModule: string;
  setActiveModule: (module: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapse: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [currentSucursal, setCurrentSucursal] = useState<Sucursal | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [notifications, setNotifications] = useState<ToastMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(false);
  const [activeModule, setActiveModule] = useState<string>("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("superahorro_sidebar_collapsed");
      if (saved !== null) {
        setIsSidebarCollapsed(saved === "true");
      }
    }
  }, []);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("superahorro_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const showNotification = (type: ToastMessage["type"], title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, type, title, message }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    async function initApp() {
      const sucs = await SuperAhorroDB.getSucursales();
      const users = await SuperAhorroDB.getUsuarios();
      setSucursales(sucs);
      setUsuarios(users);

      if (sucs.length > 0 && !currentSucursal) {
        // Priorizar la sucursal matriz por defecto
        const matriz = sucs.find(s => s.es_matriz) || sucs[0];
        setCurrentSucursal(matriz);
      }

      if (users.length > 0 && !currentUser) {
        // Iniciar con Admin por defecto para acceso a todo el sistema
        setCurrentUser(users[0]);
      }

      setIsSupabaseActive(isSupabaseConnected());
    }

    initApp();
  }, [refreshKey]);

  return (
    <AppContext.Provider
      value={{
        sucursales,
        currentSucursal,
        setCurrentSucursal,
        usuarios,
        currentUser,
        setCurrentUser,
        notifications,
        showNotification,
        removeNotification,
        refreshData,
        refreshKey,
        isSupabaseActive,
        activeModule,
        setActiveModule,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebarCollapse,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp debe utilizarse dentro de un AppProvider");
  }
  return context;
}

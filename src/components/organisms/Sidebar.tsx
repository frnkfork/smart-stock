"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "../../lib/supabaseClient";
import { LogOut, User, LayoutDashboard, Package, Bell, TrendingUp, Settings } from "lucide-react";
import { notificarAlerta } from "@/lib/voice-alerts";
import { useAuth } from "@/components/providers/AuthProvider";
import { useInventoryStore } from "@/store/useInventoryStore";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Inventario", href: "/inventario", icon: Package },
  { label: "Alertas", href: "/alertas", icon: Bell },
  { label: "Pronósticos", href: "/pronosticos", icon: TrendingUp },
  { label: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { businessConfig } = useInventoryStore();

  const handleLogout = async () => {
    notificarAlerta("Cerrando sesión corporativa. Hasta pronto.");
    await supabase.auth.signOut();
  };

  const displayName = businessConfig?.business_name || "SmartStock Pro";
  const initials = businessConfig?.logo_initials || "SP";

  return (
    <aside className="print:hidden no-print flex w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-1 border-b border-zinc-200 px-5 py-4 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
            {initials}
          </span>
          <span className="font-bold tracking-tighter text-zinc-900 dark:text-zinc-50 text-base">
            SmartStock<span className="text-emerald-600 dark:text-emerald-500">Pro</span>
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 truncate">
          {displayName}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 rounded-lg px-3 text-xs font-bold uppercase tracking-wider transition-all",
                  isActive
                    ? "bg-zinc-100 text-zinc-900 dark:bg-white/5 dark:text-white"
                    : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                )}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 pt-4 border-t border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5">
            <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
              <User className="size-4 text-emerald-600 dark:text-emerald-500" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase text-zinc-900 dark:text-zinc-50 truncate">
                {user?.user_metadata?.full_name?.split(' ')[0] || "Operador"}
              </span>
              <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-500 truncate lowercase">
                {user?.email}
              </span>
              <span className="text-[8px] font-black text-emerald-600 uppercase mt-0.5 tracking-tighter">
                SaaS Cloud Active
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 rounded-lg px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="size-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </aside>
  );
}

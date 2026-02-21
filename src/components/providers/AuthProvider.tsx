"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext<{ user: any | null }>({ user: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const { setSession, syncFromCloud } = useInventoryStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 1. Escuchar cambios de sesión en tiempo real
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setSession(currentUser?.id ?? null);

            if (event === "SIGNED_IN") {
                syncFromCloud(); // Sincronizar productos tras el login
                if (pathname === "/login") router.push("/");
            }

            if (event === "SIGNED_OUT") {
                router.push("/login");
            }
        });

        // 2. Verificación inicial de sesión
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser(user);
                setSession(user.id);
                syncFromCloud();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setSession, syncFromCloud, router, pathname]);

    return (
        <AuthContext.Provider value={{ user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

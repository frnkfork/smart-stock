"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Componente de Resiliencia Industrial.
 * Captura excepciones inesperadas en el árbol de componentes y proporciona 
 * una vía de recuperación elegante al usuario, evitando la pantalla blanca 
 * de la muerte (BSOD).
 */
export class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("[GlobalErrorBoundary] Excepción capturada:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-center animate-in fade-in duration-500">
                    <div className="relative mb-8">
                        <div className="size-20 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center animate-pulse">
                            <AlertCircle className="size-10 text-rose-600 dark:text-rose-500" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-4 uppercase">
                        Ops... Algo se rompió en la nube
                    </h1>
                    <p className="text-sm text-muted-foreground/80 max-w-[450px] mb-8 font-medium">
                        Hemos capturado un error inesperado al procesar los datos de tu inventario. No te preocupes, tus datos en Supabase están protegidos.
                    </p>

                    <div className="flex gap-3">
                        <Button
                            onClick={this.handleReset}
                            className="h-11 px-8 gap-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-zinc-500/10 hover:scale-105 transition-all"
                        >
                            <RefreshCw className="size-3" />
                            Reiniciar Entorno
                        </Button>
                    </div>

                    <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-white/5 w-full max-w-md">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                            {this.state.error?.name}: {this.state.error?.message}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

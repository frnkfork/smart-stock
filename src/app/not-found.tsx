import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col items-center">
                <h1 className="text-9xl font-black text-zinc-900 dark:text-zinc-50 opacity-10">404</h1>
                <div className="absolute flex flex-col items-center">
                    <h2 className="text-2xl font-black tracking-tighter uppercase mb-2">Página No Encontrada</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 max-w-[300px]">
                        El recurso que buscas no existe o ha sido movido en la arquitectura cloud.
                    </p>
                </div>
            </div>

            <Link href="/">
                <Button className="h-10 px-8 text-[11px] font-black uppercase tracking-widest bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xl hover:scale-105 transition-all">
                    Volver al Dashboard Operativo
                </Button>
            </Link>
        </div>
    );
}

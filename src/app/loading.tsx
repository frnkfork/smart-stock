export default function Loading() {
    return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-600 [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-emerald-600"></div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40">
                Sincronizando Inteligencia Logística...
            </p>
        </div>
    );
}

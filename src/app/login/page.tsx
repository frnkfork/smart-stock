"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [companyName, setCompanyName] = useState("");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            company_name: companyName,
                        },
                    },
                });
                if (error) throw error;
                toast.success("Registro solicitado. Verifique su correo electrónico.");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success("Acceso concedido. Bienvenido a SmartStock Pro.");
                router.push("/");
            }
        } catch (error: any) {
            toast.error(error.message || "Error en la autenticación");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements - Refined with higher vibrancy */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full animate-pulse duration-[10000ms]" />
                <div className="absolute -bottom-[15%] -right-[10%] w-[50%] h-[50%] bg-zinc-600/10 blur-[150px] rounded-full animate-pulse duration-[8000ms]" />
            </div>

            <Card className="w-full max-w-[400px] bg-zinc-900 border-zinc-800 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="flex justify-center mb-4">
                        <div className="size-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <ShieldCheck className="size-6" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tighter text-zinc-50 uppercase italic">
                        SmartStock <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Pro</span>
                    </CardTitle>
                    <CardDescription className="text-zinc-400 font-medium tracking-tight">
                        {isSignUp ? "Cree su cuenta corporativa" : "Acceso al motor de gestión operativa"}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleAuth}>
                    <CardContent className="space-y-4">
                        {isSignUp && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-zinc-500">Representante</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Nombre Completo"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="company" className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nombre de la Distribuidora</Label>
                                    <Input
                                        id="company"
                                        placeholder="Ej. Distribuidora Global S.A."
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        required
                                        className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 h-11"
                                    />
                                </div>
                            </>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Corporativo</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nombre@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-zinc-500">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 h-11"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-zinc-50 text-zinc-950 hover:bg-white h-12 font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] active:scale-95 group"
                        >
                            {loading ? <Loader2 className="size-4 animate-spin" /> : (
                                <>
                                    {isSignUp ? "Registrar Distribuidora" : "Entrar al Sistema"}
                                    <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                        <Button
                            variant="link"
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-xs text-zinc-500 hover:text-emerald-500 transition-colors"
                        >
                            {isSignUp ? "¿Ya tiene cuenta? Inicie sesión" : "¿Nueva distribuidora? Regístrese aquí"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <div className="absolute bottom-8 text-center w-full z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">
                    SmartStock Pro • Enterprise SaaS Infrastructure
                </p>
            </div>
        </div>
    );
}

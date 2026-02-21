"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Building2,
    Coins,
    AlertTriangle,
    Settings2,
    Save,
    RefreshCcw,
    CheckCircle2,
    Image as ImageIcon
} from "lucide-react";
import { useInventoryStore } from "@/store/useInventoryStore";
import { BusinessSettingsSchema, BusinessSettingsType } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { notificarAlerta } from "@/lib/voice-alerts";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SettingsPage() {
    const { user } = useAuth();
    const { businessConfig, updateBusinessConfig } = useInventoryStore();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<BusinessSettingsType>({
        resolver: zodResolver(BusinessSettingsSchema),
        defaultValues: businessConfig || {
            business_name: "SmartStock Pro",
            currency_symbol: "S/",
            critical_threshold: 0.4,
            low_threshold: 1.0,
            logo_initials: "SP",
        },
    });

    const criticalValue = watch("critical_threshold");
    const lowValue = watch("low_threshold");

    // Sincronizar formulario con store cuando cargue el config
    useEffect(() => {
        if (businessConfig) {
            reset(businessConfig);
        }
    }, [businessConfig, reset]);

    const onSubmit = async (data: BusinessSettingsType) => {
        try {
            await updateBusinessConfig(data);
            notificarAlerta("Configuración de negocio sincronizada exitosamente.");
        } catch (error) {
            console.error("Error al guardar configuración:", error);
            notificarAlerta("Error al sincronizar con la nube.");
        }
    };

    return (
        <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                    <Settings2 className="size-8 text-emerald-600" />
                    Configuración SaaS
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                    Personaliza la identidad y los parámetros inteligentes de su empresa.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* IDENTIDAD VISUAL */}
                <Card className="border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Building2 className="size-4 text-emerald-600" />
                            Identidad de Marca
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Cómo se verá tu negocio en reportes y facturas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="business_name" className="text-[10px] font-bold uppercase text-muted-foreground">Nombre Comercial</Label>
                            <Input
                                id="business_name"
                                {...register("business_name")}
                                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10"
                                placeholder="Ej. Corporación Logística"
                            />
                            {errors.business_name && <p className="text-[10px] text-rose-500 font-bold uppercase italic">{errors.business_name.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="currency_symbol" className="text-[10px] font-bold uppercase text-muted-foreground">Moneda</Label>
                                <Input
                                    id="currency_symbol"
                                    {...register("currency_symbol")}
                                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 font-mono"
                                    placeholder="S/"
                                />
                                {errors.currency_symbol && <p className="text-[10px] text-rose-500 font-bold uppercase italic">{errors.currency_symbol.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logo_initials" className="text-[10px] font-bold uppercase text-muted-foreground">Iniciales Logo</Label>
                                <Input
                                    id="logo_initials"
                                    {...register("logo_initials")}
                                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 font-black uppercase text-center"
                                    maxLength={3}
                                />
                                {errors.logo_initials && <p className="text-[10px] text-rose-500 font-bold uppercase italic">{errors.logo_initials.message}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* PARÁMETROS DEL MOTOR */}
                <Card className="border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <AlertTriangle className="size-4 text-amber-500" />
                            Inteligencia Logística
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Ajusta los umbrales de severidad de tu inventario.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground flex justify-between">
                                Umbral Crítico
                                <span className="text-rose-600 font-black">{Math.round((criticalValue || 0.4) * 100)}%</span>
                            </Label>
                            <Input
                                type="range"
                                step="0.05"
                                min="0.05"
                                max="0.5"
                                {...register("critical_threshold", { valueAsNumber: true })}
                                className="h-2 accent-rose-600 cursor-pointer p-0"
                            />
                            <p className="text-[9px] text-muted-foreground italic">Activa alerta roja cuando el stock cae por debajo de este % del mínimo.</p>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground flex justify-between">
                                Umbral de Alerta
                                <span className="text-amber-500 font-black">{Math.round((lowValue || 1.0) * 100)}%</span>
                            </Label>
                            <Input
                                type="range"
                                step="0.05"
                                min="0.5"
                                max="1.5"
                                {...register("low_threshold", { valueAsNumber: true })}
                                className="h-2 accent-amber-500 cursor-pointer p-0"
                            />
                            <p className="text-[9px] text-muted-foreground italic">Punto donde se recomienda iniciar la orden de compra.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* BOTÓN DE GUARDADO */}
                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-white/5">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => reset()}
                        disabled={!isDirty || isSubmitting}
                        className="h-11 px-6 gap-2 text-[10px] font-bold uppercase tracking-widest"
                    >
                        <RefreshCcw className="size-3" />
                        Descartar Cambios
                    </Button>
                    <Button
                        type="submit"
                        disabled={!isDirty || isSubmitting}
                        className="h-11 px-10 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all"
                    >
                        {isSubmitting ? (
                            <RefreshCcw className="size-4 animate-spin" />
                        ) : (
                            <Save className="size-4" />
                        )}
                        Guardar Configuración
                    </Button>
                </div>

            </form>

            {/* FOOTER INFORMATIVO */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-dashed border-zinc-300 dark:border-white/10">
                <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-5 text-emerald-500" />
                </div>
                <div>
                    <h4 className="text-[11px] font-black uppercase text-zinc-900 dark:text-zinc-50">Sincronización Cloud Activa</h4>
                    <p className="text-[10px] text-muted-foreground/80 font-medium">Los cambios se aplicarán instantáneamente en todos tus dispositivos vinculados a esta cuenta SaaS.</p>
                </div>
            </div>

        </div>
    );
}

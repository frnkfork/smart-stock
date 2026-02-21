"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InventoryItem } from "@/types";

const ProductSchema = z.object({
    name: z.string().min(1, "Nombre requerido").max(50),
    category: z.string().min(1, "Categoría requerida"),
    stock: z.coerce.number().int().min(0),
    price: z.coerce.number().min(0),
    minStock: z.coerce.number().int().min(1),
    targetStock: z.coerce.number().int().min(1),
});

type ProductFormValues = z.infer<typeof ProductSchema>;

type ProductFormDialogProps = {
    product: InventoryItem | null; // null means create mode
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (product: Omit<InventoryItem, "id"> & { id?: string }) => void;
};

export function ProductFormDialog({
    product,
    open,
    onOpenChange,
    onSave,
}: ProductFormDialogProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(ProductSchema),
        defaultValues: product ? {
            name: product.name,
            category: product.category,
            stock: product.stock,
            price: product.price,
            minStock: product.minStock,
            targetStock: product.targetStock,
        } : {
            name: "",
            category: "",
            stock: 0,
            price: 0,
            minStock: 20,
            targetStock: 100,
        },
    });

    useEffect(() => {
        if (open) {
            reset(product ? {
                name: product.name,
                category: product.category,
                stock: product.stock,
                price: product.price,
                minStock: product.minStock,
                targetStock: product.targetStock,
            } : {
                name: "",
                category: "",
                stock: 0,
                price: 0,
                minStock: 20,
                targetStock: 100,
            });
        }
    }, [product, open, reset]);

    const onSubmit: SubmitHandler<ProductFormValues> = (data) => {
        onSave({
            id: product?.id,
            ...data,
        });
        onOpenChange(false);
        toast.success(product ? "Registro actualizado en el ledger." : "Entrada creada exitosamente.");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{product ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="product-name">Nombre</Label>
                        <Input
                            id="product-name"
                            {...register("name")}
                            placeholder="Ej. Saco de Arroz"
                        />
                        {errors.name && <p className="text-[10px] text-rose-500 font-bold uppercase italic">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="product-category">Categoría</Label>
                        <Input
                            id="product-category"
                            {...register("category")}
                            placeholder="Ej. Abarrotes"
                        />
                        {errors.category && <p className="text-[10px] text-rose-500 font-bold uppercase italic">{errors.category.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="product-stock">Stock Actual</Label>
                            <Input
                                id="product-stock"
                                type="number"
                                {...register("stock")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="product-price">Precio (S/.)</Label>
                            <Input
                                id="product-price"
                                type="number"
                                step="0.1"
                                {...register("price")}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="product-min-stock" className="text-amber-600 dark:text-amber-400">Punto Reorden</Label>
                            <Input
                                id="product-min-stock"
                                type="number"
                                {...register("minStock")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="product-target-stock" className="text-emerald-600 dark:text-emerald-400">Nivel Óptimo</Label>
                            <Input
                                id="product-target-stock"
                                type="number"
                                {...register("targetStock")}
                            />
                        </div>
                    </div>
                    <DialogFooter className="pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="font-bold uppercase text-[10px] tracking-widest"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-black uppercase text-[10px] tracking-widest px-8"
                        >
                            {product ? "Guardar Cambios" : "Crear Producto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

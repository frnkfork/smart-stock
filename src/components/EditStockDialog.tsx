"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/types";

const StockSchema = z.object({
  stock: z.coerce.number()
    .int("Debe ser un número entero")
    .min(0, "El stock no puede ser negativo")
    .max(99999, "Cantidad fuera de rango operativo"),
});

type StockFormValues = z.infer<typeof StockSchema>;

type EditStockDialogProps = {
  product: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (productId: string, newStock: number) => void;
};

export function EditStockDialog({
  product,
  open,
  onOpenChange,
  onSave,
}: EditStockDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<StockFormValues>({
    resolver: zodResolver(StockSchema),
    defaultValues: { stock: product?.stock || 0 },
  });

  useEffect(() => {
    if (product) {
      setValue("stock", product.stock);
    }
  }, [product, setValue]);

  const onFormSubmit: SubmitHandler<StockFormValues> = (data) => {
    if (!product) return;
    onSave(product.id, data.stock);
    onOpenChange(false);
    toast.success("Stock actualizado correctamente.");
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Actualizar stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit as any)} className="space-y-4">
          <div>
            <p className="mb-1 text-sm text-muted-foreground font-medium uppercase tracking-tighter">{product.name}</p>
            <label htmlFor="edit-stock-input" className="sr-only">
              Cantidad en almacén
            </label>
            <Input
              id="edit-stock-input"
              type="number"
              {...register("stock", { valueAsNumber: true })}
              placeholder="Cantidad"
              className={cn(
                "text-base tabular-nums bg-white dark:bg-zinc-900",
                errors.stock && "border-rose-500 focus-visible:ring-rose-500"
              )}
              autoFocus
              aria-label="Cantidad en almacén"
            />
            {errors.stock && (
              <p className="mt-1 text-[10px] text-rose-500 font-bold uppercase italic animate-in fade-in slide-in-from-top-1">
                {errors.stock.message}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-4 border-t border-zinc-100 dark:border-white/5">
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
              className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-zinc-500/10 hover:scale-105 transition-all"
            >
              Actualizar Stock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

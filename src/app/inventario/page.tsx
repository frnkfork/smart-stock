"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InventoryTable } from "@/components/InventoryTable";
import { ProductFormDialog } from "@/components/ProductFormDialog";
import { useInventoryStore } from "@/store/useInventoryStore";
import type { InventoryItem } from "@/types";

export default function InventarioPage() {
  const { addProduct, updateProduct } = useInventoryStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: InventoryItem) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleSave = (data: Omit<InventoryItem, "id"> & { id?: string }) => {
    if (data.id) {
      updateProduct(data.id, data);
    } else {
      addProduct(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Gestión de Inventario
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Añade, edita y gestiona el stock de su catálogo de productos.
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <InventoryTable
          isManagementMode
          onEdit={handleEdit}
        />
      </div>

      <ProductFormDialog
        product={selectedProduct}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
}

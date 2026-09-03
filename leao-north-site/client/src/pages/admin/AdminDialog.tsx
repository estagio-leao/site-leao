/*
 * LEÃO NORTH — Painel Admin: AdminDialog (Fase 25)
 * Wrapper fino sobre o Dialog do shadcn/ui (Radix) para padronizar os modais
 * de CRUD do painel: tema escuro (#111111), mapa de larguras (sm/md/lg/xl),
 * scroll interno no corpo e cabeçalho/rodapé fixos.
 *
 * Uso:
 *   <AdminDialog
 *     open={isModalOpen}
 *     onOpenChange={(open) => { if (!open) fecharModal(); }}
 *     title="Novo Produto"
 *     description="Formulário de produto"
 *     size="xl"
 *     footer={<button type="submit">Salvar</button>}
 *   >
 *     <form ...>...</form>
 *   </AdminDialog>
 */
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type AdminDialogSize = "sm" | "md" | "lg" | "xl";

// Mapa de larguras definido no planejamento da Fase 25 (§4):
//   sm = Categorias/Depoimentos · md = Serviços · lg = Grupos/Sócios · xl = Produtos/Portfólio
const ADMIN_DIALOG_MAX_WIDTH: Record<AdminDialogSize, string> = {
  sm: "sm:max-w-lg",
  md: "sm:max-w-xl",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

type AdminDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  /** Descrição acessível (sr-only) — o Radix emite warning sem DialogDescription */
  description?: string;
  size?: AdminDialogSize;
  className?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export default function AdminDialog({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  className,
  footer,
  children,
}: AdminDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[92vh] flex-col overflow-hidden bg-[#111111] p-0 text-white",
          "border-white/10",
          ADMIN_DIALOG_MAX_WIDTH[size],
          className
        )}
      >
        {/* Cabeçalho fixo (pr-14 para não colidir com o X do DialogContent) */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 p-6 pr-14">
          <DialogTitle className="font-['Barlow_Condensed'] text-2xl font-700 uppercase tracking-wide text-white">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="sr-only">{description}</DialogDescription>
          )}
        </div>

        {/* Corpo com scroll interno */}
        <div className="grow overflow-y-auto p-6">{children}</div>

        {/* Rodapé fixo */}
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-white/10 p-6 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

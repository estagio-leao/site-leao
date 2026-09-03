/*
 * LEÃO NORTH — Painel Admin: ConfirmDeleteDialog (Fase 28)
 * Wrapper controlado sobre o AlertDialog do shadcn/Radix para ações que antes
 * usavam window.confirm() (excluir/duplicar). Visual escuro consistente com o
 * AdminDialog (Fase 25): fundo #111111 + borda branca/10 + Barlow uppercase.
 *
 * Uso típico (controlado pelo pai):
 *   const [excluirId, setExcluirId] = useState<number | null>(null);
 *   ...
 *   <ConfirmDeleteDialog
 *     open={excluirId != null}
 *     onOpenChange={(open) => { if (!open) setExcluirId(null); }}
 *     title="Excluir Categoria"
 *     description="Tem certeza que deseja apagar esta categoria?"
 *     confirmLabel="Excluir"
 *     onConfirm={async () => { if (excluirId != null) await executarExclusao(excluirId); }}
 *   />
 */
import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Copy, Trash2, type LucideIcon } from "lucide-react";

type ConfirmDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Título exibido no cabeçalho (ex.: "Excluir Categoria" / "Duplicar Produto"). */
  title?: React.ReactNode;
  /** Descrição com o detalhamento da ação (ex.: o que será removido junto). */
  description?: React.ReactNode;
  /** Rótulo do botão de confirmação (ex.: "Excluir" / "Duplicar"). */
  confirmLabel?: React.ReactNode;
  /** true = ação destrutiva (botão vermelho); false = ação neutra (dourado). Default: true. */
  destructive?: boolean;
  /** Chamado ao confirmar. O diálogo fecha em seguida (equivale ao window.confirm original). */
  onConfirm?: () => void | Promise<void>;
};

const contentClass =
  "max-w-md bg-[#111111] border-white/10 text-white " +
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 " +
  "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Confirmar ação",
  description,
  confirmLabel = "Excluir",
  destructive = true,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const ActionIcon: LucideIcon = destructive ? Trash2 : Copy;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={contentClass}>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-['Barlow_Condensed'] text-2xl font-700 uppercase tracking-wide text-white">
            {title}
          </AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-white/60 font-['DM_Sans']">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border-white/10 font-['Barlow_Condensed'] font-700 uppercase tracking-wide">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (onConfirm) onConfirm();
            }}
            className={
              destructive
                ? "bg-red-500 text-white hover:bg-red-600 font-['Barlow_Condensed'] font-700 uppercase tracking-wide"
                : "bg-[#F0B429] text-[#080808] hover:bg-[#FFD060] font-['Barlow_Condensed'] font-700 uppercase tracking-wide"
            }
          >
            <ActionIcon className="w-4 h-4" />
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

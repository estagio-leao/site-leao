/*
 * LEÃO NORTH — Painel Admin: Depoimentos — Fase 26 (extraído do Dashboard)
 * Componente autossuficiente: busca, estados, handlers e formulário em Modal
 * (AdminDialog size="sm"), usando o padrão da Fase 25 (editandoDepId + depModalOpen).
 *
 * Consumo:
 *   GET    api/depoimentos.php
 *   POST   api/admin/add_depoimento.php
 *   PUT    api/admin/edit_depoimento.php
 *   DELETE api/admin/delete_depoimento.php?id=
 */
import { useEffect, useState } from "react";
import { Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/adminFetch";
import AdminDialog from "../AdminDialog";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";
import { Switch } from "@/components/ui/switch";

const inputClass =
  "w-full bg-[#080808] border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm font-['DM_Sans'] focus:border-[#F0B429]/50 focus:outline-none transition-all";

export default function AdminDepoimentos() {
  const [depoimentos, setDepoimentos] = useState<any[]>([]);
  const [depForm, setDepForm] = useState<{
    nome: string;
    estrelas: number;
    texto: string;
    visivel: boolean;   // Fase 27 — curadoria
    destaque: boolean;  // Fase 27 — curadoria
  }>({
    nome: "",
    estrelas: 5,
    texto: "",
    visivel: true,
    destaque: false,
  });
  const [loadingDep, setLoadingDep] = useState(false);
  const [editandoDepId, setEditandoDepId] = useState<number | null>(null); // null = modo novo
  const [depModalOpen, setDepModalOpen] = useState(false);
  const [excluirId, setExcluirId] = useState<number | null>(null); // Fase 28 — id aguardando confirmação

  const fetchDepoimentos = async () => {
    try {
      // Fase 29 — listagem privada via api/admin/depoimentos.php (evita o "vazamento"
      // dos depoimentos ocultos pelo endpoint público ?admin=1) — exige Bearer Token.
      const res = await adminFetch("http://localhost/leaonorth/api/admin/depoimentos.php");
      const data = await res.json();
      if (Array.isArray(data)) setDepoimentos(data);
    } catch (err) { console.error("Erro depoimentos", err); }
  };

  useEffect(() => {
    fetchDepoimentos();
  }, []);

  const resetDepForm = () => {
    setDepForm({ nome: "", estrelas: 5, texto: "", visivel: true, destaque: false });
    setEditandoDepId(null);
  };

  // Única porta de saída: limpa o formulário e fecha o modal
  const fecharDepModal = () => {
    resetDepForm();
    setDepModalOpen(false);
  };

  const abrirNovoDepoimento = () => {
    resetDepForm();
    setDepModalOpen(true);
  };

  const abrirEdicaoDepoimento = (dep: any) => {
    setEditandoDepId(dep.id);
    setDepForm({
      nome: dep.nome,
      estrelas: dep.estrelas,
      texto: dep.texto || "",
      visivel: dep.visivel === true || dep.visivel === 1 || dep.visivel === "1",
      destaque: dep.destaque === true || dep.destaque === 1 || dep.destaque === "1",
    });
    setDepModalOpen(true);
  };

  const handleSaveDepoimento = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingDep(true);
    const isEdit = editandoDepId != null;
    const url = isEdit
      ? "http://localhost/leaonorth/api/admin/edit_depoimento.php"
      : "http://localhost/leaonorth/api/admin/add_depoimento.php";
    try {
      const res = await adminFetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...depForm, id: editandoDepId } : depForm),
      });
      if (res.ok) {
        fecharDepModal();
        fetchDepoimentos();
        toast.success(isEdit ? "Depoimento atualizado!" : "Depoimento adicionado!");
      }
    } catch (err) { toast.error("Erro ao salvar depoimento."); } finally { setLoadingDep(false); }
  };

  // Fase 28 — executada somente após a confirmação do ConfirmDeleteDialog
  const executarExclusaoDepoimento = async (id: number) => {
    try {
      await adminFetch(`http://localhost/leaonorth/api/admin/delete_depoimento.php?id=${id}`, { method: "DELETE" });
      fetchDepoimentos();
      toast.success("Depoimento excluído com sucesso.");
    } catch (err) { toast.error("Erro ao excluir."); }
  };

  // Fase 27 — atalho: alterna visivel/destaque direto no card (sem abrir o modal)
  const handleToggleDepoimento = async (id: number, campo: "visivel" | "destaque", valor: boolean) => {
    try {
      const res = await adminFetch("http://localhost/leaonorth/api/admin/toggle_depoimento.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, campo, valor: valor ? 1 : 0 }),
      });
      if (!res.ok) toast.error("Erro ao atualizar o depoimento.");
      fetchDepoimentos(); // recarrega badges/toggles
    } catch (err) {
      console.error("Erro ao alternar depoimento", err);
      toast.error("Erro ao atualizar o depoimento.");
    }
  };

  const isLigado = (v: any) => v === true || v === 1 || v === "1";

  return (
    <div className="w-full">
      {/* Header da aba: título + botão Novo */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-['Barlow_Condensed'] text-2xl uppercase font-600">
          Depoimentos no Site
        </h2>
        <button
          onClick={abrirNovoDepoimento}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Depoimento
        </button>
      </div>

      {/* Listagem full-width */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {depoimentos.map(dep => (
          <div
            key={dep.id}
            onClick={() => abrirEdicaoDepoimento(dep)}
            className="bg-[#111111] border border-white/10 rounded-sm p-5 flex flex-col relative group cursor-pointer hover:border-[#F0B429]/50 hover:-translate-y-1 hover:bg-white/5 transition-all"
            title="Clique para editar"
          >
            {/* Cabeçalho: estrelas à esquerda; badges + excluir à direita (sem sobreposição) */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex gap-1 pt-0.5">
                {Array(dep.estrelas).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-[#F0B429] text-[#F0B429]" />)}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {(dep.destaque === true || dep.destaque === 1 || dep.destaque === "1") && (
                  <span className="inline-flex items-center px-2 py-1 rounded-sm text-[9px] font-['DM_Sans'] font-bold uppercase tracking-wider border border-[#F0B429]/40 bg-[#F0B429]/15 text-[#F0B429]">
                    Destaque
                  </span>
                )}
                {dep.visivel === 0 || dep.visivel === "0" ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-sm text-[9px] font-['DM_Sans'] font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-white/40">
                    Oculto
                  </span>
                ) : null}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Impede que o clique acione a edição
                    setExcluirId(dep.id);
                  }}
                  className="text-red-500/50 hover:text-red-500 transition-colors p-1"
                  title="Excluir depoimento"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {dep.texto ? (
              <p className="text-white/80 text-sm mb-4 flex-1 italic line-clamp-4">"{dep.texto}"</p>
            ) : (
              <p className="text-white/30 text-xs mb-4 flex-1 italic">Sem comentário escrito.</p>
            )}
            <p className="text-[#F0B429] font-medium text-sm">{dep.nome}</p>

            {/* Fase 27 — Atalhos de curadoria direto no card (não abre a edição) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2"
            >
              <label className="flex items-center gap-2 cursor-pointer select-none" title="Exibir no site">
                <Switch
                  checked={isLigado(dep.visivel)}
                  onCheckedChange={(v) => handleToggleDepoimento(dep.id, "visivel", v)}
                />
                <span className="text-[11px] font-['DM_Sans'] uppercase tracking-wider text-white/50">Exibir</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none" title="Destacar na Home">
                <Switch
                  checked={isLigado(dep.destaque)}
                  onCheckedChange={(v) => handleToggleDepoimento(dep.id, "destaque", v)}
                />
                <span className="text-[11px] font-['DM_Sans'] uppercase tracking-wider text-white/50">Destaque</span>
              </label>
            </div>
          </div>
        ))}
        {depoimentos.length === 0 && (
          <div className="col-span-full text-center text-white/40 py-10 border border-dashed border-white/10 rounded-sm">
            Nenhum depoimento cadastrado.
          </div>
        )}
      </div>

      {/* Modal de cadastro/edição */}
      <AdminDialog
        open={depModalOpen}
        onOpenChange={(open) => {
          if (!open) fecharDepModal();
        }}
        title={editandoDepId != null ? "Editar Depoimento" : "Novo Depoimento"}
        description="Cadastro de depoimento exibido no site"
        size="sm"
        footer={
          <>
            <button type="submit" form="admin-depoimento-form" disabled={loadingDep} className="flex-1 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center disabled:opacity-50">
              {loadingDep ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={fecharDepModal} className="px-5 py-3 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors">
              Cancelar
            </button>
          </>
        }
      >
        <form id="admin-depoimento-form" onSubmit={handleSaveDepoimento} className="space-y-4">
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Nome do Cliente</label>
            <input type="text" required value={depForm.nome} onChange={e => setDepForm({...depForm, nome: e.target.value})} className={inputClass} placeholder="Ex: João Silva" />
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Estrelas (1 a 5)</label>
            <select value={depForm.estrelas} onChange={e => setDepForm({...depForm, estrelas: Number(e.target.value)})} className={inputClass}>
              <option value={5}>5 Estrelas</option>
              <option value={4}>4 Estrelas</option>
              <option value={3}>3 Estrelas</option>
              <option value={2}>2 Estrelas</option>
              <option value={1}>1 Estrela</option>
            </select>
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Texto da Avaliação (Opcional)</label>
            <textarea value={depForm.texto} onChange={e => setDepForm({...depForm, texto: e.target.value})} className={`${inputClass} min-h-[160px] resize-none`} placeholder="Deixe em branco se for apenas nota..." />
          </div>

          {/* Fase 27 — Curadoria: Visível no site + Destacar na Home */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between gap-4 rounded-sm border border-white/10 bg-[#080808] px-4 py-3">
              <div>
                <p className="text-white/90 text-sm font-['DM_Sans']">Exibir no site</p>
                <p className="text-white/40 text-xs font-['DM_Sans']">Controla a página de depoimentos</p>
              </div>
              <Switch
                checked={depForm.visivel}
                onCheckedChange={(v) => setDepForm({ ...depForm, visivel: v })}
              />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-sm border border-white/10 bg-[#080808] px-4 py-3">
              <div>
                <p className="text-white/90 text-sm font-['DM_Sans']">Destacar na Home</p>
                <p className="text-white/40 text-xs font-['DM_Sans']">Aparece na seção de avaliações da página inicial</p>
              </div>
              <Switch
                checked={depForm.destaque}
                onCheckedChange={(v) => setDepForm({ ...depForm, destaque: v })}
              />
            </div>
          </div>
        </form>
      </AdminDialog>

      {/* Fase 28 — confirmação de exclusão (substitui o window.confirm) */}
      <ConfirmDeleteDialog
        open={excluirId != null}
        onOpenChange={(open) => {
          if (!open) setExcluirId(null);
        }}
        title="Excluir Depoimento"
        description="Apagar este depoimento?"
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (excluirId != null) await executarExclusaoDepoimento(excluirId);
        }}
      />
    </div>
  );
}

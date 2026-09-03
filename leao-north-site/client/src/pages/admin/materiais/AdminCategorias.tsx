/*
 * LEÃO NORTH — Painel Admin: Categorias (Leão Materiais) — Fase 26 (extraído do Dashboard)
 * Componente autossuficiente: busca, estados, handlers e formulário em Modal
 * (AdminDialog size="sm"), padrão da Fase 25 (editandoCatId + catModalOpen).
 *
 * Consumo:
 *   GET    api/categorias.php
 *   POST   api/admin/add_categoria.php
 *   POST   api/admin/edit_categoria.php
 *   DELETE api/admin/delete_categoria.php?id=
 */
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/adminFetch";
import AdminDialog from "../AdminDialog";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";

const inputClass =
  "w-full bg-[#080808] border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm font-['DM_Sans'] focus:border-[#F0B429]/50 focus:outline-none transition-all";

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [catForm, setCatForm] = useState<{ nome: string }>({ nome: "" });
  const [loadingCat, setLoadingCat] = useState(false);
  const [editandoCatId, setEditandoCatId] = useState<number | null>(null); // null = modo novo
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [excluirId, setExcluirId] = useState<number | null>(null); // Fase 28 — id aguardando confirmação

  const fetchCategorias = async () => {
    try {
      const res = await fetch("http://localhost/leaonorth/api/categorias.php");
      const data = await res.json();
      if (Array.isArray(data)) setCategorias(data);
    } catch (err) { console.error("Erro categorias", err); }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const resetCatForm = () => {
    setCatForm({ nome: "" });
    setEditandoCatId(null);
  };

  // Única porta de saída: limpa o formulário e fecha o modal
  const fecharCatModal = () => {
    resetCatForm();
    setCatModalOpen(false);
  };

  const abrirNovaCategoria = () => {
    resetCatForm();
    setCatModalOpen(true);
  };

  const abrirEdicaoCategoria = (cat: any) => {
    setEditandoCatId(cat.id);
    setCatForm({ nome: cat.nome });
    setCatModalOpen(true);
  };

  const handleSaveCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.nome.trim()) return toast.warning("Informe o nome da categoria.");
    setLoadingCat(true);
    const isEdit = editandoCatId != null;
    const formData = new FormData();
    if (isEdit) formData.append("id", String(editandoCatId));
    formData.append("nome", catForm.nome);
    try {
      const res = await adminFetch(
        isEdit
          ? "http://localhost/leaonorth/api/admin/edit_categoria.php"
          : "http://localhost/leaonorth/api/admin/add_categoria.php",
        { method: "POST", body: formData }
      );
      if (res.ok) {
        fecharCatModal();
        fetchCategorias();
        toast.success(isEdit ? "Categoria atualizada!" : "Categoria adicionada!");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.mensagem || (isEdit ? "Erro ao atualizar categoria." : "Erro ao salvar categoria."));
      }
    } catch (err) { toast.error("Erro ao enviar."); } finally { setLoadingCat(false); }
  };

  // Fase 28 — executada somente após a confirmação do ConfirmDeleteDialog
  const executarExclusaoCategoria = async (id: number) => {
    try {
      const res = await adminFetch(`http://localhost/leaonorth/api/admin/delete_categoria.php?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategorias();
        toast.success("Categoria excluída com sucesso.");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.mensagem || "Erro ao excluir categoria.");
      }
    } catch (err) { toast.error("Erro ao excluir."); }
  };

  return (
    <div className="w-full">
      {/* Header da aba: título + botão Novo */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-['Barlow_Condensed'] text-2xl uppercase font-600">
          Categorias Cadastradas
        </h2>
        <button
          onClick={abrirNovaCategoria}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      {/* Listagem full-width */}
      <div className="bg-[#111111] border border-white/10 rounded-sm overflow-hidden">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-[#1A1A1A] text-white/50 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium border-b border-white/5">Nome</th>
              <th className="px-6 py-4 font-medium border-b border-white/5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {categorias.map(cat => (
              <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white/80">{cat.nome}</td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => abrirEdicaoCategoria(cat)}
                    className="bg-[#F0B429]/20 text-[#F0B429] p-2 rounded-full hover:bg-[#F0B429] hover:text-[#080808] transition-all"
                    title="Editar categoria"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExcluirId(cat.id)}
                    className="bg-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all ml-2"
                    title="Excluir categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {categorias.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-white/40">Nenhuma categoria cadastrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de cadastro/edição */}
      <AdminDialog
        open={catModalOpen}
        onOpenChange={(open) => {
          if (!open) fecharCatModal();
        }}
        title={editandoCatId != null ? "Editar Categoria" : "Nova Categoria"}
        description="Cadastro de categoria de produtos"
        size="sm"
        footer={
          <>
            <button type="submit" form="admin-categoria-form" disabled={loadingCat} className="flex-1 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center disabled:opacity-50">
              {loadingCat ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={fecharCatModal} className="px-5 py-3 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors">
              Cancelar
            </button>
          </>
        }
      >
        <form id="admin-categoria-form" onSubmit={handleSaveCategoria} className="space-y-4">
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Nome</label>
            <input
              type="text" required
              value={catForm.nome}
              onChange={e => setCatForm({ ...catForm, nome: e.target.value })}
              className={inputClass}
              placeholder="Ex: Iluminação"
            />
          </div>
        </form>
      </AdminDialog>

      {/* Fase 28 — confirmação de exclusão (substitui o window.confirm) */}
      <ConfirmDeleteDialog
        open={excluirId != null}
        onOpenChange={(open) => {
          if (!open) setExcluirId(null);
        }}
        title="Excluir Categoria"
        description="Tem certeza que deseja apagar esta categoria?"
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (excluirId != null) await executarExclusaoCategoria(excluirId);
        }}
      />
    </div>
  );
}

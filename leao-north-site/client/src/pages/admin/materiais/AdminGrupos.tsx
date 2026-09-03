/*
 * LEÃO NORTH — Painel Admin: Grupos (Leão Materiais) — Fase 26 (extraído do Dashboard)
 * Componente autossuficiente: busca grupos + categorias (para o select), upload de
 * capa única com preview (ObjectURL revogado no fechamento) e formulário em Modal
 * (AdminDialog size="lg"), padrão da Fase 25 (editandoGrupoId + grupoModalOpen).
 *
 * Consumo:
 *   GET    api/grupos.php + api/categorias.php
 *   POST   api/admin/add_grupo.php
 *   POST   api/admin/edit_grupo.php
 *   DELETE api/admin/delete_grupo.php?id=
 */
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/adminFetch";
import AdminDialog from "../AdminDialog";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";

const inputClass =
  "w-full bg-[#080808] border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm font-['DM_Sans'] focus:border-[#F0B429]/50 focus:outline-none transition-all";

export default function AdminGrupos() {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [grupoForm, setGrupoForm] = useState<{ nome: string; categoria_id: number | "" }>({
    nome: "",
    categoria_id: "",
  });
  const [grupoFile, setGrupoFile] = useState<File | null>(null);       // arquivo da capa
  const [grupoPreview, setGrupoPreview] = useState<string | null>(null); // URL de preview da capa
  const [loadingGrupo, setLoadingGrupo] = useState(false);
  const [editandoGrupoId, setEditandoGrupoId] = useState<number | null>(null); // null = modo novo
  const [grupoModalOpen, setGrupoModalOpen] = useState(false);
  const [excluirId, setExcluirId] = useState<number | null>(null); // Fase 28 — id aguardando confirmação

  const fetchGrupos = async () => {
    try {
      const res = await fetch("http://localhost/leaonorth/api/grupos.php");
      const data = await res.json();
      if (Array.isArray(data)) setGrupos(data);
    } catch (err) { console.error("Erro grupos", err); }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch("http://localhost/leaonorth/api/categorias.php");
      const data = await res.json();
      if (Array.isArray(data)) setCategorias(data);
    } catch (err) { console.error("Erro categorias", err); }
  };

  useEffect(() => {
    fetchGrupos();
    fetchCategorias();
  }, []);

  const resetGrupoForm = () => {
    // Revoga o ObjectURL do preview local (se vier de um arquivo selecionado)
    if (grupoFile && grupoPreview) {
      URL.revokeObjectURL(grupoPreview);
    }
    setGrupoForm({ nome: "", categoria_id: "" });
    setEditandoGrupoId(null);
    setGrupoFile(null);
    setGrupoPreview(null);
  };

  // Única porta de saída: limpa o formulário (revogando preview) e fecha o modal
  const fecharGrupoModal = () => {
    resetGrupoForm();
    setGrupoModalOpen(false);
  };

  const abrirNovoGrupo = () => {
    resetGrupoForm();
    setGrupoModalOpen(true);
  };

  const handleGrupoFileChange = (file: File | null) => {
    // Revoga o ObjectURL anterior, se havia um arquivo local selecionado
    if (grupoFile && grupoPreview) {
      URL.revokeObjectURL(grupoPreview);
    }
    setGrupoFile(file);
    setGrupoPreview(file ? URL.createObjectURL(file) : null);
  };

  const abrirEdicaoGrupo = (g: any) => {
    if (grupoFile && grupoPreview) {
      URL.revokeObjectURL(grupoPreview);
    }
    setEditandoGrupoId(g.id);
    setGrupoForm({ nome: g.nome, categoria_id: g.categoria_id });
    setGrupoFile(null);
    setGrupoPreview(g.caminho_imagem_capa ? `http://localhost/leaonorth${g.caminho_imagem_capa}` : null);
    setGrupoModalOpen(true);
  };

  const handleSaveGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoForm.nome.trim()) return toast.warning("Informe o nome do grupo.");
    if (!grupoForm.categoria_id) return toast.warning("Selecione uma categoria.");
    const isEdit = editandoGrupoId != null;
    if (!isEdit && !grupoFile) return toast.warning("A capa do grupo é obrigatória.");
    setLoadingGrupo(true);

    const formData = new FormData();
    if (isEdit) formData.append("id", String(editandoGrupoId));
    formData.append("nome", grupoForm.nome);
    formData.append("categoria_id", String(grupoForm.categoria_id));
    // Só anexa a capa se houver um novo arquivo selecionado (no cadastro é obrigatória)
    if (grupoFile) formData.append("capa", grupoFile);

    try {
      const res = await adminFetch(
        isEdit
          ? "http://localhost/leaonorth/api/admin/edit_grupo.php"
          : "http://localhost/leaonorth/api/admin/add_grupo.php",
        { method: "POST", body: formData }
      );
      if (res.ok) {
        fecharGrupoModal();
        fetchGrupos();
        toast.success(isEdit ? "Grupo atualizado!" : "Grupo criado com sucesso!");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.mensagem || (isEdit ? "Erro ao atualizar grupo." : "Erro ao criar grupo."));
      }
    } catch (err) { toast.error("Erro ao enviar."); } finally { setLoadingGrupo(false); }
  };

  // Fase 28 — executada somente após a confirmação do ConfirmDeleteDialog
  const executarExclusaoGrupo = async (id: number) => {
    try {
      const res = await adminFetch(`http://localhost/leaonorth/api/admin/delete_grupo.php?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchGrupos();
        toast.success("Grupo excluído com sucesso.");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.mensagem || "Erro ao excluir grupo.");
      }
    } catch (err) { toast.error("Erro ao excluir."); }
  };

  return (
    <div className="w-full">
      {/* Header da aba: título + botão Novo */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-['Barlow_Condensed'] text-2xl uppercase font-600">
          Grupos Cadastrados
        </h2>
        <button
          onClick={abrirNovoGrupo}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Grupo
        </button>
      </div>

      {/* Listagem full-width */}
      <div className="bg-[#111111] border border-white/10 rounded-sm overflow-hidden">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-[#1A1A1A] text-white/50 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium border-b border-white/5">Capa</th>
              <th className="px-6 py-4 font-medium border-b border-white/5">Nome</th>
              <th className="px-6 py-4 font-medium border-b border-white/5">Categoria</th>
              <th className="px-6 py-4 font-medium border-b border-white/5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {grupos.map(g => (
              <tr key={g.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-3">
                  {g.caminho_imagem_capa ? (
                    <img src={`http://localhost/leaonorth${g.caminho_imagem_capa}`} alt={g.nome} className="w-14 h-14 object-cover rounded-sm" />
                  ) : (
                    <div className="w-14 h-14 bg-[#080808] flex items-center justify-center text-white/20 rounded-sm">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-3 text-white/80">{g.nome}</td>
                <td className="px-6 py-3 text-white/50">{g.categoria_nome || "—"}</td>
                <td className="px-6 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => abrirEdicaoGrupo(g)}
                    className="bg-[#F0B429]/20 text-[#F0B429] p-2 rounded-full hover:bg-[#F0B429] hover:text-[#080808] transition-all"
                    title="Editar grupo"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExcluirId(g.id)}
                    className="bg-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all ml-2"
                    title="Excluir grupo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {grupos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-white/40">Nenhum grupo cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de cadastro/edição */}
      <AdminDialog
        open={grupoModalOpen}
        onOpenChange={(open) => {
          if (!open) fecharGrupoModal();
        }}
        title={editandoGrupoId != null ? "Editar Grupo" : "Novo Grupo"}
        description="Cadastro de grupo de produtos com capa"
        size="lg"
        footer={
          <>
            <button type="submit" form="admin-grupo-form" disabled={loadingGrupo} className="flex-1 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center disabled:opacity-50">
              {loadingGrupo ? "Salvando..." : "Salvar"}
            </button>
            <button type="button" onClick={fecharGrupoModal} className="px-5 py-3 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors">
              Cancelar
            </button>
          </>
        }
      >
        <form id="admin-grupo-form" onSubmit={handleSaveGrupo} className="space-y-4">
          {/* Nome + Categoria (lado a lado no modal largo) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Nome</label>
              <input
                type="text" required
                value={grupoForm.nome}
                onChange={e => setGrupoForm({ ...grupoForm, nome: e.target.value })}
                className={inputClass}
                placeholder="Ex: Painel de Led Quadrado"
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Categoria</label>
              <select
                required
                value={grupoForm.categoria_id}
                onChange={e => setGrupoForm({ ...grupoForm, categoria_id: Number(e.target.value) })}
                className={inputClass}
              >
                <option value="" disabled>Selecione uma categoria...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Capa (upload único + preview) */}
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">
              Capa ({editandoGrupoId != null ? "opcional — substituir" : "obrigatória"})
            </label>
            <div className="relative overflow-hidden">
              <input
                type="file" accept="image/*"
                onChange={e => handleGrupoFileChange(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className={`${inputClass} flex items-center gap-2 text-white/60 ${grupoFile ? 'text-[#F0B429] border-[#F0B429]/50' : ''}`}>
                <ImageIcon className="w-4 h-4" /> {grupoFile ? grupoFile.name : "Escolher Arquivo..."}
              </div>
            </div>
            {/* Preview: capa atual (edição) ou foto recém-selecionada */}
            {grupoPreview && (
              <img src={grupoPreview} alt="Capa do grupo" className="mt-3 w-full max-h-56 object-cover rounded-sm border border-white/10" />
            )}
          </div>
        </form>
      </AdminDialog>

      {/* Fase 28 — confirmação de exclusão (substitui o window.confirm) */}
      <ConfirmDeleteDialog
        open={excluirId != null}
        onOpenChange={(open) => {
          if (!open) setExcluirId(null);
        }}
        title="Excluir Grupo"
        description="Tem certeza que deseja apagar este grupo?"
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (excluirId != null) await executarExclusaoGrupo(excluirId);
        }}
      />
    </div>
  );
}

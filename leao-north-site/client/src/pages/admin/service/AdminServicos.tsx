/*
 * LEÃO NORTH — Painel Admin: Serviços (Categorias de Serviço) — Fase 23 / 25
 * CRUD da entidade servicos_categorias via api/service/categorias.php (GET)
 * e api/admin/service/*_categoria.php (POST/DELETE).
 *
 * Fase 25 (UX): listagem full-width + botão "Novo Serviço" no topo + formulário
 * em Modal (AdminDialog) com limpeza centralizada no fechamento.
 */
import { useEffect, useState } from "react";
import { Plus, Upload, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/adminFetch";
import AdminDialog from "../AdminDialog";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";

const BASE = "http://localhost/leaonorth";

type Servico = {
  id: number;
  nome: string;
  descricao?: string | null;
};

const inputClass =
  "w-full bg-[#080808] border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm font-['DM_Sans'] focus:border-[#F0B429]/50 focus:outline-none transition-all";

const goldButtonClass =
  "flex-1 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center gap-2 disabled:opacity-50";
const secondaryButtonClass =
  "px-5 py-3 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors";

export default function AdminServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [form, setForm] = useState<{ nome: string; descricao: string }>({
    nome: "",
    descricao: "",
  });
  // Fase 25: editandoId (null = modo "novo") + isModalOpen (controla o Dialog)
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [excluirId, setExcluirId] = useState<number | null>(null); // Fase 28 — id aguardando confirmação

  const fetchServicos = async () => {
    try {
      const res = await fetch(`${BASE}/api/service/categorias.php`);
      const data = await res.json();
      if (Array.isArray(data)) setServicos(data);
    } catch (err) {
      console.error("Erro serviços", err);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const resetForm = () => {
    setForm({ nome: "", descricao: "" });
    setEditandoId(null);
  };

  // Única porta de saída: limpa o formulário e fecha o modal
  const fecharModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const abrirNovo = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const abrirEdicao = (s: Servico) => {
    setEditandoId(s.id);
    setForm({ nome: s.nome, descricao: s.descricao || "" });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return toast.warning("Informe o nome do serviço.");
    setLoading(true);

    const isEdit = editandoId != null;
    const url = isEdit
      ? `${BASE}/api/admin/service/edit_categoria.php`
      : `${BASE}/api/admin/service/add_categoria.php`;

    const fd = new FormData();
    if (isEdit) fd.append("id", String(editandoId));
    fd.append("nome", form.nome);
    fd.append("descricao", form.descricao);

    try {
      const res = await adminFetch(url, { method: "POST", body: fd });
      if (res.ok) {
        fecharModal();
        fetchServicos();
        toast.success(isEdit ? "Serviço atualizado!" : "Serviço criado!");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.mensagem || "Erro ao salvar serviço.");
      }
    } catch (err) {
      toast.error("Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  // Fase 28 — executada somente após a confirmação do ConfirmDeleteDialog
  const executarExclusaoServico = async (id: number) => {
    try {
      const res = await adminFetch(`${BASE}/api/admin/service/delete_categoria.php?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchServicos();
        toast.success("Serviço excluído com sucesso.");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.mensagem || "Erro ao excluir serviço.");
      }
    } catch (err) {
      toast.error("Erro ao excluir.");
    }
  };

  return (
    <div className="w-full">
      {/* Header da aba: título + botão Novo (Fase 25) */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-['Barlow_Condensed'] text-2xl uppercase font-600">
          Serviços no Site
        </h2>
        <button
          onClick={abrirNovo}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      </div>

      {/* Listagem full-width */}
      <div className="bg-[#111111] border border-white/10 rounded-sm overflow-hidden">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-[#1A1A1A] text-white/50 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium border-b border-white/5">Nome</th>
              <th className="px-6 py-4 font-medium border-b border-white/5">Descrição</th>
              <th className="px-6 py-4 font-medium border-b border-white/5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {servicos.map((s) => (
              <tr key={s.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-white/80 font-medium">{s.nome}</td>
                <td className="px-6 py-4 text-white/50 max-w-xs truncate">{s.descricao || "—"}</td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => abrirEdicao(s)}
                    className="bg-[#F0B429]/20 text-[#F0B429] p-2 rounded-full hover:bg-[#F0B429] hover:text-[#080808] transition-all"
                    title="Editar serviço"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setExcluirId(s.id)}
                    className="bg-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all ml-2"
                    title="Excluir serviço"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {servicos.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-white/40">Nenhum serviço cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de cadastro/edição (Fase 25) */}
      <AdminDialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) fecharModal();
        }}
        title={editandoId != null ? "Editar Serviço" : "Novo Serviço"}
        description="Cadastro de serviço exibido no site"
        size="md"
        footer={
          <>
            <button type="submit" form="admin-servico-form" disabled={loading} className={goldButtonClass}>
              {loading ? "Salvando..." : <><Upload className="w-4 h-4" /> Salvar</>}
            </button>
            <button type="button" onClick={fecharModal} className={secondaryButtonClass}>
              Cancelar
            </button>
          </>
        }
      >
        <form id="admin-servico-form" onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Nome</label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className={inputClass}
              placeholder="Ex: Instalações Residenciais"
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className={`${inputClass} min-h-[160px] resize-none`}
              placeholder="Descrição exibida no card de serviço..."
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
        title="Excluir Serviço"
        description="Excluir este serviço? Projetos desta categoria ficarão sem categoria."
        confirmLabel="Excluir"
        onConfirm={async () => {
          if (excluirId != null) await executarExclusaoServico(excluirId);
        }}
      />
    </div>
  );
}

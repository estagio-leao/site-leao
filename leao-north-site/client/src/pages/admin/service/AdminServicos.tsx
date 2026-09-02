/*
 * LEÃO NORTH — Painel Admin: Serviços (Categorias de Serviço) — Fase 23
 * CRUD da entidade servicos_categorias via api/service/categorias.php (GET)
 * e api/admin/service/*_categoria.php (POST/DELETE).
 */
import { useEffect, useState } from "react";
import { Plus, Upload, Pencil, Trash2 } from "lucide-react";

const BASE = "http://localhost/leaonorth";

type Servico = {
  id: number;
  nome: string;
  descricao?: string | null;
};

const inputClass =
  "w-full bg-[#080808] border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm font-['DM_Sans'] focus:border-[#F0B429]/50 focus:outline-none transition-all";

export default function AdminServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [form, setForm] = useState<{ id?: number; nome: string; descricao: string }>({
    nome: "",
    descricao: "",
  });
  const [loading, setLoading] = useState(false);

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

  const resetForm = () => setForm({ nome: "", descricao: "" });

  const entrarEdicao = (s: Servico) => setForm({ id: s.id, nome: s.nome, descricao: s.descricao || "" });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return alert("Informe o nome do serviço.");
    setLoading(true);

    const isEdit = form.id != null;
    const url = isEdit
      ? `${BASE}/api/admin/service/edit_categoria.php`
      : `${BASE}/api/admin/service/add_categoria.php`;

    const fd = new FormData();
    if (isEdit) fd.append("id", String(form.id));
    fd.append("nome", form.nome);
    fd.append("descricao", form.descricao);

    try {
      const res = await fetch(url, { method: "POST", body: fd });
      if (res.ok) {
        resetForm();
        fetchServicos();
        alert(isEdit ? "Serviço atualizado!" : "Serviço criado!");
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao salvar serviço.");
      }
    } catch (err) {
      alert("Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este serviço? Projetos desta categoria ficarão sem categoria.")) return;
    try {
      const res = await fetch(`${BASE}/api/admin/service/delete_categoria.php?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchServicos();
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao excluir serviço.");
      }
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Formulário */}
      <div className="md:col-span-1 bg-[#111111] border border-white/10 rounded-sm p-6 h-fit">
        <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#F0B429]" /> {form.id != null ? "Editar Serviço" : "Novo Serviço"}
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
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
              className={`${inputClass} min-h-[120px] resize-none`}
              placeholder="Descrição exibida no card de serviço..."
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Salvando..." : <><Upload className="w-4 h-4" /> Salvar</>}
            </button>
            {form.id != null && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-3 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listagem */}
      <div className="md:col-span-2">
        <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6">Serviços no Site</h2>
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
                      onClick={() => entrarEdicao(s)}
                      className="bg-[#F0B429]/20 text-[#F0B429] p-2 rounded-full hover:bg-[#F0B429] hover:text-[#080808] transition-all"
                      title="Editar serviço"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
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
      </div>
    </div>
  );
}

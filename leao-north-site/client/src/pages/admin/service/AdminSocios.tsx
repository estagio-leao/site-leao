/*
 * LEÃO NORTH — Painel Admin: Sócios — Fase 23
 * CRUD da entidade socios via api/service/socios.php (GET) e
 * api/admin/service/*_socio.php (POST/DELETE) com foto ÚNICA opcional.
 */
import { useEffect, useState } from "react";
import { Plus, Upload, Pencil, Trash2, User, ImageIcon, X } from "lucide-react";

const BASE = "http://localhost/leaonorth";

type Socio = {
  id: number;
  nome: string;
  subtitulo?: string | null;
  descricao?: string | null;
  caminho_foto?: string | null;
};

const inputClass =
  "w-full bg-[#080808] border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm font-['DM_Sans'] focus:border-[#F0B429]/50 focus:outline-none transition-all";

export default function AdminSocios() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [form, setForm] = useState<{ id?: number; nome: string; subtitulo: string; descricao: string }>({
    nome: "",
    subtitulo: "",
    descricao: "",
  });
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [removerFoto, setRemoverFoto] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSocios = async () => {
    try {
      const res = await fetch(`${BASE}/api/service/socios.php`);
      const data = await res.json();
      if (Array.isArray(data)) setSocios(data);
    } catch (err) {
      console.error("Erro sócios", err);
    }
  };

  useEffect(() => {
    fetchSocios();
  }, []);

  // Revoga um ObjectURL local (apenas quando o preview veio de um arquivo)
  const revogarPreview = () => {
    if (fotoFile && fotoPreview) {
      URL.revokeObjectURL(fotoPreview);
    }
  };

  const handleFotoChange = (file: File | null) => {
    revogarPreview();
    setFotoFile(file);
    setFotoPreview(file ? URL.createObjectURL(file) : null);
    setRemoverFoto(false); // nova foto selecionada cancela o pedido de remoção
  };

  const resetForm = () => {
    revogarPreview();
    setForm({ nome: "", subtitulo: "", descricao: "" });
    setFotoFile(null);
    setFotoPreview(null);
    setRemoverFoto(false);
  };

  const entrarEdicao = (s: Socio) => {
    revogarPreview();
    setForm({ id: s.id, nome: s.nome, subtitulo: s.subtitulo || "", descricao: s.descricao || "" });
    setFotoFile(null);
    setRemoverFoto(false);
    // Preview da foto atual do servidor
    setFotoPreview(s.caminho_foto ? `${BASE}${s.caminho_foto}` : null);
  };

  const handleRemoverFoto = () => {
    revogarPreview();
    setFotoFile(null);
    setFotoPreview(null);
    setRemoverFoto(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return alert("Informe o nome do sócio.");
    setLoading(true);

    const isEdit = form.id != null;
    const url = isEdit
      ? `${BASE}/api/admin/service/edit_socio.php`
      : `${BASE}/api/admin/service/add_socio.php`;

    const fd = new FormData();
    if (isEdit) fd.append("id", String(form.id));
    fd.append("nome", form.nome);
    fd.append("subtitulo", form.subtitulo);
    fd.append("descricao", form.descricao);
    // Foto: só envia arquivo se houver um novo; senão, na edição, permite remover
    if (fotoFile) {
      fd.append("foto", fotoFile);
    } else if (isEdit && removerFoto) {
      fd.append("remover_foto", "1");
    }

    try {
      const res = await fetch(url, { method: "POST", body: fd });
      if (res.ok) {
        resetForm();
        fetchSocios();
        alert(isEdit ? "Sócio atualizado!" : "Sócio criado!");
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao salvar sócio.");
      }
    } catch (err) {
      alert("Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este sócio? A foto também será removida.")) return;
    try {
      const res = await fetch(`${BASE}/api/admin/service/delete_socio.php?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSocios();
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao excluir sócio.");
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
          <Plus className="w-5 h-5 text-[#F0B429]" /> {form.id != null ? "Editar Sócio" : "Novo Sócio"}
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
              placeholder="Ex: Igor Busquim de Moraes"
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Subtítulo / Cargo</label>
            <input
              type="text"
              value={form.subtitulo}
              onChange={(e) => setForm({ ...form, subtitulo: e.target.value })}
              className={inputClass}
              placeholder="Ex: Diretor Executivo"
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className={`${inputClass} min-h-[120px] resize-none`}
              placeholder="Mini-biografia do sócio..."
            />
          </div>

          {/* Foto (upload único + preview) */}
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">
              Foto ({form.id != null ? "opcional — substituir ou remover" : "opcional"})
            </label>
            <div className="relative overflow-hidden">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFotoChange(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className={`${inputClass} flex items-center gap-2 text-white/60 ${fotoFile ? "text-[#F0B429] border-[#F0B429]/50" : ""}`}>
                <ImageIcon className="w-4 h-4" /> {fotoFile ? fotoFile.name : "Escolher Arquivo..."}
              </div>
            </div>

            {fotoPreview ? (
              <div className="relative mt-3">
                <img src={fotoPreview} alt="Foto do sócio" className="w-full h-36 object-cover rounded-sm border border-white/10" />
                {form.id != null && !fotoFile && (
                  <button
                    type="button"
                    onClick={handleRemoverFoto}
                    className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-sm hover:bg-red-500 transition-colors"
                    title="Remover foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-3 w-full h-24 bg-[#080808] border border-white/5 rounded-sm flex items-center justify-center text-white/20">
                <User className="w-8 h-8" />
              </div>
            )}
            {removerFoto && (
              <p className="text-red-400/80 text-xs mt-2">A foto atual será removida ao salvar.</p>
            )}
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
        <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6">Sócios no Site</h2>
        <div className="bg-[#111111] border border-white/10 rounded-sm overflow-hidden">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-[#1A1A1A] text-white/50 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium border-b border-white/5">Foto</th>
                <th className="px-6 py-4 font-medium border-b border-white/5">Nome</th>
                <th className="px-6 py-4 font-medium border-b border-white/5">Cargo</th>
                <th className="px-6 py-4 font-medium border-b border-white/5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {socios.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3">
                    {s.caminho_foto ? (
                      <img src={`${BASE}${s.caminho_foto}`} alt={s.nome} className="w-14 h-14 object-cover rounded-sm" />
                    ) : (
                      <div className="w-14 h-14 bg-[#080808] flex items-center justify-center text-white/20 rounded-sm">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white/80 font-medium">{s.nome}</td>
                  <td className="px-6 py-4 text-white/50">{s.subtitulo || "—"}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => entrarEdicao(s)}
                      className="bg-[#F0B429]/20 text-[#F0B429] p-2 rounded-full hover:bg-[#F0B429] hover:text-[#080808] transition-all"
                      title="Editar sócio"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="bg-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all ml-2"
                      title="Excluir sócio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {socios.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/40">Nenhum sócio cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

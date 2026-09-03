/*
 * LEÃO NORTH — Painel Admin: Portfólio (Projetos) — Fase 23 / 25
 * CRUD relacional (portfolio_projetos + portfolio_imagens) com upload
 * MÚLTIPLO de imagens e seleção de Capa — mesma lógica visual de Produtos.
 *
 * Fase 25 (UX): listagem full-width + botão "Novo Projeto" no topo + formulário
 * em Modal (AdminDialog, size xl). Previews de novas imagens usam ObjectURL
 * gerenciado e são revogados no fechamento (resetForm) para evitar memory leaks.
 *
 * Consumo:
 *   GET    api/service/portfolio.php        (lista projetos + imagens[] + capa)
 *   GET    api/service/categorias.php       (serviços p/ o select de categoria)
 *   POST   api/admin/service/add_projeto.php
 *   POST   api/admin/service/edit_projeto.php
 *   DELETE api/admin/service/delete_projeto.php?id=
 */
import { useEffect, useState } from "react";
import { Plus, Upload, Pencil, Trash2, ImageIcon, X } from "lucide-react";
import AdminDialog from "../AdminDialog";

const BASE = "http://localhost/leaonorth";

type Categoria = { id: number; nome: string; descricao?: string | null };

type ImagemProjeto = {
  caminho_imagem: string;
  is_capa: boolean | number;
};

type Projeto = {
  id: number;
  servico_categoria_id: number | null;
  categoria_nome?: string | null;
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  imagens: ImagemProjeto[];
  capa?: string | null;
};

// Imagem nova local: guarda o ObjectURL junto para revogar no reset
type NovaImagem = { file: File; url: string };

const inputClass =
  "w-full bg-[#080808] border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm font-['DM_Sans'] focus:border-[#F0B429]/50 focus:outline-none transition-all";

const goldButtonClass =
  "flex-1 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center gap-2 disabled:opacity-50";
const secondaryButtonClass =
  "px-5 py-3 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors";

export default function AdminPortfolio() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<{
    titulo: string;
    subtitulo: string;
    descricao: string;
    servico_categoria_id: number | "";
  }>({ titulo: "", subtitulo: "", descricao: "", servico_categoria_id: "" });

  // Fase 25: editandoId (null = modo "novo") + isModalOpen (controla o Dialog)
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fotos: mantidas (já no servidor) + novas (File com ObjectURL) — capa pela LISTA COMBINADA
  const [mantidas, setMantidas] = useState<ImagemProjeto[]>([]);
  const [novas, setNovas] = useState<NovaImagem[]>([]);
  const [capaIndex, setCapaIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchProjetos = async () => {
    try {
      const res = await fetch(`${BASE}/api/service/portfolio.php`);
      const data = await res.json();
      if (Array.isArray(data)) setProjetos(data);
    } catch (err) {
      console.error("Erro portfólio", err);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${BASE}/api/service/categorias.php`);
      const data = await res.json();
      if (Array.isArray(data)) setCategorias(data);
    } catch (err) {
      console.error("Erro categorias de serviço", err);
    }
  };

  useEffect(() => {
    fetchProjetos();
    fetchCategorias();
  }, []);

  const totalFotos = mantidas.length + novas.length;

  // Revoga TODOS os ObjectURLs das imagens novas locais
  const revogarNovas = () => {
    novas.forEach((n) => URL.revokeObjectURL(n.url));
  };

  // Adiciona novas fotos (respeitando o limite de 8 no total)
  const handleAddFiles = (files: FileList | null) => {
    if (!files) return;
    const novos = Array.from(files);
    const total = mantidas.length + novas.length + novos.length;
    if (total > 8) return alert("Máximo de 8 imagens por projeto.");
    const novasComUrl: NovaImagem[] = novos.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setNovas((prev) => [...prev, ...novasComUrl]);
  };

  // Remove uma NOVA imagem (índice relativo a `novas`) e recalcula a capa
  const handleRemoveNova = (index: number) => {
    setNovas((prev) => {
      const alvo = prev[index];
      if (alvo) URL.revokeObjectURL(alvo.url);
      const novo = prev.filter((_, i) => i !== index);
      const combinado = mantidas.length + index; // posição na lista combinada
      setCapaIndex((prevCapa) => {
        if (combinado === prevCapa) return 0;
        if (combinado < prevCapa) return prevCapa - 1;
        return prevCapa;
      });
      return novo;
    });
  };

  // Remove uma imagem ANTIGA mantida (índice relativo a `mantidas`) e recalcula a capa
  const handleRemoveMantida = (index: number) => {
    setMantidas((prev) => {
      const novo = prev.filter((_, i) => i !== index);
      setCapaIndex((prevCapa) => {
        if (index === prevCapa) return 0;
        if (index < prevCapa) return prevCapa - 1;
        return prevCapa;
      });
      return novo;
    });
  };

  // Fase 25: limpeza completa (revogando ObjectURLs) — chamada em TODO fechamento do modal
  const resetForm = () => {
    revogarNovas();
    setForm({ titulo: "", subtitulo: "", descricao: "", servico_categoria_id: "" });
    setEditandoId(null);
    setMantidas([]);
    setNovas([]);
    setCapaIndex(0);
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

  const abrirEdicao = (proj: Projeto) => {
    revogarNovas();
    setEditandoId(proj.id);
    setForm({
      titulo: proj.titulo || "",
      subtitulo: proj.subtitulo || "",
      descricao: proj.descricao || "",
      servico_categoria_id: proj.servico_categoria_id ?? "",
    });
    setMantidas(proj.imagens || []);
    setNovas([]);
    const capaIdx = (proj.imagens || []).findIndex((i) => i.is_capa === true || i.is_capa === 1);
    setCapaIndex(capaIdx >= 0 ? capaIdx : 0);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = editandoId != null;
    if (!form.titulo.trim()) return alert("Informe o título do projeto.");
    if (!isEdit && novas.length === 0) return alert("Selecione pelo menos uma imagem!");
    if (isEdit && totalFotos === 0) return alert("O projeto deve ter ao menos 1 imagem.");
    setLoading(true);

    const fd = new FormData();
    if (isEdit) fd.append("id", String(editandoId));
    fd.append("titulo", form.titulo);
    fd.append("subtitulo", form.subtitulo);
    fd.append("descricao", form.descricao);
    if (form.servico_categoria_id !== "") fd.append("servico_categoria_id", String(form.servico_categoria_id));
    fd.append("capa_index", String(capaIndex));
    if (isEdit) {
      // Lista combinada em ordem: mantidas primeiro, depois novas
      fd.append("imagens_mantidas", JSON.stringify(mantidas.map((i) => i.caminho_imagem)));
      // "novas_imagens[]" com colchetes p/ o PHP ler como Array
      novas.forEach((n) => fd.append("novas_imagens[]", n.file));
    } else {
      // No cadastro, o endpoint espera "imagens[]" (com colchetes) — sem imagens_mantidas
      novas.forEach((n) => fd.append("imagens[]", n.file));
    }

    const url = isEdit
      ? `${BASE}/api/admin/service/edit_projeto.php`
      : `${BASE}/api/admin/service/add_projeto.php`;

    try {
      const res = await fetch(url, { method: "POST", body: fd });
      if (res.ok) {
        fecharModal();
        fetchProjetos();
        alert(isEdit ? "Projeto atualizado!" : "Projeto adicionado!");
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao salvar projeto.");
      }
    } catch (err) {
      alert("Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este projeto? Todas as imagens serão removidas.")) return;
    try {
      const res = await fetch(`${BASE}/api/admin/service/delete_projeto.php?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProjetos();
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao excluir projeto.");
      }
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="w-full">
      {/* Header da aba: título + botão Novo (Fase 25) */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-['Barlow_Condensed'] text-2xl uppercase font-600">
          Projetos no Site
        </h2>
        <button
          onClick={abrirNovo}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Projeto
        </button>
      </div>

      {/* Listagem full-width */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projetos.map((proj) => {
          const capa = proj.capa || proj.imagens?.[0]?.caminho_imagem;
          return (
            <div key={proj.id} className="bg-[#111111] border border-white/10 rounded-sm overflow-hidden group flex flex-col">
              <div className="h-44 overflow-hidden relative bg-[#080808]">
                {capa ? (
                  <img src={`${BASE}${capa}`} alt={proj.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => abrirEdicao(proj)}
                    className="bg-[#F0B429]/20 text-[#F0B429] p-2 rounded-full hover:bg-[#F0B429] hover:text-[#080808] transition-all"
                    title="Editar projeto"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="bg-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all"
                    title="Excluir projeto"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1">
                <span className="text-[#F0B429] text-[10px] tracking-widest uppercase">
                  {proj.categoria_nome || "Sem categoria"} • {proj.imagens?.length || 0} foto(s)
                </span>
                <h3 className="text-white font-medium text-sm mt-1">{proj.titulo}</h3>
                {proj.subtitulo && <p className="text-white/50 text-xs mt-1 line-clamp-2">{proj.subtitulo}</p>}
              </div>
            </div>
          );
        })}
        {projetos.length === 0 && (
          <div className="col-span-full text-center text-white/40 py-10 border border-dashed border-white/10 rounded-sm">
            Nenhum projeto cadastrado.
          </div>
        )}
      </div>

      {/* Modal de cadastro/edição (Fase 25) — Modal XL para upload múltiplo */}
      <AdminDialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) fecharModal();
        }}
        title={editandoId != null ? "Editar Projeto" : "Novo Projeto"}
        description="Cadastro de projeto de portfólio com múltiplas fotos"
        size="xl"
        footer={
          <>
            <button type="submit" form="admin-portfolio-form" disabled={loading} className={goldButtonClass}>
              {loading ? "Salvando..." : <><Upload className="w-4 h-4" /> {editandoId != null ? "Salvar Alterações" : "Salvar Projeto"}</>}
            </button>
            <button type="button" onClick={fecharModal} className={secondaryButtonClass}>
              Cancelar
            </button>
          </>
        }
      >
        <form id="admin-portfolio-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Título</label>
              <input
                type="text"
                required
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className={inputClass}
                placeholder="Ex: Casa Alto Padrão — Cornélio Procópio"
              />
            </div>
            <div>
              <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Categoria (Serviço)</label>
              <select
                value={form.servico_categoria_id}
                onChange={(e) =>
                  setForm({ ...form, servico_categoria_id: e.target.value === "" ? "" : Number(e.target.value) })
                }
                className={inputClass}
              >
                <option value="">Sem categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Subtítulo</label>
            <input
              type="text"
              value={form.subtitulo}
              onChange={(e) => setForm({ ...form, subtitulo: e.target.value })}
              className={inputClass}
              placeholder="Ex: Projeto + execução de quadro geral e iluminação"
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className={`${inputClass} min-h-[160px] resize-none`}
              placeholder="Detalhes do projeto..."
            />
          </div>

          {/* Fotos múltiplas + seleção de capa */}
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">
              Fotos ({totalFotos}/8) — clique na foto para definir a Capa
            </label>
            <div className="relative overflow-hidden mb-3">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleAddFiles(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className={`${inputClass} flex items-center gap-2 text-white/60`}>
                <ImageIcon className="w-4 h-4" /> {totalFotos > 0 ? "Adicionar mais fotos..." : "Escolher Arquivos..."}
              </div>
            </div>

            {totalFotos > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {/* Imagens antigas mantidas */}
                {mantidas.map((img, i) => (
                  <div
                    key={`antiga-${i}`}
                    onClick={() => setCapaIndex(i)}
                    className={`relative rounded-sm overflow-hidden cursor-pointer border-2 transition-all ${i === capaIndex ? "border-[#F0B429]" : "border-transparent"}`}
                    title={i === capaIndex ? "Capa" : "Clique para definir como Capa"}
                  >
                    <img src={`${BASE}${img.caminho_imagem}`} alt={`Foto ${i + 1}`} className="w-full h-20 object-cover" />
                    {i === capaIndex && (
                      <span className="absolute top-0 left-0 bg-[#F0B429] text-[#080808] text-[9px] font-bold px-1 uppercase">Capa</span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveMantida(i); }}
                      className="absolute top-0 right-0 bg-red-500/80 text-white p-0.5"
                      title="Remover foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Novas imagens */}
                {novas.map((n, i) => {
                  const indice = mantidas.length + i;
                  return (
                    <div
                      key={`nova-${i}`}
                      onClick={() => setCapaIndex(indice)}
                      className={`relative rounded-sm overflow-hidden cursor-pointer border-2 transition-all ${indice === capaIndex ? "border-[#F0B429]" : "border-transparent"}`}
                      title={indice === capaIndex ? "Capa" : "Clique para definir como Capa"}
                    >
                      <img src={n.url} alt={`Nova ${i + 1}`} className="w-full h-20 object-cover" />
                      {indice === capaIndex && (
                        <span className="absolute top-0 left-0 bg-[#F0B429] text-[#080808] text-[9px] font-bold px-1 uppercase">Capa</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveNova(i); }}
                        className="absolute top-0 right-0 bg-red-500/80 text-white p-0.5"
                        title="Remover foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </form>
      </AdminDialog>
    </div>
  );
}

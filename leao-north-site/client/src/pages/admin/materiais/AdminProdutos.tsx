/*
 * LEÃO NORTH — Painel Admin: Produtos (Leão Materiais) — Fase 26 (extraído do Dashboard)
 * Componente autossuficiente: busca produtos + categorias + grupos, e mantém toda a
 * lógica de:
 *   - listagem agrupada em "pastas" (drill-down via grupoAtivo — Fase 14)
 *   - múltiplas imagens (até 8) com capa (capaIndex) — ObjectURL gerenciado
 *   - informações adicionais dinâmicas (chave/valor)
 *   - criar/editar/excluir/duplicar via api/admin/*_produto.php
 *   - formulário em Modal XL (AdminDialog size="xl") — Fase 25
 */
import { useEffect, useMemo, useState } from "react";
import {
  Plus, Upload, Pencil, Trash2, Copy, ArrowLeft,
  Image as ImageIcon, X, FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/adminFetch";
import AdminDialog from "../AdminDialog";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";

const inputClass =
  "w-full bg-[#080808] border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm font-['DM_Sans'] focus:border-[#F0B429]/50 focus:outline-none transition-all";

// Imagem nova local: guarda o ObjectURL junto para revogar no reset (evita memory leak)
type NovaImagem = { file: File; url: string };

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);

  // Formulário complexo (Fase 6/7)
  const [prodForm, setProdForm] = useState({
    nome: "",
    especificacao: "",
    descricao: "",
    categoria_id: "" as number | "",
    grupo_id: "" as number | "",
  });
  const [prodFiles, setProdFiles] = useState<NovaImagem[]>([]);
  const [capaIndex, setCapaIndex] = useState(0);
  const [infoList, setInfoList] = useState<{ titulo: string; texto: string }[]>([]);
  const [loadingProd, setLoadingProd] = useState(false);

  // Modo edição de produto (Fase 9)
  const [produtoEditandoId, setProdutoEditandoId] = useState<number | null>(null); // null = modo adicionar
  const [prodModalOpen, setProdModalOpen] = useState(false); // Fase 25: abre/fecha o Dialog
  const [imgsMantidas, setImgsMantidas] = useState<{ caminho_imagem: string; is_capa: boolean | number }[]>([]);

  // Navegação em "pastas" da listagem (Fase 14): null = visão raiz | id do grupo = dentro da pasta
  const [grupoAtivo, setGrupoAtivo] = useState<string | null>(null);

  // Fase 28 — confirmação única p/ excluir ou duplicar (substitui os window.confirm)
  const [confirmar, setConfirmar] = useState<null | { tipo: "delete" | "duplicate"; id: number }>(null);

  const fetchProdutos = async () => {
    try {
      const res = await fetch("http://localhost/leaonorth/api/produtos.php");
      const data = await res.json();
      if (Array.isArray(data)) setProdutos(data);
    } catch (err) { console.error("Erro produtos", err); }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch("http://localhost/leaonorth/api/categorias.php");
      const data = await res.json();
      if (Array.isArray(data)) setCategorias(data);
    } catch (err) { console.error("Erro categorias", err); }
  };

  const fetchGrupos = async () => {
    try {
      const res = await fetch("http://localhost/leaonorth/api/grupos.php");
      const data = await res.json();
      if (Array.isArray(data)) setGrupos(data);
    } catch (err) { console.error("Erro grupos", err); }
  };

  useEffect(() => {
    fetchProdutos();
    fetchCategorias();
    fetchGrupos();
  }, []);

  // Adiciona arquivos selecionados ao array (limite de 8, considerando mantidas + novas)
  const handleAddProdFiles = (files: FileList | null) => {
    if (!files) return;
    const novos = Array.from(files);
    const total = imgsMantidas.length + prodFiles.length + novos.length;
    if (total > 8) return toast.warning("Máximo de 8 imagens por produto.");
    const novasComUrl: NovaImagem[] = novos.map(file => ({ file, url: URL.createObjectURL(file) }));
    setProdFiles(prev => [...prev, ...novasComUrl]);
  };

  // Remove uma NOVA imagem (índice relativo às prodFiles) e recalcula a capa
  const handleRemoveProdFile = (index: number) => {
    setProdFiles(prev => {
      const alvo = prev[index];
      if (alvo) URL.revokeObjectURL(alvo.url); // revoga o ObjectURL removido
      const novo = prev.filter((_, i) => i !== index);
      const combinado = imgsMantidas.length + index; // posição na lista combinada
      setCapaIndex(prevCapa => {
        if (combinado === prevCapa) return 0;
        if (combinado < prevCapa) return prevCapa - 1;
        return prevCapa;
      });
      return novo;
    });
  };

  // Remove uma imagem ANTIGA mantida (índice relativo às imgsMantidas) e recalcula a capa
  const handleRemoveImgMantida = (index: number) => {
    setImgsMantidas(prev => {
      const novo = prev.filter((_, i) => i !== index);
      setCapaIndex(prevCapa => {
        if (index === prevCapa) return 0;
        if (index < prevCapa) return prevCapa - 1;
        return prevCapa;
      });
      return novo;
    });
  };

  // ---- Informações adicionais (dinâmicas) ----
  const handleAddInfo = () => setInfoList(prev => [...prev, { titulo: "", texto: "" }]);

  const handleUpdateInfo = (index: number, campo: "titulo" | "texto", valor: string) => {
    setInfoList(prev => prev.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)));
  };

  const handleRemoveInfo = (index: number) =>
    setInfoList(prev => prev.filter((_, i) => i !== index));

  // Reset do formulário (sai do modo edição e volta para "Adicionar")
  const resetProdForm = () => {
    // Revoga os ObjectURLs das novas imagens locais para evitar memory leak
    prodFiles.forEach(p => URL.revokeObjectURL(p.url));
    setProdutoEditandoId(null);
    setImgsMantidas([]);
    setProdForm({ nome: "", especificacao: "", descricao: "", categoria_id: "", grupo_id: "" });
    setProdFiles([]);
    setCapaIndex(0);
    setInfoList([]);
  };

  // Fase 25: única porta de saída do modal
  const fecharProdModal = () => {
    resetProdForm();
    setProdModalOpen(false);
  };

  const abrirNovoProduto = () => {
    resetProdForm();
    setProdModalOpen(true);
  };

  // Entra no modo edição preenchendo o formulário e abre o Modal (Fase 25)
  const entrarEdicao = (prod: any) => {
    // Revoga imagens novas locais pendentes antes de preencher (caso haja)
    prodFiles.forEach(p => URL.revokeObjectURL(p.url));
    setProdutoEditandoId(prod.id);
    setProdForm({
      nome: prod.nome || "",
      especificacao: prod.especificacao || "",
      descricao: prod.descricao || "",
      categoria_id: prod.categoria_id ?? "",
      grupo_id: prod.grupo_id ?? "",
    });
    setImgsMantidas(prod.imagens || []);
    setProdFiles([]);
    const capaIdx = (prod.imagens || []).findIndex((i: any) => i.is_capa === true || i.is_capa === 1);
    setCapaIndex(capaIdx >= 0 ? capaIdx : 0);
    setInfoList(prod.informacoes || []);
    setProdModalOpen(true);
  };

  const handleEditProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (produtoEditandoId === null) return;
    if (imgsMantidas.length + prodFiles.length === 0) return toast.warning("O produto deve ter ao menos 1 imagem.");
    setLoadingProd(true);

    const formData = new FormData();
    formData.append("id", String(produtoEditandoId));
    formData.append("nome", prodForm.nome);
    formData.append("especificacao", prodForm.especificacao);
    formData.append("categoria_id", String(prodForm.categoria_id));
    formData.append("descricao", prodForm.descricao);
    // Grupo é opcional: só envia se um grupo foi selecionado
    if (prodForm.grupo_id !== "") formData.append("grupo_id", String(prodForm.grupo_id));
    // Lista combinada em ordem: mantidas primeiro, depois novas
    formData.append("imagens_mantidas", JSON.stringify(imgsMantidas.map(i => i.caminho_imagem)));
    formData.append("capa_index", String(capaIndex));
    formData.append("informacoes", JSON.stringify(infoList));
    // 🚨 CRÍTICO: "novas_imagens[]" com colchetes para o PHP ler como Array (mesmo padrão do add_produto)
    prodFiles.forEach(p => formData.append("novas_imagens[]", p.file));

    try {
      const res = await adminFetch("http://localhost/leaonorth/api/admin/edit_produto.php", {
        method: "POST", body: formData,
      });
      if (res.ok) {
        fecharProdModal();
        fetchProdutos();
        toast.success("Produto atualizado!");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.mensagem || "Erro ao atualizar produto.");
      }
    } catch (err) { toast.error("Erro ao enviar."); } finally { setLoadingProd(false); }
  };

  const handleAddProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prodFiles.length === 0) return toast.warning("Selecione pelo menos uma imagem!");
    setLoadingProd(true);

    const formData = new FormData();

    // A MÁGICA ESTÁ AQUI: "imagens[]" com colchetes para o PHP ler como Array!
    prodFiles.forEach(p => formData.append("imagens[]", p.file));

    formData.append("capa_index", String(capaIndex));
    formData.append("informacoes", JSON.stringify(infoList)); // string JSON
    formData.append("nome", prodForm.nome);
    formData.append("especificacao", prodForm.especificacao);
    formData.append("categoria_id", String(prodForm.categoria_id));
    formData.append("descricao", prodForm.descricao);
    // Grupo é opcional: só envia se um grupo foi selecionado
    if (prodForm.grupo_id !== "") formData.append("grupo_id", String(prodForm.grupo_id));

    try {
      const res = await adminFetch("http://localhost/leaonorth/api/admin/add_produto.php", {
        method: "POST", body: formData,
      });

      if (res.ok) {
        fecharProdModal();
        fetchProdutos();
        toast.success("Produto adicionado!");
      } else {
        // Exibe a mensagem de validação do backend (MIME/5MB/erros)
        const err = await res.json().catch(() => null);
        toast.error(err?.mensagem || "Erro ao salvar produto.");
      }
    } catch (err) { toast.error("Erro ao enviar."); } finally { setLoadingProd(false); }
  };

  // Fase 28 — executada somente após a confirmação do ConfirmDeleteDialog
  const executarExclusaoProduto = async (id: number) => {
    try {
      await adminFetch(`http://localhost/leaonorth/api/admin/delete_produto.php?id=${id}`, { method: "DELETE" });
      fetchProdutos();
      toast.success("Produto excluído com sucesso.");
    } catch (err) { toast.error("Erro ao excluir."); }
  };

  // Duplica um produto (Fase 12): POST em duplicate_produto.php com o id no FormData
  // Fase 28 — executada somente após a confirmação do ConfirmDeleteDialog
  const executarDuplicacaoProduto = async (id: number) => {
    const formData = new FormData();
    formData.append("id", String(id));

    try {
      const res = await adminFetch("http://localhost/leaonorth/api/admin/duplicate_produto.php", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fetchProdutos(); // recarrega a listagem
        toast.success("Produto duplicado com sucesso!");
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.mensagem || "Erro ao duplicar produto.");
      }
    } catch (err) {
      toast.error("Erro ao duplicar produto.");
    }
  };

  // --- FASE 14: Listagem agrupada em "pastas" (drill-down) ---
  // Visão raiz: produtos sem grupo (avulsos) → cards individuais; produtos com grupo → pastas
  const { avulsos, gruposPasta } = useMemo(() => {
    const mapa = new Map<number, any[]>();
    const semGrupo: any[] = [];
    for (const p of produtos) {
      const gid = p.grupo_id; // Fase 18: agrupa por ID
      if (gid === null || gid === undefined || gid === "") {
        semGrupo.push(p);
      } else {
        if (!mapa.has(gid)) mapa.set(gid, []);
        mapa.get(gid)!.push(p);
      }
    }
    return { avulsos: semGrupo, gruposPasta: Array.from(mapa.entries()) };
  }, [produtos]);

  // Produtos da pasta ativa (visão dentro do grupo)
  const produtosDoGrupo = useMemo(
    () =>
      grupoAtivo !== null
        ? produtos.filter(p => Number(p.grupo_id) === Number(grupoAtivo))
        : [],
    [produtos, grupoAtivo]
  );

  // Card de produto individual — com Editar/Duplicar/Excluir
  const renderProdutoCard = (prod: any) => {
    const capa = prod.imagens?.find((i: any) => i.is_capa)?.caminho_imagem;
    return (
      <div key={prod.id} className="bg-[#111111] border border-white/10 rounded-sm overflow-hidden group flex flex-col">
        <div className="h-40 overflow-hidden relative bg-[#080808]">
          {capa ? (
            <img src={`http://localhost/leaonorth${capa}`} alt={prod.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <ImageIcon className="w-10 h-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button onClick={() => entrarEdicao(prod)} className="bg-[#F0B429]/20 text-[#F0B429] p-2 rounded-full hover:bg-[#F0B429] hover:text-[#080808] transition-all" title="Editar produto">
              <Pencil className="w-5 h-5" />
            </button>
            <button onClick={() => setConfirmar({ tipo: "duplicate", id: prod.id })} className="bg-sky-500/20 text-sky-400 p-2 rounded-full hover:bg-sky-500 hover:text-white transition-all" title="Duplicar produto">
              <Copy className="w-5 h-5" />
            </button>
            <button onClick={() => setConfirmar({ tipo: "delete", id: prod.id })} className="bg-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all" title="Excluir produto">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 flex-1">
          <span className="text-[#F0B429] text-[10px] tracking-widest uppercase">{prod.categoria_nome || "Geral"} • {prod.imagens?.length || 0} foto(s)</span>
          {prod.grupo_nome && (
            <p className="text-sky-400/80 text-[10px] tracking-widest uppercase mt-0.5">Grupo: {prod.grupo_nome}</p>
          )}
          <h3 className="text-white font-medium text-sm mt-1">{prod.nome}</h3>
          {prod.especificacao && <p className="text-white/50 text-xs mt-1 line-clamp-2">{prod.especificacao}</p>}
        </div>
      </div>
    );
  };

  // Card de Pasta/Grupo — resumido, com botão "Ver Variações" (Fase 14)
  const renderGrupoPasta = (grupoId: number, variacoes: any[]) => {
    const primeiro = variacoes[0];
    const capa = primeiro?.grupo_capa; // Fase 18: capa EXCLUSIVA do grupo (nativa do JSON)
    const nomeGrupo = primeiro?.grupo_nome || "Grupo";
    return (
      <div key={`pasta-${grupoId}`} className="bg-[#111111] border border-white/10 rounded-sm overflow-hidden flex flex-col">
        <div className="h-40 overflow-hidden relative bg-[#080808]">
          {capa ? (
            <img src={`http://localhost/leaonorth${capa}`} alt={nomeGrupo} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <FolderOpen className="w-10 h-10" />
            </div>
          )}
          <span className="absolute top-2 left-2 bg-sky-500/20 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-sky-500/30">
            {variacoes.length} variação{variacoes.length > 1 ? "ões" : ""}
          </span>
        </div>
        <div className="p-4 flex-1">
          <span className="text-[#F0B429] text-[10px] tracking-widest uppercase">{primeiro?.categoria_nome || "Grupo"}</span>
          <h3 className="text-white font-medium text-sm mt-1">{nomeGrupo}</h3>
          <p className="text-white/40 text-xs mt-1">{variacoes.length} produto(s) nesta família.</p>
        </div>
        <div className="p-4 pt-0">
          <button
            onClick={() => setGrupoAtivo(String(grupoId))}
            className="w-full py-2.5 bg-sky-500/20 text-sky-400 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-sky-500 hover:text-white transition-all"
          >
            Ver Variações
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header da aba: título + botão Novo */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-['Barlow_Condensed'] text-2xl uppercase font-600">
          Produtos Cadastrados
        </h2>
        <button
          onClick={abrirNovoProduto}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Produto
        </button>
      </div>

      {/* Botão voltar quando dentro de um grupo (Fase 14) */}
      {grupoAtivo !== null && (
        <button
          onClick={() => setGrupoAtivo(null)}
          className="inline-flex items-center gap-2 text-sky-400 text-sm uppercase tracking-wider hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a listagem principal
        </button>
      )}

      {/* Listagem full-width */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {grupoAtivo === null ? (
          /* ===== VISÃO RAIZ ===== */
          <>
            {avulsos.map(renderProdutoCard)}
            {gruposPasta.map(([grupoId, variacoes]) => renderGrupoPasta(grupoId, variacoes))}
            {produtos.length === 0 && (
              <div className="col-span-full text-center text-white/40 py-10 border border-dashed border-white/10 rounded-sm">
                Nenhum produto cadastrado.
              </div>
            )}
          </>
        ) : produtosDoGrupo.length > 0 ? (
          /* ===== VISÃO DENTRO DO GRUPO ===== */
          produtosDoGrupo.map(renderProdutoCard)
        ) : (
          /* Pasta vazia (ex.: excluiu a última variação) */
          <div className="col-span-full text-center text-white/40 py-10 border border-dashed border-white/10 rounded-sm">
            Nenhuma variação neste grupo.
          </div>
        )}
      </div>

      {/* Modal de cadastro/edição (Fase 25) — Modal XL para upload múltiplo */}
      <AdminDialog
        open={prodModalOpen}
        onOpenChange={(open) => {
          if (!open) fecharProdModal();
        }}
        title={produtoEditandoId !== null ? "Editar Produto" : "Novo Produto"}
        description="Cadastro de produto com múltiplas fotos e informações"
        size="xl"
        footer={
          <>
            <button type="submit" form="admin-produto-form" disabled={loadingProd} className="flex-1 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {loadingProd ? "Salvando..." : <><Upload className="w-4 h-4" /> {produtoEditandoId !== null ? "Salvar Alterações" : "Salvar Produto"}</>}
            </button>
            <button type="button" onClick={fecharProdModal} className="px-5 py-3 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors">
              Cancelar
            </button>
          </>
        }
      >
        <form id="admin-produto-form" onSubmit={produtoEditandoId !== null ? handleEditProduto : handleAddProduto} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Nome</label>
              <input type="text" required value={prodForm.nome} onChange={e => setProdForm({...prodForm, nome: e.target.value})} className={inputClass} placeholder="Ex: Disjuntor 63A" />
            </div>
            <div>
              <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Categoria</label>
              <select
                required
                value={prodForm.categoria_id}
                onChange={e => {
                  const novaCategoria = Number(e.target.value);
                  // UX: ao trocar de categoria, limpa o grupo se ele não pertencer à nova categoria
                  setProdForm(prev => ({
                    ...prev,
                    categoria_id: novaCategoria,
                    grupo_id:
                      prev.grupo_id !== "" &&
                      grupos.some(g => g.id === prev.grupo_id && g.categoria_id === novaCategoria)
                        ? prev.grupo_id
                        : "",
                  }));
                }}
                className={inputClass}
              >
                <option value="" disabled>Selecione uma categoria...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Grupo (Família) — Opcional</label>
            <select
              value={prodForm.grupo_id}
              onChange={e => setProdForm({ ...prodForm, grupo_id: Number(e.target.value) })}
              className={inputClass}
              disabled={prodForm.categoria_id === ""}
            >
              <option value="">Sem grupo</option>
              {grupos
                .filter(g => prodForm.categoria_id !== "" && g.categoria_id === Number(prodForm.categoria_id))
                .map(g => (
                  <option key={g.id} value={g.id}>{g.nome}</option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Especificação</label>
            <textarea value={prodForm.especificacao} onChange={e => setProdForm({...prodForm, especificacao: e.target.value})} className={`${inputClass} min-h-[120px] resize-none`} placeholder="Detalhes técnicos do produto..." />
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Descrição</label>
            <textarea value={prodForm.descricao} onChange={e => setProdForm({...prodForm, descricao: e.target.value})} className={`${inputClass} min-h-[180px] resize-none`} placeholder="Descrição longa do produto. Quebras de linha são preservadas." />
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">
              Fotos ({imgsMantidas.length + prodFiles.length}/8) — clique na foto para definir a Capa
            </label>
            <div className="relative overflow-hidden mb-3">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={e => handleAddProdFiles(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className={`${inputClass} flex items-center gap-2 text-white/60`}>
                <ImageIcon className="w-4 h-4" /> {imgsMantidas.length + prodFiles.length > 0 ? "Adicionar mais fotos..." : "Escolher Arquivos..."}
              </div>
            </div>

            {(imgsMantidas.length > 0 || prodFiles.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {/* Imagens antigas mantidas */}
                {imgsMantidas.map((img, i) => (
                  <div
                    key={`antiga-${i}`}
                    onClick={() => setCapaIndex(i)}
                    className={`relative rounded-sm overflow-hidden cursor-pointer border-2 transition-all ${i === capaIndex ? "border-[#F0B429]" : "border-transparent"}`}
                    title={i === capaIndex ? "Capa" : "Clique para definir como Capa"}
                  >
                    <img src={`http://localhost/leaonorth${img.caminho_imagem}`} alt={`Foto ${i + 1}`} className="w-full h-20 object-cover" />
                    {i === capaIndex && (
                      <span className="absolute top-0 left-0 bg-[#F0B429] text-[#080808] text-[9px] font-bold px-1 uppercase">Capa</span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveImgMantida(i); }}
                      className="absolute top-0 right-0 bg-red-500/80 text-white p-0.5"
                      title="Remover foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {/* Novas imagens (ObjectURL gerenciado) */}
                {prodFiles.map((p, i) => {
                  const indice = imgsMantidas.length + i;
                  return (
                    <div
                      key={`nova-${i}`}
                      onClick={() => setCapaIndex(indice)}
                      className={`relative rounded-sm overflow-hidden cursor-pointer border-2 transition-all ${indice === capaIndex ? "border-[#F0B429]" : "border-transparent"}`}
                      title={indice === capaIndex ? "Capa" : "Clique para definir como Capa"}
                    >
                      <img src={p.url} alt={`Nova ${i + 1}`} className="w-full h-20 object-cover" />
                      {indice === capaIndex && (
                        <span className="absolute top-0 left-0 bg-[#F0B429] text-[#080808] text-[9px] font-bold px-1 uppercase">Capa</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveProdFile(i); }}
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
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-white/40 text-xs tracking-widest uppercase">Informações Adicionais</label>
              <button
                type="button"
                onClick={handleAddInfo}
                className="flex items-center gap-1 text-[#F0B429] text-xs font-['DM_Sans'] uppercase tracking-wider hover:text-[#FFD060] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Informação
              </button>
            </div>
            <div className="space-y-2">
              {infoList.map((info, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    type="text"
                    value={info.titulo}
                    onChange={e => handleUpdateInfo(i, "titulo", e.target.value)}
                    className={`${inputClass} sm:!w-2/5`}
                    placeholder="Título (ex.: Temperatura)"
                  />
                  <input
                    type="text"
                    value={info.texto}
                    onChange={e => handleUpdateInfo(i, "texto", e.target.value)}
                    className={`${inputClass} flex-1`}
                    placeholder="Texto (ex.: 6500K)"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveInfo(i)}
                    className="mt-1 text-red-500/60 hover:text-red-500 transition-colors p-1"
                    title="Remover informação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {infoList.length === 0 && (
                <p className="text-white/30 text-xs italic">Nenhuma informação adicional. Clique em "+ Adicionar Informação".</p>
              )}
            </div>
          </div>
        </form>
      </AdminDialog>

      {/* Fase 28 — confirmação de excluir/duplicar (substitui os window.confirm) */}
      <ConfirmDeleteDialog
        open={confirmar != null}
        onOpenChange={(open) => {
          if (!open) setConfirmar(null);
        }}
        title={confirmar?.tipo === "duplicate" ? "Duplicar Produto" : "Excluir Produto"}
        description={
          confirmar?.tipo === "duplicate"
            ? "Duplicar este produto? Uma cópia independente será criada."
            : "Tem certeza que deseja apagar este produto?"
        }
        confirmLabel={confirmar?.tipo === "duplicate" ? "Duplicar" : "Excluir"}
        destructive={confirmar?.tipo !== "duplicate"}
        onConfirm={async () => {
          if (confirmar?.tipo === "duplicate") await executarDuplicacaoProduto(confirmar.id);
          else if (confirmar?.tipo === "delete") await executarExclusaoProduto(confirmar.id);
        }}
      />
    </div>
  );
}

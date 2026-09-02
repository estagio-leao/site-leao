import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { LogOut, Upload, Trash2, Plus, Image as ImageIcon, LayoutDashboard, Mail, Star, FolderOpen, Package, X, Pencil, Copy, ArrowLeft, Tag, Wrench, Users } from "lucide-react";
import AdminServicos from "./service/AdminServicos";
import AdminSocios from "./service/AdminSocios";
import AdminPortfolio from "./service/AdminPortfolio";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("portfolio");
  
  // Estados de Mensagens e Depoimentos
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<any>(null); // Estado que controla o Modal de Leitura
  const [depoimentos, setDepoimentos] = useState<any[]>([]);
  const [depForm, setDepForm] = useState<{ id?: number; nome: string; estrelas: number; texto: string; }>({ nome: "", estrelas: 5, texto: "" });
  const [loadingDep, setLoadingDep] = useState(false);

  // Estados do Catálogo de Produtos (formato complexo - Fase 6/7)
  const [produtos, setProdutos] = useState<any[]>([]);
  const [prodForm, setProdForm] = useState({
    nome: "",
    especificacao: "",
    descricao: "",
    categoria_id: "" as number | "", // Fase 18: id da categoria
    grupo_id: "" as number | "",     // Fase 18: id do grupo, opcional
  });
  const [prodFiles, setProdFiles] = useState<File[]>([]);
  const [capaIndex, setCapaIndex] = useState(0);
  const [infoList, setInfoList] = useState<{ titulo: string; texto: string }[]>([]);
  const [loadingProd, setLoadingProd] = useState(false);

  // Modo edição de produto (Fase 9)
  const [produtoEditandoId, setProdutoEditandoId] = useState<number | null>(null); // null = modo adicionar
  const [imgsMantidas, setImgsMantidas] = useState<{ caminho_imagem: string; is_capa: boolean | number }[]>([]);

  // Navegação em "pastas" da listagem (Fase 14): null = visão raiz | nome do grupo = dentro da pasta
  const [grupoAtivo, setGrupoAtivo] = useState<string | null>(null);

  // Estados de Categorias (Fase 16)
  const [categorias, setCategorias] = useState<any[]>([]);
  const [catForm, setCatForm] = useState<{ id?: number; nome: string }>({ nome: "" });
  const [loadingCat, setLoadingCat] = useState(false);

  // Estados de Grupos (Fase 17)
  const [grupos, setGrupos] = useState<any[]>([]);
  const [grupoForm, setGrupoForm] = useState<{ id?: number; nome: string; categoria_id: number | "" }>({
    nome: "",
    categoria_id: "",
  });
  const [grupoFile, setGrupoFile] = useState<File | null>(null);       // arquivo da capa
  const [grupoPreview, setGrupoPreview] = useState<string | null>(null); // URL de preview da capa
  const [loadingGrupo, setLoadingGrupo] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      setLocation("/admin");
    } else {
      fetchMensagens();
      fetchDepoimentos();
      fetchProdutos();
      fetchCategorias();
      fetchGrupos();
    }
  }, []);

  // --- FUNÇÕES DE BUSCA ---
  const fetchMensagens = async () => {
    try {
      const res = await fetch("http://localhost/leaonorth/api/admin/mensagens.php");
      const data = await res.json();
      if (Array.isArray(data)) setMensagens(data);
    } catch (err) { console.error("Erro mensagens", err); }
  };

  const fetchDepoimentos = async () => {
    try {
      const res = await fetch("http://localhost/leaonorth/api/depoimentos.php");
      const data = await res.json();
      if (Array.isArray(data)) setDepoimentos(data);
    } catch (err) { console.error("Erro depoimentos", err); }
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

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/admin");
  };

  // --- FUNÇÕES DE DEPOIMENTOS ---
  const handleAddDepoimento = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingDep(true);
    try {
      const res = await fetch("http://localhost/leaonorth/api/admin/add_depoimento.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(depForm),
      });
      if (res.ok) {
        setDepForm({ nome: "", estrelas: 5, texto: "" });
        fetchDepoimentos();
        alert("Depoimento adicionado!");
      }
    } catch (err) { alert("Erro ao salvar depoimento."); } finally { setLoadingDep(false); }
  };

  const handleDeleteDepoimento = async (id: number) => {
    if (!confirm("Apagar este depoimento?")) return;
    try {
      await fetch(`http://localhost/leaonorth/api/admin/delete_depoimento.php?id=${id}`, { method: "DELETE" });
      fetchDepoimentos();
    } catch (err) { alert("Erro ao excluir."); }
  };

  // --- FUNÇÕES DE CATEGORIAS (Fase 16) ---
  const handleAddCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.nome.trim()) return alert("Informe o nome da categoria.");
    setLoadingCat(true);
    const formData = new FormData();
    formData.append("nome", catForm.nome);
    try {
      const res = await fetch("http://localhost/leaonorth/api/admin/add_categoria.php", {
        method: "POST", body: formData,
      });
      if (res.ok) {
        setCatForm({ nome: "" });
        fetchCategorias();
        alert("Categoria adicionada!");
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao salvar categoria.");
      }
    } catch (err) { alert("Erro ao enviar."); } finally { setLoadingCat(false); }
  };

  const handleEditCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.id) return;
    if (!catForm.nome.trim()) return alert("Informe o nome da categoria.");
    setLoadingCat(true);
    const formData = new FormData();
    formData.append("id", String(catForm.id));
    formData.append("nome", catForm.nome);
    try {
      const res = await fetch("http://localhost/leaonorth/api/admin/edit_categoria.php", {
        method: "POST", body: formData,
      });
      if (res.ok) {
        setCatForm({ nome: "" });
        fetchCategorias();
        alert("Categoria atualizada!");
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao atualizar categoria.");
      }
    } catch (err) { alert("Erro ao enviar."); } finally { setLoadingCat(false); }
  };

  const handleDeleteCategoria = async (id: number) => {
    if (!confirm("Tem certeza que deseja apagar esta categoria?")) return;
    try {
      const res = await fetch(`http://localhost/leaonorth/api/admin/delete_categoria.php?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCategorias();
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao excluir categoria.");
      }
    } catch (err) { alert("Erro ao excluir."); }
  };

  // --- FUNÇÕES DE GRUPOS (Fase 17) ---
  const resetGrupoForm = () => {
    // Revoga o ObjectURL do preview local (se vier de um arquivo selecionado)
    if (grupoFile && grupoPreview) {
      URL.revokeObjectURL(grupoPreview);
    }
    setGrupoForm({ nome: "", categoria_id: "" });
    setGrupoFile(null);
    setGrupoPreview(null);
  };

  const handleGrupoFileChange = (file: File | null) => {
    // Revoga o ObjectURL anterior, se havia um arquivo local selecionado
    if (grupoFile && grupoPreview) {
      URL.revokeObjectURL(grupoPreview);
    }
    setGrupoFile(file);
    setGrupoPreview(file ? URL.createObjectURL(file) : null);
  };

  const entrarEdicaoGrupo = (g: any) => {
    if (grupoFile && grupoPreview) {
      URL.revokeObjectURL(grupoPreview);
    }
    setGrupoForm({ id: g.id, nome: g.nome, categoria_id: g.categoria_id });
    setGrupoFile(null);
    setGrupoPreview(g.caminho_imagem_capa ? `http://localhost/leaonorth${g.caminho_imagem_capa}` : null);
  };

  const handleAddGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoForm.nome.trim()) return alert("Informe o nome do grupo.");
    if (!grupoForm.categoria_id) return alert("Selecione uma categoria.");
    if (!grupoFile) return alert("A capa do grupo é obrigatória.");
    setLoadingGrupo(true);

    const formData = new FormData();
    formData.append("nome", grupoForm.nome);
    formData.append("categoria_id", String(grupoForm.categoria_id));
    formData.append("capa", grupoFile);   // upload ÚNICO da capa

    try {
      const res = await fetch("http://localhost/leaonorth/api/admin/add_grupo.php", {
        method: "POST", body: formData,
      });
      if (res.ok) {
        resetGrupoForm();
        fetchGrupos();
        alert("Grupo criado com sucesso!");
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao criar grupo.");
      }
    } catch (err) { alert("Erro ao enviar."); } finally { setLoadingGrupo(false); }
  };

  const handleEditGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoForm.id) return;
    if (!grupoForm.nome.trim()) return alert("Informe o nome do grupo.");
    if (!grupoForm.categoria_id) return alert("Selecione uma categoria.");
    setLoadingGrupo(true);

    const formData = new FormData();
    formData.append("id", String(grupoForm.id));
    formData.append("nome", grupoForm.nome);
    formData.append("categoria_id", String(grupoForm.categoria_id));
    // Só anexa a capa se houver um novo arquivo selecionado
    if (grupoFile) formData.append("capa", grupoFile);

    try {
      const res = await fetch("http://localhost/leaonorth/api/admin/edit_grupo.php", {
        method: "POST", body: formData,
      });
      if (res.ok) {
        resetGrupoForm();
        fetchGrupos();
        alert("Grupo atualizado!");
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao atualizar grupo.");
      }
    } catch (err) { alert("Erro ao enviar."); } finally { setLoadingGrupo(false); }
  };

  const handleDeleteGrupo = async (id: number) => {
    if (!confirm("Tem certeza que deseja apagar este grupo?")) return;
    try {
      const res = await fetch(`http://localhost/leaonorth/api/admin/delete_grupo.php?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchGrupos();
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao excluir grupo.");
      }
    } catch (err) { alert("Erro ao excluir."); }
  };

  // --- FUNÇÕES DO CATÁLOGO DE PRODUTOS ---
  const fetchProdutos = async () => {
    try {
      const res = await fetch("http://localhost/leaonorth/api/produtos.php");
      const data = await res.json();
      if (Array.isArray(data)) setProdutos(data);
    } catch (err) { console.error("Erro produtos", err); }
  };

  // Adiciona arquivos selecionados ao array (limite de 8, considerando mantidas + novas)
  const handleAddProdFiles = (files: FileList | null) => {
    if (!files) return;
    const novos = Array.from(files);
    const total = imgsMantidas.length + prodFiles.length + novos.length;
    if (total > 8) return alert("Máximo de 8 imagens por produto.");
    setProdFiles(prev => [...prev, ...novos]);
  };

  // Remove uma NOVA imagem (índice relativo às prodFiles) e recalcula a capa
  const handleRemoveProdFile = (index: number) => {
    setProdFiles(prev => {
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
    setProdutoEditandoId(null);
    setImgsMantidas([]);
    setProdForm({ nome: "", especificacao: "", descricao: "", categoria_id: "", grupo_id: "" });
    setProdFiles([]);
    setCapaIndex(0);
    setInfoList([]);
  };

  // Entra no modo edição preenchendo o formulário com os dados do produto
  const entrarEdicao = (prod: any) => {
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (produtoEditandoId === null) return;
    if (imgsMantidas.length + prodFiles.length === 0) return alert("O produto deve ter ao menos 1 imagem.");
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
    prodFiles.forEach(file => formData.append("novas_imagens[]", file));

    try {
      const res = await fetch("http://localhost/leaonorth/api/admin/edit_produto.php", {
        method: "POST", body: formData,
      });
      if (res.ok) {
        resetProdForm();
        fetchProdutos();
        alert("Produto atualizado!");
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao atualizar produto.");
      }
    } catch (err) { alert("Erro ao enviar."); } finally { setLoadingProd(false); }
  };

  const handleAddProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prodFiles.length === 0) return alert("Selecione pelo menos uma imagem!");
    setLoadingProd(true);

    const formData = new FormData();
    
    // A MÁGICA ESTÁ AQUI: "imagens[]" com colchetes para o PHP ler como Array!
    prodFiles.forEach(file => formData.append("imagens[]", file));
    
    formData.append("capa_index", String(capaIndex));
    formData.append("informacoes", JSON.stringify(infoList)); // string JSON
    formData.append("nome", prodForm.nome);
    formData.append("especificacao", prodForm.especificacao);
    formData.append("categoria_id", String(prodForm.categoria_id));
    formData.append("descricao", prodForm.descricao);
    // Grupo é opcional: só envia se um grupo foi selecionado
    if (prodForm.grupo_id !== "") formData.append("grupo_id", String(prodForm.grupo_id));

    try {
      const res = await fetch("http://localhost/leaonorth/api/admin/add_produto.php", {
        method: "POST", body: formData,
      });
      
      if (res.ok) {
        resetProdForm();
        fetchProdutos();
        alert("Produto adicionado!");
      } else {
        // Exibe a mensagem de validação do backend (MIME/5MB/erros)
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao salvar produto.");
      }
    } catch (err) { alert("Erro ao enviar."); } finally { setLoadingProd(false); }
  };

  const handleDeleteProduto = async (id: number) => {
    if (!confirm("Tem certeza que deseja apagar este produto?")) return;
    try {
      await fetch(`http://localhost/leaonorth/api/admin/delete_produto.php?id=${id}`, { method: "DELETE" });
      fetchProdutos();
    } catch (err) { alert("Erro ao excluir."); }
  };

  // Duplica um produto (Fase 12): POST em duplicate_produto.php com o id no FormData
  const handleDuplicateProduto = async (id: number) => {
    if (!confirm("Duplicar este produto? Uma cópia independente será criada.")) return;

    const formData = new FormData();
    formData.append("id", String(id));

    try {
      const res = await fetch("http://localhost/leaonorth/api/admin/duplicate_produto.php", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        fetchProdutos(); // recarrega a listagem
        alert("Produto duplicado com sucesso!");
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.mensagem || "Erro ao duplicar produto.");
      }
    } catch (err) {
      alert("Erro ao duplicar produto.");
    }
  };

  // --- BADGES DE ORIGEM DA MENSAGEM (tipo_mensagem) ---
  const tipoMensagemConfig: Record<string, { label: string; className: string }> = {
    service:   { label: "Service",   className: "bg-[#F0B429]/10 text-[#F0B429] border-[#F0B429]/30" },
    materiais: { label: "Materiais", className: "bg-sky-500/10 text-sky-400 border-sky-500/30" },
    socio:     { label: "Sócio",     className: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  };

  const getTipoBadge = (tipo?: string) =>
    tipoMensagemConfig[tipo ?? ""] ??
    { label: tipo || "—", className: "bg-white/5 text-white/40 border-white/10" };

  const inputClass = "w-full bg-[#080808] border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm font-['DM_Sans'] focus:border-[#F0B429]/50 focus:outline-none transition-all";

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

  // Card de produto individual — mantém o JSX atual (com Editar/Duplicar/Excluir)
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
            <button onClick={() => handleDuplicateProduto(prod.id)} className="bg-sky-500/20 text-sky-400 p-2 rounded-full hover:bg-sky-500 hover:text-white transition-all" title="Duplicar produto">
              <Copy className="w-5 h-5" />
            </button>
            <button onClick={() => handleDeleteProduto(prod.id)} className="bg-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all" title="Excluir produto">
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

  // Classe dos itens do menu lateral (Fase 16)
  const sidebarItemClass = (tab: string) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${
      activeTab === tab
        ? "bg-[#F0B429]/10 text-[#F0B429]"
        : "text-white/60 hover:bg-white/5 hover:text-white"
    }`;

  const sidebarSectionLabel = (label: string) => (
    <p className="px-4 pt-4 pb-1 text-[9px] tracking-[0.2em] uppercase text-white/30">{label}</p>
  );

  return (
    <div className="min-h-screen bg-[#050505] font-['DM_Sans'] flex">
      
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-[#111111] border-r border-white/5 flex flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-white/5">
          <h1 className="font-['Barlow_Condensed'] font-700 text-2xl text-white uppercase">
            Painel <span className="text-[#F0B429]">Admin</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* LEÃO MATERIAIS */}
          {sidebarSectionLabel("Leão Materiais")}
          <button onClick={() => setActiveTab("categorias")} className={sidebarItemClass("categorias")}>
            <Tag className="w-5 h-5" /> Categorias
          </button>
          <button onClick={() => setActiveTab("grupos")} className={sidebarItemClass("grupos")}>
            <FolderOpen className="w-5 h-5" /> Grupos
          </button>
          <button onClick={() => setActiveTab("produtos")} className={sidebarItemClass("produtos")}>
            <Package className="w-5 h-5" /> Produtos
          </button>

          {/* LEÃO SERVICE */}
          {sidebarSectionLabel("Leão Service")}
          <button onClick={() => setActiveTab("servicos")} className={sidebarItemClass("servicos")}>
            <Wrench className="w-5 h-5" /> Serviços
          </button>
          <button onClick={() => setActiveTab("portfolio")} className={sidebarItemClass("portfolio")}>
            <ImageIcon className="w-5 h-5" /> Portfólio
          </button>
          <button onClick={() => setActiveTab("socios")} className={sidebarItemClass("socios")}>
            <Users className="w-5 h-5" /> Sócios
          </button>
          <button onClick={() => setActiveTab("depoimentos")} className={sidebarItemClass("depoimentos")}>
            <Star className="w-5 h-5" /> Depoimentos
          </button>

          {/* GERAL */}
          {sidebarSectionLabel("Geral")}
          <button onClick={() => setActiveTab("mensagens")} className={sidebarItemClass("mensagens")}>
            <Mail className="w-5 h-5" /> Mensagens
          </button>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-sm transition-colors">
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        
        {/* ABA: SERVIÇOS (Fase 23) */}
        {activeTab === "servicos" && <AdminServicos />}

        {/* ABA: PORTFÓLIO (Fase 23) */}
        {activeTab === "portfolio" && <AdminPortfolio />}

        {/* ABA: SÓCIOS (Fase 23) */}
        {activeTab === "socios" && <AdminSocios />}

        {/* ABA: CATÁLOGO DE PRODUTOS */}
        {activeTab === "produtos" && (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="md:col-span-1 bg-[#111111] border border-white/10 rounded-sm p-6 h-fit">
              <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F0B429]" /> {produtoEditandoId !== null ? "Editar Produto" : "Adicionar Produto"}
              </h2>
              <form onSubmit={produtoEditandoId !== null ? handleEditProduto : handleAddProduto} className="space-y-4">
                <div>
                  <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Nome</label>
                  <input type="text" required value={prodForm.nome} onChange={e => setProdForm({...prodForm, nome: e.target.value})} className={inputClass} placeholder="Ex: Disjuntor 63A" />
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
                  <textarea value={prodForm.descricao} onChange={e => setProdForm({...prodForm, descricao: e.target.value})} className={`${inputClass} min-h-[100px] resize-none`} placeholder="Descrição longa do produto. Quebras de linha são preservadas." />
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
                    <div className="grid grid-cols-3 gap-2">
                      {/* Imagens antigas mantidas */}
                      {imgsMantidas.map((img, i) => (
                        <div
                          key={`antiga-${i}`}
                          onClick={() => setCapaIndex(i)}
                          className={`relative rounded-sm overflow-hidden cursor-pointer border-2 transition-all ${i === capaIndex ? "border-[#F0B429]" : "border-transparent"}`}
                          title={i === capaIndex ? "Capa" : "Clique para definir como Capa"}
                        >
                          <img src={`http://localhost/leaonorth${img.caminho_imagem}`} alt={`Foto ${i + 1}`} className="w-full h-16 object-cover" />
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
                      {/* Novas imagens */}
                      {prodFiles.map((file, i) => {
                        const indice = imgsMantidas.length + i;
                        return (
                          <div
                            key={`nova-${i}`}
                            onClick={() => setCapaIndex(indice)}
                            className={`relative rounded-sm overflow-hidden cursor-pointer border-2 transition-all ${indice === capaIndex ? "border-[#F0B429]" : "border-transparent"}`}
                            title={indice === capaIndex ? "Capa" : "Clique para definir como Capa"}
                          >
                            <img src={URL.createObjectURL(file)} alt={`Nova ${i + 1}`} className="w-full h-16 object-cover" />
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
                          className={`${inputClass} !w-2/5`}
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
                <div className="flex gap-2 mt-4">
                  <button type="submit" disabled={loadingProd} className="flex-1 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    {loadingProd ? "Salvando..." : <><Upload className="w-4 h-4"/> {produtoEditandoId !== null ? "Salvar Alterações" : "Salvar Produto"}</>}
                  </button>
                  {produtoEditandoId !== null && (
                    <button type="button" onClick={resetProdForm} className="px-4 py-3 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
            <div className="md:col-span-2">
              <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6">Produtos Cadastrados</h2>

              {/* Botão voltar quando dentro de um grupo (Fase 14) */}
              {grupoAtivo !== null && (
                <button
                  onClick={() => setGrupoAtivo(null)}
                  className="inline-flex items-center gap-2 text-sky-400 text-sm uppercase tracking-wider hover:text-white transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar para a listagem principal
                </button>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {grupoAtivo === null ? (
                  /* ===== VISÃO RAIZ ===== */
                  <>
                    {avulsos.map(renderProdutoCard)}
                    {gruposPasta.map(([grupoId, variacoes]) => renderGrupoPasta(grupoId, variacoes))}
                    {produtos.length === 0 && (
                      <div className="col-span-2 text-center text-white/40 py-10 border border-dashed border-white/10 rounded-sm">
                        Nenhum produto cadastrado.
                      </div>
                    )}
                  </>
                ) : produtosDoGrupo.length > 0 ? (
                  /* ===== VISÃO DENTRO DO GRUPO ===== */
                  produtosDoGrupo.map(renderProdutoCard)
                ) : (
                  /* Pasta vazia (ex.: excluiu a última variação) */
                  <div className="col-span-2 text-center text-white/40 py-10 border border-dashed border-white/10 rounded-sm">
                    Nenhuma variação neste grupo.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA: CAIXA DE ENTRADA (Orçamentos) */}
        {activeTab === "mensagens" && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-white font-['Barlow_Condensed'] text-2xl uppercase font-600 mb-6 flex items-center gap-2">
               Mensagens de Orçamento
            </h2>
            <div className="bg-[#111111] border border-white/10 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white/80">
                  <thead className="bg-[#1A1A1A] text-white/50 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium border-b border-white/5">Data</th>
                      <th className="px-6 py-4 font-medium border-b border-white/5">Cliente</th>
                      <th className="px-6 py-4 font-medium border-b border-white/5">Contato</th>
                      <th className="px-6 py-4 font-medium border-b border-white/5">Serviço</th>
                      <th className="px-6 py-4 font-medium border-b border-white/5">Origem</th>
                      <th className="px-6 py-4 font-medium border-b border-white/5">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mensagens.map(msg => (
                      <tr 
                        key={msg.id} 
                        onClick={() => setSelectedMsg(msg)}
                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                        title="Clique para ler a mensagem completa"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-white/40">{new Date(msg.data_envio).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 font-medium group-hover:text-[#F0B429] transition-colors">{msg.nome}</td>
                        <td className="px-6 py-4">
                          <p>{msg.telefone}</p>
                          <p className="text-white/40 text-xs">{msg.email}</p>
                        </td>
                        <td className="px-6 py-4 text-[#F0B429]">{msg.servico}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-['DM_Sans'] uppercase tracking-wider border ${getTipoBadge(msg.tipo_mensagem).className}`}>
                            {getTipoBadge(msg.tipo_mensagem).label}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-white/60">{msg.mensagem}</td>
                      </tr>
                    ))}
                    {mensagens.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-white/40">Nenhuma mensagem recebida ainda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL DE LEITURA (Padrão Ouro) */}
            {selectedMsg && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMsg(null)}>
                <div 
                  className="bg-[#111111] border border-white/10 rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" 
                  onClick={e => e.stopPropagation()} // Impede que clicar dentro do modal feche ele
                >
                  <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#111111]">
                    <h3 className="font-['Barlow_Condensed'] font-700 text-2xl text-white uppercase flex items-center gap-2">
                      <Mail className="w-5 h-5 text-[#F0B429]" /> Detalhes do Orçamento
                    </h3>
                    <button onClick={() => setSelectedMsg(null)} className="text-white/40 hover:text-white transition-colors p-1">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-white/40 text-xs tracking-widest uppercase mb-1">Cliente</span>
                        <span className="text-white font-medium">{selectedMsg.nome}</span>
                      </div>
                      <div>
                        <span className="block text-white/40 text-xs tracking-widest uppercase mb-1">Data de Envio</span>
                        <span className="text-white font-medium">
                          {new Date(selectedMsg.data_envio).toLocaleDateString('pt-BR')} às {new Date(selectedMsg.data_envio).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div>
                        <span className="block text-white/40 text-xs tracking-widest uppercase mb-1">Contato</span>
                        <span className="text-white font-medium block">{selectedMsg.telefone}</span>
                        <span className="text-[#F0B429] text-sm">{selectedMsg.email}</span>
                      </div>
                      <div>
                        <span className="block text-white/40 text-xs tracking-widest uppercase mb-1">Serviço de Interesse</span>
                        <span className="text-white font-medium bg-white/5 px-3 py-1 rounded-sm border border-white/5">{selectedMsg.servico}</span>
                      </div>
                      <div>
                        <span className="block text-white/40 text-xs tracking-widest uppercase mb-1">Origem</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-['DM_Sans'] uppercase tracking-wider border ${getTipoBadge(selectedMsg.tipo_mensagem).className}`}>
                          {getTipoBadge(selectedMsg.tipo_mensagem).label}
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <span className="block text-white/40 text-xs tracking-widest uppercase mb-3">Mensagem Recebida</span>
                      <p className="text-white/80 text-sm font-['DM_Sans'] leading-relaxed whitespace-pre-wrap bg-[#080808] p-5 rounded-sm border border-white/5">
                        {selectedMsg.mensagem}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#111111] sticky bottom-0">
                     <button 
                       onClick={() => window.open(`https://wa.me/55${selectedMsg.telefone.replace(/\D/g, '')}`, '_blank')} 
                       className="px-6 py-2.5 bg-[#25D366] text-white font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#1EBE5A] transition-colors flex items-center gap-2"
                     >
                        Responder no WhatsApp
                     </button>
                     <button onClick={() => setSelectedMsg(null)} className="px-6 py-2.5 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors">
                        Fechar
                     </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA: DEPOIMENTOS */}
        {activeTab === "depoimentos" && (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="md:col-span-1 bg-[#111111] border border-white/10 rounded-sm p-6 h-fit">
              <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F0B429]" /> {depForm.hasOwnProperty('id') ? "Editar Depoimento" : "Novo Depoimento"}
              </h2>
              <form onSubmit={async (e) => {
                  e.preventDefault();
                  setLoadingDep(true);
                  const isEdit = depForm.hasOwnProperty('id');
                  const url = isEdit 
                    ? "http://localhost/leaonorth/api/admin/edit_depoimento.php" 
                    : "http://localhost/leaonorth/api/admin/add_depoimento.php";
                  
                  try {
                    const res = await fetch(url, {
                      method: isEdit ? "PUT" : "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(depForm),
                    });
                    if (res.ok) {
                      setDepForm({ nome: "", estrelas: 5, texto: "" });
                      fetchDepoimentos();
                      alert(isEdit ? "Depoimento atualizado!" : "Depoimento adicionado!");
                    }
                  } catch (err) { alert("Erro ao salvar depoimento."); } finally { setLoadingDep(false); }
              }} className="space-y-4">
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
                  <textarea value={depForm.texto} onChange={e => setDepForm({...depForm, texto: e.target.value})} className={`${inputClass} min-h-[120px] resize-none`} placeholder="Deixe em branco se for apenas nota..." />
                </div>
                <div className="flex gap-2 mt-4">
                    <button type="submit" disabled={loadingDep} className="flex-1 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center">
                      {loadingDep ? "Salvando..." : "Salvar"}
                    </button>
                    {depForm.hasOwnProperty('id') && (
                        <button type="button" onClick={() => setDepForm({ nome: "", estrelas: 5, texto: "" })} className="px-4 py-3 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors">
                            Cancelar
                        </button>
                    )}
                </div>
              </form>
            </div>
            
            <div className="md:col-span-2">
              <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6">Depoimentos no Site</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {depoimentos.map(dep => (
                  <div 
                    key={dep.id} 
                    onClick={() => setDepForm({ id: dep.id, nome: dep.nome, estrelas: dep.estrelas, texto: dep.texto || "" })}
                    className="bg-[#111111] border border-white/10 rounded-sm p-5 flex flex-col relative group cursor-pointer hover:border-[#F0B429]/50 hover:-translate-y-1 hover:bg-white/5 transition-all"
                    title="Clique para editar"
                  >
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); // Impede que o clique acione a edição
                            handleDeleteDepoimento(dep.id);
                        }} 
                        className="absolute top-4 right-4 text-red-500/50 hover:text-red-500 transition-colors z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex gap-1 mb-3">
                      {Array(dep.estrelas).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-[#F0B429] text-[#F0B429]" />)}
                    </div>
                    {dep.texto ? (
                        <p className="text-white/80 text-sm mb-4 flex-1 italic line-clamp-4">"{dep.texto}"</p>
                    ) : (
                        <p className="text-white/30 text-xs mb-4 flex-1 italic">Sem comentário escrito.</p>
                    )}
                    <p className="text-[#F0B429] font-medium text-sm">{dep.nome}</p>
                  </div>
                ))}
                {depoimentos.length === 0 && <div className="col-span-2 text-center text-white/40 py-10 border border-dashed border-white/10 rounded-sm">Nenhum depoimento cadastrado.</div>}
              </div>
            </div>
          </div>
        )}

        {/* ABA: CATEGORIAS (Fase 16) */}
        {activeTab === "categorias" && (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="md:col-span-1 bg-[#111111] border border-white/10 rounded-sm p-6 h-fit">
              <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F0B429]" /> {catForm.hasOwnProperty('id') ? "Editar Categoria" : "Nova Categoria"}
              </h2>
              <form onSubmit={catForm.hasOwnProperty('id') ? handleEditCategoria : handleAddCategoria} className="space-y-4">
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
                <div className="flex gap-2 mt-4">
                  <button type="submit" disabled={loadingCat} className="flex-1 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center">
                    {loadingCat ? "Salvando..." : "Salvar"}
                  </button>
                  {catForm.hasOwnProperty('id') && (
                    <button type="button" onClick={() => setCatForm({ nome: "" })} className="px-4 py-3 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6">Categorias Cadastradas</h2>
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
                            onClick={() => setCatForm({ id: cat.id, nome: cat.nome })}
                            className="bg-[#F0B429]/20 text-[#F0B429] p-2 rounded-full hover:bg-[#F0B429] hover:text-[#080808] transition-all"
                            title="Editar categoria"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategoria(cat.id)}
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
            </div>
          </div>
        )}

        {/* ABA: GRUPOS (Fase 17) */}
        {activeTab === "grupos" && (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="md:col-span-1 bg-[#111111] border border-white/10 rounded-sm p-6 h-fit">
              <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F0B429]" /> {grupoForm.hasOwnProperty('id') ? "Editar Grupo" : "Novo Grupo"}
              </h2>
              <form onSubmit={grupoForm.hasOwnProperty('id') ? handleEditGrupo : handleAddGrupo} className="space-y-4">
                {/* Nome */}
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
                {/* Categoria */}
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
                {/* Capa (upload único + preview) */}
                <div>
                  <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Capa (obrigatória)</label>
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
                    <img src={grupoPreview} alt="Capa do grupo" className="mt-3 w-full h-32 object-cover rounded-sm border border-white/10" />
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <button type="submit" disabled={loadingGrupo} className="flex-1 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center">
                    {loadingGrupo ? "Salvando..." : "Salvar"}
                  </button>
                  {grupoForm.hasOwnProperty('id') && (
                    <button type="button" onClick={resetGrupoForm} className="px-4 py-3 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6">Grupos Cadastrados</h2>
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
                            onClick={() => entrarEdicaoGrupo(g)}
                            className="bg-[#F0B429]/20 text-[#F0B429] p-2 rounded-full hover:bg-[#F0B429] hover:text-[#080808] transition-all"
                            title="Editar grupo"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGrupo(g.id)}
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
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

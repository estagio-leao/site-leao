import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { LogOut, Upload, Trash2, Plus, Image as ImageIcon, LayoutDashboard, Mail, Star, FolderOpen } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("portfolio");
  
  // Estados do Portfólio
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Residencial", size: "normal" });
  const [file, setFile] = useState<File | null>(null);

  // Estados de Mensagens e Depoimentos
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [depoimentos, setDepoimentos] = useState<any[]>([]);
  const [depForm, setDepForm] = useState<{ id?: number; nome: string; estrelas: number; texto: string; }>({ nome: "", estrelas: 5, texto: "" });
  const [loadingDep, setLoadingDep] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("admin_token")) {
      setLocation("/admin");
    } else {
      fetchPortfolio();
      fetchMensagens();
      fetchDepoimentos();
    }
  }, []);

  // --- FUNÇÕES DE BUSCA ---
  const fetchPortfolio = async () => {
    try {
      const res = await fetch("http://localhost/leaonorth/api/portfolio.php");
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (err) { console.error("Erro portfólio", err); }
  };

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

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/admin");
  };

  // --- FUNÇÕES DO PORTFÓLIO ---
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Selecione uma imagem!");
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", form.title);
    formData.append("category", form.category);
    formData.append("size", form.size);

    try {
      const res = await fetch("http://localhost/leaonorth/api/admin/upload.php", {
        method: "POST", body: formData,
      });
      if (res.ok) {
        setForm({ title: "", category: "Residencial", size: "normal" });
        setFile(null);
        fetchPortfolio();
        alert("Projeto adicionado!");
      }
    } catch (err) { alert("Erro ao enviar."); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja apagar este projeto?")) return;
    try {
      await fetch(`http://localhost/leaonorth/api/admin/delete.php?id=${id}`, { method: "DELETE" });
      fetchPortfolio();
    } catch (err) { alert("Erro ao excluir."); }
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

  const inputClass = "w-full bg-[#080808] border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm font-['DM_Sans'] focus:border-[#F0B429]/50 focus:outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#050505] font-['DM_Sans'] flex">
      
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-[#111111] border-r border-white/5 flex flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-white/5">
          <h1 className="font-['Barlow_Condensed'] font-700 text-2xl text-white uppercase">
            Painel <span className="text-[#F0B429]">Admin</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab("portfolio")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === "portfolio" ? "bg-[#F0B429]/10 text-[#F0B429]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
            <FolderOpen className="w-5 h-5" /> Portfólio
          </button>
          <button onClick={() => setActiveTab("mensagens")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === "mensagens" ? "bg-[#F0B429]/10 text-[#F0B429]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
            <Mail className="w-5 h-5" /> Caixa de Entrada
          </button>
          <button onClick={() => setActiveTab("depoimentos")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === "depoimentos" ? "bg-[#F0B429]/10 text-[#F0B429]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}>
            <Star className="w-5 h-5" /> Depoimentos
          </button>
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-sm transition-colors">
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* ABA: PORTFÓLIO (Seu código original mantido) */}
        {activeTab === "portfolio" && (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="md:col-span-1 bg-[#111111] border border-white/10 rounded-sm p-6 h-fit">
              <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F0B429]" /> Adicionar Projeto
              </h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Título</label>
                  <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className={inputClass} placeholder="Ex: Painel Industrial" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Categoria</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inputClass}>
                    <option value="Residencial">Residencial</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Projetos">Projetos</option>
                    <option value="Quadros">Quadros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Tamanho no Layout</label>
                  <select value={form.size} onChange={e => setForm({...form, size: e.target.value})} className={inputClass}>
                    <option value="normal">Normal (Quadrado)</option>
                    <option value="large">Grande (Retangular)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/40 text-xs tracking-widest uppercase mb-1.5">Imagem</label>
                  <div className="relative overflow-hidden">
                    <input type="file" required accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className={`${inputClass} flex items-center gap-2 text-white/60 ${file ? 'text-[#F0B429] border-[#F0B429]/50' : ''}`}>
                      <ImageIcon className="w-4 h-4" /> {file ? file.name : "Escolher Arquivo..."}
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? "Enviando..." : <><Upload className="w-4 h-4"/> Salvar Projeto</>}
                </button>
              </form>
            </div>
            <div className="md:col-span-2">
              <h2 className="text-white font-['Barlow_Condensed'] text-xl uppercase font-600 mb-6">Projetos Cadastrados</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item.id} className="bg-[#111111] border border-white/10 rounded-sm overflow-hidden group flex flex-col">
                    <div className="h-40 overflow-hidden relative">
                      <img src={`http://localhost/leaonorth${item.img}`} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleDelete(item.id)} className="bg-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex-1">
                      <span className="text-[#F0B429] text-[10px] tracking-widest uppercase">{item.category} • {item.size}</span>
                      <h3 className="text-white font-medium text-sm mt-1">{item.title}</h3>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div className="col-span-2 text-center text-white/40 py-10 border border-dashed border-white/10 rounded-sm">Nenhum projeto cadastrado.</div>}
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
                      <th className="px-6 py-4 font-medium border-b border-white/5">Mensagem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mensagens.map(msg => (
                      <tr key={msg.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-white/40">{new Date(msg.data_envio).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4 font-medium">{msg.nome}</td>
                        <td className="px-6 py-4">
                          <p>{msg.telefone}</p>
                          <p className="text-white/40 text-xs">{msg.email}</p>
                        </td>
                        <td className="px-6 py-4 text-[#F0B429]">{msg.servico}</td>
                        <td className="px-6 py-4 max-w-xs truncate" title={msg.mensagem}>{msg.mensagem}</td>
                      </tr>
                    ))}
                    {mensagens.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-white/40">Nenhuma mensagem recebida ainda.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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

      </main>
    </div>
  );
}
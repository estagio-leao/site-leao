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
import AdminDialog from "../AdminDialog";

const inputClass =
  "w-full bg-[#080808] border border-white/10 rounded-sm px-4 py-2.5 text-white text-sm font-['DM_Sans'] focus:border-[#F0B429]/50 focus:outline-none transition-all";

export default function AdminDepoimentos() {
  const [depoimentos, setDepoimentos] = useState<any[]>([]);
  const [depForm, setDepForm] = useState<{ nome: string; estrelas: number; texto: string }>({
    nome: "",
    estrelas: 5,
    texto: "",
  });
  const [loadingDep, setLoadingDep] = useState(false);
  const [editandoDepId, setEditandoDepId] = useState<number | null>(null); // null = modo novo
  const [depModalOpen, setDepModalOpen] = useState(false);

  const fetchDepoimentos = async () => {
    try {
      const res = await fetch("http://localhost/leaonorth/api/depoimentos.php");
      const data = await res.json();
      if (Array.isArray(data)) setDepoimentos(data);
    } catch (err) { console.error("Erro depoimentos", err); }
  };

  useEffect(() => {
    fetchDepoimentos();
  }, []);

  const resetDepForm = () => {
    setDepForm({ nome: "", estrelas: 5, texto: "" });
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
    setDepForm({ nome: dep.nome, estrelas: dep.estrelas, texto: dep.texto || "" });
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
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...depForm, id: editandoDepId } : depForm),
      });
      if (res.ok) {
        fecharDepModal();
        fetchDepoimentos();
        alert(isEdit ? "Depoimento atualizado!" : "Depoimento adicionado!");
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
        </form>
      </AdminDialog>
    </div>
  );
}

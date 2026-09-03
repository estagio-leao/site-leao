/*
 * LEÃO NORTH — Painel Admin: Mensagens (Caixa de Entrada) — Fase 26 (extraído do Dashboard)
 * Componente autossuficiente: busca mensagens e exibe a tabela + modal de leitura
 * "Detalhes do Orçamento" (padrão visual de referência — mantido verbatim).
 *
 * Consumo:
 *   GET api/admin/mensagens.php
 */
import { useEffect, useState } from "react";
import { Mail, X } from "lucide-react";
import { adminFetch } from "@/lib/adminFetch";

// Badges de origem da mensagem (tipo_mensagem) — Service dourado, Materiais azul, Sócio roxo
const tipoMensagemConfig: Record<string, { label: string; className: string }> = {
  service:   { label: "Service",   className: "bg-[#F0B429]/10 text-[#F0B429] border-[#F0B429]/30" },
  materiais: { label: "Materiais", className: "bg-sky-500/10 text-sky-400 border-sky-500/30" },
  socio:     { label: "Sócio",     className: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
};

const getTipoBadge = (tipo?: string) =>
  tipoMensagemConfig[tipo ?? ""] ??
  { label: tipo || "—", className: "bg-white/5 text-white/40 border-white/10" };

export default function AdminMensagens() {
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<any>(null); // Estado que controla o Modal de Leitura

  const fetchMensagens = async () => {
    try {
      const res = await adminFetch("http://localhost/leaonorth/api/admin/mensagens.php");
      const data = await res.json();
      if (Array.isArray(data)) setMensagens(data);
    } catch (err) { console.error("Erro mensagens", err); }
  };

  useEffect(() => {
    fetchMensagens();
  }, []);

  return (
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
  );
}

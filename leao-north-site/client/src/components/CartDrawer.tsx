/*
 * LEÃO NORTH — FASE 36: CartDrawer (carrinho lateral de orçamentos — Materiais)
 *
 * Drawer que desliza a partir da ESQUERDA (shadcn Sheet, o mesmo componente já
 * usado no filtro de categorias de /materiais). Montado UMA única vez no App.tsx
 * e controlado pelo CartContext — por isso o conteúdo digitado não se perde ao
 * navegar entre as páginas do catálogo.
 *
 * Fluxo de envio:
 *   1) valida o formulário (Nome, WhatsApp com máscara, E-mail opcional);
 *   2) PRÉ-ABRE a aba do WhatsApp de forma síncrona (evita bloqueio de popup);
 *   3) POST em api/contato.php com `message` = JSON do carrinho (tipo_mensagem
 *      "materiais") → grava no painel e dispara o e-mail formatado;
 *   4) define o destino da aba já aberta (ou mostra o link no sucesso, se o
 *      navegador tiver bloqueado) e limpa o carrinho.
 */
import { useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2,
  ImageOff,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { useCart } from "@/contexts/CartContext";
import { formatPhoneBR } from "@/lib/utils";
import {
  BASE,
  linkWhatsAppOrcamento,
  resumoItens,
  resumoServico,
  serializarCarrinho,
  urlImagem,
} from "@/lib/carrinho";

const inputClass =
  "w-full bg-white border border-slate-300 rounded-sm px-3 py-2.5 text-sm font-['DM_Sans'] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#F0B429] focus:ring-1 focus:ring-[#F0B429]/30 transition-all";

export default function CartDrawer() {
  const {
    itens,
    totalDistintos,
    aberto,
    fecharCarrinho,
    alterarQuantidade,
    removerItem,
    limpar,
  } = useCart();

  const [form, setForm] = useState({ nome: "", telefone: "", email: "" });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [linkWhats, setLinkWhats] = useState<string | null>(null);

  const vazio = itens.length === 0;

  const fechar = () => {
    fecharCarrinho();
    // Ao reabrir, o drawer volta para o estado de formulário (não para o sucesso)
    setEnviado(false);
    setLinkWhats(null);
  };

  const validar = (): string | null => {
    if (vazio) return "Seu orçamento está vazio.";
    if (form.nome.trim().length < 2) return "Informe seu nome para o orçamento.";
    if (form.telefone.replace(/\D/g, "").length < 10) return "Informe um WhatsApp válido com DDD.";
    const email = form.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Informe um e-mail válido.";
    return null;
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();

    const erro = validar();
    if (erro) {
      toast.error(erro);
      return;
    }

    const dados = {
      nome: form.nome.trim(),
      telefone: form.telefone,
      email: form.email.trim(),
    };

    // D5 — pré-abertura síncrona (dentro do gesto do usuário) para não ser bloqueada
    const janela = typeof window !== "undefined" ? window.open("", "_blank") : null;
    const link = linkWhatsAppOrcamento(itens, dados);

    setEnviando(true);
    try {
      const resposta = await fetch(`${BASE}/api/contato.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dados.nome,
          phone: dados.telefone,
          email: dados.email,
          service: resumoServico(itens),
          tipo_mensagem: "materiais",
          // STRING com o JSON do carrinho (o PHP faz bindParam direto desta coluna)
          message: serializarCarrinho(itens),
        }),
      });

      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

      setLinkWhats(link);
      if (janela) {
        janela.location.href = link; // reaproveita a aba pré-aberta
      } else {
        toast.info("Permita pop-ups para abrir o WhatsApp automaticamente.");
      }

      limpar(); // D6 — carrinho limpo só depois do sucesso
      setEnviado(true);
      setForm({ nome: "", telefone: "", email: "" });
      toast.success("Orçamento enviado! Vamos te atender pelo WhatsApp.");
    } catch (error) {
      console.error("Erro ao enviar orçamento:", error);
      janela?.close();
      toast.error("Não foi possível enviar seu orçamento. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={(valor) => (valor ? undefined : fechar())}>
      <SheetContent
        side="left"
        className="w-[92%] sm:max-w-md bg-white border-slate-200 z-[60] p-0 gap-0"
      >
        {/* Cabeçalho */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-slate-200 bg-white">
          <SheetTitle className="font-['Barlow_Condensed'] font-700 text-2xl uppercase tracking-wide text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#B8860B]" />
            Seu Orçamento
          </SheetTitle>
          <SheetDescription className="text-slate-500 text-xs font-['DM_Sans']">
            {vazio ? "Nenhum item adicionado ainda." : resumoItens(itens)}
          </SheetDescription>
        </SheetHeader>

        {enviado ? (
          /* ------------------------- TELA DE SUCESSO ------------------------- */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-10 text-center bg-slate-50">
            <div className="w-16 h-16 rounded-full bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#25D366]" />
            </div>
            <h3 className="font-['Barlow_Condensed'] font-700 text-2xl uppercase text-slate-900">
              Orçamento enviado!
            </h3>
            <p className="text-slate-600 text-sm font-['DM_Sans'] max-w-xs">
              Recebemos o seu pedido e ele já aparece no painel da Leão North. Se a aba do WhatsApp
              não abriu, use o botão abaixo.
            </p>
            {linkWhats && (
              <a
                href={linkWhats}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-['Barlow_Condensed'] font-700 uppercase tracking-wider rounded-sm hover:bg-[#1EBE5A] transition-colors"
              >
                <WhatsAppIcon className="w-5 h-5" /> Abrir no WhatsApp
              </a>
            )}
            <Link
              href="/materiais"
              onClick={fechar}
              className="text-[#B8860B] text-sm font-['DM_Sans'] hover:underline"
            >
              Continuar navegando no catálogo
            </Link>
          </div>
        ) : vazio ? (
          /* --------------------------- ESTADO VAZIO --------------------------- */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-10 text-center bg-slate-50">
            <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-['Barlow_Condensed'] font-700 text-xl uppercase text-slate-900">
              Seu orçamento está vazio
            </h3>
            <p className="text-slate-500 text-sm font-['DM_Sans'] max-w-xs">
              Adicione produtos pelo catálogo e monte sua lista de materiais em um único pedido.
            </p>
            <Link
              href="/materiais"
              onClick={fechar}
              className="mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase tracking-wider rounded-sm hover:bg-[#FFD060] transition-colors"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            {/* ---------------------------- ITENS ---------------------------- */}
            <div className="flex-1 overflow-y-auto bg-slate-50 px-5 py-4">
              <ul className="space-y-3">
                {itens.map((item) => {
                  const imagem = urlImagem(item.img);
                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 bg-white border border-slate-200 rounded-sm p-3"
                    >
                      {/* (FOTO) */}
                      {imagem ? (
                        <img
                          src={imagem}
                          alt={item.nome}
                          className="w-14 h-14 object-contain bg-slate-50 border border-slate-200 rounded-sm shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-sm text-slate-300 shrink-0">
                          <ImageOff className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 text-sm font-['DM_Sans'] font-medium leading-snug">
                          {item.nome}
                        </p>
                        {item.espec && (
                          <p className="text-slate-500 text-xs font-['DM_Sans'] truncate mt-0.5">
                            {item.espec}
                          </p>
                        )}

                        {/* Stepper de quantidade */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="inline-flex items-center border border-slate-300 rounded-sm overflow-hidden">
                            <button
                              type="button"
                              onClick={() => alterarQuantidade(item.id, -1)}
                              disabled={item.qtd <= 1}
                              aria-label={`Diminuir quantidade de ${item.nome}`}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-9 text-center text-sm font-['DM_Sans'] text-slate-900">
                              {item.qtd}
                            </span>
                            <button
                              type="button"
                              onClick={() => alterarQuantidade(item.id, 1)}
                              disabled={item.qtd >= 99}
                              aria-label={`Aumentar quantidade de ${item.nome}`}
                              className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removerItem(item.id)}
                            aria-label={`Remover ${item.nome} do orçamento`}
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {totalDistintos > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    limpar();
                    toast.info("Orçamento esvaziado.");
                  }}
                  className="mt-4 text-xs font-['DM_Sans'] text-slate-400 hover:text-red-500 transition-colors"
                >
                  Esvaziar orçamento
                </button>
              )}
            </div>

            {/* -------------------- FORMULÁRIO + FECHAR PEDIDO -------------------- */}
            <form
              onSubmit={handleEnviar}
              className="border-t border-slate-200 bg-white px-5 py-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#B8860B] text-[10px] font-['DM_Sans'] font-medium tracking-[0.2em] uppercase">
                  Seus dados para o orçamento
                </span>
                <span className="text-slate-500 text-xs font-['DM_Sans']">
                  {totalDistintos} {totalDistintos === 1 ? "item" : "itens"}
                </span>
              </div>

              <input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Seu nome *"
                className={inputClass}
                aria-label="Seu nome"
              />
              <input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: formatPhoneBR(e.target.value) })}
                placeholder="WhatsApp (43) 99999-9999 *"
                inputMode="tel"
                className={inputClass}
                aria-label="Seu WhatsApp"
              />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Seu e-mail (opcional)"
                inputMode="email"
                className={inputClass}
                aria-label="Seu e-mail"
              />

              <button
                type="submit"
                disabled={enviando}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-800 text-lg uppercase tracking-wider rounded-sm hover:bg-[#FFD060] active:scale-[0.98] disabled:opacity-60 transition-all"
              >
                {enviando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>Enviar Orçamento</>
                )}
              </button>

              <p className="text-slate-400 text-[11px] font-['DM_Sans'] text-center leading-relaxed">
                Ao enviar, abrimos o WhatsApp da Leão North com a sua lista formatada.
              </p>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

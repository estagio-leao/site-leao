/*
 * LEÃO NORTH — Depoimentos (página completa) — Fase 27
 * Rota: /service/depoimentos
 * Lista TODOS os depoimentos com visivel = 1 (api/depoimentos.php default) em
 * um grid escuro, com estrelas, média geral e CTA de contato/orçamento.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Star, Quote, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const BASE = "http://localhost/leaonorth";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "fill-[#F0B429] text-[#F0B429]" : "text-white/20"}`}
        />
      ))}
    </div>
  );
}

export default function Depoimentos() {
  const [depoimentos, setDepoimentos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/depoimentos.php`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDepoimentos(data);
      })
      .catch((error) => console.error("Erro ao buscar depoimentos:", error))
      .finally(() => setCarregando(false));
  }, []);

  const total = depoimentos.length;
  const media = total > 0
    ? (depoimentos.reduce((acc, curr) => acc + Number(curr.estrelas || 0), 0) / total).toFixed(1).replace(".", ",")
    : "—";

  const pageClass = "min-h-screen bg-[#080808] text-white font-['DM_Sans']";

  return (
    <div className={`${pageClass} flex flex-col`}>
      <Navbar simple />

      <main className="container mx-auto px-4 lg:px-8 pt-28 lg:pt-32 pb-16 lg:pb-20 flex-1">
        {/* Voltar */}
        <Link
          href="/service"
          className="inline-flex items-center gap-2 text-white/50 hover:text-[#F0B429] transition-colors mb-10 uppercase tracking-wider text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a Leão Service
        </Link>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[#F0B429]" />
            <span className="text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-[0.2em] uppercase">
              O Que Dizem Sobre Nós
            </span>
            <div className="h-px w-10 bg-[#F0B429]" />
          </div>
          <h1 className="font-['Barlow_Condensed'] font-700 text-4xl lg:text-6xl text-white uppercase">
            Depoimentos dos <span className="text-gold-gradient">Clientes</span>
          </h1>
          <p className="text-white/50 text-base font-['DM_Sans'] mt-4">
            Histórias reais de quem confiou na Leão North para seus projetos elétricos.
          </p>

          {total > 0 && (
            <div className="inline-flex items-center gap-4 mt-8 px-6 py-4 rounded-sm border border-[#F0B429]/20 bg-[#F0B429]/5">
              <span className="font-['Barlow_Condensed'] font-800 text-5xl text-[#F0B429] leading-none">{media}</span>
              <div className="text-left">
                <StarRating rating={Math.round(parseFloat(media.replace(",", ".")))} />
                <p className="text-white/40 text-xs font-['DM_Sans'] mt-1">Média de {total} avaliação{total > 1 ? "ões" : ""}</p>
              </div>
            </div>
          )}
        </div>

        {/* Grid de depoimentos visíveis */}
        {carregando ? (
          <p className="text-center text-white/50 py-20">Carregando depoimentos...</p>
        ) : total === 0 ? (
          <div className="text-center text-white/40 py-20 border border-dashed border-white/10 rounded-sm">
            Ainda não há depoimentos publicados.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {depoimentos.map((t) => (
              <div
                key={t.id}
                className="service-card flex flex-col gap-4 p-6 rounded-sm border border-white/10 bg-[#0F0F0F]"
              >
                <Quote className="w-6 h-6 text-[#F0B429]/30" />
                <StarRating rating={Number(t.estrelas || 0)} />
                <p className="text-white/60 text-sm font-['DM_Sans'] leading-relaxed flex-1 italic whitespace-pre-line">
                  {t.texto ? `"${t.texto}"` : ""}
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <div className="w-10 h-10 rounded-sm bg-[#F0B429]/20 border border-[#F0B429]/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-['Barlow_Condensed'] font-700 text-sm text-[#F0B429] uppercase">
                      {t.nome.substring(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-['DM_Sans'] font-medium text-sm">{t.nome}</p>
                    <p className="text-white/40 text-xs font-['DM_Sans']">Cliente</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA final */}
        <div className="text-center mt-16">
          <p className="text-white/50 text-sm font-['DM_Sans'] mb-6">
            Quer ter a mesma experiência? Fale com a nossa equipe.
          </p>
          <a
            href="/service#contato"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 text-lg uppercase tracking-wider rounded-sm hover:bg-[#FFD060] transition-colors"
          >
            Solicitar um Orçamento <ChevronRight className="w-5 h-5" />
          </a>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

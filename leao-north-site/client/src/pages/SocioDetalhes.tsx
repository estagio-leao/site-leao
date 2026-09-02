/*
 * LEÃO NORTH — Socio Detalhes (página do sócio) — Fase 24
 * Rota: /service/socio/:id
 * Foto ampliada + nome + subtítulo + descrição completa (identidade escura).
 */
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const BASE = "http://localhost/leaonorth";
const WHATSAPP_NUMERO = "5543999190467";

type Socio = {
  id: number;
  nome: string;
  subtitulo?: string | null;
  descricao?: string | null;
  caminho_foto?: string | null;
};

const TEXTO_FALLBACK =
  "Responsável por conduzir com excelência os projetos e o relacionamento com os clientes da Leão North, garantindo qualidade técnica e segurança em cada instalação elétrica.";

export default function SocioDetalhes() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [socio, setSocio] = useState<Socio | null>(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  useEffect(() => {
    setNaoEncontrado(false);
    fetch(`${BASE}/api/service/socios.php`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const encontrado = data.find((s: Socio) => s.id === id) || null;
          setSocio(encontrado);
          if (!encontrado) setNaoEncontrado(true);
        } else {
          setNaoEncontrado(true);
        }
      })
      .catch(() => setNaoEncontrado(true));
  }, [id]);

  const pageClass = "min-h-screen bg-[#080808] text-white font-['DM_Sans']";
  const primeiroNome = (nome: string) => nome.split(" ")[0];
  const whatsLink = (nome: string) =>
    `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(`Olá! Gostaria de falar com ${nome} da Leão North.`)}`;

  if (naoEncontrado) {
    return (
      <div className={`${pageClass} flex flex-col`}>
        <Navbar simple />
        <main className="container mx-auto px-4 lg:px-8 py-32 text-center">
          <h1 className="font-['Barlow_Condensed'] font-700 text-3xl uppercase text-white">
            Sócio não encontrado
          </h1>
          <Link href="/service" className="inline-flex items-center gap-2 mt-6 text-[#F0B429] hover:underline">
            <ArrowLeft className="w-4 h-4" /> Voltar para a Leão Service
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!socio) {
    return (
      <div className={`${pageClass} flex flex-col`}>
        <Navbar simple />
        <main className="container mx-auto px-4 lg:px-8 py-32 text-center text-white/50">
          Carregando sócio...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`${pageClass} flex flex-col`}>
      <Navbar simple />

      <main className="container mx-auto px-4 lg:px-8 pt-28 lg:pt-32 pb-10 lg:pb-14 flex-1">
        {/* Voltar */}
        <Link
          href="/service"
          className="inline-flex items-center gap-2 text-white/50 hover:text-[#F0B429] transition-colors mb-10 uppercase tracking-wider text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a Leão Service
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start max-w-5xl mx-auto">
          {/* Foto ampliada */}
          <div className="relative overflow-hidden rounded-sm border border-white/10 bg-[#111111] aspect-[3/4]">
            {socio.caminho_foto ? (
              <img
                src={`${BASE}${socio.caminho_foto}`}
                alt={socio.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-24 h-24 text-white/20" />
              </div>
            )}
          </div>

          {/* Informações */}
          <div>
            <span className="inline-block px-3 py-1 bg-[#F0B429]/10 border border-[#F0B429]/30 text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-[0.2em] uppercase rounded-sm">
              {socio.subtitulo || "Sócio"}
            </span>
            <h1 className="font-['Barlow_Condensed'] font-700 text-4xl lg:text-5xl text-white uppercase mt-4">
              {socio.nome}
            </h1>

            {socio.subtitulo && (
              <p className="text-white/60 text-base font-['DM_Sans'] mt-3">{socio.subtitulo}</p>
            )}

            <div className="mt-6">
              <h2 className="font-['Barlow_Condensed'] font-700 text-xl text-white uppercase">Sobre</h2>
              <p className="text-white/70 text-sm font-['DM_Sans'] leading-relaxed whitespace-pre-line mt-2">
                {socio.descricao || TEXTO_FALLBACK}
              </p>
            </div>

            {/* CTA */}
            <a
              href={whatsLink(socio.nome)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-3 py-5 bg-[#25D366] text-white font-['Barlow_Condensed'] font-800 text-xl uppercase tracking-wider rounded-sm hover:bg-[#1EBE5A] shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]"
            >
              Falar com {primeiroNome(socio.nome)}
            </a>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}

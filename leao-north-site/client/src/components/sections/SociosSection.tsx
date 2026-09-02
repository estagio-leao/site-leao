/*
 * LEÃO NORTH — Sócios Section
 * Fase 24: consumo dinâmico de api/service/socios.php; cada card leva à página
 * dedicada /service/socio/:id (foto ampliada + descrição) e mantém o
 * mini-formulário "Falar com [Nome]" (tipo_mensagem = "socio").
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Send, X, User, CheckCircle2, ChevronRight } from "lucide-react";

const BASE = "http://localhost/leaonorth";

type Socio = {
  id: number;
  nome: string;
  subtitulo?: string | null;
  descricao?: string | null;
  caminho_foto?: string | null;
};

export default function SociosSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [socioAtivo, setSocioAtivo] = useState<Socio | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    // Busca os sócios reais (Fase 24)
    fetch(`${BASE}/api/service/socios.php`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) setSocios(data);
      })
      .catch((error) => console.error("Erro ao buscar sócios:", error));

    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".reveal").forEach((r, i) => {
              setTimeout(() => {
                (r as HTMLElement).style.opacity = "1";
                (r as HTMLElement).style.transform = "translateY(0)";
              }, i * 120);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const primeiroNome = (socio: Socio) => socio.nome.split(" ")[0];

  const abrirFormulario = (socio: Socio) => {
    setSocioAtivo(socio);
    setEnviado(false);
    setForm({ name: "", phone: "", message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socioAtivo) return;
    setEnviando(true);

    try {
      const response = await fetch(`${BASE}/api/contato.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: "",                                    // opcional
          service: `Falar com ${socioAtivo.nome}`,      // fica registrado o sócio de interesse
          message: form.message,
          tipo_mensagem: "socio",                       // origem persistida pelo contato.php
        }),
      });

      if (response.ok) {
        setEnviado(true);
      } else {
        alert("Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro de conexão com o servidor.");
    } finally {
      setEnviando(false);
    }
  };

  const inputClass =
    "w-full bg-[#111111] border border-white/10 rounded-sm px-4 py-3 text-white text-sm font-['DM_Sans'] placeholder-white/30 focus:outline-none focus:border-[#F0B429]/50 focus:ring-1 focus:ring-[#F0B429]/30 transition-all duration-200";

  return (
    <section
      id="socios"
      ref={sectionRef}
      className="py-24 lg:py-32 relative"
      style={{ background: "linear-gradient(180deg, #0D0D0D 0%, #0A0A0A 100%)" }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="reveal flex items-center justify-center gap-3 mb-4"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1)" }}
          >
            <div className="h-px w-12 bg-[#F0B429]" />
            <span className="text-[#F0B429] text-xs font-['DM_Sans'] font-medium tracking-[0.2em] uppercase">
              Nossos Sócios
            </span>
            <div className="h-px w-12 bg-[#F0B429]" />
          </div>
          <h2
            className="reveal font-['Barlow_Condensed'] font-700 text-4xl lg:text-5xl xl:text-6xl text-white uppercase"
            style={{ opacity: 0, transform: "translateY(24px)", transition: "all 0.6s cubic-bezier(0.23,1,0.32,1) 80ms" }}
          >
            Quem Está à Frente da{" "}
            <span className="text-gold-gradient">Leão North</span>
          </h2>
        </div>

        {/* Cards dos sócios (dinâmicos) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {socios.map((socio, i) => (
            <div
              key={socio.id}
              className="reveal bg-[#111111] border border-white/10 rounded-sm overflow-hidden group flex flex-col"
              style={{ opacity: 0, transform: "translateY(24px)", transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${i * 120}ms` }}
            >
              {/* Foto clicável → página de detalhes do sócio */}
              <Link href={`/service/socio/${socio.id}`} className="block relative h-64 overflow-hidden group/socio">
                {socio.caminho_foto ? (
                  <img
                    src={`${BASE}${socio.caminho_foto}`}
                    alt={socio.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center">
                    <User className="w-16 h-16 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="absolute bottom-3 right-3 flex items-center gap-1 text-[#F0B429] text-xs font-['DM_Sans'] uppercase tracking-wider opacity-0 group-hover/socio:opacity-100 transition-opacity duration-300">
                  Ver Perfil <ChevronRight className="w-4 h-4" />
                </span>
              </Link>

              <div className="p-6 flex flex-col flex-1">
                <Link href={`/service/socio/${socio.id}`} className="group/title">
                  <h3 className="font-['Barlow_Condensed'] font-700 text-2xl text-white uppercase group-hover/title:text-[#F0B429] transition-colors">
                    {socio.nome}
                  </h3>
                </Link>
                <p className="text-white/50 text-sm font-['DM_Sans'] mt-1 mb-5 flex-1">
                  {socio.subtitulo || "—"}
                </p>
                <button
                  onClick={() => abrirFormulario(socio)}
                  className="w-full py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Falar com {primeiroNome(socio)}
                </button>
              </div>
            </div>
          ))}
          {socios.length === 0 && (
            <div className="col-span-full text-center text-white/40 py-10 border border-dashed border-white/10 rounded-sm">
              Nossos sócios estarão disponíveis em breve.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Formulário rápido para o sócio */}
      {socioAtivo && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSocioAtivo(null)}
        >
          <div
            className="bg-[#111111] border border-white/10 rounded-sm w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-['Barlow_Condensed'] font-700 text-2xl text-white uppercase">
                Falar com <span className="text-[#F0B429]">{primeiroNome(socioAtivo)}</span>
              </h3>
              <button onClick={() => setSocioAtivo(null)} className="text-white/40 hover:text-white transition-colors p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {enviado ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-[#F0B429]" />
                <h4 className="font-['Barlow_Condensed'] font-700 text-xl text-white uppercase">Mensagem Enviada!</h4>
                <p className="text-white/60 text-sm font-['DM_Sans']">
                  {primeiroNome(socioAtivo)} receberá seu contato em breve.
                </p>
                <button
                  onClick={() => setSocioAtivo(null)}
                  className="px-6 py-2.5 border border-[#F0B429]/30 text-[#F0B429] font-['Barlow_Condensed'] font-600 text-sm uppercase tracking-wider rounded-sm hover:bg-[#F0B429]/10 transition-colors"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-white/40 text-xs font-['DM_Sans'] font-medium tracking-[0.12em] uppercase mb-1.5">Nome *</label>
                  <input type="text" required placeholder="Seu nome completo" className={inputClass}
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-white/40 text-xs font-['DM_Sans'] font-medium tracking-[0.12em] uppercase mb-1.5">Telefone *</label>
                  <input type="tel" required placeholder="(43) 99999-9999" className={inputClass}
                    value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-white/40 text-xs font-['DM_Sans'] font-medium tracking-[0.12em] uppercase mb-1.5">Mensagem *</label>
                  <textarea required rows={4} placeholder="Escreva sua mensagem para o sócio..." className={`${inputClass} resize-none`}
                    value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex items-center justify-center gap-2.5 py-4 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 text-base uppercase tracking-wider rounded-sm hover:bg-[#FFD060] transition-all duration-200 mt-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {enviando ? "Enviando..." : "Enviar para o Sócio"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

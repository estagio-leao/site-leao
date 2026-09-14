/*
 * LEÃO NORTH — Painel Admin: Branding / Logo — Fase 33
 * Upload da Logo oficial da empresa. O arquivo é gravado SEMPRE com nome fixo em
 * uploads/branding/logo.<ext> (Opção A — sem tabela no banco) e o site inteiro
 * passa a consumir essa logo via api/branding.php (com cache-busting ?v=).
 *
 * Consumo:
 *   POST api/admin/upload_logo.php   (FormData: campo "logo" — requer Bearer Token)
 *   GET  api/branding.php            (via lib/branding.ts / useBranding)
 *
 * Regras do servidor espelhadas aqui para feedback rápido: PNG/JPG/WEBP, até 2 MB.
 * SVG é recusado de propósito (XSS armazenado) — aceitamos apenas rasterização.
 */
import { useEffect, useState } from "react";
import { ImageUp, Upload, X, Info } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/adminFetch";
import { useBranding } from "@/hooks/useBranding";

const BASE = "http://localhost/leaonorth";

const TIPOS_ACEITOS = ["image/png", "image/jpeg", "image/webp"];
const TAMANHO_MAX = 2 * 1024 * 1024; // 2 MB

const goldButtonClass =
  "flex-1 py-3 bg-[#F0B429] text-[#080808] font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-[#FFD060] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryButtonClass =
  "px-5 py-3 bg-white/5 text-white/60 font-['Barlow_Condensed'] font-700 uppercase rounded-sm hover:bg-white/10 hover:text-white transition-colors";

export default function AdminBranding() {
  const { branding, carregando, urlLogo, recarregar } = useBranding();

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputKey, setInputKey] = useState(0); // remonta o <input type="file"> p/ limpar a seleção

  // Revoga o ObjectURL do preview (na troca de arquivo e no desmonte)
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const cancelarSelecao = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setArquivo(null);
    setInputKey((k) => k + 1);
  };

  const handleSelecionar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!TIPOS_ACEITOS.includes(file.type)) {
      toast.warning("Formato inválido. Use PNG, JPG ou WEBP.");
      e.target.value = "";
      return;
    }
    if (file.size > TAMANHO_MAX) {
      toast.warning("A logo deve ter no máximo 2 MB.");
      e.target.value = "";
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setArquivo(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleEnviar = async () => {
    if (!arquivo) {
      toast.warning("Selecione um arquivo de logo primeiro.");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append("logo", arquivo);

    try {
      const res = await adminFetch(`${BASE}/api/admin/upload_logo.php`, {
        method: "POST",
        body: fd, // adminFetch não define Content-Type: multipart preservado
      });
      const dados = (await res.json().catch(() => null)) as { mensagem?: string } | null;

      if (res.ok) {
        toast.success(dados?.mensagem || "Logo atualizada com sucesso!");
        cancelarSelecao();
        recarregar(); // limpa o cache da lib e relê api/branding.php (nova versão)
      } else {
        toast.error(dados?.mensagem || "Erro ao enviar a logo.");
      }
    } catch (err) {
      console.error("Erro no upload da logo", err);
      toast.error("Erro de conexão ao enviar a logo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header da aba */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-['Barlow_Condensed'] text-2xl uppercase font-600">
          Branding / Logo
        </h2>
      </div>

      <p className="text-white/40 text-sm font-['DM_Sans'] mb-8 max-w-2xl leading-relaxed">
        A logo cadastrada aqui substitui automaticamente o selo dourado na página inicial
        (Gateway), nos cabeçalhos e nos rodapés do site. Enquanto nenhuma logo for enviada,
        o site continua exibindo o selo padrão.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ===== Logo atual ===== */}
        <div className="bg-[#111111] border border-white/10 rounded-sm p-6">
          <h3 className="text-white/70 text-xs tracking-widest uppercase font-['DM_Sans'] mb-4">
            Logo Atual
          </h3>

          <div className="h-52 rounded-sm border border-white/5 bg-[#0A0A0A] flex items-center justify-center p-6">
            {urlLogo ? (
              <img
                src={urlLogo}
                alt="Logo atual da Leão North"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                {/* Ilustra o selo dourado que o site está usando como fallback */}
                <div className="w-14 h-14 rounded-sm bg-[#F0B429] flex items-center justify-center">
                  <span className="text-[#080808] font-['Barlow_Condensed'] font-800 text-2xl">LN</span>
                </div>
                <p className="text-white/40 text-xs font-['DM_Sans'] max-w-[240px]">
                  {carregando
                    ? "Carregando informações da logo..."
                    : "Nenhuma logo cadastrada — o site está usando o selo padrão dourado."}
                </p>
              </div>
            )}
          </div>

          <p className="text-white/30 text-xs font-['DM_Sans'] mt-4">
            {branding.existe && urlLogo
              ? `Arquivo: ${branding.logo} · versão (cache-busting): ${branding.versao}`
              : "Nenhum arquivo em uploads/branding/logo.*"}
          </p>
        </div>

        {/* ===== Enviar nova logo ===== */}
        <div className="bg-[#111111] border border-white/10 rounded-sm p-6 flex flex-col">
          <h3 className="text-white/70 text-xs tracking-widest uppercase font-['DM_Sans'] mb-4">
            Enviar Nova Logo
          </h3>

          {/* Preview local da seleção */}
          <div className="h-52 rounded-sm border border-dashed border-white/15 bg-[#0A0A0A] flex items-center justify-center p-6 mb-4">
            {preview ? (
              <img
                src={preview}
                alt="Pré-visualização da nova logo"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <ImageUp className="w-8 h-8 text-white/20" />
                <p className="text-white/30 text-xs font-['DM_Sans']">
                  Selecione um arquivo PNG, JPG ou WEBP (até 2 MB)
                </p>
              </div>
            )}
          </div>

          <input
            key={inputKey}
            id="admin-branding-file"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleSelecionar}
            className="block w-full text-white/60 text-sm font-['DM_Sans'] file:mr-4 file:py-2.5 file:px-4 file:rounded-sm file:border-0 file:bg-white/10 file:text-white file:font-['Barlow_Condensed'] file:uppercase file:tracking-wider hover:file:bg-white/20 file:cursor-pointer"
          />

          <p className="flex items-start gap-2 text-white/30 text-xs font-['DM_Sans'] mt-4 mb-6 leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-px" />
            <span>
              Recomendado: PNG com fundo transparente, no mínimo 512×512 px.
              O envio sobrescreve a logo anterior (o site atualiza na hora, sem deploy).
            </span>
          </p>

          <div className="mt-auto flex gap-3">
            <button
              type="button"
              onClick={handleEnviar}
              disabled={loading || !arquivo}
              className={goldButtonClass}
            >
              {loading ? "Enviando..." : <><Upload className="w-4 h-4" /> Enviar Logo</>}
            </button>
            <button
              type="button"
              onClick={cancelarSelecao}
              disabled={loading || !arquivo}
              className={`${secondaryButtonClass} flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

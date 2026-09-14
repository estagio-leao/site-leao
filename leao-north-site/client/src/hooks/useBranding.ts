/*
 * LEÃO NORTH — FASE 33: useBranding
 * Hook compartilhado que entrega a logo oficial (via lib/branding.ts) para o
 * Gateway, os cabeçalhos, os rodapés e a aba Branding do painel.
 *
 * - `urlLogo` já vem com cache-busting (?v=<versao>); é null quando NÃO há logo
 *   cadastrada — nesse caso o componente mantém o selo dourado padrão.
 * - `recarregar()` limpa o cache e refaz a leitura (usado após o upload).
 */
import { useCallback, useEffect, useState } from "react";
import {
  BRANDING_VAZIO,
  buscarBranding,
  limparCacheBranding,
  urlLogoComVersao,
  type Branding,
} from "@/lib/branding";

export function useBranding() {
  const [branding, setBranding] = useState<Branding>(BRANDING_VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [gatilho, setGatilho] = useState(0);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);

    buscarBranding()
      .then((resultado) => {
        if (ativo) setBranding(resultado);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [gatilho]);

  const recarregar = useCallback(() => {
    limparCacheBranding();
    setGatilho((g) => g + 1);
  }, []);

  return {
    branding,
    carregando,
    /** URL da logo com ?v=<versao> — ou null (usar selo padrão) */
    urlLogo: urlLogoComVersao(branding),
    recarregar,
  };
}

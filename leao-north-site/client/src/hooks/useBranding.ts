/*
 * LEÃO NORTH — FASE 33.1: useBranding
 * Hook compartilhado que entrega as logos oficiais das duas frentes (via
 * lib/branding.ts) para o Gateway, os cabeçalhos, os rodapés e a aba Branding.
 *
 * - `urlLogoService` / `urlLogoMateriais` já vêm com cache-busting (?v=<versao>);
 *   são null quando NÃO há logo cadastrada — nesse caso o componente mantém o selo
 *   dourado padrão (Zap/Package).
 * - `recarregar()` limpa o cache e refaz a leitura (usado após o upload).
 * - `branding` expõe {service, materiais} com {existe, logo, versao, url} para o
 *   painel exibir arquivo/versão de cada frente.
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
    /** URL da logo da frente Service com ?v=<versao> — ou null (selo padrão) */
    urlLogoService: urlLogoComVersao(branding.service),
    /** URL da logo da frente Materiais com ?v=<versao> — ou null (selo padrão) */
    urlLogoMateriais: urlLogoComVersao(branding.materiais),
    recarregar,
  };
}

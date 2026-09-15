/*
 * LEÃO NORTH — FASE 35: âncoras do Service (rolagem e navegação)
 *
 * Problema resolvido: as âncoras institucionais (#inicio, #sobre, #servicos,
 * #portfolio, #depoimentos, #contato) só existem na LANDING /service. Em
 * subpáginas (/service/depoimentos, /service/socio/:id, /service/portfolio/:id)
 * o antigo `document.querySelector(hash)` devolvia null e o clique morria.
 *
 * Regra de ouro:
 *   - já estou na landing  → apenas rolo até a seção (sem recarregar nada);
 *   - estou em subpágina   → navego pelo router (wouter) para /service#ancora e
 *                            rolo DEPOIS que a landing montar.
 *
 * O retry via requestAnimationFrame cobre o tempo de montagem das 9 seções e a
 * "2ª passada" (400 ms) corrige o deslocamento causado pelas seções que buscam
 * dados (Serviços/Portfólio) e crescem em altura após o primeiro scroll.
 */
export const SERVICE_RAIZ = "/service";

/** Tempo máximo de espera pela montagem do elemento (~1s a 60fps). */
const MAX_FRAMES = 60;

/** Atraso da 2ª passada (layout pode mudar após o carregamento assíncrono). */
const REAJUSTE_MS = 400;

/** O elemento-âncora já está montado no DOM atual? */
export function ancoraDisponivel(hash: string): boolean {
  if (typeof document === "undefined") return false;
  return !!document.querySelector(hash);
}

/**
 * Rola suavemente até a âncora, aguardando o elemento existir (retry por frame).
 * Retorna `true` se chegou a rolar na primeira passada.
 */
export function rolarParaAncora(
  hash: string,
  comportamento: ScrollBehavior = "smooth"
): boolean {
  let frames = 0;
  let rolou = false;

  const tentar = () => {
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: comportamento, block: "start" });
      rolou = true;

      // 2ª passada: corrige deslocamento quando as seções terminam o fetch
      window.setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, REAJUSTE_MS);
      return;
    }
    if (frames++ < MAX_FRAMES) requestAnimationFrame(tentar);
  };

  requestAnimationFrame(tentar);
  return rolou;
}

/**
 * Navega para a landing e rola até a âncora (uso nas subpáginas).
 * @param hash  ex.: "#contato"
 * @param navigate  função do useLocation() do wouter
 */
export function navegarParaAncoraService(
  hash: string,
  navigate: (to: string) => void
): void {
  navigate(`${SERVICE_RAIZ}${hash}`);
  rolarParaAncora(hash);
}

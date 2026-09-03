/*
 * LEÃO NORTH — FASE 29: adminFetch
 * Envolve o fetch das chamadas aos endpoints ADMIN injetando o header
 *   Authorization: Bearer <token do localStorage>.
 * Em resposta 401 (token ausente/expirado/revogado): limpa o localStorage e
 * redireciona para a tela de login (/admin).
 *
 * NOTA: NÃO define Content-Type — preserva o que cada caller envia (JSON nos
 * que já passam headers, ou FormData/multipart nos uploads, montado pelo
 * navegador).
 */
export async function adminFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("admin_token");
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    if (window.location.pathname !== "/admin") {
      window.location.assign("/admin"); // força login (sessão expirada)
    }
  }
  return res;
}

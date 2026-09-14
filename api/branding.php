<?php
/*
 * LEÃO NORTH — FASE 33.1: branding.php (PÚBLICO)
 * Informa as logos oficiais das DUAS frentes de negócio, SEM autenticação:
 *
 *   - "service"   → uploads/branding/logo-service.<ext>
 *   - "materiais" → uploads/branding/logo-materiais.<ext>
 *
 * Estratégia (Opção A aprovada — sem tabela `configuracoes`): arquivos canônicos
 * com nome fixo (png | jpg | jpeg | webp — no máximo 1 de cada prefixo). O próprio
 * filemtime() é a "versão", usada pelo frontend para cache-busting (?v=<versao>).
 *
 * Resposta:
 * {
 *   "service":   { "existe": true,  "logo": "/uploads/branding/logo-service.png",   "versao": 1789... },
 *   "materiais": { "existe": false, "logo": null, "versao": 0 }
 * }
 * ← frente sem logo cadastrada mantém o selo dourado padrão no frontend.
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
// O JSON precisa estar sempre fresco (o binário da logo é que é cacheado, com ?v=)
header("Cache-Control: no-cache, no-store, must-revalidate");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

$diretorio = __DIR__ . "/../uploads/branding/";
$extensoes = array("png", "jpg", "jpeg", "webp");

/**
 * Resolve a logo canônica de uma frente: procura logo-<prefixo>.<ext> na ordem
 * da whitelist e devolve o contrato {existe, logo, versao}.
 */
function resolverLogo($diretorio, $prefixo, $extensoes)
{
    foreach ($extensoes as $ext) {
        $arquivo = "logo-" . $prefixo . "." . $ext;
        if (is_file($diretorio . $arquivo)) {
            return array(
                "existe" => true,
                "logo"   => "/uploads/branding/" . $arquivo,
                "versao" => filemtime($diretorio . $arquivo)
            );
        }
    }
    return array("existe" => false, "logo" => null, "versao" => 0);
}

http_response_code(200);
echo json_encode(array(
    "service"   => resolverLogo($diretorio, "service", $extensoes),
    "materiais" => resolverLogo($diretorio, "materiais", $extensoes)
));
?>

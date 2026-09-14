<?php
/*
 * LEÃO NORTH — FASE 33: branding.php (PÚBLICO)
 * Informa a logo oficial cadastrada pelo painel admin, SEM exigir autenticação.
 *
 * Estratégia (Opção A aprovada): arquivo canônico com nome fixo em
 *   uploads/branding/logo.<ext>   (png | jpg | jpeg | webp — no máximo 1)
 * Não há tabela no banco: o próprio filemtime() do arquivo é a "versão", usada
 * pelo frontend para cache-busting (?v=<versao>) — assim a troca da logo no
 * painel invalida o cache do navegador na hora.
 *
 * Resposta:
 *   { "existe": true,  "logo": "/uploads/branding/logo.png", "versao": 1789... }
 *   { "existe": false, "logo": null, "versao": 0 }   ← site mantém o selo padrão
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

$diretorio  = __DIR__ . "/../uploads/branding/";
$extensoes  = array("png", "jpg", "jpeg", "webp");

// Procura o primeiro logo.<ext> existente na ordem da whitelist
$arquivo = null;
foreach ($extensoes as $ext) {
    if (is_file($diretorio . "logo." . $ext)) {
        $arquivo = "logo." . $ext;
        break;
    }
}

if ($arquivo === null) {
    http_response_code(200);
    echo json_encode(array("existe" => false, "logo" => null, "versao" => 0));
    exit();
}

http_response_code(200);
echo json_encode(array(
    "existe" => true,
    "logo"   => "/uploads/branding/" . $arquivo,
    "versao" => filemtime($diretorio . $arquivo)
));
?>

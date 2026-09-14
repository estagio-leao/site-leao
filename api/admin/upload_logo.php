<?php
/*
 * LEÃO NORTH — FASE 33: upload_logo.php (ADMIN — exige Bearer Token)
 * Recebe a Logo oficial da empresa e grava SEMPRE com nome fixo em
 *   uploads/branding/logo.<ext>
 * sobrescrevendo a anterior (Opção A aprovada — sem tabela `configuracoes`).
 *
 * Segurança:
 *   - require_once auth.php: OPTIONS e 401 sem token já tratados pelo middleware;
 *   - whitelist de extensão (png|jpg|jpeg|webp) + validação do MIME REAL (finfo)
 *     + getimagesize() — não confia no nome nem no Content-Type do cliente;
 *   - SVG é RECUSADO DE PROPÓSITO (XML pode conter <script> => XSS armazenado,
 *     já que a logo é servida direto por /uploads/...);
 *   - nome final fixo (nunca $_FILES['name']): impossibilita gravar .php em /uploads;
 *   - limite de 2 MB.
 *
 * Sucesso (200):
 *   { "mensagem":"Logo atualizada com sucesso.",
 *     "logo":"/uploads/branding/logo.png", "versao": 1789... }
 */
require_once __DIR__ . '/auth.php';

header("Content-Type: application/json; charset=UTF-8");

$diretorio   = __DIR__ . "/../../uploads/branding/";
$TAMANHO_MAX = 2 * 1024 * 1024; // 2 MB
$formatos    = array(
    "png"  => "image/png",
    "jpg"  => "image/jpeg",
    "jpeg" => "image/jpeg",
    "webp" => "image/webp",
);

// --- 1) Presença do arquivo -------------------------------------------------
if (!isset($_FILES['logo'])) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Envie um arquivo de logo."));
    exit();
}

$erro = $_FILES['logo']['error'];
if ($erro !== UPLOAD_ERR_OK) {
    http_response_code(400);
    $mensagem = $erro === UPLOAD_ERR_INI_SIZE
        ? "O arquivo excede o limite permitido pelo servidor."
        : "Falha no upload do arquivo.";
    echo json_encode(array("mensagem" => $mensagem));
    exit();
}

// --- 2) Tamanho -------------------------------------------------------------
if ((int) $_FILES['logo']['size'] > $TAMANHO_MAX) {
    http_response_code(413);
    echo json_encode(array("mensagem" => "A logo deve ter no máximo 2 MB."));
    exit();
}

// --- 3) Extensão (whitelist — SVG fica de fora) -----------------------------
$extensao = strtolower(pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION));
if (!isset($formatos[$extensao])) {
    http_response_code(415);
    echo json_encode(array("mensagem" => "Formato inválido. Use PNG, JPG ou WEBP."));
    exit();
}

// --- 4) MIME real + integridade da imagem -----------------------------------
$mimeReal = null;
if (function_exists('finfo_open')) {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo !== false) {
        $mimeReal = finfo_file($finfo, $_FILES['logo']['tmp_name']);
        finfo_close($finfo);
    }
} elseif (function_exists('mime_content_type')) {
    $mimeReal = mime_content_type($_FILES['logo']['tmp_name']);
}

if ($mimeReal === null || $mimeReal !== $formatos[$extensao]) {
    http_response_code(415);
    echo json_encode(array("mensagem" => "O conteúdo do arquivo não corresponde a uma imagem válida."));
    exit();
}

if (@getimagesize($_FILES['logo']['tmp_name']) === false) {
    http_response_code(415);
    echo json_encode(array("mensagem" => "Arquivo não é uma imagem válida."));
    exit();
}

// --- 5) Garante o diretório -------------------------------------------------
if (!is_dir($diretorio)) {
    if (!mkdir($diretorio, 0755, true) && !is_dir($diretorio)) {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Não foi possível preparar a pasta de uploads."));
        exit();
    }
}

// --- 6) Remove logos de OUTRAS extensões (evita ambiguidade logo.png x logo.webp)
$antigos = glob($diretorio . "logo.*");
if (is_array($antigos)) {
    foreach ($antigos as $antigo) {
        $extAntiga = strtolower(pathinfo($antigo, PATHINFO_EXTENSION));
        if ($extAntiga !== $extensao && is_file($antigo)) {
            @unlink($antigo);
        }
    }
}

// --- 7) Grava com nome FIXO (nunca o nome enviado pelo cliente) --------------
$caminhoFinal = $diretorio . "logo." . $extensao;

if (!move_uploaded_file($_FILES['logo']['tmp_name'], $caminhoFinal)) {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro ao salvar a logo no servidor."));
    exit();
}

// Garante mtime novo (base do cache-busting, mesmo se o conteúdo for idêntico)
@touch($caminhoFinal);

http_response_code(200);
echo json_encode(array(
    "mensagem" => "Logo atualizada com sucesso.",
    "logo"     => "/uploads/branding/logo." . $extensao,
    "versao"   => filemtime($caminhoFinal)
));
?>

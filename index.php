<?php
/*
 * LEÃO NORTH — FASE 30: index.php (bridge de SEO/Open Graph)
 * Atende as deep-links do SPA: consulta o banco para as rotas dinâmicas,
 * injeta as meta tags <meta property="og:..."> / twitter / canonical no <head>
 * e devolve o HTML do React (lido do index.html do build, que fica ao lado).
 *
 * Em produção o SPA e a /api vivem no MESMO docroot (ex.: public_html).
 * O .htaccess roteia para este arquivo apenas quando o recurso não é um
 * arquivo real (e não pertence a /api, /uploads ou /assets).
 */

// ===== CONFIG (ajustar por ambiente) =====
$BASE_URL  = "http://localhost/leaonorth"; // produção: "https://leaonorth.com.br"
$BASE_PATH = "/leaonorth";                  // produção: "/" (aplicação na raiz do domínio)
$SPA_INDEX = __DIR__ . "/index.html";      // build do Vite copiado p/ a raiz (em prod substitui o shell de teste)

$SITE_NAME = "Leão North";

// Credenciais do banco (padrão local XAMPP; ajustar na produção)
$DB_HOST = "localhost";
$DB_NAME = "leao_north";
$DB_USER = "root";
$DB_PASS = "";

// Meta padrão por rota estática: [título, descrição, imagem(caminho ou null)]
$DEFAULT_META = array(
    "/"          => array("Leão North — Instalações Elétricas e Materiais",
                          "Instalações elétricas residenciais, comerciais e industriais e materiais elétricos em Cornélio Procópio - PR.", null),
    "/service"   => array("Leão North Service — Instalações Elétricas",
                          "Projetos e serviços de engenharia elétrica com qualidade e segurança em Cornélio Procópio - PR.", null),
    "/materiais" => array("Leão North Materiais — Materiais Elétricos",
                          "Catálogo de materiais elétricos: iluminação, quadros, disjuntores e muito mais.", null),
);

// ===== 1) URI (sem query string) e remoção do prefixo base =====
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = $path === false || $path === null ? "/" : $path;

if ($BASE_PATH !== "/" && strpos($path, $BASE_PATH) === 0) {
    $path = substr($path, strlen($BASE_PATH));
}
$path = "/" . ltrim($path, "/");
$path = rtrim($path, "/");
if ($path === "") {
    $path = "/";
}

// ===== 2) Resolve metadados da rota =====
list($title, $description, $image) = resolverMeta($path);

// ===== 3) Monta as tags de head =====
$ogUrl  = htmlspecialchars($BASE_URL . $path, ENT_QUOTES, "UTF-8");
$ogTitle = htmlspecialchars($title, ENT_QUOTES, "UTF-8");
$ogDesc  = htmlspecialchars($description, ENT_QUOTES, "UTF-8");

$headExtra  = "    <title>{$ogTitle}</title>\n";
$headExtra .= "    <meta name=\"description\" content=\"{$ogDesc}\" />\n";
$headExtra .= "    <link rel=\"canonical\" href=\"{$ogUrl}\" />\n";
$headExtra .= "    <meta property=\"og:type\" content=\"website\" />\n";
$headExtra .= "    <meta property=\"og:site_name\" content=\"{$SITE_NAME}\" />\n";
$headExtra .= "    <meta property=\"og:locale\" content=\"pt_BR\" />\n";
$headExtra .= "    <meta property=\"og:url\" content=\"{$ogUrl}\" />\n";
$headExtra .= "    <meta property=\"og:title\" content=\"{$ogTitle}\" />\n";
$headExtra .= "    <meta property=\"og:description\" content=\"{$ogDesc}\" />\n";
$headExtra .= "    <meta name=\"twitter:card\" content=\"summary_large_image\" />\n";
$headExtra .= "    <meta name=\"twitter:title\" content=\"{$ogTitle}\" />\n";
$headExtra .= "    <meta name=\"twitter:description\" content=\"{$ogDesc}\" />";

if ($image) {
    $ogImage = htmlspecialchars($BASE_URL . $image, ENT_QUOTES, "UTF-8");
    $headExtra .= "\n    <meta property=\"og:image\" content=\"{$ogImage}\" />";
    $headExtra .= "\n    <meta name=\"twitter:image\" content=\"{$ogImage}\" />";
}

// ===== 4) Lê o HTML do SPA (index.html do build ao lado) =====
if (is_file($SPA_INDEX)) {
    $html = (string) file_get_contents($SPA_INDEX);
} else {
    // Degradação segura: devolve um HTML mínimo (crawler ainda lê as metas)
    $html = "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"UTF-8\" />\n"
          . "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n"
          . "</head>\n<body>\n<div id=\"root\"></div>\n</body>\n</html>";
}

// ===== 5) Remove metas antigas (evita duplicidade) e injeta as novas antes de </head> =====
// property="og:*" ou property="twitter:*"
$html = preg_replace('/<meta\b(?=[^>]*\bproperty\s*=\s*["\'](?:og|twitter):)[^>]*>/i', '', $html);
// name="description" ou name="robots"
$html = preg_replace('/<meta\b(?=[^>]*\bname\s*=\s*["\'](?:description|robots)["\'])[^>]*>/i', '', $html);
$html = preg_replace('/<title[^>]*>.*?<\/title>/is', '', $html);
$html = preg_replace('/<link\b[^>]*rel\s*=\s*["\']canonical["\'][^>]*>/i', '', $html);

if (stripos($html, '</head>') !== false) {
    $html = preg_replace('/<\/head>/i', $headExtra . "\n</head>", $html, 1);
} else {
    // Sem </head>: injeta logo após <head ...> (ou no início do <html>)
    if (preg_match('/<head([^>]*)>/i', $html, $m, PREG_OFFSET_CAPTURE)) {
        $html = substr_replace($html, "<head{$m[1][0]}>\n" . $headExtra, $m[0][1], strlen($m[0][0]));
    } else {
        $html = str_ireplace('<!doctype html>', "<!doctype html>\n<head>\n" . $headExtra . "\n</head>", $html, $count);
        if ($count === 0) {
            $html = $headExtra . $html;
        }
    }
}

header("Content-Type: text/html; charset=UTF-8");
echo $html;
exit;

/* ==================== Funções ==================== */

/**
 * Resolve [título, descrição, imagem] para uma rota.
 * Rotas dinâmicas consultam o banco; demais usam o padrão por rota estática.
 */
function resolverMeta(string $path): array
{
    global $DEFAULT_META;

    // 1) /service/portfolio/{id}
    if (preg_match('#^/service/portfolio/(\d+)$#', $path, $m)) {
        $pdo = abrirPdo();
        $stmt = $pdo->prepare(
            "SELECT p.titulo, p.subtitulo, p.descricao,
                    c.nome AS categoria_nome,
                    (SELECT pi.caminho_imagem FROM portfolio_imagens pi
                      WHERE pi.projeto_id = p.id
                      ORDER BY pi.is_capa DESC, pi.id ASC LIMIT 1) AS capa
               FROM portfolio_projetos p
               LEFT JOIN servicos_categorias c ON c.id = p.servico_categoria_id
              WHERE p.id = :id LIMIT 1"
        );
        $stmt->execute(array(":id" => (int) $m[1]));
        $r = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$r) { return metaGenerica(); }

        $titulo = trim((string) ($r['titulo'] ?? ''));
        $desc   = ($r['subtitulo'] ?: $r['descricao']) ?: "";
        if (!empty($r['categoria_nome'])) { $titulo .= ' — ' . $r['categoria_nome']; }
        return array(resumo($titulo, 90), resumo((string) $desc, 150), normalizarImg($r['capa']));
    }

    // 2) /service/socio/{id}
    if (preg_match('#^/service/socio/(\d+)$#', $path, $m)) {
        $pdo = abrirPdo();
        $stmt = $pdo->prepare(
            "SELECT nome, subtitulo, descricao, caminho_foto FROM socios WHERE id = :id LIMIT 1"
        );
        $stmt->execute(array(":id" => (int) $m[1]));
        $r = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$r) { return metaGenerica(); }

        $desc = $r['subtitulo'] ?: $r['descricao'];
        if (!$desc) { $desc = "Sócio da Leão North — Instalações Elétricas."; }
        return array((string) $r['nome'], resumo((string) $desc, 150), normalizarImg($r['caminho_foto']));
    }

    // 3) /materiais/{id}  (produto)
    if (preg_match('#^/materiais/(\d+)$#', $path, $m)) {
        $pdo = abrirPdo();
        $stmt = $pdo->prepare(
            "SELECT p.nome, p.especificacao, p.descricao,
                    c.nome AS categoria_nome,
                    (SELECT pi.caminho_imagem FROM produto_imagens pi
                      WHERE pi.produto_id = p.id
                      ORDER BY pi.is_capa DESC, pi.id ASC LIMIT 1) AS capa
               FROM produtos p
               LEFT JOIN categorias c ON c.id = p.categoria_id
              WHERE p.id = :id LIMIT 1"
        );
        $stmt->execute(array(":id" => (int) $m[1]));
        $r = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$r) { return metaGenerica(); }

        $titulo = trim((string) ($r['nome'] ?? ''));
        $desc   = ($r['especificacao'] ?: $r['descricao']) ?: "";
        if (!empty($r['categoria_nome'])) { $titulo .= ' — ' . $r['categoria_nome']; }
        return array(resumo($titulo, 90), resumo((string) $desc, 150), normalizarImg($r['capa']));
    }

    // 4) Rotas estáticas do SPA
    if (isset($DEFAULT_META[$path])) { return $DEFAULT_META[$path]; }
    if ($path === "/service/depoimentos") { return $DEFAULT_META["/service"]; }
    return metaGenerica();
}

function metaGenerica(): array
{
    return array("Leão North — Instalações Elétricas e Materiais",
                 "Instalações elétricas e materiais elétricos em Cornélio Procópio - PR.",
                 null);
}

function abrirPdo(): PDO
{
    global $DB_HOST, $DB_NAME, $DB_USER, $DB_PASS;
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
            $DB_USER,
            $DB_PASS,
            array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
        );
    }
    return $pdo;
}

function normalizarImg($c): ?string
{
    if ($c === null || trim((string) $c) === "") { return null; }
    $c = trim((string) $c);
    return strpos($c, "/") === 0 ? $c : "/" . $c; // garante "/uploads/..."
}

function resumo(string $txt, int $max): string
{
    $txt = trim(preg_replace('/\s+/u', ' ', strip_tags($txt)));
    if ($txt === "") { return ""; }
    if (function_exists('mb_strlen')) {
        if (mb_strlen($txt) <= $max) { return $txt; }
        return rtrim(mb_substr($txt, 0, $max - 1)) . "…";
    }
    if (strlen($txt) <= $max) { return $txt; }
    return rtrim(substr($txt, 0, $max - 1)) . "…";
}

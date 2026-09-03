<?php
/*
 * LEÃO NORTH — FASE 29: auth.php (middleware de autenticação do admin)
 * Uso (no topo do endpoint, logo após <?php):
 *   require_once __DIR__ . '/auth.php';            // endpoints em api/admin/
 *   require_once __DIR__ . '/../auth.php';         // endpoints em api/admin/service/
 *
 * Comportamento:
 *   1) Responde ao preflight OPTIONS (200) ANTES de validar (senão o navegador
 *      bloquearia o CORS e o OPTIONS seria respondido com 401).
 *   2) Lê o header "Authorization: Bearer <token>".
 *   3) Valida o token em admin_users (existência + token_expiracao > NOW()).
 *   4) Inválido/expirado/ausente => HTTP 401 + exit. Válido => segue o endpoint
 *      e expõe o id do admin autenticado em $GLOBALS['__admin_id'].
 */

// --- CORS (mantém o padrão dos endpoints; acrescenta Authorization) ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Preflight: sempre 200 (sem exigir auth)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Extrai o token do header Authorization (com fallback p/ CGI/FastCGI) ---
$autorizacao = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if ($autorizacao === '' && function_exists('getallheaders')) {
    foreach (getallheaders() as $chave => $valor) {
        if (strtolower($chave) === 'authorization') { $autorizacao = $valor; break; }
    }
}
$token = null;
if (preg_match('/Bearer\s+([A-Fa-f0-9]{64})/', $autorizacao, $m)) {
    $token = $m[1];
}

if ($token === null) {
    http_response_code(401);
    echo json_encode(array("mensagem" => "Não autenticado."));
    exit();
}

// --- Conexão + validação (mesmo padrão de credenciais dos demais endpoints) ---
$host = "localhost"; $db_name = "leao_north"; $username = "root"; $password_db = "";
try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $query = "SELECT id FROM admin_users
              WHERE token = :token AND token_expiracao IS NOT NULL AND token_expiracao > NOW()
              LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":token", $token);
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        http_response_code(401);
        echo json_encode(array("mensagem" => "Sessão expirada. Faça login novamente."));
        exit();
    }
    $GLOBALS['__admin_id'] = (int)$admin['id'];
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro interno."));
    exit();
}

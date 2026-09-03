<?php
// LEÃO NORTH — FASE 29: logout — invalida o token no servidor
require_once __DIR__ . '/auth.php'; // valida o Bearer e popula $GLOBALS['__admin_id']

if (!empty($GLOBALS['__admin_id'])) {
    $host = "localhost"; $db_name = "leao_north"; $username = "root"; $password_db = "";
    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $conn->prepare("UPDATE admin_users SET token = NULL, token_expiracao = NULL WHERE id = :id");
        $stmt->bindParam(":id", $GLOBALS['__admin_id'], PDO::PARAM_INT);
        $stmt->execute();

        http_response_code(200);
        echo json_encode(array("mensagem" => "Sessão encerrada."));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro interno."));
    }
}

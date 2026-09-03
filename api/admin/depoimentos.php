<?php
/*
 * LEÃO NORTH — FASE 29: depoimentos (ADMIN, PRIVADO)
 * Lista TODOS os depoimentos (inclusive ocultos) para a curadoria do painel.
 * Substitui o uso público de api/depoimentos.php?admin=1 (que "vazava" os
 * depoimentos com visivel=0 para qualquer visitante).
 *
 * Proteção: exige o middleware api/admin/auth.php (Bearer Token).
 */
require_once __DIR__ . '/auth.php';

$host = "localhost"; $db_name = "leao_north"; $username = "root"; $password_db = "";

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $query = "SELECT id, nome, estrelas, texto, visivel, destaque FROM depoimentos ORDER BY id DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro: " . $e->getMessage()));
}

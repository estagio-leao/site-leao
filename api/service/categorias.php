<?php
// FASE 22 — Leão Service: Serviços/Categorias (público GET)
// Retorna os Serviços (que também são a taxonomia de categoria dos projetos).
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$db_name = "leao_north";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Entidade servicos_categorias — ordem por id preserva a ordem dos cards
    $query = "SELECT id, nome, descricao FROM servicos_categorias ORDER BY id ASC";
    $stmt = $conn->prepare($query);
    $stmt->execute();

    $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($itens);
} catch (PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro de conexão: " . $exception->getMessage()));
}
?>

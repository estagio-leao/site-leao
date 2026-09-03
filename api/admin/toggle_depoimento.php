<?php
// FASE 29 — exige Bearer Token válido (auth.php): responde OPTIONS e devolve 401 se inválido.
require_once __DIR__ . '/auth.php';
// FASE 27 — Leão Service: alterna RÁPIDO um campo booleano de depoimento
// (visivel | destaque) sem precisar abrir/editar o registro completo.
// Corpo: JSON { "id": 1, "campo": "visivel" | "destaque", "valor": 0 | 1 }
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

header("Content-Type: application/json; charset=UTF-8");

$dados = json_decode(file_get_contents("php://input"));

if (empty($dados->id) || !in_array($dados->campo ?? "", array("visivel", "destaque"), true)) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Dados incompletos ou campo inválido."));
    exit();
}

$id = (int)$dados->id;
$campo = $dados->campo; // whitelist acima — seguro para interpolar
$valor = (isset($dados->valor) && ((int)$dados->valor === 1)) ? 1 : 0;

$host = "localhost"; $db_name = "leao_north"; $username = "root"; $password = "";

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $query = "UPDATE depoimentos SET {$campo} = :valor WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":valor", $valor, PDO::PARAM_INT);
    $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    http_response_code(200);
    echo json_encode(array("mensagem" => "Atualizado.", "id" => $id, "campo" => $campo, "valor" => $valor));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro: " . $e->getMessage()));
}
?>

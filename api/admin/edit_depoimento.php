<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }
header("Content-Type: application/json; charset=UTF-8");

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->id) && !empty($dados->nome) && !empty($dados->estrelas)) {
    $host = "localhost"; $db_name = "leao_north"; $username = "root"; $password = "";
    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Fase 27 — curadoria: visivel (default 1) e destaque (default 0)
        $visivel  = isset($dados->visivel)  ? (int)(bool)$dados->visivel  : 1;
        $destaque = isset($dados->destaque) ? (int)(bool)$dados->destaque : 0;

        $query = "UPDATE depoimentos SET nome = :nome, estrelas = :estrelas, texto = :texto,
                  visivel = :visivel, destaque = :destaque WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $dados->id);
        $stmt->bindParam(":nome", $dados->nome);
        $stmt->bindParam(":estrelas", $dados->estrelas);

        $texto = isset($dados->texto) ? $dados->texto : "";
        $stmt->bindParam(":texto", $texto);
        $stmt->bindParam(":visivel", $visivel);
        $stmt->bindParam(":destaque", $destaque);

        if ($stmt->execute()) {
            http_response_code(200); echo json_encode(array("mensagem" => "Depoimento atualizado."));
        }
    } catch(PDOException $e) {
        http_response_code(500); echo json_encode(array("mensagem" => "Erro: " . $e->getMessage()));
    }
} else {
    http_response_code(400); echo json_encode(array("mensagem" => "Dados incompletos."));
}
?>
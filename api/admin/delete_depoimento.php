<?php
// FASE 29 — exige Bearer Token válido (auth.php): responde OPTIONS e devolve 401 se inválido.
require_once __DIR__ . '/auth.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }
header("Content-Type: application/json; charset=UTF-8");

if (isset($_GET['id'])) {
    $host = "localhost"; $db_name = "leao_north"; $username = "root"; $password = "";
    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $query = "DELETE FROM depoimentos WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $_GET['id']);
        
        if ($stmt->execute()) {
            http_response_code(200); echo json_encode(array("mensagem" => "Removido com sucesso."));
        }
    } catch(PDOException $e) {
        http_response_code(500); echo json_encode(array("mensagem" => "Erro: " . $e->getMessage()));
    }
}
?>
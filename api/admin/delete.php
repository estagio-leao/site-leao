<?php
// FASE 29 — exige Bearer Token válido (auth.php): responde OPTIONS e devolve 401 se inválido.
require_once __DIR__ . '/auth.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// ... CONTINUA O RESTO DO CÓDIGO NORMALMENTE

if (isset($_GET['id'])) {
    $host = "localhost"; 
    $db_name = "leao_north"; // ALTERE AQUI
    $username = "root"; // ALTERE AQUI
    $password_db = ""; // ALTERE AQUI
    
    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $query = "DELETE FROM portfolio WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $_GET['id']);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("mensagem" => "Projeto removido."));
        }
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro."));
    }
}
?>
<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Responde ao preflight do navegador e encerra
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

    $categorias = $conn->query("SELECT id, nome FROM categorias ORDER BY nome ASC")
        ->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($categorias);
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro de conexão: " . $exception->getMessage()));
}
?>

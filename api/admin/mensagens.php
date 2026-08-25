<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost"; $db_name = "leao_north"; $username = "root"; $password = "";

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Puxa as mensagens da mais nova para a mais velha (agora inclui tipo_mensagem)
    $query = "SELECT id, nome, telefone, email, servico, mensagem, tipo_mensagem, data_envio FROM contatos ORDER BY id DESC";
    $stmt = $conn->prepare($query); $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch(PDOException $e) {
    http_response_code(500); echo json_encode(array("mensagem" => "Erro: " . $e->getMessage()));
}
?>

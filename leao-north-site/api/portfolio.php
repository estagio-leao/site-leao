<?php
// /api/portfolio.php
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost"; 
$db_name = "nleao_north";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Busca os itens do banco de dados (tabela que vamos criar)
    $query = "SELECT img, title, category, size FROM portfolio ORDER BY id DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    http_response_code(200);
    echo json_encode($itens);
    
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro de conexão: " . $exception->getMessage()));
}
?>
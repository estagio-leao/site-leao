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

    // Filtro opcional por categoria: api/produtos.php?categoria=disjuntores
    if (isset($_GET['categoria']) && $_GET['categoria'] !== '') {
        $query = "SELECT id, nome, especificacao, categoria, imagem, data_cadastro
                  FROM produtos WHERE categoria = :categoria ORDER BY id DESC";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":categoria", $_GET['categoria']);
    } else {
        $query = "SELECT id, nome, especificacao, categoria, imagem, data_cadastro
                  FROM produtos ORDER BY id DESC";
        $stmt = $conn->prepare($query);
    }

    $stmt->execute();

    http_response_code(200);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro de conexão: " . $exception->getMessage()));
}
?>

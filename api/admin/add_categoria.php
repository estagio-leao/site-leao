<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Responde ao preflight do navegador e encerra
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// ---- Validação do nome ----
if (!isset($_POST['nome']) || trim($_POST['nome']) === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Nome da categoria é obrigatório."));
    exit();
}
$nome = trim($_POST['nome']);

$host = "localhost";
$db_name = "leao_north";
$username = "root";
$password_db = "";

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare("INSERT INTO categorias (nome) VALUES (:nome)");
    $stmt->bindParam(":nome", $nome);
    $stmt->execute();

    http_response_code(200);
    echo json_encode(array("mensagem" => "Categoria criada com sucesso.", "id" => $conn->lastInsertId()));
} catch (PDOException $exception) {
    // SQLSTATE 23000 = duplicidade (nome UNIQUE)
    if ($exception->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(array("mensagem" => "Já existe uma categoria com esse nome."));
    } else {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro ao criar categoria."));
    }
}
?>

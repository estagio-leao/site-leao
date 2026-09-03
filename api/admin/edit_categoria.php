<?php
// FASE 29 — exige Bearer Token válido (auth.php): responde OPTIONS e devolve 401 se inválido.
require_once __DIR__ . '/auth.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Responde ao preflight do navegador e encerra
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// ---- Validação do ID e do nome ----
if (!isset($_POST['id']) || $_POST['id'] === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "ID não informado."));
    exit();
}
if (!isset($_POST['nome']) || trim($_POST['nome']) === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Nome da categoria é obrigatório."));
    exit();
}
$id = (int)$_POST['id'];
$nome = trim($_POST['nome']);

$host = "localhost";
$db_name = "leao_north";
$username = "root";
$password_db = "";

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare("UPDATE categorias SET nome = :nome WHERE id = :id");
    $stmt->bindParam(":nome", $nome);
    $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    http_response_code(200);
    echo json_encode(array("mensagem" => "Categoria atualizada com sucesso."));
} catch (PDOException $exception) {
    // SQLSTATE 23000 = duplicidade (nome UNIQUE)
    if ($exception->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(array("mensagem" => "Já existe uma categoria com esse nome."));
    } else {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro ao atualizar categoria."));
    }
}
?>

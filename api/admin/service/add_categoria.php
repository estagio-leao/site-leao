<?php
// FASE 29 — exige Bearer Token válido (auth.php): responde OPTIONS e devolve 401 se inválido.
require_once __DIR__ . '/../auth.php';
// FASE 22 — Leão Service: cria um Serviço/Categoria (servicos_categorias)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// ---- Validação do nome ----
if (!isset($_POST['nome']) || trim($_POST['nome']) === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Nome do serviço/categoria é obrigatório."));
    exit();
}
$nome = trim($_POST['nome']);

// ---- Descrição (opcional; vazio vira NULL) ----
$descricao = (isset($_POST['descricao']) && trim($_POST['descricao']) !== '')
    ? $_POST['descricao']
    : null;

$host = "localhost";
$db_name = "leao_north";
$username = "root";
$password_db = "";

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $conn->prepare("INSERT INTO servicos_categorias (nome, descricao) VALUES (:nome, :descricao)");
    $stmt->bindParam(":nome", $nome);
    if ($descricao === null) {
        $stmt->bindValue(":descricao", null, PDO::PARAM_NULL);
    } else {
        $stmt->bindParam(":descricao", $descricao);
    }
    $stmt->execute();

    http_response_code(200);
    echo json_encode(array("mensagem" => "Serviço/categoria criado com sucesso.", "id" => $conn->lastInsertId()));
} catch (PDOException $exception) {
    // SQLSTATE 23000 = duplicidade (nome UNIQUE)
    if ($exception->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(array("mensagem" => "Já existe um serviço/categoria com esse nome."));
    } else {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro ao criar serviço/categoria."));
    }
}
?>

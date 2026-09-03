<?php
// FASE 29 — exige Bearer Token válido (auth.php): responde OPTIONS e devolve 401 se inválido.
require_once __DIR__ . '/../auth.php';
// FASE 22 — Leão Service: edita um Serviço/Categoria (servicos_categorias)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

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
    echo json_encode(array("mensagem" => "Nome do serviço/categoria é obrigatório."));
    exit();
}
$id = (int)$_POST['id'];
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

    // Verifica se existe
    $q = $conn->prepare("SELECT id FROM servicos_categorias WHERE id = :id");
    $q->bindParam(":id", $id, PDO::PARAM_INT);
    $q->execute();
    if (!$q->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(array("mensagem" => "Serviço/categoria não encontrado."));
        exit();
    }

    $stmt = $conn->prepare("UPDATE servicos_categorias SET nome = :nome, descricao = :descricao WHERE id = :id");
    $stmt->bindParam(":nome", $nome);
    if ($descricao === null) {
        $stmt->bindValue(":descricao", null, PDO::PARAM_NULL);
    } else {
        $stmt->bindParam(":descricao", $descricao);
    }
    $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    http_response_code(200);
    echo json_encode(array("mensagem" => "Serviço/categoria atualizado com sucesso."));
} catch (PDOException $exception) {
    // SQLSTATE 23000 = duplicidade (nome UNIQUE)
    if ($exception->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(array("mensagem" => "Já existe um serviço/categoria com esse nome."));
    } else {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro ao atualizar serviço/categoria."));
    }
}
?>

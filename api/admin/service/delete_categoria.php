<?php
// FASE 22 — Leão Service: exclui um Serviço/Categoria (servicos_categorias)
// FK portfolio_projetos.servico_categoria_id = ON DELETE SET NULL → excluir a
// categoria NÃO apaga os projetos (eles ficam sem categoria).
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

if (isset($_GET['id']) && $_GET['id'] !== '') {
    $id = (int)$_GET['id'];

    $host = "localhost";
    $db_name = "leao_north";
    $username = "root";
    $password_db = "";

    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $conn->prepare("DELETE FROM servicos_categorias WHERE id = :id");
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("mensagem" => "Serviço/categoria removido."));
        } else {
            http_response_code(500);
            echo json_encode(array("mensagem" => "Erro ao remover o serviço/categoria."));
        }
    } catch (PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("mensagem" => "ID não informado."));
}
?>

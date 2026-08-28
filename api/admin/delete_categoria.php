<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Responde ao preflight do navegador e encerra
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

        // FK grupos.categoria_id ON DELETE RESTRICT impede exclusão com grupos vinculados
        $stmt = $conn->prepare("DELETE FROM categorias WHERE id = :id");
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("mensagem" => "Categoria removida."));
        } else {
            http_response_code(500);
            echo json_encode(array("mensagem" => "Erro ao remover a categoria."));
        }
    } catch (PDOException $exception) {
        // SQLSTATE 23000 = violação de FK (RESTRICT) → categoria possui grupos
        if ($exception->getCode() == 23000) {
            http_response_code(409);
            echo json_encode(array("mensagem" => "Não é possível excluir: a categoria possui grupos vinculados."));
        } else {
            http_response_code(500);
            echo json_encode(array("mensagem" => "Erro."));
        }
    }
} else {
    http_response_code(400);
    echo json_encode(array("mensagem" => "ID não informado."));
}
?>

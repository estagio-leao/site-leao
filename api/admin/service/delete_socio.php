<?php
// FASE 22 — Leão Service: exclui um Sócio (socios) + remove a foto física
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

    $diretorio_upload = "../../../uploads/";

    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // 1) Resgata a foto do sócio antes de excluir
        $q = $conn->prepare("SELECT caminho_foto FROM socios WHERE id = :id");
        $q->bindParam(":id", $id, PDO::PARAM_INT);
        $q->execute();
        $socio = $q->fetch(PDO::FETCH_ASSOC);

        if (!$socio) {
            http_response_code(404);
            echo json_encode(array("mensagem" => "Sócio não encontrado."));
            exit();
        }

        // 2) Exclui o sócio
        $stmt = $conn->prepare("DELETE FROM socios WHERE id = :id");
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            // 3) Remove a foto física (se existir) — evita arquivo órfão
            if ($socio['caminho_foto']) {
                $caminho = $diretorio_upload . basename($socio['caminho_foto']);
                if (file_exists($caminho)) @unlink($caminho);
            }
            http_response_code(200);
            echo json_encode(array("mensagem" => "Sócio removido."));
        } else {
            http_response_code(500);
            echo json_encode(array("mensagem" => "Erro ao remover o sócio."));
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

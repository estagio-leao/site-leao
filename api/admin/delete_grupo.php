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

    $diretorio_upload = "../../uploads/";

    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // 1) Resgata a capa do grupo antes de excluir
        $q = $conn->prepare("SELECT caminho_imagem_capa FROM grupos WHERE id = :id");
        $q->bindParam(":id", $id, PDO::PARAM_INT);
        $q->execute();
        $grupo = $q->fetch(PDO::FETCH_ASSOC);

        // 2) Exclui o grupo — produtos.grupo_id fica NULL via ON DELETE SET NULL
        $stmt = $conn->prepare("DELETE FROM grupos WHERE id = :id");
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            // 3) Remove a capa física (se existir) — evita arquivo órfão
            if ($grupo && $grupo['caminho_imagem_capa']) {
                $caminho = $diretorio_upload . basename($grupo['caminho_imagem_capa']);
                if (file_exists($caminho)) @unlink($caminho);
            }
            http_response_code(200);
            echo json_encode(array("mensagem" => "Grupo removido."));
        } else {
            http_response_code(500);
            echo json_encode(array("mensagem" => "Erro ao remover o grupo."));
        }
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("mensagem" => "ID não informado."));
}
?>

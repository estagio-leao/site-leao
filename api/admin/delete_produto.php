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
    $host = "localhost";
    $db_name = "leao_north";
    $username = "root";
    $password_db = "";

    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // 1) Resgata o caminho da imagem ANTES de excluir o registro
        $query_imagem = "SELECT imagem FROM produtos WHERE id = :id";
        $stmt_imagem = $conn->prepare($query_imagem);
        $stmt_imagem->bindParam(":id", $_GET['id']);
        $stmt_imagem->execute();
        $produto = $stmt_imagem->fetch(PDO::FETCH_ASSOC);

        // 2) Remove o registro do banco
        $query = "DELETE FROM produtos WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $_GET['id']);

        if ($stmt->execute()) {
            // 3) Remove o arquivo físico da pasta uploads (evita arquivos órfãos)
            if ($produto && !empty($produto['imagem'])) {
                $arquivo = basename($produto['imagem']);
                $caminho = "../../uploads/" . $arquivo;
                if (file_exists($caminho)) @unlink($caminho);
            }

            http_response_code(200);
            echo json_encode(array("mensagem" => "Produto removido."));
        } else {
            http_response_code(500);
            echo json_encode(array("mensagem" => "Erro ao remover o produto."));
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

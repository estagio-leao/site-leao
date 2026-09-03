<?php
// FASE 29 — exige Bearer Token válido (auth.php): responde OPTIONS e devolve 401 se inválido.
require_once __DIR__ . '/auth.php';
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

        // 1) Resgata TODAS as imagens do produto ANTES de excluir (produto_imagens)
        $query_imagens = "SELECT caminho_imagem FROM produto_imagens WHERE produto_id = :id";
        $stmt_imagens = $conn->prepare($query_imagens);
        $stmt_imagens->bindParam(":id", $_GET['id']);
        $stmt_imagens->execute();
        $imagens = $stmt_imagens->fetchAll(PDO::FETCH_ASSOC);

        // 2) Exclui o produto — FKs ON DELETE CASCADE removem produto_imagens e produto_informacoes
        $query = "DELETE FROM produtos WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $_GET['id']);

        if ($stmt->execute()) {
            // 3) Remove fisicamente TODAS as imagens da pasta uploads (evita arquivos órfãos)
            foreach ($imagens as $img) {
                $arquivo = basename($img['caminho_imagem']);
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

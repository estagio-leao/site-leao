<?php
// FASE 22 — Leão Service: exclui um Projeto de Portfólio.
// Resgata TODAS as imagens de portfolio_imagens antes do DELETE (a FK
// ON DELETE CASCADE remove as linhas) e faz unlink de todos os arquivos.
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

        // 1) Resgata TODAS as imagens do projeto ANTES de excluir
        $query_imagens = "SELECT caminho_imagem FROM portfolio_imagens WHERE projeto_id = :id";
        $stmt_imagens = $conn->prepare($query_imagens);
        $stmt_imagens->bindParam(":id", $id, PDO::PARAM_INT);
        $stmt_imagens->execute();
        $imagens = $stmt_imagens->fetchAll(PDO::FETCH_ASSOC);

        // 2) Exclui o projeto — FK ON DELETE CASCADE remove as linhas de imagem
        $query = "DELETE FROM portfolio_projetos WHERE id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            // 3) Remove fisicamente TODAS as imagens da pasta uploads (evita órfãos)
            foreach ($imagens as $img) {
                $arquivo = basename($img['caminho_imagem']);
                $caminho = $diretorio_upload . $arquivo;
                if (file_exists($caminho)) @unlink($caminho);
            }

            http_response_code(200);
            echo json_encode(array("mensagem" => "Projeto removido."));
        } else {
            http_response_code(500);
            echo json_encode(array("mensagem" => "Erro ao remover o projeto."));
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

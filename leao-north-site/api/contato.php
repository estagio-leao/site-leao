<?php
// /api/contato.php

// Define que a resposta será em JSON
header("Content-Type: application/json; charset=UTF-8");

// Pega os dados enviados pelo React no formato JSON
$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->name) && !empty($dados->phone) && !empty($dados->message)) {
    
    // ATENÇÃO: Substitua com os dados do seu banco na RedeHost/Umbler
    $host = "localhost"; 
    $db_name = "nome_do_banco";
    $username = "usuario_do_banco";
    $password = "senha_do_banco";
    
    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $query = "INSERT INTO contatos (nome, telefone, email, servico, mensagem) VALUES (:nome, :telefone, :email, :servico, :mensagem)";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":nome", $dados->name);
        $stmt->bindParam(":telefone", $dados->phone);
        $stmt->bindParam(":email", $dados->email);
        $stmt->bindParam(":servico", $dados->service);
        $stmt->bindParam(":mensagem", $dados->message);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("mensagem" => "Contato salvo com sucesso."));
        } else {
            http_response_code(503);
            echo json_encode(array("mensagem" => "Não foi possível salvar o contato."));
        }
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro de conexão: " . $exception->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Dados incompletos."));
}
?>
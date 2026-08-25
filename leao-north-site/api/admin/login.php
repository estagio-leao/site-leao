<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->email) && !empty($dados->password)) {
    $host = "localhost"; 
    $db_name = "leao_north"; // ALTERE AQUI
    $username = "root"; // ALTERE AQUI
    $password_db = ""; // ALTERE AQUI
    
    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $query = "SELECT id, password FROM admin_users WHERE email = :email LIMIT 1";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":email", $dados->email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($dados->password, $row['password'])) {
                http_response_code(200);
                echo json_encode(array("token" => base64_encode($row['id'] . time()), "mensagem" => "Logado com sucesso."));
            } else {
                http_response_code(401);
                echo json_encode(array("mensagem" => "Senha incorreta."));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("mensagem" => "Usuário não encontrado."));
        }
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro: " . $exception->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Dados incompletos."));
}
?>
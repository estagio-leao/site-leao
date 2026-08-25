<?php
// Liberando o CORS para o formulário
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Responde ao preflight do navegador
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

$dados = json_decode(file_get_contents("php://input"));

if (!empty($dados->name) && !empty($dados->phone) && !empty($dados->message)) {
    
    // Credenciais do seu XAMPP local
    $host = "localhost"; 
    $db_name = "leao_north";
    $username = "root";
    $password = ""; // Senha vazia no XAMPP

    // Campos opcionais (não podem quebrar se ausentes)
    $email = isset($dados->email) ? $dados->email : "";
    $servico = isset($dados->service) ? $dados->service : "";

    // Valida tipo_mensagem com whitelist (service | materiais | socio)
    $tipos_validos = array('service', 'materiais', 'socio');
    $tipo_mensagem = isset($dados->tipo_mensagem) ? $dados->tipo_mensagem : 'service';
    if (!in_array($tipo_mensagem, $tipos_validos)) {
        $tipo_mensagem = 'service';
    }
    
    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $query = "INSERT INTO contatos (nome, telefone, email, servico, mensagem, tipo_mensagem)
                  VALUES (:nome, :telefone, :email, :servico, :mensagem, :tipo_mensagem)";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":nome", $dados->name);
        $stmt->bindParam(":telefone", $dados->phone);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":servico", $servico);
        $stmt->bindParam(":mensagem", $dados->message);
        $stmt->bindParam(":tipo_mensagem", $tipo_mensagem);
        
        if ($stmt->execute()) {
            // Disparar e-mail de notificação
            $para = "contato@leaonorth.com.br"; // E-mail que vai RECEBER o aviso
            $assunto = "Novo Pedido de Orçamento - Site Leão North";
            
            $corpo = "Você recebeu um novo contato pelo site:\n\n";
            $corpo .= "Nome: " . $dados->name . "\n";
            $corpo .= "Telefone: " . $dados->phone . "\n";
            $corpo .= "E-mail: " . $email . "\n";
            $corpo .= "Serviço: " . $servico . "\n";
            $corpo .= "Origem: " . $tipo_mensagem . "\n";
            $corpo .= "Mensagem:\n" . $dados->message . "\n";
            
            // O e-mail "From" (De) deve ter o final @leaonorth.com.br para a Umbler não bloquear por spam
            $headers = "From: site@leaonorth.com.br\r\n";
            $headers .= "Reply-To: " . $email . "\r\n";
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
            
            // O "@" oculta erros temporários no XAMPP, já que o localhost não envia e-mail de verdade
            @mail($para, $assunto, $corpo, $headers);

            http_response_code(200);
            echo json_encode(array("mensagem" => "Contato salvo com sucesso e notificação preparada."));
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
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

    // FASE 36 — Carrinho de Orçamentos (Materiais): a mensagem chega como STRING
    // contendo um JSON auto-descritivo ({"tipo":"carrinho","itens":[...]}). Como
    // este endpoint é PÚBLICO, o documento é validado, LIMITADO e reescrito antes
    // de ir para o banco — inclusive o caminho das fotos (só /uploads/).
    $mensagem = $dados->message;
    $eh_carrinho = false;
    if (is_string($mensagem) && strpos(ltrim($mensagem), '{') === 0) {
        $doc = json_decode($mensagem, true);
        if (
            is_array($doc) &&
            isset($doc['tipo']) && $doc['tipo'] === 'carrinho' &&
            isset($doc['itens']) && is_array($doc['itens']) && count($doc['itens']) > 0
        ) {
            $itens_limpos = array();
            foreach (array_slice($doc['itens'], 0, 30) as $item) {   // máx. 30 itens
                $img = isset($item['img']) ? (string) $item['img'] : '';
                // aceita SOMENTE caminhos locais de upload; qualquer outra coisa vira null
                if ($img !== '' && !preg_match('#^/uploads/[A-Za-z0-9._\-/]+$#', $img)) {
                    $img = '';
                }
                $itens_limpos[] = array(
                    'id'    => (int) (isset($item['id']) ? $item['id'] : 0),
                    'nome'  => mb_substr((string) (isset($item['nome']) ? $item['nome'] : ''), 0, 120),
                    'qtd'   => max(1, min(99, (int) (isset($item['qtd']) ? $item['qtd'] : 1))),
                    'img'   => $img !== '' ? $img : null,
                    'espec' => (isset($item['espec']) && $item['espec'] !== '')
                        ? mb_substr((string) $item['espec'], 0, 120)
                        : null,
                );
            }
            if (count($itens_limpos) > 0) {
                $doc['itens'] = $itens_limpos;
                $doc['tipo']   = 'carrinho';
                $doc['versao'] = isset($doc['versao']) ? (int) $doc['versao'] : 1;
                $mensagem = json_encode($doc, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
                $eh_carrinho = true;
            }
        }
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
        $stmt->bindParam(":mensagem", $mensagem);
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
            // FASE 36 — carrinho vira lista legível "10x Nome do Produto" (sem JSON cru)
            if ($eh_carrinho) {
                $corpo .= "Itens do Orçamento (" . count($doc['itens']) . "):\n";
                $indice_item = 1;
                foreach ($doc['itens'] as $item_carrinho) {
                    $corpo .= $indice_item . ". " . $item_carrinho['qtd'] . "x " . $item_carrinho['nome'] . "\n";
                    $indice_item++;
                }
            } else {
                $corpo .= "Mensagem:\n" . $mensagem . "\n";
            }
            
            // O e-mail "From" (De) deve ter o final @leaonorth.com.br para a Umbler não bloquear por spam
            $headers = "From: site@leaonorth.com.br\r\n";
            $headers .= "Reply-To: " . $email . "\r\n";
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
            
            // O "@" oculta erros temporários no XAMPP, já que o localhost não envia e-mail de verdade.
            // FASE 37 — Auditoria de e-mail: captura o retorno do mail() para haver rastreabilidade
            // da falha. O fluxo NÃO muda: se o e-mail falhar, o contato permanece salvo no banco
            // (fonte de verdade, visível em /admin → Mensagens) e o site segue respondendo 200.
            // IMPORTANTE: em localhost (XAMPP) não há SMTP, então $email_enviado tende a ser false;
            // o envio real ocorre na hospedagem publicada, com o domínio leaonorth.com.br.
            $email_enviado = @mail($para, $assunto, $corpo, $headers);
            if (!$email_enviado) {
                error_log("[LeaoNorth] Falha ao enviar e-mail para {$para} | origem: {$tipo_mensagem} | telefone: " . $dados->phone);
            }

            http_response_code(200);
            // FASE 37 — "email_enviado" é uma chave NOVA e ADITIVA (diagnóstico). O campo
            // "mensagem" foi preservado e os frontends atuais continuam funcionando sem alteração.
            echo json_encode(array(
                "mensagem" => "Contato salvo com sucesso e notificação preparada.",
                "email_enviado" => $email_enviado
            ));
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
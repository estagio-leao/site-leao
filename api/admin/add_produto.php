<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Responde ao preflight do navegador e encerra
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// ---- Validação de campos obrigatórios ----
if (!isset($_POST['nome']) || !isset($_FILES['imagens'])) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Dados incompletos."));
    exit();
}

// ---- Validação da quantidade de imagens (1 a 8) ----
$qtd = count($_FILES['imagens']['name']);
if ($qtd < 1 || $qtd > 8) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Envie entre 1 e 8 imagens."));
    exit();
}

// ---- Validação do índice da capa ----
$capa_index = isset($_POST['capa_index']) ? (int)$_POST['capa_index'] : 0;
if ($capa_index < 0 || $capa_index >= $qtd) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Índice da capa inválido."));
    exit();
}

// ---- Validação das informações adicionais (string JSON) ----
$informacoes = isset($_POST['informacoes']) ? json_decode($_POST['informacoes'], true) : array();
if ($informacoes === null) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Informações adicionais inválidas."));
    exit();
}

// ---- Validação rigorosa de cada imagem (MIME real via finfo + limite 5MB) ----
$tipos_permitidos = array("image/jpeg", "image/png", "image/webp", "image/avif");
$tamanho_maximo = 5 * 1024 * 1024; // 5MB

for ($i = 0; $i < $qtd; $i++) {
    // 1) Erro de upload
    if ($_FILES['imagens']['error'][$i] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(array("mensagem" => "Falha no envio da imagem " . ($i + 1) . "."));
        exit();
    }

    // 2) Tamanho máximo
    if ($_FILES['imagens']['size'][$i] > $tamanho_maximo) {
        http_response_code(400);
        echo json_encode(array("mensagem" => "Imagem muito grande. O limite é de 5MB por imagem."));
        exit();
    }

    // 3) MIME type real do arquivo
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $tipo_real = finfo_file($finfo, $_FILES['imagens']['tmp_name'][$i]);
    finfo_close($finfo);

    if (!in_array($tipo_real, $tipos_permitidos)) {
        http_response_code(400);
        echo json_encode(array("mensagem" => "Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou AVIF."));
        exit();
    }
}

$host = "localhost";
$db_name = "leao_north";
$username = "root";
$password_db = "";

$diretorio_upload = "../../uploads/";
if (!is_dir($diretorio_upload)) mkdir($diretorio_upload, 0755, true);

$imagens_salvas = array();

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conn->beginTransaction();

    // 1) Insere o produto (a coluna imagem não existe mais — imagens vão para produto_imagens)
    //    Campo grupo (Fase 11): opcional; grava NULL se vier vazio
    $grupo = isset($_POST['grupo']) ? trim($_POST['grupo']) : "";
    if ($grupo === "") $grupo = null;

    $query = "INSERT INTO produtos (nome, grupo, especificacao, categoria, descricao)
              VALUES (:nome, :grupo, :especificacao, :categoria, :descricao)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":nome", $_POST['nome']);
    $stmt->bindParam(":grupo", $grupo);
    $stmt->bindParam(":especificacao", $_POST['especificacao']);
    $stmt->bindParam(":categoria", $_POST['categoria']);
    $descricao = isset($_POST['descricao']) ? $_POST['descricao'] : "";
    $stmt->bindParam(":descricao", $descricao);
    $stmt->execute();
    $produto_id = $conn->lastInsertId();

    // 2) Salva cada imagem em disco e insere em produto_imagens
    for ($i = 0; $i < $qtd; $i++) {
        $nome_arquivo = time() . "_" . basename($_FILES['imagens']['name'][$i]);
        $caminho_final = $diretorio_upload . $nome_arquivo;
        $url_imagem = "/uploads/" . $nome_arquivo;

        if (!move_uploaded_file($_FILES['imagens']['tmp_name'][$i], $caminho_final)) {
            throw new Exception("Erro ao mover a imagem.");
        }
        $imagens_salvas[] = $caminho_final;

        $is_capa = ($i === $capa_index) ? 1 : 0;
        $stmt = $conn->prepare(
            "INSERT INTO produto_imagens (produto_id, caminho_imagem, is_capa, ordem)
             VALUES (:pid, :caminho, :is_capa, :ordem)"
        );
        $stmt->bindParam(":pid", $produto_id);
        $stmt->bindParam(":caminho", $url_imagem);
        $stmt->bindParam(":is_capa", $is_capa);
        $stmt->bindParam(":ordem", $i);
        $stmt->execute();
    }

    // 3) Insere as informações adicionais (pares título/texto)
    $stmt = $conn->prepare(
        "INSERT INTO produto_informacoes (produto_id, titulo, texto) VALUES (:pid, :titulo, :texto)"
    );
    foreach ($informacoes as $info) {
        $titulo = isset($info['titulo']) ? $info['titulo'] : "";
        $texto = isset($info['texto']) ? $info['texto'] : "";
        if ($titulo === "" || $texto === "") continue;
        $stmt->bindParam(":pid", $produto_id);
        $stmt->bindParam(":titulo", $titulo);
        $stmt->bindParam(":texto", $texto);
        $stmt->execute();
    }

    $conn->commit();
    http_response_code(200);
    echo json_encode(array("mensagem" => "Produto salvo com sucesso."));
} catch (Exception $exception) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    // Remove as imagens já salvas em disco para não deixar órfãs
    foreach ($imagens_salvas as $caminho) {
        if (file_exists($caminho)) @unlink($caminho);
    }
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro ao salvar o produto."));
}
?>

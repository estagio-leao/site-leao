<?php
// FASE 22 — Leão Service: cria um Projeto de Portfólio (portfolio_projetos +
// portfolio_imagens) com upload MÚLTIPLO de imagens e flag is_capa.
// Campos: titulo (obrig.), subtitulo, descricao, servico_categoria_id
//         (opcional/NULL — FK SET NULL) + $_FILES['imagens'] (1..8) + capa_index.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// ---- Validação do título ----
if (!isset($_POST['titulo']) || trim($_POST['titulo']) === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Título do projeto é obrigatório."));
    exit();
}
$titulo = trim($_POST['titulo']);
$subtitulo = (isset($_POST['subtitulo']) && trim($_POST['subtitulo']) !== '') ? $_POST['subtitulo'] : null;
$descricao = (isset($_POST['descricao']) && trim($_POST['descricao']) !== '') ? $_POST['descricao'] : null;

// ---- Categoria opcional (vazio/válido → NULL) ----
$servico_categoria_id = (isset($_POST['servico_categoria_id']) && $_POST['servico_categoria_id'] !== '')
    ? (int)$_POST['servico_categoria_id']
    : null;
if ($servico_categoria_id !== null && $servico_categoria_id <= 0) {
    $servico_categoria_id = null;
}

// ---- Validação da quantidade de imagens (1 a 8) ----
if (!isset($_FILES['imagens'])) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Envie pelo menos 1 imagem."));
    exit();
}
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

// ---- Validação rigorosa de cada imagem (MIME real via finfo + limite 5MB) ----
$tipos_permitidos = array("image/jpeg", "image/png", "image/webp", "image/avif");
$tamanho_maximo = 5 * 1024 * 1024; // 5MB

for ($i = 0; $i < $qtd; $i++) {
    if ($_FILES['imagens']['error'][$i] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(array("mensagem" => "Falha no envio da imagem " . ($i + 1) . "."));
        exit();
    }
    if ($_FILES['imagens']['size'][$i] > $tamanho_maximo) {
        http_response_code(400);
        echo json_encode(array("mensagem" => "Imagem muito grande. O limite é de 5MB por imagem."));
        exit();
    }
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

$diretorio_upload = "../../../uploads/";
if (!is_dir($diretorio_upload)) mkdir($diretorio_upload, 0755, true);

$imagens_salvas = array();

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conn->beginTransaction();

    // 1) Insere o projeto
    $query = "INSERT INTO portfolio_projetos (servico_categoria_id, titulo, subtitulo, descricao)
              VALUES (:servico_categoria_id, :titulo, :subtitulo, :descricao)";
    $stmt = $conn->prepare($query);
    if ($servico_categoria_id === null) {
        $stmt->bindValue(":servico_categoria_id", null, PDO::PARAM_NULL);
    } else {
        $stmt->bindValue(":servico_categoria_id", $servico_categoria_id, PDO::PARAM_INT);
    }
    $stmt->bindParam(":titulo", $titulo);
    if ($subtitulo === null) { $stmt->bindValue(":subtitulo", null, PDO::PARAM_NULL); }
    else { $stmt->bindParam(":subtitulo", $subtitulo); }
    if ($descricao === null) { $stmt->bindValue(":descricao", null, PDO::PARAM_NULL); }
    else { $stmt->bindParam(":descricao", $descricao); }
    $stmt->execute();
    $projeto_id = $conn->lastInsertId();

    // 2) Salva cada imagem em disco e insere em portfolio_imagens (ordem = id)
    for ($i = 0; $i < $qtd; $i++) {
        $nome_arquivo = time() . "_" . basename($_FILES['imagens']['name'][$i]);
        $caminho_final = $diretorio_upload . $nome_arquivo;
        $url_imagem = "/uploads/" . $nome_arquivo;

        if (!move_uploaded_file($_FILES['imagens']['tmp_name'][$i], $caminho_final)) {
            throw new Exception("Erro ao mover a imagem.");
        }
        $imagens_salvas[] = $caminho_final;

        $is_capa = ($i === $capa_index) ? 1 : 0;
        $ins = $conn->prepare(
            "INSERT INTO portfolio_imagens (projeto_id, caminho_imagem, is_capa)
             VALUES (:pid, :caminho, :is_capa)"
        );
        $ins->bindParam(":pid", $projeto_id, PDO::PARAM_INT);
        $ins->bindParam(":caminho", $url_imagem);
        $ins->bindParam(":is_capa", $is_capa, PDO::PARAM_INT);
        $ins->execute();
    }

    $conn->commit();
    http_response_code(200);
    echo json_encode(array("mensagem" => "Projeto salvo com sucesso.", "id" => $projeto_id));
} catch (Exception $exception) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    // Remove as imagens já salvas em disco para não deixar órfãs
    foreach ($imagens_salvas as $caminho) {
        if (file_exists($caminho)) @unlink($caminho);
    }
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro ao salvar o projeto."));
}
?>

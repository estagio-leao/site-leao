<?php
// FASE 29 — exige Bearer Token válido (auth.php): responde OPTIONS e devolve 401 se inválido.
require_once __DIR__ . '/auth.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Responde ao preflight do navegador e encerra
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// ---- Validação do nome ----
if (!isset($_POST['nome']) || trim($_POST['nome']) === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Nome do grupo é obrigatório."));
    exit();
}
$nome = trim($_POST['nome']);

// ---- Validação da categoria ----
$categoria_id = isset($_POST['categoria_id']) ? (int)$_POST['categoria_id'] : 0;
if ($categoria_id <= 0) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Categoria inválida."));
    exit();
}

// ---- Validação do arquivo ÚNICO da capa (obrigatório; MIME real + 5MB) ----
$tipos_permitidos = array("image/jpeg", "image/png", "image/webp", "image/avif");
$tamanho_maximo = 5 * 1024 * 1024; // 5MB

if (!isset($_FILES['capa']) || $_FILES['capa']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "A capa do grupo é obrigatória."));
    exit();
}
if ($_FILES['capa']['size'] > $tamanho_maximo) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Imagem muito grande. O limite é de 5MB."));
    exit();
}
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$tipo_real = finfo_file($finfo, $_FILES['capa']['tmp_name']);
finfo_close($finfo);
if (!in_array($tipo_real, $tipos_permitidos)) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou AVIF."));
    exit();
}

$host = "localhost";
$db_name = "leao_north";
$username = "root";
$password_db = "";

$diretorio_upload = "../../uploads/";
if (!is_dir($diretorio_upload)) mkdir($diretorio_upload, 0755, true);

$capa_salva = null;

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conn->beginTransaction();

    // Salva a capa (arquivo único) em disco
    $nome_arquivo = time() . "_" . basename($_FILES['capa']['name']);
    $caminho_final = $diretorio_upload . $nome_arquivo;
    $url_capa = "/uploads/" . $nome_arquivo;

    if (!move_uploaded_file($_FILES['capa']['tmp_name'], $caminho_final)) {
        throw new Exception("Erro ao mover a imagem.");
    }
    $capa_salva = $caminho_final;

    $stmt = $conn->prepare(
        "INSERT INTO grupos (nome, categoria_id, caminho_imagem_capa)
         VALUES (:nome, :categoria_id, :capa)"
    );
    $stmt->bindParam(":nome", $nome);
    $stmt->bindParam(":categoria_id", $categoria_id, PDO::PARAM_INT);
    $stmt->bindParam(":capa", $url_capa);
    $stmt->execute();
    $grupo_id = $conn->lastInsertId();

    $conn->commit();
    http_response_code(200);
    echo json_encode(array("mensagem" => "Grupo criado com sucesso.", "id" => $grupo_id));
} catch (Exception $exception) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    // Remove a capa já salva em disco para não deixar órfã
    if ($capa_salva !== null && file_exists($capa_salva)) @unlink($capa_salva);

    // SQLSTATE 23000 = duplicidade (UNIQUE categoria_id + nome)
    $code = ($exception instanceof PDOException) ? $exception->getCode() : 0;
    if ($code == 23000) {
        http_response_code(409);
        echo json_encode(array("mensagem" => "Já existe um grupo com esse nome nesta categoria."));
    } else {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro ao criar o grupo."));
    }
}
?>

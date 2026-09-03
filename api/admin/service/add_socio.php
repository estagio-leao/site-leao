<?php
// FASE 29 — exige Bearer Token válido (auth.php): responde OPTIONS e devolve 401 se inválido.
require_once __DIR__ . '/../auth.php';
// FASE 22 — Leão Service: cria um Sócio (socios) com foto ÚNICA opcional
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// ---- Validação do nome ----
if (!isset($_POST['nome']) || trim($_POST['nome']) === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Nome do sócio é obrigatório."));
    exit();
}
$nome = trim($_POST['nome']);

// ---- Campos opcionais ----
$subtitulo = (isset($_POST['subtitulo']) && trim($_POST['subtitulo']) !== '') ? $_POST['subtitulo'] : null;
$descricao = (isset($_POST['descricao']) && trim($_POST['descricao']) !== '') ? $_POST['descricao'] : null;
// Fase 27 — WhatsApp do sócio (opcional; normaliza para apenas dígitos p/ wa.me)
$whatsapp = (isset($_POST['whatsapp']) && trim($_POST['whatsapp']) !== '')
  ? preg_replace('/\D/', '', $_POST['whatsapp'])
  : null;

// ---- Foto ÚNICA (opcional; MIME real via finfo + 5MB) ----
$tipos_permitidos = array("image/jpeg", "image/png", "image/webp", "image/avif");
$tamanho_maximo = 5 * 1024 * 1024; // 5MB

$tem_foto = isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK;
if ($tem_foto) {
    if ($_FILES['foto']['size'] > $tamanho_maximo) {
        http_response_code(400);
        echo json_encode(array("mensagem" => "Imagem muito grande. O limite é de 5MB."));
        exit();
    }
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $tipo_real = finfo_file($finfo, $_FILES['foto']['tmp_name']);
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

$foto_salva = null;

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conn->beginTransaction();

    // Foto opcional: salva o arquivo e define caminho_foto
    $caminho_foto = null;
    if ($tem_foto) {
        $nome_arquivo = time() . "_" . basename($_FILES['foto']['name']);
        $caminho_final = $diretorio_upload . $nome_arquivo;
        $caminho_foto = "/uploads/" . $nome_arquivo;

        if (!move_uploaded_file($_FILES['foto']['tmp_name'], $caminho_final)) {
            throw new Exception("Erro ao mover a foto.");
        }
        $foto_salva = $caminho_final;
    }

    $stmt = $conn->prepare(
        "INSERT INTO socios (nome, subtitulo, descricao, whatsapp, caminho_foto)
         VALUES (:nome, :subtitulo, :descricao, :whatsapp, :foto)"
    );
    $stmt->bindParam(":nome", $nome);
    if ($subtitulo === null) { $stmt->bindValue(":subtitulo", null, PDO::PARAM_NULL); }
    else { $stmt->bindParam(":subtitulo", $subtitulo); }
    if ($descricao === null) { $stmt->bindValue(":descricao", null, PDO::PARAM_NULL); }
    else { $stmt->bindParam(":descricao", $descricao); }
    if ($whatsapp === null) { $stmt->bindValue(":whatsapp", null, PDO::PARAM_NULL); }
    else { $stmt->bindParam(":whatsapp", $whatsapp); }
    if ($caminho_foto === null) { $stmt->bindValue(":foto", null, PDO::PARAM_NULL); }
    else { $stmt->bindParam(":foto", $caminho_foto); }
    $stmt->execute();
    $socio_id = $conn->lastInsertId();

    $conn->commit();
    http_response_code(200);
    echo json_encode(array("mensagem" => "Sócio criado com sucesso.", "id" => $socio_id));
} catch (Exception $exception) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    // Remove a foto já salva em disco para não deixar órfã
    if ($foto_salva !== null && file_exists($foto_salva)) @unlink($foto_salva);

    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro ao criar o sócio."));
}
?>

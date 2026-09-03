<?php
// FASE 22 — Leão Service: edita um Sócio (socios)
// Suporta nova foto (substitui a antiga) ou remoção da foto (remover_foto=1).
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// ---- Validação do ID e do nome ----
if (!isset($_POST['id']) || $_POST['id'] === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "ID não informado."));
    exit();
}
if (!isset($_POST['nome']) || trim($_POST['nome']) === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Nome do sócio é obrigatório."));
    exit();
}
$id = (int)$_POST['id'];
$nome = trim($_POST['nome']);

$subtitulo = (isset($_POST['subtitulo']) && trim($_POST['subtitulo']) !== '') ? $_POST['subtitulo'] : null;
$descricao = (isset($_POST['descricao']) && trim($_POST['descricao']) !== '') ? $_POST['descricao'] : null;
// Fase 27 — WhatsApp do sócio (opcional; normaliza para apenas dígitos p/ wa.me)
$whatsapp = (isset($_POST['whatsapp']) && trim($_POST['whatsapp']) !== '')
  ? preg_replace('/\D/', '', $_POST['whatsapp'])
  : null;

// ---- Nova foto ou remoção da foto ----
$remover_foto = isset($_POST['remover_foto']) && $_POST['remover_foto'] === '1';

$tipos_permitidos = array("image/jpeg", "image/png", "image/webp", "image/avif");
$tamanho_maximo = 5 * 1024 * 1024; // 5MB

$tem_nova_foto = isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK;
if ($tem_nova_foto) {
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

$foto_antiga_para_remover = null;
$foto_nova_salva = null;

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conn->beginTransaction();

    // 1) Carrega o sócio atual (para conhecer a foto antiga)
    $q = $conn->prepare("SELECT caminho_foto FROM socios WHERE id = :id");
    $q->bindParam(":id", $id, PDO::PARAM_INT);
    $q->execute();
    $socio_atual = $q->fetch(PDO::FETCH_ASSOC);

    if (!$socio_atual) {
        http_response_code(404);
        echo json_encode(array("mensagem" => "Sócio não encontrado."));
        exit();
    }

    // 2) UPDATE dos dados básicos
    $stmt = $conn->prepare("UPDATE socios SET nome = :nome, subtitulo = :subtitulo, descricao = :descricao, whatsapp = :whatsapp WHERE id = :id");
    $stmt->bindParam(":nome", $nome);
    if ($subtitulo === null) { $stmt->bindValue(":subtitulo", null, PDO::PARAM_NULL); }
    else { $stmt->bindParam(":subtitulo", $subtitulo); }
    if ($descricao === null) { $stmt->bindValue(":descricao", null, PDO::PARAM_NULL); }
    else { $stmt->bindParam(":descricao", $descricao); }
    if ($whatsapp === null) { $stmt->bindValue(":whatsapp", null, PDO::PARAM_NULL); }
    else { $stmt->bindParam(":whatsapp", $whatsapp); }
    $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    // 3) Nova foto enviada → substitui a antiga
    if ($tem_nova_foto) {
        $nome_arquivo = time() . "_" . basename($_FILES['foto']['name']);
        $caminho_final = $diretorio_upload . $nome_arquivo;
        $url_foto = "/uploads/" . $nome_arquivo;

        if (!move_uploaded_file($_FILES['foto']['tmp_name'], $caminho_final)) {
            throw new Exception("Erro ao mover a nova foto.");
        }
        $foto_nova_salva = $caminho_final;

        $upd = $conn->prepare("UPDATE socios SET caminho_foto = :foto WHERE id = :id");
        $upd->bindParam(":foto", $url_foto);
        $upd->bindParam(":id", $id, PDO::PARAM_INT);
        $upd->execute();

        if ($socio_atual['caminho_foto']) {
            $foto_antiga_para_remover = $diretorio_upload . basename($socio_atual['caminho_foto']);
        }
    }

    // 4) Remover a foto (sem enviar nova)
    if ($remover_foto && !$tem_nova_foto && $socio_atual['caminho_foto']) {
        $upd = $conn->prepare("UPDATE socios SET caminho_foto = NULL WHERE id = :id");
        $upd->bindParam(":id", $id, PDO::PARAM_INT);
        $upd->execute();
        $foto_antiga_para_remover = $diretorio_upload . basename($socio_atual['caminho_foto']);
    }

    $conn->commit();

    // Remove a foto antiga do disco somente após commit (consistência em rollback)
    if ($foto_antiga_para_remover !== null && file_exists($foto_antiga_para_remover)) @unlink($foto_antiga_para_remover);

    http_response_code(200);
    echo json_encode(array("mensagem" => "Sócio atualizado com sucesso."));
} catch (Exception $exception) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    // Remove a nova foto já salva para não deixar órfã
    if ($foto_nova_salva !== null && file_exists($foto_nova_salva)) @unlink($foto_nova_salva);

    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro ao atualizar o sócio."));
}
?>

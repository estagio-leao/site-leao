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

// ---- Validação do ID e do nome ----
if (!isset($_POST['id']) || $_POST['id'] === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "ID não informado."));
    exit();
}
if (!isset($_POST['nome']) || trim($_POST['nome']) === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Nome do grupo é obrigatório."));
    exit();
}
$id = (int)$_POST['id'];
$nome = trim($_POST['nome']);

// ---- Validação da categoria ----
$categoria_id = isset($_POST['categoria_id']) ? (int)$_POST['categoria_id'] : 0;
if ($categoria_id <= 0) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Categoria inválida."));
    exit();
}

// ---- Capa: nova (upload) ou remover (remover_capa=1) ----
$remover_capa = isset($_POST['remover_capa']) && $_POST['remover_capa'] === '1';

$tipos_permitidos = array("image/jpeg", "image/png", "image/webp", "image/avif");
$tamanho_maximo = 5 * 1024 * 1024; // 5MB

$tem_nova_capa = isset($_FILES['capa']) && $_FILES['capa']['error'] === UPLOAD_ERR_OK;
if ($tem_nova_capa) {
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
}

$host = "localhost";
$db_name = "leao_north";
$username = "root";
$password_db = "";

$diretorio_upload = "../../uploads/";
if (!is_dir($diretorio_upload)) mkdir($diretorio_upload, 0755, true);

$capa_antiga_para_remover = null;
$capa_nova_salva = null;

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conn->beginTransaction();

    // 1) Carrega o grupo atual (para conhecer a capa antiga)
    $q = $conn->prepare("SELECT caminho_imagem_capa FROM grupos WHERE id = :id");
    $q->bindParam(":id", $id, PDO::PARAM_INT);
    $q->execute();
    $grupo_atual = $q->fetch(PDO::FETCH_ASSOC);

    if (!$grupo_atual) {
        http_response_code(404);
        echo json_encode(array("mensagem" => "Grupo não encontrado."));
        exit();
    }

    // 2) UPDATE dos dados básicos (nome + categoria)
    $stmt = $conn->prepare("UPDATE grupos SET nome = :nome, categoria_id = :categoria_id WHERE id = :id");
    $stmt->bindParam(":nome", $nome);
    $stmt->bindParam(":categoria_id", $categoria_id, PDO::PARAM_INT);
    $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    // 3) Nova capa enviada → substitui a antiga
    if ($tem_nova_capa) {
        $nome_arquivo = time() . "_" . basename($_FILES['capa']['name']);
        $caminho_final = $diretorio_upload . $nome_arquivo;
        $url_capa = "/uploads/" . $nome_arquivo;

        if (!move_uploaded_file($_FILES['capa']['tmp_name'], $caminho_final)) {
            throw new Exception("Erro ao mover a nova capa.");
        }
        $capa_nova_salva = $caminho_final;

        $upd = $conn->prepare("UPDATE grupos SET caminho_imagem_capa = :capa WHERE id = :id");
        $upd->bindParam(":capa", $url_capa);
        $upd->bindParam(":id", $id, PDO::PARAM_INT);
        $upd->execute();

        if ($grupo_atual['caminho_imagem_capa']) {
            $capa_antiga_para_remover = $diretorio_upload . basename($grupo_atual['caminho_imagem_capa']);
        }
    }

    // 4) Remover a capa (sem enviar nova)
    if ($remover_capa && !$tem_nova_capa && $grupo_atual['caminho_imagem_capa']) {
        $upd = $conn->prepare("UPDATE grupos SET caminho_imagem_capa = NULL WHERE id = :id");
        $upd->bindParam(":id", $id, PDO::PARAM_INT);
        $upd->execute();
        $capa_antiga_para_remover = $diretorio_upload . basename($grupo_atual['caminho_imagem_capa']);
    }

    $conn->commit();

    // Remove a capa antiga do disco somente após commit (mantém consistência em rollback)
    if ($capa_antiga_para_remover !== null && file_exists($capa_antiga_para_remover)) @unlink($capa_antiga_para_remover);

    http_response_code(200);
    echo json_encode(array("mensagem" => "Grupo atualizado com sucesso."));
} catch (Exception $exception) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    // Remove a nova capa já salva para não deixar órfã
    if ($capa_nova_salva !== null && file_exists($capa_nova_salva)) @unlink($capa_nova_salva);

    $code = ($exception instanceof PDOException) ? $exception->getCode() : 0;
    if ($code == 23000) {
        http_response_code(409);
        echo json_encode(array("mensagem" => "Já existe um grupo com esse nome nesta categoria."));
    } else {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro ao atualizar o grupo."));
    }
}
?>

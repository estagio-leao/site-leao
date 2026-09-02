<?php
// FASE 22 — Leão Service: edita um Projeto de Portfólio.
// - Dados: titulo, subtitulo, descricao, servico_categoria_id.
// - Imagens: imagens_mantidas (JSON array de caminhos, na ordem exibida) +
//            novas_imagens ($_FILES) + capa_index sobre a LISTA COMBINADA.
// - As removidas são apagadas (banco + unlink); a capa é recalcula pela lista
//   combinada. Modelo sem coluna de ordem: galeria pública ordena por id
//   (is_capa primeiro) — ordem de exibição = ordem de criação.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// ---- Validação do ID e do título ----
if (!isset($_POST['id']) || $_POST['id'] === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "ID não informado."));
    exit();
}
$id = (int)$_POST['id'];

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

// ---- Lista de imagens antigas mantidas (string JSON de caminhos, em ordem) ----
$imagens_mantidas = isset($_POST['imagens_mantidas']) ? json_decode($_POST['imagens_mantidas'], true) : array();
if (!is_array($imagens_mantidas)) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Lista de imagens mantidas inválida."));
    exit();
}

// ---- Novas imagens (opcional) ----
$novas_qtd = isset($_FILES['novas_imagens']) ? count($_FILES['novas_imagens']['name']) : 0;

// ---- Total combinado + índice da capa ----
$total_final = count($imagens_mantidas) + $novas_qtd;
if ($total_final < 1 || $total_final > 8) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "O projeto deve ter entre 1 e 8 imagens."));
    exit();
}
$capa_index = isset($_POST['capa_index']) ? (int)$_POST['capa_index'] : 0;
if ($capa_index < 0 || $capa_index >= $total_final) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Índice da capa inválido."));
    exit();
}

// ---- Validação rigorosa de cada nova imagem (MIME real via finfo + 5MB) ----
$tipos_permitidos = array("image/jpeg", "image/png", "image/webp", "image/avif");
$tamanho_maximo = 5 * 1024 * 1024; // 5MB

for ($i = 0; $i < $novas_qtd; $i++) {
    if ($_FILES['novas_imagens']['error'][$i] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(array("mensagem" => "Falha no envio da imagem " . ($i + 1) . "."));
        exit();
    }
    if ($_FILES['novas_imagens']['size'][$i] > $tamanho_maximo) {
        http_response_code(400);
        echo json_encode(array("mensagem" => "Imagem muito grande. O limite é de 5MB por imagem."));
        exit();
    }
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $tipo_real = finfo_file($finfo, $_FILES['novas_imagens']['tmp_name'][$i]);
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

$novas_salvas = array();

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conn->beginTransaction();

    // 1) Verifica se o projeto existe
    $chk = $conn->prepare("SELECT id FROM portfolio_projetos WHERE id = :id");
    $chk->bindParam(":id", $id, PDO::PARAM_INT);
    $chk->execute();
    if (!$chk->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(array("mensagem" => "Projeto não encontrado."));
        exit();
    }

    // 2) UPDATE dos dados básicos
    $stmt = $conn->prepare(
        "UPDATE portfolio_projetos
         SET servico_categoria_id = :servico_categoria_id, titulo = :titulo,
             subtitulo = :subtitulo, descricao = :descricao
         WHERE id = :id"
    );
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
    $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    // 3) Carrega as imagens ATUAIS do projeto
    $q = $conn->prepare("SELECT id, caminho_imagem FROM portfolio_imagens WHERE projeto_id = :id");
    $q->bindParam(":id", $id, PDO::PARAM_INT);
    $q->execute();
    $atuais = $q->fetchAll(PDO::FETCH_ASSOC);

    // 4) Remove (banco + disco) as imagens atuais que NÃO estão na lista mantida
    foreach ($atuais as $img) {
        if (!in_array($img['caminho_imagem'], $imagens_mantidas)) {
            $del = $conn->prepare("DELETE FROM portfolio_imagens WHERE id = :iid");
            $del->bindParam(":iid", $img['id'], PDO::PARAM_INT);
            $del->execute();

            $caminho = $diretorio_upload . basename($img['caminho_imagem']);
            if (file_exists($caminho)) @unlink($caminho);
        }
    }

    // 5) Recalcula a capa nas imagens MANTIDAS (posição na lista combinada)
    $upd_mant = $conn->prepare("UPDATE portfolio_imagens SET is_capa = :is_capa WHERE id = :iid");
    foreach ($imagens_mantidas as $j => $caminho) {
        $loc = $conn->prepare("SELECT id FROM portfolio_imagens WHERE projeto_id = :id AND caminho_imagem = :caminho LIMIT 1");
        $loc->bindParam(":id", $id, PDO::PARAM_INT);
        $loc->bindParam(":caminho", $caminho);
        $loc->execute();
        $row = $loc->fetch(PDO::FETCH_ASSOC);
        if (!$row) continue; // ignora mantida órfã com segurança

        $is_capa = ($j === $capa_index) ? 1 : 0;
        $upd_mant->bindParam(":is_capa", $is_capa, PDO::PARAM_INT);
        $upd_mant->bindParam(":iid", $row['id'], PDO::PARAM_INT);
        $upd_mant->execute();
    }

    // 6) Upload das novas imagens e INSERT (após as mantidas, na lista combinada)
    for ($k = 0; $k < $novas_qtd; $k++) {
        $indice_final = count($imagens_mantidas) + $k;
        $nome_arquivo = time() . "_" . basename($_FILES['novas_imagens']['name'][$k]);
        $caminho_final = $diretorio_upload . $nome_arquivo;
        $url_imagem = "/uploads/" . $nome_arquivo;

        if (!move_uploaded_file($_FILES['novas_imagens']['tmp_name'][$k], $caminho_final)) {
            throw new Exception("Erro ao mover a nova imagem.");
        }
        $novas_salvas[] = $caminho_final;

        $is_capa = ($indice_final === $capa_index) ? 1 : 0;
        $ins = $conn->prepare(
            "INSERT INTO portfolio_imagens (projeto_id, caminho_imagem, is_capa)
             VALUES (:pid, :caminho, :is_capa)"
        );
        $ins->bindParam(":pid", $id, PDO::PARAM_INT);
        $ins->bindParam(":caminho", $url_imagem);
        $ins->bindParam(":is_capa", $is_capa, PDO::PARAM_INT);
        $ins->execute();
    }

    $conn->commit();
    http_response_code(200);
    echo json_encode(array("mensagem" => "Projeto atualizado com sucesso."));
} catch (Exception $exception) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    // Remove as novas imagens já salvas em disco para não deixar órfãs
    foreach ($novas_salvas as $caminho) {
        if (file_exists($caminho)) @unlink($caminho);
    }
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro ao atualizar o projeto."));
}
?>

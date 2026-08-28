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

// ---- Validação do ID ----
if (!isset($_POST['id']) || $_POST['id'] === '') {
    http_response_code(400);
    echo json_encode(array("mensagem" => "ID não informado."));
    exit();
}
$id = (int)$_POST['id'];

// ---- Lista de imagens antigas mantidas (string JSON de caminhos, em ordem) ----
$imagens_mantidas = isset($_POST['imagens_mantidas']) ? json_decode($_POST['imagens_mantidas'], true) : array();
if (!is_array($imagens_mantidas)) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Lista de imagens mantidas inválida."));
    exit();
}

// ---- Informações adicionais (string JSON) ----
$informacoes = isset($_POST['informacoes']) ? json_decode($_POST['informacoes'], true) : array();
if (!is_array($informacoes)) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Informações inválidas."));
    exit();
}

// ---- Índice da capa na LISTA COMBINADA (mantidas + novas) ----
$capa_index = isset($_POST['capa_index']) ? (int)$_POST['capa_index'] : 0;

// ---- Novas imagens (opcional) ----
$novas_qtd = isset($_FILES['novas_imagens']) ? count($_FILES['novas_imagens']['name']) : 0;

$total_final = count($imagens_mantidas) + $novas_qtd;
if ($total_final < 1 || $total_final > 8) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "O produto deve ter entre 1 e 8 imagens."));
    exit();
}
if ($capa_index < 0 || $capa_index >= $total_final) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Índice da capa inválido."));
    exit();
}

// ---- Validação rigorosa de cada nova imagem (MIME real via finfo + limite 5MB) ----
$tipos_permitidos = array("image/jpeg", "image/png", "image/webp", "image/avif");
$tamanho_maximo = 5 * 1024 * 1024; // 5MB

for ($i = 0; $i < $novas_qtd; $i++) {
    // 1) Erro de upload
    if ($_FILES['novas_imagens']['error'][$i] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(array("mensagem" => "Falha no envio da imagem " . ($i + 1) . "."));
        exit();
    }

    // 2) Tamanho máximo
    if ($_FILES['novas_imagens']['size'][$i] > $tamanho_maximo) {
        http_response_code(400);
        echo json_encode(array("mensagem" => "Imagem muito grande. O limite é de 5MB por imagem."));
        exit();
    }

    // 3) MIME type real do arquivo
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

$diretorio_upload = "../../uploads/";
if (!is_dir($diretorio_upload)) mkdir($diretorio_upload, 0755, true);

$novas_salvas = array();

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conn->beginTransaction();

    // 1) UPDATE dos dados básicos do produto — modelo relacional (Fase 15): IDs
    $categoria_id = isset($_POST['categoria_id']) ? (int)$_POST['categoria_id'] : 0;
    if ($categoria_id <= 0) {
        http_response_code(400);
        echo json_encode(array("mensagem" => "Categoria inválida."));
        exit();
    }
    $grupo_id = (isset($_POST['grupo_id']) && $_POST['grupo_id'] !== '')
        ? (int)$_POST['grupo_id']
        : null;

    $stmt = $conn->prepare(
        "UPDATE produtos SET nome=:nome, categoria_id=:categoria_id, grupo_id=:grupo_id, especificacao=:especificacao, descricao=:descricao WHERE id=:id"
    );
    $stmt->bindParam(":nome", $_POST['nome']);
    $stmt->bindParam(":categoria_id", $categoria_id, PDO::PARAM_INT);
    if ($grupo_id === null) {
        $stmt->bindValue(":grupo_id", null, PDO::PARAM_NULL);
    } else {
        $stmt->bindValue(":grupo_id", $grupo_id, PDO::PARAM_INT);
    }
    $stmt->bindParam(":especificacao", $_POST['especificacao']);
    $descricao = isset($_POST['descricao']) ? $_POST['descricao'] : "";
    $stmt->bindParam(":descricao", $descricao);
    $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    $stmt->execute();

    // 2) Carrega as imagens ATUAIS do produto
    $q = $conn->prepare("SELECT id, caminho_imagem FROM produto_imagens WHERE produto_id = :id");
    $q->bindParam(":id", $id, PDO::PARAM_INT);
    $q->execute();
    $atuais = $q->fetchAll(PDO::FETCH_ASSOC);

    // 3) Remove (banco + disco) as imagens atuais que NÃO estão na lista de mantidas
    foreach ($atuais as $img) {
        if (!in_array($img['caminho_imagem'], $imagens_mantidas)) {
            $del = $conn->prepare("DELETE FROM produto_imagens WHERE id = :iid");
            $del->bindParam(":iid", $img['id'], PDO::PARAM_INT);
            $del->execute();

            $caminho = $diretorio_upload . basename($img['caminho_imagem']);
            if (file_exists($caminho)) @unlink($caminho);
        }
    }

    // 4) Atualiza ordem e capa das imagens mantidas
    $upd_mant = $conn->prepare("UPDATE produto_imagens SET ordem = :ordem, is_capa = :is_capa WHERE id = :iid");
    foreach ($imagens_mantidas as $j => $caminho) {
        $loc = $conn->prepare("SELECT id FROM produto_imagens WHERE produto_id = :id AND caminho_imagem = :caminho LIMIT 1");
        $loc->bindParam(":id", $id, PDO::PARAM_INT);
        $loc->bindParam(":caminho", $caminho);
        $loc->execute();
        $row = $loc->fetch(PDO::FETCH_ASSOC);
        if (!$row) continue; // ignora mantida órfã com segurança

        $is_capa = ($j === $capa_index) ? 1 : 0;
        $upd_mant->bindParam(":ordem", $j, PDO::PARAM_INT);
        $upd_mant->bindParam(":is_capa", $is_capa, PDO::PARAM_INT);
        $upd_mant->bindParam(":iid", $row['id'], PDO::PARAM_INT);
        $upd_mant->execute();
    }

    // 5) Upload das novas imagens e INSERT (após as mantidas, na lista combinada)
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
            "INSERT INTO produto_imagens (produto_id, caminho_imagem, is_capa, ordem) VALUES (:pid, :caminho, :is_capa, :ordem)"
        );
        $ins->bindParam(":pid", $id, PDO::PARAM_INT);
        $ins->bindParam(":caminho", $url_imagem);
        $ins->bindParam(":is_capa", $is_capa, PDO::PARAM_INT);
        $ins->bindParam(":ordem", $indice_final, PDO::PARAM_INT);
        $ins->execute();
    }

    // 6) Informações adicionais: deleta as antigas e insere as novas
    $del_infos = $conn->prepare("DELETE FROM produto_informacoes WHERE produto_id = :id");
    $del_infos->bindParam(":id", $id, PDO::PARAM_INT);
    $del_infos->execute();

    $ins_info = $conn->prepare("INSERT INTO produto_informacoes (produto_id, titulo, texto) VALUES (:id, :titulo, :texto)");
    foreach ($informacoes as $info) {
        $titulo = isset($info['titulo']) ? $info['titulo'] : "";
        $texto = isset($info['texto']) ? $info['texto'] : "";
        if ($titulo === "" || $texto === "") continue;
        $ins_info->bindParam(":id", $id, PDO::PARAM_INT);
        $ins_info->bindParam(":titulo", $titulo);
        $ins_info->bindParam(":texto", $texto);
        $ins_info->execute();
    }

    $conn->commit();
    http_response_code(200);
    echo json_encode(array("mensagem" => "Produto atualizado com sucesso."));
} catch (Exception $exception) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    // Remove as novas imagens já salvas em disco para não deixar órfãs
    foreach ($novas_salvas as $caminho) {
        if (file_exists($caminho)) @unlink($caminho);
    }
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro ao atualizar o produto."));
}
?>

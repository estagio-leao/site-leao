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

$host = "localhost";
$db_name = "leao_north";
$username = "root";
$password_db = "";

$diretorio_upload = "../../uploads/";
if (!is_dir($diretorio_upload)) {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Diretório de uploads não encontrado."));
    exit();
}

$novas_salvas = array();

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $conn->beginTransaction();

    // 1) SELECT completo do produto de origem
    $stmt = $conn->prepare("SELECT * FROM produtos WHERE id = :id");
    $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    $stmt->execute();
    $produto = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$produto) {
        http_response_code(404);
        echo json_encode(array("mensagem" => "Produto não encontrado."));
        exit();
    }

    // 2) SELECT de TODAS as imagens (capa primeiro, preservando ordem)
    $stmt = $conn->prepare(
        "SELECT caminho_imagem, is_capa, ordem
         FROM produto_imagens
         WHERE produto_id = :id
         ORDER BY is_capa DESC, ordem ASC"
    );
    $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    $stmt->execute();
    $imagens = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3) SELECT de todas as informações adicionais
    $stmt = $conn->prepare(
        "SELECT titulo, texto
         FROM produto_informacoes
         WHERE produto_id = :id
         ORDER BY id ASC"
    );
    $stmt->bindParam(":id", $id, PDO::PARAM_INT);
    $stmt->execute();
    $informacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4) Nome da cópia: acréscimo de " (Cópia)"
    $novo_nome = $produto['nome'] . " (Cópia)";

    // 5) INSERT do novo produto — herdando categoria_id e grupo_id (Fase 15)
    $stmt = $conn->prepare(
        "INSERT INTO produtos (nome, categoria_id, grupo_id, especificacao, descricao)
         VALUES (:nome, :categoria_id, :grupo_id, :especificacao, :descricao)"
    );
    $stmt->bindParam(":nome", $novo_nome);
    if ($produto['categoria_id'] === null) {
        $stmt->bindValue(":categoria_id", null, PDO::PARAM_NULL);
    } else {
        $stmt->bindValue(":categoria_id", $produto['categoria_id'], PDO::PARAM_INT);
    }
    if ($produto['grupo_id'] === null) {
        $stmt->bindValue(":grupo_id", null, PDO::PARAM_NULL);
    } else {
        $stmt->bindValue(":grupo_id", $produto['grupo_id'], PDO::PARAM_INT);
    }
    $stmt->bindParam(":especificacao", $produto['especificacao']);
    $stmt->bindParam(":descricao", $produto['descricao']);
    $stmt->execute();
    $novo_id = $conn->lastInsertId();

    // 6) Cópia FÍSICA dos arquivos + INSERT em produto_imagens
    $stmt_img = $conn->prepare(
        "INSERT INTO produto_imagens (produto_id, caminho_imagem, is_capa, ordem)
         VALUES (:pid, :caminho, :is_capa, :ordem)"
    );
    foreach ($imagens as $i => $img) {
        $nome_origem  = basename($img['caminho_imagem']);
        $caminho_origem = $diretorio_upload . $nome_origem;

        // Novo nome com time() + índice para garantir unicidade entre múltiplas imagens
        $novo_nome_arquivo = time() . "_" . ($i + 1) . "_" . $nome_origem;
        $caminho_destino   = $diretorio_upload . $novo_nome_arquivo;
        $url_imagem        = "/uploads/" . $novo_nome_arquivo;

        if (!file_exists($caminho_origem)) {
            throw new Exception("Arquivo de imagem original não encontrado: " . $nome_origem);
        }

        // CRUCIAL: copia o arquivo físico, gerando um novo arquivo independente
        if (!copy($caminho_origem, $caminho_destino)) {
            throw new Exception("Erro ao copiar a imagem: " . $nome_origem);
        }
        $novas_salvas[] = $caminho_destino;

        $stmt_img->bindParam(":pid", $novo_id, PDO::PARAM_INT);
        $stmt_img->bindParam(":caminho", $url_imagem);
        $stmt_img->bindParam(":is_capa", $img['is_capa'], PDO::PARAM_INT);
        $stmt_img->bindParam(":ordem", $img['ordem'], PDO::PARAM_INT);
        $stmt_img->execute();
    }

    // 7) INSERT das informações adicionais
    $stmt_info = $conn->prepare(
        "INSERT INTO produto_informacoes (produto_id, titulo, texto)
         VALUES (:pid, :titulo, :texto)"
    );
    foreach ($informacoes as $info) {
        $stmt_info->bindParam(":pid", $novo_id, PDO::PARAM_INT);
        $stmt_info->bindParam(":titulo", $info['titulo']);
        $stmt_info->bindParam(":texto", $info['texto']);
        $stmt_info->execute();
    }

    $conn->commit();
    http_response_code(200);
    echo json_encode(array(
        "mensagem" => "Produto duplicado com sucesso.",
        "id"       => $novo_id,
    ));

} catch (Exception $exception) {
    if (isset($conn) && $conn->inTransaction()) {
        $conn->rollBack();
    }
    // Remove os arquivos já copiados em disco para não deixar órfãos
    foreach ($novas_salvas as $caminho) {
        if (file_exists($caminho)) @unlink($caminho);
    }
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro ao duplicar o produto."));
}
?>

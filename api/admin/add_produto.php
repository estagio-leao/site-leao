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

// Validação de campos obrigatórios (mesmo padrão do upload.php atual)
if (!isset($_POST['nome']) || !isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Dados incompletos."));
    exit();
}

// ---- Validação rigorosa do arquivo de imagem ----

// 1) Erro de upload
if ($_FILES["image"]["error"] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Falha no envio da imagem."));
    exit();
}

// 2) Tamanho máximo: 5MB
$tamanho_maximo = 5 * 1024 * 1024;
if ($_FILES["image"]["size"] > $tamanho_maximo) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Imagem muito grande. O limite é de 5MB."));
    exit();
}

// 3) MIME type real do arquivo (mais seguro que confiar no header enviado pelo cliente)
$tipos_permitidos = array("image/jpeg", "image/png", "image/webp", "image/avif");

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$tipo_real = finfo_file($finfo, $_FILES["image"]["tmp_name"]);
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

$nome_arquivo = time() . "_" . basename($_FILES["image"]["name"]);
$caminho_final = $diretorio_upload . $nome_arquivo;
$url_imagem = "/uploads/" . $nome_arquivo; // Caminho que vai pro banco e pro React ler

if (move_uploaded_file($_FILES["image"]["tmp_name"], $caminho_final)) {
    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $query = "INSERT INTO produtos (nome, especificacao, categoria, imagem)
                  VALUES (:nome, :especificacao, :categoria, :imagem)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":nome", $_POST['nome']);
        $stmt->bindParam(":especificacao", $_POST['especificacao']);
        $stmt->bindParam(":categoria", $_POST['categoria']);
        $stmt->bindParam(":imagem", $url_imagem);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("mensagem" => "Produto salvo com sucesso."));
        } else {
            // Remove a imagem já salva para não deixar órfã
            if (file_exists($caminho_final)) @unlink($caminho_final);
            http_response_code(500);
            echo json_encode(array("mensagem" => "Erro ao salvar no banco."));
        }
    } catch(PDOException $exception) {
        // Remove a imagem já salva para não deixar órfã
        if (file_exists($caminho_final)) @unlink($caminho_final);
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro ao salvar no banco."));
    }
} else {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro ao fazer upload da imagem."));
}
?>

<?php
// FASE 29 — exige Bearer Token válido (auth.php): responde OPTIONS e devolve 401 se inválido.
require_once __DIR__ . '/auth.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Responde ao "preflight" do navegador e encerra
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

// ... CONTINUA O RESTO DO CÓDIGO NORMALMENTE ( $dados = json_decode... )

// Validação simples de segurança
if (!isset($_POST['title']) || !isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(array("mensagem" => "Dados incompletos."));
    exit();
}

$host = "localhost"; 
$db_name = "leao_north"; // ALTERE AQUI
$username = "root"; // ALTERE AQUI
$password_db = ""; // ALTERE AQUI

$diretorio_upload = "../../uploads/";
if (!is_dir($diretorio_upload)) mkdir($diretorio_upload, 0755, true);

$nome_arquivo = time() . "_" . basename($_FILES["image"]["name"]);
$caminho_final = $diretorio_upload . $nome_arquivo;
$url_imagem = "/uploads/" . $nome_arquivo; // Caminho que vai pro banco e React ler

if (move_uploaded_file($_FILES["image"]["tmp_name"], $caminho_final)) {
    try {
        $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password_db);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $query = "INSERT INTO portfolio (img, title, category, size) VALUES (:img, :title, :category, :size)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":img", $url_imagem);
        $stmt->bindParam(":title", $_POST['title']);
        $stmt->bindParam(":category", $_POST['category']);
        $stmt->bindParam(":size", $_POST['size']);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("mensagem" => "Projeto salvo com sucesso."));
        }
    } catch(PDOException $exception) {
        http_response_code(500);
        echo json_encode(array("mensagem" => "Erro ao salvar no banco."));
    }
} else {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro ao fazer upload da imagem."));
}
?>
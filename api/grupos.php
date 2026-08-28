<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Responde ao preflight do navegador e encerra
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$db_name = "leao_north";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Lista grupos com a categoria (JOIN) e a contagem de produtos de cada grupo
    $base = "SELECT g.id, g.nome, g.categoria_id, c.nome AS categoria_nome,
                    g.caminho_imagem_capa,
                    (SELECT COUNT(*) FROM produtos p WHERE p.grupo_id = g.id) AS total_produtos
             FROM grupos g
             LEFT JOIN categorias c ON c.id = g.categoria_id";

    // Filtro opcional por categoria: api/grupos.php?categoria_id=3
    if (isset($_GET['categoria_id']) && $_GET['categoria_id'] !== '') {
        $categoria_id = (int)$_GET['categoria_id'];
        $query = $base . " WHERE g.categoria_id = :categoria_id ORDER BY g.nome ASC";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":categoria_id", $categoria_id, PDO::PARAM_INT);
    } else {
        $query = $base . " ORDER BY g.nome ASC";
        $stmt = $conn->prepare($query);
    }

    $stmt->execute();
    $grupos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode($grupos);
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro de conexão: " . $exception->getMessage()));
}
?>

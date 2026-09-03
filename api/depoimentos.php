<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }
header("Content-Type: application/json; charset=UTF-8");

$host = "localhost"; $db_name = "leao_north"; $username = "root"; $password = "";

try {
    $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Fase 27 — curadoria:
    //   default ......... visivel = 1            (página pública /service/depoimentos)
    //   ?destaque=1 ..... visivel = 1 E destaque = 1 (Home — TestimonialsSection)
    //   ?admin=1 ........ todas (painel precisa ver também as ocultas)
    $is_admin = isset($_GET['admin']) && $_GET['admin'] === '1';
    $so_destaques = isset($_GET['destaque']) && $_GET['destaque'] === '1';

    $where = "";
    if ($is_admin) {
        $where = "";
    } elseif ($so_destaques) {
        $where = "WHERE visivel = 1 AND destaque = 1 ";
    } else {
        $where = "WHERE visivel = 1 ";
    }

    $query = "SELECT id, nome, estrelas, texto, visivel, destaque FROM depoimentos " . $where . "ORDER BY id DESC";
    $stmt = $conn->prepare($query); $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch(PDOException $e) {
    http_response_code(500); echo json_encode(array("mensagem" => "Erro: " . $e->getMessage()));
}
?>
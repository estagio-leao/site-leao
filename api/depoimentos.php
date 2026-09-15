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

    // Fase 27 — curadoria (público):
    //   default ......... visivel = 1            (página pública /service/depoimentos)
    //   ?destaque=1 ..... visivel = 1 E destaque = 1 (Home — TestimonialsSection)
    // Fase 29 — o "?admin=1" (todas, inclusive ocultas) foi REMOVIDO: o painel agora
    //   consome o endpoint PRIVADO api/admin/depoimentos.php (Bearer Token). Este
    //   endpoint público nunca mais expõe depoimentos ocultos (visivel = 0).
    $so_destaques = isset($_GET['destaque']) && $_GET['destaque'] === '1';

    $where = $so_destaques ? "WHERE visivel = 1 AND destaque = 1 " : "WHERE visivel = 1 ";

    // 1) Lista pública — projeção mínima, NUNCA inclui registros com visivel = 0
    $query = "SELECT id, nome, estrelas, texto, visivel, destaque FROM depoimentos " . $where . "ORDER BY id DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $depoimentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2) FASE 35 — Agregados GLOBAIS (sem WHERE): média/contagem de TODOS os
    //    registros, inclusive visivel = 0 e estrelas = 0. Apenas números:
    //    nenhum nome, texto ou id de depoimento oculto sai do banco.
    //    COALESCE garante que um estrelas NULL conte como 0 (o AVG descarta NULL).
    $stmtMeta = $conn->query("SELECT COUNT(*) AS total, AVG(COALESCE(estrelas, 0)) AS media FROM depoimentos");
    $meta = $stmtMeta->fetch(PDO::FETCH_ASSOC);

    $totalGlobal = (int) $meta['total'];
    $mediaGlobal = $totalGlobal > 0 ? round((float) $meta['media'], 1) : 0.0;

    http_response_code(200);
    echo json_encode(array(
        "depoimentos" => $depoimentos,
        "total"       => count($depoimentos), // visíveis no filtro corrente
        "totalGlobal" => $totalGlobal,        // TODOS os registros da tabela
        "mediaGlobal" => $mediaGlobal         // média de TODOS (1 casa decimal)
    ));
} catch(PDOException $e) {
    http_response_code(500); echo json_encode(array("mensagem" => "Erro: " . $e->getMessage()));
}
?>
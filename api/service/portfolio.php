<?php
// FASE 22 — Leão Service: Projetos de Portfólio (público GET)
// Retorna cada projeto com:
//   * categoria_nome (nome do serviço/categoria via LEFT JOIN)
//   * imagens[]      (capa primeiro: ORDER BY is_capa DESC)
//   * capa           (atalho na raiz: URL da imagem capa — aprovado pelo Tech Lead)
// Filtros opcionais: ?servico_categoria_id=  e  ?id=
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

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

    $base_select = "SELECT pp.id, pp.servico_categoria_id, sc.nome AS categoria_nome,
                           pp.titulo, pp.subtitulo, pp.descricao
                    FROM portfolio_projetos pp
                    LEFT JOIN servicos_categorias sc ON sc.id = pp.servico_categoria_id";

    if (isset($_GET['id']) && $_GET['id'] !== '') {
        $projeto_id = (int)$_GET['id'];
        $query = $base_select . " WHERE pp.id = :id ORDER BY pp.id DESC";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":id", $projeto_id, PDO::PARAM_INT);
    } elseif (isset($_GET['servico_categoria_id']) && $_GET['servico_categoria_id'] !== '') {
        $categoria_id = (int)$_GET['servico_categoria_id'];
        $query = $base_select . " WHERE pp.servico_categoria_id = :categoria_id ORDER BY pp.id DESC";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":categoria_id", $categoria_id, PDO::PARAM_INT);
    } else {
        $query = $base_select . " ORDER BY pp.id DESC";
        $stmt = $conn->prepare($query);
    }

    $stmt->execute();
    $projetos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $ids = array_column($projetos, 'id');

    if (!empty($ids)) {
        // ids são inteiros → seguros para interpolação
        $in = implode(',', array_map('intval', $ids));

        // 1 query para imagens de TODOS os projetos (capa primeiro, depois por id)
        $imagens = $conn->query(
            "SELECT projeto_id, caminho_imagem, is_capa
             FROM portfolio_imagens
             WHERE projeto_id IN ($in)
             ORDER BY projeto_id, is_capa DESC, id ASC"
        )->fetchAll(PDO::FETCH_ASSOC);

        $map = array();
        foreach ($imagens as $img) {
            $map[$img['projeto_id']][] = array(
                "caminho_imagem" => $img['caminho_imagem'],
                "is_capa" => (bool)$img['is_capa'],
            );
        }

        foreach ($projetos as &$p) {
            $imgs = isset($map[$p['id']]) ? $map[$p['id']] : array();
            $p['imagens'] = $imgs;

            // Atalho "capa" na raiz (URL) — primeira imagem marcada como capa
            $capa = null;
            foreach ($imgs as $img) {
                if ($img['is_capa']) {
                    $capa = $img['caminho_imagem'];
                    break;
                }
            }
            // Fallback defensivo: se nenhuma estiver marcada, usa a primeira
            if ($capa === null && count($imgs) > 0) {
                $capa = $imgs[0]['caminho_imagem'];
            }
            $p['capa'] = $capa;
        }
        unset($p);
    }

    http_response_code(200);
    echo json_encode($projetos);
} catch (PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro de conexão: " . $exception->getMessage()));
}
?>

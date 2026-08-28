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

    // Filtros opcionais (Fase 15 — modelo relacional):
    //   api/produtos.php?categoria_id=3
    //   api/produtos.php?grupo_id=2
    $base_select = "SELECT p.id, p.nome, p.especificacao, p.descricao, p.data_cadastro,
                           p.categoria_id, c.nome AS categoria_nome,
                           p.grupo_id, g.nome AS grupo_nome, g.caminho_imagem_capa AS grupo_capa
                    FROM produtos p
                    LEFT JOIN categorias c ON c.id = p.categoria_id
                    LEFT JOIN grupos g    ON g.id = p.grupo_id";

    if (isset($_GET['grupo_id']) && $_GET['grupo_id'] !== '') {
        $grupo_id = (int)$_GET['grupo_id'];
        $query = $base_select . " WHERE p.grupo_id = :grupo_id ORDER BY p.id DESC";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":grupo_id", $grupo_id, PDO::PARAM_INT);
    } elseif (isset($_GET['categoria_id']) && $_GET['categoria_id'] !== '') {
        $categoria_id = (int)$_GET['categoria_id'];
        $query = $base_select . " WHERE p.categoria_id = :categoria_id ORDER BY p.id DESC";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":categoria_id", $categoria_id, PDO::PARAM_INT);
    } else {
        $query = $base_select . " ORDER BY p.id DESC";
        $stmt = $conn->prepare($query);
    }

    $stmt->execute();
    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $ids = array_column($produtos, 'id');

    if (!empty($ids)) {
        // ids são inteiros → seguros para interpolação
        $in = implode(',', array_map('intval', $ids));

        // 1 query para imagens de TODOS os produtos (capa primeiro, depois por ordem)
        $imagens = $conn->query(
            "SELECT produto_id, caminho_imagem, is_capa
             FROM produto_imagens
             WHERE produto_id IN ($in)
             ORDER BY produto_id, is_capa DESC, ordem ASC"
        )->fetchAll(PDO::FETCH_ASSOC);

        // 1 query para informações de TODOS os produtos
        $infos = $conn->query(
            "SELECT produto_id, titulo, texto
             FROM produto_informacoes
             WHERE produto_id IN ($in)
             ORDER BY produto_id, id ASC"
        )->fetchAll(PDO::FETCH_ASSOC);

        // Monta os arrays aninhados por produto
        $map_imagens = array();
        foreach ($imagens as $img) {
            $map_imagens[$img['produto_id']][] = array(
                "caminho_imagem" => $img['caminho_imagem'],
                "is_capa" => (bool)$img['is_capa'],
            );
        }

        $map_infos = array();
        foreach ($infos as $info) {
            $map_infos[$info['produto_id']][] = array("titulo" => $info['titulo'], "texto" => $info['texto']);
        }

        foreach ($produtos as &$p) {
            $p['imagens'] = isset($map_imagens[$p['id']]) ? $map_imagens[$p['id']] : array();
            $p['informacoes'] = isset($map_infos[$p['id']]) ? $map_infos[$p['id']] : array();
        }
        unset($p);
    }

    http_response_code(200);
    echo json_encode($produtos);

} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(array("mensagem" => "Erro de conexão: " . $exception->getMessage()));
}
?>

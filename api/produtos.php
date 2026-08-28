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

    // Filtros opcionais (Fase 11):
    //   api/produtos.php?categoria=disjuntores
    //   api/produtos.php?grupo=Painel de Led Quadrado
    if (isset($_GET['grupo']) && $_GET['grupo'] !== '') {
        $query = "SELECT id, nome, grupo, especificacao, categoria, descricao, data_cadastro
                  FROM produtos WHERE grupo = :grupo ORDER BY id DESC";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":grupo", $_GET['grupo']);
    } elseif (isset($_GET['categoria']) && $_GET['categoria'] !== '') {
        $query = "SELECT id, nome, grupo, especificacao, categoria, descricao, data_cadastro
                  FROM produtos WHERE categoria = :categoria ORDER BY id DESC";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":categoria", $_GET['categoria']);
    } else {
        $query = "SELECT id, nome, grupo, especificacao, categoria, descricao, data_cadastro
                  FROM produtos ORDER BY id DESC";
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

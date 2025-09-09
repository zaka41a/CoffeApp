<?php
// backend/api/tables.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_mw.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') { http_response_code(204); exit; }

// GET: list tables (public pour waiter/admin)
if ($method === 'GET') {
  $rows = $pdo->query("SELECT id, number, seats, status FROM dining_tables ORDER BY number ASC")
              ->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($rows); exit;
}

// PATCH: change status (waiter autorisé)
if ($method === 'PATCH') {
  $data = json_decode(file_get_contents('php://input'), true) ?? [];
  $id = (int)($data['id'] ?? 0);
  $status = $data['status'] ?? '';
  if ($id<=0 || !in_array($status, ['free','occupied'], true)) {
    http_response_code(422); echo json_encode(['error'=>'Invalid payload']); exit;
  }
  $q = $pdo->prepare("UPDATE dining_tables SET status=? WHERE id=?");
  $ok = $q->execute([$status, $id]);
  echo json_encode(['ok'=>$ok]); exit;
}

http_response_code(405);
echo json_encode(['error'=>'Method not allowed']);

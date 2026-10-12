import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

test(
  "MySQL reuses a connection, caches migrations, and rolls back early exits",
  {
    skip: !process.env.ARENA_MYSQL_TEST_DSN,
    timeout: 30000,
  },
  async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "arena-mysql-"));
    const root = path.resolve(import.meta.dirname, "..");
    const router = path.join(dir, "router.php");
    writeFileSync(
      router,
      `<?php
require getenv('ARENA_REPO').'/api/core.php';
header('Content-Type: application/json');
$db=db();
$action=$_GET['action']??'read';
ensureSchema('probe',1,static function()use($db):void{
  $db->exec('CREATE TABLE IF NOT EXISTS arena_connection_probe (id INT PRIMARY KEY, value INT NOT NULL)');
  $db->exec('INSERT INTO arena_connection_probe VALUES (1,1) ON DUPLICATE KEY UPDATE value=value+1');
});
creditSchema();authSchema();soloSchema();specialQuizSchema();
if($action==='reject'||$action==='crash'){
  $db->beginTransaction();
  $db->exec('INSERT INTO arena_connection_probe VALUES (2,99)');
  if($action==='reject')fail('Expected rejection',409);
  throw new RuntimeException('Expected unhandled exception');
}
if($action==='commit'){
  $db->beginTransaction();$db->exec('INSERT INTO arena_connection_probe VALUES (3,42)');$db->commit();
}
if($action==='upgrade')ensureSchema('probe',2,static function()use($db):void{$db->exec('UPDATE arena_connection_probe SET value=value+1 WHERE id=1');});
echo json_encode(['connection'=>(int)$db->query('SELECT CONNECTION_ID()')->fetchColumn(),'persistent'=>(bool)$db->getAttribute(PDO::ATTR_PERSISTENT),'transaction'=>$db->inTransaction(),'rows'=>$db->query('SELECT * FROM arena_connection_probe ORDER BY id')->fetchAll()]);
`,
    );
    let logs = "";
    const server = spawn(
      "php",
      ["-d", "display_errors=0", "-S", "127.0.0.1:18192", router],
      {
        env: {
          ...process.env,
          ARENA_REPO: root,
          ARENA_TEST_DSN: process.env.ARENA_MYSQL_TEST_DSN,
          ARENA_TEST_DB_USER: process.env.ARENA_MYSQL_TEST_USER || "root",
          ARENA_TEST_DB_PASSWORD: process.env.ARENA_MYSQL_TEST_PASSWORD || "",
          ARENA_TEST_ADMIN_HASH: "unused-test-only",
        },
        stdio: ["ignore", "ignore", "pipe"],
      },
    );
    server.stderr.on("data", (b) => {
      logs += b;
    });
    const get = (action) => fetch("http://127.0.0.1:18192/?action=" + action);
    try {
      let first;
      for (let i = 0; i < 80; i++) {
        try {
          const r = await get("read");
          assert.equal(r.status, 200, logs);
          first = await r.json();
          break;
        } catch (e) {
          if (i === 79) throw e;
          await new Promise((r) => setTimeout(r, 100));
        }
      }
      assert.equal(first.persistent, true);
      for (let i = 0; i < 5; i++) {
        const next = await (await get("read")).json();
        assert.equal(
          next.connection,
          first.connection,
          "Same worker must reuse the MySQL connection",
        );
        assert.equal(
          Number(next.rows[0].value),
          1,
          "Migration runs once per connection",
        );
      }
      for (const action of ["reject", "crash"]) {
        assert.equal(
          (await get(action)).status,
          action === "reject" ? 409 : 500,
        );
        const next = await (await get("read")).json();
        assert.equal(next.connection, first.connection);
        assert.equal(next.transaction, false);
        assert.equal(
          next.rows.length,
          1,
          "Failed requests cannot leak uncommitted data",
        );
      }
      const committed = await (await get("commit")).json();
      assert.equal(Number(committed.rows[1].value), 42);
      const upgraded = await (await get("upgrade")).json();
      assert.equal(
        Number(upgraded.rows[0].value),
        2,
        "Schema version changes rerun the migration",
      );
    } finally {
      server.kill();
      await new Promise((resolve) => server.once("exit", resolve));
      rmSync(dir, { recursive: true, force: true });
    }
  },
);

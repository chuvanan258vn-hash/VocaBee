const Database = require('better-sqlite3');
const db = new Database('G:\\myProject\\NextJs\\VocaBeeProject\\vocabee-srs\\.codegraph\\codegraph.db');

console.log('=== settings/page.tsx — CodeGraph index được gì? ===\n');
const nodes = db.prepare(`
  SELECT kind, name, start_line, signature
  FROM nodes WHERE file_path = 'app/settings/page.tsx'
  AND kind NOT IN ('import') ORDER BY start_line
`).all();
nodes.forEach(n => console.log(
  `  Dòng ${String(n.start_line).padEnd(3)} [${n.kind}] "${n.name}"`
  + (n.signature ? `\n         sig: ${n.signature.slice(0,80)}` : '')
));

console.log('\n=== Khi hỏi "authen" → CodeGraph tìm được gì? ===\n');
const authen = db.prepare(`
  SELECT n.kind, n.name, n.file_path, n.start_line
  FROM nodes n
  WHERE (LOWER(n.name) LIKE '%auth%' OR LOWER(n.qualified_name) LIKE '%auth%')
    AND n.kind NOT IN ('import', 'file')
  ORDER BY n.file_path, n.start_line
`).all();
authen.forEach(n =>
  console.log(`  [${n.kind.padEnd(10)}] "${n.name.padEnd(30)}" @ ${n.file_path}:${n.start_line}`)
);

console.log('\n=== SettingsPage → gọi/dùng gì? (edges) ===\n');
const edges = db.prepare(`
  SELECT e.kind as edge_kind, n_tgt.kind, n_tgt.name, n_tgt.file_path, n_tgt.start_line
  FROM edges e
  JOIN nodes n_src ON e.source = n_src.id
  JOIN nodes n_tgt ON e.target = n_tgt.id
  WHERE n_src.name = 'SettingsPage' AND e.kind != 'contains'
`).all();
edges.forEach(e =>
  console.log(`  --${e.edge_kind}--> [${e.kind}] "${e.name}" @ ${e.file_path}:${e.start_line}`)
);
db.close();

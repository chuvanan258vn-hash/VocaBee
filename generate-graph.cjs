const Database = require('better-sqlite3');
const fs = require('fs');

const db = new Database('G:\\myProject\\NextJs\\VocaBeeProject\\vocabee-srs\\.codegraph\\codegraph.db');

// Lấy nodes (bỏ import vì quá nhiều, noise)
const nodes = db.prepare(`
  SELECT id, kind, name, file_path, start_line, is_exported, is_async
  FROM nodes
  WHERE kind NOT IN ('import')
`).all();

// Lấy edges (bỏ contains để graph không quá rối)
const edges = db.prepare(`
  SELECT source, target, kind
  FROM edges
  WHERE kind NOT IN ('contains')
    AND source IN (SELECT id FROM nodes WHERE kind NOT IN ('import'))
    AND target IN (SELECT id FROM nodes WHERE kind NOT IN ('import'))
`).all();

db.close();

// Map id → index cho D3
const idToIdx = {};
nodes.forEach((n, i) => { idToIdx[n.id] = i; });

const d3Nodes = nodes.map(n => ({
  id: n.id,
  name: n.name,
  kind: n.kind,
  file: n.file_path,
  line: n.start_line,
  exported: !!n.is_exported,
  async: !!n.is_async,
}));

const d3Links = edges
  .filter(e => idToIdx[e.source] !== undefined && idToIdx[e.target] !== undefined)
  .map(e => ({
    source: idToIdx[e.source],
    target: idToIdx[e.target],
    kind: e.kind,
  }));

const colorMap = {
  file:       '#60a5fa', // blue
  function:   '#34d399', // green
  interface:  '#f59e0b', // amber
  type_alias: '#a78bfa', // violet
  constant:   '#fb7185', // rose
  variable:   '#94a3b8', // slate
  method:     '#2dd4bf', // teal
  property:   '#f97316', // orange
  class:      '#e879f9', // fuchsia
};

const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>VocaBee — CodeGraph Visualization</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0f172a; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; overflow: hidden; }

  #controls {
    position: fixed; top: 0; left: 0; right: 0; z-index: 10;
    background: #1e293b; border-bottom: 1px solid #334155;
    padding: 10px 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  }
  #controls h1 { font-size: 14px; font-weight: 700; color: #fbbf24; margin-right: 8px; }
  #controls label { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap-4px; }
  #controls input[type=range] { width: 80px; accent-color: #fbbf24; }
  #search {
    background: #0f172a; border: 1px solid #475569; border-radius: 6px;
    color: #e2e8f0; padding: 4px 10px; font-size: 12px; width: 180px; outline: none;
  }
  #search:focus { border-color: #fbbf24; }

  .legend {
    display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-left: auto;
  }
  .legend-item {
    display: flex; align-items: center; gap: 4px; font-size: 10px; color: #94a3b8;
    cursor: pointer; padding: 2px 6px; border-radius: 4px; border: 1px solid transparent;
    transition: all .15s;
  }
  .legend-item:hover { border-color: #475569; }
  .legend-item.active { border-color: #fbbf24; background: #1e293b; }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  #tooltip {
    position: fixed; pointer-events: none; background: #1e293b;
    border: 1px solid #475569; border-radius: 8px; padding: 10px 14px;
    font-size: 12px; max-width: 280px; z-index: 20; display: none;
    box-shadow: 0 4px 20px rgba(0,0,0,.5);
  }
  #tooltip .t-name { font-weight: 700; color: #f1f5f9; margin-bottom: 4px; font-size: 13px; }
  #tooltip .t-row { color: #94a3b8; margin: 2px 0; }
  #tooltip .t-row span { color: #e2e8f0; }
  #tooltip .t-kind { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-bottom: 6px; }

  #stats {
    position: fixed; bottom: 12px; left: 16px; font-size: 11px; color: #475569; z-index: 10;
  }

  #canvas { width: 100vw; height: 100vh; }
  .node { cursor: pointer; }
  .link { stroke-opacity: 0.3; }
  .link.calls { stroke: #34d399; }
  .link.references { stroke: #60a5fa; }
  .link.implements { stroke: #f59e0b; }
  .link.extends { stroke: #a78bfa; }
</style>
</head>
<body>

<div id="controls">
  <h1>🐝 VocaBee CodeGraph</h1>
  <input id="search" type="text" placeholder="Tìm symbol..." />
  <label>
    Link distance:
    <input type="range" id="distSlider" min="30" max="300" value="80" />
  </label>
  <label>
    Charge:
    <input type="range" id="chargeSlider" min="-500" max="-10" value="-120" />
  </label>
  <div class="legend" id="legend"></div>
</div>

<svg id="canvas"></svg>

<div id="tooltip">
  <div class="t-name" id="t-name"></div>
  <div class="t-kind" id="t-kind"></div>
  <div class="t-row">File: <span id="t-file"></span></div>
  <div class="t-row">Line: <span id="t-line"></span></div>
  <div class="t-row">Kind: <span id="t-kd"></span></div>
</div>

<div id="stats"></div>

<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script>
const RAW_NODES = ${JSON.stringify(d3Nodes)};
const RAW_LINKS = ${JSON.stringify(d3Links)};
const COLOR_MAP = ${JSON.stringify(colorMap)};

const kinds = [...new Set(RAW_NODES.map(n => n.kind))].sort();
const activeKinds = new Set(kinds);

// Legend
const legend = document.getElementById('legend');
kinds.forEach(k => {
  const el = document.createElement('div');
  el.className = 'legend-item active';
  el.dataset.kind = k;
  el.innerHTML = \`<div class="legend-dot" style="background:\${COLOR_MAP[k]||'#64748b'}"></div>\${k}\`;
  el.onclick = () => {
    if (activeKinds.has(k)) { activeKinds.delete(k); el.classList.remove('active'); }
    else { activeKinds.add(k); el.classList.add('active'); }
    updateVisibility();
  };
  legend.appendChild(el);
});

const svg = d3.select('#canvas');
const w = window.innerWidth, h = window.innerHeight;
svg.attr('viewBox', [0, 0, w, h]);

const g = svg.append('g');

// Zoom
svg.call(d3.zoom().scaleExtent([0.05, 4]).on('zoom', e => g.attr('transform', e.transform)));

// Simulation
let simulation = d3.forceSimulation(RAW_NODES)
  .force('link', d3.forceLink(RAW_LINKS).id((_, i) => i).distance(80).strength(0.3))
  .force('charge', d3.forceManyBody().strength(-120))
  .force('center', d3.forceCenter(w/2, h/2))
  .force('collision', d3.forceCollide(8));

const link = g.append('g').selectAll('line')
  .data(RAW_LINKS).join('line')
  .attr('class', d => 'link ' + (d.kind||''))
  .attr('stroke', '#334155').attr('stroke-width', 1);

const node = g.append('g').selectAll('circle')
  .data(RAW_NODES).join('circle')
  .attr('class', 'node')
  .attr('r', d => d.kind === 'file' ? 7 : d.exported ? 5 : 3.5)
  .attr('fill', d => COLOR_MAP[d.kind] || '#64748b')
  .attr('stroke', d => d.exported ? '#fff' : 'none')
  .attr('stroke-width', 1)
  .call(d3.drag()
    .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
    .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
    .on('end',   (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
  );

// Labels for files only
const label = g.append('g').selectAll('text')
  .data(RAW_NODES.filter(n => n.kind === 'file')).join('text')
  .attr('font-size', 9).attr('fill', '#94a3b8').attr('dy', -10)
  .attr('text-anchor', 'middle').text(d => d.name);

// Tooltip
const tip = document.getElementById('tooltip');
node
  .on('mousemove', (e, d) => {
    document.getElementById('t-name').textContent = d.name;
    document.getElementById('t-kind').textContent = d.kind;
    document.getElementById('t-kind').style.background = (COLOR_MAP[d.kind]||'#64748b') + '33';
    document.getElementById('t-kind').style.color = COLOR_MAP[d.kind]||'#64748b';
    document.getElementById('t-file').textContent = d.file || '—';
    document.getElementById('t-line').textContent = d.line || '—';
    document.getElementById('t-kd').textContent = d.kind + (d.async ? ' (async)' : '') + (d.exported ? ' [exported]' : '');
    tip.style.display = 'block';
    tip.style.left = (e.clientX + 14) + 'px';
    tip.style.top  = (e.clientY - 10) + 'px';
  })
  .on('mouseleave', () => tip.style.display = 'none');

// Search
document.getElementById('search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  node.attr('opacity', d => !q || d.name.toLowerCase().includes(q) ? 1 : 0.08);
  label.attr('opacity', d => !q || d.name.toLowerCase().includes(q) ? 1 : 0.08);
});

// Sliders
document.getElementById('distSlider').addEventListener('input', e => {
  simulation.force('link').distance(+e.target.value);
  simulation.alpha(0.3).restart();
});
document.getElementById('chargeSlider').addEventListener('input', e => {
  simulation.force('charge').strength(+e.target.value);
  simulation.alpha(0.3).restart();
});

function updateVisibility() {
  node.attr('display', d => activeKinds.has(d.kind) ? null : 'none');
  link.attr('display', d => {
    const s = RAW_NODES[d.source.index || d.source];
    const t = RAW_NODES[d.target.index || d.target];
    return (s && activeKinds.has(s.kind) && t && activeKinds.has(t.kind)) ? null : 'none';
  });
  label.attr('display', activeKinds.has('file') ? null : 'none');
}

simulation.on('tick', () => {
  link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
  node.attr('cx', d => d.x).attr('cy', d => d.y);
  label.attr('x', d => d.x).attr('y', d => d.y);
});

// Stats
document.getElementById('stats').textContent =
  \`\${RAW_NODES.length} nodes · \${RAW_LINKS.length} edges · Drag để di chuyển · Scroll để zoom\`;

window.addEventListener('resize', () => {
  svg.attr('viewBox', [0, 0, window.innerWidth, window.innerHeight]);
  simulation.force('center', d3.forceCenter(window.innerWidth/2, window.innerHeight/2)).alpha(0.1).restart();
});
</script>
</body>
</html>`;

const outPath = 'G:\\myProject\\NextJs\\VocaBeeProject\\vocabee-srs\\codegraph-viz.html';
fs.writeFileSync(outPath, html, 'utf8');
console.log('Generated:', outPath);
console.log('Nodes:', d3Nodes.length, '| Links:', d3Links.length);

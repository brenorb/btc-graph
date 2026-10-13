// Reproducible build/browser measurements; instrumentation exists only in temporary builds.
import { build } from 'vite';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { tmpdir, cpus, totalmem, release } from 'node:os';
import { resolve, join, extname } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const destination = resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) || 'performance-results.json');
const browserRequested = process.argv.includes('--browser');
const temp = await mkdtemp(join(tmpdir(), 'graph-performance-'));
const bytes = (source) => Buffer.byteLength(source);
const size = (source) => ({ bytes: bytes(source), gzip_bytes: gzipSync(source).length });
const summarize = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return { min: sorted[0], median: sorted[Math.floor(sorted.length / 2)], p95: sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * .95) - 1)] };
};
function group(id) {
  if (/node_modules\/(cytoscape|cytoscape-dagre|dagre|graphlib|lodash)\//.test(id)) return 'cytoscape_and_layout_dependencies';
  return id.includes('node_modules') ? 'other_dependencies' : 'application_and_runtime';
}
const instrumentation = (source) => {
  for (const needle of ['function rerenderGraph(state: AppState, root: HTMLElement) {', '  syncUrlState(state);\n}\n\nfunction wireInteractions', '  rerenderGraph(state, root);\n  wireInteractions(state, root);']) {
    if (!source.includes(needle)) throw new Error(`Instrumentation no longer matches: ${needle}`);
  }
  return source
  .replace('function rerenderGraph(state: AppState, root: HTMLElement) {', 'function rerenderGraph(state: AppState, root: HTMLElement) { const auditStart = performance.now();')
  .replace('  state.cy.layout(resolveGraphLayoutSettings(state.viewportMode)).run();', '  const layoutStart = performance.now(); state.cy.layout(resolveGraphLayoutSettings(state.viewportMode)).run(); window.__audit.layout_ms = performance.now() - layoutStart;')
  .replace('  syncUrlState(state);\n}\n\nfunction wireInteractions', '  syncUrlState(state); window.__audit.rerender_ms = performance.now() - auditStart;\n}\n\nfunction wireInteractions')
  .replace('    data = await fetchGraphData();', '    const dataStart = performance.now(); data = await fetchGraphData(); window.__audit = { data_ms: performance.now() - dataStart };')
  .replace('  rerenderGraph(state, root);\n  wireInteractions(state, root);', '  rerenderGraph(state, root); window.__audit.cy = state.cy; window.__audit.ready_ms = performance.now(); window.__audit.rerender = () => rerenderGraph(state, root);\n  wireInteractions(state, root);');
};

async function buildVariant(name, instrument = false) {
  const composition = {};
  const chunks = [];
  const outDir = join(temp, name);
  await build({ root, configFile: false, logLevel: 'silent', build: { outDir, emptyOutDir: true, ...(name === 'vendor-split' ? { rollupOptions: { output: { manualChunks(id) { if (group(id) === 'cytoscape_and_layout_dependencies') return 'graph-runtime'; } } } } : {}) }, plugins: [{
    name: 'performance-audit', enforce: 'pre',
    transform(source, id) {
      if (instrument && id.endsWith('/src/app.ts')) return instrumentation(source);
      if (name === 'lazy-trial' && id.endsWith('/src/main.ts')) {
        return source.replace('import { bootstrapApp } from "./app";', '').replace('void bootstrapApp(document.getElementById("app"));', 'void import("./app").then(({ bootstrapApp }) => bootstrapApp(document.getElementById("app")));');
      }
    },
    generateBundle(_, bundle) {
      for (const value of Object.values(bundle)) {
        if (value.type !== 'chunk') continue;
        chunks.push({ name: value.fileName, entry: value.isEntry, dynamic_entry: value.isDynamicEntry, ...size(value.code) });
        for (const [id, module] of Object.entries(value.modules)) {
          const key = group(id);
          composition[key] = (composition[key] || 0) + module.renderedLength;
        }
      }
    },
  }] });
  return { name, chunks, pre_minification_rendered_bytes_by_group: composition, outDir };
}

try {
  const graphText = await readFile(join(root, 'public/data/graph.json'), 'utf8');
  const graph = JSON.parse(graphText);
  const result = {
    date: new Date().toISOString(),
    source_revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    environment: { cpu: cpus()[0].model, logical_cpus: cpus().length, ram_bytes: totalmem(), os: release(), node: process.version },
    data: { nodes: graph.nodes.length, edges: graph.nodes.reduce((sum, node) => sum + node.prerequisites.length, 0), sha256: createHash('sha256').update(graphText).digest('hex'), ...size(graphText) },
    builds: [], runtime: [],
  };
  for (const name of ['baseline', 'lazy-trial', 'vendor-split']) {
    const built = await buildVariant(name);
    const { outDir, ...measurement } = built;
    result.builds.push(measurement);
  }
  if (browserRequested) {
    const playwrightModule = process.env.PLAYWRIGHT_MODULE;
    const { chromium } = await import(playwrightModule ? pathToFileURL(resolve(playwrightModule)).href : 'playwright');
    const browserBuild = await buildVariant('instrumented', true);
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
    const server = createServer(async (request, response) => {
      try {
        const pathname = new URL(request.url, 'http://localhost').pathname;
        const file = resolve(browserBuild.outDir, '.' + (pathname === '/' ? '/index.html' : pathname));
        if (!file.startsWith(browserBuild.outDir + '/')) throw new Error('invalid path');
        response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
        response.end(await readFile(file));
      } catch { response.writeHead(404); response.end(); }
    });
    await new Promise((done) => server.listen(0, '127.0.0.1', done));
    const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
    result.environment.browser = await browser.version();
    result.environment.headless = true;
    try {
      for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
        for (const multiplier of [1, 2, 4]) {
          const measurements = [];
          const expanded = { nodes: Array.from({ length: multiplier }, (_, copy) => graph.nodes.map(node => ({ ...node, id: `${node.id}-${copy}`, prerequisites: node.prerequisites.map(id => `${id}-${copy}`) }))).flat() };
          for (let repeat = 0; repeat < 3; repeat++) {
            const context = await browser.newContext({ viewport });
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.addInitScript(() => localStorage.setItem('btc-graph-help-seen', '1'));
            await page.route('**/data/graph.json', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify(expanded) }));
            await page.route('**/*', route => {
              if (new URL(route.request().url()).hostname !== '127.0.0.1') return route.abort();
              return route.fallback();
            });
            await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'domcontentloaded' });
            await page.waitForFunction(() => window.__audit?.cy, null, { timeout: 120000 });
            const measurement = await page.evaluate(async () => {
              const audit = window.__audit;
              const nextFrame = () => new Promise(done => requestAnimationFrame(done));
              const start = performance.now(); await nextFrame(); await nextFrame();
              const settle_ms = performance.now() - start;
              // Warm up the renderer and exclude entrance-animation frames.
              for (let i = 0; i < 30; i++) await nextFrame();
              audit.cy.zoom({ level: .8, renderedPosition: { x: 300, y: 300 } });
              const frames = [];
              let previous = await nextFrame();
              for (let i = 0; i < 90; i++) {
                audit.cy.panBy({ x: i % 2 ? -6 : 6, y: i % 2 ? -3 : 3 });
                const timestamp = await nextFrame(); frames.push(timestamp - previous); previous = timestamp;
              }
              const startup = { layout_ms: audit.layout_ms, rerender_ms: audit.rerender_ms, ready_ms: audit.ready_ms, data_ms: audit.data_ms, settle_ms };
              audit.rerender();
              return { ...startup, relayout_ms: audit.layout_ms, refresh_ms: audit.rerender_ms, frames, nodes: audit.cy.nodes().length, edges: audit.cy.edges().length };
            });
            if (errors.length) throw new Error(errors.join('\n'));
            if (![measurement.layout_ms, measurement.rerender_ms, measurement.refresh_ms].every(Number.isFinite)) throw new Error('Missing timing instrumentation');
            measurement.pan_frame_ms = summarize(measurement.frames); delete measurement.frames;
            measurements.push(measurement);
            await context.close();
          }
          result.runtime.push({ viewport, multiplier, topology: 'disconnected copies of current graph', repetitions: measurements });
          console.log(`${viewport.width}px / ${multiplier}x: completed three repetitions`);
        }
      }
    } finally { await browser.close(); await new Promise(done => server.close(done)); }
  }
  await mkdir(resolve(destination, '..'), { recursive: true });
  await writeFile(destination, JSON.stringify(result, null, 2) + '\n');
  console.log(`Saved measurements to ${destination}`);
} finally { await rm(temp, { recursive: true, force: true }); }

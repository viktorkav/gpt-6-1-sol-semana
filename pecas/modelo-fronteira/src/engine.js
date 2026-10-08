export const GRID_COLS = 18;
export const GRID_ROWS = 12;
export const START = Object.freeze({ x: 1, y: 6 });
export const GOAL = Object.freeze({ x: 16, y: 5 });

export function createMap(preset = 'passagem') {
  const blocked = [];
  if (!['passagem', 'labirinto', 'bloqueado'].includes(preset)) throw new Error('Mapa desconhecido.');
  for (let y = 0; y < GRID_ROWS; y++) {
    if (preset === 'passagem' && y !== 3) blocked.push(y * GRID_COLS + 8);
    if (preset === 'bloqueado') blocked.push(y * GRID_COLS + 8);
    if (preset === 'labirinto') {
      if (y !== 1) blocked.push(y * GRID_COLS + 5);
      if (y !== 10) blocked.push(y * GRID_COLS + 9);
      if (y !== 2) blocked.push(y * GRID_COLS + 13);
    }
  }
  return blocked;
}

export function solvePath({ blocked = [], algorithm = 'astar', cols = GRID_COLS, rows = GRID_ROWS, start = START, goal = GOAL } = {}) {
  if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 1 || rows < 1) throw new Error('Dimensões da grade inválidas.');
  if (!['astar', 'dijkstra'].includes(algorithm)) throw new Error('Algoritmo desconhecido.');
  const validPoint = p => p && Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.x < cols && p.y >= 0 && p.y < rows;
  if (!validPoint(start) || !validPoint(goal)) throw new Error('Origem e destino devem estar dentro da grade.');
  if (!Array.isArray(blocked) || blocked.some(id => !Number.isInteger(id) || id < 0 || id >= cols * rows)) throw new Error('Obstáculo fora da grade.');
  const walls = new Set(blocked), source = start.y * cols + start.x, target = goal.y * cols + goal.x;
  const visited = [], distance = new Map([[source, 0]]), parent = new Map(), closed = new Set(), open = new Set([source]);
  const heuristic = id => algorithm === 'astar' ? Math.abs(id % cols - goal.x) + Math.abs(Math.floor(id / cols) - goal.y) : 0;
  const failed = () => ({ path: [], visited, steps: visited.length, cost: null, found: false });
  if (walls.has(source) || walls.has(target)) return failed();
  while (open.size) {
    let current, score = Infinity;
    for (const id of open) {
      const value = distance.get(id) + heuristic(id);
      if (value < score) { current = id; score = value; }
    }
    open.delete(current); closed.add(current); visited.push(current);
    if (current === target) {
      const path = [current];
      while (parent.has(path[0])) path.unshift(parent.get(path[0]));
      return { path, visited, steps: visited.length, cost: distance.get(current), found: true };
    }
    const x = current % cols, y = Math.floor(current / cols);
    for (const [nx, ny] of [[x + 1, y], [x, y - 1], [x, y + 1], [x - 1, y]]) {
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
      const next = ny * cols + nx;
      if (walls.has(next) || closed.has(next)) continue;
      const candidate = distance.get(current) + 1;
      if (candidate < (distance.get(next) ?? Infinity)) { distance.set(next, candidate); parent.set(next, current); open.add(next); }
    }
  }
  return failed();
}

const stableCSV = 'lote,tempo\n1,3.1\n2,4.9\n3,7.2\n4,8.8\n5,11.1\n6,12.9\n7,15.2\n8,16.8';
export const DATASETS = {
  estavel: { label: 'Relação estável', csv: stableCSV },
  atipico: { label: 'Ponto atípico', csv: stableCSV.replace('8,16.8', '8,38') },
  insuficiente: { label: 'Dados insuficientes', csv: 'lote,tempo\n1,3\n2,5' },
};

function fit(points) {
  const n = points.length, mx = points.reduce((s, p) => s + p.x, 0) / n, my = points.reduce((s, p) => s + p.y, 0) / n;
  const xx = points.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  if (!Number.isFinite(xx) || xx === 0) throw new Error('Os valores de x precisam variar e ter escala finita.');
  const slope = points.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / xx;
  const intercept = my - slope * mx;
  const residuals = points.map(p => p.y - (slope * p.x + intercept));
  const sse = residuals.reduce((s, r) => s + r * r, 0), sst = points.reduce((s, p) => s + (p.y - my) ** 2, 0);
  // Convenção da demo: y constante com ajuste perfeito tem R² = 1.
  const r2 = sst === 0 ? (sse === 0 ? 1 : 0) : 1 - sse / sst, rmse = Math.sqrt(sse / n);
  if (![slope, intercept, r2, rmse].every(Number.isFinite)) throw new Error('Os valores são grandes demais para calcular com precisão finita.');
  return { slope, intercept, residuals, r2, rmse };
}

export function analyzeData(csv) {
  if (typeof csv !== 'string' || !csv.trim()) throw new Error('Cole um CSV com duas colunas numéricas.');
  if (csv.length > 50000) throw new Error('O CSV deve ter no máximo 50.000 caracteres.');
  const lines = csv.trim().split(/\r?\n/).filter(line => line.trim());
  const points = [];
  for (let i = 0; i < lines.length; i++) {
    const cells = lines[i].split(',').map(cell => cell.trim());
    if (cells.length !== 2 || cells.some(cell => !cell)) throw new Error(`Linha ${i + 1}: use exatamente duas colunas separadas por vírgula.`);
    const values = cells.map(Number);
    if (i === 0 && cells.every(cell => /^[\p{L}_][\p{L}\p{N}_ ()-]*$/u.test(cell)) && values.every(Number.isNaN)) continue;
    if (!values.every(Number.isFinite)) throw new Error(`Linha ${i + 1}: os valores devem ser números finitos.`);
    points.push({ x: values[0], y: values[1] });
    if (points.length > 200) throw new Error('O CSV deve ter no máximo 200 observações.');
  }
  if (points.length < 3) throw new Error('São necessários pelo menos 3 pontos para ajustar a regressão.');
  const result = fit(points), warnings = ['Dados sintéticos para demonstração.', 'Correlação não implica causalidade.'];
  const minX = Math.min(...points.map(p => p.x)), maxX = Math.max(...points.map(p => p.x));
  if (12 < minX || 12 > maxX) warnings.push('Extrapolação: a previsão em x = 12 está fora do intervalo observado.');
  let outlierIndex = null, baselineSlope = null, shiftPercent = 0;
  for (let i = 0; i < points.length; i++) {
    let baseline;
    try { baseline = fit(points.filter((_, index) => index !== i)); } catch { continue; }
    const difference = Math.abs(result.slope - baseline.slope);
    const shift = Math.abs(baseline.slope) < 1e-12 ? (difference < 1e-12 ? 0 : Infinity) : difference / Math.abs(baseline.slope) * 100;
    if (shift > shiftPercent) { shiftPercent = shift; outlierIndex = i; baselineSlope = baseline.slope; }
  }
  if (shiftPercent >= 25) warnings.push(`Ponto ${outlierIndex + 1} influente: sua remoção altera a inclinação em pelo menos 25%.`);
  else { outlierIndex = null; baselineSlope = null; }
  const prediction = result.slope * 12 + result.intercept;
  if (!Number.isFinite(prediction)) throw new Error('A previsão excedeu a escala numérica permitida.');
  return { points, ...result, predictionAt: 12, prediction, warnings, count: points.length, baselineSlope, outlierIndex, shiftPercent };
}

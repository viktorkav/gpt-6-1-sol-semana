// Os cenários e as contagens abaixo foram inventados para explicar o conceito.
// Nenhum modelo foi executado. Estes dados não são evidência de desempenho.

function freezeTree(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeTree);
    Object.freeze(value);
  }
  return value;
}

export const FAMILIES = freezeTree([
  { id: 'reasoning', name: 'Raciocínio', color: '#315FE9', description: 'Planejar e resolver problemas com restrições explícitas.' },
  { id: 'code', name: 'Código', color: '#C94A29', description: 'Corrigir e transformar pequenos programas com critérios verificáveis.' },
  { id: 'evidence', name: 'Evidências', color: '#7650C8', description: 'Relacionar afirmações a documentos e reconhecer o que falta.' },
]);

export const STRATEGIES = freezeTree([
  { id: 'direct', name: 'Aresta01 Direto', description: 'Modo hipotético: produzir uma resposta com menos revisão.', model: 'Aresta01', hypothetical: true },
  { id: 'deliberate', name: 'Aresta01 Deliberado', description: 'Modo hipotético do mesmo modelo: revisar restrições e a resposta com mais esforço.', model: 'Aresta01', hypothetical: true },
]);

export const METRICS = freezeTree([
  { id: 'success', name: 'Sucesso na tarefa', unit: '%', description: 'Casos aprovados ÷ casos hipotéticos × 100. Todos os critérios da tarefa precisam ser satisfeitos.' },
  { id: 'effort', name: 'Esforço por caso', unit: 'unidades de esforço', description: 'Orçamento abstrato atribuído a cada caso pelo autor; não mede tokens, tempo, custo ou consumo real.' },
]);

export const BENCHMARK_METHOD = freezeTree({
  title: 'Comparação ilustrativa de dois modos hipotéticos',
  status: 'fictional',
  notice: 'Cenários e contagens inventados pelo autor. Nenhuma execução de modelo. Não é pesquisa independente nem avaliação de desempenho real.',
  sample: 'Cada tarefa representa 50 casos hipotéticos, iguais para os dois modos: 150 por família e 450 no conjunto. As contagens não vêm de observações.',
  scoring: 'Um caso só é aprovado se satisfizer todos os itens do critério de sua tarefa. A porcentagem é calculada das contagens inteiras apresentadas.',
  budget: 'O autor atribui unidades de esforço abstratas a cada caso. O modo Deliberado recebe de 2 a 4 vezes o orçamento do Direto. As unidades não correspondem a tokens, segundos ou preço.',
  aggregation: 'Sucesso agregado = soma dos aprovados ÷ soma dos casos. Esforço agregado = média por caso, ponderada pelo número de casos de cada tarefa.',
  controls: [
    'Os dois modos representam o mesmo modelo fictício Aresta01.',
    'Os modos compartilham tarefas, quantidade de casos e critérios de aprovação.',
    'A diferença de orçamento é uma premissa do exemplo, sem medição ou execução.',
  ],
  assumptions: [
    'Mais revisão pode melhorar o resultado e consumir mais esforço.',
    'O exemplo atribui mais aprovações ao modo Deliberado, mas nenhum resultado perfeito.',
    'Os números mostram um trade-off inventado; não permitem prever um produto ou modelo real.',
  ],
});

function result(passed, effort, total = 50) {
  return { passed, total, percent: passed / total * 100, effort };
}

export const TASKS = freezeTree([
  {
    id: 'schedule', family: 'reasoning', title: 'Ordenar cinco entregas',
    criterion: 'Ordenar cinco entregas respeitando três precedências e dois prazos; nenhuma entrega pode faltar ou se repetir.',
    samples: 50, results: { direct: result(35, 10), deliberate: result(43, 30) },
  },
  {
    id: 'route', family: 'reasoning', title: 'Encontrar a rota mínima',
    criterion: 'Escolher a rota de menor custo num grafo de seis nós, respeitar uma aresta bloqueada e informar o custo correto.',
    samples: 50, results: { direct: result(32, 12), deliberate: result(41, 48) },
  },
  {
    id: 'allocation', family: 'reasoning', title: 'Distribuir três recursos',
    criterion: 'Alocar três recursos entre quatro pedidos sem exceder o estoque e satisfazer as prioridades e incompatibilidades declaradas.',
    samples: 50, results: { direct: result(38, 8), deliberate: result(44, 16) },
  },
  {
    id: 'normalize', family: 'code', title: 'Normalizar uma lista de nomes',
    criterion: 'Remover espaços externos e entradas vazias, preservar acentos e eliminar duplicatas sem alterar a ordem da primeira ocorrência.',
    samples: 50, results: { direct: result(34, 10), deliberate: result(43, 30) },
  },
  {
    id: 'boundary', family: 'code', title: 'Corrigir o limite de um laço',
    criterion: 'Corrigir o erro de índice sem mudar a saída esperada; o programa deve tratar listas vazias, unitárias e com vários itens.',
    samples: 50, results: { direct: result(40, 8), deliberate: result(46, 16) },
  },
  {
    id: 'group', family: 'code', title: 'Somar registros por categoria',
    criterion: 'Agrupar registros pela categoria e somar valores finitos, incluindo categorias repetidas; não modificar a lista de entrada.',
    samples: 50, results: { direct: result(36, 12), deliberate: result(44, 48) },
  },
  {
    id: 'conflict', family: 'evidence', title: 'Conciliar dois documentos',
    criterion: 'Identificar a afirmação conflitante entre dois documentos inventados, atribuir cada versão ao documento correto e preservar a incerteza.',
    samples: 50, results: { direct: result(29, 12), deliberate: result(39, 48) },
  },
  {
    id: 'missing', family: 'evidence', title: 'Detectar uma informação ausente',
    criterion: 'Responder somente ao que consta em três notas inventadas e declarar que a data solicitada não foi fornecida, sem inventar uma data.',
    samples: 50, results: { direct: result(33, 10), deliberate: result(42, 30) },
  },
  {
    id: 'attribution', family: 'evidence', title: 'Vincular afirmações às fontes',
    criterion: 'Associar três afirmações aos trechos corretos de quatro fontes inventadas e marcar uma quarta afirmação como sem suporte.',
    samples: 50, results: { direct: result(37, 8), deliberate: result(44, 16) },
  },
]);

function normalizeOptions(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new TypeError('Os filtros devem ser um objeto.');
  const { family = 'all', metric = 'success', strategies = STRATEGIES.map(item => item.id) } = options;
  if (family !== 'all' && !FAMILIES.some(item => item.id === family)) throw new RangeError('Família de benchmark desconhecida.');
  // "budget" is a convenient alias; returned metadata always uses "effort".
  const normalizedMetric = metric === 'budget' ? 'effort' : metric;
  if (!METRICS.some(item => item.id === normalizedMetric)) throw new RangeError('Métrica de benchmark desconhecida.');
  if (!Array.isArray(strategies) || !strategies.length || strategies.some(id => !STRATEGIES.some(item => item.id === id))) throw new RangeError('Selecione pelo menos uma estratégia válida.');
  if (new Set(strategies).size !== strategies.length) throw new RangeError('As estratégias não podem se repetir.');
  return { family, metric: normalizedMetric, strategies: [...strategies] };
}

/** One row per task. Values use the selected metric; counts remain available. */
export function getBenchmarkRows(options = {}) {
  const { family, metric, strategies } = normalizeOptions(options);
  const unit = METRICS.find(item => item.id === metric).unit;
  return TASKS.filter(task => family === 'all' || task.family === family).map(task => ({
    id: task.id, family: task.family, title: task.title, criterion: task.criterion,
    samples: task.samples, metric, unit,
    results: Object.fromEntries(strategies.map(id => {
      const data = task.results[id];
      return [id, { ...data, value: metric === 'success' ? data.percent : data.effort }];
    })),
  }));
}

/** Aggregates counts first; averages effort with each task's case count. */
export function getBenchmarkSummary(options = {}) {
  const filters = normalizeOptions(options);
  const rows = getBenchmarkRows(filters);
  const unit = METRICS.find(item => item.id === filters.metric).unit;
  const results = Object.fromEntries(filters.strategies.map(id => {
    const passed = rows.reduce((sum, row) => sum + row.results[id].passed, 0);
    const total = rows.reduce((sum, row) => sum + row.results[id].total, 0);
    const percent = passed / total * 100;
    const effort = rows.reduce((sum, row) => sum + row.results[id].effort * row.results[id].total, 0) / total;
    return [id, { passed, total, percent, effort, value: filters.metric === 'success' ? percent : effort }];
  }));
  return {
    family: filters.family, metric: filters.metric, unit, taskCount: rows.length,
    samples: rows.reduce((sum, row) => sum + row.samples, 0), results,
  };
}

/** A portable artifact containing the method, filters, rows and aggregation. */
export function getBenchmarkExport(options = {}) {
  const filters = normalizeOptions(options);
  return {
    schemaVersion: 1,
    kind: 'fictional-illustration',
    methodology: JSON.parse(JSON.stringify(BENCHMARK_METHOD)),
    filters,
    families: FAMILIES.filter(item => filters.family === 'all' || item.id === filters.family).map(item => ({ ...item })),
    strategies: filters.strategies.map(id => ({ ...STRATEGIES.find(item => item.id === id) })),
    metric: { ...METRICS.find(item => item.id === filters.metric) },
    rows: getBenchmarkRows(filters),
    summary: getBenchmarkSummary(filters),
  };
}

/** Downloads in a browser and returns the exact file contents in every runtime. */
export function downloadBenchmarkJSON(options = {}) {
  const data = getBenchmarkExport(options);
  const file = {
    filename: `aresta01-ilustracao-${data.filters.family}-${data.filters.metric}.json`,
    mime: 'application/json;charset=utf-8',
    content: JSON.stringify(data, null, 2),
  };
  if (typeof document !== 'undefined' && typeof Blob !== 'undefined' && typeof URL.createObjectURL === 'function') {
    const url = URL.createObjectURL(new Blob([file.content], { type: file.mime }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.filename;
    try { anchor.click(); } finally { URL.revokeObjectURL(url); }
  }
  return file;
}

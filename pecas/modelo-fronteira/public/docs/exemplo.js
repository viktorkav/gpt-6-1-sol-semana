// Simulação local. Aresta 01 e Nór Research são fictícios.
// Baixe este arquivo e engine.js na mesma pasta; execute node exemplo.js.
import { createMap, solvePath, DATASETS, analyzeData } from './engine.js';

for (const algorithm of ['astar', 'dijkstra']) {
  const result = solvePath({ blocked: createMap('passagem'), algorithm });
  console.log(algorithm, {
    found: result.found,
    movements: result.cost,
    exploredCells: result.visited.length,
    path: result.path,
  });
}

for (const scenario of ['estavel', 'atipico']) {
  const result = analyzeData(DATASETS[scenario].csv);
  console.log(scenario, {
    slope: result.slope,
    intercept: result.intercept,
    r2: result.r2,
    rmse: result.rmse,
    predictionFor12: result.prediction,
    warnings: result.warnings,
  });
}

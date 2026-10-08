# Aresta 01 / Nór Research

Página de um modelo e laboratório fictícios, com benchmarks ilustrativos e um laboratório local de A*/Dijkstra e regressão linear.

Esta é a entrega revisada em 7 de outubro de 2026, parte do experimento de sete peças com GPT-6.1 Sol. Configuração solicitada: `gpt-6.1-sol`, `ultra`, `priority`; não há recibo independente do backend. A exportação adapta apenas o empacotamento e as instruções. O código visual e os assets de execução foram preservados.

## Executar

Requer Node.js 22.12+ ou 24+.

```sh
npm ci
npm run dev
```

Abra `http://127.0.0.1:4317/`. `npm run build` gera o site estático; `npm run example` executa o exemplo do laboratório.

Modelo, laboratório e benchmarks são fictícios. Não há inferência ou chamada a um modelo de IA. O laboratório executa os algoritmos sobre entradas reais do visitante. A documentação funcional e as fontes estão em `public/docs/index.html`. Fontes Space Grotesk/IBM Plex Mono seguem OFL; ícones Phosphor seguem sua licença. Arte da peça preservada, sem concessão de licença comercial.

Consulte [direitos e origens](DIREITOS-E-ORIGENS.md). Os prompts e o feedback ficam na Régua para membros; não estão nesta distribuição.

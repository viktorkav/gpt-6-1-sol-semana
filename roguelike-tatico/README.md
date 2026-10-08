# Cartógrafos do Eclipse

Roguelike tático original: três classes, três encontros, rotas/recompensas e um chefe. As regras incluem altura, recursos, empurrões, prévias e intenções inimigas.

Esta é a entrega revisada em 7 de outubro de 2026, parte do experimento de sete peças com GPT-6.1 Sol. Configuração solicitada: `gpt-6.1-sol`, `ultra`, `priority`; não há recibo independente do backend. A exportação adapta apenas o empacotamento e as instruções. O código visual e os assets de execução foram preservados.

## Executar

Sem build ou dependências de produção.

```sh
python3 -m http.server 48607 --bind 127.0.0.1
```

Abra `http://127.0.0.1:48607/`; para reproduzir uma run, use `?seed=4733`.

Selecione um aliado, escolha uma ação e confira a prévia antes de confirmar. Cada aliado tem duas ações; termine o turno para os inimigos agirem. Atalhos: `1/2/3`, `M`, `A`, `H`, `G`, `Enter`, `Esc` e `Espaço`. Áudio opcional, inicialmente desativado. Sprites/terreno/cenários gerados em `gpt-image-2.5-sunburst` foram preservados. Poses mudam por estado; não há caminhada contínua. A quarta arena usa composição dos assets recebidos. Inspiração: [Final Fantasy Tactics — página oficial](https://final-fantasy-tactics-the-ivalice-chronicles.square-enix-games.com/en-us); personagens, mundo e marca são originais, sem assets de FFT.

Consulte [direitos e origens](DIREITOS-E-ORIGENS.md). Os prompts e o feedback ficam na Régua para membros; não estão nesta distribuição.

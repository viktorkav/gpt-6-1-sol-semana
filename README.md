# GPT-6.1 Sol: sete peças depois de uma semana de uso

Quatro sites, um roguelike tático e dois cortes da minha live, produzidos no experimento comentado no canal [ViktorKav](https://www.youtube.com/@vkav).

Os sites e o jogo incluem a revisão após meu feedback. Os dois vídeos conservam a primeira entrega editorial. A configuração solicitada foi GPT-6.1 Sol, raciocínio ultra e aceleração priority, com ferramentas e subagentes disponíveis. O registro local não comprova independentemente a identidade do backend.

## Abrir as entregas

Baixe [pecas-web.zip](https://github.com/viktorkav/gpt-6-1-sol-semana/releases/download/entregas-2026-10-08/pecas-web.zip), extraia e execute dentro da pasta extraída:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8080`. As páginas funcionam como demonstrações locais.

| Peça | Código e instruções | O que experimentar |
| --- | --- | --- |
| Home ViktorKav | [pecas/home-viktorkav](pecas/home-viktorkav/) | As trilhas IA, Games e Construir e a busca no acervo |
| Contra-Maré | [pecas/festival](pecas/festival/) | Selecionar artistas, montar uma agenda e exportar o calendário |
| Aresta 01 | [pecas/modelo-fronteira](pecas/modelo-fronteira/) | Montar obstáculos e comparar buscas de rota no laboratório |
| Trama OS | [pecas/sistema-agentico](pecas/sistema-agentico/) | Executar uma missão, pausar, intervir e reverter uma ação |
| Cartógrafos do Eclipse | [pecas/roguelike-tatico](pecas/roguelike-tatico/) | Mover personagens, atacar e avançar pelas arenas |
| V1: Remotion e critério | [pecas/vertical](pecas/vertical/) | [Assistir/baixar MP4](https://github.com/viktorkav/gpt-6-1-sol-semana/releases/download/entregas-2026-10-08/Vertical1_EXPORT.mp4) |
| H2: Custo por tarefa | [pecas/horizontal](pecas/horizontal/) | [Assistir/baixar MP4](https://github.com/viktorkav/gpt-6-1-sol-semana/releases/download/entregas-2026-10-08/H2-custo-por-tarefa-entrega1.mp4) |

Os [arquivos da release](https://github.com/viktorkav/gpt-6-1-sol-semana/releases/tag/entregas-2026-10-08) também incluem os projetos do DaVinci Resolve e as composições isoladas do Remotion:

- [V1-projeto-editavel.zip](https://github.com/viktorkav/gpt-6-1-sol-semana/releases/download/entregas-2026-10-08/V1-projeto-editavel.zip)
- [H2-projeto-editavel.zip](https://github.com/viktorkav/gpt-6-1-sol-semana/releases/download/entregas-2026-10-08/H2-projeto-editavel.zip)

Os DRP/DRT exigem relink das mídias. Os pacotes explicam a organização; a gravação integral da live não está embutida. Fonte pública: [live de 07/10/2026](https://youtu.be/Vl6io32bFLE).

V1 tem 2.185 quadros, 72,833 s de imagem, 1080×1920 e 30 fps. O arquivo disponível é uma reexportação, `Vertical1_EXPORT.mp4`, com hash próprio e pequeno padding de áudio. H2 tem 8.748 quadros, 291,6 s, 1920×1080 e 30 fps, com nove apoios Remotion de 15 s. A distância máxima de 40 s é entre os inícios dos apoios.

## Prompts e avaliação

O [artigo em Explorações da Régua](https://viktorkav.com.br/regua/exploracoes/gpt-6-1-sol-semana) reúne os prompts, o feedback da revisão, as referências e minha avaliação. A Régua é disponibilizada aos membros do canal. [Vira membro](https://www.youtube.com/@vkav/join).

Este experimento é uma exploração de entregas, com direção e avaliação humanas. Não altera o placar da bateria v2.

## Condições das demonstrações

O festival, a participação dos artistas e os ingressos são fictícios. Aresta 01 e seus benchmarks são fictícios; o laboratório executa algoritmos locais. Trama OS simula ações no navegador. A home é uma proposta experimental. O jogo é original e usa poses estáticas por estado.

Fotos, fontes, retrato, marca e outros assets têm titulares e condições próprias. Consulte `DIREITOS-E-FONTES.md` e os documentos de cada peça. A publicação não concede uma licença geral sobre esses materiais. Os prompts permanecem no artigo da Régua; o gerador particular de tags do canal não integra esta entrega.

Os originais foram preservados. As adaptações de empacotamento tornam caminhos e dependências portáteis e retiram documentos privados do pacote; os documentos de publicação registram essas mudanças.

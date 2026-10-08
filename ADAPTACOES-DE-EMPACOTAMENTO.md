# Adaptações de empacotamento

A exportação foi construída em cópias isoladas. Os arquivos originais do experimento foram preservados. Os quatro sites e o jogo são a revisão 1 após feedback; V1/H2 são as primeiras entregas editoriais.

- O código visual dos quatro sites e os cinco arquivos de execução do jogo foram copiados byte a byte. O build das cópias passou. Fontes, fotografias, artes, catálogo e assets de execução foram preservados.
- A home mantém a verificação dos hashes/dimensões da arte no build por um manifesto mínimo público; recibos privados, IDs, custos e URLs temporárias não integram esse manifesto.
- O Trama OS usa páginas públicas resumidas de notas/referências, mantendo os links da interface. Seu build deixou de copiar relatórios brutos, logs, capturas e documentos privados para public. O código visual e o motor da demo são os originais.
- O manifesto de arte do jogo aponta para seu documento público de origens em lugar do recibo privado. Esse campo de procedência não altera sprites, âncoras ou regras.
- Os bundles Remotion usam uma dependência local contendo somente Quadro e ponte.css, em lugar do caminho absoluto da máquina de produção. Não distribuem skills, prompts, bibliotecas completas ou documentos internos do design system.
- O contrato V1 aponta para o mapa de montagem portátil. Os mapas/cues preservam clocks e conteúdo; referências de caminhos absolutos nos JSONs foram substituídas pelos nomes de arquivo.
- DRP/DRT são cópias byte a byte dos projetos finais. Não embutem mídia e conservam referências de caminhos locais do projeto original. Importe em um projeto novo e faça relink. Os pacotes não incluem o bruto integral ou os renders intermediários de vários gigabytes.
- O MP4 V1 disponível é Vertical1_EXPORT.mp4, reexportação com hash próprio: vídeo2.185 frames/72,833333 s; padding AAC leva a duração do container a72,917333 s. Não é o mesmo binário do manifesto da primeira exportação. H2 corresponde ao hash registrado da entrega.
- Dependências, caches, estados de navegador, logs, screenshots brutos, recibos privados, feedback e prompts foram excluídos. Prompts/feedback são disponibilizados separadamente no artigo para membros da Régua.

Configuração solicitada: GPT-6.1 Sol, ultra, priority. Não há recibo independente do backend. Este experimento não altera o ranking da bateria v2.

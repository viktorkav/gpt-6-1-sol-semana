# Trama OS

Sistema operacional fictício para agentes, com missões locais que permitem pausa, intervenção, decisão, download, histórico e reversão.

Esta é a entrega revisada em 7 de outubro de 2026, parte do experimento de sete peças com GPT-6.1 Sol. Configuração solicitada: `gpt-6.1-sol`, `ultra`, `priority`; não há recibo independente do backend. A exportação adapta apenas o empacotamento e as instruções. O código visual e os assets de execução foram preservados.

## Executar

Requer Node.js 22.12+ ou 24+.

```sh
npm ci
npm run dev
```

Abra `http://127.0.0.1:4175/`. `npm run build` gera o site estático.

Não executa IA, contas, apps ou ações reais do sistema. A sessão se reinicia ao recarregar. As páginas de notas/referências da distribuição foram resumidas para manter os links da interface sem divulgar os documentos privados, logs, capturas ou o feedback. Código visual e motor são os da revisão entregue.

Consulte [direitos e origens](DIREITOS-E-ORIGENS.md). Os prompts e o feedback ficam na Régua para membros; não estão nesta distribuição.

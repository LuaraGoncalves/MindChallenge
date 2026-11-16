# MindChallenge Frontend

Interface web da plataforma MindChallenge, feita com React, TypeScript, Vite, Tailwind CSS, GSAP e Phaser.

## O que existe hoje

- Uma landing page do MindChallenge.
- Cards de categorias de jogos mentais.
- Uma demonstração interativa em Phaser.
- Catálogo carregado da API pelos endpoints `/api/games/groups` e `/api/games/extras`.

O acesso HTTP fica em `src/api/gameCatalog.ts`, e o hook `src/hooks/useGameCatalog.ts` gerencia o carregamento. O componente `MemoryGame` ainda é uma demonstração: não implementa partidas de memória nem envio de pontuações.

## Como rodar

Requisitos: Node.js 24 e npm. Execute os comandos dentro da pasta `frontend`, com a API iniciada em outro terminal.

```bash
npm ci
npm run dev
```

Abra `http://localhost:5173`. Durante o desenvolvimento, o Vite encaminha `/api` para `http://127.0.0.1:8080`. Para usar outra origem de API, configure `VITE_API_BASE_URL` conforme `.env.example` e reinicie o Vite. Essa variável é pública e não deve conter segredos.

Consulte o [README principal](../README.md) para iniciar o backend ou executar tudo com Docker.

## Scripts

- `npm run dev`: inicia o servidor local.
- `npm run build`: valida TypeScript e gera a build.
- `npm run lint`: executa o ESLint.
- `npm run preview`: abre a build gerada localmente.

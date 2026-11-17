# MindChallenge Frontend

Interface web da plataforma MindChallenge, feita com React, TypeScript, Vite, Tailwind CSS, GSAP, Motion e Phaser.

## O que existe hoje

- Um mural de aventuras com texturas de madeira e pergaminho.
- Categorias de jogos mentais com filtros e detalhes de cada desafio.
- Animações de entrada, fitas em movimento e interações com opção de pausa e suporte a movimento reduzido.
- Motion anima filtros, reorganização dos pergaminhos, detalhes dos desafios e bilhetes dos modos extras. GSAP mantém a sequência de abertura e Phaser mantém a demonstração.
- Uma demonstração interativa em Phaser.
- Catálogo carregado da API pelos endpoints `/api/games/groups` e `/api/games/extras`.

O acesso HTTP fica em `src/api/gameCatalog.ts`, e o hook `src/hooks/useGameCatalog.ts` gerencia o carregamento. O componente `MemoryGame` ainda é uma demonstração: não implementa partidas de memória nem envio de pontuações.

As imagens ficam em `public/assets`, com seus prompts de geração documentados no README da pasta. As fontes locais e suas licenças ficam em `public/fonts`. As decisões visuais estão no [guia de design](../DESIGN.md).

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

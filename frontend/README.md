# MindChallenge Frontend

Interface web da plataforma MindChallenge, feita com React, TypeScript, Vite, Tailwind CSS, GSAP, Motion e Phaser.

## O que existe hoje

- Um mural de aventuras com texturas de madeira e pergaminho.
- Painel `/admin` com login, cadastro de temas e personagens, upload de PNG/JPEG e ativação dos itens publicados no jogo. As credenciais ficam apenas no backend; veja o [guia de administração](../docs/ADMIN.md).
- Categorias de jogos mentais com filtros e detalhes de cada desafio.
- Animações de entrada, fitas em movimento e interações com opção de pausa e suporte a movimento reduzido.
- Motion anima filtros, reorganização dos pergaminhos, detalhes dos desafios e bilhetes dos modos extras. GSAP mantém a sequência de abertura e Phaser mantém a demonstração.
- Uma demonstração interativa em Phaser.
- Jogo da memória com personagens Pokémon, três dificuldades (6, 8 e 12 pares), tentativas, tempo, pausa, reinício e pontuação ao concluir.
- Catálogo carregado da API pelos endpoints `/api/games/groups` e `/api/games/extras`.

O acesso HTTP fica em `src/api/gameCatalog.ts`, e o hook `src/hooks/useGameCatalog.ts` gerencia o carregamento. O componente `MemoryGame` ainda é uma demonstração: não implementa partidas de memória nem envio de pontuações.

O jogo real fica em `src/features/memory`: `memoryMachine.ts` usa XState para as regras de turnos, bloqueios e pausas, enquanto `MemoryChallenge.tsx` apresenta o tabuleiro com Motion e usa o embaralhamento do Phaser. Abra **Modo Kids > Jogo da memória** no mural para jogar. A pontuação é exibida ao final, sem envio ao ranking online.

`src/api/pokemon.ts` consulta a [PokéAPI](https://pokeapi.co/docs/v2) sem chave, guarda os dados públicos em cache e prepara as imagens antes de iniciar a partida. A primeira carga depende da conexão com a PokéAPI e o repositório de sprites; falhas exibem uma opção de tentar novamente. Não há chamadas à API ao virar cada carta. Pokémon e suas imagens pertencem aos respectivos titulares.

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

- `npm test`: verifica as regras do jogo da memória com o executor de testes do Node.js 24.

- `npm run dev`: inicia o servidor local.
- `npm run build`: valida TypeScript e gera a build.
- `npm run lint`: executa o ESLint.
- `npm run preview`: abre a build gerada localmente.

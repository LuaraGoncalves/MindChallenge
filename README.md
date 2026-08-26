# MindChallenge

Plataforma web de jogos mentais com visual arcade, feita com React, Vite, Phaser e Spring Boot.

## Sobre o projeto

O MindChallenge e uma aplicacao para explorar desafios cognitivos, como memoria, logica, reflexos, puzzles e ranking de pontuacoes. O frontend tem uma interface inspirada em jogos arcade, enquanto o backend fornece o catalogo de jogos, modos extras, desafio diario e envio de pontuacoes.

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- GSAP
- Phaser
- Java 17
- Spring Boot
- Maven

## Estrutura

```text
MindChallenge/
├── backend/   # API Spring Boot
└── frontend/  # Interface React/Vite
```

## Como rodar

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend, em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse:

```text
http://127.0.0.1:5173/
```

## Principais rotas da API

- `GET /api/health`
- `GET /api/games/groups`
- `GET /api/games/extras`
- `GET /api/games/daily`
- `GET /api/games/{slug}`
- `GET /api/rankings`
- `POST /api/rankings`

## Validacao

Backend:

```bash
cd backend
mvn test
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

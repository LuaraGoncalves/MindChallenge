# MindChallenge

MindChallenge é um projeto de plataforma de jogos mentais com visual arcade, em desenvolvimento, feito com React e Spring Boot.

## Estado do projeto

- Implementado: interface arcade, catálogo fornecido pela API, demonstração interativa em Phaser e endpoints de ranking.
- Preparado no código: persistência com JPA/Flyway, PostgreSQL no Docker Compose e workflow de validação no GitHub Actions.
- Pendente: jogos completos, integração do placar com o frontend e validação de partidas para evitar pontuações inventadas.
- A configuração Docker ainda precisa ser validada com os três serviços funcionando juntos. A existência dos arquivos não comprova um deploy concluído.

## Requisitos

- Desenvolvimento local: JDK 17, Maven, Node.js 24 e npm.
- Execução em contêineres: Docker Desktop iniciado, com suporte a contêineres Linux e Docker Compose.
- Portas disponíveis: `5173` para a interface e `8080` para a API.

## Tecnologias

- React, TypeScript, Vite, Tailwind CSS, GSAP e Phaser
- Java 17, Spring Boot, Spring Data JPA, Flyway e PostgreSQL
- Docker, Docker Compose e GitHub Actions

## Estrutura

```text
MindChallenge/
├── backend/                 # API Spring Boot em camadas
│   └── src/main/java/com/mindchallenge
│       ├── api/             # Controllers, DTOs e configurações web
│       ├── application/     # Regras de uso da aplicação
│       ├── domain/          # Modelos e contratos do domínio
│       ├── infrastructure/  # Banco e implementações externas
│       └── shared/          # Erros e utilitários compartilhados
├── frontend/                # Interface React/Vite
├── docker-compose.yml       # Banco, API e site juntos
└── .github/workflows/ci.yml # Validação automática
```

## Rodar com Docker

Na raiz do projeto, crie o arquivo de configuração somente se ele ainda não existir. No PowerShell:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Edite `POSTGRES_PASSWORD` no `.env`, substituindo `change-me` por uma senha própria. Não publique esse arquivo. Depois:

```bash
docker compose up --build
```

Acesse:

```text
http://localhost:5173
```

A API fica em:

```text
http://localhost:8080/api/health
```

## Rodar em desenvolvimento

Sem variáveis de banco, o backend usa H2 em memória: as pontuações desaparecem ao encerrar o processo. O Compose configura PostgreSQL com volume persistente. `docker compose down` preserva esse volume; adicionar `-v` remove os dados.

Backend:

```bash
cd backend
mvn spring-boot:run
```

Frontend, em outro terminal:

```bash
cd frontend
npm ci
npm run dev
```

## Variáveis de ambiente

Backend:

- `PORT`: porta da API. Padrão: `8080`.
- `DATABASE_URL`: URL JDBC do banco.
- `DATABASE_USERNAME`: usuário do banco.
- `DATABASE_PASSWORD`: senha do banco.
- `CORS_ALLOWED_ORIGINS`: domínios permitidos para acessar a API.

Frontend:

- `VITE_API_BASE_URL`: URL da API quando frontend e backend ficam em domínios diferentes. Vazio usa o mesmo domínio. No desenvolvimento, o proxy do Vite encaminha as chamadas à API; no Docker, o Nginx faz esse encaminhamento.

## Principais rotas da API

- `GET /api/health`
- `GET /actuator/health`
- `GET /api/games/groups`
- `GET /api/games/extras`
- `GET /api/games/daily`
- `GET /api/games/{slug}`
- `GET /api/rankings`
- `GET /api/rankings/{gameSlug}`
- `POST /api/rankings`

## Validação

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

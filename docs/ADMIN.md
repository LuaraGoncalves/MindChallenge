# Administração do MindChallenge

O painel fica em `/admin`. Ele gerencia temas e personagens do jogo da memória e usa uma única conta definida no backend. Não existe cadastro público de administradores e não há usuário ou senha padrão.

## Primeiro acesso com Docker

1. Abra o `.env` da raiz no seu editor. Ele é privado e não deve ser enviado ao GitHub.
2. Preencha `ADMIN_USERNAME` com seu usuário e `ADMIN_PASSWORD` com uma senha própria de pelo menos 12 caracteres e no máximo 72 bytes. Use uma senha exclusiva. Se usar caracteres especiais de interpolação do Compose, delimite o valor com aspas simples no `.env`.
3. No PowerShell, dentro da pasta do projeto, execute:

```powershell
docker compose up --build -d backend frontend
```

4. Aguarde a API iniciar e abra `http://localhost:5173/admin`.

Se ambas as variáveis estiverem vazias, o jogo continua funcionando, mas nenhuma conta pode entrar no painel. Uma configuração parcial ou senha fora do limite impede a inicialização da API, para não ativar uma conta com configuração inválida. Para trocar as credenciais, edite o `.env` e recrie o backend. As sessões anteriores não sobrevivem ao reinício.

## Cadastro de coleções

1. Na seção **Temas**, crie um tema, por exemplo o nome da coleção desejada.
2. Na seção **Personagens**, informe nome, tema e imagem. É possível enviar PNG/JPEG de até 2 MB e 4 milhões de pixels ou usar uma URL HTTPS.
3. Marque os cadastros que devem ficar ativos. Desativar um tema retira toda a coleção da lista pública; desativar um personagem o retira dos próximos sorteios.
4. No mural, abra **Modo Kids > Jogo da memória** e escolha o tema no campo **Coleção**.

São necessários 6 personagens ativos diferentes para o nível fácil, 8 para o médio e 12 para o difícil. Coleções abaixo do mínimo ficam indisponíveis para iniciar. O backend confere essas condições novamente ao sortear a partida. A opção original de Pokémon via PokéAPI continua disponível.

É possível editar e excluir personagens e temas. Um tema com personagens vinculados não pode ser excluído: primeiro exclua os personagens ou transfira-os para outro tema. As imagens enviadas são mantidas no armazenamento, inclusive quando um cadastro é removido, evitando apagar arquivos eventualmente compartilhados.

## Sessão e proteção

- Todas as rotas de cadastro `/api/admin/**` exigem autenticação e permissão de administrador. As exceções públicas são a preparação de CSRF e o processamento de login.
- A senha configurada é codificada com BCrypt na inicialização; não é enviada ao frontend. O navegador usa uma sessão com cookie HttpOnly e SameSite Strict, sem token de autenticação no localStorage.
- Gravações e login exigem token CSRF. Há limite de dez tentativas de login por minuto por endereço visto pelo servidor.
- A sessão expira após 30 minutos de inatividade. **Sair** invalida a sessão no backend.
- Em produção, sirva o site por HTTPS e defina `SESSION_COOKIE_SECURE=true`. Prefira frontend e API no mesmo domínio com proxy, como no Compose; a sessão Strict não foi configurada para sites de domínios diferentes.

As imagens e os personagens ativos destinados ao jogo são públicos. A proteção do painel restringe o cadastro, não transforma as imagens em arquivos privados.

## Dados e arquivos

O Flyway cria `character_themes` e `memory_characters`. O Compose usa PostgreSQL para esses registros e o volume `character-images` para arquivos enviados. Faça backup do banco e das imagens em conjunto. `docker compose down -v` apaga volumes: não o use para uma atualização comum.

Sem Docker, o backend usa `IMAGES_DIRECTORY` (padrão `./uploads`). As credenciais devem ser variáveis do processo Java ou da IDE: `mvn spring-boot:run` não lê o `.env` do Compose automaticamente. O H2 padrão é temporário; para guardar cadastros entre reinícios, configure PostgreSQL.

## Validação

```powershell
cd backend
mvn test
cd ..\frontend
npm test
npm run lint
npm run build
```

Os testes do backend usam banco e credenciais próprios de teste, sem acessar seu banco de produção.

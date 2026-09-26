# Guia de Deploy e Disponibilidade Contínua em Nuvem 24/7

> Conforme Seção 13 da skill [`formacao-design-platform-skill.md`](file:///c:/Users/luidt/OneDrive/escola/SISTEMA-DESIGNER-SUCESSO/.agents/SKILL/formacao-design-platform-skill.md).
> **Requisito inegociável:** a plataforma deve continuar acessível mesmo com o computador local do administrador desligado.

---

## 1. Preparação do Ambiente e Dependências

Para executar em qualquer servidor Linux/Docker ou máquina local:

```bash
# 1. Clonar repositório
git clone <url-do-repositorio>
cd SISTEMA-DESIGNER-SUCESSO

# 2. Instalar dependências de produção
npm install --production

# 3. Inicializar e semear o banco de dados
npm run db:init
npm run db:seed
```

---

## 2. Variáveis de Ambiente (`.env`)

Crie o arquivo `.env` na raiz do projeto configurando:

```env
PORT=3000
NODE_ENV=production
JWT_SECRET=sua-chave-criptografica-muito-segura-e-longa-2026
DATABASE_PATH=./database/escola_design.sqlite
```

---

## 3. Deploy em Nuvem (Render / Railway / Fly.io)

### Opção A: Render (Hospedagem Gratuita/Gerenciada 24/7)
1. Crie uma conta em [render.com](https://render.com).
2. Clique em **New +** > **Web Service**.
3. Conecte seu repositório GitHub.
4. Defina:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Adicione um **Persistent Disk** montado em `/database` para persistir o banco SQLite entre reinicializações.
6. Configure as variáveis de ambiente (`JWT_SECRET`, `NODE_ENV=production`).
7. Clique em **Create Web Service**. A plataforma gerará uma URL HTTPS gratuita (ex: `https://escola-design.onrender.com`).

### Opção B: Docker Container
Um `Dockerfile` pode ser criado com:
```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run db:init && npm run db:seed
EXPOSE 3000
VOLUME ["/app/database"]
CMD ["node", "backend/server.js"]
```

---

## 4. Domínio Próprio e HTTPS

1. No painel do provedor de nuvem (Render, Railway, Cloudflare), acesse a aba **Custom Domains**.
2. Adicione seu domínio (ex: `aprenda.escola.design`).
3. No seu registrador de DNS (Registro.br, Cloudflare, GoDaddy), crie um apontamento:
   - Tipo `CNAME` apontando para o endereço fornecido pelo host.
4. O certificado SSL/TLS (HTTPS) é emitido e renovado de forma 100% automática via Let's Encrypt.

---

## 5. Rotina de Backup e Restauração de Dados

### Rotina de Backup Periódico:
O banco de dados relacional é um arquivo SQLite único (`database/escola_design.sqlite`) com suporte a WAL. Para realizar cópia de segurança em produção sem travar a aplicação:

```bash
# Script de backup seguro com timestamp:
sqlite3 database/escola_design.sqlite ".backup 'backups/escola_backup_$(date +%Y%m%d_%H%M%S).sqlite'"
```

Para automatizar diariamente via cron no servidor:
```bash
0 3 * * * sqlite3 /app/database/escola_design.sqlite ".backup '/app/backups/escola_backup_$(date +\%Y\%m\%d).sqlite'"
```

### Procedimento de Restauração:
1. Parar a aplicação temporariamente (`pm2 stop server` ou desligar container).
2. Substituir o arquivo danificado pelo backup:
   ```bash
   cp backups/escola_backup_20260926.sqlite database/escola_design.sqlite
   ```
3. Reiniciar a aplicação:
   ```bash
   npm start
   ```

---

## 6. Procedimento de Atualização em Produção (Zero Downtime)

Para atualizar o sistema sem perda de dados:
```bash
# 1. Puxar alterações de código
git pull origin main

# 2. Instalar novas dependências caso haja
npm install --production

# 3. Executar migrations (sem deletar dados existentes)
node database/init.js

# 4. Reiniciar processo
pm2 reload server
```

---

## 7. Solução de Problemas Comuns (Troubleshooting)

- **Erro de Porta em Uso (`EADDRINUSE`):**
  Defina uma porta alternativa na variável de ambiente: `PORT=3005 npm start`.
- **Banco travado (`database locked`):**
  O modo WAL já está ativado no `database/db.js` (`PRAGMA journal_mode = WAL;`) para permitir leituras concorrentes ilimitadas durante escritas.
- **Sessão Expirada:**
  Tokens JWT expiram em 24h. O usuário só precisa relogar ou selecionar seu perfil no seletor superior.

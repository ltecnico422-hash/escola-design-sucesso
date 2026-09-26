# Escola Digital de Design - Dockerfile para Deploy Contínuo 24/7
FROM node:24-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install --production

# Copiar código-fonte
COPY . .

# Inicializar e semear banco se não existir
RUN node database/init.js && node database/seed.js

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "backend/server.js"]

# Imagem base oficial do Node.js LTS (Alpine Linux para imagem leve e segura)
FROM node:20-alpine AS base

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências de produção
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar e utilizar usuário não-root por segurança
USER node

# Expor a porta da aplicação
EXPOSE 3000

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Ponto de entrada
CMD ["node", "server.js"]

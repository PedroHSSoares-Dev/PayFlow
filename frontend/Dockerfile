# ============================================================
# Stage 1 — Build (Node.js)
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Argumentos de build injetados pelo docker-compose (ou --build-arg)
ARG VITE_DB_HOST=db
ARG VITE_APP_ENV=production
ARG VITE_APP_TITLE=PayFlow Dashboard

# Expõe os args como variáveis de ambiente para o Vite ler durante o build
ENV VITE_DB_HOST=$VITE_DB_HOST
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_APP_TITLE=$VITE_APP_TITLE

# Instala dependências (usa cache de camada quando package.json não muda)
COPY package.json ./
RUN npm install --frozen-lockfile

# Copia o restante do código e gera o bundle de produção
COPY . .
RUN npm run build

# ============================================================
# Stage 2 — Serve (nginx)
# ============================================================
FROM nginx:alpine AS runner

# Remove a configuração padrão do nginx e adiciona a nossa
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos gerados pelo Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

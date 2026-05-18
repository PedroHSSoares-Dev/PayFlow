# PayFlow Dashboard — Docker Compose

Dashboard de plataforma de pagamentos para e-commerce construído com **React + PostgreSQL**, empacotado em dois containers Docker orquestrados com Docker Compose.

---

## Estrutura do Projeto

```
.
├── docker-compose.yml          # Orquestração dos dois containers
├── .env.example                # Template de variáveis de ambiente
├── README.md
│
├── db/
│   └── init.sql                # Criação da tabela + 15 registros de exemplo
│
└── frontend/
    ├── Dockerfile              # Build multi-stage: Node.js → nginx
    ├── nginx.conf              # Configuração nginx com SPA mode
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── data/
        │   └── transactions.js   # 15 transações mockadas em R$
        └── components/
            ├── Header.jsx        # Logo + status de conexão com DB
            ├── KPICards.jsx      # 4 cards de métricas
            ├── TransactionsTable.jsx
            └── PaymentChart.jsx  # Gráfico de barras CSS-only
```

---

## Arquitetura

```
┌───────────────────────────────────────────────────┐
│              payflow-network  (bridge)            │
│                                                   │
│  ┌──────────────────────┐  ┌────────────────────┐ │
│  │  frontend            │  │  db                │ │
│  │  nginx:alpine        │  │  postgres:15-alpine│ │
│  │  porta 80 → :80      │  │  porta 5432        │ │
│  │                      │  │  (somente interno) │ │
│  │  depends_on: db      │  │  volume nomeado    │ │
│  │  (service_healthy)   │  │  healthcheck:      │ │
│  │                      │  │  pg_isready        │ │
│  └──────────────────────┘  └────────────────────┘ │
└───────────────────────────────────────────────────┘
```

---

## Comandos Utilizados

### 1. Rodar localmente com Docker Compose

```bash
# 1. Copiar as variáveis de ambiente
cp .env.example .env

# 2. Subir os dois containers com build
docker compose up --build

# Alternativa: rodar em background (modo detached)
docker compose up --build -d

# Acompanhar os logs em tempo real
docker compose logs -f

# Ver status dos containers
docker compose ps

# Parar os containers (mantém volumes)
docker compose down

# Parar e remover TUDO (incluindo volume do banco)
docker compose down -v
```

> Acesse a dashboard em: **http://localhost**

---

### 2. Criar Resource Group e ACR na Azure (az cli)

```bash
# Definir variáveis
RESOURCE_GROUP="rg-payflow"
LOCATION="eastus"
ACR_NAME="acrpayflow$RANDOM"   # nome único globalmente (sem hifens)

# Autenticar na Azure
az login

# Criar o Resource Group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Criar o Azure Container Registry (SKU Basic)
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Exibir o login server do ACR criado
az acr show \
  --name $ACR_NAME \
  --query loginServer \
  --output tsv
```

---

### 3. Build e push da imagem frontend para o ACR

```bash
# Login no ACR via Azure CLI
az acr login --name $ACR_NAME

# Build da imagem com os build args do Vite
docker build \
  --build-arg VITE_DB_HOST=db \
  --build-arg VITE_APP_ENV=production \
  --build-arg "VITE_APP_TITLE=PayFlow Dashboard" \
  -t $ACR_NAME.azurecr.io/payflow-frontend:latest \
  ./frontend

# Push para o ACR
docker push $ACR_NAME.azurecr.io/payflow-frontend:latest

# Verificar que a imagem chegou ao ACR
az acr repository list \
  --name $ACR_NAME \
  --output table

az acr repository show-tags \
  --name $ACR_NAME \
  --repository payflow-frontend \
  --output table
```

---

### 4. Criar ACI na Azure com os dois containers

```bash
# Recuperar credenciais do ACR
ACR_SERVER="$ACR_NAME.azurecr.io"
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

# Criar Container Group com o frontend
az container create \
  --resource-group $RESOURCE_GROUP \
  --name payflow-aci \
  --image $ACR_SERVER/payflow-frontend:latest \
  --registry-login-server $ACR_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --dns-name-label payflow-$(date +%s) \
  --ports 80 \
  --os-type Linux \
  --cpu 1 \
  --memory 1.5 \
  --environment-variables \
    VITE_DB_HOST=db \
    VITE_APP_ENV=production \
    "VITE_APP_TITLE=PayFlow Dashboard"

# Verificar status e obter FQDN público
az container show \
  --resource-group $RESOURCE_GROUP \
  --name payflow-aci \
  --query "{Status:instanceView.state, URL:ipAddress.fqdn}" \
  --output table

# Acompanhar logs do container em execução
az container logs \
  --resource-group $RESOURCE_GROUP \
  --name payflow-aci \
  --follow
```

---

### 5. Deletar todos os recursos ao final

```bash
# Opção 1: Deletar o Resource Group inteiro (remove ACR + ACI + tudo)
az group delete \
  --name $RESOURCE_GROUP \
  --yes \
  --no-wait

# Confirmar que o grupo foi removido
az group list --output table

# Opção 2: Deletar recursos individualmente
az container delete \
  --resource-group $RESOURCE_GROUP \
  --name payflow-aci \
  --yes

az acr delete \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --yes

az group delete \
  --name $RESOURCE_GROUP \
  --yes

# Limpeza local: parar containers e remover imagens
docker compose down -v
docker rmi $ACR_NAME.azurecr.io/payflow-frontend:latest
docker system prune -f
```

---

## Variáveis de Ambiente

| Variável           | Descrição                                      | Exemplo             |
|--------------------|------------------------------------------------|---------------------|
| `POSTGRES_USER`    | Usuário do banco PostgreSQL                    | `payflow`           |
| `POSTGRES_PASSWORD`| Senha do banco PostgreSQL                      | `payflow@2024`      |
| `POSTGRES_DB`      | Nome do banco de dados                         | `payflow_db`        |
| `VITE_DB_HOST`     | Host do banco (injetado no build do React)     | `db`                |
| `VITE_APP_ENV`     | Ambiente da aplicação (build arg)              | `production`        |
| `VITE_APP_TITLE`   | Título exibido na dashboard (build arg)        | `PayFlow Dashboard` |

---

## Tecnologias

| Camada     | Tecnologia            | Versão       |
|------------|-----------------------|--------------|
| Frontend   | React + Vite          | 18 / 5       |
| Servidor   | nginx                 | alpine       |
| Banco      | PostgreSQL            | 15-alpine    |
| Build      | Node.js               | 20-alpine    |
| Orquestração | Docker Compose      | v2           |
| Cloud      | Azure ACI + ACR       | —            |

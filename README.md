# PayFlow Dashboard

Dashboard de monitoramento de pagamentos para e-commerce, desenvolvido como projeto acadêmico de **Cloud Computing e Containers** na FIAP.

A aplicação é composta por dois containers orquestrados com Docker Compose: um frontend React servido pelo nginx, e um banco de dados PostgreSQL com dados de transações.

---

## O que a aplicação faz

A dashboard exibe métricas e transações de uma plataforma de pagamentos fictícia. Ao acessar `http://localhost`, você verá:

- **Header** com o logo PayFlow e um indicador de status de conexão com o banco (bolinha verde animada)
- **4 KPI Cards** calculados em tempo real a partir dos dados: total de transações, volume em R$, taxa de aprovação (%) e ticket médio
- **Tabela de transações** com ID, cliente, valor, status (Aprovado / Recusado / Pendente), método de pagamento (Pix / Cartão / Boleto) e data
- **Gráfico de barras** mostrando o volume por método de pagamento — construído puramente com CSS, sem nenhuma biblioteca de charts

Os dados são mockados diretamente no React (15 transações realistas em R$) e espelhados no banco PostgreSQL via script de inicialização.

---

## Arquitetura

```
┌──────────────────────────────────────────────────────┐
│                 payflow-network (bridge)              │
│                                                      │
│   ┌─────────────────────┐   ┌──────────────────────┐ │
│   │     frontend         │   │         db           │ │
│   │                      │   │                      │ │
│   │  nginx:alpine        │   │  postgres:15-alpine  │ │
│   │  porta 80 → :80      │   │  porta 5432          │ │
│   │                      │   │  (só interna)        │ │
│   │  React (Vite build)  │   │  volume nomeado      │ │
│   │  estáticos em /html  │   │  healthcheck:        │ │
│   │                      │   │  pg_isready          │ │
│   │  depends_on: db ✓    │   │                      │ │
│   └─────────────────────┘   └──────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

O container `frontend` só sobe depois que o `db` passa no healthcheck (`pg_isready`), garantindo que o banco esteja pronto antes da aplicação iniciar.

---

## Estrutura do projeto

```
PayFlow/
├── docker-compose.yml            # Orquestração dos dois containers
├── .env.example                  # Template de variáveis de ambiente
│
├── db/
│   └── init.sql                  # Cria a tabela e insere os 15 registros
│
└── frontend/
    ├── Dockerfile                # Build multi-stage (Node → nginx)
    ├── nginx.conf                # SPA mode, gzip, cache de assets
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx               # Componente raiz
        ├── index.css             # Design tokens e reset global
        ├── data/
        │   └── transactions.js   # 15 transações mockadas
        └── components/
            ├── Header.jsx        # Logo + status de conexão
            ├── KPICards.jsx      # 4 métricas principais
            ├── TransactionsTable.jsx
            └── PaymentChart.jsx  # Gráfico CSS-only (sem biblioteca)
```

---

## Container 1 — Frontend

O Dockerfile usa **build multi-stage** para manter a imagem final pequena:

**Stage 1 — Build (`node:20-alpine`)**
Instala as dependências e executa `npm run build`, gerando os arquivos estáticos otimizados na pasta `dist/`. As variáveis de ambiente do Vite (`VITE_DB_HOST`, `VITE_APP_ENV`, `VITE_APP_TITLE`) são injetadas neste momento via `ARG`/`ENV`, pois o Vite as embute no bundle durante o build — elas não existem em runtime.

**Stage 2 — Serve (`nginx:alpine`)**
Copia apenas a pasta `dist/` do stage anterior e a configuração do nginx. O resultado é uma imagem enxuta, sem Node.js nem código-fonte.

O `nginx.conf` está configurado para **SPA mode**: qualquer rota que não seja um arquivo estático é redirecionada para `index.html`, permitindo que o React Router (ou navegação futura) funcione corretamente.

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## Container 2 — Banco de dados

Usa a imagem oficial `postgres:15-alpine`. Na primeira vez que o container sobe, o PostgreSQL executa automaticamente qualquer script em `/docker-entrypoint-initdb.d/` — é assim que o `db/init.sql` é carregado.

O script cria a tabela `transactions`:

```sql
CREATE TABLE transactions (
    id             SERIAL PRIMARY KEY,
    customer_name  VARCHAR(100),
    amount         NUMERIC(10, 2),
    status         VARCHAR(20),   -- 'Aprovado' | 'Recusado' | 'Pendente'
    payment_method VARCHAR(20),   -- 'Pix' | 'Cartão' | 'Boleto'
    created_at     TIMESTAMP
);
```

O volume nomeado `postgres_data` garante que os dados persistam mesmo que o container seja recriado. A porta 5432 **não é exposta** para o host — o banco só é acessível de dentro da rede `payflow-network`.

---

## Como rodar localmente

**Pré-requisitos:** Docker e Docker Compose instalados.

```bash
# 1. Clonar o repositório
git clone https://github.com/PedroHSSoares-Dev/PayFlow.git
cd PayFlow

# 2. Copiar as variáveis de ambiente
cp .env.example .env

# 3. Subir os containers com build
docker compose up --build
```

Acesse em: **http://localhost**

```bash
# Rodar em background
docker compose up --build -d

# Ver logs em tempo real
docker compose logs -f

# Parar (mantém o volume do banco)
docker compose down

# Parar e apagar tudo, incluindo o banco
docker compose down -v
```

---

## Variáveis de ambiente

Todas as variáveis ficam no arquivo `.env` (copiado do `.env.example`):

| Variável | Usado por | Descrição |
|---|---|---|
| `POSTGRES_USER` | Container `db` | Usuário do PostgreSQL |
| `POSTGRES_PASSWORD` | Container `db` | Senha do PostgreSQL |
| `POSTGRES_DB` | Container `db` | Nome do banco de dados |
| `VITE_DB_HOST` | Build do frontend | Host do banco exibido no header |
| `VITE_APP_ENV` | Build do frontend | Ambiente (`production`, `development`) |
| `VITE_APP_TITLE` | Build do frontend | Título exibido na dashboard |

> As variáveis `VITE_*` são **build args** — elas são lidas pelo Vite na hora do build e embutidas no JavaScript. Alterar o `.env` depois do build não tem efeito; é necessário rebuildar com `docker compose up --build`.

---

## Deploy na Azure

### Criar Resource Group e Container Registry (ACR)

```bash
RESOURCE_GROUP="rg-payflow"
LOCATION="eastus"
ACR_NAME="acrpayflow$RANDOM"

az login
az group create --name $RESOURCE_GROUP --location $LOCATION

az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true
```

### Build e push da imagem para o ACR

```bash
az acr login --name $ACR_NAME

docker build \
  --build-arg VITE_DB_HOST=db \
  --build-arg VITE_APP_ENV=production \
  --build-arg "VITE_APP_TITLE=PayFlow Dashboard" \
  -t $ACR_NAME.azurecr.io/payflow-frontend:latest \
  ./frontend

docker push $ACR_NAME.azurecr.io/payflow-frontend:latest
```

### Criar o container na Azure (ACI)

```bash
ACR_SERVER="$ACR_NAME.azurecr.io"
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv)

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
  --memory 1.5

# Ver URL pública
az container show \
  --resource-group $RESOURCE_GROUP \
  --name payflow-aci \
  --query "{Status:instanceView.state, URL:ipAddress.fqdn}" \
  --output table
```

### Remover todos os recursos

```bash
# Remove o Resource Group e tudo dentro dele (ACR + ACI)
az group delete --name $RESOURCE_GROUP --yes --no-wait

# Limpeza local
docker compose down -v
docker rmi $ACR_NAME.azurecr.io/payflow-frontend:latest
```

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React + Vite | 18 / 5 |
| Servidor web | nginx | alpine |
| Banco de dados | PostgreSQL | 15-alpine |
| Runtime de build | Node.js | 20-alpine |
| Orquestração | Docker Compose | v2 |
| Cloud | Azure ACI + ACR | — |

# Inventory & POS System

A full-stack inventory management + point-of-sale system: Node/Express +
Prisma/PostgreSQL backend, React + Vite + Tailwind frontend.

## Features

- **Authentication** — JWT-based login, bootstrap-first-admin registration
- **Role-based access** — ADMIN / MANAGER / CASHIER / STAFF, enforced on both API routes and frontend navigation
- **Suppliers, Products, Categories, Customers** — full CRUD
- **Inventory** — manual stock adjustments, full movement ledger, low-stock alerts, stock valuation
- **Sales** — history, void with automatic stock restoration, PDF invoices
- **Purchases** — purchase orders (order → receive → stock update, or cancel)
- **POS terminal** — barcode/SKU/name lookup, cart, multi payment method checkout, printable receipt
- **Reports** — dashboard, sales/purchases/inventory reports, profit & loss, downloadable PDF
- **Excel import/export** — products and sales export to `.xlsx`; bulk product import from `.xlsx`
- **Barcode generation & printing** — single codes, per-product codes, printable label sheets
- **AI Dashboard & AI Chat** — narrative insights over your live store data, plus a chat assistant (falls back to a rule-based summary if no `AI_API_KEY` is configured)
- **WhatsApp integration structure** — Business Cloud API webhook (inbound stock lookups) + outbound invoice/low-stock notifications
- **Docker** — Dockerfiles for both services + `docker-compose.yml` for the full stack (Postgres included)

## Project structure

```
backend/
  prisma/schema.prisma   # full data model (User, Category, Supplier, Product,
                          #   Customer, Sale, SaleItem, Purchase, PurchaseItem,
                          #   StockMovement)
  prisma/seed.js         # demo admin/cashier users, categories, suppliers,
                          #   products, one sample sale
  src/routes/            # one router per module (auth, category, supplier,
                          #   product, inventory, customer, sales, purchase,
                          #   pos, reports, excel, barcode, ai, whatsapp)
  src/services/          # pdfService, excelService, barcodeService,
                          #   stockService, aiService, whatsappService
  src/middleware/        # auth (JWT), role (RBAC), errorHandler
  Dockerfile
frontend/
  src/pages/              # Login, Dashboard, Products, Categories, Suppliers,
                           #   Inventory, Purchases, Sales, POS, Customers,
                           #   Reports, Barcode, AIAssistant, Users
  src/context/AuthContext.jsx
  src/components/         # Layout (sidebar nav), ProtectedRoute
  Dockerfile, nginx.conf
docker-compose.yml
```

## Run with Docker (recommended)

```
docker compose up --build
```

This starts Postgres, runs backend migrations automatically on boot, and
serves the frontend on nginx.

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Postgres: localhost:5432 (postgres / postgres / inventory_pos)

Seed demo data (run once, after the containers are up):
```
docker compose exec backend npm run seed
```

Login with the seeded accounts:
- `admin@store.com` / `Admin@123` (ADMIN)
- `cashier@store.com` / `Cashier@123` (CASHIER)

To enable AI features or WhatsApp, edit the `environment:` block for the
`backend` service in `docker-compose.yml` (or use an `.env` file with
`env_file:`) and restart:
```
docker compose up -d --build backend
```

## Run locally (without Docker)

**Backend**
```
cd backend
cp .env.example .env   # edit DATABASE_URL to point at your Postgres instance
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

**Frontend**
```
cd frontend
cp .env.example .env   # set VITE_API_URL if backend isn't on localhost:4000
npm install
npm run dev
```

## Deployment notes

- The backend Dockerfile runs `prisma migrate deploy` on container start, so
  schema changes roll out automatically on redeploy — just make sure
  `DATABASE_URL` points at a durable, backed-up Postgres instance in
  production (a managed database is strongly recommended over the `db`
  service in `docker-compose.yml`, which is intended for local/dev use).
- Set a strong, unique `JWT_SECRET` in production — never reuse the example
  value.
- The frontend is a static build served by nginx; `VITE_API_URL` is baked in
  at build time via a Docker build arg, so rebuild the frontend image if the
  backend's public URL changes.
- For barcode generation, the backend image installs `canvas`'s native
  dependencies (`cairo`, `pango`, etc.) — if deploying outside the provided
  Dockerfile, make sure your host has these libraries available.
- `AI_API_KEY` and the WhatsApp credentials are optional; both features
  degrade gracefully (rule-based insights, and a webhook that simply won't
  be reachable) when left unset.

## REST API

All endpoints are namespaced under `/api` and (except `/auth/login`,
`/auth/register` for the first admin, and the WhatsApp webhook) require a
`Authorization: Bearer <token>` header obtained from `/api/auth/login`.

| Module | Base path |
|---|---|
| Auth & Users | `/api/auth` |
| Categories | `/api/categories` |
| Suppliers | `/api/suppliers` |
| Products | `/api/products` |
| Inventory | `/api/inventory` |
| Customers | `/api/customers` |
| Sales | `/api/sales` |
| Purchases | `/api/purchases` |
| POS | `/api/pos` |
| Reports | `/api/reports` |
| Excel | `/api/excel` |
| Barcode | `/api/barcode` |
| AI | `/api/ai` |
| WhatsApp | `/api/whatsapp` |

See the route files under `backend/src/routes/` for the full list of
endpoints, validation schemas, and role requirements for each module.

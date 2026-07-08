# Software & License Tracker

Internal web app for tracking software versions, licenses, and EOL (End-of-Life) /
EOS (End-of-Support) dates across customer environments — with a focus on
converged IT/OT environments (SCADA, ICS).

Gives the IT/security team a single view of what software is running at which
customer, when it loses support, and license status.

See [software-license-tracker-spec.md](software-license-tracker-spec.md) for the
original specification (Norwegian).

## Tech stack, and why

| Layer | Choice | Why |
|---|---|---|
| Backend | Node.js + Express | Simple, no build step |
| Database | SQLite via `node:sqlite` | Built into Node itself — no native module to compile, no separate DB server |
| Frontend | React + Vite | Builds to static HTML/CSS/JS with zero runtime dependency on Node or the internet |
| Process manager | PM2 (local dependency) | Installed into `backend/node_modules`, not globally — no global install step needed on the VM |

This app is developed on a machine with internet access but **runs on a VM in a
closed, air-gapped network**. Every dependency choice above was made so the
whole app — backend and frontend — can be zipped up and copied to that VM
without needing any network access there. See
[Deploying to the air-gapped VM](#deploying-to-the-air-gapped-vm).

## Project structure

```
software-license-tracker/
├── backend/
│   ├── ecosystem.config.js       # PM2 process config
│   ├── package.json
│   ├── data/                     # SQLite database file (gitignored, created on first run)
│   └── src/
│       ├── server.js             # Express entrypoint
│       ├── db/
│       │   ├── connection.js     # node:sqlite connection singleton
│       │   ├── migrate.js        # migration runner
│       │   ├── migrations/       # numbered .sql migration files
│       │   └── repositories/     # data access + validation per entity
│       ├── routes/                # Express routers per entity
│       └── utils/                # status derivation, HTTP error type, etc.
└── frontend/
    ├── src/
    │   ├── api/client.js         # fetch wrapper for the backend API
    │   ├── components/           # modals, badges, shared UI pieces
    │   ├── layout/                # sidebar + page shell
    │   ├── pages/                 # Dashboard, Customers, Software
    │   └── styles/shared.css     # design tokens, shared component styles
    ├── vite.config.js
    └── dist/                      # build output (gitignored) — this is what ships to the VM
```

## Data model

```
Customer (1) ──< Project (1) ──< SoftwareEntry
```

- **Customer** — `name`, `environment_types` (`IT` and/or `OT`, multi-select —
  converged environments can be both), `notes`
- **Project** — `customer_id`, `project_number` (exactly 5 digits, globally
  unique), `project_name`, `notes`
- **SoftwareEntry** — `project_id`, `software_name`, `version`, `eol_date`,
  `eos_date`, `license_type` (`Perpetual` / `Subscription` / `Volume` /
  `Support`), `notes`

**Status** (`Critical` / `Approaching` / `OK` / `Unknown`) is never stored —
it's derived on every request from whichever of `eol_date`/`eos_date` is
soonest (worst case), per `backend/src/utils/status.js`:

- `Critical` — under 30 days away (or already past)
- `Approaching` — under 90 days away
- `OK` — 90+ days away
- `Unknown` — neither date is set

## Prerequisites

- **Node.js 24.x** on both the dev machine and the target VM — versions must
  match, since `node:sqlite` is part of the Node binary itself, not an npm
  package
- npm

## Local development

### 1. Backend

```
cd backend
npm install
npm run migrate   # creates backend/data/tracker.db and applies the schema
npm start         # http://localhost:3000
```

### 2. Frontend (separate terminal)

```
cd frontend
npm install
npm run dev        # http://localhost:5173, proxies /api/* to :3000
```

Open **http://localhost:5173** while developing — the Vite dev server gives
you hot reload and proxies API calls to the backend.

### Running backend tests

```
cd backend
npm test    # Node's built-in test runner; covers status derivation logic
```

## Building for production

```
cd frontend
npm run build       # outputs frontend/dist
```

Once `frontend/dist` exists, the backend serves it directly as static files
(with an SPA fallback for client-side routes) — no separate frontend server
needed. With the backend running, **http://localhost:3000** serves the built
app and the API together on one port.

## API reference

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/customers` | List customers with project/asset/critical/approaching counts |
| POST | `/api/customers` | Create a customer |
| GET | `/api/customers/:id/projects` | List a customer's projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/software?search=` | Software grouped by name across all customers, with worst status per group |
| POST | `/api/software-entries` | Create a software entry |
| PUT | `/api/software-entries/:id` | Update a software entry |
| DELETE | `/api/software-entries/:id` | Delete a software entry |
| GET | `/api/dashboard?search=&customer_id=&status=` | Summary stats + filterable entry table |

## Deploying to the air-gapped VM

This mirrors the transfer flow from the spec, using the locally-installed
`pm2` so **nothing needs installing on the VM itself**.

On the dev machine (has internet):

```
cd frontend
npm run build

cd ../backend
npm install --production
npm prune --production
```

Zip the whole `software-license-tracker` folder — including
`backend/node_modules` and `frontend/dist` — and copy it to the VM.

On the VM:

```
unzip software-license-tracker.zip
cd software-license-tracker/backend
npm run migrate        # first run only
npm run pm2:start
```

To keep it running across VM reboots (one-time, per VM):

```
npx pm2 startup
npx pm2 save
```

Other useful commands, run from `backend/`:

```
npm run pm2:logs        # tail logs
npm run pm2:restart     # restart after deploying an update
npm run pm2:stop        # stop the app
```

## Known limitations

- **No authentication** — intended to run inside a network the team already
  controls, not exposed further
- **No edit/delete UI for Customers or Projects** — only Software entries can
  be edited/deleted from the UI today; fixing a typo'd customer or project
  name currently needs direct database access
- **No automated EOL/EOS lookups** (e.g. via endoflife.date) — dates are
  entered manually; left open in the spec
- **No email/Teams notifications** for approaching EOL dates — also left open
  in the spec

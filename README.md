# NovaDom Realty — Smart Real Estate Matchmaker

A full-stack automation system for a real estate agency. Brokers add property listings; buyers
describe what they want in plain language and get semantically matched properties. An AI Agent
answers questions over the catalogue using **Supabase MCP** (structured/numeric queries) and a
**Vector Store tool** (semantic matching), with role-aware behaviour (broker vs client).

## Stack

| Layer | Tech |
|-------|------|
| Backend / automation | **n8n** (Docker, host port `5679`) |
| Database | **Supabase** — PostgreSQL + **pgvector** (3072-dim) |
| AI | **Google Gemini** — `gemini-embedding-001` @ 3072-dim (embeddings) + `gemini-2.5-flash-lite` (agent) |
| Agent ↔ DB | **Supabase MCP server** + **Supabase Vector Store** |
| Frontend | **React + Vite + Tailwind** |

## Architecture

```
Frontend (React, :5173)  ──HTTP──▶  n8n webhooks (:5679)  ──▶  Supabase + Gemini

Property Management tab
  Add listing form       → POST /webhook/add-listing   → properties + property_vectors + Storage (image)
  Catalogue grid         → GET  /webhook/list-listings → properties
  Broker chat (broker)   → POST /webhook/chat          → AI Agent

Buyer Search tab
  Semantic search box    → POST /webhook/search        → embed query → match property_vectors → inquiry_logs
  Buyer chat (client)    → POST /webhook/chat          → AI Agent

AI Agent (/webhook/chat): Google Gemini chat + Simple Memory + two tools:
  • Supabase MCP   → structured / numeric / aggregate queries on properties & inquiry_logs
  • Vector Store   → semantic matching over property_vectors (pgvector)
```

All browser traffic goes through n8n — the frontend never holds Supabase keys. The buyer **search
box** uses the pure-semantic workflow; the two **chat boxes** both hit the Agent workflow and are
tagged `broker`/`client` purely by which box sent the message.

## Repository layout

```
supabase/schema.sql          # tables + vector table + match function + storage bucket (deliverable #2)
supabase/seed.sql            # the 7 Appendix-A listings
workflows/*.json             # importable n8n Main + Error workflows (deliverable #1)
workflows/N8N_GUIDE.md       # step-by-step n8n build + AI Agent guide
workflows/agent-system-prompt.md   # the hardened, role-aware Agent system prompt
frontend/                    # React/Vite/Tailwind app (deliverable #3)
n8n/docker-compose.yml       # local n8n
```

## Run it locally

### 1. Database (Supabase)
The exam project (`dvowzaavjqakjehmgbmq`) already has the schema applied. To reproduce on a fresh
project, run `supabase/schema.sql` then `supabase/seed.sql` in the SQL editor. `pgvector` must be
enabled (`create extension if not exists vector;`).

### 2. Backend (n8n)
```bash
cd n8n
cp .env.example .env     # paste your Gemini key + Supabase service-role key
docker compose up -d     # n8n at http://localhost:5679
```
Then follow **`workflows/N8N_GUIDE.md`**: import workflows 01–05, run *Seed Embeddings* once,
build the *Chat Agent* workflow, set the Error Workflow, and activate. You'll need a Gemini key, a
Supabase service-role key, and a Supabase personal access token (for the Agent's MCP tool).

### 3. Frontend
```bash
cd frontend
cp .env.example .env      # VITE_N8N_URL=http://localhost:5679 (default is fine)
npm install
npm run dev               # http://localhost:5173
```

## Using the app
- **Property Management** — add a listing (fields + image: JPG/JPEG/PNG/WEBP/GIF + description),
  browse the catalogue, and chat as a broker ("average price of a house in Sofia?",
  "how many inquiries this week?").
- **Buyer Search** — type a natural-language request for a ranked, semantic match; chat as a buyer
  ("quiet, near a metro, under 100,000 EUR"). Buyers cannot access internal logs or business
  figures — the Agent refuses, including role-escalation attempts.

## What's implemented (core)
- ✅ Supabase relational tables + pgvector store seeded with description embeddings + match function
- ✅ n8n: Add Listing, Match Buyer Query (semantic + no-match handling + inquiry logging), Catalogue
- ✅ AI Agent with Supabase MCP (structured/aggregate), Vector Store tool (semantic), memory, role-aware
- ✅ Two-section frontend with two role-tagged chat boxes, connected to n8n
- ✅ Dedicated Error Workflow + frontend error banner; hardened, jailbreak-resistant system prompt

## Security note
**RLS is enabled** on all tables. The app reaches the DB only through n8n's service-role key
(which bypasses RLS), so the public anon key is locked out while everything keeps working.
The Agent's role separation (broker vs client) is a prompt-level boundary; true per-login
enforcement is Bonus B1.

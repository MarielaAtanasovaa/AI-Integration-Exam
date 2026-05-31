-- ============================================================================
-- Smart Real Estate Matchmaker — Database schema (Supabase / PostgreSQL + pgvector)
-- Deliverable #2. Re-runnable. pgvector ("vector") must be installed first:
--   create extension if not exists vector;   -- (already installed on the exam project)
-- ============================================================================

-- 1. Properties: source of truth for structured listing data ------------------
create table if not exists public.properties (
  id            bigint generated always as identity primary key,
  title         text        not null,
  property_type text        not null,                 -- apartment / house / studio / office / etc.
  listing_type  text        not null check (listing_type in ('for_sale','for_rent')),
  location      text        not null,
  price         numeric     not null,                 -- EUR; sale price OR monthly rent (set by listing_type)
  description   text        not null,
  image_url     text,
  created_at    timestamptz not null default now()
);

-- 2. Inquiry logs: every buyer semantic search and the properties it matched ---
create table if not exists public.inquiry_logs (
  id                   bigint generated always as identity primary key,
  buyer_query          text        not null,
  matched_property_ids bigint[]    not null default '{}',
  "timestamp"          timestamptz not null default now()
);

-- 2b. Error logs: written by the dedicated n8n Error Workflow ------------------
create table if not exists public.error_logs (
  id            bigint generated always as identity primary key,
  workflow_name text,
  node_name     text,
  message       text,
  created_at    timestamptz not null default now()
);

-- 3. Vector store (matches the n8n Supabase Vector Store node contract) ---------
--    3072 dims = Google gemini-embedding-001 default (what n8n's native "Embeddings Google
--    Gemini" node produces, so the Supabase Vector Store node matches). Keep numeric fields
--    numeric in metadata so the Agent can range-filter the results.
create table if not exists public.property_vectors (
  id        uuid primary key default gen_random_uuid(),
  content   text,        -- the property description that was embedded
  metadata  jsonb,       -- { property_id, price, listing_type, location, property_type }
  embedding vector(3072)
);

-- NOTE: pgvector HNSW/IVFFlat indexes cap at 2000 dims, so a 3072-dim column cannot use an
-- ANN index. Exact cosine search (no index) is instant at this catalogue size.
-- (Optional for large catalogues: store as halfvec(3072) and HNSW-index that.)
create index if not exists property_vectors_metadata_idx
  on public.property_vectors using gin (metadata);

-- 4. Similarity search function called by the n8n Supabase Vector Store node ----
create or replace function public.match_property_vectors (
  query_embedding vector(3072),
  match_count     int   default 5,
  filter          jsonb default '{}'
) returns table (
  id         uuid,
  content    text,
  metadata   jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    pv.id,
    pv.content,
    pv.metadata,
    1 - (pv.embedding <=> query_embedding) as similarity
  from public.property_vectors pv
  where pv.metadata @> filter
  order by pv.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 5. Public storage bucket for listing images ----------------------------------
--    n8n uploads with the service-role key (bypasses RLS); public read lets the
--    frontend <img> tags load the files.
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read property-images" on storage.objects;
create policy "Public read property-images"
  on storage.objects for select
  using (bucket_id = 'property-images');

-- ----------------------------------------------------------------------------
-- RLS: the app reaches the DB only through n8n's service-role key (which bypasses
-- RLS), so enabling RLS with no policies locks out the public anon key without
-- breaking anything. Enabled for security hardening.
alter table public.properties       enable row level security;
alter table public.inquiry_logs     enable row level security;
alter table public.property_vectors enable row level security;
alter table public.error_logs        enable row level security;
-- ----------------------------------------------------------------------------

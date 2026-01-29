-- 🚨 DANGER ZONE: DROP EVERYTHING 🚨
drop function if exists match_documents(vector, float, int);
drop function if exists match_documents(vector, float, int, uuid);
drop table if exists messages cascade;
drop table if exists chats cascade;
drop table if exists generated_content cascade;
drop table if exists embeddings cascade;
drop table if exists materials cascade;

-- 1. Enable Vector Extension
create extension if not exists vector;

-- 2. MATERIALS (Files)
create table materials (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  file_url text,      -- FIXED: Matches code
  content_text text,  -- FIXED: Stores extracted text
  category text check (category in ('Theory', 'Lab')) not null,
  type text not null, -- FIXED: 'pdf'
  metadata jsonb default '{}'::jsonb
);

-- RLS: DISABLED (Public Access for Hackathon Speed)
alter table materials enable row level security;
create policy "Public Access" on materials for all using (true) with check (true);


-- 3. EMBEDDINGS (The Brain)
-- Gemini text-embedding-004 outputs 768 dimensions
create table embeddings (
  id uuid default gen_random_uuid() primary key,
  material_id uuid references materials(id) on delete cascade not null,
  content_chunk text not null,
  
  -- CHANGED: 1536 -> 768 for Gemini
  embedding vector(768) 
);

-- RLS: DISABLED
alter table embeddings enable row level security;
create policy "Public Access" on embeddings for all using (true) with check (true);


-- 4. GENERATED CONTENT (AI Outputs)
create table generated_content (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  type text not null,
  content_json jsonb not null,
  validation_result jsonb default null
);

-- RLS: DISABLED
alter table generated_content enable row level security;
create policy "Public Access" on generated_content for all using (true) with check (true);


-- 5. CHAT HISTORY
create table chats (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null
);

create table messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references chats(id) on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: DISABLED
alter table chats enable row level security;
create policy "Public Access" on chats for all using (true) with check (true);

alter table messages enable row level security;
create policy "Public Access" on messages for all using (true) with check (true);


-- 6. SEARCH FUNCTION (RAG)
-- Updated to support filtering by material_id
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_material_id uuid default null
)
returns table (
  id uuid,
  content_chunk text,
  similarity float,
  material_id uuid,
  material_title text
)
language plpgsql
as $$
begin
  return query
  select
    e.id,
    e.content_chunk,
    1 - (e.embedding <=> query_embedding) as similarity,
    m.id as material_id,
    m.title as material_title
  from embeddings e
  join materials m on e.material_id = m.id
  where 1 - (e.embedding <=> query_embedding) > match_threshold
  and (filter_material_id is null or e.material_id = filter_material_id)
  order by similarity desc
  limit match_count;
end;
$$;

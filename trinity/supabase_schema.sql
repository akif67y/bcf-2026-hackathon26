-- 1. Enable Vector Extension
create extension if not exists vector;

-- 2. MATERIALS (Unchanged)
create table materials (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  file_url text,
  content_text text,
  category text check (category in ('Theory', 'Lab')) not null,
  type text not null,
  metadata jsonb default '{}'::jsonb
);

-- 3. EMBEDDINGS (UPDATED FOR GEMINI)
-- Gemini text-embedding-004 outputs 768 dimensions
create table embeddings (
  id uuid default gen_random_uuid() primary key,
  material_id uuid references materials(id) on delete cascade not null,
  content_chunk text not null,
  
  -- CHANGED: 1536 -> 768
  embedding vector(768) 
);

-- 4. GENERATED CONTENT (Unchanged)
create table generated_content (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  type text not null,
  content_json jsonb not null,
  validation_result jsonb default null
);

-- 5. CHAT HISTORY (Unchanged)
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

-- 6. SEARCH FUNCTION (UPDATED FOR GEMINI)
-- The input vector must also be 768 dimensions
create or replace function match_documents (
  query_embedding vector(768), -- CHANGED
  match_threshold float,
  match_count int
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
  order by similarity desc
  limit match_count;
end;
$$;

-- Optional. App works without Supabase. Run in the Supabase SQL editor if you wire it up.
create table profiles (
  id text primary key, anonymous_id text not null, user_type text not null,
  domains text[] not null default '{}', experiences text[] not null default '{}',
  help_topics text[] not null default '{}', created_at timestamptz default now()
);
create table posts (
  id text primary key, anonymous_id text not null, content text not null,
  domain text, context text, intent text,
  target_user_types text[] default '{}', required_experiences text[] default '{}', tags text[] default '{}',
  created_at timestamptz default now()
);
create table answers (
  id text primary key, post_id text references posts(id) on delete cascade,
  anonymous_id text not null, content text not null, created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.profiles enable row level security;
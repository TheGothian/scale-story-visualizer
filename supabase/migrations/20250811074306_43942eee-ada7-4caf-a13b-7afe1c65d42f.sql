-- Create custom accounts table for email/password auth managed by edge functions
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  display_name text,
  is_verified boolean not null default false,
  verification_token text,
  reset_token text,
  reset_token_expires_at timestamptz,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure case-insensitive uniqueness on email
create unique index if not exists accounts_email_unique on public.accounts (lower(email));

-- Enable Row Level Security (deny by default; edge functions with service role will bypass)
alter table public.accounts enable row level security;

-- Update updated_at automatically on updates
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_accounts_updated_at on public.accounts;
create trigger set_accounts_updated_at
before update on public.accounts
for each row execute function public.update_updated_at_column();
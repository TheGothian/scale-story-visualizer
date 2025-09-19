-- WebAuthn tables: credentials and challenges
create table if not exists public.webauthn_credentials (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.accounts(id) on delete cascade,
	credential_id text not null,
	public_key text not null,
	counter bigint not null default 0,
	transports text[],
	aaguid uuid,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (user_id, credential_id)
);

create index if not exists idx_webauthn_credentials_user on public.webauthn_credentials(user_id);

create or replace function public.update_webauthn_credentials_updated_at()
returns trigger language plpgsql as $$
begin
	new.updated_at = now();
	return new;
end; $$;

drop trigger if exists set_webauthn_credentials_updated_at on public.webauthn_credentials;
create trigger set_webauthn_credentials_updated_at
before update on public.webauthn_credentials
for each row execute function public.update_webauthn_credentials_updated_at();

create table if not exists public.webauthn_challenges (
	id uuid primary key default gen_random_uuid(),
	user_id uuid,
	challenge text not null,
	type text not null check (type in ('registration','authentication')),
	created_at timestamptz not null default now(),
	expires_at timestamptz not null,
	consumed boolean not null default false
);

create index if not exists idx_webauthn_challenges_user on public.webauthn_challenges(user_id);

alter table public.webauthn_credentials enable row level security;
alter table public.webauthn_challenges enable row level security;
-- Edge functions use service role; no policies required beyond that.

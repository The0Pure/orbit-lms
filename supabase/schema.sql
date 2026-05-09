-- ═══════════════════════════════════════════════════════════
-- ORBIT LMS — Supabase Schema
-- Run this in the Supabase SQL Editor (dashboard.supabase.com)
-- ═══════════════════════════════════════════════════════════

-- ─── Extensions ───────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Profiles (extends auth.users) ───────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  first_name  text not null default '',
  last_name   text not null default '',
  phone       text default '',
  avatar_url  text default '',
  role        text not null default 'student' check (role in ('student', 'admin')),
  provider    text default 'email',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, avatar_url, provider)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(new.raw_user_meta_data->>'provider', 'email')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ─── Courses ──────────────────────────────────────────────
create table if not exists public.courses (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,
  title       text not null,
  title_ar    text default '',
  description text default '',
  desc_ar     text default '',
  price       numeric(10,2) not null default 0,
  currency    text not null default 'SAR',
  level       text default 'Beginner',
  language    text default 'English',
  duration    text default '',
  category    text default '',
  color       text default '#2D3347',
  pattern_type text default 'grid',
  icon_url    text default '',
  is_free     boolean not null default false,
  published   boolean not null default false,
  students    integer not null default 0,
  rating      numeric(3,2) default 0,
  modules     jsonb not null default '[]',
  what_learn  text[] default '{}',
  instructor  text default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger courses_updated_at before update on public.courses
  for each row execute procedure public.set_updated_at();

-- ─── Enrollments ──────────────────────────────────────────
create table if not exists public.enrollments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique(user_id, course_id)
);

-- ─── Module Completions ───────────────────────────────────
create table if not exists public.module_completions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_id    uuid not null references public.courses(id) on delete cascade,
  module_id    text not null,
  completed_at timestamptz not null default now(),
  unique(user_id, course_id, module_id)
);

-- ─── Certificates ─────────────────────────────────────────
create table if not exists public.certificates (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_id    uuid not null references public.courses(id) on delete cascade,
  course_title text not null,
  course_title_en text not null default '',
  svg_data     text not null default '',
  issued_at    timestamptz not null default now(),
  unique(user_id, course_id)
);

-- ─── Orders ───────────────────────────────────────────────
create table if not exists public.orders (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  course_id       uuid not null references public.courses(id) on delete cascade,
  course_name     text not null,
  original_amount numeric(10,2) not null default 0,
  discount_code   text,
  discount_amt    numeric(10,2) not null default 0,
  amount          numeric(10,2) not null default 0,
  vat             numeric(10,2) not null default 0,
  method          text not null default 'card',
  status          text not null default 'pending' check (status in ('pending','completed','refunded','failed')),
  stripe_payment_intent_id text,
  created_at      timestamptz not null default now()
);

-- ─── Discount Codes ───────────────────────────────────────
create table if not exists public.discount_codes (
  id          uuid primary key default uuid_generate_v4(),
  code        text unique not null,
  type        text not null default 'percent' check (type in ('percent','fixed')),
  value       numeric(10,2) not null,
  max_uses    integer,
  uses        integer not null default 0,
  expiry      timestamptz,
  active      boolean not null default true,
  description text default '',
  created_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════

alter table public.profiles          enable row level security;
alter table public.courses           enable row level security;
alter table public.enrollments       enable row level security;
alter table public.module_completions enable row level security;
alter table public.certificates      enable row level security;
alter table public.orders            enable row level security;
alter table public.discount_codes    enable row level security;

-- Helper: check if caller is admin
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ─── profiles policies ────────────────────────────────────
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles: admin read all"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles: admin update all"
  on public.profiles for update
  using (public.is_admin());

create policy "profiles: admin insert"
  on public.profiles for insert
  with check (public.is_admin());

create policy "profiles: admin delete"
  on public.profiles for delete
  using (public.is_admin());

-- ─── courses policies ─────────────────────────────────────
create policy "courses: anyone reads published"
  on public.courses for select
  using (published = true or public.is_admin());

create policy "courses: admin insert"
  on public.courses for insert
  with check (public.is_admin());

create policy "courses: admin update"
  on public.courses for update
  using (public.is_admin());

create policy "courses: admin delete"
  on public.courses for delete
  using (public.is_admin());

-- ─── enrollments policies ─────────────────────────────────
create policy "enrollments: own read"
  on public.enrollments for select
  using (auth.uid() = user_id or public.is_admin());

-- Inserts happen only via server-side (payment webhook), NOT directly from client.
-- Admins can insert for free enrollments.
create policy "enrollments: admin insert"
  on public.enrollments for insert
  with check (public.is_admin());

-- ─── module_completions policies ──────────────────────────
create policy "completions: own read"
  on public.module_completions for select
  using (auth.uid() = user_id or public.is_admin());

create policy "completions: own insert"
  on public.module_completions for insert
  with check (auth.uid() = user_id);

-- ─── certificates policies ────────────────────────────────
create policy "certificates: own read"
  on public.certificates for select
  using (auth.uid() = user_id or public.is_admin());

-- Certificate issuance must be verified: only allowed if the user has completed
-- all required modules. This check is enforced by a server function, not the client.
-- Client calls the api/issue-certificate endpoint; that function does the RLS bypass via service role.
create policy "certificates: admin insert"
  on public.certificates for insert
  with check (public.is_admin());

-- ─── orders policies ──────────────────────────────────────
create policy "orders: own read"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

-- Authenticated users can create their own pending orders
create policy "orders: own insert"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Orders are created by the payment webhook (service role key), never by the client.
create policy "orders: admin read all"
  on public.orders for select
  using (public.is_admin());

-- ─── discount_codes policies ──────────────────────────────
create policy "discounts: authenticated read active"
  on public.discount_codes for select
  to authenticated
  using (active = true and (expiry is null or expiry > now()) and (max_uses is null or uses < max_uses));

create policy "discounts: admin full"
  on public.discount_codes for all
  using (public.is_admin());

-- ═══════════════════════════════════════════════════════════
-- SERVER-SIDE FUNCTIONS (called via Supabase Edge Functions or Vercel API)
-- ═══════════════════════════════════════════════════════════

-- Grant enrollment after verified payment (called with service_role key from webhook)
create or replace function public.complete_enrollment(
  p_user_id   uuid,
  p_course_id uuid,
  p_order_id  uuid
)
returns void language plpgsql security definer set search_path = public as $$
begin
  -- Mark order as completed
  update public.orders set status = 'completed' where id = p_order_id and user_id = p_user_id;
  -- Enroll user (ignore if already enrolled)
  insert into public.enrollments (user_id, course_id)
  values (p_user_id, p_course_id)
  on conflict (user_id, course_id) do nothing;
  -- Increment course student count
  update public.courses set students = students + 1 where id = p_course_id;
end;
$$;

-- Increment course student count (called from api/enroll-free.js)
create or replace function public.increment_course_students(course_id_arg uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.courses set students = students + 1 where id = course_id_arg;
end;
$$;

-- Increment discount code usage count (called from api/verify-payment.js)
create or replace function public.increment_discount_uses(discount_id_arg uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.discount_codes set uses = uses + 1 where id = discount_id_arg;
end;
$$;

-- ═══════════════════════════════════════════════════════════
-- SEED: Promote a user to admin
-- Replace the email below, then run in SQL Editor after signing up.
-- ═══════════════════════════════════════════════════════════
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'your-admin@example.com');

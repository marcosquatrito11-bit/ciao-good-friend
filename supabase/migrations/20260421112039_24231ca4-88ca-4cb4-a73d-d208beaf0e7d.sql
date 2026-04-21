
-- ============ ENUMS ============
create type public.app_role as enum ('admin', 'guide', 'tourist');
create type public.guide_status as enum ('draft', 'pending', 'approved', 'rejected', 'suspended');
create type public.experience_status as enum ('draft', 'pending', 'published', 'archived');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
create type public.currency_code as enum ('EUR', 'USD', 'GBP');
create type public.experience_category as enum ('hiking', 'volcano', 'food', 'wine', 'culture', 'photo', 'adventure', 'family', 'wellness', 'sea');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  phone text,
  preferred_language text default 'en',
  country text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

-- security definer role check
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- ============ GUIDE APPLICATIONS (wizard) ============
create table public.guide_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status public.guide_status not null default 'draft',
  current_step int not null default 1,
  -- step 1: personal
  first_name text,
  last_name text,
  date_of_birth date,
  nationality text,
  city text,
  -- step 2: contact
  phone text,
  whatsapp text,
  emergency_contact text,
  -- step 3: about
  headline text,
  bio_short text,
  bio_long text,
  years_experience int,
  -- step 4: languages
  languages jsonb default '[]'::jsonb, -- [{code, level}]
  -- step 5: specializations
  specializations public.experience_category[] default '{}',
  areas_covered text[] default '{}',
  -- step 6: certifications & docs
  certifications jsonb default '[]'::jsonb,
  id_document_url text,
  certificate_urls text[] default '{}',
  insurance_url text,
  -- step 7: payments
  stripe_account_id text,
  iban text,
  vat_number text,
  -- step 8: agreement
  terms_accepted boolean default false,
  privacy_accepted boolean default false,
  motivation text,
  -- meta
  rejection_reason text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.guide_applications enable row level security;

-- ============ GUIDES (approved) ============
create table public.guides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  application_id uuid references public.guide_applications(id),
  headline text,
  bio_long text,
  languages jsonb default '[]'::jsonb,
  specializations public.experience_category[] default '{}',
  areas_covered text[] default '{}',
  rating numeric(3,2) default 0,
  reviews_count int default 0,
  experiences_count int default 0,
  bookings_count int default 0,
  is_active boolean default true,
  stripe_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.guides enable row level security;

-- ============ EXPERIENCES ============
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.guides(id) on delete cascade,
  title text not null,
  slug text unique,
  description text,
  category public.experience_category not null,
  duration_minutes int not null,
  price_amount numeric(10,2) not null,
  price_currency public.currency_code not null default 'EUR',
  max_participants int not null default 8,
  min_participants int not null default 1,
  languages text[] default '{en}',
  location_name text,
  location_lat numeric(9,6),
  location_lng numeric(9,6),
  meeting_point text,
  included text[],
  not_included text[],
  requirements text,
  images text[] default '{}',
  status public.experience_status not null default 'draft',
  rating numeric(3,2) default 0,
  reviews_count int default 0,
  bookings_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.experiences enable row level security;

-- ============ EXPERIENCE DATES ============
create table public.experience_dates (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  starts_at timestamptz not null,
  spots_left int not null,
  created_at timestamptz not null default now()
);
alter table public.experience_dates enable row level security;

-- ============ BOOKINGS ============
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  tourist_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid not null references public.experiences(id),
  guide_id uuid not null references public.guides(id),
  experience_date_id uuid references public.experience_dates(id),
  participants int not null default 1,
  total_amount numeric(10,2) not null,
  platform_fee numeric(10,2) not null default 0,
  guide_payout numeric(10,2) not null default 0,
  currency public.currency_code not null default 'EUR',
  status public.booking_status not null default 'pending',
  stripe_payment_intent_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.bookings enable row level security;

-- ============ REVIEWS ============
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  tourist_id uuid not null references auth.users(id) on delete cascade,
  guide_id uuid not null references public.guides(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;

-- ============ MESSAGES ============
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

-- ============ FAVORITES ============
create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, experience_id)
);
alter table public.favorites enable row level security;

-- ============ TRIGGERS: updated_at ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_guide_apps_updated before update on public.guide_applications for each row execute function public.set_updated_at();
create trigger trg_guides_updated before update on public.guides for each row execute function public.set_updated_at();
create trigger trg_exps_updated before update on public.experiences for each row execute function public.set_updated_at();
create trigger trg_bookings_updated before update on public.bookings for each row execute function public.set_updated_at();

-- ============ TRIGGER: auto-create profile + default tourist role ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.user_roles (user_id, role) values (new.id, 'tourist') on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ RLS POLICIES ============

-- profiles
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- user_roles
create policy "roles_select_own_or_admin" on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "roles_admin_all" on public.user_roles for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- guide_applications
create policy "apps_select_own" on public.guide_applications for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "apps_insert_own" on public.guide_applications for insert with check (auth.uid() = user_id);
create policy "apps_update_own" on public.guide_applications for update using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "apps_delete_admin" on public.guide_applications for delete using (public.has_role(auth.uid(), 'admin'));

-- guides
create policy "guides_select_all" on public.guides for select using (true);
create policy "guides_update_own_or_admin" on public.guides for update using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "guides_insert_admin" on public.guides for insert with check (public.has_role(auth.uid(), 'admin'));

-- experiences
create policy "exps_select_published_or_owner" on public.experiences for select using (
  status = 'published' or
  exists (select 1 from public.guides g where g.id = guide_id and g.user_id = auth.uid()) or
  public.has_role(auth.uid(), 'admin')
);
create policy "exps_insert_own_guide" on public.experiences for insert with check (
  exists (select 1 from public.guides g where g.id = guide_id and g.user_id = auth.uid())
);
create policy "exps_update_own" on public.experiences for update using (
  exists (select 1 from public.guides g where g.id = guide_id and g.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin')
);
create policy "exps_delete_own" on public.experiences for delete using (
  exists (select 1 from public.guides g where g.id = guide_id and g.user_id = auth.uid()) or public.has_role(auth.uid(), 'admin')
);

-- experience_dates
create policy "dates_select_all" on public.experience_dates for select using (true);
create policy "dates_manage_owner" on public.experience_dates for all using (
  exists (select 1 from public.experiences e join public.guides g on g.id = e.guide_id where e.id = experience_id and g.user_id = auth.uid())
) with check (
  exists (select 1 from public.experiences e join public.guides g on g.id = e.guide_id where e.id = experience_id and g.user_id = auth.uid())
);

-- bookings
create policy "bookings_select_involved" on public.bookings for select using (
  auth.uid() = tourist_id or
  exists (select 1 from public.guides g where g.id = guide_id and g.user_id = auth.uid()) or
  public.has_role(auth.uid(), 'admin')
);
create policy "bookings_insert_tourist" on public.bookings for insert with check (auth.uid() = tourist_id);
create policy "bookings_update_involved" on public.bookings for update using (
  auth.uid() = tourist_id or
  exists (select 1 from public.guides g where g.id = guide_id and g.user_id = auth.uid()) or
  public.has_role(auth.uid(), 'admin')
);

-- reviews
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_tourist" on public.reviews for insert with check (
  auth.uid() = tourist_id and
  exists (select 1 from public.bookings b where b.id = booking_id and b.tourist_id = auth.uid() and b.status = 'completed')
);
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = tourist_id);
create policy "reviews_delete_own_or_admin" on public.reviews for delete using (auth.uid() = tourist_id or public.has_role(auth.uid(), 'admin'));

-- messages
create policy "msgs_select_involved" on public.messages for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "msgs_insert_sender" on public.messages for insert with check (auth.uid() = sender_id);
create policy "msgs_update_recipient" on public.messages for update using (auth.uid() = recipient_id);

-- favorites
create policy "fav_select_own" on public.favorites for select using (auth.uid() = user_id);
create policy "fav_insert_own" on public.favorites for insert with check (auth.uid() = user_id);
create policy "fav_delete_own" on public.favorites for delete using (auth.uid() = user_id);

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('experiences', 'experiences', true),
  ('guide-documents', 'guide-documents', false)
on conflict (id) do nothing;

-- avatars: public read, owner write
create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_user_insert" on storage.objects for insert with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "avatars_user_update" on storage.objects for update using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "avatars_user_delete" on storage.objects for delete using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

-- experiences: public read, guide owner write
create policy "exp_imgs_public_read" on storage.objects for select using (bucket_id = 'experiences');
create policy "exp_imgs_user_insert" on storage.objects for insert with check (
  bucket_id = 'experiences' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "exp_imgs_user_update" on storage.objects for update using (
  bucket_id = 'experiences' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "exp_imgs_user_delete" on storage.objects for delete using (
  bucket_id = 'experiences' and auth.uid()::text = (storage.foldername(name))[1]
);

-- guide-documents: privato (owner + admin)
create policy "docs_owner_select" on storage.objects for select using (
  bucket_id = 'guide-documents' and (
    auth.uid()::text = (storage.foldername(name))[1] or public.has_role(auth.uid(), 'admin')
  )
);
create policy "docs_owner_insert" on storage.objects for insert with check (
  bucket_id = 'guide-documents' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "docs_owner_update" on storage.objects for update using (
  bucket_id = 'guide-documents' and auth.uid()::text = (storage.foldername(name))[1]
);
create policy "docs_owner_delete" on storage.objects for delete using (
  bucket_id = 'guide-documents' and (
    auth.uid()::text = (storage.foldername(name))[1] or public.has_role(auth.uid(), 'admin')
  )
);

-- indexes
create index idx_exps_status on public.experiences(status);
create index idx_exps_category on public.experiences(category);
create index idx_exps_guide on public.experiences(guide_id);
create index idx_bookings_tourist on public.bookings(tourist_id);
create index idx_bookings_guide on public.bookings(guide_id);
create index idx_msgs_recipient on public.messages(recipient_id);
create index idx_apps_status on public.guide_applications(status);

-- TABEL: Profile & General Info
create table public.portfolio_profile (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  full_name text,
  avatar_url text,
  birth_date date default '2000-08-24',
  class_name text,
  location text,
  timezone text,
  weather text,
  bio text,
  dialogue text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- TABEL: Attributes (STR, AGI, INT, VIT)
create table public.portfolio_attributes (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- STR, AGI, etc.
  val integer not null default 0,
  color text, -- bg-primary, etc.
  display_order integer default 0
);

-- TABEL: Skill Categories
create table public.portfolio_skill_categories (
  id text primary key, -- core, frontend, etc.
  label text not null,
  color text, -- text-cyan-400
  border text, -- border-cyan-400
  display_order integer default 0
);

-- TABEL: Skills
create table public.portfolio_skills (
  id text primary key,
  name text not null,
  level integer default 1,
  category_id text references public.portfolio_skill_categories(id),
  description text,
  unlocked boolean default true,
  icon text,
  requires text[], -- array of skill IDs
  display_order integer default 0
);

-- TABEL: Projects
create table public.portfolio_projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text, -- "Web App", "Quest", etc.
  description text,
  image text,
  tech text[],
  link text,
  status text, -- "COMPLETED", "IN_PROGRESS"
  color text, -- "border-primary", "border-secondary"
  display_order integer default 0
);

-- TABEL: Awards
create table public.portfolio_awards (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  issuer text,
  date text,
  icon text, -- lucide icon name or emoji
  rarity text, -- "LEGENDARY", "RARE"
  color text, -- text-yellow-400
  display_order integer default 0
);

-- TABEL: Education
create table public.portfolio_education (
  id uuid default gen_random_uuid() primary key,
  year text not null,
  title text not null,
  location text,
  description text,
  display_order integer default 0
);

-- TABEL: Gallery
create table public.portfolio_gallery (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  title text,
  display_order integer default 0
);

-- Enable RLS for all tables
alter table public.portfolio_profile enable row level security;
alter table public.portfolio_attributes enable row level security;
alter table public.portfolio_skill_categories enable row level security;
alter table public.portfolio_skills enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_awards enable row level security;
alter table public.portfolio_education enable row level security;
alter table public.portfolio_gallery enable row level security;

-- Setup public read access policies
create policy "Public Read" on public.portfolio_profile for select using (true);
create policy "Public Read" on public.portfolio_attributes for select using (true);
create policy "Public Read" on public.portfolio_skill_categories for select using (true);
create policy "Public Read" on public.portfolio_skills for select using (true);
create policy "Public Read" on public.portfolio_projects for select using (true);
create policy "Public Read" on public.portfolio_awards for select using (true);
create policy "Public Read" on public.portfolio_education for select using (true);
create policy "Public Read" on public.portfolio_gallery for select using (true);

-- TABEL: Page Visits (Tracking)
create table public.portfolio_page_visits (
  id text primary key, -- 'total_visitors'
  count integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.portfolio_page_visits enable row level security;
create policy "Public Read" on public.portfolio_page_visits for select using (true);
create policy "Public Increment" on public.portfolio_page_visits for update using (true);

-- TABEL: Activity Log (GitHub/GitLab)
CREATE TABLE IF NOT EXISTS public.portfolio_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE UNIQUE NOT NULL,
    count INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABEL: Playlist
CREATE TABLE IF NOT EXISTS public.portfolio_playlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    artist TEXT,
    url TEXT NOT NULL,
    cover_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Activity Log
ALTER TABLE public.portfolio_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_playlist ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read activity logs
CREATE POLICY "Allow public read access" ON public.portfolio_activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.portfolio_playlist FOR SELECT USING (true);

-- Policy: Service role or authenticated can insert/update
  with check (true);

-- SEED DATA
-- Profile
insert into public.portfolio_profile (name, full_name, avatar_url, class_name, location, timezone, weather, bio, dialogue, birth_date)
values (
  'Brilliano', 
  'Brilliano Dhiya Ulhaq', 
  'me.png',
  'Technical Project Lead', 
  'Cikarang, Indonesia', 
  'GMT+7', 
  'Tropical', 
  'Senior Frontend Developer and Technical Lead with 6+ years of experience architecting scalable web applications using Next.js, React, and TypeScript.',
  '> Hello world! I''m Brilliano. Ready to architect your next digital empire?',
  '2000-08-24'
);

-- Attributes
insert into public.portfolio_attributes (name, val, color, display_order) values
('AGI (Frontend Speed)', 98, 'bg-primary', 1), -- Ref: 74% increase in speed
('STR (Fullstack Power)', 95, 'bg-destructive', 2), -- Ref: IoT 10,000+ devices
('INT (Tech Leadership)', 96, 'bg-accent', 3), -- Ref: Tech Lead & PM roles
('VIT (Security & SEO)', 94, 'bg-secondary', 4); -- Ref: zero incidents & 45% organic growth

-- Skill Categories
insert into public.portfolio_skill_categories (id, label, color, border, display_order) values
('core', 'CORE SPELLS', 'text-cyan-400', 'border-cyan-400', 1),
('frontend', 'FRONTEND ARTS', 'text-pink-400', 'border-pink-400', 2),
('backend', 'BACKEND MAGIC', 'text-green-400', 'border-green-400', 3),
('tools', 'TOOLS & RUNES', 'text-yellow-400', 'border-yellow-400', 4),
('future', 'LOCKED SKILLS', 'text-gray-500', 'border-gray-500', 5);
-- Seed Playlist
INSERT INTO public.portfolio_playlist (title, url, cover_url, display_order)
VALUES 
    ('3008s Friday Theme (Crunchy)', '/music/3008-friday-crunchy.mp3', '/music/3008-friday-crunchy.jpg', 1),
    ('65535', '/music/six-five-five-three-five.mp3', '/music/six-five-five-three-five.jpg', 2),
    ('DAN DA DAN - Otonoke (8bit)', '/music/dandadan-otonoke-8bit.mp3', '/music/dandadan-otonoke-8bit.jpg', 3),
    ('Fantastic Dreamer (Konosuba OP)', '/music/konosuba-fantastic-dreamer-8bit.mp3', '/music/konosuba-fantastic-dreamer-8bit.jpg', 4),
    ('Growing Up (Konosuba S3 OP)', '/music/konosuba-growing-up-8bit.mp3', '/music/konosuba-growing-up-8bit.jpg', 5),
    ('Newsong (Naruto OP 10)', '/music/naruto-newsong-8bit.mp3', '/music/naruto-newsong-8bit.jpg', 6),
    ('Hollow Hunger (Overlord IV OP)', '/music/overlord-hollow-hunger-8bit.mp3', '/music/overlord-hollow-hunger-8bit.jpg', 7),
    ('Peace Sign (My Hero Academia OP)', '/music/mha-peace-sign-8bit.mp3', '/music/mha-peace-sign-8bit.jpg', 8),
    ('Tomorrow (Konosuba OP 2)', '/music/konosuba-tomorrow-8bit.mp3', '/music/konosuba-tomorrow-8bit.jpg', 9),
    ('Weight of the World (8 bit)', '/music/nier-weight-of-the-world-8bit.mp3', '/music/nier-weight-of-the-world-8bit.jpg', 10),
    ('YUSHA (Frieren OP)', '/music/frieren-yusha-8bit.mp3', '/music/frieren-yusha-8bit.jpg', 11),
    ('File City Day (Digimon World)', '/music/digimon-file-city-8bit.mp3', '/music/digimon-file-city-8bit.jpg', 12)
ON CONFLICT DO NOTHING;

-- Skills
insert into public.portfolio_skills (id, name, level, category_id, description, icon, display_order) values
('nextjs', 'Next.js', 5, 'frontend', 'SSR, ISR, App Router expert.', 'https://skillicons.dev/icons?i=nextjs', 1),
('react', 'React', 5, 'frontend', 'Hooks, Context, Performance.', 'https://skillicons.dev/icons?i=react', 2),
('ts', 'TypeScript', 5, 'frontend', 'Type-safe architecture.', 'https://skillicons.dev/icons?i=ts', 3),
('supabase', 'Supabase', 5, 'backend', 'RLS & Realtime experts.', 'https://skillicons.dev/icons?i=supabase', 4),
('laravel', 'Laravel', 3, 'backend', 'Enterprise backend systems.', 'https://skillicons.dev/icons?i=laravel', 5);

-- Projects
insert into public.portfolio_projects (title, description, image, tech, status, type, color, display_order) values
('AI SNS Platform', 'AI-powered social networking platform with Supabase RLS.', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80', '{Next.js,Supabase,AI}', 'COMPLETED', 'Web App', 'border-primary', 1),
('IoT Monitoring', 'Real-time dashboard managing 10,000+ connected devices.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', '{Next.js,IoT,Realtime}', 'COMPLETED', 'System', 'border-secondary', 2),
('Crypto Job Search', 'Blockchain-based recruitment platform with wallet integration.', 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80', '{Next.js,Web3,Tailwind}', 'COMPLETED', 'Web3', 'border-accent', 3);

-- Awards
insert into public.portfolio_awards (title, issuer, date, rarity, color, icon) values
('Performance Optimization Specialist', 'Technical Achievement', '2025', 'LEGENDARY', 'text-yellow-400', 'Zap'),
('Senior Frontend Maven', 'Meta / Coursera', '2023', 'EPIC', 'text-orange-400', 'Star'),
('Clean Code Guardian', 'Security Standard', 'Always', 'RARE', 'text-blue-400', 'Shield');

-- Education
insert into public.portfolio_education (year, title, location, description) values
('2020 - 2024', 'B.S. in Computer Science', 'Tech University Academy', 'Mastered the arcane arts of algorithms and software engineering with high INT stats.'),
('2018 - 2020', 'Vocational High School', 'Code Crafters High', 'First contact with the web canvas and basic text editors.');

-- Visitors Initial
insert into public.portfolio_page_visits (id, count) values ('total_visitors', 1337);

-- KIM FLORA - BỔ SUNG DANH MỤC ĐỘNG
-- Chạy 1 lần trong Supabase > SQL Editor.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  description text,
  image_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories" on public.categories
for select using (active = true or public.is_admin());

drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories
for all using (public.is_admin()) with check (public.is_admin());

insert into public.categories (name,slug,description,active,sort_order)
values
('Bó hoa','bo-hoa','Form tròn, một mặt, nghệ thuật, bó cưới',true,1),
('Giỏ hoa','gio-hoa','Giỏ hoa để bàn, sinh nhật, tri ân',true,2),
('Hộp hoa','hop-hoa','Hộp hoa gọn, quà tặng tinh tế',true,3),
('Bình & túi hoa','binh-tui-hoa','Bình hoa, túi hoa và thiết kế để bàn',true,4),
('Kệ & trụ hoa','ke-tru-hoa','Khai trương, chúc mừng, sự kiện',true,5),
('Quà tặng','qua-tang','Hoa, trái cây, bánh kẹo, quà theo yêu cầu',true,6),
('Cưới – dạm ngõ','cuoi-dam-ngo','Hoa cưới, tráp, dạm ngõ và lễ gia tiên',true,7)
on conflict (name) do nothing;

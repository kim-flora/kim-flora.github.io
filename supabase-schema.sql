-- KIM FLORA 2026 - SUPABASE SCHEMA
-- Chạy toàn bộ file này trong Supabase > SQL Editor một lần.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tag text,
  category text,
  material text,
  occasion text,
  tone text,
  size text,
  price numeric,
  description text,
  notes jsonb not null default '[]'::jsonb,
  gallery jsonb not null default '[]'::jsonb,
  image_url text,
  active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  email text,
  recipient_name text,
  recipient_phone text,
  address text not null,
  delivery_date date,
  delivery_time text,
  note text,
  items jsonb not null default '[]'::jsonb,
  amount numeric not null default 0,
  has_quote boolean not null default false,
  payment_method text not null default 'bank_transfer',
  payment_status text not null default 'pending',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$ select exists(select 1 from public.admins where user_id = auth.uid()); $$;

alter table public.products enable row level security;
alter table public.articles enable row level security;
alter table public.orders enable row level security;
alter table public.admins enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (active = true or public.is_admin());
drop policy if exists "admin write products" on public.products;
create policy "admin write products" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read active articles" on public.articles;
create policy "public read active articles" on public.articles for select using (active = true or public.is_admin());
drop policy if exists "admin write articles" on public.articles;
create policy "admin write articles" on public.articles for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "create orders" on public.orders;
create policy "create orders" on public.orders for insert with check (user_id is null or user_id = auth.uid());
drop policy if exists "customer read own orders" on public.orders;
create policy "customer read own orders" on public.orders for select using (public.is_admin() or (auth.uid() is not null and user_id = auth.uid()));
drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read own admin record" on public.admins;
create policy "admin read own admin record" on public.admins for select using (user_id = auth.uid());

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select using (true);
drop policy if exists "admin write settings" on public.site_settings;
create policy "admin write settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

-- Storage buckets
insert into storage.buckets (id,name,public) values ('product-images','product-images',true) on conflict (id) do update set public=true;
insert into storage.buckets (id,name,public) values ('site-assets','site-assets',true) on conflict (id) do update set public=true;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects for select using (bucket_id in ('product-images','site-assets'));
drop policy if exists "admin upload images" on storage.objects;
create policy "admin upload images" on storage.objects for insert with check (bucket_id in ('product-images','site-assets') and public.is_admin());
drop policy if exists "admin update images" on storage.objects;
create policy "admin update images" on storage.objects for update using (bucket_id in ('product-images','site-assets') and public.is_admin());
drop policy if exists "admin delete images" on storage.objects;
create policy "admin delete images" on storage.objects for delete using (bucket_id in ('product-images','site-assets') and public.is_admin());


-- Giữ 4 mẫu đang có trên website khi vừa kết nối Supabase
insert into public.products (title,tag,category,material,occasion,tone,size,price,description,notes,gallery,image_url,active,featured,sort_order)
select * from (values
('Kệ Bánh Kẹo Khai Trương Hồng Phát Tone Vàng Pastel','Quà tặng • Hoa & bánh kẹo','Quà tặng','Bánh kẹo & quà tặng','Khai trương · Chúc mừng','Vàng pastel – kem – tím pastel','Kệ đứng / theo yêu cầu',null::numeric,'Mẫu kệ quà nhiều tầng, phối bánh kẹo và vật liệu trang trí theo tone pastel.','["Có thể điều chỉnh số lượng quà và kích thước theo ngân sách.","Mẫu bao bì hoặc loại quà có thể thay đổi theo nguồn hàng thực tế."]'::jsonb,'["sp1.jpg"]'::jsonb,'sp1.jpg',true,true,1),
('Kệ Hoa Chúc Mừng Happy Wedding Tone Hồng Kem Sang Trọng','Hoa theo dịp • Cưới – dạm ngõ','Kệ & trụ hoa','Hoa thiết kế','Cưới · Dạm ngõ · Chúc mừng','Hồng phấn – kem – trắng','Kệ đứng / theo yêu cầu',null::numeric,'Mẫu kệ hoa tone hồng kem nhẹ, bố cục mềm và thanh lịch.','["Hoa thực tế có thể thay bằng hoa tương đương theo mùa.","Có thể chỉnh tone hồng nhạt hơn, kem nhiều hơn hoặc thêm xanh xô thơm."]'::jsonb,'["sp2.jpg"]'::jsonb,'sp2.jpg',true,true,2),
('Kệ Quà Bánh Kẹo & Đèn Lồng Sự Kiện Trung Thu Đoàn Viên','Hoa theo dịp • Ngày lễ / sự kiện','Quà tặng','Bánh kẹo & quà sự kiện','Trung Thu · Sự kiện · Chúc mừng','Đỏ – cam – xanh – vàng','Kệ đứng / theo ngân sách',null::numeric,'Mẫu kệ quà Trung Thu nhiều màu, kết hợp bánh kẹo và chi tiết trang trí theo chủ đề lễ hội.','["Có thể tăng hoặc giảm số lượng quà theo ngân sách.","Chi tiết trang trí theo mùa có thể thay đổi nhưng giữ tinh thần Trung Thu."]'::jsonb,'["sp3.jpg"]'::jsonb,'sp3.jpg',true,true,3),
('Bó Hoa Tone Trắng Thuần Khiết Size Lớn','Bó hoa • Bó nghệ thuật','Bó hoa','Hoa tươi','Sinh nhật · Kỷ niệm · Chúc mừng','Trắng – kem – xanh dịu','Bó lớn',null::numeric,'Mẫu bó hoa size lớn với bảng màu trắng kem, tập trung vào cảm giác sạch, thanh lịch và nhẹ nhàng.','["Hoa thực tế có thể thay đổi theo độ nở, mùa và nguồn hàng.","Có thể điều chỉnh kích thước bó và tỷ lệ giấy theo ngân sách."]'::jsonb,'["sp4.jpg"]'::jsonb,'sp4.jpg',true,true,4)
) as v(title,tag,category,material,occasion,tone,size,price,description,notes,gallery,image_url,active,featured,sort_order)
where not exists (select 1 from public.products);

-- Hai bài chăm hoa mặc định (chỉ thêm nếu bảng đang trống)
insert into public.articles (title,content,active,sort_order)
select 'Cách dưỡng hoa tươi sau khi nhận','Đặt hoa ở nơi mát, tránh nắng trực tiếp và luồng máy lạnh thổi mạnh. Với bình nước, thay nước sạch mỗi ngày và cắt lại gốc 1–2 cm. Với giỏ/hộp cắm foam, châm nước từ từ vào phần foam mỗi ngày, tránh làm ướt cánh hoa.',true,1
where not exists (select 1 from public.articles);
insert into public.articles (title,content,active,sort_order)
select 'Cách bảo quản hoa sáp','Để hoa nơi khô thoáng, tránh nắng gắt, hơi nước và nơi quá nóng. Không xịt nước hoặc nước hoa trực tiếp lên cánh. Khi có bụi, dùng cọ mềm hoặc máy sấy chế độ gió mát ở khoảng cách vừa phải.',true,2
where not exists (select 1 from public.articles where title='Cách bảo quản hoa sáp');

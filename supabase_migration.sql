-- SQL Migration / Schema Setup File for Smart Café Management System

-- Enable uuid-ossp extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (stores user information and links to supabase auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text not null,
  role text not null check (role in ('student', 'staff', 'admin')),
  avatar_url text,
  student_id text,
  department text,
  phone text,
  wallet_balance numeric(10,2) not null default 0.00 check (wallet_balance >= 0),
  dietary_preferences jsonb default '{"allergens": [], "isHalal": true, "isVegan": false, "isVegetarian": false, "isGlutenFree": false, "dailyCalorieTarget": 2000}'::jsonb,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- 2. CATEGORIES Table
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

-- 3. MENU ITEMS Table
create table if not exists public.menu_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories on delete set null,
  category_name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  prep_time_minutes integer not null default 10,
  image_url text,
  is_available boolean not null default true,
  is_special boolean not null default false,
  is_popular boolean not null default false,
  rating numeric(3,2) not null default 5.00,
  review_count integer not null default 0,
  dietary_tags text[] default '{}'::text[],
  allergens text[] default '{}'::text[],
  nutrition jsonb default '{"calories": 0, "proteinGrams": 0, "carbsGrams": 0, "fatGrams": 0}'::jsonb,
  customization_groups jsonb default '[]'::jsonb,
  stock_quantity integer not null default 50,
  min_stock_alert integer not null default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.menu_items enable row level security;

-- 4. ORDERS Table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text not null unique,
  student_id uuid references public.profiles on delete set null,
  student_name text not null,
  student_email text not null,
  student_phone text,
  student_id_card_number text,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0.00,
  coupon_code text,
  total numeric(10,2) not null,
  payment_method text not null check (payment_method in ('bkash_nagad', 'card', 'cash')),
  payment_status text not null check (payment_status in ('paid', 'unpaid', 'refunded')),
  order_status text not null check (order_status in ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  pickup_time_slot text not null,
  qr_code_data text not null,
  estimated_ready_time text,
  kitchen_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

-- 5. ORDER ITEMS Table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete cascade not null,
  food_id uuid references public.menu_items on delete set null,
  food_name text not null,
  food_image text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  selected_options_text text,
  special_instructions text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.order_items enable row level security;

-- 6. CARTS Table
create table if not exists public.carts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  items jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.carts enable row level security;

-- 7. PAYMENT GATEWAYS Table (dynamic gateway config)
create table if not exists public.payment_gateways (
  id uuid default uuid_generate_v4() primary key,
  gateway_name text not null unique, -- 'bkash', 'nagad', 'rocket', 'card_ssl'
  merchant_id text,
  api_key text,
  api_secret text,
  environment text default 'sandbox', -- 'sandbox' or 'production'
  is_enabled boolean not null default true,
  manual_number text, -- SendMoney or Merchant number for MFS
  callback_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payment_gateways enable row level security;

-- 8. PAYMENTS Table
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete set null,
  student_id uuid references public.profiles on delete set null,
  gateway text not null,
  transaction_id text not null unique,
  amount numeric(10,2) not null,
  status text not null check (status in ('pending', 'success', 'failed')),
  payment_details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments enable row level security;

-- 9. NOTIFICATIONS Table
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  title text not null,
  message text not null,
  type text not null check (type in ('order_status', 'stock_alert', 'promo', 'system')),
  read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

-- 10. SYSTEM SETTINGS Table
create table if not exists public.settings (
  id text primary key, -- usually 'cafeteria'
  is_accepting_orders boolean not null default true,
  opening_time text not null default '07:30 AM',
  closing_time text not null default '08:30 PM',
  slot_interval_minutes integer not null default 10,
  max_orders_per_slot integer not null default 20,
  tax_rate_percent numeric(5,2) not null default 0.00,
  student_discount_percent numeric(5,2) not null default 5.00,
  announcement_banner text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.settings enable row level security;

-- 11. AUDIT LOGS Table
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_role text not null,
  user_name text not null,
  action text not null,
  details text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;

-- 12. COUPONS Table
create table if not exists public.coupons (
  id uuid default uuid_generate_v4() primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null,
  min_order_value numeric(10,2) not null default 0.00,
  max_discount numeric(10,2),
  valid_until timestamp with time zone,
  is_active boolean not null default true,
  usage_count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.coupons enable row level security;

-- 13. REVIEWS Table
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  food_id uuid references public.menu_items on delete set null,
  food_name text not null,
  student_id uuid references public.profiles on delete set null,
  student_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;


-- ==================== ROW LEVEL SECURITY (RLS) POLICIES ====================

-- Trigger to automatically update updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute procedure public.handle_updated_at();
create trigger settings_updated_at before update on public.settings for each row execute procedure public.handle_updated_at();

-- PROFILES policies
create policy "Allow public read access to active profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow full admin access on profiles" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- CATEGORIES policies
create policy "Allow public read access to categories" on public.categories
  for select using (true);

create policy "Allow admins to modify categories" on public.categories
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- MENU ITEMS policies
create policy "Allow public read access to menu items" on public.menu_items
  for select using (true);

create policy "Allow kitchen staff to read and update availability" on public.menu_items
  for update using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role in ('staff', 'admin')
    )
  );

create policy "Allow admins full access to menu items" on public.menu_items
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- ORDERS policies
create policy "Allow students to read their own orders" on public.orders
  for select using (auth.uid() = student_id);

create policy "Allow students to create orders" on public.orders
  for insert with check (auth.uid() = student_id);

create policy "Allow kitchen staff to read and update all orders" on public.orders
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role in ('staff', 'admin')
    )
  );

-- ORDER ITEMS policies
create policy "Allow select access to own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where public.orders.id = order_id and public.orders.student_id = auth.uid()
    ) or exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role in ('staff', 'admin')
    )
  );

create policy "Allow insert of order items" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where public.orders.id = order_id and public.orders.student_id = auth.uid()
    )
  );

-- NOTIFICATIONS policies
create policy "Allow users to read their own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Allow users to update (read state) their own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create policy "Allow admins and system actions to insert notifications" on public.notifications
  for insert with check (true);

-- SYSTEM SETTINGS policies
create policy "Allow public read to settings" on public.settings
  for select using (true);

create policy "Allow admins to update settings" on public.settings
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- COUPONS policies
create policy "Allow public read of coupons" on public.coupons
  for select using (true);

create policy "Allow admins full access to coupons" on public.coupons
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- REVIEWS policies
create policy "Allow public read of reviews" on public.reviews
  for select using (true);

create policy "Allow students to insert reviews" on public.reviews
  for insert with check (auth.uid() = student_id);

create policy "Allow admins to moderate reviews" on public.reviews
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

-- PAYMENT GATEWAYS policies
create policy "Allow admins full access to gateways" on public.payment_gateways
  for all using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

create policy "Allow read access to active gateways for registered users" on public.payment_gateways
  for select using (true);

-- PAYMENTS policies
create policy "Allow student read own payments" on public.payments
  for select using (auth.uid() = student_id);

create policy "Allow student insert payment" on public.payments
  for insert with check (auth.uid() = student_id);

create policy "Allow staff/admin select payments" on public.payments
  for select using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role in ('staff', 'admin')
    )
  );

-- AUDIT LOGS policies
create policy "Allow admins to view audit logs" on public.audit_logs
  for select using (
    exists (
      select 1 from public.profiles
      where public.profiles.id = auth.uid() and public.profiles.role = 'admin'
    )
  );

create policy "Allow system logging" on public.audit_logs
  for insert with check (true);

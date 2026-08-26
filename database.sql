-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['student'::text, 'staff'::text, 'admin'::text])),
  avatar_url text,
  student_id text,
  department text,
  phone text,
  wallet_balance numeric NOT NULL DEFAULT 0.00 CHECK (wallet_balance >= 0::numeric),
  dietary_preferences jsonb DEFAULT '{"isHalal": true, "isVegan": false, "allergens": [], "isGlutenFree": false, "isVegetarian": false, "dailyCalorieTarget": 2000}'::jsonb,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  image text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.menu_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category_id uuid,
  category_name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0::numeric),
  prep_time_minutes integer NOT NULL DEFAULT 10,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  is_special boolean NOT NULL DEFAULT false,
  is_popular boolean NOT NULL DEFAULT false,
  rating numeric NOT NULL DEFAULT 5.00,
  review_count integer NOT NULL DEFAULT 0,
  dietary_tags ARRAY DEFAULT '{}'::text[],
  allergens ARRAY DEFAULT '{}'::text[],
  nutrition jsonb DEFAULT '{"calories": 0, "fatGrams": 0, "sodiumMg": 0, "carbsGrams": 0, "proteinGrams": 0}'::jsonb,
  customization_groups jsonb DEFAULT '[]'::jsonb,
  stock_quantity integer NOT NULL DEFAULT 50,
  min_stock_alert integer NOT NULL DEFAULT 10,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  order_count integer NOT NULL DEFAULT 0,
  CONSTRAINT menu_items_pkey PRIMARY KEY (id),
  CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_number text NOT NULL UNIQUE,
  student_id uuid,
  student_name text NOT NULL,
  student_email text NOT NULL,
  student_phone text,
  student_id_card_number text,
  subtotal numeric NOT NULL,
  discount numeric NOT NULL DEFAULT 0.00,
  coupon_code text,
  total numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['bkash_nagad'::text, 'card'::text, 'cash'::text])),
  payment_status text NOT NULL CHECK (payment_status = ANY (ARRAY['paid'::text, 'unpaid'::text, 'refunded'::text])),
  order_status text NOT NULL CHECK (order_status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'preparing'::text, 'ready'::text, 'completed'::text, 'cancelled'::text])),
  pickup_time_slot text NOT NULL,
  qr_code_data text NOT NULL,
  estimated_ready_time text,
  kitchen_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
  food_id uuid,
  food_name text NOT NULL,
  food_image text,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  selected_options_text text,
  special_instructions text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_items_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.menu_items(id)
);
CREATE TABLE public.settings (
  id text NOT NULL,
  is_accepting_orders boolean NOT NULL DEFAULT true,
  opening_time text NOT NULL DEFAULT '07:30 AM'::text,
  closing_time text NOT NULL DEFAULT '08:30 PM'::text,
  slot_interval_minutes integer NOT NULL DEFAULT 10,
  max_orders_per_slot integer NOT NULL DEFAULT 20,
  tax_rate_percent numeric NOT NULL DEFAULT 0.00,
  student_discount_percent numeric NOT NULL DEFAULT 5.00,
  announcement_banner text,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_role text NOT NULL,
  user_name text NOT NULL,
  action text NOT NULL,
  details text,
  timestamp timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.coupons (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type = ANY (ARRAY['percentage'::text, 'fixed'::text])),
  discount_value numeric NOT NULL,
  min_order_value numeric NOT NULL DEFAULT 0.00,
  max_discount numeric,
  valid_until timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT coupons_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  food_id uuid,
  food_name text NOT NULL,
  student_id uuid,
  student_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.menu_items(id),
  CONSTRAINT reviews_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id)
);

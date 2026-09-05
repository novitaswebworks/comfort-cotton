-- 1. Create the products table
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  price numeric NOT NULL,
  material text NOT NULL,
  tag text UNIQUE NOT NULL,
  image_url text NOT NULL,
  zoom_image_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) on the table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view products" 
ON products FOR SELECT 
USING (true);

-- 3. Create the Storage Bucket for images
insert into storage.buckets (id, name, public) 
values ('products', 'products', true);

-- 4. Enable RLS on the Storage Bucket (public read, admin write)
CREATE POLICY "Public can view images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

-- Note: Our Next.js backend uses the Service Role Key to bypass RLS for inserts/deletes, 
-- so we do not need to create complex insert policies.

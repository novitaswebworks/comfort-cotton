insert into public.products (name, type, price, material, description, tag, category, status, image_url, zoom_image_url, pillow_image_url) values
('Royal Navy', 'Double • 90×100 inches', 2499, '100% Premium Cotton • 300 TC', 'Deep navy percale with a crisp hand and a clean, hotel-style drape.', 'DBL-NAVY', 'Double bed king size', 'Published',
 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=90', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1200&q=80'),
('Cloud White', 'Double • 90×100 inches', 2799, '100% Egyptian Cotton • 400 TC', 'Soft, breathable white sateen that gets better with every wash.', 'DBL-WHITE', 'Double bed king size', 'Published',
 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1600&q=90', ''),
('Midnight Garden', 'Double • 90×100 inches', 3199, '100% Organic Cotton • 350 TC', 'A quiet botanical print on organic cotton.', 'DBL-GARDEN', 'Double bed queen size', 'Published',
 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=90', ''),
('Sage Bliss', 'Single • 60×90 inches', 1499, '100% Premium Cotton • 250 TC', 'Muted sage with a soft brushed finish.', 'SGL-SAGE', 'Single Bed with Pillow cover', 'Published',
 'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=1200&q=80', 'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=1600&q=90', 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=1200&q=80'),
('Blush Rose', 'Single • 60×90 inches', 1699, '100% Egyptian Cotton • 300 TC', 'Blush pink sateen for a calm, warm bedroom.', 'SGL-ROSE', 'Single Bed without pillow cover', 'Published',
 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1600&q=90', ''),
('Arctic Grey (draft)', 'Single • 60×90 inches', 1899, '100% Organic Cotton • 350 TC', null, 'SGL-GREY', 'Single Bed without pillow cover', 'Draft',
 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1600&q=90', '')
on conflict (tag) do nothing;

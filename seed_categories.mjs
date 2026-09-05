// Quick script to add new columns and seed demo products with categories
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing env vars. Run with: node --env-file=.env.local seed_categories.mjs');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🌱 Seeding demo products...');

  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const demoProducts = [
    {
      name: 'Royal Navy',
      type: 'Double • 90×100 inches',
      price: 2499,
      material: '100% Premium Cotton • 300 TC',
      tag: 'DBL-NAVY',
      category: 'Double Bedsheet',
      image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
      zoom_image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=90',
      pillow_image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
    },
    {
      name: 'Cloud White',
      type: 'Double • 90×100 inches',
      price: 2799,
      material: '100% Egyptian Cotton • 400 TC',
      tag: 'DBL-WHITE',
      category: 'Double Bedsheet',
      image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
      zoom_image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=90',
      pillow_image_url: 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800&q=80',
    },
    {
      name: 'Midnight Garden',
      type: 'Double • 90×100 inches',
      price: 3199,
      material: '100% Organic Cotton • 350 TC',
      tag: 'DBL-GARDEN',
      category: 'Double Bedsheet',
      image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
      zoom_image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=90',
      pillow_image_url: '',
    },
    {
      name: 'Sage Bliss',
      type: 'Single • 60×90 inches',
      price: 1499,
      material: '100% Premium Cotton • 250 TC',
      tag: 'SGL-SAGE',
      category: 'Single Bedsheet',
      image_url: 'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=800&q=80',
      zoom_image_url: 'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=1200&q=90',
      pillow_image_url: 'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800&q=80',
    },
    {
      name: 'Blush Rose',
      type: 'Single • 60×90 inches',
      price: 1699,
      material: '100% Egyptian Cotton • 300 TC',
      tag: 'SGL-ROSE',
      category: 'Single Bedsheet',
      image_url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
      zoom_image_url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=90',
      pillow_image_url: '',
    },
    {
      name: 'Arctic Grey',
      type: 'Single • 60×90 inches',
      price: 1899,
      material: '100% Organic Cotton • 350 TC',
      tag: 'SGL-GREY',
      category: 'Single Bedsheet',
      image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
      zoom_image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=90',
      pillow_image_url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
    },
  ];

  const { data, error } = await supabase.from('products').insert(demoProducts).select();

  if (error) {
    console.error('❌ Failed to seed:', error.message);
  } else {
    console.log(`✅ Successfully seeded ${data.length} products!`);
    console.log('   - Double Bedsheets:', data.filter(p => p.category === 'Double Bedsheet').length);
    console.log('   - Single Bedsheets:', data.filter(p => p.category === 'Single Bedsheet').length);
  }
}

main();

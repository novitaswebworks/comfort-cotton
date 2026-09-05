import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(supabaseUrl, supabaseKey);
const adminClient = createClient(supabaseUrl, serviceKey);

async function test() {
  console.log("Testing Admin Client (bypasses RLS):");
  const { data: adminData, error: adminErr } = await adminClient.from('products').select('*');
  console.log("Admin Data length:", adminData?.length, "Error:", adminErr?.message);

  console.log("\nTesting Public Client (respects RLS):");
  const { data: publicData, error: publicErr } = await anonClient.from('products').select('*');
  console.log("Public Data length:", publicData?.length, "Error:", publicErr?.message);
}

test();

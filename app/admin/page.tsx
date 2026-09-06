import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Users } from "lucide-react";

export default async function AdminDashboard() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch quick stats using admin key to bypass RLS
  const { count: productCount } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-zinc-500 mt-2">Welcome back to the Comfort Cottons control center.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Products</CardTitle>
            <Package className="w-4 h-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{productCount || 0}</div>
            <p className="text-xs text-zinc-500 mt-1">Live on storefront</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">WhatsApp Inquiries</CardTitle>
            <TrendingUp className="w-4 h-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Unmetered</div>
            <p className="text-xs text-zinc-500 mt-1">Direct to your phone</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Security</CardTitle>
            <Users className="w-4 h-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Locked</div>
            <p className="text-xs text-zinc-500 mt-1">Clerk Auth Active</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

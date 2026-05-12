import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar userEmail={user?.email} />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

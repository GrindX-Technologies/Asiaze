import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  return (
    <div className="flex h-screen bg-[#F8F8F8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64">
        <Topbar token={token} />
        <main className="flex-1 overflow-y-auto bg-[#F8F8F8] p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
import { DashboardHeader } from "./_components/dashboard-header";
import { DashboardSidebar } from "./_components/dashboard-sidebar";
import { RegistryProvider } from "@/components/core/registry-provider";
import { SlotRenderer } from "@/components/core/slot-renderer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RegistryProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <SlotRenderer slot="content:before" />
            {children}
            <SlotRenderer slot="content:after" />
          </main>
        </div>
      </div>
    </RegistryProvider>
  );
}

import { notFound } from "next/navigation";
import { DashboardView } from "@/components/socio-dashboard/DashboardView";
import { SocioDashboardBackNav } from "@/components/socio-dashboard/SocioDashboardBackNav";
import { getDashboard, getDashboardIds } from "@/config/socio-dashboards";

export function generateStaticParams() {
  return getDashboardIds().map((id) => ({ id }));
}

export default function SocioDashboardDetailPage({
  params,
}: {
  params: { lng: string; id: string };
}) {
  const config = getDashboard(params.id);
  if (!config) {
    notFound();
  }

  return (
    <div className="socio-dash-root min-h-screen bg-[var(--background)]">
      <SocioDashboardBackNav lng={params.lng} />
      <main className="socio-dash-safe-x mx-auto w-full min-w-0 max-w-[90rem] overflow-x-hidden px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5 sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8 lg:px-10">
        <DashboardView config={config} />
      </main>
    </div>
  );
}

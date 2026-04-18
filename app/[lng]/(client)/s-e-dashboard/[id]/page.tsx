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
      <main className="mx-auto w-full min-w-0 max-w-[90rem] overflow-x-hidden px-3 py-4 sm:px-5 sm:py-5 lg:px-8">
        <DashboardView config={config} />
      </main>
    </div>
  );
}

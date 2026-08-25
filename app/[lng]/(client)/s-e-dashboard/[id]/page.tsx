import { notFound } from "next/navigation";
import { DashboardView } from "@/components/socio-dashboard/DashboardView";
import { SocioDashboardBackNav } from "@/components/socio-dashboard/SocioDashboardBackNav";
import TableauViewTabs from "@/components/tableau/TableauViewTabs";
import { getDashboard, getDashboardIds } from "@/config/socio-dashboards";
import { fetchPriceTable } from "@/lib/commodity-price-dashboard/nso";
import { CommodityPriceDashboard } from "@/components/commodity-price-dashboard/dashboard";

export function generateStaticParams() {
  return getDashboardIds().map((id) => ({ id }));
}

export default async function SocioDashboardDetailPage(
  props: {
    params: Promise<{ lng: string; id: string }>;
  }
) {
  const params = await props.params;

  if (params.id === "commodity-price-and-producer-price") {
    try {
      const data = await fetchPriceTable();
      return (
        <div className="min-w-0 max-w-full overflow-x-hidden">
          <SocioDashboardBackNav lng={params.lng} />
          <CommodityPriceDashboard data={data} />
        </div>
      );
    } catch {
      return (
        <>
          <SocioDashboardBackNav lng={params.lng} />
          <p className="px-4 py-10 text-center text-sm text-red-600">
            Өгөгдөл татахад алдаа гарлаа. Дахин оролдоно уу.
          </p>
        </>
      );
    }
  }

  const config = getDashboard(params.id);
  if (!config) {
    notFound();
  }

  const tableauViews =
    config.tableauViews ??
    (config.tableauViewPath ? [{ path: config.tableauViewPath }] : []);

  return (
    <div className="socio-dash-root min-h-screen bg-[var(--background)]">
      <SocioDashboardBackNav lng={params.lng} />
      <main className="socio-dash-safe-x mx-auto w-full min-w-0 max-w-[90rem] overflow-x-hidden px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5 sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8 lg:px-10">
        {tableauViews.length > 0 ? (
          <>
            {/* <h1 className="mb-3 text-lg font-medium text-[var(--foreground)] sm:mb-4 sm:text-xl">
              {config.name}
            </h1> */}
            <TableauViewTabs views={tableauViews} height={900} />
          </>
        ) : (
          <DashboardView config={config} />
        )}
      </main>
    </div>
  );
}

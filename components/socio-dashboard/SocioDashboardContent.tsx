import { DashboardView } from "@/components/socio-dashboard/DashboardView";
import TableauViewTabs from "@/components/tableau/TableauViewTabs";
import { getDashboard } from "@/config/socio-dashboards";
import { fetchPriceTable } from "@/lib/commodity-price-dashboard/nso";
import { CommodityPriceDashboard } from "@/components/commodity-price-dashboard/dashboard";
import { CensusDashboard } from "@/components/census-dashboard/Dashboard";
import "@/components/socio-dashboard/socio-dashboard-shell.scss";

export function isSocioDashboardId(id: string) {
  return (
    id === "population-census" ||
    id === "commodity-price-and-producer-price" ||
    Boolean(getDashboard(id))
  );
}

export async function SocioDashboardContent({ id }: { id: string }) {
  if (id === "population-census") {
    return (
      <div className="min-w-0 max-w-full overflow-x-hidden">
        <CensusDashboard />
      </div>
    );
  }

  if (id === "commodity-price-and-producer-price") {
    try {
      const data = await fetchPriceTable();
      return (
        <div className="min-w-0 max-w-full overflow-x-hidden">
          <CommodityPriceDashboard data={data} />
        </div>
      );
    } catch {
      return (
        <p className="px-4 py-10 text-center text-sm text-red-600">
          Өгөгдөл татахад алдаа гарлаа. Дахин оролдоно уу.
        </p>
      );
    }
  }

  const config = getDashboard(id);
  if (!config) return null;

  const tableauViews =
    config.tableauViews ??
    (config.tableauViewPath ? [{ path: config.tableauViewPath }] : []);

  return (
    <div className="socio-dash-root min-h-screen bg-[var(--background)]">
      <main className="socio-dash-safe-x mx-auto w-full min-w-0 max-w-[90rem] overflow-x-hidden px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5 sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-8 lg:px-10">
        {tableauViews.length > 0 ? (
          <TableauViewTabs views={tableauViews} height={900} />
        ) : (
          <DashboardView config={config} />
        )}
      </main>
    </div>
  );
}

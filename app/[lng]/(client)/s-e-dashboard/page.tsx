import SocioEconomicDashboardHome from "@/components/socio-dashboard/SocioEconomicDashboardHome";

export default function SocioEconomicDashboardPage({
  params,
}: {
  params: { lng: string };
}) {
  return <SocioEconomicDashboardHome lng={params.lng} />;
}

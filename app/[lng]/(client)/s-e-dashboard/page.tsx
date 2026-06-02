import SocioEconomicDashboardHome from "@/components/socio-dashboard/SocioEconomicDashboardHome";

export default async function SocioEconomicDashboardPage(
  props: {
    params: Promise<{ lng: string }>;
  }
) {
  const params = await props.params;
  return <SocioEconomicDashboardHome lng={params.lng} />;
}

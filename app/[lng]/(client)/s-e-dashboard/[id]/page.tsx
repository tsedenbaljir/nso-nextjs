import { notFound } from "next/navigation";
import { SocioDashboardBackNav } from "@/components/socio-dashboard/SocioDashboardBackNav";
import {
  isSocioDashboardId,
  SocioDashboardContent,
} from "@/components/socio-dashboard/SocioDashboardContent";
import { getDashboardIds } from "@/config/socio-dashboards";

export function generateStaticParams() {
  return getDashboardIds().map((id) => ({ id }));
}

export default async function SocioDashboardDetailPage(props: {
  params: Promise<{ lng: string; id: string }>;
}) {
  const params = await props.params;
  if (!isSocioDashboardId(params.id)) notFound();

  return (
    <div className="min-w-0 max-w-full overflow-x-hidden">
      <SocioDashboardBackNav lng={params.lng} />
      <SocioDashboardContent id={params.id} />
    </div>
  );
}

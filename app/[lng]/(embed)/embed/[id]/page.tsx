import { notFound } from "next/navigation";
import {
  isSocioDashboardId,
  SocioDashboardContent,
} from "@/components/socio-dashboard/SocioDashboardContent";
import { getDashboard, getDashboardIds } from "@/config/socio-dashboards";

export function generateStaticParams() {
  return getDashboardIds().map((id) => ({ id }));
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const config = getDashboard(id);
  const title =
    id === "population-census"
      ? "Хүн амын тооллого"
      : id === "commodity-price-and-producer-price"
        ? "Зах зээлийн үнэ ба үйлдвэрлэгчийн үнэ"
        : config?.name ?? "Dashboard";
  return {
    title,
    robots: { index: false, follow: true },
  };
}

export default async function EmbedDashboardPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  if (!isSocioDashboardId(id)) notFound();
  return <SocioDashboardContent id={id} />;
}

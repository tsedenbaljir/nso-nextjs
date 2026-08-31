import { SudlaachIdCard } from "@/components/sudlaach-id/SudlaachIdCard";
import { getEmployeeCard, parseEmpId } from "@/app/lib/hr-emp";
import { sudlaachQrUrl } from "@/app/lib/sudlaach-qr";

export async function generateMetadata() {
  return {
    robots: { index: false, follow: false },
  };
}

export default async function SudlaachIdPage(props: {
  params: Promise<{ lng: string; empid: string }>;
}) {
  const { lng, empid } = await props.params;
  const qrUrl = sudlaachQrUrl(lng, empid);
  const empIdNum = parseEmpId(empid);
  const empResult = empIdNum ? await getEmployeeCard(empIdNum) : { ok: false };
  const initialEmp = empResult.ok ? empResult.emp : null;

  return (
    <SudlaachIdCard
      first={initialEmp?.givenName || ""}
      last={initialEmp?.surName || initialEmp?.familyName || ""}
      empId={empid}
      aimagCode={initialEmp?.aimagCode || ""}
      position=""
      positionName={initialEmp?.positionName || ""}
      qrUrl={qrUrl}
      initialEmp={initialEmp}
    />
  );
}

import { SudlaachIdCard } from "@/components/sudlaach-id/SudlaachIdCard";
import { getEmployeeCard, parseEmpId } from "@/app/lib/hr-emp";
import { sudlaachQrUrl } from "@/app/lib/sudlaach-qr";

type PageParams = {
  lng: string;
  first: string;
  last: string;
  empid: string;
  aimag: string;
  position: string[];
};

function decodePart(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

export async function generateMetadata() {
  return {
    robots: { index: false, follow: false },
  };
}

export default async function SudlaachQrPage(props: {
  params: Promise<PageParams>;
}) {
  const { lng, first, last, empid, aimag, position } = await props.params;
  const given = decodePart(first);
  const family = decodePart(last);
  const job = decodePart(position.filter(Boolean).join(" "));
  const qrUrl = sudlaachQrUrl(lng, empid);
  const empIdNum = parseEmpId(empid);
  const empResult = empIdNum ? await getEmployeeCard(empIdNum) : { ok: false };
  const initialEmp = empResult.ok ? empResult.emp : null;

  return (
    <SudlaachIdCard
      first={given}
      last={family}
      empId={empid}
      aimagCode={aimag}
      position={job}
      positionName={initialEmp?.positionName || ""}
      qrUrl={qrUrl}
      initialEmp={initialEmp}
    />
  );
}

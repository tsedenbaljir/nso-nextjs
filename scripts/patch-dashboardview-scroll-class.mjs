import fs from "fs";

const p = new URL("../components/socio-dashboard/DashboardView.tsx", import.meta.url);
let s = fs.readFileSync(p, "utf8");
const old =
  'className="flex flex-wrap items-center gap-3 justify-end pb-3 border-b border-slate-200 overflow-x-auto scrollbar-hide"';
const neu =
  'className="socio-dash-scroll-touch flex flex-wrap items-center gap-3 justify-end overflow-x-auto border-b border-slate-200 pb-3 scrollbar-hide"';
if (!s.includes(old)) {
  console.error("pattern missing");
  process.exit(1);
}
s = s.replace(old, neu);
fs.writeFileSync(p, s, "utf8");
const check = fs.readFileSync(p, "utf8");
console.log("has улс:", check.includes("улс:"));

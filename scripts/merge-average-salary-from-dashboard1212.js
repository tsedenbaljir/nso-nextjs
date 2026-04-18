/**
 * Splices average-salary chart block from dashboard1212 DashboardView into nso-nextjs (UTF-8).
 */
const fs = require("fs");
const path = require("path");

const srcPath = path.join(__dirname, "../../dashboard1212/components/DashboardView.tsx");
const dstPath = path.join(__dirname, "../components/socio-dashboard/DashboardView.tsx");

const srcLines = fs.readFileSync(srcPath, "utf8").replace(/\r\n/g, "\n").split("\n");
const dstLines = fs.readFileSync(dstPath, "utf8").replace(/\r\n/g, "\n").split("\n");

// dashboard1212: lines 7910–8283 (1-based) = indices 7909..8282 inclusive
const block = srcLines.slice(7909, 8283);

const startNeedle = 'if (config.id === "average-salary" && chart.id === "wages-region-area" && metaForChart)';
let start = dstLines.findIndex((l) => l.includes(startNeedle));
if (start < 0) {
  console.error("start marker not found");
  process.exit(1);
}
while (start > 0 && dstLines[start - 1].trimStart().startsWith("// Average-salary")) start -= 1;
const end = dstLines.findIndex((l, i) => i > start && l.trimStart().startsWith("// Household-survey:"));
if (end < 0) {
  console.error("end marker (Household-survey) not found");
  process.exit(1);
}

const out = [...dstLines.slice(0, start), ...block, ...dstLines.slice(end)];
const outStr = out.join("\n");
fs.writeFileSync(dstPath, outStr, "utf8");
new TextDecoder("utf-8", { fatal: true }).decode(fs.readFileSync(dstPath));
console.log("merged average-salary block", { lines: block.length, replaced: end - start });

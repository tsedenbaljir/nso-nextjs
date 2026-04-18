/**
 * Patches society-education in DashboardView.tsx without touching non-ASCII elsewhere.
 * Run: node scripts/fix-dashboardview-education.js
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../components/socio-dashboard/DashboardView.tsx");
let s = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");

// 1) 3-col grid: PrimeFlex .grid vs Tailwind — force Tailwind grid
const oldGrid = 'className="grid w-full grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-6"';
const newGrid =
  'className="!grid w-full min-w-0 grid-cols-1 gap-8 md:!grid-cols-3 md:gap-x-6 md:gap-y-6"';
if (!s.includes(oldGrid)) {
  console.error("grid pattern not found");
  process.exit(1);
}
s = s.replace(oldGrid, newGrid);

// 2) Union years for range slider
const startMark = "if (!slicerDataChart) return null;";
const endMark = "if (years.length < 2) return null;";
const si = s.indexOf(startMark);
const ei = s.indexOf(endMark, si);
if (si < 0 || ei < 0) {
  console.error("year block not found", { si, ei });
  process.exit(1);
}
const endInclusive = ei + endMark.length;
const oldYearChunk = s.slice(si, endInclusive);
if (!oldYearChunk.includes("slicerData.map")) {
  console.error("unexpected year chunk");
  process.exit(1);
}

const rowYearLine =
  '                    const rowYear = (r: DataRow) => String(r[xKey] ?? r[`${xKey}_code`] ?? "").trim();';
const newYearChunk = `if (!slicerDataChart || threeCharts.length === 0) return null;
                    const xKey = slicerDataChart.xDimension ?? "\u041E\u043D";
${rowYearLine}
                    const yearSet = new Set<string>();
                    const addYearsFromChart = (chart: (typeof charts)[0]) => {
                      const rows = (chart as { chartFixedQuery?: unknown }).chartFixedQuery
                        ? (processedChartData[chart.id] ?? [])
                        : (chartDataByChartId[chart.id] ?? []);
                      for (const r of rows) {
                        const y = rowYear(r);
                        if (y) yearSet.add(y);
                      }
                    };
                    for (const c of threeCharts) addYearsFromChart(c);
                    if (graduatesChart) addYearsFromChart(graduatesChart);
                    const years = [...yearSet].sort((a, b) =>
                      /^\\d+$/.test(a) && /^\\d+$/.test(b) ? Number(a) - Number(b) : String(a).localeCompare(b)
                    );
                    educationYearsRef.current = years;
                    if (years.length < 2) return null;`;

s = s.slice(0, si) + newYearChunk + s.slice(endInclusive);

// 3) Play button class (unique in file)
const oldBtnClass =
  'className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d9d9d9] bg-white text-[#4a4a4a] shadow-none transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"';
const nBtn = s.split(oldBtnClass).length - 1;
if (nBtn !== 1) {
  console.error("education play button class count", nBtn);
  process.exit(1);
}
s = s.replace(oldBtnClass, 'className="range-slider-play-btn"');

// 4) Slicer row gap (unique: min-h-9 flex-nowrap)
const oldGapDiv = 'className="flex min-h-9 flex-nowrap items-center gap-2 sm:gap-3"';
const newGapDiv = 'className="flex min-h-9 flex-nowrap items-center gap-3 sm:gap-4"';
if (s.split(oldGapDiv).length - 1 !== 1) {
  console.error("min-h-9 gap div count", s.split(oldGapDiv).length - 1);
  process.exit(1);
}
s = s.replace(oldGapDiv, newGapDiv);

// 5) Date labels + slider wrapper
const oldSpans =
  `                          <span className="min-w-[4.5rem] shrink-0 whitespace-nowrap text-left text-xs font-normal tabular-nums text-[#4a4a4a] dark:text-slate-300">\n                            {years[i0]}\n                          </span>\n                          <div className="min-w-0 flex-1 w-full">\n                            <RangeSlider`;
const newSpans =
  `                          <span className="min-w-[4.5rem] shrink-0 whitespace-nowrap text-left text-xs font-normal tabular-nums text-slate-700 dark:text-slate-200">\n                            {years[i0]}\n                          </span>\n                          <div className="min-w-0 w-full flex-1">\n                            <RangeSlider`;
if (!s.includes(oldSpans)) {
  console.error("spans/slider block not found");
  process.exit(1);
}
s = s.replace(oldSpans, newSpans);

const oldRight =
  `                          <span className="min-w-[4.5rem] shrink-0 whitespace-nowrap text-right text-xs font-normal tabular-nums text-[#4a4a4a] dark:text-slate-300">\n                            {years[i1]}\n                          </span>`;
const newRight =
  `                          <span className="min-w-[4.5rem] shrink-0 whitespace-nowrap text-right text-xs font-normal tabular-nums text-slate-700 dark:text-slate-200">\n                            {years[i1]}\n                          </span>`;
if (!s.includes(oldRight)) {
  console.error("right span not found");
  process.exit(1);
}
s = s.replace(oldRight, newRight);

// 6) SVG 14 → 12 (exactly two in education play)
const c14 = (s.match(/width="14" height="14"/g) || []).length;
if (c14 !== 2) {
  console.error("expected 2× svg 14, got", c14);
  process.exit(1);
}
s = s.replaceAll('width="14" height="14"', 'width="12" height="12"');

fs.writeFileSync(file, s, "utf8");
new TextDecoder("utf-8", { fatal: true }).decode(fs.readFileSync(file));

// Sanity: CPI labels must still be present
if (!s.includes('улс: "Улс"')) {
  console.error("CPI_LEVEL_LABELS corrupted");
  process.exit(1);
}
console.log("ok");

import type { DashboardConfig } from "@/lib/socio-dashboard/types";

function range(startOrCount: number, end?: number): string[] {
  if (end === undefined) {
    return Array.from({ length: startOrCount }, (_, i) => String(i));
  }
  return Array.from({ length: end - startOrCount }, (_, i) => String(startOrCount + i));
}

const POPULATION_PX_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population, household/1_Population, household/DT_NSO_0300_001V3.px";
/** Хүн ам хүйсээр, насны бүлгээр (Хүйс, Нас, Он) */
const POPULATION_BY_SEX_AGE_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population, household/1_Population, household/DT_NSO_0300_001V2.px";
const POPULATION_MAP_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population, household/1_Population, household/DT_NSO_0300_004V1.px";
const POPULATION_MOVEMENT_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population,%20household/2_Regular%20movement%20of%20population/DT_NSO_0300_013V1.px";
const POPULATION_MOVEMENT_V2_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population,%20household/2_Regular%20movement%20of%20population/DT_NSO_0300_013V2.px";
const POPULATION_024_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population,%20household/2_Regular%20movement%20of%20population/DT_NSO_0300_024V1.px";
/** Нас баралтын ерөнхий коэффициент — Хүйс, Бүс, Он */
const POPULATION_024_V2_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population,%20household/2_Regular%20movement%20of%20population/DT_NSO_0300_024V2.px";
const POPULATION_039_V1_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population,%20household/2_Regular%20movement%20of%20population/DT_NSO_0300_039V1.px";
/** Дундаж наслалт — Хүйс, Аймаг, Он */
const LIFE_EXPECTANCY_MAP_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population,%20household/2_Regular%20movement%20of%20population/DT_NSO_0300_030V1.px";

/** Хүн амын тоо — Бүс/Он/Хүйсээр (газрын зураг болон тоо харуулахад) */
const POPULATION_MAP_029_V3_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population,%20household/2_Regular%20movement%20of%20population/DT_NSO_0300_029V3.px";
/** Өрхийн тоо — Бүс, Он */
const POPULATION_HOUSEHOLD_COUNT_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population,%20household/1_Population,%20household/DT_NSO_0300_006V2.px";
/** Гэрлэлт, цуцлалтын тоо — Гэрлэлтийн байдал, Бүс, Он */
const POPULATION_MARRIAGE_DIVORCE_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population,%20household/2_Regular%20movement%20of%20population/DT_NSO_0300_018V1.px";
/** Гэрлэлт, цуцлалт — 1000 хүнд ногдох. Гэр бүлийн байдал, Бүс, Он */
const POPULATION_MARRIAGE_DIVORCE_PER_1000_URL =
  "https://data.1212.mn/api/v1/mn/NSO/Population,%20household/2_Regular%20movement%20of%20population/DT_NSO_0300_020V1.px";
const CPI_BASE =
  "https://data.1212.mn/api/v1/mn/NSO/Economy,%20environment/Consumer%20Price%20Index";
const CPI_URL_BY_LEVEL = {
  улс: `${CPI_BASE}/DT_NSO_0600_010V1.px`,
  нийслэл: `${CPI_BASE}/DT_NSO_0600_012V1.px`,
  аймаг: `${CPI_BASE}/DT_NSO_0303_07V8.px`,
} as const;
const CPI_MONTHLY_URL_BY_LEVEL = {
  улс: `${CPI_BASE}/DT_NSO_0600_009V1.px`,
  нийслэл: `${CPI_BASE}/DT_NSO_0600_003V4.px`,
  аймаг: `${CPI_BASE}/DT_NSO_0303_07V7.px`,
} as const;

const CPI_DETAILED_URL = `${CPI_BASE}/DT_NSO_0600_019V1.px`;
/** Гол нэрийн барааны үнэ — Бүтээгдэхүүн, Хугацаа */
const CPI_COMMODITY_PRICES_URL = `${CPI_BASE}/DT_NSO_0600_001V4.px`;
const BASE_URL = "https://data.1212.mn/api/v1/mn/NSO/";
const PPI_INDUSTRIAL_URL = `${BASE_URL}Economy, environment/Producer price index/CHANGES OF INDUSTRIAL PRODUCER PRICE INDEX/DT_NSO_1100_016V4_1.px`;
const PPI_TRANSPORT_URL = `${BASE_URL}Economy, environment/Producer price index/CHANGES OF PRODUCER PRICE INDEX OF TRANSPORTATION SECTOR/DT_NSO_1100_015V7_1.px`;
const PPI_INFO_COMM_URL = `${BASE_URL}Economy, environment/Producer price index/CHANGES OF PRODUCER PRICE INDEX OF INFORMATION AND COMMUNICATION SECTOR/DT_NSO_1100_015V5_1.px`;
const PPI_ACCOMMODATION_URL = `${BASE_URL}Economy, environment/Producer price index/CHANGES OF PRODUCER PRICE INDEX OF ACCOMMODATION SECTOR/DT_NSO_1100_015V4_1.px`;
const PPI_FOOD_SERVICE_URL = `${BASE_URL}Economy, environment/Producer price index/CHANGES OF PRODUCER PRICE INDEX OF FOOD AND BEVERAGE SERVICE SECTOR/DT_NSO_1100_015V6_1.px`;

const HOUSING_PRICE_INDEX_URL = `${BASE_URL}Economy,%20environment/Housing%20price%20index/DT_NSO_0300_071V0.px`;
const HOUSING_PRICE_CHANGE_URL = `${BASE_URL}Economy,%20environment/Housing%20price%20index/DT_NSO_0300_00V1.px`;
const HOUSING_PRICE_BY_DISTRICT_URL = `${BASE_URL}Economy,%20environment/Housing%20price%20index/DT_NSO_0300_00V4.px`;

const GDP_URL = `${BASE_URL}Economy, environment/National Accounts/DT_NSO_0500_001V1.px`;
/** ДНБ улирлаар, бүрэлдэхүүнээр */
const GDP_QUARTER_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy, environment/National Accounts/DT_NSO_0500_003V1_quarter.px";
/** ДНБ-ийн салбарын бүтэц, салбараар */
const GDP_SECTOR_STRUCTURE_URL = `${BASE_URL}Economy, environment/National Accounts/DT_NSO_0500_002V1.px`;
/** Нэг хүнд ногдох ДНБ, аймаг, нийслэл, жилээр */
const GDP_PER_CAPITA_URL = `${BASE_URL}Economy, environment/National Accounts/DT_NSO_0500_011V1.px`;
/** Нэг ажиллагчид ногдох ДНБ, эдийн засгийн салбар, жилээр */
const GDP_PER_WORKER_URL = `${BASE_URL}Economy, environment/Productivity/DT_NSO_0500_010V2.px`;
/** Нэг хүнд ногдох ДНБ, ам.доллар */
const GDP_PER_CAPITA_USD_URL = `${BASE_URL}Economy, environment/National Accounts/DT_NSO_0500_010V1.px`;

const UNEMPLOYMENT_URL = `${BASE_URL}Labour,%20business/Labour/LABOUR%20UNDERUTILIZATION%20RATE,%20by%20sex,%20age%20group,%20aimags%20and%20the%20Capital/DT_NSO_0400_020V2_2.px`;
const LABOUR_PARTICIPATION_URL = `${BASE_URL}Labour,%20business/Labour/LABOUR%20FORCE%20PARTICIPATION%20RATE,%20by%20sex,%20age%20group,%20aimags%20and%20the%20Capital/DT_NSO_0400_018V1_2.px`;
const OUTSIDE_LABOUR_FORCE_URL = `${BASE_URL}Labour,%20business/Labour/PERSONS%20OUTSIDE%20THE%20LABOUR%20FORCE,%20by%20reason,%20by%20sex,%20age%20group,%20aimags%20and%20the%20Capital/DT_NSO_0400_036V1_2.px`;
const UNEMPLOYED_URL = `${BASE_URL}Labour,%20business/Labour/UNEMPLOYED,%20by%20reason,%20sex,%20age%20group,%20aimags%20and%20the%20Capital/DT_NSO_0400_036V0_2.px`;
const EMPLOYMENT_URL = `${BASE_URL}Labour,%20business/Labour/EMPLOYMENT,%20by%20economic%20activities,%20sex,%20age%20group,%20aimags%20and%20the%20Capital/DT_NSO_0400_035V7_2.px`;
const EMPLOYMENT_INDICATORS_URL = `${BASE_URL}Labour,%20business/Labour/EMPLOYMENT%20INDICATORS%20OF%20POPULATION%20AGED%2015%20AND%20OVER,%20by%20national%20level/DT_NSO_0400_006V1_2.px`;

const HOUSEHOLD_INCOME_V1_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_001V1.px`;
const HOUSEHOLD_INCOME_V2_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_001V2.px`;
const HOUSEHOLD_INCOME_018_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_018V1.px`;
const HOUSEHOLD_003_V1_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_003V1.px`;
const HOUSEHOLD_003_V2_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_003V2.px`;
const HOUSEHOLD_020_V1_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_020V1.px`;
const HOUSEHOLD_002_V1_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_002V1.px`;
const HOUSEHOLD_002_V2_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_002V2.px`;
const HOUSEHOLD_019_V1_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_019V1.px`;
const HOUSEHOLD_004_V1_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_004V1.px`;
const HOUSEHOLD_004_V2_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_004V2.px`;
const HOUSEHOLD_021_V1_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_021V1.px`;
const POVERTY_036_V1_URL = `${BASE_URL}Society,%20development/Poverty,%20inequality%20and%20minimum%20subsistence%20level/DT_NSO_1900_036V1.px`;
const GINI_036_V2_URL = `${BASE_URL}Society,%20development/Household%20income%20and%20expenditure/DT_NSO_1900_036V2.px`;

const WAGES_025_V2_URL = `${BASE_URL}Labour,%20business/Wages/MONTHLY%20AVERAGE%20NOMINAL%20WAGES,%20by%20occupation%20and%20gender/DT_NSO_0400_025V2.px`;
const WAGES_021_V2_URL = `${BASE_URL}Labour,%20business/Wages/MONTHLY%20AVERAGE%20NOMINAL%20WAGES,%20by%20region,%20aimags%20and%20the%20Capital,%20by%20gender/DT_NSO_0400_021V2.px`;
const WAGES_069_V2_URL = `${BASE_URL}Labour,%20business/Wages/MONTHLY%20MEDIAN%20WAGES%20OF%20EMPLOYEES/DT_NSO_0400_069V2-1.px`;
const WAGES_023_V2_URL = `${BASE_URL}Labour,%20business/Wages/MONTHLY%20AVERAGE%20NOMINAL%20WAGES%20,%20by%20type%20of%20ownership%20and%20gender/DT_NSO_0400_023V2.px`;
const WAGES_069_V1_URL = `${BASE_URL}Labour,%20business/Wages/EMPLOYEES,%20by%20group%20of%20wages,and%20share%20to%20total/DT_NSO_0400_069V1.px`;
const WAGES_038_V2_URL = `${BASE_URL}Labour,%20business/Wages/MONTHLY%20AVERAGE%20NOMINAL%20WAGES%20OF%20EMPLOYEE,%20by%20employees%20size%20class%20and%20gender/DT_NSO_0400_038V2.px`;
const WAGES_022_V2_URL = `${BASE_URL}Labour,%20business/Wages/MONTHLY%20AVERAGE%20NOMINAL%20WAGES,%20by%20division%20of%20economic%20activities/DT_NSO_0400_022V2.px`;
const WAGES_024_V2_URL = `${BASE_URL}Labour,%20business/Wages/MONTHLY%20AVERAGE%20NOMINAL%20WAGES%20,%20by%20legal%20status%20and%20gender/DT_NSO_0400_024V2.px`;
const WAGES_036_V2_URL = `${BASE_URL}Labour,%20business/Wages/REAL%20WAGE%20INDEX%20(2015=100),%20by%20divisions%20of%20economic%20activities/DT_NSO_0400_036V2.px`;

/** Улсын төсвийн орлого */
const BUDGET_INCOME_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Government%20budget/DT_NSO_0800_002V1.px";
/** Улсын төсвийн зарлага */
const BUDGET_EXPENSE_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Government%20budget/DT_NSO_0800_005V1.px";
/** Улсын нэгдсэн төсөв — жилээр (Үзүүлэлт: орлого, зарлага, тэнцэл) */
const BUDGET_YEARLY_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Government%20budget/DT_NSO_0800_001V1.px";
/** Нэгдсэн төсвийн орлого — Татварын орлого, Татварын бус орлого гэх мэт (Үзүүлэлт 5,31,32,33) */
const BUDGET_UNIFIED_INCOME_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Government%20budget/DT_NSO_0800_003V1.px";
/** Нэгдсэн төсвийн зарлага — Үзүүлэлт 1,0,8,17 (жилээр) */
const BUDGET_UNIFIED_EXPENSE_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Government%20budget/DT_NSO_0800_006V1.px";

/** Боловсрол — сургуулийн тоо (Ангилал, Он) */
const EDUCATION_SCHOOLS_URL = `${BASE_URL}Education,%20health/General%20indicators%20for%20Education/DT_NSO_2002_066V2.px`;
/** Боловсрол — багш нарын тоо (Ангилал, Он) */
const EDUCATION_TEACHERS_URL = `${BASE_URL}Education,%20health/General%20indicators%20for%20Education/DT_NSO_2002_067V1.px`;
/** Боловсрол — суралцагчидын тоо (Ангилал, Он) */
const EDUCATION_STUDENTS_URL = `${BASE_URL}Education,%20health/General%20indicators%20for%20Education/DT_NSO_2002_069V2.px`;
/** Боловсрол — төгсөгчид (Ангилал, Он) */
const EDUCATION_GRADUATES_URL = `${BASE_URL}Education,%20health/General%20indicators%20for%20Education/DT_NSO_2002_068V1.px`;

/** Бизнес регистр — хуулийн этгэдийн тоо, өмчийн хэлбэр, үйл ажиллагаа эрхлэлтийн байдал, жилээр */
const BUSINESS_REGISTER_URL = `${BASE_URL}Labour,%20business/Statistical%20Business%20Register/DT_NSO_2600_011V2.px`;
/** Үйл ажиллагаа явуулж байгаа ААНБ-н тоо — эдийн засгийн салбар, улирлаар */
const BUSINESS_REGISTER_018_URL = `${BASE_URL}Labour,%20business/Statistical%20Business%20Register/DT_NSO_2600_018V1.px`;

/** Малын тоо — Малын төрөл, Бүс, Он (Улсын дүн) */
const LIVESTOCK_TOTAL_URL = "https://data.1212.mn/api/v1/mn/NSO/Industry%2C%20service/Livestock/DT_NSO_1001_021V1.px";

/** Гадаад худалдаа - сарын эргэлт */
const FOREIGN_TRADE_MONTHLY_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Foreign%20Trade/DT_NSO_1400_003V1.px";
/** Гадаад худалдаа - өссөн дүн */
const FOREIGN_TRADE_CUMULATIVE_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Foreign%20Trade/DT_NSO_1400_001V1_month.px";
/** Гадаад худалдаа - жилийн үзүүлэлт (Экспорт, Импорт, Тэнцэл) */
const FOREIGN_TRADE_YEAR_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Foreign%20Trade/DT_NSO_1400_001V1_year.px";
/** Экспортын гол нэрийн бараа (сараар) */
const FOREIGN_TRADE_EXPORT_PRODUCTS_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Foreign%20Trade/DT_NSO_1400_006V2_month.px";
/** Импортын гол нэрийн бараа (сараар) */
const FOREIGN_TRADE_IMPORT_PRODUCTS_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Foreign%20Trade/DT_NSO_1400_010V2_month.px";
/** Экспортын гол нэрийн бараа (жилээр) */
const FOREIGN_TRADE_EXPORT_PRODUCTS_YEAR_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Foreign%20Trade/DT_NSO_1400_006V2_year.px";
/** Импортын гол нэрийн бараа (жилээр) */
const FOREIGN_TRADE_IMPORT_PRODUCTS_YEAR_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Foreign%20Trade/DT_NSO_1400_010V2_year.px";

/** Төлбөрийн тэнцэл — сараар */
const BALANCE_OF_PAYMENTS_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Balance%20of%20Payments/DT_NSO_0100_001V10.px";

/** Мөнгөний нийлүүлэлт — сараар */
const MONEY_SUPPLY_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Money%20and%20Finance/DT_NSO_0700_001V2.px";
export const MONEY_SUPPLY_INDICATOR_VALUES = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];

/** Зээлийн үзүүлэлт — салбараар, сараар */
const LOAN_INDICATORS_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Money%20and%20Finance/DT_NSO_0700_002V2.px";

/** Иргэдэд олгосон зээлийн үлдэгдэл — зээлийн төрлөөр, сараар */
const LOAN_CITIZENS_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Money%20and%20Finance/DT_NSO_0700_031V1.px";
export const LOAN_CITIZENS_INDICATOR_VALUES = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
/** Төгрөгийн нэрлэсэн болон бодит үйлчилж буй ханшийн индекс (NEER, REER), сараар */
const EXCHANGE_RATE_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Money%20and%20Finance/DT_NSO_0700_030V1.px";
export const EXCHANGE_RATE_INDICATOR_VALUES = ["0", "1"];
export const EXCHANGE_RATE_INDICATOR_LABELS: Record<string, string> = {
  "0": "Төгрөгийн бодит ханшийн индекс (REER)",
  "1": "Нэрлэсэн ханшийн индекс (NEER)",
};
/** Иргэдэд олгосон ипотекийн зээлийн өрийн үлдэгдэл, сараар */
const LOAN_IPOTEK_URL = "https://data.1212.mn:443/api/v1/mn/NSO/Economy,%20environment/Money%20and%20Finance/DT_NSO_0700_027V1.px";
export const LOAN_IPOTEK_INDICATOR_VALUES = ["0", "1"];
export const LOAN_IPOTEK_INDICATOR_LABELS: Record<string, string> = {
  "0": "Өрийн үлдэгдэл",
  "1": "Зээлдэгчийн тоо",
};
export const LOAN_CITIZENS_INDICATOR_LABELS: Record<string, string> = {
  "0": "Бүгд",
  "1": "Эдийн засгийн үйл ажиллагаа эрхлэх зээл",
  "2": "Хэрэглээний зээл",
  "3": "Цалингийн зээл",
  "4": "Тэтгэврийн зээл",
  "5": "Картын зээл",
  "6": "Автомашины зээл",
  "7": "Хадгаламж, данс барьцаалсан зээл",
  "8": "Өрхийн хэрэглээний зээл",
  "9": "Малчны зээл",
  "10": "Бусад",
};
export const LOAN_INDICATOR_VALUES = ["0", "1", "2", "3"];
export const LOAN_INDICATOR_LABELS: Record<string, string> = {
  "0": "Зээлийн үлдэгдлийн хэмжээ",
  "1": "Хэвийн зээл",
  "2": "Хугацаа хэтэрсэн зээл",
  "3": "Чанаргүй зээл",
};
export const LOAN_SECTOR_VALUES = ["0", "1", "2", "3", "4", "5"];
export const LOAN_SECTOR_LABELS: Record<string, string> = {
  "0": "Бүгд",
  "1": "Улсын салбар",
  "2": "Хувийн хэвшил",
  "3": "Иргэд",
  "4": "Бусад",
  "5": "Бусад санхүүгийн байгууллага",
};
/** Хүснэгтийн үзүүлэлтүүд: Бусад авлага (54), Зээлжих тусгай эрх (55) хассан */
export const BOP_TABLE_INDICATOR_VALUES = ["0", "4", "5", "6", "7", "10", "13", "16", "19", "25", "29", "36", "37", "44", "51", "54", "65", "66"];
/** Chart: эхний мөр = Төлбөрийн тэнцэл (НӨӨЦ ХӨРӨНГӨ, index 66), дараа нь 3 эгнээ */
export const BOP_CHART_TOP_CODE = "66";
export const BOP_CHART_ROW_1 = ["0", "4", "7", "19", "25"];
export const BOP_CHART_ROW_2 = ["36", "37", "44", "51", "54"];
export const BOP_CHART_ROW_3 = ["29", "65"];
export const BOP_CHART_INDICATOR_VALUES = [BOP_CHART_TOP_CODE, ...BOP_CHART_ROW_1, ...BOP_CHART_ROW_2, ...BOP_CHART_ROW_3];

export const dashboards: DashboardConfig[] = [
  
  {
    id: "cpi-commodity-prices",
    name: "Гол нэрийн барааны үнэ",
    category: "ЭДИЙН ЗАСАГ",
    shortTitle: "Гол нэрийн барааны үнэ",
    apiUrl: CPI_COMMODITY_PRICES_URL,
    primaryDimension: "Хугацаа",
    kpiFromApi: true,
    kpiApiUrl: CPI_COMMODITY_PRICES_URL,
    kpiTimeDimension: "Хугацаа",
    kpiFormat: "number",
    kpiLabel: "Үхрийн мах, ястай, кг",
    kpiValueSuffix: " ₮",
    kpiSelections: { Бүтээгдэхүүн: ["10"] },
    trendApiUrl: CPI_COMMODITY_PRICES_URL,
    trendTimeDimension: "Хугацаа",
    trendSelections: { Бүтээгдэхүүн: ["10"] },
    trendPoints: 24, // картанд сүүлийн 2 жил (24 сар)
    // introText:
    //   "Хэрэглээний үнийн индексийн гол нэрийн барааны үнийн өөрчлөлт (суурь хугацаатай харьцуулахад).",
    charts: [
      {
        id: "cpi-commodity-trend",
        title: "Гол нэрийн барааны үнэ",
        // description: "Бүтээгдэхүүн сонгоод хугацааны цувааг харна.",
        type: "line",
        xDimension: "Хугацаа",
        chartApiUrl: CPI_COMMODITY_PRICES_URL,
        chartHeight: 320,
      },
      {
        id: "cpi-commodity-grid",
        title: "",
        type: "line",
        xDimension: "Хугацаа",
        chartApiUrl: CPI_COMMODITY_PRICES_URL,
        chartHeight: 200,
      },
    ],
  },
  {
    id: "population",
    name: "Монгол Улсын хүн ам",
    category: "ХҮН АМ",
    shortTitle: "Монгол Улсын хүн ам, өрхийн үндсэн үзүүлэлт",
    apiUrl: POPULATION_MAP_URL,
    primaryDimension: "Он",
    lastUpdated: "2024",
    kpiValue: "3.5 сая",
    kpiPeriod: "2024",
    kpiFromApi: true,
    percent: "1.1%",
    description: "",
    kpiApiUrl: POPULATION_MAP_URL,
    kpiFormat: "number",
    kpiSelections: { "Хүм амын тоо": ["0"], Бүс: ["0"] },
    trendApiUrl: POPULATION_MAP_URL,
    trendTimeDimension: "Он",
    trendSelections: {
      "Хүм амын тоо": ["0"],
      Бүс: ["0"],
      Он: range(42),
    },
    showMapPlaceholder: false,
    mapApiUrl: POPULATION_MAP_029_V3_URL,
    mapDimension: "Бүс",
    mapLevel: "soum",
    charts: [
      {
        id: "population-area",
        title: "Хүн ам",
        description:
          "Монгол Улсын хүн амын тоо, засаг захиргааны нэгжээр, суурьшлаар",
        type: "line",
        xDimension: "Он",
        seriesDimensions: ["Бүс"],
        showGrowth: true,
      },
      {
        id: "population-pyramid",
        title: "Хүн ам, нас хүйсийн суварга",
        description: "Насны бүлгээр хүн амын тархалт (эрэгтэй зүүн, эмэгтэй баруун). Сүүлийн жилийн өгөгдөл.",
        type: "pyramid",
        xDimension: "Он",
        chartApiUrl: POPULATION_BY_SEX_AGE_URL,
        chartFixedQuery: {
          query: [
            { code: "Хүйс", selection: { filter: "item", values: ["1", "2"] } },
            { code: "Нас", selection: { filter: "item", values: Array.from({ length: 87 }, (_, i) => String(i + 1)) } },
            { code: "Он", selection: { filter: "item", values: range(25) } },
          ],
          response: { format: "json-stat2" },
        },
        chartHeight: 300,
      },
      {
        id: "population-household-count",
        title: "Өрхийн тоо",
        description: "Жил бүрийн өрхийн тоо бүс, аймгаар. Дэлгэцийн Бүс шүүлтээр сонгоно.",
        type: "line",
        xDimension: "Он",
        seriesDimensions: ["Бүс"],
        chartApiUrl: POPULATION_HOUSEHOLD_COUNT_URL,
        chartHeight: 300,
      },
      {
        id: "population-births",
        title: "Төрөлтийн тоо",
        description: "Жил бүрийн төрөлтийн тоо (1944-2024).",
        type: "line",
        xDimension: "Он",
        chartApiUrl: POPULATION_MOVEMENT_URL,
        chartFixedQuery: {
          query: [
            { code: "Хүйс", selection: { filter: "item", values: ["0"] } },
            { code: "Он", selection: { filter: "item", values: range(81) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "population-birth-rate-coefficient",
        title: "Төрөлтийн ерөнхий коэффициент",
        description: "1000 хүнд ногдох төрөлтийн ерөнхий коэффициент, жилээр (улсын түвшин).",
        type: "line",
        xDimension: "Он",
        chartApiUrl: POPULATION_MAP_029_V3_URL,
        chartFixedQuery: {
          query: [
            { code: "Хүйс", selection: { filter: "item", values: ["0"] } },
            { code: "Бүс", selection: { filter: "item", values: ["0"] } },
            { code: "Он", selection: { filter: "item", values: range(15) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "population-deaths",
        title: "Нас баралт",
        description: "Жил бүрийн нас барсан хүний тоо (1944-2024).",
        type: "line",
        xDimension: "Он",
        chartApiUrl: POPULATION_MOVEMENT_V2_URL,
        chartFixedQuery: {
          query: [
            { code: "Хүйс", selection: { filter: "item", values: ["0"] } },
            { code: "Он", selection: { filter: "item", values: range(81) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "population-death-rate-coefficient",
        title: "Нас баралтын ерөнхий коэффициент",
        description: "1000 хүнд ногдох нас баралтын ерөнхий коэффициент, жилээр (улсын түвшин).",
        type: "line",
        xDimension: "Он",
        chartApiUrl: POPULATION_024_V2_URL,
        chartFixedQuery: {
          query: [
            { code: "Хүйс", selection: { filter: "item", values: ["0"] } },
            { code: "Бүс", selection: { filter: "item", values: ["0"] } },
            { code: "Он", selection: { filter: "item", values: range(14) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "population-net-growth",
        title: "Хүн амын цэвэр өсөлт",
        description: "Цэвэр өсөлт = Төрөлт – Нас баралт.",
        type: "line",
        xDimension: "Он",
        seriesDimensions: ["Хүйс"],
        computedFormula: "births-minus-deaths",
        computedSourceCharts: ["population-births", "population-deaths"],
        showGrowth: true,
      },
      {
        id: "population-indicators-per-1000",
        title: "Төрөлт, Нас баралт, Ердийн цэвэр өсөлт — 1000 хүнд ногдох",
        description:
          "Жил бүрийн төрөлт, нас баралт, ердийн цэвэр өсөлтийн тоо болон 1000 хүнд ногдох үзүүлэлт.",
        type: "line",
        xDimension: "Он",
        seriesDimensions: ["Үзүүлэлт"],
        chartApiUrl: POPULATION_024_URL,
      },
      {
        id: "population-marriage-divorce",
        title: "Гэрлэлт, цуцлалт",
        description: "Жил бүрийн гэрлэлт, цуцлалтын тоо (улсын түвшин).",
        type: "line",
        xDimension: "Он",
        seriesDimensions: ["Гэрлэлтийн байдал"],
        chartApiUrl: POPULATION_MARRIAGE_DIVORCE_URL,
        chartFixedQuery: {
          query: [
            { code: "Гэрлэлтийн байдал", selection: { filter: "item", values: ["0", "1"] } },
            { code: "Бүс", selection: { filter: "item", values: ["0"] } },
            { code: "Он", selection: { filter: "item", values: range(38) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "population-marriage-divorce-per-1000",
        title: "Гэрлэлт, цуцлалт — 1000 хүнд ногдох",
        description: "Жил бүрийн гэрлэлт, цуцлалтын тоо 1000 хүнд ногдох (улсын түвшин).",
        type: "line",
        xDimension: "Он",
        seriesDimensions: ["Гэр бүлийн байдал"],
        chartApiUrl: POPULATION_MARRIAGE_DIVORCE_PER_1000_URL,
        chartFixedQuery: {
          query: [
            { code: "Гэр бүлийн байдал", selection: { filter: "item", values: ["0", "1"] } },
            { code: "Бүс", selection: { filter: "item", values: ["0"] } },
            { code: "Он", selection: { filter: "item", values: range(38) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "population-life-expectancy-trend",
        title: "Дундаж наслалт",
        description: "Дундаж наслалт нь шинээр төрсөн хүүхдийн эрүүл мэнд, амьдрах нөхцөл нь цаашид хэвээр хадгалагдана гэж үзвэл түүний үргэлжлэн амьдрах жилээр тооцсон дундаж хугацааг хэлнэ.",
        type: "area",
        xDimension: "Он",
        chartApiUrl: POPULATION_039_V1_URL,
        chartFixedQuery: {
          query: [
            { code: "Хүйс", selection: { filter: "item", values: ["0"] } },
            { code: "Он", selection: { filter: "item", values: range(29) } },
          ],
          response: { format: "json-stat2" },
        },
      },
    ],
    twoColumnLayout: {
      leftLabel: "Хүн ам, нас хүйсийн суварга",
      rightLabel: "Өрхийн тоо",
      leftChartIds: ["population-pyramid"],
      rightChartIds: ["population-household-count"],
    },
    deathRateMapApiUrl: POPULATION_024_V2_URL,
    deathRateMapDimension: "Бүс",
    lifeExpectancyMapApiUrl: LIFE_EXPECTANCY_MAP_URL,
    lifeExpectancyMapDimension: "Аймаг",
    lifeExpectancyNationalApiUrl: POPULATION_039_V1_URL,
  },
  {
    id: "gdp",
    name: "Дотоодын нийт бүтээгдэхүүн",
    category: "ЭДИЙН ЗАСАГ",
    shortTitle: "Дотоодын нийт бүтээгдэхүүн",
    apiUrl: GDP_URL,
    primaryDimension: "ОН",
    lastUpdated: "2024",
    kpiValue: "—",
    kpiPeriod: "",
    kpiFromApi: true,
    kpiApiUrl: GDP_URL,
    kpiFormat: "number",
    kpiSelections: {
      "Статистик үзүүлэлт": ["0", "4"],
      "Эдийн засгийн үйл ажиллагааны салбарын ангилал": ["0"],
      "ОН": ["0"],
    },
    kpiGrowthFromApi: { dimension: "Статистик үзүүлэлт", valueCode: "4", mainValueCode: "0" },
    trendApiUrl: GDP_URL,
    trendTimeDimension: "ОН",
    trendSelections: {
      "Статистик үзүүлэлт": ["0"],
      "Эдийн засгийн үйл ажиллагааны салбарын ангилал": ["0"],
      "ОН": range(11),
    },
    introText: "Үйлдвэрлэлийн аргаар",
    /** GDP indicator filter config */
    gdpIndicatorFilter: {
      dimension: "Статистик үзүүлэлт",
      options: [
        { code: "0", label: "Нэрлэсэн" },
        { code: "3", label: "Бодит" },
        { code: "4", label: "Өөрчлөлт %" },
      ],
      defaultCode: "4",
    },
    charts: [
      {
        id: "gdp-total",
        title: "Бүгд",
        type: "line",
        xDimension: "ОН",
        chartApiUrl: GDP_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["0", "3", "4"] } },
            { code: "Эдийн засгийн үйл ажиллагааны салбарын ангилал", selection: { filter: "item", values: ["0"] } },
            { code: "ОН", selection: { filter: "item", values: range(36) } },
          ],
          response: { format: "json-stat2" },
        },
        gdpSectorCode: "0",
      },
      {
        id: "gdp-agriculture",
        title: "Хөдөө аж ахуй",
        type: "line",
        xDimension: "ОН",
        chartApiUrl: GDP_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["0", "3", "4"] } },
            { code: "Эдийн засгийн үйл ажиллагааны салбарын ангилал", selection: { filter: "item", values: ["1"] } },
            { code: "ОН", selection: { filter: "item", values: range(36) } },
          ],
          response: { format: "json-stat2" },
        },
        gdpSectorCode: "1",
      },
      {
        id: "gdp-mining",
        title: "Уул уурхай, олборлолт",
        type: "line",
        xDimension: "ОН",
        chartApiUrl: GDP_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["0", "3", "4"] } },
            { code: "Эдийн засгийн үйл ажиллагааны салбарын ангилал", selection: { filter: "item", values: ["2"] } },
            { code: "ОН", selection: { filter: "item", values: range(36) } },
          ],
          response: { format: "json-stat2" },
        },
        gdpSectorCode: "2",
      },
      {
        id: "gdp-manufacturing",
        title: "Боловсруулах үйлдвэрлэл",
        type: "line",
        xDimension: "ОН",
        chartApiUrl: GDP_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["0", "3", "4"] } },
            { code: "Эдийн засгийн үйл ажиллагааны салбарын ангилал", selection: { filter: "item", values: ["3"] } },
            { code: "ОН", selection: { filter: "item", values: range(36) } },
          ],
          response: { format: "json-stat2" },
        },
        gdpSectorCode: "3",
      },
      {
        id: "gdp-utilities",
        title: "Цахилгаан, хий, уур, агааржуулалт",
        type: "line",
        xDimension: "ОН",
        chartApiUrl: GDP_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["0", "3", "4"] } },
            { code: "Эдийн засгийн үйл ажиллагааны салбарын ангилал", selection: { filter: "item", values: ["4"] } },
            { code: "ОН", selection: { filter: "item", values: range(36) } },
          ],
          response: { format: "json-stat2" },
        },
        gdpSectorCode: "4",
      },
      {
        id: "gdp-water",
        title: "Усан хангамж",
        type: "line",
        xDimension: "ОН",
        chartApiUrl: GDP_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["0", "3", "4"] } },
            { code: "Эдийн засгийн үйл ажиллагааны салбарын ангилал", selection: { filter: "item", values: ["5"] } },
            { code: "ОН", selection: { filter: "item", values: range(36) } },
          ],
          response: { format: "json-stat2" },
        },
        gdpSectorCode: "5",
      },
      {
        id: "gdp-construction",
        title: "Барилга",
        type: "line",
        xDimension: "ОН",
        chartApiUrl: GDP_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["0", "3", "4"] } },
            { code: "Эдийн засгийн үйл ажиллагааны салбарын ангилал", selection: { filter: "item", values: ["6"] } },
            { code: "ОН", selection: { filter: "item", values: range(36) } },
          ],
          response: { format: "json-stat2" },
        },
        gdpSectorCode: "6",
      },
      {
        id: "gdp-sector-structure",
        title: "Дотоодын нийт бүтээгдэхүүний салбарын бүтэц",
        type: "line",
        xDimension: "ОН",
        seriesDimensions: ["Эдийн засгийн үйл ажиллагааны салбарын ангилал"],
        chartApiUrl: GDP_SECTOR_STRUCTURE_URL,
        chartFixedQuery: {
          query: [
            { code: "Эдийн засгийн үйл ажиллагааны салбарын ангилал", selection: { filter: "item", values: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"] } },
            { code: "ОН", selection: { filter: "item", values: range(36) } },
          ],
          response: { format: "json-stat2" },
        },
        gdpVerticalStackedBar: true,
      },
      {
        id: "gdp-per-capita",
        title: "Нэг хүнд ногдох ДНБ",
        // description: "Аймаг, нийслэл, жилээр",
        type: "area",
        xDimension: "Он",
        seriesDimensions: ["Бүс"],
        chartApiUrl: GDP_PER_CAPITA_URL,
        chartFixedQuery: {
          query: [
            { code: "Бүс", selection: { filter: "item", values: ["0"] } },
            { code: "Он", selection: { filter: "item", values: range(25) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "gdp-per-worker",
        title: "Нэг ажиллагчид ногдох ДНБ",
        // description: "Эдийн засгийн салбар, жилээр",
        type: "area",
        xDimension: "Он",
        seriesDimensions: ["Эдийн засгийн салбар"],
        chartApiUrl: GDP_PER_WORKER_URL,
        chartFixedQuery: {
          query: [
            { code: "Он", selection: { filter: "item", values: range(35) } },
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["0"] } },
            { code: "Эдийн засгийн салбар", selection: { filter: "item", values: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "gdp-per-capita-usd",
        title: "ам.доллар",
        type: "area",
        xDimension: "Он",
        seriesDimensions: ["ДНБ"],
        chartApiUrl: GDP_PER_CAPITA_USD_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["0"] } },
            { code: "ДНБ", selection: { filter: "item", values: ["0", "1"] } },
            { code: "Он", selection: { filter: "item", values: range(35) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "gdp-quarter-consumption",
        title: "Өрхийн хэрэглээ",
        type: "area",
        xDimension: "ОН",
        chartApiUrl: GDP_QUARTER_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["4"] } },
            { code: "Бүрэлдэхүүн", selection: { filter: "item", values: ["2"] } },
            { code: "ОН", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
        colorVariant: "orange",
      },
      {
        id: "gdp-quarter-government",
        title: "Төрийн байгууллагын хэрэглээ",
        type: "area",
        xDimension: "ОН",
        chartApiUrl: GDP_QUARTER_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["4"] } },
            { code: "Бүрэлдэхүүн", selection: { filter: "item", values: ["3"] } },
            { code: "ОН", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
        colorVariant: "orange",
      },
      {
        id: "gdp-quarter-capital",
        title: "Үндсэн хөрөнгийн хуримтлал",
        type: "area",
        xDimension: "ОН",
        chartApiUrl: GDP_QUARTER_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["4"] } },
            { code: "Бүрэлдэхүүн", selection: { filter: "item", values: ["5"] } },
            { code: "ОН", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
        colorVariant: "orange",
      },
      {
        id: "gdp-quarter-export",
        title: "Бараа, үйлчилгээний экспорт",
        type: "area",
        xDimension: "ОН",
        chartApiUrl: GDP_QUARTER_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["4"] } },
            { code: "Бүрэлдэхүүн", selection: { filter: "item", values: ["8"] } },
            { code: "ОН", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
        colorVariant: "orange",
      },
      {
        id: "gdp-quarter-import",
        title: "Бараа, үйлчилгээний импорт",
        type: "area",
        xDimension: "ОН",
        chartApiUrl: GDP_QUARTER_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["4"] } },
            { code: "Бүрэлдэхүүн", selection: { filter: "item", values: ["11"] } },
            { code: "ОН", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
        colorVariant: "orange",
      },
    ],
  },
  {
    id: "household-survey",
    name: "Өрхийн орлого, зарлага",
    category: "НИЙГЭМ",
    shortTitle: "Өрхийн орлого, зарлага",
    apiUrl: HOUSEHOLD_INCOME_018_URL,
    primaryDimension: "Улирал",
    kpiFromApi: true,
    kpiApiUrl: HOUSEHOLD_INCOME_018_URL,
    kpiTimeDimension: "Улирал",
    kpiSelections: { Суурьшил: ["0"], "Орлогын төрөл": ["0"], Улирал: ["0"] },
    kpiFormat: "number",
    trendApiUrl: HOUSEHOLD_INCOME_018_URL,
    trendTimeDimension: "Улирал",
    trendSelections: {
      Суурьшил: ["0"],
      "Орлогын төрөл": ["0"],
      Улирал: range(84),
    },
    charts: [
      // Орлого: Том chart - Нийт орлого + Мөнгөн орлого
      {
        id: "household-income-main",
        title: "НЭГ ӨРХИЙН САРЫН ДУНДАЖ ОРЛОГО",
        type: "area",
        xDimension: "Улирал",
        seriesDimensions: ["Орлогын төрөл"],
        chartApiUrl: HOUSEHOLD_INCOME_018_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Орлогын төрөл", selection: { filter: "item", values: ["0", "1"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      // Орлого: Жижиг chart-ууд
      {
        id: "household-income-wage",
        title: "Цалин хөлс",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: HOUSEHOLD_INCOME_018_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Орлогын төрөл", selection: { filter: "item", values: ["2"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "household-income-pension",
        title: "Тэтгэвэр, тэтгэмж",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: HOUSEHOLD_INCOME_018_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Орлогын төрөл", selection: { filter: "item", values: ["3"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "household-income-production",
        title: "Үйлдвэрлэл, үйлчилгээний орлого",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: HOUSEHOLD_INCOME_018_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Орлогын төрөл", selection: { filter: "item", values: ["4", "5"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "household-income-other",
        title: "Бусад орлого",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: HOUSEHOLD_INCOME_018_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Орлогын төрөл", selection: { filter: "item", values: ["6"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "household-income-free",
        title: "Бусдаас үнэгүй авсан",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: HOUSEHOLD_INCOME_018_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Орлогын төрөл", selection: { filter: "item", values: ["7"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "household-income-own-farm",
        title: "Өөрийн аж ахуйгаас",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: HOUSEHOLD_INCOME_018_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Орлогын төрөл", selection: { filter: "item", values: ["8"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      // Зарлага: Том chart - Нийт зарлага + Мөнгөн зарлага
      {
        id: "household-expense-main",
        title: "НЭГ ӨРХИЙН САРЫН ДУНДАЖ ЗАРЛАГА",
        type: "area",
        xDimension: "Улирал",
        seriesDimensions: ["Зарлагын төрөл"],
        chartApiUrl: HOUSEHOLD_019_V1_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Зарлагын төрөл", selection: { filter: "item", values: ["0", "1"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      // Зарлага: Жижиг chart-ууд
      {
        id: "household-expense-food",
        title: "Хүнсний зүйлийн зарлага",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: HOUSEHOLD_019_V1_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Зарлагын төрөл", selection: { filter: "item", values: ["2"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "household-expense-nonfood",
        title: "Хүнсний бус бараа, үйлчилгээ",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: HOUSEHOLD_019_V1_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Зарлагын төрөл", selection: { filter: "item", values: ["3"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "household-expense-other",
        title: "Бусад зарлага",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: HOUSEHOLD_019_V1_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Зарлагын төрөл", selection: { filter: "item", values: ["4"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "household-expense-gift",
        title: "Бусдад өгсөн бэлэг, тусламж",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: HOUSEHOLD_019_V1_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Зарлагын төрөл", selection: { filter: "item", values: ["5"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "household-expense-free",
        title: "Бусдаас үнэгүй авсан",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: HOUSEHOLD_019_V1_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Зарлагын төрөл", selection: { filter: "item", values: ["6"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "household-expense-own-farm",
        title: "Өөрийн аж ахуйгаас",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: HOUSEHOLD_019_V1_URL,
        chartFixedQuery: {
          query: [
            { code: "Суурьшил", selection: { filter: "item", values: ["0", "1", "2", "3", "4"] } },
            { code: "Зарлагын төрөл", selection: { filter: "item", values: ["7"] } },
            { code: "Улирал", selection: { filter: "item", values: range(84) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      // ЖИНИ индекс
      {
        id: "household-gini-036",
        title: "ЖИНИ ИНДЕКС",
        description:
          "Нэг хүнд сард ногдох зардалд үндэслэн тооцсон",
        type: "area",
        xDimension: "Улирал",
        seriesDimensions: ["Бүс"],
        chartApiUrl: GINI_036_V2_URL,
        chartFixedQuery: {
          query: [
            { code: "Бүс", selection: { filter: "item", values: ["0", "1", "2", "3", "4", "5"] } },
            { code: "Улирал", selection: { filter: "item", values: range(64) } },
          ],
          response: { format: "json-stat2" },
        },
      },
    ],
  },
  {
    id: "unemployment",
    name: "Хөдөлмөр эрхлэлт",
    category: "ХӨДӨЛМӨР",
    apiUrl: UNEMPLOYMENT_URL,
    primaryDimension: "Улирал",
    kpiFromApi: true,
    kpiApiUrl: EMPLOYMENT_INDICATORS_URL,
    kpiFormat: "percent",
    kpiTimeDimension: "Улирал",
    kpiLabel: "Ажилгүйдэл",
    kpiSelections: {
      Үзүүлэлт: ["10"],
      Хүйс: ["0"],
      Улирал: ["0"],
    },
    trendApiUrl: EMPLOYMENT_INDICATORS_URL,
    trendTimeDimension: "Улирал",
    trendSelections: {
      Үзүүлэлт: ["10"],
      Хүйс: ["0"],
      Улирал: range(28),
    },
    trendValueSuffix: "%",
    charts: [
      {
        id: "unemployment-trend",
        title: "Ажилгүйдлийн түвшин  ",
        // description: "Улирал бүрийн ажилгүйдлийн түвшин",ы
        type: "area",
        xDimension: "Улирал",
      },
      {
        id: "labour-participation",
        title: "Ажиллах хүчний оролцооны түвшин",
        // description: "Улирал бүр",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: LABOUR_PARTICIPATION_URL,
        chartHeight: 260,
      },
      {
        id: "outside-labour-force",
        title: "Ажиллах хүчнээс гадуурх хүн",
        // description: "Улирал бүр",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: OUTSIDE_LABOUR_FORCE_URL,
        chartHeight: 260,
      },
      {
        id: "unemployed",
        title: "Ажилгүй хүн",
        // description: "Улирал бүр",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: UNEMPLOYED_URL,
        chartHeight: 260,
      },
      {
        id: "employment",
        title: "Ажиллагчид",
        // description: "Улирал бүр",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: EMPLOYMENT_URL,
        chartHeight: 260,
      },
    ],
  },
  
  
  {
    id: "cpi",
    name: "Хэрэглээний үнийн индекс",
    category: "ЭДИЙН ЗАСАГ",
    shortTitle: "Хэрэглээний үнийн индекс",
    // description: "Инфляц, үнийн өөрчлөлт — улс, нийслэл, аймгаар.",
    introText:
      "Хэрэглээний үнийн индекс (ХҮИ) нь хэрэглэгчдийн худалдаж авсан бараа, үйлчилгээний нэр төрөл, чанар өөрчлөлтгүй тогтвортой байхад үнэ дунджаар өөрчлөгдөж буйг илэрхийлэх үзүүлэлт юм.  ХҮИ нь инфляцыг хэмжих үндсэн хэрэгсэл болж, амьжиргааны өртөг болон бодит орлогын өөрчлөлтийг шинжлэхэд чухал ач холбогдолтой. ҮСХ нь ХҮИ-ийг сар болгон тооцон, нийтэд тархааж байна.",
    apiUrlByLevel: CPI_URL_BY_LEVEL,
    apiUrlByLevelMonthlyChange: CPI_MONTHLY_URL_BY_LEVEL,
    primaryDimension: "Сар",
    lastUpdated: "2025",
    kpiValue: "1.6%",
    kpiPeriod: "12-2025",
    kpiFromApi: true,
    kpiApiUrl: CPI_URL_BY_LEVEL.улс,
    kpiFormat: "percent",
    kpiSelections: { "Суурь он": ["2"], Бүлэг: ["0"] },
    trendApiUrl: CPI_URL_BY_LEVEL.улс,
    trendTimeDimension: "Сар",
    trendSelections: {
      "Суурь он": ["2"],
      Бүлэг: ["0"],
      Сар: range(0, 24),
    },
    dataSourceLinks: [
      { label: "Улс", url: CPI_URL_BY_LEVEL.улс },
      { label: "Нийслэл", url: CPI_URL_BY_LEVEL.нийслэл },
      { label: "Аймаг", url: CPI_URL_BY_LEVEL.аймаг },
    ],
    charts: [
      {
        id: "cpi-by-region",
        title: "Инфляцын түвшин, аймаг, нийслэлээр",
        description:
          "Сүүлийн сарын инфляцын түвшин бүс, аймаг, нийслэлээр эрэмбэлсэн.",
        type: "bar",
        xDimension: "Бүс",
        filterToLatestDimension: "Сар",
        filterToSingleValue: { Бүлэг: "0" },
      },
      {
        id: "cpi-by-category",
        title: "Инфляцын түвшин, бүлгээр",
        // description: "Сонгосон аймаг, нийслэлийн үзүүлэлт",
        type: "bar",
        xDimension: "Бүлэг",
        regionFilterDimension: "Бүс",
        filterToLatestDimension: "Сар",
      },
      {
        id: "cpi-trend",
        title: "",
        description:
          "",
        type: "area",
        xDimension: "Сар",
        chartApiUrlByCpiMode: {
          yearly: CPI_URL_BY_LEVEL.улс,
          monthly: CPI_MONTHLY_URL_BY_LEVEL.улс,
        },
      },
      {
        id: "cpi-detailed",
        title: "Бараа, үйлчилгээний үнэ",
        // description:
        //   "Сонгосон аймаг, нийслэлийн нарийвчилсан бүлгүүд. Бусад графиктай зөвхөн оноор (цаг/сар) холбогдоно.",
        type: "area",
        xDimension: "Сар",
        seriesDimensions: ["Бараа, үйлчилгээ"],
        regionFilterDimension: "Бүс",
        chartApiUrl: CPI_DETAILED_URL,
        defaultSeriesCodes: {
          "Бараа, үйлчилгээ": ["0"],
        },
        showOnlyForLevels: ["улс", "аймаг", "нийслэл"],
        colorVariant: "orange",
      },
    ],
  },
  {
    id: "housing-prices",
    name: "Орон сууцны үнийн үнэ",
    category: "ЭДИЙН ЗАСАГ",
    shortTitle: "Орон сууцны үнийн үнэ",
    apiUrl: HOUSING_PRICE_INDEX_URL,
    housingChangeUrl: HOUSING_PRICE_CHANGE_URL,
    primaryDimension: "Сар",
    kpiFromApi: true,
    kpiApiUrl: HOUSING_PRICE_CHANGE_URL,
    kpiFormat: "percent",
    kpiSelections: { Үзүүлэлт: ["0"], Сар: ["0"] },
    trendApiUrl: HOUSING_PRICE_CHANGE_URL,
    trendTimeDimension: "Сар",
    trendSelections: {
      Үзүүлэлт: ["0"],
      Сар: range(49),
    },
    charts: [
      {
        id: "housing-index",
        title: "Орон сууцны үнийн жилийн өөрчлөлт",
        // description:
          // "Суурь хугацаатай харьцуулахад сарын үнийн индексийн өөрчлөлт.",
        type: "area",
        xDimension: "Сар",
      },
      {
        id: "housing-by-district",
        title: "1 м2 талбайн дундаж үнэ",
        // description:
        //   "Дүүрэг тус бүрээр шинэ болон хуучин орон сууцны дундаж үнэ.",
        type: "area",
        xDimension: "Сар",
        chartApiUrl: HOUSING_PRICE_BY_DISTRICT_URL,
      },
    ],
  },
  {
    id: "ppi",
    name: "Үйлдвэрлэгчийн үнийн индекс",
    category: "ЭДИЙН ЗАСАГ",
    shortTitle: "Үйлдвэрлэгчийн үнийн индекс",
    apiUrl: PPI_INDUSTRIAL_URL,
    primaryDimension: "Сар",
    kpiFromApi: true,
    kpiApiUrl: PPI_INDUSTRIAL_URL,
    kpiFormat: "percent",
    kpiLabel: "Аж үйлдвэр",
    kpiTimeDimension: "Сар",
    kpiSelections: { Үзүүлэлт: ["1"], "Дэд салбар": ["0"] },
    trendApiUrl: PPI_INDUSTRIAL_URL,
    trendTimeDimension: "Сар",
    trendSelections: { Үзүүлэлт: ["1"], "Дэд салбар": ["0"], Сар: range(13) },
    charts: [
      {
        id: "ppi-industrial",
        title: "Аж үйлдвэрийн салбарын үйлдвэрлэгчийн үнэ",
        description:
          "Дэд салбараар үйлдвэрлэгчийн үнийн индексийн өөрчлөлт (өмнөх оны мөн үетэй / өмнөх сартай харьцуулалт).",
        type: "area",
        xDimension: "Сар",
        seriesDimensions: ["Дэд салбар"],
        chartApiUrl: PPI_INDUSTRIAL_URL,
        chartFixedQuery: {
          query: [
            {
              code: "Үзүүлэлт",
              selection: { filter: "item", values: ["1", "3"] },
            },
            {
              code: "Дэд салбар",
              selection: {
                filter: "item",
                values: ["0", "1", "7", "26", "27", "28"],
              },
            },
            {
              code: "Сар",
              selection: { filter: "item", values: range(61) },
            },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "ppi-transport",
        title: "ТЭЭВЭР",
        type: "area",
        xDimension: "Сар",
        seriesDimensions: ["Үзүүлэлт"],
        chartApiUrl: PPI_TRANSPORT_URL,
        chartFixedQuery: {
          query: [
            {
              code: "Үзүүлэлт",
              selection: { filter: "item", values: ["3", "1"] },
            },
            {
              code: "Дэд салбар",
              selection: { filter: "item", values: ["0"] },
            },
            {
              code: "Сар",
              selection: { filter: "item", values: range(61) },
            },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "ppi-info-comm",
        title: "МЭДЭЭЛЭЛ, ХОЛБОО",
        type: "area",
        xDimension: "Сар",
        seriesDimensions: ["Үзүүлэлт"],
        chartApiUrl: PPI_INFO_COMM_URL,
        chartFixedQuery: {
          query: [
            {
              code: "Үзүүлэлт",
              selection: { filter: "item", values: ["3", "1"] },
            },
            {
              code: "Дэд салбар",
              selection: { filter: "item", values: ["0"] },
            },
            {
              code: "Сар",
              selection: { filter: "item", values: range(61) },
            },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "ppi-accommodation",
        title:
          "ЗОЧИД БУУДАЛ",
        type: "area",
        xDimension: "Сар",
        seriesDimensions: ["Үзүүлэлт"],
        chartApiUrl: PPI_ACCOMMODATION_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["3", "2"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["0"] } },
            { code: "Сар", selection: { filter: "item", values: range(62) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "ppi-food-service",
        title: "НИЙТИЙН ХООЛНЫ САЛБАР",
        type: "area",
        xDimension: "Сар",
        seriesDimensions: ["Үзүүлэлт"],
        chartApiUrl: PPI_FOOD_SERVICE_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["3", "1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["0"] } },
            { code: "Сар", selection: { filter: "item", values: range(62) } },
          ],
          response: { format: "json-stat2" },
        },
      },
    ],
  },
  
  {
    id: "average-salary",
    name: "Дундаж цалин",
    category: "ХӨДӨЛМӨР",
    shortTitle: "Дундаж цалин",
    apiUrl: WAGES_021_V2_URL,
    primaryDimension: "Улирал",
    kpiFromApi: true,
    kpiApiUrl: WAGES_021_V2_URL,
    kpiFormat: "number",
    kpiTimeDimension: "Улирал",
    kpiSelections: { Хүйс: ["0"], Бүс: ["0"] },
    trendApiUrl: WAGES_021_V2_URL,
    trendTimeDimension: "Улирал",
    trendSelections: {
      Хүйс: ["0"],
      Бүс: ["0"],
      Улирал: range(100),
    },
    charts: [
      {
        id: "wages-region-area",
        title: "АЖИЛЛАГЧДЫН САРЫН ДУНДАЖ НЭРЛЭСЭН ЦАЛИН",
        type: "area",
        xDimension: "Улирал",
        seriesDimensions: ["Хүйс"],
        chartApiUrl: WAGES_021_V2_URL,
        chartFixedQuery: {
          query: [
            { code: "Хүйс", selection: { filter: "item", values: ["0", "1", "2"] } },
            { code: "Бүс", selection: { filter: "item", values: ["0"] } },
            { code: "Улирал", selection: { filter: "item", values: range(100) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "wages-sector-area",
        title: "салбараар",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: WAGES_022_V2_URL,
        chartFixedQuery: {
          query: [
            { code: "Хүйс", selection: { filter: "item", values: ["0"] } },
            { code: "Салбар", selection: { filter: "item", values: ["0"] } },
            { code: "Улирал", selection: { filter: "item", values: range(100) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "wages-real-index-area",
        title: "БОДИТ ЦАЛИНГИЙН ИНДЕКС (2015=100)",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: WAGES_036_V2_URL,
        chartFixedQuery: {
          query: [
            { code: "Салбар", selection: { filter: "item", values: ["0"] } },
            { code: "Улирал", selection: { filter: "item", values: range(39) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "wages-by-ownership",
        title: "Өмчийн хэлбэрээр",
        type: "area",
        xDimension: "Улирал",
        seriesDimensions: ["Өмчийн хэлбэр"],
        chartApiUrl: WAGES_023_V2_URL,
        chartFixedQuery: {
          query: [
            { code: "Хүйс", selection: { filter: "item", values: ["0"] } },
            { code: "Өмчийн хэлбэр", selection: { filter: "item", values: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] } },
            { code: "Улирал", selection: { filter: "item", values: range(97) } },
          ],
          response: { format: "json-stat2" },
        },
        chartHeight: 280,
      },
      {
        id: "wages-by-occupation",
        title: "Ажил мэргэжлийн ангилалаар",
        type: "area",
        xDimension: "Улирал",
        seriesDimensions: ["Ажил мэргэжлийн ангилал"],
        chartApiUrl: WAGES_025_V2_URL,
        chartFixedQuery: {
          query: [
            { code: "Хүйс", selection: { filter: "item", values: ["0"] } },
            { code: "Ажил мэргэжлийн ангилал", selection: { filter: "item", values: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] } },
            { code: "Улирал", selection: { filter: "item", values: range(98) } },
          ],
          response: { format: "json-stat2" },
        },
        chartHeight: 280,
      },
    ],
  },
  {
    id: "state-budget",
    name: "Улсын төсөв",
    category: "ЭДИЙН ЗАСАГ",
    shortTitle: "Улсын төсөв",
    apiUrl: BUDGET_INCOME_URL,
    primaryDimension: "Он",
    lastUpdated: "",
    kpiValue: "",
    kpiPeriod: "",
    kpiFromApi: true,
    kpiApiUrl: BUDGET_INCOME_URL,
    kpiTimeDimension: "Он",
    kpiSelections: { "Үзүүлэлт": ["1"], "Ангилал": ["4"] },
    kpiFormat: "number",
    // kpiLabel: "Нийт орлого",
    trendApiUrl: BUDGET_INCOME_URL,
    // Карт дээр зөвхөн Тэнцвэржүүлсэн орлогын line (сараар — chart-тай ижил)
    trendSelections: {
      "Үзүүлэлт": ["0"],
      "Ангилал": ["4"],
    },
    trendPoints: 24,
    percent: "",
    description: "",
    charts: [
      // Monthly data (тухайн сар)
      {
        id: "budget-income",
        title: "МОНГОЛ УЛСЫН НЭГДСЭН ТӨСВИЙН ОРЛОГО",
        type: "area",
        xDimension: "Он",
        chartApiUrl: BUDGET_INCOME_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["0"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["4"] } },
            { code: "Он", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-expense",
        title: "МОНГОЛ УЛСЫН НЭГДСЭН ТӨСВИЙН ЗАРЛАГА",
        type: "area",
        xDimension: "Сар",
        chartApiUrl: BUDGET_EXPENSE_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["0"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["0"] } },
            { code: "Сар", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-balance",
        title: "ТӨСВИЙН ТЭНЦЭЛ (сараар)",
        description: "Орлого - Зарлага",
        type: "line",
        xDimension: "Он",
        computedFormula: "budget-balance",
        computedSourceCharts: ["budget-income", "budget-expense"],
      },
      {
        id: "budget-balance-yearly",
        title: "УЛСЫН НЭГДСЭН ТӨСӨВ",
        description: "Монгол улсын нэгдсэн төсвийн тэнцэл (жилээр)",
        type: "line",
        xDimension: "Он",
        chartApiUrl: BUDGET_YEARLY_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["0", "1", "2"] } },
            { code: "Улсын дүн", selection: { filter: "item", values: ["0"] } },
            { code: "Он", selection: { filter: "item", values: range(105) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-unified-income-yearly",
        title: "ТӨСВИЙН ОРЛОГО",
        type: "line",
        xDimension: "Он",
        chartApiUrl: BUDGET_UNIFIED_INCOME_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["5", "31", "32", "33"] } },
            { code: "Он", selection: { filter: "item", values: range(35) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-unified-expense-yearly",
        title: "ТӨСВИЙН ЗАРЛАГА",
        type: "line",
        xDimension: "Он",
        chartApiUrl: BUDGET_UNIFIED_EXPENSE_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1", "0", "8", "17"] } },
            { code: "Он", selection: { filter: "item", values: range(35) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      /** Жил: Татварын орлогын дэлгэрэнгүй — Орлогын албан татвар, Нийгмийн даатгалын шимтгэл, НӨАТ, Онцгой албан татвар (6,11,14,18) */
      {
        id: "budget-income-tax-breakdown-yearly",
        title: "Татварын орлогын дэлгэрэнгүй",
        type: "line",
        xDimension: "Он",
        chartApiUrl: BUDGET_UNIFIED_INCOME_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["6", "11", "14", "18"] } },
            { code: "Он", selection: { filter: "item", values: range(35) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      // Cumulative data (өссөн дүн)
      {
        id: "budget-income-cumulative",
        title: "МОНГОЛ УЛСЫН НЭГДСЭН ТӨСВИЙН ОРЛОГО (өссөн дүн)",
        type: "area",
        xDimension: "Он",
        chartApiUrl: BUDGET_INCOME_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["4"] } },
            { code: "Он", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-expense-cumulative",
        title: "МОНГОЛ УЛСЫН НЭГДСЭН ТӨСВИЙН ЗАРЛАГА (өссөн дүн)",
        type: "area",
        xDimension: "Сар",
        chartApiUrl: BUDGET_EXPENSE_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["0"] } },
            { code: "Сар", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-balance-cumulative",
        title: "ТӨСВИЙН ТЭНЦЭЛ (өссөн дүнгээр)",
        type: "line",
        xDimension: "Он",
        computedFormula: "budget-balance-cumulative",
        computedSourceCharts: ["budget-income-cumulative", "budget-expense-cumulative"],
      },
      {
        id: "budget-tax-income",
        title: "Татварын орлого",
        type: "line",
        xDimension: "Он",
        chartApiUrl: BUDGET_INCOME_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["6"] } },
            { code: "Он", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-income-tax",
        title: "Орлогын албан татвар",
        type: "line",
        xDimension: "Он",
        chartApiUrl: BUDGET_INCOME_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["7"] } },
            { code: "Он", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-social-insurance",
        title: "Нийгмийн даатгалын орлого",
        type: "line",
        xDimension: "Он",
        chartApiUrl: BUDGET_INCOME_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["11"] } },
            { code: "Он", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-vat",
        title: "Нэмэгдсэн өртгийн албан татвар",
        type: "line",
        xDimension: "Он",
        chartApiUrl: BUDGET_INCOME_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["14"] } },
            { code: "Он", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-excise-tax",
        title: "Онцгой албан татвар",
        type: "line",
        xDimension: "Он",
        chartApiUrl: BUDGET_INCOME_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["18"] } },
            { code: "Он", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-other-income",
        title: "Татварын бус орлого",
        // description: "Татварын бус орлого + Хөрөнгийн орлого + Тусламжийн орлого",
        type: "line",
        xDimension: "Он",
        chartApiUrl: BUDGET_INCOME_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["48", "50", "51"] } },
            { code: "Он", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      // Expense category charts
      {
        id: "budget-total-expense",
        title: "Төсвийн зарлага",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: BUDGET_EXPENSE_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["0"] } },
            { code: "Сар", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-current-expense",
        title: "Урсгал зардал",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: BUDGET_EXPENSE_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["1"] } },
            { code: "Сар", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-capital-expense",
        title: "Хөрөнгийн зардал",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: BUDGET_EXPENSE_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["43"] } },
            { code: "Сар", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "budget-net-loan",
        title: "Цэвэр зээл",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: BUDGET_EXPENSE_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Ангилал", selection: { filter: "item", values: ["52"] } },
            { code: "Сар", selection: { filter: "item", values: range(313) } },
          ],
          response: { format: "json-stat2" },
        },
      },
    ],
  },
  {
    id: "foreign-trade",
    name: "Гадаад худалдаа",
    category: "ЭДИЙН ЗАСАГ",
    shortTitle: "Гадаад худалдаа",
    apiUrl: FOREIGN_TRADE_MONTHLY_URL,
    primaryDimension: "Сар",
    lastUpdated: "",
    kpiValue: "",
    kpiPeriod: "",
    percent: "",
    description: "",
    kpiFromApi: true,
    kpiApiUrl: FOREIGN_TRADE_CUMULATIVE_URL,
    kpiTimeDimension: "Сар",
    kpiFormat: "number",
    kpiSelections: { "Гадаад худалдааны үндсэн үзүүлэлт": ["0"] },
    trendApiUrl: FOREIGN_TRADE_CUMULATIVE_URL,
    trendTimeDimension: "Сар",
    trendSelections: {
      "Гадаад худалдааны үндсэн үзүүлэлт": ["0"],
      "Сар": ["0", "12", "24", "36", "48", "60", "72", "84", "96", "108", "120", "132", "144", "156", "168", "180", "192", "204", "216", "228", "240", "252", "264", "276", "288", "300", "312", "324", "336", "348"],
    },
    trendValueSuffix: "сая $",
    charts: [
      {
        id: "foreign-trade-export",
        title: "Экспорт",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: FOREIGN_TRADE_MONTHLY_URL,
        chartFixedQuery: {
          query: [
            { code: "Гадаад худалдааны үндсэн үзүүлэлт", selection: { filter: "item", values: ["11"] } },
            { code: "Сар", selection: { filter: "item", values: range(349) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "foreign-trade-import",
        title: "Импорт",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: FOREIGN_TRADE_MONTHLY_URL,
        chartFixedQuery: {
          query: [
            { code: "Гадаад худалдааны үндсэн үзүүлэлт", selection: { filter: "item", values: ["12"] } },
            { code: "Сар", selection: { filter: "item", values: range(349) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "foreign-trade-balance",
        title: "Гадаад худалдааны тэнцэл",
        type: "line",
        xDimension: "Сар",
        computedFormula: "foreign-trade-balance",
        computedSourceCharts: ["foreign-trade-export", "foreign-trade-import"],
      },
      {
        id: "foreign-trade-yearly",
        title: "Жилийн гүйцэтгэл",
        type: "line",
        xDimension: "Он",
        chartApiUrl: FOREIGN_TRADE_YEAR_URL,
        chartFixedQuery: {
          query: [
            { code: "Гадаад худалдааны үндсэн үзүүлэлт", selection: { filter: "item", values: ["1", "2", "3"] } },
            { code: "Он", selection: { filter: "item", values: range(101) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "foreign-trade-export-cumulative",
        title: "Экспорт (өссөн дүн)",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: FOREIGN_TRADE_CUMULATIVE_URL,
        chartFixedQuery: {
          query: [
            { code: "Гадаад худалдааны үндсэн үзүүлэлт", selection: { filter: "item", values: ["1"] } },
            { code: "Сар", selection: { filter: "item", values: range(349) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "foreign-trade-import-cumulative",
        title: "Импорт (өссөн дүн)",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: FOREIGN_TRADE_CUMULATIVE_URL,
        chartFixedQuery: {
          query: [
            { code: "Гадаад худалдааны үндсэн үзүүлэлт", selection: { filter: "item", values: ["2"] } },
            { code: "Сар", selection: { filter: "item", values: range(349) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "foreign-trade-balance-cumulative",
        title: "Гадаад худалдааны тэнцэл (өссөн дүн)",
        type: "line",
        xDimension: "Сар",
        computedFormula: "foreign-trade-balance-cumulative",
        computedSourceCharts: ["foreign-trade-export-cumulative", "foreign-trade-import-cumulative"],
      },
      {
        id: "foreign-trade-export-products",
        title: "ЭКСПОРТЫН ЗАРИМ ГОЛ НЭРИЙН БАРАА",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: FOREIGN_TRADE_EXPORT_PRODUCTS_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["0", "1"] } },
            { code: "Гол нэр төрлийн бараа", selection: { filter: "item", values: range(33) } },
            { code: "Сар", selection: { filter: "item", values: range(181) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "foreign-trade-import-products",
        title: "ИМПОРТЫН ЗАРИМ ГОЛ НЭРИЙН БАРАА",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: FOREIGN_TRADE_IMPORT_PRODUCTS_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["0", "1"] } },
            { code: "Гол нэр төрлийн бараа", selection: { filter: "item", values: range(48) } },
            { code: "Сар", selection: { filter: "item", values: range(181) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "foreign-trade-export-products-yearly",
        title: "ЭКСПОРТЫН ЗАРИМ ГОЛ НЭРИЙН БАРАА",
        type: "line",
        xDimension: "Он",
        chartApiUrl: FOREIGN_TRADE_EXPORT_PRODUCTS_YEAR_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["0", "1"] } },
            { code: "Гол нэр төрлийн бараа", selection: { filter: "item", values: range(33) } },
            { code: "Он", selection: { filter: "item", values: range(30) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "foreign-trade-import-products-yearly",
        title: "ИМПОРТЫН ЗАРИМ ГОЛ НЭРИЙН БАРАА",
        type: "line",
        xDimension: "Он",
        chartApiUrl: FOREIGN_TRADE_IMPORT_PRODUCTS_YEAR_URL,
        chartFixedQuery: {
          query: [
            { code: "Статистик үзүүлэлт", selection: { filter: "item", values: ["0", "1"] } },
            { code: "Гол нэр төрлийн бараа", selection: { filter: "item", values: range(48) } },
            { code: "Он", selection: { filter: "item", values: range(30) } },
          ],
          response: { format: "json-stat2" },
        },
      },
    ],
  },
  {
    id: "balance-of-payments",
    name: "Төлбөрийн тэнцэл",
    category: "ЭДИЙН ЗАСАГ",
    shortTitle: "Төлбөрийн тэнцэл",
    apiUrl: BALANCE_OF_PAYMENTS_URL,
    primaryDimension: "Сар",
    lastUpdated: "",
    kpiValue: "",
    kpiPeriod: "",
    percent: "",
    description: "",
    kpiFromApi: true,
    kpiApiUrl: BALANCE_OF_PAYMENTS_URL,
    kpiTimeDimension: "Сар",
    kpiFormat: "number",
    kpiSelections: { Үзүүлэлт: ["66"] },
    trendApiUrl: BALANCE_OF_PAYMENTS_URL,
    trendTimeDimension: "Сар",
    trendSelections: {
      Үзүүлэлт: ["66"],
      Сар: ["0", "12", "24", "36", "48", "60", "72", "84", "96", "108", "120", "132", "144", "156", "168", "180", "192"],
    },
    trendValueSuffix: "сая $",
    charts: [
      {
        id: "bop-table",
        title: "Төлбөрийн тэнцлийн бүтэц (өссөн дүн, сая ам.доллар)",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: BALANCE_OF_PAYMENTS_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: BOP_TABLE_INDICATOR_VALUES } },
            { code: "Сар", selection: { filter: "item", values: range(204) } },
          ],
          response: { format: "json-stat2" },
        },
      },
    ],
  },
  {
    id: "money-finance",
    name: "Мөнгө, санхүү",
    category: "ЭДИЙН ЗАСАГ",
    shortTitle: "Мөнгө, санхүү",
    apiUrl: MONEY_SUPPLY_URL,
    primaryDimension: "Сар",
    lastUpdated: "",
    kpiValue: "",
    kpiPeriod: "",
    percent: "",
    kpiFromApi: true,
    kpiApiUrl: MONEY_SUPPLY_URL,
    kpiSelections: { Үзүүлэлт: ["0"] },
    trendPoints: 13,
    description: "",
    charts: [
      {
        id: "money-supply-table",
        title: "Мөнгөний нийлүүлэлт (сараар, тэрбум төгрөг)",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: MONEY_SUPPLY_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: MONEY_SUPPLY_INDICATOR_VALUES } },
            { code: "Сар", selection: { filter: "item", values: range(356) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "loan-table",
        title: "Зээлийн үзүүлэлт",
        type: "line",
        xDimension: "Сар",
        chartApiUrl: LOAN_INDICATORS_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: LOAN_INDICATOR_VALUES } },
            { code: "салбараар", selection: { filter: "item", values: LOAN_SECTOR_VALUES } },
            { code: "Сар", selection: { filter: "item", values: range(349) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "loan-balance-area",
        title: "Зээлийн үлдэгдлийн хэмжээ (салбараар)",
        type: "area",
        xDimension: "Сар",
        seriesDimensions: ["салбараар"],
        chartApiUrl: LOAN_INDICATORS_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: ["0"] } },
            { code: "салбараар", selection: { filter: "item", values: ["0", "1", "2", "3", "4", "5"] } },
            { code: "Сар", selection: { filter: "item", values: range(349) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "loan-citizens-detail",
        title: "Иргэдэд олгосон зээлийн өрийн үлдэгдэл",
        type: "area",
        xDimension: "Сар",
        chartApiUrl: LOAN_CITIZENS_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: LOAN_CITIZENS_INDICATOR_VALUES } },
            { code: "Сар", selection: { filter: "item", values: range(118) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "loan-ipotek-detail",
        title: "Иргэдэд олгосон ипотекийн зээлийн өрийн үлдэгдэл",
        type: "area",
        xDimension: "Сар",
        chartApiUrl: LOAN_IPOTEK_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: LOAN_IPOTEK_INDICATOR_VALUES } },
            { code: "Сар", selection: { filter: "item", values: range(216) } },
          ],
          response: { format: "json-stat2" },
        },
      },
      {
        id: "loan-rate",
        title: "Ханшийн индекс (REER, NEER)",
        type: "area",
        xDimension: "Сар",
        chartApiUrl: EXCHANGE_RATE_URL,
        chartFixedQuery: {
          query: [
            { code: "Үзүүлэлт", selection: { filter: "item", values: EXCHANGE_RATE_INDICATOR_VALUES } },
            { code: "Сар", selection: { filter: "item", values: range(312) } },
          ],
          response: { format: "json-stat2" },
        },
      },
    ],
  },
  {
    id: "business-register",
    name: "Бизнес регистр",
    category: "ЭДИЙН ЗАСАГ",
    shortTitle: "Бизнес регистр",
    apiUrl: BUSINESS_REGISTER_018_URL,
    primaryDimension: "Улирал",
    lastUpdated: "",
    kpiValue: "",
    kpiPeriod: "",
    kpiFromApi: true,
    kpiApiUrl: BUSINESS_REGISTER_018_URL,
    kpiFormat: "number",
    kpiLabel: "Үйл ажиллагаа явуулж байгаа ААНБ-н тоо",
    kpiValueSuffix: " маянга",
    kpiSelections: {
      "Үйл ажиллагаа эрхлэлтийн байдал": ["1"],
      "Эдийн засгийн салбар": ["0"],
    },
    kpiTimeDimension: "Улирал",
    trendApiUrl: BUSINESS_REGISTER_018_URL,
    trendTimeDimension: "Улирал",
    trendSelections: {
      "Үйл ажиллагаа эрхлэлтийн байдал": ["1"],
      "Эдийн засгийн салбар": ["0"],
      Улирал: range(49),
    },
    charts: [
      {
        id: "business-register-active",
        title: "Үйл ажиллагаа явуулж байгаа ААНБ-н тоо",
        // description: "Бизнес регистрийн санд бүртгэлтэй, үйл ажиллагаа явуулж байгаа хуулийн этгэдийн (ААНБ) тоо улирлаар.",
        type: "area",
        xDimension: "Улирал",
        chartApiUrl: BUSINESS_REGISTER_018_URL,
        chartFixedQuery: {
          query: [
            { code: "Үйл ажиллагаа эрхлэлтийн байдал", selection: { filter: "item", values: ["1"] } },
            { code: "Эдийн засгийн салбар", selection: { filter: "item", values: ["0"] } },
            { code: "Улирал", selection: { filter: "item", values: range(49) } },
          ],
          response: { format: "json-stat2" },
        },
      },
    ],
  },
  {
    id: "society-education",
    name: "Боловсрол",
    category: "НИЙГЭМ",
    shortTitle: "Боловсрол",
    // description: "Нийгэм салбарын боловсролын үзүүлэлтүүд",
    kpiApiUrl: EDUCATION_STUDENTS_URL,
    kpiTimeDimension: "Он",
    kpiFormat: "number",
    kpiLabel: "Суралцагчид",
    kpiSelections: { Ангилал: ["1"] },
    trendApiUrl: EDUCATION_STUDENTS_URL,
    trendTimeDimension: "Он",
    trendSelections: { Ангилал: ["1"], Он: range(6) },
    threeColumnChartIds: ["education-schools", "education-teachers", "education-students"],
    educationBottomChartId: "education-graduates",
    educationAngilalCodeMap: {
      "education-teachers": { "0": "2", "1": "4", "5": "6", "8": "8" },
      "education-students": { "0": "2", "1": "3", "5": "4", "8": "5" },
    },
    charts: [
      {
        id: "education-schools",
        title: "Боловсролын байгууллагын тоо",
        type: "line",
        xDimension: "Он",
        seriesDimensions: ["Ангилал"],
        chartApiUrl: EDUCATION_SCHOOLS_URL,
        chartFixedQuery: {
          query: [
            { code: "Ангилал", selection: { filter: "item", values: ["0", "1", "5", "8"] } },
            { code: "Он", selection: { filter: "item", values: range(16) } },
          ],
          response: { format: "json-stat2" },
        },
        chartHeight: 280,
      },
      {
        id: "education-teachers",
        title: "БАГШ НАРЫН ТОО",
        type: "line",
        xDimension: "Он",
        seriesDimensions: ["Ангилал"],
        chartApiUrl: EDUCATION_TEACHERS_URL,
        chartFixedQuery: {
          query: [
            { code: "Ангилал", selection: { filter: "item", values: ["2", "4", "6", "8"] } },
            { code: "Он", selection: { filter: "item", values: range(16) } },
          ],
          response: { format: "json-stat2" },
        },
        chartHeight: 280,
      },
      {
        id: "education-students",
        title: "СУРАЛЦАГЧДЫН ТОО",
        type: "line",
        xDimension: "Он",
        seriesDimensions: ["Ангилал"],
        chartApiUrl: EDUCATION_STUDENTS_URL,
        chartFixedQuery: {
          query: [
            { code: "Ангилал", selection: { filter: "item", values: ["2", "3", "4", "5"] } },
            { code: "Он", selection: { filter: "item", values: range(16) } },
          ],
          response: { format: "json-stat2" },
        },
        chartHeight: 280,
      },
      {
        id: "education-graduates",
        title: "ТӨГСӨГЧИД",
        type: "line",
        xDimension: "Он",
        seriesDimensions: ["Ангилал"],
        chartApiUrl: EDUCATION_GRADUATES_URL,
        chartFixedQuery: {
          query: [
            { code: "Ангилал", selection: { filter: "item", values: ["2", "4", "6"] } },
            { code: "Он", selection: { filter: "item", values: range(25) } },
          ],
          response: { format: "json-stat2" },
        },
        chartHeight: 420,
      },
    ],
  },
  {
    id: "livestock",
    name: "Хөдөө аж ахуй",
    category: "ЭДИЙН ЗАСАГ",
    shortTitle: "Хөдөө аж ахуй",
    description: "Бүс, аймаг, сум хэмжээгээр малын тоог газрын зураг дээр харуулна.",
    cardHref: "/agriculture/livestock",
    kpiValue: "",
    kpiPeriod: "",
    kpiFromApi: true,
    kpiApiUrl: LIVESTOCK_TOTAL_URL,
    kpiTimeDimension: "Он",
    kpiSelections: { "Малын төрөл": ["0"], Бүс: ["0"] },
    kpiFormat: "number",
    kpiLabel: "Нийт малын тоо",
    kpiValueSuffix: " сая.толгой",
    charts: [],
  },
  {
    id: "population-by-region",
    name: "Засаг захиргааны нэгжийн үзүүлэлт",
    category: "",
    shortTitle: "",
    description: "",
    cardHref: "/population/by-region",
    charts: [],
  },
];

/** Тусдаа App Router хуудас (cardHref) — /s-e-dashboard/[id] дээр хоосон dashboard биш */
const STANDALONE_CARD_ONLY_IDS = new Set<string>(["livestock", "population-by-region"]);

/** Албан ёсны зам: /s-e-dashboard/business — тохиргооны id нь business-register хэвээр */
export function getDashboard(id: string): DashboardConfig | undefined {
  const canonical = id === "business" ? "business-register" : id;
  if (STANDALONE_CARD_ONLY_IDS.has(canonical)) return undefined;
  return dashboards.find((d) => d.id === canonical);
}

export function getDashboardIds(): string[] {
  return dashboards
    .filter((d) => !STANDALONE_CARD_ONLY_IDS.has(d.id))
    .map((d) => (d.id === "business-register" ? "business" : d.id));
}

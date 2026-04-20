// Every sector has a unique id. file_type in DB stores this id. Filter by id.
export const sectors_list = [
    { id: 0, type: "all", mnName: "Бүх файл", enName: "All files" },
    { id: 14, type: "weekprice", mnName: "7 хоногийн үнийн мэдээ", enName: "Weekly Price" },
    { id: 15, type: "foreigntrade", mnName: "15 хоногийн гадаад худалдааны мэдээ", enName: "Foreign Trade" },
    {
        id: 1,
        type: "bulletin",
        mnName: "Сарын танилцуулга",
        enName: "Bulletin",
        subFilters: [
            { id: 101, value: "introduction", mnName: "Танилцуулга", enName: "Introduction" },
            // { id: 102, value: "appendix_table", mnName: "Хавсралт хүснэгт", enName: "Appendix Table" },
            { id: 103, value: "report", mnName: "Илтгэл", enName: "Report" },
        ],
    },
    { id: 2, type: "annual", mnName: "Жилийн эмхэтгэл", enName: "Annual Report" },
    {
        id: 3,
        type: "census",
        mnName: "Тооллого",
        enName: "Census",
        subFilters: [
            { id: 8, value: "enterprise_census", mnName: "ААНБТ", enName: "Enterprise Census" },
            { id: 7, value: "agricultural_census", mnName: "Хөдөө аж ахуй", enName: "Agricultural Census" },
            { id: 10, value: "pahc", mnName: "ХАОСТ", enName: "PAHC Survey" },
            { id: 9, value: "livestock_census", mnName: "Мал тооллого", enName: "Livestock Census" },
        ],
    },
    {
        id: 12,
        type: "magazine",
        mnName: "Ном, сэтгүүл",
        enName: "Magazine",
        subFilters: [
            { id: 121, value: "book", mnName: "Ном", enName: "Book" },
            { id: 122, value: "magazine", mnName: "Сэтгүүл", enName: "Magazine" },
        ],
    },
    {
        id: 17,
        type: "sample_survey",
        mnName: "Түүвэр судалгаа",
        enName: "Sample Survey",
        subFilters: [
            { id: 171, value: "ahs", mnName: "АХС", enName: "AHS" },
            { id: 172, value: "unes", mnName: "ӨНЭЗС", enName: "Household Socio-Economic Survey" },
            { id: 173, value: "time_use_survey", mnName: "Цаг ашиглалтын судалгаа", enName: "Time Use Survey" },
            { id: 174, value: "crime_victimization_survey", mnName: "Гэмт хэрэгт хохирох эрсдэлийн судалгаа", enName: "Crime Victimization Survey" },
            { id: 175, value: "social_indicators_sample_survey", mnName: "Нийгмийн үзүүлэлтийн түүвэр судалгаа", enName: "Social Indicators Sample Survey" },
            { id: 176, value: "democratic_governance_survey", mnName: "Ардчилсан засаглал судалгаа", enName: "Democratic Governance Survey" },
        ],
    },
    { id: 18, type: "livingstandart", mnName: "Амьжиргааны доод түвшин", enName: "Living Standard" },
];

/**
 * For file-library: URL `type` is parent sector id → include every subFilter id so all sub-types show together.
 * Leaf sector or sub id → single id.
 * Returns null when caller should use all-file-type list (`all` / `0`).
 */
export function getFileTypeIdsForLibraryFilter(type) {
    if (type === undefined || type === null || type === "") return null;
    const t = String(type);
    if (t === "all" || t === "0") return null;

    const num = parseInt(t, 10);
    if (Number.isNaN(num)) return [t];

    const parent = sectors_list.find((s) => s.id === num && s.subFilters?.length);
    if (parent) {
        return parent.subFilters.map((sub) => String(sub.id));
    }
    return [String(num)];
}

/** All file_type ids (for "all" filter). Excludes 0. Main sectors + census sub-types that are stored as file_type. */
export function getAllFileTypeIds() {
    return sectors_list
        .flatMap(sector => [
            sector.id,
            ...(sector.subFilters?.map(sub => sub.id) || [])
        ])
        .filter(id => id !== 0);
}

/** Find sector (or sub) by id. type param in URL is this id. */
export function getSectorById(id) {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (Number.isNaN(numId)) return null;
    for (const s of sectors_list) {
        if (s.id === numId) return s;
        for (const sub of s.subFilters || []) {
            if (sub.id === numId) return { ...sub, parentId: s.id };
        }
    }
    return null;
}

/** Resolve type (id string) to display name */
export function getSectorNameById(id, lng) {
    const sector = getSectorById(id);
    if (!sector) return lng === "mn" ? "Бүх файл" : "All files";
    return lng === "mn" ? (sector.mnName || sector.enName) : (sector.enName || sector.mnName);
}


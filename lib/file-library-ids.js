/** File-type ids stored in file_type column. Used by API for filtering. "all" = show all these ids. */
export const FILE_TYPE_IDS = [
    14, 15, 1, 2, 3, 12, 18, // main sectors
    8, 7, 10, 9, // census sub-types: enterprise_census, agricultural_census, pahc, livestock_census
];

export function getAllFileTypeIds() {
    return FILE_TYPE_IDS;
}

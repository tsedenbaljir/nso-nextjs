/** File-type ids stored in file_type column. Single source of truth from sectors. */
import { getAllFileTypeIds as getAllIdsFromSectors } from "./sectors";

export const FILE_TYPE_IDS = getAllIdsFromSectors();

export function getAllFileTypeIds() {
    return FILE_TYPE_IDS;
}

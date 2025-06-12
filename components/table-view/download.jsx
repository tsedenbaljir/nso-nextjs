import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportPXWebToExcel(pxData, format = 'xlsx', filename = 'pxweb_data') {
    if (format === "csv") {
        const dimensions = pxData.dimension;
        const dimensionIds = pxData.id;
        const labels = dimensionIds.map((id) => dimensions[id].label);
        const categoryLabels = dimensionIds.map((id) =>
            Object.values(dimensions[id].category.label)
        );

        const allCombinations = cartesian(...categoryLabels);
        const values = pxData.value;

        const table = allCombinations.map((row, idx) => {
            const record = {};
            labels.forEach((label, i) => {
                record[label] = row[i];
            });
            record['Утга'] = values[idx] ?? '';
            return record;
        });

        const ws = XLSX.utils.json_to_sheet(table);
        const wb = XLSX.utils.book_new();

        const sheetName = filename
            .replace(/[:\\/?*[\]]/g, '') // Remove invalid characters
            .slice(0, 31); // Truncate to 31 characters
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        const now = new Date();
        const timestamp = now
            .toISOString()
            .slice(0, 16)
            .replace('T', '_')
            .replace(':', '');

        // For CSV, ensure we use the same table format as XLSX
        const csv = XLSX.utils.sheet_to_csv(ws, { FS: ',', blankrows: false });
        // Add UTF-8 BOM for proper character encoding detection
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `${filename}_${timestamp}.csv`);
    } else {
        const dimensions = pxData.dimension;
        const dimensionIds = pxData.id;
        const labels = dimensionIds.map((id) => dimensions[id].label);
        const categoryLabels = dimensionIds.map((id) =>
            Object.values(dimensions[id].category.label)
        );

        const allCombinations = cartesian(...categoryLabels);
        const values = pxData.value;
        let yearDimensionIndex = -1;
        // Identify the year dimension based on its ID or label (more robustly)
        // First, try to find a year dimension by its ID (e.g., 'TIME', 'YEAR')
        const yearDimensionKeyById = pxData.id.find(key =>
            ['он', 'жил', 'улирал', 'хугацаа'].some(kw => key.toLowerCase().includes(kw))
        );

        if (yearDimensionKeyById) {
            yearDimensionIndex = pxData.id.indexOf(yearDimensionKeyById);
        }

        // If not found by ID, try to find by label (e.g., 'Он', 'Хугацаа')
        if (yearDimensionIndex === -1) {
            yearDimensionIndex = labels.findIndex(label =>
                ['он', 'жил', 'улирал', 'хугацаа'].some(kw => label.toLowerCase().includes(kw))
            );
        }
        let table;

        if (yearDimensionIndex !== -1) {
            // If a year dimension is found, pivot the data
            const stubLabels = labels.filter((_, i) => i !== yearDimensionIndex);
            // Get and numerically sort all unique years
            const years = categoryLabels[yearDimensionIndex].sort((a, b) => parseInt(a) - parseInt(b));

            const pivotedData = {};

            allCombinations.forEach((combination, idx) => {
                const year = combination[yearDimensionIndex];
                // Get values for stub dimensions based on their original positions
                const stubValues = stubLabels.map(label => combination[labels.indexOf(label)]);
                const stubKey = JSON.stringify(stubValues); // Use stringified array as a unique key

                if (!pivotedData[stubKey]) {
                    pivotedData[stubKey] = {
                        _stubValues: stubValues, // Store stub values for easy retrieval
                    };
                }
                pivotedData[stubKey][year] = values[idx] ?? '';
            });

            // Group rows by the first dimension
            const groupedRows = {};
            Object.values(pivotedData).forEach(rowData => {
                const firstDimValue = rowData._stubValues[0];
                if (!groupedRows[firstDimValue]) {
                    groupedRows[firstDimValue] = [];
                }
                groupedRows[firstDimValue].push(rowData);
            });

            // Construct the new table for XLSX.utils.aoa_to_sheet
            const newTable = [];

            // Add header row (stub labels + sorted years)
            newTable.push([...stubLabels, ...years]);

            // Add data rows with grouping
            Object.entries(groupedRows).forEach(([groupValue, groupRows]) => {
                groupRows.forEach((rowData, rowIndex) => {
                    const row = [...rowData._stubValues]; // Start with stub values
                    years.forEach(year => row.push(rowData[year] || '')); // Add year values, fill missing with empty string
                    newTable.push(row);
                });
            });

            table = newTable; // Use the new pivoted table
        } else {
            // If no year dimension is found, export in the original flat format
            table = allCombinations.map((row, idx) => {
                const record = {};
                labels.forEach((label, i) => {
                    record[label] = row[i];
                });
                record['Утга'] = values[idx] ?? '';
                return record;
            });
        }

        // Use aoa_to_sheet for array of arrays or json_to_sheet for array of objects
        const ws = Array.isArray(table[0]) ? XLSX.utils.aoa_to_sheet(table) : XLSX.utils.json_to_sheet(table);

        // Set column widths and styles for better readability
        if (Array.isArray(table[0])) {
            const colWidths = table[0].map((_, index) => ({ wch: 15 })); // Set default width for all columns
            ws['!cols'] = colWidths;

            // Add header style
            const headerStyle = {
                font: { bold: true },
                alignment: { horizontal: 'center' },
                fill: { fgColor: { rgb: "F2F2F2" } } // Light gray background
            };

            // Apply header style to first row
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
                if (!ws[cellRef]) ws[cellRef] = { v: table[0][C] };
                ws[cellRef].s = headerStyle;
            }

            // Add border style for all cells
            const borderStyle = {
                style: 'thin',
                color: { rgb: "000000" }
            };

            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!ws[cellRef]) ws[cellRef] = { v: table[R][C] };
                    if (!ws[cellRef].s) ws[cellRef].s = {};
                    ws[cellRef].s.border = {
                        top: borderStyle,
                        bottom: borderStyle,
                        left: borderStyle,
                        right: borderStyle
                    };
                }
            }
        }

        const wb = XLSX.utils.book_new();
        // Sanitize sheet name by removing invalid characters and truncating to 31 chars
        const sheetName = filename
            .replace(/[:\\/?*[\]]/g, '') // Remove invalid characters
            .slice(0, 31); // Truncate to 31 characters
        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        const now = new Date();
        const timestamp = now
            .toISOString()
            .slice(0, 16)
            .replace('T', '_')
            .replace(':', '');

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, `${filename}_${timestamp}.xlsx`);
    }
}

function cartesian(...arrays) {
    return arrays.reduce((a, b) =>
        a.flatMap((d) => b.map((e) => [...(Array.isArray(d) ? d : [d]), e]))
    );
}
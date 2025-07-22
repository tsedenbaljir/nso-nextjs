import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportPXWebToExcel(pxData, format = 'xlsx', filename = 'pxweb_data') {
    if (format === "csv") {
        const dimensions = pxData.dimension;
        const dimensionIds = pxData.id;
        const labels = dimensionIds.map((id) => dimensions[id].label);
        // List of labels that should have a code column after them
        const showCodeLabels = [
            'Аймаг', 'Aimag',
            'Аймаг, сум', 'Aimag, soum',
            'Баг, хороо', 'Bag, khoroo',
            'Аймгийн код', 'Aimag code',
            'Засаг захиргааны нэгж', 'Administrator unit', 'Administrative unit'
        ];
        // Build exportLabels: insert 'Код' after matching label
        const exportLabels = [];
        labels.forEach((label, i) => {
            exportLabels.push(label);
            if (showCodeLabels.includes(label)) {
                exportLabels.push('Код');
            }
        });
        const categoryLabels = dimensionIds.map((id) => {
            const labelObj = dimensions[id].category.label;
            const indexObj = dimensions[id].category.index;
            return Object.entries(labelObj)
                .map(([code, label]) => ({ code, label, idx: indexObj[code] }))
                .sort((a, b) => a.idx - b.idx)
                .map(item => item.label);
        });

        const allCombinations = cartesian(...categoryLabels);
        const allCodes = dimensionIds.map((id) => {
            const labelObj = dimensions[id].category.label;
            const indexObj = dimensions[id].category.index;
            return Object.entries(labelObj)
                .map(([code, label]) => ({ code, label, idx: indexObj[code] }))
                .sort((a, b) => a.idx - b.idx)
                .map(item => item.code);
        });
        const allCombinationsCodes = cartesian(...allCodes);
        const values = pxData.value;

        const table = allCombinations.map((row, idx) => {
            const record = {};
            let codeColOffset = 0;
            labels.forEach((label, i) => {
                record[exportLabels[i + codeColOffset]] = row[i];
                if (showCodeLabels.includes(label)) {
                    record[exportLabels[i + codeColOffset + 1]] = allCombinationsCodes[idx][i];
                    codeColOffset++;
                }
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

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `${filename}_${timestamp}.csv`);
    } else {
        const dimensions = pxData.dimension;
        const dimensionIds = pxData.id;
        const labels = dimensionIds.map((id) => dimensions[id].label);
        const showCodeLabels = [
            'Аймаг', 'Aimag',
            'Аймаг, сум', 'Aimag, soum',
            'Баг, хороо', 'Bag, khoroo',
            'Аймгийн код', 'Aimag code',
            'Засаг захиргааны нэгж', 'Administrator unit', 'Administrative unit'
        ];
        const exportLabels = [];
        labels.forEach((label, i) => {
            exportLabels.push(label);
            if (showCodeLabels.includes(label)) {
                exportLabels.push('Код');
            }
        });
        const categoryLabels = dimensionIds.map((id) => {
            const labelObj = dimensions[id].category.label;
            const indexObj = dimensions[id].category.index;
            return Object.entries(labelObj)
                .map(([code, label]) => ({ code, label, idx: indexObj[code] }))
                .sort((a, b) => a.idx - b.idx)
                .map(item => item.label);
        });

        const allCombinations = cartesian(...categoryLabels);
        const values = pxData.value;
        const allCodes = dimensionIds.map((id) => {
            const labelObj = dimensions[id].category.label;
            const indexObj = dimensions[id].category.index;
            return Object.entries(labelObj)
                .map(([code, label]) => ({ code, label, idx: indexObj[code] }))
                .sort((a, b) => a.idx - b.idx)
                .map(item => item.code);
        });
        const allCombinationsCodes = cartesian(...allCodes);
        let yearDimensionIndex = -1;
        // Identify the year dimension based on its ID or label (more robustly)
        // First, try to find a year dimension by its ID (e.g., 'TIME', 'YEAR')
        const yearDimensionKeyById = pxData.id.find(key =>
            ['он', 'жил', 'улирал', 'хугацаа', 'сар'].some((kw) => key.toLowerCase() === kw)
        );

        if (yearDimensionKeyById) {
            yearDimensionIndex = pxData.id.indexOf(yearDimensionKeyById);
        }

        // If not found by ID, try to find by label (e.g., 'Он', 'Хугацаа')
        if (yearDimensionIndex === -1) {
            yearDimensionIndex = labels.findIndex(label =>
                ['он', 'жил', 'улирал', 'хугацаа', 'сар'].some(kw => label.toLowerCase() === kw)
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
                        _combinationIdx: idx // Store the original index of the combination
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
            const stubExportLabels = [];
            stubLabels.forEach((label, i) => {
                stubExportLabels.push(label);
                if (showCodeLabels.includes(label)) {
                    stubExportLabels.push('Код');
                }
            });
            newTable.push([...stubExportLabels, ...years]);

            // Add data rows with grouping
            Object.entries(groupedRows).forEach(([groupValue, groupRows]) => {
                groupRows.forEach((rowData, rowIndex) => {
                    const row = [];
                    stubLabels.forEach((label, i) => {
                        row.push(rowData._stubValues[i]);
                        if (showCodeLabels.includes(label)) {
                            const labelIdx = labels.indexOf(label);
                            row.push(allCombinationsCodes[rowData._combinationIdx][labelIdx]);
                        }
                    });
                    years.forEach(year => row.push(rowData[year] || ''));
                    newTable.push(row);
                });
            });
            table = newTable; // Use the new pivoted table
        } else {
            // If no year dimension is found, export in the original flat format
            table = allCombinations.map((row, idx) => {
                const record = {};
                let codeColOffset = 0;
                labels.forEach((label, i) => {
                    record[exportLabels[i + codeColOffset]] = String(row[i]);
                    if (showCodeLabels.includes(label)) {
                        record[exportLabels[i + codeColOffset + 1]] = allCombinationsCodes[idx][i];
                        codeColOffset++;
                    }
                });
                record['Утга'] = String(values[idx] ?? '');
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
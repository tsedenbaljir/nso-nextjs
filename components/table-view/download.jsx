import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportPXWebToExcel(pxData, format = 'xlsx', filename = 'pxweb_data') {
    if (format === "csv") {
        const dimensions = pxData.dimension;
        const dimensionIds = pxData.id;
        const labels = dimensionIds.map((id) => dimensions[id].label);
        // List of labels that should have a code column after them
        const showCodeLabels = [
            'Бүс', 'Region',
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
        // Check if data has required structure like the table component
        if (!pxData || !pxData.id || !pxData.dimension || !pxData.value || !pxData.size) {
            return;
        }

        const yearKey = pxData.id.find((key) =>
            ['он', 'жил', 'улирал', 'хугацаа', 'сар'].some((kw) => key.toLowerCase() === kw)
        );

        if (!yearKey || !pxData.dimension[yearKey]) {
            // Fallback to simple format if no year dimension
            const dimensions = pxData.dimension;
            const dimensionIds = pxData.id;
            const labels = dimensionIds.map((id) => dimensions[id].label);
            const showCodeLabels = [
                'Бүс', 'Region',
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
                .replace(/[:\\/?*[\]]/g, '')
                .slice(0, 31);
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
            return;
        }

        // Use the same logic as the table component
        const years = Object.entries(pxData.dimension[yearKey].category.index).map(
            ([code]) => ({
                code,
                label: pxData.dimension[yearKey].category.label[code] || code,
            })
        ).reverse();

        const rowKeys = pxData.id.filter((key) => key !== yearKey);
        const validRowKeys = rowKeys.filter((key) => pxData.dimension[key]).map(key => ({
            key,
            label: pxData.dimension[key].label || key
        }));

        const rowDimensions = validRowKeys.map(({ key, label: dimensionLabel }) => {
            const index = pxData.dimension[key].category.index;
            const label = pxData.dimension[key].category.label;
            return Object.entries(index).map(([code, idx]) => ({
                code,
                label: label[code] || code,
                idx,
                key,
                dimensionLabel,
            })).sort((a, b) => a.idx - b.idx);
        });

        const combinations = [];
        const generateCombinations = (dims, prefix = []) => {
            if (dims.length === 0) {
                combinations.push(prefix);
                return;
            }
            for (const val of dims[0]) {
                generateCombinations(dims.slice(1), [...prefix, val]);
            }
        };
        generateCombinations(rowDimensions);

        const rows = combinations.map((combo) => {
            const indices = combo.map((c) => c.idx);
            const yearData = years.map(({ code }) => {
                const yearIdx = pxData.dimension[yearKey].category.index[code];
                const dimSizes = [...indices, yearIdx];
                const idx = dimSizes.reduce(
                    (acc, currIdx, i) =>
                        acc + currIdx * pxData.size.slice(i + 1).reduce((a, b) => a * b, 1),
                    0
                );
                return pxData.value[idx] ?? null;
            });

            return {
                rowCombo: combo,
                yearData,
            };
        });

        // List of labels that should not be grouped (same as table component)
        const noGroupLabels = [
            'Бүс', 'Region',
            'Аймаг', 'Aimag',
            'Аймаг, сум', 'Aimag, soum',
            'Баг, хороо', 'Bag, khoroo',
            'Аймгийн код', 'Aimag code',
            'Засаг захиргааны нэгж', 'Administrator unit', 'Administrative unit'
        ];

        // Determine if the first dimension's label matches any of the no-group labels
        const shouldNotGroup = rowDimensions.length > 0 &&
            rowDimensions[0].length > 0 &&
            noGroupLabels.includes(rowDimensions[0][0].dimensionLabel);

        let groupedRows;
        if (shouldNotGroup) {
            // Do not group: each row is its own group
            groupedRows = rows.reduce((acc, row, idx) => {
                acc[`row-${idx}`] = [row];
                return acc;
            }, {});
        } else {
            // Group rows by the first dimension as before
            groupedRows = rows.reduce((acc, row) => {
                const firstDimCode = row.rowCombo[0].code;
                if (!acc[firstDimCode]) {
                    acc[firstDimCode] = [];
                }
                acc[firstDimCode].push(row);
                return acc;
            }, {});
        }

        // List of labels that should have a code column after them
        const showCodeLabels = [
            'Бүс', 'Region',
            'Аймаг', 'Aimag',
            'Аймаг, сум', 'Aimag, soum',
            'Баг, хороо', 'Bag, khoroo',
            'Аймгийн код', 'Aimag code',
            'Засаг захиргааны нэгж', 'Administrator unit', 'Administrative unit'
        ];

        // Build exportLabels: only include the main labels (codes will be combined)
        // const exportLabels = [];
        // validRowKeys.forEach(({ label }) => {
        //     exportLabels.push(label);
        // });
        const exportLabels = [];
        validRowKeys.forEach(({ label }) => {
            exportLabels.push(label);
            if (showCodeLabels.includes(label)) {
                exportLabels.push('Код');
            }
        });

        // Get codes for each dimension
        const allCodes = validRowKeys.map(({ key }) => {
            const labelObj = pxData.dimension[key].category.label;
            const indexObj = pxData.dimension[key].category.index;
            return Object.entries(labelObj)
                .map(([code, label]) => ({ code, label, idx: indexObj[code] }))
                .sort((a, b) => a.idx - b.idx)
                .map(item => item.code);
        });

        // Build the table data
        const table = [];

        // Add header row - include the main dimension labels, code columns, and years
        const headerRow = [];
        validRowKeys.forEach(({ label }) => {
            headerRow.push(label);
            if (showCodeLabels.includes(label)) {
                headerRow.push('Код');
            }
        });
        years.forEach(({ label }) => {
            headerRow.push(label);
        });
        table.push(headerRow);

        // Add data rows
        Object.entries(groupedRows).forEach(([groupCode, groupRows]) => {
            groupRows.forEach((row, rowIndex) => {
                const dataRow = [];

                // Add dimension values and codes - ensure we add exactly one value per dimension
                validRowKeys.forEach(({ label }, index) => {
                    if (index < row.rowCombo.length) {
                        const combo = row.rowCombo[index];
                        dataRow.push(combo.label);
                        if (showCodeLabels.includes(label)) {
                            // Add separate code column
                            dataRow.push(combo.code);
                        }
                    } else {
                        // Fill empty cells for missing dimensions
                        dataRow.push('');
                        if (showCodeLabels.includes(label)) {
                            dataRow.push('');
                        }
                    }
                });

                // Add year values
                row.yearData.forEach((val) => {
                    dataRow.push(val != null ? val : '');
                });

                table.push(dataRow);
            });
        });

        const ws = XLSX.utils.aoa_to_sheet(table);

        // Set column widths and styles for better readability
        const colWidths = table[0].map((_, index) => ({ wch: 15 }));
        ws['!cols'] = colWidths;

        // Add header style
        const headerStyle = {
            font: { bold: true },
            alignment: { horizontal: 'center' },
            fill: { fgColor: { rgb: "F2F2F2" } }
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

        const wb = XLSX.utils.book_new();
        const sheetName = filename
            .replace(/[:\\/?*[\]]/g, '')
            .slice(0, 31);
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
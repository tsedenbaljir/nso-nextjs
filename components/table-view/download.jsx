import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportPXWebToExcel(pxData, format = 'xlsx', filename = 'pxweb_data') {
    const dimensions = pxData.dimension;
    const dimensionIds = pxData.id;
    const labels = dimensionIds.map((id) => dimensions[id].label);
    const categoryLabels = dimensionIds.map((id) =>
        Object.values(dimensions[id].category.label)
    );

    const allCombinations = cartesian(...categoryLabels);
    const values = pxData.value;

    // Identify the year dimension based on its label 'Он'
    const yearDimensionLabel = 'Он';
    const yearDimensionIndex = labels.findIndex(label => label === yearDimensionLabel);

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

        // Construct the new table for XLSX.utils.aoa_to_sheet
        const newTable = [];

        // Add header row (stub labels + sorted years)
        newTable.push([...stubLabels, ...years]);

        // Add data rows
        Object.values(pivotedData).forEach(rowData => {
            const row = [...rowData._stubValues]; // Start with stub values
            years.forEach(year => row.push(rowData[year] || '')); // Add year values, fill missing with empty string
            newTable.push(row);
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

    if (format === 'csv') {
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${filename}_${timestamp}.csv`);
    } else {
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
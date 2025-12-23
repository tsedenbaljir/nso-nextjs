import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

// Helper function to convert HTML to plain text and format for Excel (2 columns: Field | Value)
function htmlToExcelData(htmlContent) {
    if (!htmlContent) return [];
    
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const rows = [];
    
    // First, try to find the specific structure used in metadata: .row with .cell2 (field) and .cell3 (value)
    const metadataRows = tempDiv.querySelectorAll('.row, [class*="row"]');
    if (metadataRows.length > 0) {
        metadataRows.forEach(row => {
            // Look for cell2 (field label) and cell3 (value)
            const cell2 = row.querySelector('.cell2, [class*="cell2"]');
            const cell3 = row.querySelector('.cell3, [class*="cell3"]');
            
            if (cell2 && cell3) {
                const field = cell2.textContent.trim();
                // Check for links in cell3
                const link = cell3.querySelector('a');
                let value = cell3.textContent.trim();
                
                // If there's a link, extract the href and preserve the text
                let linkUrl = null;
                if (link && link.href) {
                    linkUrl = link.href;
                    // Keep the original text value, we'll add hyperlink in Excel
                    // The value already contains the link text from textContent
                }
                
                if (field || value) {
                    rows.push([field, value, linkUrl]); // Store link separately for Excel hyperlink
                }
            } else {
                // Try to find any two cells in the row
                const cells = row.querySelectorAll('.cell, [class*="cell"], td, div');
                if (cells.length >= 2) {
                    const field = cells[0].textContent.trim();
                    const value = cells[1].textContent.trim();
                    if (field || value) {
                        rows.push([field, value]);
                    }
                } else if (cells.length === 1) {
                    const text = cells[0].textContent.trim();
                    if (text && !text.includes('Мета мэдээлэл')) {
                        // Skip if it's just a title/header
                        rows.push([text, '']);
                    }
                }
            }
        });
    }
    
    // Try to find table structure (standard HTML tables)
    if (rows.length === 0) {
        const tables = tempDiv.querySelectorAll('table');
        if (tables.length > 0) {
            tables.forEach(table => {
                const tableRows = table.querySelectorAll('tr');
                tableRows.forEach(tr => {
                    const cells = tr.querySelectorAll('td, th');
                if (cells.length >= 2) {
                    // If table has 2+ columns, use first as field, second as value
                    const field = cells[0].textContent.trim();
                    const cell2 = cells[1];
                    // Check for links in the value cell
                    const link = cell2.querySelector('a');
                    let value = cell2.textContent.trim();
                    
                    // If there's a link, extract the href (keep original text)
                    const linkUrl = link && link.href ? link.href : null;
                    
                    if (field || value) {
                        rows.push([field, value, linkUrl]);
                    }
                    } else if (cells.length === 1) {
                        // Single cell - might be a header
                        const text = cells[0].textContent.trim();
                        if (text && !text.includes('Мета мэдээлэл')) {
                            rows.push([text, '']);
                        }
                    }
                });
            });
        }
    }
    
    // Try definition lists (dl, dt, dd)
    if (rows.length === 0) {
        const dlElements = tempDiv.querySelectorAll('dl');
        if (dlElements.length > 0) {
            dlElements.forEach(dl => {
                const dts = dl.querySelectorAll('dt');
                const dds = dl.querySelectorAll('dd');
                const maxLen = Math.max(dts.length, dds.length);
                for (let i = 0; i < maxLen; i++) {
                    const field = dts[i] ? dts[i].textContent.trim() : '';
                    const dd = dds[i];
                    let value = dd ? dd.textContent.trim() : '';
                    // Check for links in dd
                    const link = dd ? dd.querySelector('a') : null;
                    
                    // If there's a link, extract the href (keep original text)
                    const linkUrl = link && link.href ? link.href : null;
                    
                    if (field || value) {
                        rows.push([field, value, linkUrl]);
                    }
                }
            });
        }
    }
    
    // Try div-based structures with labels and values
    if (rows.length === 0) {
        const divs = tempDiv.querySelectorAll('div');
        divs.forEach(div => {
            // Look for divs with class or structure that suggests field-value pairs
            const label = div.querySelector('label, strong, b, .label, .field');
            const value = div.querySelector('span, .value, .content');
            
            if (label && value) {
                rows.push([label.textContent.trim(), value.textContent.trim()]);
            } else if (div.textContent.trim()) {
                // If div has text but no clear structure, try to split by colon or other separators
                const text = div.textContent.trim();
                const colonIndex = text.indexOf(':');
                if (colonIndex > 0 && colonIndex < text.length - 1) {
                    const field = text.substring(0, colonIndex).trim();
                    const value = text.substring(colonIndex + 1).trim();
                    if (field && value) {
                        rows.push([field, value]);
                    }
                }
            }
        });
    }
    
    // Fallback: try to parse by splitting text with common separators
    if (rows.length === 0) {
        const text = tempDiv.textContent.trim();
        if (text) {
            // Split by newlines and try to identify field-value pairs
            const lines = text.split('\n').map(line => line.trim()).filter(line => line);
            lines.forEach(line => {
                // Try to split by colon, dash, or other separators
                const separators = [':', ' - ', ' — ', ' | '];
                let found = false;
                for (const sep of separators) {
                    const index = line.indexOf(sep);
                    if (index > 0 && index < line.length - 1) {
                        const field = line.substring(0, index).trim();
                        const value = line.substring(index + sep.length).trim();
                        if (field && value) {
                            rows.push([field, value]);
                            found = true;
                            break;
                        }
                    }
                }
                if (!found && line && !line.includes('Мета мэдээлэл')) {
                    // If no separator found, put entire line in first column
                    rows.push([line, '']);
                }
            });
        }
    }
    
    // Filter out empty rows and duplicate headers, and process links
    const filteredRows = rows.map((row, index) => {
        // If row has 3 elements, the third is the link URL
        if (row.length === 3 && row[2]) {
            return [row[0], row[1], row[2]]; // Keep link as third element
        }
        return [row[0], row[1], null]; // No link
    }).filter((row, index) => {
        // Skip if both cells are empty
        if (!row[0] && !row[1]) return false;
        // Skip duplicate "Мета мэдээлэл" entries
        if (row[0] === 'Мета мэдээлэл' && index > 0) return false;
        return true;
    });
    
    // If still no rows, return a message
    if (filteredRows.length === 0) {
        return [['Талбар', 'Утга', null], ['Мета мэдээлэл', 'No metadata available', null]];
    }
    
    // Add header row if not already present
    if (filteredRows.length > 0 && (filteredRows[0][0] !== 'Талбар' && filteredRows[0][0] !== 'Field')) {
        filteredRows.unshift(['Талбар', 'Утга', null]); // Field | Value in Mongolian
    }
    
    return filteredRows;
}

export async function exportPXWebToExcel(pxData, format = 'xlsx', filename = 'pxweb_data', metadataUrl = null) {
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

            // Build worksheet with a title row (filename) at the top
            const dataWs = XLSX.utils.json_to_sheet(table);
            const dataRange = XLSX.utils.decode_range(dataWs['!ref']);
            const columnCount = dataRange.e.c - dataRange.s.c + 1;

            const ws = XLSX.utils.aoa_to_sheet([[filename]]);
            ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } }];
            XLSX.utils.sheet_add_json(ws, table, { origin: 'A2' });

            // Column widths
            ws['!cols'] = new Array(columnCount).fill({ wch: 15 });

            const wb = XLSX.utils.book_new();
            const sheetName = filename
                .replace(/[:\\/?*[\]]/g, '')
                .slice(0, 31);
            XLSX.utils.book_append_sheet(wb, ws, sheetName);

            // Add metadata to sheet 2 if metadataUrl is provided
            if (metadataUrl && format === 'xlsx') {
                try {
                    const metadataData = htmlToExcelData(metadataUrl);
                    if (metadataData.length > 0) {
                        // Create data array with only 2 columns (field, value) for the sheet
                        const sheetData = metadataData.map(row => [row[0], row[1]]);
                        const metadataWs = XLSX.utils.aoa_to_sheet(sheetData);
                        metadataWs['!cols'] = [{ wch: 30 }, { wch: 60 }]; // Set column widths
                        
                        // Add borders, hyperlinks, and blue color styling
                        const range = XLSX.utils.decode_range(metadataWs['!ref']);
                        const borderStyle = {
                            style: 'thin',
                            color: { rgb: "000000" }
                        };
                        
                        for (let R = range.s.r; R <= range.e.r; ++R) {
                            for (let C = range.s.c; C <= range.e.c; ++C) {
                                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                                if (!metadataWs[cellRef]) metadataWs[cellRef] = { v: '' };
                                if (!metadataWs[cellRef].s) metadataWs[cellRef].s = {};
                                if (!metadataWs[cellRef].s.border) {
                                    metadataWs[cellRef].s.border = {
                                        top: borderStyle,
                                        bottom: borderStyle,
                                        left: borderStyle,
                                        right: borderStyle
                                    };
                                }
                                
                                // Add hyperlink and blue color if this is column B (value column) and there's a link
                                if (C === 1 && metadataData[R] && metadataData[R][2]) {
                                    const linkUrl = metadataData[R][2];
                                    metadataWs[cellRef].l = { Target: linkUrl, Tooltip: linkUrl };
                                    // Initialize font object if it doesn't exist
                                    if (!metadataWs[cellRef].s.font) {
                                        metadataWs[cellRef].s.font = {};
                                    }
                                    metadataWs[cellRef].s.font.color = { rgb: "0000FF" };
                                    metadataWs[cellRef].s.font.underline = true;
                                }
                                
                                // Also make "Мета мэдээллийн дэлгэрэнгүйг энд дарж үзнэ үү" text blue
                                if (C === 1 && metadataWs[cellRef].v) {
                                    const cellValue = String(metadataWs[cellRef].v);
                                    if (cellValue.includes('Мета мэдээллийн дэлгэрэнгүйг энд дарж үзнэ үү') || 
                                        cellValue.includes('Мета мэдээллийн дэлгэрэнгүйг')) {
                                        // Initialize font object if it doesn't exist
                                        if (!metadataWs[cellRef].s.font) {
                                            metadataWs[cellRef].s.font = {};
                                        }
                                        // Set blue color - ensure proper structure
                                        metadataWs[cellRef].s.font.color = { rgb: "0000FF" };
                                        metadataWs[cellRef].s.font.underline = true;
                                        // Also add hyperlink if available
                                        if (metadataData[R] && metadataData[R][2]) {
                                            metadataWs[cellRef].l = { Target: metadataData[R][2], Tooltip: metadataData[R][2] };
                                        }
                                    }
                                }
                            }
                        }
                        
                        XLSX.utils.book_append_sheet(wb, metadataWs, 'Metadata');
                    }
                } catch (error) {
                    console.error('Error adding metadata to Excel:', error);
                }
            }

            const now = new Date();
            const timestamp = now
                .toISOString()
                .slice(0, 16)
                .replace('T', '_')
                .replace(':', '');

            // Title style
            if (ws['A1']) {
                ws['A1'].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };
            }

            // Header style (row 2 since row 1 is the title)
            const headerStyle = {
                font: { bold: true },
                alignment: { horizontal: 'center' },
                fill: { fgColor: { rgb: "F2F2F2" } }
            };
            for (let C = 0; C < columnCount; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: 1, c: C });
                if (!ws[cellRef]) ws[cellRef] = { v: '' };
                ws[cellRef].s = headerStyle;
            }

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

        // Add title row (filename) as the first row
        const columnCount = table[0].length;
        table.unshift([filename, ...Array(columnCount - 1).fill('')]);
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

        // Merge title row across all columns and style it
        ws['!merges'] = (ws['!merges'] || []).concat([{ s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } }]);
        if (ws['A1']) {
            ws['A1'].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };
        }

        // Apply header style to second row (index 1) since first row is title
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ r: 1, c: C });
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

        // Add metadata to sheet 2 if metadataUrl is provided
        if (metadataUrl && format === 'xlsx') {
            try {
                const metadataData = htmlToExcelData(metadataUrl);
                if (metadataData.length > 0) {
                    // Create data array with only 2 columns (field, value) for the sheet
                    const sheetData = metadataData.map(row => [row[0], row[1]]);
                    const metadataWs = XLSX.utils.aoa_to_sheet(sheetData);
                    // Set column widths: Field column (30) and Value column (60)
                    metadataWs['!cols'] = [{ wch: 30 }, { wch: 60 }];
                    
                    // Style the header row (first row)
                    const headerStyle = {
                        font: { bold: true },
                        alignment: { horizontal: 'center' },
                        fill: { fgColor: { rgb: "E6F2FF" } } // Light blue background
                    };
                    
                    // Apply header style to first row
                    if (metadataWs['A1']) {
                        metadataWs['A1'].s = headerStyle;
                    }
                    if (metadataWs['B1']) {
                        metadataWs['B1'].s = headerStyle;
                    }
                    
                    // Add borders and hyperlinks to all cells
                    const range = XLSX.utils.decode_range(metadataWs['!ref']);
                    const borderStyle = {
                        style: 'thin',
                        color: { rgb: "000000" }
                    };
                    
                    for (let R = range.s.r; R <= range.e.r; ++R) {
                        for (let C = range.s.c; C <= range.e.c; ++C) {
                            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                            if (!metadataWs[cellRef]) metadataWs[cellRef] = { v: '' };
                            if (!metadataWs[cellRef].s) metadataWs[cellRef].s = {};
                            if (!metadataWs[cellRef].s.border) {
                                metadataWs[cellRef].s.border = {
                                    top: borderStyle,
                                    bottom: borderStyle,
                                    left: borderStyle,
                                    right: borderStyle
                                };
                            }
                            
                            // Style cells in column B (value column)
                            if (C === 1) {
                                const cellValue = metadataWs[cellRef].v ? String(metadataWs[cellRef].v) : '';
                                const hasLink = metadataData[R] && metadataData[R][2];
                                const hasMetadataText = cellValue.includes('Мета мэдээллийн дэлгэрэнгүйг энд дарж үзнэ үү') || 
                                                      cellValue.includes('Мета мэдээллийн дэлгэрэнгүйг');
                                
                                // Initialize font object
                                if (!metadataWs[cellRef].s.font) {
                                    metadataWs[cellRef].s.font = {};
                                }
                                
                                // Add hyperlink if available
                                if (hasLink) {
                                    const linkUrl = metadataData[R][2];
                                    metadataWs[cellRef].l = { Target: linkUrl, Tooltip: linkUrl };
                                    // Set blue color and underline for links
                                    metadataWs[cellRef].s.font.color = { rgb: "0000FF" };
                                    metadataWs[cellRef].s.font.underline = true;
                                }
                                
                                // Make metadata text blue (with or without link)
                                if (hasMetadataText) {
                                    // Set blue color and underline
                                    metadataWs[cellRef].s.font.color = { rgb: "0000FF" };
                                    metadataWs[cellRef].s.font.underline = true;
                                    // Add hyperlink if available, otherwise add placeholder to ensure it's clickable
                                    if (!hasLink) {
                                        metadataWs[cellRef].l = { Target: '#', Tooltip: cellValue };
                                    }
                                }
                            }
                        }
                    }
                    
                    XLSX.utils.book_append_sheet(wb, metadataWs, 'Metadata');
                }
            } catch (error) {
                console.error('Error adding metadata to Excel:', error);
            }
        }

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
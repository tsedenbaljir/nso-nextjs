export const handlePrint = (title) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Ensure ResultTable has a class 'result-table'
    const tableContent = document.querySelector('.result-table')?.outerHTML;
    if (!tableContent) return;

    printWindow.document.write(`
        <html>
            <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                h2 { text-align: center; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 10pt; }
                th { background-color: #f2f2f2; }
                @media print {
                body { margin: 0; padding: 15px; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead { display: table-header-group; }
                tfoot { display: table-footer-group; }
                }
            </style>
            </head>
            <body>
            <h6>эх сурвалж: www.data.1212.mn</h6>
            <h2>${title}</h2>
            ${tableContent}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
};
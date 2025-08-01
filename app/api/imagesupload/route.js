import { NextResponse } from 'next/server';
import { db } from '@/app/api/config/db_csweb.config';
import fetch from 'node-fetch';
import https from 'https';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const MAX_BATCH_RETRIES = 2; // Number of times to retry the entire batch of failed files

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function uploadWithRetry(url, options, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Retry ${i + 1}/${retries} for ${url} after error: ${error.message}`);
            await sleep(RETRY_DELAY * (i + 1)); // Exponential backoff
        }
    }
}

async function processUploads(items, httpsAgent, myHeaders) {
    console.log("items=======>", items);

    const uploadPromises = items.map(async (item) => {
        const raw = JSON.stringify({
            "url": "https://downloads.1212.mn/" + item.pathName
        });

        try {
            const result = await uploadWithRetry("https://beta.nso.mn/api/downloads", {
                method: "POST",
                headers: myHeaders,
                body: raw,
                agent: httpsAgent
            });

            console.log(`Success for ${item.pathName}:`, result);
            return {
                pathName: item.pathName,
                size: item.size,
                status: 'success',
                result: JSON.parse(result)
            };
        } catch (error) {
            console.error(`Failed to upload ${item.pathName}:`, error.message);
            return {
                pathName: item.pathName,
                size: item.size,
                status: 'error',
                error: error.message
            };
        }
    });

    return await Promise.all(uploadPromises);
}

export async function GET(req) {
    const myHeaders = {
        "Content-Type": "application/json"
    };

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        timeout: 10000 // 10s
    });

    // SELECT JSON_VALUE(CAST(file_info AS NVARCHAR(MAX)), '$.pathName') AS pathName,
    // JSON_VALUE(CAST(file_info AS NVARCHAR(MAX)), '$.fileSize') AS size
    // FROM [NSOweb].[dbo].[web_1212_download]
    // WHERE ISJSON(CAST(file_info AS NVARCHAR(MAX))) = 1
    // AND JSON_VALUE(CAST(file_info AS NVARCHAR(MAX)), '$.pathName') IN (
    //   'DgCOdhnQ-_IBlXOPXvgFzRKTUFQyXNentRi1nNHo.pdf',
    //   '6_iI5b84oy_-BhWSN_PyAU2_9-wi2Ek4lzMQvW-U.pdf',
    //   'SlarpLuZ_sSErRErZLR-ZWi--1Is9JQ6C_WqXBHA.pptx'
    // )
    // //////////////////////
    
    // WITH UrlExtract AS (
    //     -- Initial row for each record
    //     SELECT 
    //         [id],
    //         [name],
    //         [slug],
    //         [language],
    //         [body],
    //         PATINDEX('%<img src="https://gateway.1212.mn/%', [body]) AS start_pos,
    //         CASE 
    //             WHEN PATINDEX('%<img src="https://gateway.1212.mn/%', [body]) > 0
    //             THEN SUBSTRING(
    //                 [body],
    //                 PATINDEX('%<img src="https://gateway.1212.mn/%', [body]) + 10, -- Start after '<img src="'
    //                 CHARINDEX('"', [body], PATINDEX('%<img src="https://gateway.1212.mn/%', [body]) + 10) - 
    //                 PATINDEX('%<img src="https://gateway.1212.mn/%', [body]) - 10
    //             )
    //             ELSE NULL
    //         END AS url,
    //         CASE 
    //             WHEN PATINDEX('%<img src="https://gateway.1212.mn/%', [body]) > 0
    //             THEN SUBSTRING(
    //                 [body],
    //                 PATINDEX('%<img src="https://gateway.1212.mn/%', [body]) + 10,
    //                 LEN([body])
    //             )
    //             ELSE ''
    //         END AS remaining_body
    //     FROM [NSOweb].[dbo].[web_1212_content]
    //     WHERE [body] LIKE '%<img src="https://gateway.1212.mn/%' and  created_date > '2025-03-28'

    //     UNION ALL

    //     -- Recursive part to find subsequent URLs
    //     SELECT 
    //         [id],
    //         [name],
    //         [slug],
    //         [language],
    //         [body],
    //         PATINDEX('%<img src="https://gateway.1212.mn/%', remaining_body) AS start_pos,
    //         CASE 
    //             WHEN PATINDEX('%<img src="https://gateway.1212.mn/%', remaining_body) > 0
    //             THEN SUBSTRING(
    //                 remaining_body,
    //                 PATINDEX('%<img src="https://gateway.1212.mn/%', remaining_body) + 10,
    //                 CHARINDEX('"', remaining_body, PATINDEX('%<img src="https://gateway.1212.mn/%', remaining_body) + 10) - 
    //                 PATINDEX('%<img src="https://gateway.1212.mn/%', remaining_body) - 10
    //             )
    //             ELSE NULL
    //         END AS url,
    //         CASE 
    //             WHEN PATINDEX('%<img src="https://gateway.1212.mn/%', remaining_body) > 0
    //             THEN SUBSTRING(
    //                 remaining_body,
    //                 PATINDEX('%<img src="https://gateway.1212.mn/%', remaining_body) + 10,
    //                 LEN(remaining_body)
    //             )
    //             ELSE ''
    //         END AS remaining_body
    //     FROM UrlExtract
    //     WHERE PATINDEX('%<img src="https://gateway.1212.mn/%', remaining_body) > 0
    // )

    // SELECT REVERSE(SUBSTRING(REVERSE(url), 1, CHARINDEX('/', REVERSE(url)) - 1)) AS pathName,
    // 1 as size
    // FROM UrlExtract
    // WHERE url IS NOT NULL
    // ORDER BY [id], url;
    try {
        const results = await db.raw(`
    `);

        let uploadResults = await processUploads(results, httpsAgent, myHeaders);
        let failedFiles = uploadResults.filter(r => r.status === 'error');
        let batchRetryCount = 0;

        // Retry failed files in batches
        while (failedFiles.length > 0 && batchRetryCount < MAX_BATCH_RETRIES) {
            console.log(`Retrying batch ${batchRetryCount + 1} with ${failedFiles.length} failed files`);
            await sleep(RETRY_DELAY * 2); // Wait before retrying the batch

            const retryResults = await processUploads(
                failedFiles.map(f => ({ pathName: f.pathName, size: f.size })),
                httpsAgent,
                myHeaders
            );

            // Update the results with successful retries
            uploadResults = uploadResults.map(original => {
                const retry = retryResults.find(r => r.pathName === original.pathName);
                return retry && retry.status === 'success' ? retry : original;
            });

            failedFiles = uploadResults.filter(r => r.status === 'error');
            batchRetryCount++;
        }

        const successCount = uploadResults.filter(r => r.status === 'success').length;
        const errorCount = uploadResults.filter(r => r.status === 'error').length;

        return NextResponse.json({
            status: true,
            data: {
                total: uploadResults.length,
                success: successCount,
                errors: errorCount,
                details: uploadResults,
                batchRetries: batchRetryCount
            },
            message: `Processed ${uploadResults.length} files (${successCount} successful, ${errorCount} failed) after ${batchRetryCount} batch retries`
        });

    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({
            status: false,
            data: null,
            message: error.message || "Internal server error"
        }, { status: 500 });
    }
}

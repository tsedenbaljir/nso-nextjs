import { NextResponse } from "next/server";
import { Client } from "@elastic/elasticsearch";
import { db } from "../config/db_csweb.config";

const ELASTIC_URL = 'https://10.0.1.161:9200';
const INDEX_NAME = 'search-nso-1212';

export async function POST() {
  const client = new Client({
    node: ELASTIC_URL,
    auth: {
      apiKey: process.env.ELASTIC_SEARCH
    },
    tls: { rejectUnauthorized: false }
  });

  try {
    // Check if index exists before trying to delete
    const indexExists = await client.indices.exists({ index: INDEX_NAME });
    if (indexExists) {
      await client.indices.delete({ index: INDEX_NAME });
    }

    // Create index with proper mappings
    await client.indices.create({
      index: INDEX_NAME,
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'text', analyzer: 'thai' },
            body: { type: 'text', analyzer: 'thai' },
            file_info: { type: 'text', analyzer: 'thai' },
            _type: { type: 'keyword' }
          }
        }
      }
    });

    // Fetch data from database
    const [web_1212_content, web_1212_download] = await Promise.all([
      db.raw(`SELECT * from web_1212_content`),
      db.raw(`SELECT * from web_1212_download`)
    ]);

    const allData = [
      ...web_1212_content.map((data) => ({ ...data, _type: 'content' })),
      ...web_1212_download.map((data) => ({ ...data, _type: 'download' }))
    ];

    // Bulk index with progress tracking
    const chunkSize = 1000;
    const operations = [];
    
    for (const doc of allData) {
      operations.push({
        index: { _index: INDEX_NAME }
      });
      operations.push(doc);
    }

    const { items } = await client.bulk({
      refresh: true,
      operations
    });

    const failed = items.filter(item => item.index.error);

    return NextResponse.json({
      success: true,
      indexed: items.length - failed.length,
      failed: failed.length,
      errors: failed.map(item => item.index.error)
    });

  } catch (error) {
    console.error('Indexing error:', error);
    return NextResponse.json(
      { error: 'Failed to index documents', details: error.message },
      { status: 500 }
    );
  }
}

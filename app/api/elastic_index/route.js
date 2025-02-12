import { NextResponse } from "next/server";
import { Client } from "@elastic/elasticsearch";
import { db } from "../config/db_csweb.config";

const ELASTIC_URL = "https://10.0.1.161:9200";
const INDEX_NAME = "search-nso-1212";

export async function POST() {
  const client = new Client({
    node: ELASTIC_URL,
    auth: {
      apiKey: process.env.ELASTIC_SEARCH,
    },
    tls: { rejectUnauthorized: false },
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
            id: { type: "keyword" },
            name: { type: "text", analyzer: "thai" },
            body: { type: "text", analyzer: "thai" },
            file_info: { type: "text", analyzer: "thai" },
            _type: { type: "keyword" },
          },
        },
      },
    });

    // Fetch data from database
    const [web_1212_content, web_1212_tender, web_1212_download, web_1212_laws, web_1212_glossary] = await Promise.all([
      db.raw(
        `SELECT * from web_1212_content where content_type = 'NSONEWS' and published = 1 and news_type in('LATEST','MEDIA')`
      ),
      db.raw(
        `SELECT * from web_1212_content where content_type = 'NEWS' and published = 1 and news_type in('TENDER')`
      ),
      db.raw(
        `SELECT * from web_1212_content where content_type = 'NEWS' and published = 1 and news_type in('LATEST','FUTURE')`
      ),
      db.raw(
        `SELECT * from web_1212_download where file_type in('Command','Law','Legal','Docs_s') and published = 1`
      ),
      db.raw(`SELECT * from web_1212_glossary where published = 1`),
    ]);

    const allData = [
      ...web_1212_content.map((data) => ({ ...data, _type: "content" })),
      ...web_1212_tender.map((data) => ({ ...data, _type: "tender" })),
      ...web_1212_download.map((data) => ({ ...data, _type: "download" })),
      ...web_1212_laws.map((data) => ({ ...data, _type: "laws" })),
      ...web_1212_glossary.map((data) => ({ ...data, _type: "glossary" })),
    ];

    // 🔽 Fetch data from external API using absolute URL 🔽
    const apiResponse = await fetch(`https://nso1212.app.nso.mn/api/tablename`);
    const { response: apiData } = await apiResponse.json();

    if (!Array.isArray(apiData)) {
      console.error("Unexpected API response format:", apiData);
      return NextResponse.json({ error: "Invalid API response format." }, { status: 500 });
    }

    // Append API data to Elasticsearch data
    const formattedApiData = apiData.map((item) => ({
      id: item.id,
      name: item.name,
      link: item.link,
      date: item.date,
      category: item.category,
      sector: item.sector,
      _type: "tablename",
    }));

    allData.push(...formattedApiData);

    // 🔄 Bulk index with progress tracking
    const operations = [];

    for (const doc of allData) {
      operations.push({
        index: { _index: INDEX_NAME },
      });
      operations.push(doc); // ✅ Push API & DB data together
    }

    // Perform bulk indexing
    const { items } = await client.bulk({
      refresh: true,
      operations,
    });

    const failed = items.filter((item) => item.index.error);

    return NextResponse.json({
      success: true,
      indexed: items.length - failed.length,
      failed: failed.length,
      errors: failed.map((item) => item.index.error),
    });
  } catch (error) {
    console.error("Indexing error:", error);
    return NextResponse.json({ error: "Failed to index documents", details: error.message }, { status: 500 });
  }
}

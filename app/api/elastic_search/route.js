import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';
import https from 'https';

const customHttpsAgent = new https.Agent({ rejectUnauthorized: false });
const ELASTIC_URL = 'https://10.0.1.161:9200';

export async function POST(req) {
  try {
    const body = await req.json();
    const { values } = body;

    if (!values) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const searchQuery = {
      "_source": ["_type", "id", "name", "body", "file_info", "source", "info", "slug"],
      "query": {
        "multi_match": {
          "query": values,
          "fields": ["id^2", "name^3", "body", "file_info", "source", "info", "slug"],
          "type": "best_fields",
          "fuzziness": "AUTO"
        }
      },
      "sort": [
        { "_score": { "order": "desc" } }
      ],
      "size": 100,
      "highlight": {
        "pre_tags": ["<span style='background: #ffe700;border-radius: 4px;padding-inline: 4px;'>"],
        "post_tags": ["</span>"],
        "fields": {
          "id": {},
          "name": {},
          "body": { "fragment_size": 150, "number_of_fragments": 3 },
          "file_info": {}
        }
      }
    };

    const config = {
      method: 'post',
      url: `${ELASTIC_URL}/search-nso-1212/_search`,
      httpsAgent: customHttpsAgent,
      headers: {
        'Authorization': 'ApiKey ' + process.env.ELASTIC_SEARCH,
        'Content-Type': 'application/json'
      },
      data: searchQuery
    };

    const response = await axios.request(config);
    return NextResponse.json({ response: JSON.stringify(response.data) });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: error.response?.status || 500 }
    );
  }
}

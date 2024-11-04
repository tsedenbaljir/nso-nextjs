import { NextRequest, NextResponse } from "next/server";
import axios from 'axios'
import https from 'https'
const customHttpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function POST(req) {
  const body = await req.json();
  const { values } = body;
  let data = JSON.stringify({
    "_source": ["_type", "db_name", "db_id", "form_name", "form_id", "tbl_name", "tbl_id", "classification_name", "id", "indicator_name", "indicator_id"],
    "query": {
      "query_string": {
        "query": `*${values}*`,
        "fields": ["form_name", "db_name", "tbl_name", "classification_name", "indicator_name"]
      }
    },
    "sort": [
      {
        "_score": { "order": "desc" }
      }
    ],
    "size": 100,
    "highlight": {
      "pre_tags": ["<span style='background: #ffe700;border-radius: 4px;padding-inline: 4px;'>"],
      "post_tags": ["</span>"],
      "fields": {
        "db_name": {},
        "db_id": {},
        "form_name": {},
        "form_id": {},
        "tbl_id": {},
        "tbl_name": {},
        "classification_name": {},
        "id": {},
        "indicator_name": {},
        "indicator_id": {}
      }
    }
  });

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://10.0.1.161:9200/search-nso-1212/_search',
    httpsAgent: customHttpsAgent,
    headers: {
      'Authorization': 'ApiKey ' + process.env.ELASTIC_SEARCH,
      'Content-Type': 'application/json'
    },
    data: data
  };

  const dt = await axios.request(config)
    .then((response) => {
      return JSON.stringify(response.data);
    })
    .catch((error) => {
      console.log(error);
    });

  return NextResponse.json({ response: dt });
}

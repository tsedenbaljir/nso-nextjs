import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';
import https from 'https';

const customHttpsAgent = new https.Agent({ rejectUnauthorized: false });
const ELASTIC_URL = 'https://45.117.34.245:9200';

// Монгол хэлний түгээмэл нөхцөл дагаврууд (уртаас нь эхэлж шалгана)
const MN_SUFFIXES = [
  'уудын', 'үүдийн', 'уудыг', 'үүдийг', 'уудаас', 'үүдээс',
  'ууд', 'үүд',
  'аас', 'ээс', 'оос', 'өөс',
  'аар', 'ээр', 'оор', 'өөр',
  'тай', 'тэй', 'той',
  'ний', 'ийн', 'ийг',
  'ны', 'ын', 'ыг',
  'даа', 'дээ', 'доо', 'дөө',
];

// Үг бүрээс дагаврыг хуулж үндсийг гаргана (жишээ: "махны" -> "мах")
function stemMongolian(text) {
  return text
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase();
      for (const suffix of MN_SUFFIXES) {
        if (lower.endsWith(suffix) && lower.length - suffix.length >= 3) {
          return word.slice(0, word.length - suffix.length);
        }
      }
      return word;
    })
    .join(' ');
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { values } = body;

    if (!values) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const searchFields = ["id^2", "name^3", "namemn^3", "nameen^3", "body", "file_info", "source", "info", "slug", "sector", "category", "link"];
    const stemmedValues = stemMongolian(values);

    const shouldQueries = [
      {
        "multi_match": {
          "query": values,
          "fields": searchFields,
          "type": "best_fields",
          "fuzziness": "AUTO",
          "boost": 2
        }
      }
    ];

    // Дагавар хуулагдсан бол үндсээр нь давхар хайна ("махны" -> "мах")
    if (stemmedValues !== values) {
      shouldQueries.push({
        "multi_match": {
          "query": stemmedValues,
          "fields": searchFields,
          "type": "best_fields",
          "fuzziness": "AUTO"
        }
      });
    }

    const searchQuery = {
      "_source": ["_type", "id", "name", "namemn", "nameen", "body", "file_info", "source", "info", "slug", "sector", "category", "link"],
      "query": {
        "bool": {
          "should": shouldQueries,
          "minimum_should_match": 1
        }
      },
      "sort": [
        { "_score": { "order": "desc" } }
      ],
      "size": 70,
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

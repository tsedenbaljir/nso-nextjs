import { NextResponse } from "next/server";
import { Client } from '@elastic/elasticsearch'
import { prisma } from "@/utils/prisma";

export async function POST() {

  const client = new Client({
    node: 'https://10.0.1.161:9200',
    auth: {
      username: "elastic",
      password: "aZAHeeeiM0a828e+Jnfm"
    },
    tls: { rejectUnauthorized: false }
  });

  await client.indices.delete({ index: 'search-nso-1212' });

  const databases = await prisma.$queryRaw`SELECT db_id, db_name from database`;
  const forms = await prisma.$queryRaw`SELECT * from vw_formdatabase`;
  const table = await prisma.$queryRaw`SELECT * from vw_tableDB`;
  const indicators = await prisma.$queryRaw`SELECT * from vw_indicatorDBTab`;
  const classifications = await prisma.$queryRaw`SELECT * from vw_classificationdbs`;
  // console.log("databasesS", databasesS);

  const allData = [
    ...databases.map((data) => ({ ...data, _type: 'database' })),
    ...forms.map((data) => ({ ...data, _type: 'form' })),
    ...indicators.map((data) => ({ ...data, _type: 'indicator' })),
    ...table.map((data) => ({ ...data, _type: 'table' })),
    ...classifications.map((data) => ({ ...data, _type: 'classification' })),
  ];

  // Index with the bulk helper
  const result = await client.helpers.bulk({
    datasource: allData,
    pipeline: "ent-search-generic-ingestion",
    onDocument: (doc) => ({ index: { _index: 'search-nso-1212' } }),
  });

  return NextResponse.json({ response: result });
}

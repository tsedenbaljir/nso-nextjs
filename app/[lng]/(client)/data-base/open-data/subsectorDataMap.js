export const subsectorDataMap = {
  Subsector1: {
    title: "Статистик тоон мэдээллийг авах",
    titleEn: "Statistical Data",
    input: { id: "DT_NSO_0300_003V1.px" },
    api: "https://data.1212.mn/api/v1/mn/NSO/Population, household/1_Population, household/DT_NSO_0300_003V1.px",
    output: [
      { Field: "title", Type: "string", Description: "Хүснэгтийн гарчиг" },
      { Field: "variables", Type: "array", Description: "Үзүүлэлтүүдийн жагсаалт" },
      { Field: "code", Type: "string", Description: "Үзүүлэлтийн код" },
      { Field: "text", Type: "string", Description: "Үзүүлэлтийн нэр" },
      { Field: "values", Type: "array", Description: "Үзүүлэлтийн кодын утгууд" },
      { Field: "valueTexts", Type: "array", Description: "Үзүүлэлтийн утгуудын текст" }
    ],
    outputExample: {
      "title": "ХҮН АМЫН ТОО, хүйс, насны бүлэг, жилээр",
      "variables": [
        {
          "code": "Хүйс",
          "text": "Хүйс",
          "values": [
            "0",
            "1",
            "2"
          ],
          "valueTexts": [
            "Бүгд",
            "Эрэгтэй",
            "Эмэгтэй"
          ]
        },
        {
          "code": "Насны бүлэг",
          "text": "Насны бүлэг",
          "values": [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15"
          ],
          "valueTexts": [
            "Бүгд",
            "0-4",
            "5-9",
            "10-14",
            "15-19",
            "20-24",
            "25-29",
            "30-34",
            "35-39",
            "40-44",
            "45-49",
            "50-54",
            "55-59",
            "60-64",
            "65-69",
            "70+"
          ]
        },
        {
          "code": "Он",
          "text": "Он",
          "values": [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16",
            "17",
            "18",
            "19",
            "20",
            "21",
            "22",
            "23",
            "24",
            "25",
            "26",
            "27",
            "28",
            "29",
            "30",
            "31",
            "32",
            "33",
            "34",
            "35",
            "36",
            "37",
            "38",
            "39"
          ],
          "valueTexts": [
            "2024",
            "2023",
            "2022",
            "2021",
            "2020",
            "2019",
            "2018",
            "2017",
            "2016",
            "2015",
            "2014",
            "2013",
            "2012",
            "2011",
            "2010",
            "2009",
            "2008",
            "2007",
            "2006",
            "2005",
            "2004",
            "2003",
            "2002",
            "2001",
            "2000",
            "1999",
            "1998",
            "1997",
            "1996",
            "1995",
            "1994",
            "1993",
            "1992",
            "1991",
            "1990",
            "1989",
            "1979",
            "1969",
            "1963",
            "1956"
          ]
        }
      ]
    }
  },
  Subsector2: {
    title: "Дэд салбар доторх хүснэгтийн жагсаалтыг авах",
    titleEn: "Table",
    input: { id: "Disease" },
    api: "https://data.1212.mn/api/v1/mn/NSO/Population, household/1_Population, household/",
    output: [
      { Field: "id", Type: "string", Description: "Англи нэр" },
      { Field: "type", Type: "string", Description: "Төрлийн дугаар" },
      { Field: "text", Type: "string", Description: "Монгол нэр" },
      { Field: "updated", Type: "string", Description: "Сүүлийн шинэчлэлт хийсэн хугацаа" },
    ],
    outputExample: [
      {
        "id": "DT_NSO_0300_001V2.px",
        "type": "t",
        "text": "МОНГОЛ УЛСАД ОРШИН СУУГАА ХҮН АМЫН ТОО, хүйс, нэг нас, жилээр",
        "updated": "2025-09-16T17:08:44"
      },
      {
        "id": "DT_NSO_0300_001V3.px",
        "type": "t",
        "text": "ХҮН АМЫН ТОО, хүйс, нэг нас, жилээр",
        "updated": "2025-09-16T17:07:30"
      },
      {
        "id": "DT_NSO_0300_002V1.px",
        "type": "t",
        "text": "ЖИЛИЙН ДУНДАЖ ХҮН АМЫН ТОО, аймаг, нийслэл, жилээр",
        "updated": "2025-09-16T17:11:43"
      },
      {
        "id": "DT_NSO_0300_002V4.px",
        "type": "t",
        "text": "МОНГОЛ УЛСАД ОРШИН СУУГАА ЖИЛИЙН ДУНДАЖ ХҮН АМЫН ТОО, баг, хороо, жилээр",
        "updated": "2025-09-16T17:10:01"
      },
      {
        "id": "DT_NSO_0300_003V1.px",
        "type": "t",
        "text": "ХҮН АМЫН ТОО, хүйс, насны бүлэг, жилээр",
        "updated": "2025-09-16T17:07:54"
      },
      {
        "id": "DT_NSO_0300_004V1.px",
        "type": "t",
        "text": "ХҮН АМЫН ТОО, байршил, аймаг, нийслэл, жилээр",
        "updated": "2025-09-22T14:21:51"
      },
      {
        "id": "DT_NSO_0300_004V5.px",
        "type": "t",
        "text": "МОНГОЛ УЛСАД ОРШИН СУУГАА ХҮН АМЫН ТОО, байршил, баг, хороо, жилээр",
        "updated": "2025-09-16T17:09:14"
      },
      {
        "id": "DT_NSO_0300_006V1.px",
        "type": "t",
        "text": "ӨРХИЙН ТОО, байршил, аймаг, нийслэл, жилээр",
        "updated": "2025-09-16T17:12:32"
      },
      {
        "id": "DT_NSO_0300_006V2.px",
        "type": "t",
        "text": "ӨРХИЙН ТОО, сум, дүүрэг, жилээр",
        "updated": "2025-09-16T17:12:58"
      },
      {
        "id": "DT_NSO_0300_006V5.px",
        "type": "t",
        "text": "ӨРХИЙН ТОО, байршил, баг, хороо, жилээр",
        "updated": "2025-09-16T17:13:14"
      },
      {
        "id": "DT_NSO_0300_007V1.px",
        "type": "t",
        "text": "БҮТЭН ӨНЧИН ХҮҮХДИЙН ТОО, аймаг, нийслэл, жилээр",
        "updated": "2025-10-06T17:54:40"
      },
      {
        "id": "DT_NSO_0300_008V1.px",
        "type": "t",
        "text": "ЭЦЭГ, ЭХИЙН ХЭН НЭГЭНТЭЙ АМЬДАРЧ БАЙГАА ХҮҮХДИЙН ТОО, аймаг, нийслэл, жилээр",
        "updated": "2025-10-06T17:54:48"
      },
      {
        "id": "DT_NSO_0300_010V1.px",
        "type": "t",
        "text": "ӨРХ ТОЛГОЙЛСОН ЭХИЙН ТОО, өрхийн гишүүдийн тоо, аймаг, нийслэл, жилээр",
        "updated": "2025-10-06T17:54:57"
      },
      {
        "id": "DT_NSO_0300_011V3.px",
        "type": "t",
        "text": "18 ХҮРТЭЛХ НАСНЫ 4, ТҮҮНЭЭС ДЭЭШ ХҮҮХЭДТЭЙ ӨРХ, аймаг, нийслэл, жилээр",
        "updated": "2025-10-06T17:55:07"
      },
      {
        "id": "DT_NSO_0300_014V1.px",
        "type": "t",
        "text": "ӨРХ ҮҮСГЭН ГАНЦ БИЕЭР АМЬДАРДАГ ӨНДӨР НАСТАЙ ХҮНИЙ ТОО, хүйс, аймаг, нийслэл, жилээр",
        "updated": "2025-10-06T17:55:16"
      },
      {
        "id": "DT_NSO_0300_027V1.px",
        "type": "t",
        "text": "ХҮН АМЫН ТОО, байршил, хүйс, жилээр",
        "updated": "2025-09-16T17:08:12"
      },
      {
        "id": "DT_NSO_0300_033V1.px",
        "type": "t",
        "text": "ӨРХИЙН ТОО, аймаг, нийслэл, жилээр",
        "updated": "2025-09-16T17:12:19"
      },
      {
        "id": "DT_NSO_0300_034V1.px",
        "type": "t",
        "text": "ХҮН АМЫН НЯГТРАЛ, аймаг, нийслэл, жилээр",
        "updated": "2025-09-16T17:11:03"
      },
      {
        "id": "DT_NSO_0300_034V2.px",
        "type": "t",
        "text": "ХҮН АМЫН НЯГТРАЛ, сум, дүүрэг, жилээр",
        "updated": "2025-09-16T17:11:27"
      },
      {
        "id": "DT_NSO_0300_035V1.px",
        "type": "t",
        "text": "ХҮН АМ ЗҮЙН АЧААЛАЛ, аймаг, нийслэл, жилээр",
        "updated": "2025-09-16T17:10:25"
      },
      {
        "id": "DT_NSO_0300_035V2.px",
        "type": "t",
        "text": "ХҮН АМ ЗҮЙН АЧААЛАЛ, сум, дүүрэг, жилээр",
        "updated": "2025-09-16T17:10:45"
      },
      {
        "id": "DT_NSO_0300_040V1.px",
        "type": "t",
        "text": "ХҮН АМЫН ШИЛЖИХ ХӨДӨЛГӨӨН, аймаг, нийслэл, жилээр",
        "updated": "2025-09-16T17:12:02"
      },
      {
        "id": "DT_NSO_0300_067V2.px",
        "type": "t",
        "text": "МОНГОЛ УЛСАД ОРШИН СУУГАА ХҮН АМЫН ТОО, насны бүлэг, баг, хороо, жилээр",
        "updated": "2025-09-16T17:09:01"
      },
      {
        "id": "DT_NSO_0300_068V2.px",
        "type": "t",
        "text": "МОНГОЛ УЛСАД ОРШИН СУУГАА ХҮН АМЫН ТОО, хүйс, баг, хороо, жилээр",
        "updated": "2025-09-16T17:09:27"
      },
      {
        "id": "DT_NSO_0300_077V2.px",
        "type": "t",
        "text": "15 БА ТҮҮНЭЭС ДЭЭШ НАСНЫ СУУРИН ХҮН АМЫН ТОО, насны бүлэг, хүйс, гэрлэлтийн байдал, тооллого явагдсан оноор",
        "updated": "2025-09-16T18:58:28"
      },
      {
        "id": "DT_NSO_3300_044V1.px",
        "type": "t",
        "text": "ӨРХ ТОЛГОЙЛСОН ГАНЦ БИЕ ЭЦЭГ, ЭХ, аймаг, нийслэл, жилээр",
        "updated": "2025-10-06T17:55:24"
      },
      {
        "id": "DT_NSO_3300_045V1.px",
        "type": "t",
        "text": "18 ХҮРТЭЛХ НАСНЫ ХҮҮХЭДТЭЙ ӨРХ ТОЛГОЙЛСОН ЭХ, аймаг, нийслэл, жилээр",
        "updated": "2025-10-06T17:58:27"
      }
    ]
  },

  Subsector3: {
    title: "Статистикийн дэд салбарын мэдээллийг авах",
    titleEn: "Subsector",
    input: { id: "Education, health" },
    api: "https://data.1212.mn/api/v1/mn/NSO/Population, household/",
    output: [
      { Field: "id", Type: "string", Description: "Англи нэр" },
      { Field: "type", Type: "string", Description: "Төрлийн дугаар" },
      { Field: "text", Type: "string", Description: "Монгол нэр" },
    ],
    outputExample: [
      { id: "5_Adminstrative units, territory", type: "1", text: "Засаг захиргаа, нутаг дэвсгэр" },
      { id: "3_Herdsmen", type: "1", text: "Малчид" },
      { id: "1_Population, household", type: "1", text: "Хүн ам, өрх" },
      { id: "3_Infrastructure, housing", type: "1", text: "Хүн амын дэд бүтэц, орон сууц" },
      { id: "2_Regular movement of population", type: "1", text: "Хүн амын ердийн хөдөлгөөн" },
      { id: "4_Population projection", type: "1", text: "Хүн амын хэтийн тооцоо" },
    ]
  },

  Subsector4: {
    title: "Статистикийн үндсэн салбарын жагсаалт авах",
    titleEn: "Main Sector",
    api: "https://data.1212.mn/api/v1/mn/NSO/",
    output: [
      { Field: "id", Type: "string", Description: "Англи нэр" },
      { Field: "type", Type: "string", Description: "Төрлийн дугаар" },
      { Field: "text", Type: "string", Description: "Монгол нэр" },
    ],
    outputExample: [
      { id: "Education, health", type: "1", text: "Боловсрол, эрүүл мэнд" },
      { id: "Regional development", type: "1", text: "Бүсчилсэн хөгжил" },
      { id: "Society, development", type: "1", text: "Нийгэм, хөгжил" },
      { id: "Historical data", type: "1", text: "Түүхэн Статистик" },
      { id: "Industry, service", type: "1", text: "Үйлдвэрлэл, үйлчилгээ" },
      { id: "Labour, business", type: "1", text: "Хөдөлмөр, бизнес" },
      { id: "Population, household", type: "1", text: "Хүн ам, өрх" },
      { id: "Economy, environment", type: "1", text: "Эдийн засаг, байгаль орчин" }
    ]
  }
};

export const subsectorDataMap = {
    Subsector1: {
        title: "Статистик тоон мэдээллийг авах",
        titleEn: "Statistical Data",
        input:{id:"DT_NSO_2100_013V1.px"},
        api: "https://data.1212.mn/api/v1/mn/NSO/Education,%20health/Disease/DT_NSO_2100_013V1.px",
        output: [
          { Field: "title", Type: "string", Description: "Хүснэгтийн гарчиг" },
          { Field: "variables", Type: "array", Description: "Үзүүлэлтүүдийн жагсаалт" },
          { Field: "code", Type: "string", Description: "Үзүүлэлтийн код" },
          { Field: "text", Type: "string", Description: "Үзүүлэлтийн нэр" },
          { Field: "values", Type: "array", Description: "Үзүүлэлтийн кодын утгууд" },
          { Field: "valueTexts", Type: "array", Description: "Үзүүлэлтийн утгуудын текст" }
        ],
        outputExample: {
          title: "ХОРТ ХАВДРААР НАС БАРАГЧДЫН ТОО, 10000 хүнд ногдохоор, хорт хавдрын төрлөөр, жил бүрийн эцэст",
          variables: [
            {
              code: "Хорт хавдрын төрөл",
              text: "Хорт хавдрын төрөл",
              values: ["0", "1", "2", "3", "4", "5", "6"],
              valueTexts: ["Бүгд", "Элэг", "Умайн хүзүү", "Ходоод", "Уушги", "Улаан хоолой", "Бусад"]
            },
            {
              code: "ОН",
              text: "ОН",
              values: [
                "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
                "10", "11", "12", "13", "14", "15", "16", "17",
                "18", "19", "20", "21", "22", "23", "24", "25"
              ],
              valueTexts: [
                "1990", "1995", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007",
                "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017",
                "2018", "2019", "2020", "2021", "2022", "2023"
              ]
            }
          ]
        }
      },
      
  
    Subsector2: {
      title: "Дэд салбар доторх хүснэгтийн жагсаалтыг авах",
      titleEn: "Table",
      input:{id:"Disease"},
      api: "https://data.1212.mn/api/v1/mn/NSO/Education,%20health/Disease/",
      output: [
        { Field: "id", Type: "string", Description: "Англи нэр" },
        { Field: "type", Type: "string", Description: "Төрлийн дугаар" },
        { Field: "text", Type: "string", Description: "Монгол нэр" },
        { Field: "updated", Type: "string", Description: "Сүүлийн шинэчлэлт хийсэн хугацаа" },
      ],
      outputExample: [
        {
          id: "DT_NSO_2100_013V1.px",
          type: "t",
          text: "ХОРТ ХАВДРААР НАС БАРАГЧДЫН ТОО, 10000 хүн амд ногдохоор, хорт хавдрын төрлөөр, жил бүрийн эцэст",
          updated: "2025-04-12T16:50:58"
        },
        {
          id: "DT_NSO_2100_020V2.px",
          type: "t",
          text: "ХАЛДВАРТ ӨВЧНӨӨР ӨВЧЛӨГЧИД, өвчний төрлөөр, бүс, аймаг, нийслэл, сумаар",
          updated: "2025-04-12T16:11:21"
        },
        {
          id: "DT_NSO_2100_028V1.px",
          type: "t",
          text: "ХАЛДВАРТ ӨВЧНӨӨР ӨВЧЛӨГЧИД, бүс, аймаг, нийслэлээр, жил бүрийн эцэст",
          updated: "2025-04-12T15:56:53"
        },
        {
          id: "DT_NSO_2100_035V1.px",
          type: "t",
          text: "ХАЛДВАРТ ӨВЧНӨӨР ӨВЧЛӨГЧИД, зарим өвчний төрлөөр, сараар",
          updated: "2025-04-12T14:42:07"
        },
        {
          id: "DT_NSO_2100_044V1.px",
          type: "t",
          text: "ХОРТ ХАВДРААР ШИНЭЭР ӨВЧЛӨГЧИД, насны бүлгээр",
          updated: "2025-04-12T14:57:16"
        },
        {
          id: "DT_NSO_2100_045V1.px",
          type: "t",
          text: "ХОРТ ХАВДРААР ШИНЭЭР ӨВЧЛӨГЧИД, НАС БАРАГЧИД, 10 000 хүн амд ногдохоор, бүс, аймаг, нийслэлээр",
          updated: "2025-04-11T23:28:18"
        }
      ]
    },
  
    Subsector3: {
      title: "Статистикийн дэд салбарын мэдээллийг авах",
      titleEn: "Subsector",
      input:{id:"Education, health"},
      api: "https://data.1212.mn/api/v1/mn/NSO/Education,%20health",
      output: [
        { Field: "id", Type: "string", Description: "Англи нэр" },
        { Field: "type", Type: "string", Description: "Төрлийн дугаар" },
        { Field: "text", Type: "string", Description: "Монгол нэр" },
      ],
      outputExample: [
        { id: "General indicators for Education", type: "1", text: "Боловсролын ерөнхий үзүүлэлт" },
        { id: "General educational schools", type: "1", text: "Ерөнхий боловсролын сургууль" },
        { id: "Universities, institutes and colleges", type: "1", text: "Их дээд сургууль" },
        { id: "Vocational education", type: "1", text: "Мэргэжлийн боловсрол" },
        { id: "Disease", type: "1", text: "Өвчлөл" },
        { id: "Pre-school education", type: "1", text: "Сургуулийн өмнөх боловсрол" },
        { id: "Births, deaths", type: "1", text: "Төрөлт, нас баралт" },
        { id: "Main indicators for Health sector", type: "1", text: "Эрүүл мэндийн үндсэн үзүүлэлт" }
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
  
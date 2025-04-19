export const subsectorDataMap = {
    Subsector1: {
      title: "Статистик тоон мэдээллийг авах",
      description: "API ашиглан статистик тоон мэдээллийг авах боломжтой.",
      api: "opendata.1212.mn/api/Data?type={type}",
      urlInput: [
        { Parameter: "type", Type: "string", Description: "Мэдээллийн төрөл" },
      ],
      inputExample: `{\n  "type": "json"\n}`,
      output: [
        { Field: "value", Type: "number", Description: "Үзүүлэлтийн утга" },
      ],
      outputExample: `{\n  "value": 12345\n}`,
    },
    Subsector2: {
      title: "Хүснэгтийн жагсаалтыг авах",
      description: "Салбарын дэд ангиллуудыг харуулна.",
      api: "opendata.1212.mn/api/Sector?subid={subid}&type={type}",
      urlInput: [
        { Parameter: "subid", Type: "string", Description: "Салбарын дугаар" },
        { Parameter: "type", Type: "string", Description: "json эсвэл xml" },
      ],
      inputExample: `{\n  "subid": "976_L05_01",\n  "type": "json"\n}`,
      output: [
        { Field: "list_id", Type: "string", Description: "Салбарын код" },
        { Field: "list_nm", Type: "string", Description: "Монгол нэр" },
      ],
      outputExample: `[\n  {\n    "list_id": "976_L05_01",\n    "list_nm": "Дотоодын нийт бүтээгдэхүүн"\n  }\n]`,
    },
    Subsector3: {
        title: "Статистикийн дэд салбарын жагсаалт авах",
        description: "Салбарын дэд ангиллуудыг харуулна.",
        api: "opendata.1212.mn/api/Sector?subid={subid}&type={type}",
        urlInput: [
          { Parameter: "subid", Type: "string", Description: "Салбарын дугаар" },
          { Parameter: "type", Type: "string", Description: "json эсвэл xml" },
        ],
        inputExample: `{\n  "subid": "976_L05_01",\n  "type": "json"\n}`,
        output: [
          { Field: "list_id", Type: "string", Description: "Салбарын код" },
          { Field: "list_nm", Type: "string", Description: "Монгол нэр" },
        ],
        outputExample: `[\n  {\n    "list_id": "976_L05_01",\n    "list_nm": "Дотоодын нийт бүтээгдэхүүн"\n  }\n]`,
      },
      Subsector4: {
        title: "Статистикийн үндсэн салбарын жагсаалт авах",
        description: "Салбарын дэд ангиллуудыг харуулна.",
        api: "opendata.1212.mn/api/Sector?subid={subid}&type={type}",
        urlInput: [
          { Parameter: "subid", Type: "string", Description: "Салбарын дугаар" },
          { Parameter: "type", Type: "string", Description: "json эсвэл xml" },
        ],
        inputExample: `{\n  "subid": "976_L05_01",\n  "type": "json"\n}`,
        output: [
          { Field: "list_id", Type: "string", Description: "Салбарын код" },
          { Field: "list_nm", Type: "string", Description: "Монгол нэр" },
        ],
        outputExample: `[\n  {\n    "list_id": "976_L05_01",\n    "list_nm": "Дотоодын нийт бүтээгдэхүүн"\n  }\n]`,
      },
  };
  
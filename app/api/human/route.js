import { NextResponse } from "next/server";
import { setImage, setImage1 } from "@/utils/imageGeneration";
import { homoStatistic } from "@/app/api/config/db_csweb.config.js";

/**
 * Database stored procedures-аас өгөгдөл авах
 * registerNo -> homoName, homoStatistic, homoCheckcountPopProc
 */
async function getHomoDataFromLegacy(registerNo) {
  try {
    // Extract first row from results (MSSQL stored procedures return result sets)
    // Handle different possible result formats
    const getFirstRow = (result) => {
      if (Array.isArray(result)) {
        return result[0]?.[0] || result[0] || {};
      }
      if (result?.recordset) {
        return result.recordset[0] || {};
      }
      if (result?.[0]?.recordset) {
        return result[0].recordset[0] || {};
      }
      return result || {};
    };

    // First, get the name data
    const homoNameResult = await homoStatistic.raw(
      "EXEC [dbo].[HomoGetNames] @RegisterNo = ?",
      [registerNo]
    );
    const homoName = getFirstRow(homoNameResult);

    // Get the fields for the other procedures
    const nameParam =
      homoName.givenName || homoName.name || homoName.Name || "";
    const ageParam = homoName.age || homoName.Age || 0;
    const educationLevelIDParam =
      homoName.educationLevelID ||
      homoName.EducationLevelID ||
      homoName.educationLevel ||
      homoName.EducationLevel ||
      "";
    const employmentStatusIDParam =
      homoName.employmentStatusID ||
      homoName.EmploymentStatusID ||
      homoName.employmentStatus ||
      homoName.EmploymentStatus ||
      0;
    
    // Get birth date and register number for HomoCheckcountPopProc
    const birthDateParam =
      homoName.BirthDate || homoName.birthDate || homoName.dateBirth || null;
    const registerNoParam =
      homoName.registerNo || homoName.RegisterNo || registerNo;

    // Call the other procedures with required parameters
    // HomoStatistic needs @Name, @Age, @EducationLevelID, and @EmploymentStatusID
    // HomoCheckcountPopProc needs @dateBirth and @registerNo (or @registemo - trying @registerNo first)
    const [homoStatisticResult, homoCheckcountPopProcResult] =
      await Promise.all([
        homoStatistic.raw(
          "EXEC [dbo].[HomoStatistic] @Name = ?, @Age = ?, @EducationLevelID = ?, @EmploymentStatusID = ?",
          [nameParam, ageParam, educationLevelIDParam, employmentStatusIDParam]
        ),
        homoStatistic.raw(
          "EXEC [dbo].[HomoCheckcountPopProc] @dateBirth = ?, @registerNo = ?",
          [birthDateParam, registerNoParam]
        ),
      ]);

    const homoStatisticData = getFirstRow(homoStatisticResult);
    const homoCheckcountPopProc = getFirstRow(homoCheckcountPopProcResult);

    return {
      homoName,
      homoStatistic: homoStatisticData,
      homoCheckcountPopProc,
    };
  } catch (error) {
    console.error("Database procedure error:", error);
    throw new Error(`Database procedure алдаа: ${error.message}`);
  }
}

function returnNii(count) {
  const mod = count % 10;
  switch (mod) {
    case 1:
    case 4:
    case 9:
      return `${count}-ний`;
    case 0:
    case 2:
    case 3:
    case 5:
    case 6:
    case 7:
    case 8:
      return `${count}-ны`;
    default:
      return `${count}-ны/ний`;
  }
}

/**
 * ASP.NET SetDescription1(User model)-ийн яг адил утгатай, JS хувилбар
 */
function buildDescription(model) {
  let retrunTxt =
    `ЭРХЭМ ${model.name} ТАНАА <br> Хүн ам, өрхийн мэдээллийн санд ` +
    `${model.year} оны ${model.month}-р сарын ${returnNii(
      model.day
    )} өдрийн байдлаар` +
    ` Тантай ижил нэртэй ${model.countName.toLocaleString(
      "mn-MN"
    )} иргэн Тантай ижил насны ${model.countAge.toLocaleString(
      "mn-MN"
    )} иргэн байгаагийн ${model.countAgeM.toLocaleString(
      "mn-MN"
    )} нь эрэгтэй ${model.countAgeF.toLocaleString(
      "mn-MN"
    )} нь эмэгтэй`;

  if (model.Age > 14) {
    retrunTxt += ` Таны насны хөдөлмөр эрхэлдэг ${model.countEmployment.toLocaleString(
      "mn-MN"
    )} иргэн`;
  }
  if (model.Age > 5) {
    retrunTxt += ` Таны насны, тантай ижил түвшний боловсролтой ${model.countEducaton.toLocaleString(
      "mn-MN"
    )} иргэн байна.`;
  }
  return retrunTxt;
}

/**
 * ASP.NET set(User model)-ийн data хэсэг (Database stored procedures-аас)
 */
async function buildModel(registerNo) {
  const { homoName, homoStatistic, homoCheckcountPopProc } =
    await getHomoDataFromLegacy(registerNo);

  const now = new Date();
  const birthDate = homoName.BirthDate || homoName.birthDate;
  const birth = birthDate ? new Date(birthDate) : new Date();

  const model = {
    registerNo: String(homoName.registerNo || "").toUpperCase(),
    surename: String(homoName.sureName || "").toUpperCase(),
    name: String(homoName.givenName || "").toUpperCase(),
    Age: Number(homoName.age || 0),

    countName: Number(homoStatistic.countName || 0),
    countAge: Number(homoStatistic.countAge || 0),
    countAgeM: Number(homoStatistic.countAgeM || 0),
    countAgeF: Number(homoStatistic.countAgeF || 0),
    countEducaton: Number(homoStatistic.countEducaton || 0),
    countEmployment: Number(homoStatistic.countEmployment || 0),

    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),

    year1: birth.getFullYear(),
    month1: birth.getMonth() + 1,
    day1: birth.getDate(),

    countPop: 0,
  };

  // ASP.NET дээрхи тусгай registerNo-ууд
  const regUpper = model.registerNo;
  if (regUpper === "КЮ15212444") {
    model.countPop = 3000000;
  } else if (regUpper === "УС76112813") {
    model.countPop = 1508173;
  } else if (regUpper === "ДЖ73020128") {
    model.countPop = 1343112;
  } else {
    model.countPop = Number(homoCheckcountPopProc.countPop || 0);
  }

  return model;
}

/**
 * POST /api/human
 * body: { registerNo: "..." }
 */
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const registerNo = body.registerNo;

    if (!registerNo) {
      return NextResponse.json(
        { ok: false, error: "Та регистрийн дугаараа оруулна уу." },
        { status: 400 }
      );
    }

    const model = await buildModel(registerNo.trim());
    const description = buildDescription(model);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const shareUrl = `${baseUrl}/sonirkholtoi/human?reg=${encodeURIComponent(
      registerNo.trim()
    )}`;

    // Generate images
    let image1Data = null;
    let image2Data = null;

    try {
      // Generate birth certificate image (setImage)
      image1Data = await setImage(
        model.surename,
        model.name,
        model.year1,
        model.month1,
        model.day1,
        model.countPop
      );

      // Generate statistics image (setImage1)
      image2Data = await setImage1(model, { headerFontSize: 60, bodyFontSize: 50 });
    } catch (imgError) {
      console.error("Image generation error:", imgError);
      // Continue even if image generation fails
    }

    const image1Url = image1Data?.dataUrl || null;
    const image2UrlFinal = image2Data?.dataUrl || null;

    return NextResponse.json({
      ok: true,
      model,
      description,
      shareUrl,
      image1Url,
      image2Url: image2UrlFinal,
      imgID: image1Data?.imgID || null,
    });
  } catch (err) {
    console.error("HUMAN API error:", err);
    return NextResponse.json(
      { ok: false, error: "Дотоод алдаа гарлаа." },
      { status: 500 }
    );
  }
}

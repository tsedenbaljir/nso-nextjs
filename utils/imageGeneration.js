import { createCanvas, loadImage } from "canvas";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Format number with spaces (e.g., 1234567 -> "1 234 567")
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Return "ний" or "ны" based on count (Mongolian grammar)
 */
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
 * Generate birth certificate image (setImage equivalent)
 * @param {string} lastName - Family name
 * @param {string} firstName - Given name
 * @param {number} year - Birth year
 * @param {number} month - Birth month
 * @param {number} day - Birth day
 * @param {number} count - Population count
 * @param {Object} options - Optional parameters
 * @param {number} options.fontSize - Base font size (default: calculated based on name length)
 * @returns {Promise<{description: string, imgID: string, dataUrl: string}>}
 */
export async function setImage(
    lastName,
    firstName,
    year,
    month,
    day,
    count,
    options = {}
) {
    let firstText = ` ${lastName.toUpperCase()} овогтой ${firstName.toUpperCase()}`;
    let secondText = ` Та ${year} оны ${month} сарын ${day}-нд мэндэлж,`;
    const Text3 = ` Монгол Улсын хүн ам ${formatNumber(count)}`;
    const text4 = " болсныг үүгээр гэрчлэв.";
    const description = `${firstText} ${secondText} ${Text3} ${text4}`;

    let firstLocation = { x: 140, y: 360 };
    let secondLocation = { x: 140, y: 390 };
    let Location3 = { x: 140, y: 420 };
    let Location4 = { x: 140, y: 450 };
    let fontsz = 20;

    const nameLength = lastName.length + firstName.length;

    if (nameLength > 25) {
        firstText = ` ${lastName.toUpperCase()} овогтой`;
        secondText = ` ${firstName.toUpperCase()} Та ${year} оны ${month} сарын ${day}-нд мэндэлж,`;
        firstLocation = { x: 107, y: 360 };
        secondLocation = { x: 107, y: 390 };
        Location3 = { x: 107, y: 420 };
        Location4 = { x: 107, y: 450 };
        fontsz = 24;
    } else if (nameLength > 20) {
        firstText = ` ${lastName.toUpperCase()} овогтой ${firstName.toUpperCase()}`;
        secondText = ` Та ${year} оны ${month} сарын ${day}-нд мэндэлж,`;
        firstLocation = { x: 107, y: 360 };
        secondLocation = { x: 107, y: 390 };
        Location3 = { x: 107, y: 420 };
        Location4 = { x: 107, y: 450 };
        fontsz = 22;
    } else if (nameLength > 10) {
        firstText = ` ${lastName.toUpperCase()} овогтой ${firstName.toUpperCase()}`;
        secondText = ` Та ${year} оны ${month} сарын ${day}-нд мэндэлж,`;
        firstLocation = { x: 107, y: 360 };
        secondLocation = { x: 107, y: 390 };
        Location3 = { x: 107, y: 420 };
        Location4 = { x: 107, y: 450 };
        fontsz = 24;
    }

    const imgID = uuidv4();
    const imageFilePath = path.join(
        process.cwd(),
        "public",
        "images",
        "sonirkholtoi",
        "Homostatbg3.png"
    );

    try {
        const backgroundImage = await loadImage(imageFilePath);
        const canvas = createCanvas(backgroundImage.width, backgroundImage.height);
        const ctx = canvas.getContext("2d");

        // Draw background image
        ctx.drawImage(backgroundImage, 0, 0);

        // Set text rendering quality
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "left";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Set font and color
        ctx.font = `bold italic ${fontsz}px "Times New Roman", "Times", serif`;
        ctx.fillStyle = "rgb(8, 75, 138)";

        // Draw text
        ctx.fillText(firstText, firstLocation.x, firstLocation.y);
        ctx.fillText(secondText, secondLocation.x, secondLocation.y);
        ctx.fillText(Text3, Location3.x, Location3.y);
        ctx.fillText(text4, Location4.x, Location4.y);

        // Convert to base64 data URL (no file saving)
        const buffer = canvas.toBuffer("image/png");
        const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

        return {
            description,
            imgID: imgID.toString(),
            dataUrl,
        };
    } catch (error) {
        console.error("Error in setImage:", error);
        throw error;
    }
}

/**
 * Generate statistics image (setImage1 equivalent)
 * @param {Object} model - User model with statistics
 * @param {Object} options - Optional parameters
 * @param {number} options.headerFontSize - Font size for header text (default: 10)
 * @param {number} options.bodyFontSize - Font size for body text (default: 9)
 * @returns {Promise<{dataUrl: string}>} - Image data URL
 */
export async function setImage1(model, options = {}) {
    const headerFontSize = options.headerFontSize || 10;
    const bodyFontSize = options.bodyFontSize || 9;
    const text1a = "     ЭРХЭМ";
    const text1b = model.name.toUpperCase();
    const text1c = " ТА";
    const text2 = "     Хүн ам, өрхийн мэдээллийн санд";
    const text3 = `${model.year} оны ${model.month}-р сарын ${returnNii(
        model.day
    )} өдрийн байдлаар`;
    const text4a = "Тантай ижил нэртэй ";
    const text4b = formatNumber(model.countName);
    const text4c = " иргэн";

    const text44a = "Тантай ижил насны ";
    const text44b = formatNumber(model.countAge);
    const text44c = " иргэн байгаагийн";

    const text45a = "                                    " + formatNumber(model.countAgeM);
    const text45b = " нь эрэгтэй";
    const text46a = "                                    " + formatNumber(model.countAgeF);
    const text46b = " нь эмэгтэй";

    let text5a = "";
    let text5b = "";
    let text5c = "";

    let text6a = "";
    let text6b = "";
    let text6c = "";

    if (model.Age > 14) {
        text5a = "Таны насны хөдөлмөр эрхэлдэг ";
        text5b = formatNumber(model.countEmployment);
        text5c = " иргэн";
    }

    if (model.Age > 5) {
        text6a = "Таны насны, тантай ижил түвшний боловсролтой ";
        text6b = formatNumber(model.countEducaton);
        text6c = " иргэн байна.";
    }

    // Calculate positions
    const point1a = { x: 197, y: 1414 };
    const point1b = { x: 731, y: 1414 };
    const postion = 60 * model.name.length;
    const point1c = { x: 731 + postion, y: 1414 };

    const point2 = { x: 237, y: 1522 };
    const point3 = { x: 237, y: 1600 };
    const point4a = { x: 237, y: 1680 };
    const postion4b = 45 * text4b.length;
    const point4b = { x: 948, y: 1680 };
    const point4c = { x: 948 + postion4b, y: 1680 };

    const point44a = { x: 237, y: 1760 };
    const point44b = { x: 930, y: 1760 };
    const postion44c = 45 * text44b.length;
    const point44c = { x: 909 + postion44c, y: 1760 };

    const point45a = { x: 237, y: 1839 };
    const postion45b = 25 * formatNumber(model.countAgeM).length;
    const point45b = { x: 909 + postion45b, y: 1839 };

    const point46a = { x: 237, y: 1919 };
    const postion46b = 25 * formatNumber(model.countAgeF).length;
    const point46b = { x: 909 + postion46b, y: 1918 };

    const point5a = { x: 237, y: 2016 };
    const point5b = { x: 1260, y: 2016 };
    const postion5c = 45 * text5b.length;
    const point5c = { x: 1265 + postion5c, y: 2016 };

    let point6a = { x: 237, y: 2115 };
    let point6b = { x: 710, y: 2194 };
    let postion6c = 45 * text6b.length;
    let point6c = { x: 691 + postion6c, y: 2194 };

    if (model.Age <= 14 && model.Age > 5) {
        point6a = { x: 197, y: 1997 };
        point6b = { x: 652, y: 2076 };
        postion6c = 45 * text6b.length;
        point6c = { x: 152 + postion6c, y: 2076 };
    }

    const imageFilePath = path.join(
        process.cwd(),
        "public",
        "images",
        "sonirkholtoi",
        "Homostatbg2-a.png"
    );

    try {
        const backgroundImage = await loadImage(imageFilePath);
        const canvas = createCanvas(backgroundImage.width, backgroundImage.height);
        const ctx = canvas.getContext("2d");

        // Draw background image
        ctx.drawImage(backgroundImage, 0, 0);

        // Set text rendering quality
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "left";
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw text1a, text1b, text1c (header)
        ctx.font = `bold ${headerFontSize}px Arial, sans-serif`;
        ctx.fillStyle = "rgb(44, 119, 187)";
        ctx.fillText(text1a, point1a.x, point1a.y);

        ctx.fillStyle = "rgb(227, 170, 78)";
        ctx.fillText(text1b, point1b.x, point1b.y);

        ctx.fillStyle = "rgb(44, 119, 187)";
        ctx.fillText(text1c, point1c.x, point1c.y);

        // Draw main text (Times New Roman, italic)
        ctx.font = `italic ${bodyFontSize}px 'Times New Roman', 'Times', serif`;
        ctx.fillStyle = "rgb(8, 75, 138)";

        ctx.fillText(text2, point2.x, point2.y);
        ctx.fillText(text3, point3.x, point3.y);
        ctx.fillText(text4a, point4a.x, point4a.y);

        ctx.fillStyle = "rgb(210, 35, 42)";
        ctx.fillText(text4b, point4b.x, point4b.y);

        ctx.fillStyle = "rgb(8, 75, 138)";
        ctx.fillText(text4c, point4c.x, point4c.y);

        ctx.fillText(text44a, point44a.x, point44a.y);

        ctx.fillStyle = "rgb(210, 35, 42)";
        ctx.fillText(text44b, point44b.x, point44b.y);

        ctx.fillStyle = "rgb(8, 75, 138)";
        ctx.fillText(text44c, point44c.x, point44c.y);

        ctx.fillStyle = "rgb(0, 114, 188)";
        ctx.fillText(text45a, point45a.x, point45a.y);

        ctx.fillStyle = "rgb(8, 75, 138)";
        ctx.fillText(text45b, point45b.x, point45b.y);

        ctx.fillStyle = "rgb(230, 25, 137)";
        ctx.fillText(text46a, point46a.x, point46a.y);

        ctx.fillStyle = "rgb(8, 75, 138)";
        ctx.fillText(text46b, point46b.x, point46b.y);

        if (model.Age > 14) {
            ctx.fillStyle = "rgb(8, 75, 138)";
            ctx.fillText(text5a, point5a.x, point5a.y);

            ctx.fillStyle = "rgb(23, 170, 157)";
            ctx.fillText(text5b, point5b.x, point5b.y);

            ctx.fillStyle = "rgb(8, 75, 138)";
            ctx.fillText(text5c, point5c.x, point5c.y);
        }

        if (model.Age > 14) {
            // Split text6a if it contains newline
            const text6aLines = text6a.split("\n");
            let currentY = point6a.y;
            text6aLines.forEach((line, index) => {
                ctx.fillStyle = "rgb(8, 75, 138)";
                ctx.fillText(line, point6a.x, currentY);
                if (index < text6aLines.length - 1) {
                    currentY += 15; // Line height
                }
            });

            ctx.fillStyle = "rgb(23, 170, 157)";
            ctx.fillText(text6b, point6b.x, point6b.y);

            ctx.fillStyle = "rgb(8, 75, 138)";
            ctx.fillText(text6c, point6c.x, point6c.y);
        } else if (model.Age > 5) {
            ctx.fillStyle = "rgb(8, 75, 138)";
            ctx.fillText(text6a, point6a.x, point6a.y);

            ctx.fillStyle = "rgb(23, 170, 157)";
            ctx.fillText(text6b, point6b.x, point6b.y);

            ctx.fillStyle = "rgb(8, 75, 138)";
            ctx.fillText(text6c, point6c.x, point6c.y);
        }

        // Convert to base64 data URL (no file saving)
        const buffer = canvas.toBuffer("image/png");
        const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`;

        return {
            dataUrl,
        };
    } catch (error) {
        console.error("Error in setImage1:", error);
        throw error;
    }
}


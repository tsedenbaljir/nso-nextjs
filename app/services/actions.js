'use server'
import { Agent } from "undici";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/api/config/db_csweb.config";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

async function requireAdminAuth() {
    const session = await getServerSession(options);
    if (!session?.user) {
        return { isAuthenticated: false, error: "Not authenticated" };
    }
    return { isAuthenticated: true, user: session.user };
}

async function validateUserFieldLengths(username, password, role) {
    try {
        const schema = await db.raw(`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'user' AND COLUMN_NAME IN ('username','password','Roles')
        `);
        const rows = Array.isArray(schema)
            ? schema
            : (Array.isArray(schema?.[0]) ? schema[0] : (schema?.recordset || []));
        const limits = {};
        for (const r of rows) {
            const col = r.COLUMN_NAME || r.column_name;
            const max = r.CHARACTER_MAXIMUM_LENGTH ?? r.character_maximum_length;
            if (col == null) continue;
            limits[col] = max == null || max === -1 ? null : max;
        }
        if (limits.username && typeof username === "string" && username.length > limits.username) {
            return { ok: false, error: `Username too long (max ${limits.username})` };
        }
        if (limits.password && typeof password === "string" && password.length > limits.password) {
            return { ok: false, error: `Password too long (max ${limits.password})` };
        }
        if (limits.Roles && typeof role === "string" && role.length > limits.Roles) {
            return { ok: false, error: `Roles too long (max ${limits.Roles})` };
        }
    } catch {
        // continue; DB will enforce
    }
    return { ok: true };
}

export async function fetchAdminUsers() {
    const auth = await requireAdminAuth();
    if (!auth.isAuthenticated) {
        return { success: false, error: auth.error || "Not authenticated" };
    }

    try {
        const users = await db("user")
            .select(["id", "username", "Roles"])
            .limit(1000);

        return { success: true, data: users };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { success: false, error: "Failed to fetch users" };
    }
}

export async function createAdminUser({ username, password, role }) {
    const auth = await requireAdminAuth();
    if (!auth.isAuthenticated) {
        return { success: false, error: auth.error || "Not authenticated" };
    }

    try {
        if (typeof username === "string") username = username.trim();
        if (typeof password === "string") password = password.trim();
        if (typeof role === "string") role = role.trim();

        if (!username || !password) {
            return { success: false, error: "Username and password are required" };
        }

        const existing = await db("user").where({ username }).first();
        if (existing) {
            return { success: false, error: "Username already exists" };
        }

        const lengthCheck = await validateUserFieldLengths(username, password, role);
        if (!lengthCheck.ok) {
            return { success: false, error: lengthCheck.error };
        }

        const [nextIdRow] = await db.raw("SELECT max(id) as nextId FROM [user]");
        const nextId = (parseInt(nextIdRow?.nextId, 10) || 0) + 1;
        const insertData = {
            id: nextId,
            username,
            password,
            Roles: role || null,
        };

        const result = await db("user").insert(insertData);
        const newId = Array.isArray(result) ? result[0] : result;

        return { success: true, id: newId };
    } catch (error) {
        if (error?.number === 8152) {
            return { success: false, error: "One or more fields exceed allowed length" };
        }
        console.error("Error creating user:", error);
        return { success: false, error: "Failed to create user" };
    }
}

export async function deleteAdminUser(id) {
    const auth = await requireAdminAuth();
    if (!auth.isAuthenticated) {
        return { success: false, error: auth.error || "Not authenticated" };
    }

    if (!id) {
        return { success: false, error: "User id is required" };
    }

    try {
        await db("user").where({ id }).del();
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Failed to delete user" };
    }
}

function buildOpenServiceEmailHtml({ firstname, lastname, token_text }) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .email-container {
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .header {
                    border-bottom: 2px solid #f0f0f0;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }
                .greeting {
                    font-size: 24px;
                    color: #2c3e50;
                    margin-bottom: 20px;
                }
                .content {
                    margin: 20px 0;
                }
                .token-container {
                    background-color: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 6px;
                    padding: 15px;
                    margin: 20px 0;
                }
                .token-label {
                    color: #495057;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .token-value {
                    font-family: monospace;
                    background-color: #ffffff;
                    padding: 10px;
                    border-radius: 4px;
                    border: 1px solid #dee2e6;
                    word-break: break-all;
                }
                .guide-link {
                    color: #007bff;
                    text-decoration: none;
                }
                .guide-link:hover {
                    text-decoration: underline;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 2px solid #f0f0f0;
                    text-align: center;
                    color: #6c757d;
                }
                .post-text {
                    color: #28a745;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div className="email-container">
                <div className="header">
                    <div className="greeting">Сайн байна уу ${firstname} ${lastname},</div>
                </div>
                <div className="content"></div>
                    <p>Статистикийн мэдээллийн нэгдсэн сангийн нээлттэй сервисийг ашиглах token тэмдэгтиийг хүргүүлж байна.</p>

                    <div className="token-container">
                        <div className="token-label">Нээлттэй сервисийг ашиглахын тулд <span className="post-text">POST</span> request-ийн Headers:</div>
                        <div className="token-value">access-token: ${token_text}</div>
                    </div>

                    <p>Ашиглах заавар: <a href="https://1212.mn" className="guide-link">https://1212.mn</a></p>
                </div>

                <div className="footer">
                    <p>Баярлалаа</p>
                </div>
            </div>
        </body>
        </html>`;
}

export async function createUserService(data) {
    const {
        user_level,
        organisation_name,
        firstname,
        lastname,
        email,
        position,
        mobile,
        specification,
    } = data || {};

    try {
        if (!email) {
            return { status: false, message: "Email is required" };
        }

        const now = new Date();
        const created_date = moment(now).format("YYYY-MM-DDTHH:mm:ssZ");
        const updated_date = moment(now).format("YYYY-MM-DDTHH:mm:ssZ");

        const userCheck = await db.raw(`
            SELECT id FROM md_users WHERE email = ?
        `, [email]);

        if (userCheck[0]?.id) {
            return {
                status: false,
                message: `${email} Имэйл хаягтай хэрэглэгч бүртгэлтэй байна.`,
            };
        }

        const password = "123";
        const token_text = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.raw(`
            INSERT INTO md_users (
                organisation_name,
                user_level,
                firstname,
                lastname,
                email,
                position,
                mobile,
                token_text,
                password,
                specification,
                created_user,
                updated_user,
                created_date,
                updated_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            organisation_name,
            user_level || 0,
            firstname,
            lastname,
            email,
            position,
            mobile,
            token_text,
            hashedPassword,
            specification,
            1,
            1,
            created_date,
            updated_date,
        ]);

        const user = result[0];

        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.office365.com",
                port: 587,
                secure: false,
                auth: {
                    user: "developer1212@nso.mn",
                    pass: "25veDloper$#",
                },
            });

            await transporter.sendMail({
                from: `<developer1212@nso.mn>`,
                to: email,
                subject: "Нээлттэй сервисийг ашиглах тухай",
                html: buildOpenServiceEmailHtml({ firstname, lastname, token_text }),
            });
        } catch (error) {
            console.error("Error in sendMail:", error);
        }

        return {
            status: true,
            message: "Таны мэдээлэл амжилттай нэмэгдлээ! Та и-мэйл хаягаа шалгана уу",
            user,
        };
    } catch (error) {
        console.error("Error in createUserService:", error);
        return { status: false, message: "Failed to create user" };
    }
}

const insecure = new Agent({ connect: { rejectUnauthorized: false } });

export async function submitContactForm(formData) {
    try {
        const cleanedData = {
            lastName: formData.lastName.trim(),
            firstName: formData.firstName.trim(),
            country: formData.country.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            city: formData.city.trim(),
            district: formData.district.trim(),
            khoroo: formData.khoroo.trim(),
            apartment: formData.apartment.trim(),
            letter: formData.letter.trim(),
        };

        const response = await fetch(`${process.env.BASE_URL}/api/insert/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanedData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Алдаа гарлаа');
        }

        return { success: true };
    } catch (error) {
        console.error('Contact form submission error:', error);
        return { success: false, error: error.message };
    }
}

function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function buildViolationEmailHtml(data) {
    const rows = [
        ["Газар, нэгж", data.lastName],
        ["Албан тушаал", data.firstName],
        ["Овог нэр", data.country],
        ["Зөрчлийн давтамж", data.phoneNumber],
        ["Зөрчлийг мэдсэн суваг", data.city],
        ["Зөрчлийг мэдээлсэн суваг", data.district],
        ["Шууд удирдах ажилтандаа мэдэгдсэн эсэх", data.khoroo],
        ["Нэмэлт мэдээлэл", data.apartment],
        ["Зөрчил", data.letter],
    ];
    const body = rows
        .map(
            ([th, td]) =>
                `<tr><th>${escapeHtml(th)}</th><td>${escapeHtml(td)}</td></tr>`
        )
        .join("");
    return `<table>${body}</table>`;
}

/** Sends violation report email via SMTP API (server-side only). */
export async function submitViolationReport(formData) {
    try {
        const cleanedData = {
            lastName: formData.lastName?.trim() ?? "",
            firstName: formData.firstName?.trim() ?? "",
            country: formData.country?.trim() ?? "",
            phoneNumber: formData.phoneNumber?.trim() ?? "",
            city: formData.city?.trim() ?? "",
            district: formData.district?.trim() ?? "",
            khoroo: formData.khoroo?.trim() ?? "",
            apartment: formData.apartment?.trim() ?? "",
            letter: formData.letter?.trim() ?? "",
        };

        if (Object.values(cleanedData).some((v) => v === "")) {
            return { success: false, error: "validation" };
        }

        const smtpUrl =
            process.env.SMTP_API_URL || "https://smtp.app.nso.mn/api";
        const to = process.env.VIOLATION_EMAIL_TO || "webmaster@nso.mn";

        const response = await fetch(smtpUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to,
                subject: "Violation Report",
                text: "Violation Report Submission",
                html: buildViolationEmailHtml(cleanedData),
            }),
        });

        if (!response.ok) {
            return { success: false, error: "send_failed" };
        }

        return { success: true };
    } catch (error) {
        console.error("Violation report submission error:", error);
        return { success: false, error: error.message };
    }
}

export async function fetchTableauKey() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    try {
        // Use absolute URL for server-side requests
        const response = await fetch(`${process.env.BASE_URL}/api/tableau-key`, {
            headers: {
                "Content-Type": "application/json",
            },
            cache: 'no-store',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch Tableau key');
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('Tableau key fetch error:', error);
        return { success: false, error: error.message };
    }
} 

export async function fetchHomoHuman(registerNo) {
    try {
        // Use absolute URL for server-side requests
        const response = await fetch(`http://localhost:3000/api/human`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ registerNo: registerNo }),
            cache: 'no-store',
            // Allow self-signed / untrusted certificates when calling BASE_URL
            // to avoid UNABLE_TO_VERIFY_LEAF_SIGNATURE errors in Node.
            dispatcher: insecure,
        });
        if (!response.ok) {
            throw new Error('Failed to fetch Homo Human');
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('Homo Human fetch error:', error);
        return { success: false, error: error.message };
    }
} 

// export async function fetchHomoHuman(registerNo) {
//     try {
//         const myHeaders = new Headers();
//         myHeaders.append("access-token", "a79fb6ab-5953-4c46-a240-a20c2af9150a");
//         const requestOptions = {
//             method: 'POST',
//             headers: myHeaders,
//             body: JSON.stringify({ registerNo: registerNo }),
//         };

//         const response = await fetch(`/api/human`, {
//             ...requestOptions,
//             cache: 'no-store',
//             dispatcher: insecure,
//         });
//         if (!response.ok) {
//             throw new Error('Failed to fetch Homo Human');
//         }

//         const result = await response.json();
//         return { success: true, data: result };
//     } catch (error) {
//         console.error('Homo Human fetch error:', error);
//         return { success: false, error: error.message };
//     }
// }

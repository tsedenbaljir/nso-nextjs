'use server'
import { Agent } from "undici";

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

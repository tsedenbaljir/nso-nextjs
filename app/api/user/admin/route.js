import { NextResponse } from "next/server";
import { db } from "@/app/api/config/db_csweb.config";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - List users (TOP 1000)
export async function GET() {
    try {
        const users = await db("user")
            .select(["id", "username", "password", "Roles"]) // mssql: reserved keyword table ok via knex
            .limit(1000);

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
    }
}

// POST - Add user
export async function POST(req) {
    try {
        const body = await req.json();
        let { username, password, role } = body || {};
        // normalize
        if (typeof username === 'string') username = username.trim();
        if (typeof password === 'string') password = password.trim();
        if (typeof role === 'string') role = role.trim();

        if (!username || !password) {
            return NextResponse.json({ success: false, error: "Username and password are required" }, { status: 400 });
        }

        // Check duplicate username
        const existing = await db("user").where({ username }).first();
        if (existing) {
            return NextResponse.json({ success: false, error: "Username already exists" }, { status: 409 });
        }

        // Validate lengths against SQL schema to avoid truncation (8152)
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
                const type = r.DATA_TYPE || r.data_type;
                const max = r.CHARACTER_MAXIMUM_LENGTH ?? r.character_maximum_length;
                if (col == null) continue;
                if (max == null) { limits[col] = null; continue; }
                // nvarchar/nchar length reported as characters already in INFORMATION_SCHEMA
                limits[col] = max === -1 ? null : max;
            }
            if (limits.username && typeof username === 'string' && username.length > limits.username) {
                return NextResponse.json({ success: false, error: `Username too long (max ${limits.username})` }, { status: 400 });
            }
            if (limits.password && typeof password === 'string' && password.length > limits.password) {
                return NextResponse.json({ success: false, error: `Password too long (max ${limits.password})` }, { status: 400 });
            }
            if (limits.Roles && typeof role === 'string' && role.length > limits.Roles) {
                return NextResponse.json({ success: false, error: `Roles too long (max ${limits.Roles})` }, { status: 400 });
            }
        } catch (e) {
            // continue; DB will enforce
        }

        // Compute next id as MAX(id) + 1
        const [nextIdRow] = await db.raw("SELECT max(id) as nextId FROM [user]");
        const nextId = (parseInt(nextIdRow?.nextId, 10) || 0) + 1;
        const insertData = {
            id: nextId,
            username,
            password, // NOTE: plain text to match current auth logic
            Roles: role || null,
        };

        const result = await db("user").insert(insertData);
        const newId = Array.isArray(result) ? result[0] : result;

        return NextResponse.json({ success: true, id: newId });
    } catch (error) {
        // Handle known truncation error from MSSQL (8152)
        if (error?.number === 8152) {
            return NextResponse.json({ success: false, error: "One or more fields exceed allowed length" }, { status: 400 });
        }
        console.error("Error creating user:", error);
        return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 });
    }
}

// DELETE - Delete user by id
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, error: "User id is required" }, { status: 400 });
        }

        await db("user").where({ id }).del();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
    }
}



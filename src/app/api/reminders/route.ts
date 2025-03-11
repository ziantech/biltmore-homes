import { NextRequest, NextResponse } from "next/server";
import pool from "@lib/db";

export async function POST(req: NextRequest) {
    try {
        const { name, facilityName, documentType, type, frequency, dueDate, status } = await req.json();

        // 🔹 Validate required fields based on type
        if (!facilityName || !documentType || !type || !frequency || !dueDate) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if ((type === "resident" || type === "employee") && !name) {
            return NextResponse.json({ error: "Name is required for Resident and Employee documents" }, { status: 400 });
        }

        // 🔹 Insert into the database
        const query = `
            INSERT INTO reminders (name, facility_name, document_type, type, frequency, due_date, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        const result = await pool.query(query, [name || null, facilityName, documentType, type, frequency, dueDate, status]);

        console.log("Inserted Reminder:", result.rows[0]);
        return NextResponse.json({ success: true, reminder: result.rows[0] });

    } catch (error) {
        console.error("Error adding reminder:", error);
        return NextResponse.json({ error: "Failed to add reminder" }, { status: 500 });
    }
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
    try {
        // ✅ Fetch all reminders sorted by status (completed last)
        const query = `SELECT * FROM reminders ORDER BY status DESC, due_date DESC;`;
        const result = await pool.query(query);

        return NextResponse.json({ success: true, reminders: result.rows });
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
    }
}
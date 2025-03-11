import { NextResponse } from "next/server";
import pool from "@lib/db";

export async function GET() {
    try {
        const query = `
            SELECT id, name, address, city, state, zipcode, max_occupancy, available_beds, pictures 
            FROM facilities;
        `;
        const result = await pool.query(query);

        return NextResponse.json({ success: true, facilities: result.rows });
    } catch (error) {
        console.error("Error fetching facilities:", error);
        return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 });
    }
}

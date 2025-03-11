import { NextRequest, NextResponse } from "next/server";
import pool from "@lib/db";

export async function POST(req: NextRequest) {
    try {
        const facility = await req.json();

        // Insert into the database
        const query = `
            INSERT INTO facilities 
            (name, logo, address, city, state, zipcode, max_occupancy, available_beds, about_us, 
            manager_name, services, daily_activities, pictures, menu, contacts)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *;
        `;

        const values = [
            facility.name,
            facility.logo,
            facility.address,
            facility.city,
            facility.state,
            facility.zipcode,
            facility.maxOccupancy,
            facility.availableBeds,
            facility.aboutUs,
            facility.managerName,
            facility.services,
            facility.dailyActivities,
            facility.pictures,
            JSON.stringify(facility.menu), // Convert menu JSON to string
            JSON.stringify(facility.contacts), // Convert contacts JSON to string
        ];

        const result = await pool.query(query, values);

        return NextResponse.json({ success: true, facility: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to save facility" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const query = "SELECT id, name, logo FROM facilities;";
        const result = await pool.query(query);

        return NextResponse.json({ facilities: result.rows });
    } catch (error) {
        console.error("Error fetching facilities:", error);
        return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 });
    }
}

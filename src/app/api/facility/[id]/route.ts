import { NextRequest, NextResponse } from "next/server";
import pool from "@lib/db";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Await params (Next.js 15 fix)
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: "Missing facility ID" }, { status: 400 });
        }

        const query = `SELECT * FROM facilities WHERE id = $1;`;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Facility not found" }, { status: 404 });
        }

        const facility = result.rows[0];

        // ✅ Convert database fields (snake_case) to TypeScript fields (camelCase)
        const formattedFacility = {
            id: facility.id,
            name: facility.name,
            logo: facility.logo,
            address: facility.address,
            city: facility.city,
            state: facility.state,
            zipcode: facility.zipcode,
            maxOccupancy: facility.max_occupancy,
            availableBeds: facility.available_beds,
            aboutUs: facility.about_us,  // Convert "about_us" → "aboutUs"
            services: facility.services,
            dailyActivities: facility.daily_activities,
            pictures: facility.pictures,
            menu: facility.menu,  // Already in correct format (JSONB)
            contacts: facility.contacts,  // Already in correct format (JSONB)
            managerName: facility.manager_name, // Convert "manager_name" → "managerName"
            created_at: new Date(facility.created_at),
            updated_at: new Date(facility.updated_at),
        };

        return NextResponse.json({ facility: formattedFacility }, { status: 200 });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to fetch facility" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        const { field, value } = await req.json();

        console.log("🔍 PATCH Request Received:");
        console.log("Field:", field);
        console.log("Value:", value);
        console.log("Type of Value:", typeof value);

        // ✅ Map frontend field names to correct database column names
        const dbFieldMap: Record<string, string> = {
            dailyActivities: "daily_activities",
            maxOccupancy: "max_occupancy",
            availableBeds: "available_beds",
            managerName: "manager_name",
            aboutUs: "about_us"
        };
        const dbField = dbFieldMap[field] || field;

        // ✅ Ensure allowed fields
        const allowedFields = [
            "name", "address", "city", "state", "zipcode",
            "manager_name", "about_us", "pictures", "logo",
            "services", "daily_activities", "contacts", "menu",
            "max_occupancy", "available_beds", "about_us"
        ];
        
        if (!allowedFields.includes(dbField)) {
            return NextResponse.json({ error: "Invalid field" }, { status: 400 });
        }

        let query = `UPDATE facilities SET ${dbField} = $1 WHERE id = $2 RETURNING *;`;
        let queryParams = [value, id];

        // ✅ Convert `daily_activities`, `services`, `menu`, `contacts` to appropriate PostgreSQL types
        if (dbField === "daily_activities" || dbField === "services") {
            query = `UPDATE facilities SET ${dbField} = $1::TEXT[] WHERE id = $2 RETURNING *;`;
        }
        if (dbField === "contacts" || dbField === "menu") {
            query = `UPDATE facilities SET ${dbField} = $1::jsonb WHERE id = $2 RETURNING *;`;
            queryParams = [JSON.stringify(value), id];  // Convert JavaScript object to JSON
        }

        const result = await pool.query(query, queryParams);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Facility not found" }, { status: 404 });
        }

        console.log("✅ Database Update Successful:", result.rows[0]);

        return NextResponse.json({
            success: true,
            facility: result.rows[0],
            message: `${field} updated successfully!`
        });

    } catch (error) {
        console.error("❌ Update error:", error);
        return NextResponse.json({ error: "Failed to update facility" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import pool from "@lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise< { id: string } >}) {
    try {
        const id = (await params).id;

        if (!id) {
            return NextResponse.json({ error: "Missing facility ID" }, { status: 400 });
        }

        const query = `SELECT * FROM facilities WHERE id = $1;`;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Facility not found" }, { status: 404 });
        }

        const facility = result.rows[0];

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
            aboutUs: facility.about_us,
            services: facility.services,
            dailyActivities: facility.daily_activities,
            pictures: facility.pictures,
            menu: facility.menu,
            contacts: facility.contacts,
            managerName: facility.manager_name,
            created_at: new Date(facility.created_at),
            updated_at: new Date(facility.updated_at),
        };

        return NextResponse.json({ facility: formattedFacility }, { status: 200 });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to fetch facility" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{id: string}> }) {
    try {
        const id = (await params).id;
        const { field, value } = await req.json();

        console.log("🔍 PATCH Request Received:");
        console.log("Field:", field);
        console.log("Value:", value);
        console.log("Type of Value:", typeof value);

        const dbFieldMap: Record<string, string> = {
            dailyActivities: "daily_activities",
            maxOccupancy: "max_occupancy",
            availableBeds: "available_beds",
            managerName: "manager_name",
            aboutUs: "about_us"
        };
        const dbField = dbFieldMap[field] || field;

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

        if (dbField === "daily_activities" || dbField === "services") {
            query = `UPDATE facilities SET ${dbField} = $1::TEXT[] WHERE id = $2 RETURNING *;`;
        }
        if (dbField === "contacts" || dbField === "menu") {
            query = `UPDATE facilities SET ${dbField} = $1::jsonb WHERE id = $2 RETURNING *;`;
            queryParams = [JSON.stringify(value), id];
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

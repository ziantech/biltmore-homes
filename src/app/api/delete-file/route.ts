import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import pool from "@lib/db";

export async function POST(req: NextRequest) {
    try {
        const { filePath, facilityId } = await req.json();
        console.log("Deleting:", filePath, "Facility ID:", facilityId);

        if (!filePath || !facilityId) {
            return NextResponse.json({ error: "Missing file path or facility ID" }, { status: 400 });
        }

        const absolutePath = path.join(process.cwd(), "public", filePath);

        // ✅ Delete the file from the uploads folder
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }

        let updateQuery;
        let queryParams;

        if (filePath.includes("logo")) {
            // ✅ Set logo as an empty string instead of NULL
            updateQuery = `UPDATE facilities SET logo = '' WHERE id = $1 RETURNING *;`;
            queryParams = [facilityId];
        } else {
            // ✅ Remove the picture from the pictures array
            updateQuery = `UPDATE facilities SET pictures = array_remove(pictures, $1) WHERE id = $2 RETURNING *;`;
            queryParams = [filePath, facilityId];
        }

        const result = await pool.query(updateQuery, queryParams);

        return NextResponse.json({ success: true, facility: result.rows[0], message: "File deleted successfully!" });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
}

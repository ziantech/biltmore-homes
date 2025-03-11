import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const folder = formData.get("folder") as string | null;
        const fileName = formData.get("name") as string | null;

        if (!file || !folder || !fileName) {
       
            return NextResponse.json({ error: "File or folder missing!" }, { status: 400 });
        }

        // Allowed file types
       
        console.log(file.type)
        if (file.type !== "image/png" && file.type !== "image/jpg" && file.type !== "image/jpeg" ) {
          
            return NextResponse.json({ error: "Invalid file type! Only JPG, JPEG, and PNG are allowed." }, { status: 400 });
        }

        // Create facility folder inside uploads
        const facilityDir = path.join(process.cwd(), "public/uploads", folder);
        if (!fs.existsSync(facilityDir)) {
            fs.mkdirSync(facilityDir, { recursive: true });
        }

        // Generate unique filename
        const finalFileName = `${fileName}.${file.type.split("/")[1]}`;
        const filePath = path.join(facilityDir, finalFileName);

        // Convert file to buffer and save
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        // Return the new file URL
        return NextResponse.json({ url: `/uploads/${folder}/${finalFileName}` }, { status: 200 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }
}

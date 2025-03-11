import { NextRequest, NextResponse } from "next/server";
import pool from "@lib/db"; // Assuming you're using PostgreSQL
import emailjs from "@emailjs/nodejs"; // Install: `npm install @emailjs/nodejs`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Compute dates for upcoming and future reminders
        const fiveDaysFromNow = new Date(today);
        fiveDaysFromNow.setDate(today.getDate() + 5);

        const sixDaysFromNow = new Date(today);
        sixDaysFromNow.setDate(today.getDate() + 6);

        const fifteenDaysFromNow = new Date(today);
        fifteenDaysFromNow.setDate(today.getDate() + 15);

        // Fetch reminders due between 5 and 15 days from now
        const query = `
            SELECT * FROM reminders
            WHERE due_date BETWEEN $1 AND $2
            ORDER BY due_date ASC;
        `;
        const result = await pool.query(query, [fiveDaysFromNow, fifteenDaysFromNow]);

        const reminders = result.rows;

        // Separate reminders into categories
        const upcomingReminders = reminders.filter(reminder =>
            new Date(reminder.due_date).toDateString() === fiveDaysFromNow.toDateString()
        );

        const futureReminders = reminders.filter(reminder =>
            new Date(reminder.due_date) >= sixDaysFromNow && new Date(reminder.due_date) <= fifteenDaysFromNow
        );

        // Format reminders as an array of objects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatReminder = (r: any) => ({
            type: r.type.charAt(0).toUpperCase() + r.type.slice(1), // Capitalize first letter
            name: r.name || "N/A",
            facility_name: r.facility_name,
            document_type: r.document_type.replace(/-/g, " "), // Convert kebab-case
            due_date: new Date(r.due_date).toLocaleDateString(),
        });

        const formattedUpcomingReminders = upcomingReminders.map(formatReminder);
        const formattedFutureReminders = futureReminders.map(formatReminder);

        // Send email using EmailJS
        const serviceId = process.env.EMAILJS_SERVICE_ID!;
        const templateId = process.env.EMAILJS_TEMPLATE_ID!;
        const publicKey = process.env.EMAILJS_PUBLIC_KEY!;
        const privateKey = process.env.EMAILJS_PRIVATE_KEY!;

        await emailjs.send(serviceId, templateId, {
            upcoming_reminders: formattedUpcomingReminders, // Send upcoming reminders
            future_reminders: formattedFutureReminders,     // Send future reminders
        }, {
            publicKey: publicKey,
            privateKey: privateKey
        });

        return NextResponse.json({ success: true, message: "Reminder email sent successfully!" });

    } catch (error) {
        console.error("Error sending reminders:", error);
        return NextResponse.json({ error: "Failed to send reminder email" }, { status: 500 });
    }
}


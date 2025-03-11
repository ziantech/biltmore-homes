import { NextRequest, NextResponse } from "next/server";
import pool from "@lib/db";


export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = context.params;

        if (!id) {
            return NextResponse.json({ error: "Reminder ID is required" }, { status: 400 });
        }

        // ✅ Fetch the existing reminder
        const reminderQuery = `SELECT * FROM reminders WHERE id = $1;`;
        const reminderResult = await pool.query(reminderQuery, [id]);

        if (reminderResult.rowCount === 0) {
            return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
        }

        const reminder = reminderResult.rows[0];

        // ✅ Compute new due date (old due date + frequency months)
        const newDueDate = new Date(reminder.due_date);
        newDueDate.setMonth(newDueDate.getMonth() + reminder.frequency);

        // ✅ Mark the current reminder as completed
        const updateQuery = `
            UPDATE reminders 
            SET status = 'completed', updated_at = NOW() 
            WHERE id = $1;
        `;
        await pool.query(updateQuery, [id]);

        // ✅ Insert a new reminder with the updated due date (ensuring correct fields)
        const insertQuery = `
            INSERT INTO reminders (name, facility_name, document_type, type, frequency, due_date, status, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, 'not-completed', NOW(), NOW()) 
            RETURNING *;
        `;

        const newReminderResult = await pool.query(insertQuery, [
            reminder.name || "",  // Handle optional name
            reminder.facility_name,
            reminder.document_type,
            reminder.type,  // Ensure correct type is carried over
            reminder.frequency,
            newDueDate,
        ]);

        return NextResponse.json({
            success: true,
            completedReminder: reminder,
            newReminder: newReminderResult.rows[0],
            message: "Reminder marked as completed, and a new reminder has been created.",
        });
    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = context.params;

        if (!id) {
            return NextResponse.json({ error: "Reminder ID is required" }, { status: 400 });
        }

        // ✅ Delete the reminder
        const deleteQuery = `DELETE FROM reminders WHERE id = $1 RETURNING *;`;
        const result = await pool.query(deleteQuery, [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Reminder deleted successfully!",
            deletedReminder: result.rows[0],
        });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
    }
}
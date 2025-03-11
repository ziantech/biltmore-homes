"use client";

import { useState, useEffect } from "react";

import { Box, Button, Container, Grid, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useNotification } from "@context/NotificationContext";
import { Reminder } from "@lib/schemas/reminder-schema";




export default function RemindersPage() {
    const [showForm, setShowForm] = useState(false);
    const [reminder, setReminder] = useState<Reminder>({
        id: undefined, // Auto-incremented in DB
        status: "not-completed", // ✅ Default status
        name: "", // Renamed from residentName to name
        type: "resident", // ✅ Default type
        documentType: "tb-test", // ✅ Default document type
        frequency: 1, // Default to 1 month
        dueDate: null, // No date selected initially
        createdAt: undefined,
        updatedAt: undefined,
        facilityName: ""
    });

    const [reminders, setReminders] = useState<Reminder[]>([]);

    const { showNotification } = useNotification()
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setReminder({ ...reminder, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const res = await fetch("/api/reminders");
                const data = await res.json();

                if (res.ok) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const formattedReminders = data.reminders.map((r: any) => ({
                        id: r.id,
                        status: r.status,
                        name: r.name, // ✅ Updated from resident_name to name
                        facilityName: r.facility_name,
                        type: r.type, // ✅ New field for type (resident, facility, employee)
                        documentType: r.document_type,
                        frequency: r.frequency,
                        dueDate: r.due_date ? new Date(r.due_date) : null, // ✅ Convert string to Date object safely
                        createdAt: r.created_at ? new Date(r.created_at) : undefined,
                        updatedAt: r.updated_at ? new Date(r.updated_at) : undefined,
                    }));


                    setReminders(formattedReminders);
                } else {
                    console.error("Error fetching reminders:", data.error);
                }
            } catch (error) {
                console.error("Failed to fetch reminders", error);
            }
        };

        fetchReminders();
    }, []);


    const handleSaveReminder = async () => {
        // ✅ Validation: If type is "resident" or "employee", require name, facilityName, and dueDate
        if (
            (reminder.type === "resident" || reminder.type === "employee") &&
            (!reminder.name || !reminder.facilityName || !reminder.dueDate)
        ) {
            showNotification("Please fill in all required fields!", "error");
            return;
        }

        // ✅ Validation: If type is "facility", require only facilityName and dueDate
        if (reminder.type === "facility" && (!reminder.facilityName || !reminder.dueDate)) {
            showNotification("Please fill in all required fields!", "error");
            return;
        }

        const res = await fetch("/api/reminders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reminder), // ✅ Send full Reminder structure
        });

        const data = await res.json();

        if (res.ok) {
            showNotification("Reminder added successfully", "success");

            // ✅ Format the response to match the Reminder interface
            const formattedReminder: Reminder = {
                id: data.reminder.id,
                name: data.reminder.name, // ✅ Updated from residentName
                facilityName: data.reminder.facility_name,
                type: data.reminder.type, // ✅ New type field
                documentType: data.reminder.document_type,
                frequency: data.reminder.frequency,
                dueDate: data.reminder.due_date ? new Date(data.reminder.due_date) : null, // ✅ Convert string to Date object safely
                status: data.reminder.status as "completed" | "not-completed", // ✅ Ensure correct type
                createdAt: data.reminder.created_at ? new Date(data.reminder.created_at) : undefined,
                updatedAt: data.reminder.updated_at ? new Date(data.reminder.updated_at) : undefined,
            };

            // ✅ Update the state dynamically with the corrected fields
            setReminders((prevReminders) => [...prevReminders, formattedReminder]);
            setReminder({
                id: undefined, // Auto-incremented in DB
                status: "not-completed", // ✅ Default status
                name: "", // Renamed from residentName to name
                type: "resident", // ✅ Default type
                documentType: "tb-test", // ✅ Default document type
                frequency: 1, // Default to 1 month
                dueDate: null, // No date selected initially
                createdAt: undefined,
                updatedAt: undefined,
                facilityName: ""
            })
            setShowForm(false);

        } else {
            showNotification(data.error, "error");
        }
    };

    const handleCompleteReminder = async (id: number) => {
        const res = await fetch(`/api/reminders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (res.ok) {
            showNotification("Reminder marked as completed, and a new one has been scheduled!", "success");

            // ✅ Transform `newReminder` to match `Reminder` interface
            const formattedNewReminder: Reminder = {
                id: data.newReminder.id,
                name: data.newReminder.resident_name, // ✅ Convert snake_case to camelCase
                facilityName: data.newReminder.facility_name,
                documentType: data.newReminder.document_type,
                type: data.newReminder.type,
                frequency: data.newReminder.frequency,
                dueDate: new Date(data.newReminder.due_date), // ✅ Convert to Date object
                status: data.newReminder.status as "completed" | "not-completed", // ✅ Ensure correct type
                createdAt: new Date(data.newReminder.created_at), // ✅ Convert to Date
                updatedAt: new Date(data.newReminder.updated_at), // ✅ Convert to Date
            };

            // ✅ Update the state dynamically
            setReminders((prevReminders) =>
                prevReminders
                    .map((r) =>
                        r.id === id
                            ? { ...r, status: "completed" as const } // ✅ Mark old reminder as completed
                            : r
                    )
                    .concat(formattedNewReminder) // ✅ Add new reminder
            );
        } else {
            showNotification(data.error, "error");
        }
    };



    const handleDeleteReminder = async (id: number) => {
        if (!confirm("Are you sure you want to delete this reminder?")) return;

        const res = await fetch(`/api/reminders/${id}`, {
            method: "DELETE",
        });

        const data = await res.json();

        if (res.ok) {
            showNotification("Reminder deleted successfully!", "success");

            // ✅ Remove the deleted reminder from the list
            setReminders((prevReminders) => prevReminders.filter((r) => r.id !== id));
        } else {
            showNotification(data.error, "error");
        }
    };

    return (
        <Container maxWidth="md" sx={{ ml: 0 }}>
            <Box my={3}>
                <Typography variant="h4">Reminders</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Cancel" : "Add a Reminder"}
                </Button>
            </Box>
            {showForm && (
                <Paper sx={{ padding: 3, mt: 3 }}>
                    <Typography variant="h6" mb={2}>New Reminder</Typography>
                    <Grid container spacing={2}>

                        {/* Type Selection */}
                        <Grid item xs={12}>
                            <Select
                                label="Type"
                                name="type"
                                fullWidth
                                value={reminder.type}
                                onChange={(e) => setReminder({ ...reminder, type: e.target.value as Reminder["type"] })}
                            >
                                <MenuItem value="resident">Resident Document</MenuItem>
                                <MenuItem value="employee">Employee Document</MenuItem>
                                <MenuItem value="facility">Facility Document</MenuItem>
                            </Select>
                        </Grid>

                        {/* Conditional: Show Name Input if Resident or Employee */}
                        {(reminder.type === "resident" || reminder.type === "employee") && (
                            <Grid item xs={12}>
                                <TextField label="Name" name="name" fullWidth onChange={handleChange} />
                            </Grid>
                        )}

                        {/* Facility Name (Always Required) */}
                        <Grid item xs={12}>
                            <TextField label="Facility Name" name="facilityName" fullWidth onChange={handleChange} />
                        </Grid>

                        {/* Conditional Document Type Selection */}
                        <Grid item xs={12}>
                            <Select
                                label="Document Type"
                                name="documentType"
                                fullWidth
                                value={reminder.documentType || ""} // ✅ Ensures the value is valid
                                onChange={(e) => setReminder({ ...reminder, documentType: e.target.value as Reminder["documentType"] })}
                            >
                                {reminder.type === "resident" &&
                                    [
                                        "tb-test",
                                        "request-to-remain",
                                        "service-plan",
                                        "fall-risk-assessment",
                                    ].map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type
                                                .replace(/-/g, " ") // Replace hyphens with spaces
                                                .replace(/\b\w/g, (char) => char.toUpperCase())} {/* Capitalize each word */}
                                        </MenuItem>
                                    ))}

                                {reminder.type === "employee" &&
                                    [
                                        "fall-prevention",
                                        "abuse-neglect",
                                        "cpr-first-aid",
                                        "fingerprint",
                                        "tb-test",
                                    ].map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type
                                                .replace(/-/g, " ")
                                                .replace(/\b\w/g, (char) => char.toUpperCase())}
                                        </MenuItem>
                                    ))}

                                {reminder.type === "facility" &&
                                    [
                                        "maintaince-log",
                                        "employees-disaster-drill",
                                        "evacuation-drill",
                                        "equipment-log",
                                        "quality-management",
                                        "facility-risk-assesment",
                                        "fire-extinguisher",
                                        "policy-procedure-manual",
                                    ].map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type
                                                .replace(/-/g, " ")
                                                .replace(/\b\w/g, (char) => char.toUpperCase())}
                                        </MenuItem>
                                    ))}
                            </Select>

                        </Grid>

                        {/* Frequency & Due Date */}
                        <Grid item xs={6}>
                            <TextField label="Frequency (Months)" name="frequency" type="number" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Due Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }} // ✅ Ensures label doesn't overlap the value
                                value={reminder.dueDate ? reminder.dueDate.toISOString().split("T")[0] : ""}
                                onChange={(e) => setReminder({ ...reminder, dueDate: new Date(e.target.value) })}
                            />
                        </Grid>

                        {/* Save Button */}
                        <Grid item xs={12}>
                            <Button variant="contained" color="success" fullWidth onClick={handleSaveReminder}>
                                Save Reminder
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}


            <Typography variant="h5" mt={5}>List of Reminders</Typography>
            {reminders.length === 0 ? (
                <Typography color="gray" mt={2}>No reminders added yet.</Typography>
            ) : (
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Status</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Facility Name</TableCell>
                                <TableCell>Document Type</TableCell>
                                <TableCell>Frequency</TableCell>
                                <TableCell><b>Due Date</b></TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Delete</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reminders
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                .sort((a, b) => (a.status === "completed" ? 1 : -1)) // ✅ Sort by status
                                .map((reminder) => (
                                    <TableRow key={reminder.id}>
                                        <TableCell sx={{ color: reminder.status === "completed" ? "green" : "red" }}>
                                            {reminder.status === 'completed' ? 'Completed' : 'Not Completed'}
                                        </TableCell>
                                        <TableCell>{reminder.type}</TableCell>
                                        <TableCell>{reminder.name}</TableCell>
                                        <TableCell>{reminder.facilityName}</TableCell>
                                        <TableCell>
                                            {reminder.documentType === 'tb-test' ? 'TB Test' : reminder.documentType === 'service-plan' ? 'Service Plan' : reminder.documentType === 'fall-risk-assessment' ? 'Fall Risk Assestment' : 'Request To Remain'}
                                        </TableCell>
                                        <TableCell>{reminder.frequency} months</TableCell>
                                        <TableCell><b>{new Date(reminder.dueDate!).toLocaleDateString()}</b></TableCell>
                                        <TableCell>
                                            {reminder.status === "not-completed" && (
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleCompleteReminder(reminder.id!)}
                                                >
                                                    Complete
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell>

                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDeleteReminder(reminder.id!)}
                                            >
                                                Delete
                                            </Button>

                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}


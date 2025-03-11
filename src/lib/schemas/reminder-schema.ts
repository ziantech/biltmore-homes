export interface Reminder {
    id?: number; // Auto-incremented ID
    status: "completed" | "not-completed";

    name?: string; // ✅ Optional field replacing "residentName"

    type: "facility" | "resident" | "employee"; // ✅ New field for document type classification

    facilityName: string;

    documentType:
        | "tb-test"
        | "request-to-remain"
        | "service-plan"
        | "fall-risk-assessment"
        | "fall-prevention"
        | "abuse-neglect"
        | "cpr-first-aid"
        | "fingerprint"
        | "maintaince-log"
        | "employees-disaster-drill"
        | "evacuation-drill"
        | "equipment-log"
        | "quality-management"
        | "facility-risk-assesment"
        | "fire-extinguisher"
        | "policy-procedure-manual"; // ✅ Expanded list of document types

    frequency: number; // Number of months
    dueDate: Date | null; // Date the task must be completed
    createdAt?: Date;
    updatedAt?: Date;
}

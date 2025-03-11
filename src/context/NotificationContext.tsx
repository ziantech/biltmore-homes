"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";

type NotificationType = "success" | "error";

interface Notification {
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notification, setNotification] = useState<Notification | null>(null);
    const [open, setOpen] = useState(false); // Controls Snackbar visibility

    const showNotification = (message: string, type: NotificationType) => {
        setNotification({ message, type });
        setOpen(true);

        setTimeout(() => {
            setOpen(false);
        }, 3000); // Auto-hide after 3 seconds
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar
                open={open} // Ensure Snackbar only opens when needed
                autoHideDuration={3000}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                onClose={() => setOpen(false)}
                sx={{ top: 20 }}
            >
                {notification ? (
                    <Alert
                        severity={notification.type}
                        onClose={() => setOpen(false)}
                        sx={{
                            backgroundColor: notification.type === "success" ? "#1B5E20" : "#B71C1C",
                            color: "white",
                            "& .MuiAlert-icon": {
                                color: "white", // ✅ Force icon to be white
                            },
                        }}
                    >
                        {notification.message}
                    </Alert>

                ) : (
                    <></> // Empty fallback to prevent errors
                )}
            </Snackbar>
        </NotificationContext.Provider>
    );
};

// Custom hook to use notifications
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};

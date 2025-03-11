"use client";  // Ensure client-side rendering

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, CssBaseline, Toolbar, Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { isAuthenticated, logout } from "@utils/auth-helper-methods";

const drawerWidth = 240;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/auth"); // Redirect to /auth if not authenticated
        }
    }, [router]);

    const handleLogout = () => {
        logout();  // This function should clear the token or authentication state
        router.push("/auth");  // Redirect to login page after logout
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <CssBaseline />

            {/* Drawer (Sidebar) */}
            <Drawer
                variant="permanent"
                open
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", padding: "20px" },
                }}
            >
                <Toolbar />

                {/* Logo at the top of the Drawer */}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                    <Image
                        src="/logo.png" // Ensure the image is stored in the public folder
                        alt="Biltmore Care Homes Logo"
                        width={250}
                        height={250}
                        priority
                    />
                </Box>

                {/* Navigation List */}
                <List>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/dashboard">
                            <ListItemText primary="All Facilities" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/dashboard/add-facility">
                            <ListItemText primary="Add Facility" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/dashboard/reminders">
                            <ListItemText primary="Reminders" />
                        </ListItemButton>
                    </ListItem>
                </List>

                {/* Logout Button */}
                <Box sx={{ marginTop: 'auto', padding: '20px' }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Box>
            </Drawer>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    ml: `${drawerWidth}px`, // Offset content to avoid overlap with Drawer
                    backgroundColor: "#fff",
                }}
            >
                <Toolbar />
                {children} {/* This renders the child route components */}
            </Box>
        </Box>
    );
}

"use client";

import { JSX, useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Box, ListItemIcon } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InfoIcon from "@mui/icons-material/Info"; // About Us
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary"; // Gallery
import BuildIcon from "@mui/icons-material/Build"; // Services
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu"; // Menu
import EventNoteIcon from "@mui/icons-material/EventNote"; // Daily Activities
import ContactsIcon from "@mui/icons-material/Contacts"; // Contact
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from "next/navigation";
interface NavbarProps {
    facilityName: string;
    hasMenu: boolean;
    onNavigate: (section: string) => void;
}



const iconMap: Record<string, JSX.Element> = {
    "about-us": <InfoIcon />,
    "gallery": <PhotoLibraryIcon />,
    "services": <BuildIcon />,
    "menu": <RestaurantMenuIcon />,
    "daily-activities": <EventNoteIcon />,
    "contact": <ContactsIcon />,
    "faq": <HelpOutlineIcon />
};

export default function Navbar({ facilityName, hasMenu, onNavigate }: NavbarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();
    const menuItems = [
        { label: "About Us", id: "about-us" },
        { label: "Gallery", id: "gallery" },
        { label: "Services", id: "services" },
        { label: "Daily Activities", id: "daily-activities" },
        ...(hasMenu ? [{ label: "Menu", id: "menu" }] : []), // Only show Menu if facility has one
        { label: "FAQ", id: "faq" },
        { label: "Contact", id: "contact" }
    ];

    const handleMenuClick = (id: string) => {
        setMobileOpen(false);
        onNavigate(id);
    };

    return (
        <AppBar position="sticky" sx={{ bgcolor: "#2C3E50" }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton onClick={() => router.push("/")} color="inherit">
                        <ArrowBackIcon fontSize="large" />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "white" }}>
                        {facilityName}
                    </Typography>
                </Box>


                {/* Desktop Navigation */}
                <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
                    {menuItems.map((item) => (
                        <Typography
                            key={item.id}
                            variant="body1"
                            sx={{
                                cursor: "pointer",
                                color: "white",
                                fontWeight: "500",
                                "&:hover": { textDecoration: "underline" }
                            }}
                            onClick={() => handleMenuClick(item.id)}
                        >
                            {item.label}
                        </Typography>
                    ))}
                </Box>

                {/* Mobile Navigation */}
                <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="menu"
                    sx={{ display: { xs: "block", md: "none" } }}
                    onClick={() => setMobileOpen(true)}
                >
                    <MenuIcon />
                </IconButton>
            </Toolbar>

            {/* Drawer for Mobile */}
            <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
                <List sx={{ width: 250 }}>
                    {menuItems.map((item) => (
                        <ListItem
                            key={item.id}
                            component="button"
                            onClick={() => onNavigate(item.id)}
                            sx={{ cursor: "pointer", display: "flex", alignItems: "center", background: 'transparent', border: 'none' }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {iconMap[item.id]} {/* Default icon */}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </AppBar>
    );
}

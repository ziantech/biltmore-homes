"use client";

import { useState } from "react";
import { Container, Paper, Typography, TextField, Button, Box, IconButton, Grid, Avatar } from "@mui/material";
import { Add, Delete, UploadFile } from "@mui/icons-material";
import { Facility } from "@lib/schemas/facility-schema";
import { useNotification } from "@context/NotificationContext";
import { useRouter } from "next/navigation";

export default function AddFacility() {
    // State for Facility Data
    const [facility, setFacility] = useState<Facility>({
        name: "",
        logo: "",
        address: "",
        city: "",
        state: "",
        zipcode: "",
        maxOccupancy: 0,
        availableBeds: 0,
        aboutUs: "",
        managerName: "",
        services: [""],
        dailyActivities: [""],
        pictures: [],
        menu: [], // ✅ Ensures it's always an array
        contacts: [{ type: "Phone", value: "" }],
    });

    const router = useRouter();

    const { showNotification } = useNotification()
    // Handle Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFacility((prev) => ({ ...prev, [name]: value }));
    };

    // Add & Remove Services
    const addService = () => {
        setFacility((prev) => ({ ...prev, services: [...prev.services, ""] }));
    };

    const removeService = (index: number) => {
        setFacility((prev) => ({
            ...prev,
            services: prev.services.filter((_, i) => i !== index),
        }));
    };

    // Add & Remove Daily Activities
    const addDailyActivity = () => {
        setFacility((prev) => ({ ...prev, dailyActivities: [...prev.dailyActivities, ""] }));
    };

    const removeDailyActivity = (index: number) => {
        setFacility((prev) => ({
            ...prev,
            services: prev.dailyActivities.filter((_, i) => i !== index),
        }));
    };

    // Add & Remove Contacts
    const addContact = () => {
        setFacility((prev) => ({
            ...prev,
            contacts: [...prev.contacts, { type: "Phone", value: "" }],
        }));
    };

    const removeContact = (index: number) => {
        setFacility((prev) => ({
            ...prev,
            contacts: prev.contacts.filter((_, i) => i !== index),
        }));
    };

    // Add & Remove Menu Items
    const addMenuItem = () => {
        setFacility((prev) => ({
            ...prev,
            menu: [...prev.menu!, { day: "", breakfast: [""], lunch: [""], dinner: [""], snacks: [""] }],
        }));
    };

    const removeMenuItem = (index: number) => {
        setFacility((prev) => ({
            ...prev,
            menu: prev.menu!.filter((_, i) => i !== index),
        }));
    };



    // Handle File Uploads
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const file = e.target.files[0];
            const fileURL = URL.createObjectURL(file);
            setFacility((prev) => ({ ...prev, logo: fileURL }));
        }
    };

    const handlePicturesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            const files = Array.from(e.target.files);
            const fileURLs = files.map((file) => URL.createObjectURL(file));
            setFacility((prev) => ({ ...prev, pictures: [...prev.pictures, ...fileURLs] }));
        }
    };

    // Remove uploaded images
    const removeLogo = () => {
        setFacility((prev) => ({ ...prev, logo: "" }));
    };

    const removePicture = (index: number) => {
        setFacility((prev) => ({
            ...prev,
            pictures: prev.pictures.filter((_, i) => i !== index),
        }));
    };
    const addMealItem = (menuIndex: number, mealType: "breakfast" | "lunch" | "dinner" | "snacks") => {
        setFacility((prev) => {
            const updatedMenu = [...prev.menu!];
            (updatedMenu[menuIndex][mealType] as string[]).push("");
            return { ...prev, menu: updatedMenu };
        });
    };

    const removeMealItem = (menuIndex: number, mealType: "breakfast" | "lunch" | "dinner" | "snacks", itemIndex: number) => {
        setFacility((prev) => {
            const updatedMenu = [...prev.menu!];
            updatedMenu[menuIndex][mealType] = (updatedMenu[menuIndex][mealType] as string[]).filter((_, i) => i !== itemIndex);
            return { ...prev, menu: updatedMenu };
        });
    };
    const handleAddFacility = async () => {
        // Ensure required fields are filled
        if (!facility.name || !facility.address || !facility.city || !facility.state || !facility.zipcode || !facility.managerName) {
            showNotification("Please fill in all required fields!", "error");
            return;
        }

        // Create folder name
        const facilityFolder = facility.name.trim().toLowerCase().replace(/\s+/g, "_");

        // eslint-disable-next-line prefer-const
        let updatedFacility: Facility = { ...facility, logo: "", pictures: [] };

        // Upload Logo
        if (facility.logo) {
            const formData = new FormData();
            formData.append("file", await fetch(facility.logo).then(res => res.blob()));
            formData.append("folder", facilityFolder);
            formData.append("name", "logo"); // Logo is always "logo.jpg" or "logo.png"

            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();

            if (res.ok) {
                updatedFacility.logo = data.url;
            } else {
                showNotification(data.error, "error");
                return;
            }
        }

        // Upload Pictures
        const pictureUrls: string[] = [];
        for (let i = 0; i < facility.pictures.length; i++) {
            const pic = facility.pictures[i];

            const formData = new FormData();
            formData.append("file", await fetch(pic).then(res => res.blob()));
            formData.append("folder", facilityFolder);
            formData.append("name", `image_${i + 1}`); // Images named as "image_1.jpg", "image_2.jpg"

            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();

            if (res.ok) {
                pictureUrls.push(data.url);
            } else {
                showNotification(data.error, "error");
                return;
            }
        }

        updatedFacility.pictures = pictureUrls;

        // Send Facility Data to Backend
        const response = await fetch("/api/facility", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedFacility),
        });


        const result = await response.json();

        if (response.ok) {
            showNotification("Facility added successfully!", "success");

            // Redirect to /dashboard/{facility_id} after 1.5 seconds
            setTimeout(() => {
                router.push(`/dashboard/${result.facility.id}`);
            }, 1500);
        } else {
            showNotification("Error adding facility!", "error");
        }

    };


    return (
        <Container maxWidth="md" sx={{ ml: 0 }}>


            <Paper elevation={3} sx={{ padding: 4, borderRadius: 3, width: "100%" }}>
                <Typography variant="h4" fontWeight="bold" color="primary" textAlign="center" gutterBottom>
                    Add a New Facility
                </Typography>

                {/* Facility Details */}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField label="Facility Name" name="name" fullWidth onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="Address" name="address" fullWidth onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="City" name="city" fullWidth onChange={handleChange} />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField label="State" name="state" fullWidth onChange={handleChange} />
                    </Grid>
                    <Grid item xs={3}>
                        <TextField label="Zipcode" name="zipcode" fullWidth onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="Max Occupancy" name="maxOccupancy" type="number" fullWidth onChange={handleChange} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField label="Available Beds" name="availableBeds" type="number" fullWidth onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="Manager Name" name="managerName" fullWidth onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="About Us" name="aboutUs" multiline rows={3} fullWidth onChange={handleChange} />
                    </Grid>
                </Grid>

                {/* File Upload - Logo */}
                <Box mt={3} display="flex" flexDirection="column" alignItems="center">
                    <Button variant="outlined" startIcon={<UploadFile />} component="label">
                        Upload Facility Logo
                        <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                    </Button>
                    {facility.logo && (
                        <Box mt={2} position="relative">
                            <Avatar src={facility.logo} sx={{ width: 80, height: 80 }} />
                            <IconButton
                                sx={{ position: "absolute", top: 0, right: 0 }}
                                onClick={removeLogo}
                            >
                                <Delete />
                            </IconButton>
                        </Box>
                    )}
                </Box>

                {/* File Upload - Pictures */}
                <Box mt={3} display="flex" flexDirection="column" alignItems="center">
                    <Button variant="outlined" startIcon={<UploadFile />} component="label">
                        Upload Facility Pictures
                        <input type="file" hidden multiple accept="image/*" onChange={handlePicturesUpload} />
                    </Button>
                    <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                        {facility.pictures.map((picture, index) => (
                            <Box key={index} position="relative">
                                <Avatar src={picture} variant="rounded" sx={{ width: 80, height: 80 }} />
                                <IconButton
                                    sx={{ position: "absolute", top: 0, right: 0 }}
                                    onClick={() => removePicture(index)}
                                >
                                    <Delete />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                </Box>
                {/* Services */}
                <Box mt={3}>
                    <Typography variant="h6">Services</Typography>
                    {facility.services.map((service, index) => (
                        <Box key={index} display="flex" alignItems="center" mt={1}>
                            <TextField fullWidth value={service} onChange={(e) => {
                                const updated = [...facility.services];
                                updated[index] = e.target.value;
                                setFacility({ ...facility, services: updated });
                            }} />
                            <IconButton onClick={() => removeService(index)}><Delete /></IconButton>
                        </Box>
                    ))}
                    <Button startIcon={<Add />} onClick={addService}>Add Service</Button>
                </Box>
                <Box mt={3}>
                    <Typography variant="h6">Daily Activities</Typography>
                    {facility.dailyActivities.map((da, index) => (
                        <Box key={index} display="flex" alignItems="center" mt={1}>
                            <TextField fullWidth value={da} onChange={(e) => {
                                const updated = [...facility.dailyActivities];
                                updated[index] = e.target.value;
                                setFacility({ ...facility, dailyActivities: updated });
                            }} />
                            <IconButton onClick={() => removeDailyActivity(index)}><Delete /></IconButton>
                        </Box>
                    ))}
                    <Button startIcon={<Add />} onClick={addDailyActivity}>Add Daily Activity</Button>
                </Box>
                {/* Menu */}
                <Box mt={3}>
                    <Typography variant="h6">Menu</Typography>
                    {facility.menu!.map((menuItem, menuIndex) => (
                        <Paper key={menuIndex} sx={{ p: 2, mt: 2, borderRadius: 2 }}>
                            {/* Day Input */}
                            <Box display="flex" alignItems="center" mb={2}>
                                <TextField
                                    label="Day"
                                    fullWidth
                                    value={menuItem.day}
                                    onChange={(e) => {
                                        const updatedMenu = [...facility.menu!];
                                        updatedMenu[menuIndex].day = e.target.value;
                                        setFacility({ ...facility, menu: updatedMenu });
                                    }}
                                />
                                <IconButton onClick={() => removeMenuItem(menuIndex)}>
                                    <Delete />
                                </IconButton>
                            </Box>

                            {/* Meal Sections */}
                            {(["breakfast", "lunch", "dinner", "snacks"] as const).map((mealType) => (
                                <Box key={mealType} mt={2}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                                    </Typography>

                                    {(menuItem[mealType] as string[]).map((item: string, itemIndex: number) => (
                                        <Box key={itemIndex} display="flex" alignItems="center" mt={1}>
                                            <TextField
                                                fullWidth
                                                value={item}
                                                onChange={(e) => {
                                                    const updatedMenu = [...facility.menu!];
                                                    (updatedMenu[menuIndex][mealType] as string[])[itemIndex] = e.target.value;
                                                    setFacility({ ...facility, menu: updatedMenu });
                                                }}
                                            />
                                            <IconButton onClick={() => removeMealItem(menuIndex, mealType, itemIndex)}>
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    ))}

                                    <Button startIcon={<Add />} onClick={() => addMealItem(menuIndex, mealType)}>
                                        Add {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Item
                                    </Button>
                                </Box>
                            ))}
                        </Paper>
                    ))}
                    <Button startIcon={<Add />} onClick={addMenuItem}>Add Menu Day</Button>
                </Box>


                {/* Contacts */}
                <Box mt={3}>
                    <Typography variant="h6">Contacts</Typography>
                    {facility.contacts.map((contact, index) => (
                        <Box key={index} display="flex" alignItems="center" mt={1} gap={1}>
                            {/* Contact Type Dropdown */}
                            <TextField
                                select
                                value={contact.type}
                                onChange={(e) => {
                                    const updated = [...facility.contacts];
                                    updated[index].type = e.target.value as "Phone" | "Email" | "Fax";
                                    setFacility({ ...facility, contacts: updated });
                                }}
                                SelectProps={{ native: true }}
                                sx={{ minWidth: 120 }}
                            >
                                <option value="Phone">Phone</option>
                                <option value="Email">Email</option>
                                <option value="Fax">Fax</option>
                            </TextField>

                            {/* Contact Value Input */}
                            <TextField
                                fullWidth
                                placeholder={`Enter ${contact.type}`}
                                value={contact.value}
                                onChange={(e) => {
                                    const updated = [...facility.contacts];
                                    updated[index].value = e.target.value;
                                    setFacility({ ...facility, contacts: updated });
                                }}
                            />

                            {/* Delete Contact Button */}
                            <IconButton onClick={() => removeContact(index)}>
                                <Delete />
                            </IconButton>
                        </Box>
                    ))}
                    <Button startIcon={<Add />} onClick={addContact}>Add Contact</Button>
                </Box>


                <Box mt={4} textAlign="right">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddFacility}
                    >
                        Add Facility
                    </Button>
                </Box>

            </Paper>
        </Container>
    );
}

"use client";  // Ensure client-side rendering

import { useParams } from "next/navigation";  // Correct import for useParams
import { Avatar, Box, Button, CircularProgress, Container, IconButton, Paper, TextField, Typography } from "@mui/material";
import { Facility } from "@lib/schemas/facility-schema";
import { useEffect, useState } from "react";
import { useNotification } from "@context/NotificationContext";
import { Edit, Save, Close, Delete, UploadFile, Add } from "@mui/icons-material";
export default function FacilityDetails() {
    const { facilityId } = useParams();

    const [facility, setFacility] = useState<Facility | null>(null)
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification()
    const [editField, setEditField] = useState<string | null>(null);
    const [tempValue, setTempValue] = useState<string>("");


    useEffect(() => {
        const fetchFacility = async () => {
            try {
                const res = await fetch(`/api/facility/${facilityId}`);
                const data = await res.json();
                if (res.ok) {
                    setFacility(data.facility);

                }
            } catch (error) {
                console.log(error)
                showNotification("Error fetching the facility", "error");
            }
            finally {
                setLoading(false)
            }
        }

        if (facilityId) {
            fetchFacility()
        }
    }, [facilityId, showNotification])

    if (loading) {
        return (
            <Container>
                <Typography variant="h4">Loading Facility Details...</Typography>
                <CircularProgress />
            </Container>
        );
    }
    const handleEdit = (field: keyof Facility) => {
        setEditField(field);
        setTempValue(String(facility?.[field] || ""));
    };

    // Handle Cancel
    const handleCancel = () => {
        setEditField(null);
        setTempValue("");
    };

    // Handle Save
    const handleSave = async (field: keyof Facility) => {
        if (!facility) return;

        const updatedFacility = { ...facility, [field]: tempValue };
        setFacility(updatedFacility);
        setEditField(null);

        try {
            // Send update to backend
            const res = await fetch(`/api/facility/${facilityId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field, value: tempValue }),
            });

            const data = await res.json(); // ✅ Get response message

            if (!res.ok) {
                showNotification(data.error || "Error updating facility!", "error");
            } else {
                showNotification(data.message || "Facility updated successfully!", "success");
            }
        } catch (error) {
            console.log(error)
            showNotification("Unexpected error occurred!", "error");
        }
    };


    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !facility) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", facility.name.toLowerCase().replace(/\s+/g, "_"));
        formData.append("name", "logo");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (res.ok) {
            // ✅ Update database with the new logo path
            const updateRes = await fetch(`/api/facility/${facility.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field: "logo", value: data.url }),
            });

            const updateData = await updateRes.json();
            showNotification(updateData.message, updateRes.ok ? "success" : "error");

            if (updateRes.ok) {
                setFacility((prev) => prev ? { ...prev, logo: data.url } : prev);
            }
        } else {
            showNotification("Error uploading logo!", "error");
        }
    };

    const removeLogo = async () => {
        if (!facility?.logo) return;

        const res = await fetch(`/api/delete-file`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath: facility.logo, facilityId: facility.id }),
        });

        const data = await res.json();
        showNotification(data.message, res.ok ? "success" : "error");

        if (res.ok) {
            setFacility((prev) => prev ? { ...prev, logo: "" } : prev);
        }
    };

    const handlePicturesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !facility) return;

        const files = Array.from(e.target.files);
        const uploadedUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", facility.name.toLowerCase().replace(/\s+/g, "_"));
            formData.append("name", `image_${facility.pictures.length + i + 1}`);

            const res = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await res.json();

            if (res.ok) {
                uploadedUrls.push(data.url);
            } else {
                showNotification("Error uploading picture!", "error");
                return;
            }
        }

        // ✅ Update database with new pictures
        const updateRes = await fetch(`/api/facility/${facility.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ field: "pictures", value: [...facility.pictures, ...uploadedUrls] }),
        });

        const updateData = await updateRes.json();
        showNotification(updateData.message, updateRes.ok ? "success" : "error");

        if (updateRes.ok) {
            setFacility((prev) => prev ? { ...prev, pictures: [...prev.pictures, ...uploadedUrls] } : prev);
        }
    };

    const removePicture = async (index: number) => {
        if (!facility || !facility.pictures[index]) return;

        const pictureToDelete = facility.pictures[index];

        const res = await fetch(`/api/delete-file`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath: pictureToDelete, facilityId: facility.id }),
        });

        const data = await res.json();
        showNotification(data.message, res.ok ? "success" : "error");

        if (res.ok) {
            setFacility((prev) =>
                prev ? { ...prev, pictures: prev.pictures.filter((_, i) => i !== index) } : prev
            );
        }
    };

    // ✅ Save changes to the database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saveChanges = async (field: keyof Facility, value: any) => {
        if (!facility) return;
        let valueToParse;

        if (field === 'maxOccupancy' || field === 'availableBeds') {
            valueToParse = Number(value)
        } else {
            valueToParse = value;
        }
        const res = await fetch(`/api/facility/${facility.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ field, valueToParse }),
        });

        const data = await res.json();
        showNotification(res.ok ? "Facility Updated Successfully" : data.message, res.ok ? "success" : "error");

        if (res.ok) {
            setFacility((prev) => prev ? { ...prev, [field]: value } : prev);
        }
    };

    // ✅ Add a service
    const addService = () => {
        const updatedServices = [...facility!.services, ""];
        setFacility((prev) => prev ? { ...prev, services: updatedServices } : prev);
    };

    // ✅ Remove a service
    const removeService = (index: number) => {
        const updatedServices = facility!.services.filter((_, i) => i !== index);
        setFacility((prev) => prev ? { ...prev, services: updatedServices } : prev);
    };

    // ✅ Add a daily activity
    const addDailyActivity = () => {
        const updatedActivities = [...facility!.dailyActivities, ""];
        setFacility((prev) => prev ? { ...prev, dailyActivities: updatedActivities } : prev);
    };

    // ✅ Remove a daily activity
    const removeDailyActivity = (index: number) => {
        const updatedActivities = facility!.dailyActivities.filter((_, i) => i !== index);
        setFacility((prev) => prev ? { ...prev, dailyActivities: updatedActivities } : prev);
    };

    // ✅ Add a contact
    const addContact = () => {
        const updatedContacts: Facility["contacts"] = [...facility!.contacts, { type: "Phone", value: "" }];
        setFacility((prev) => prev ? { ...prev, contacts: updatedContacts } : prev);
    };

    const removeContact = (index: number) => {
        const updatedContacts: Facility["contacts"] = facility!.contacts.filter((_, i) => i !== index);
        setFacility((prev) => prev ? { ...prev, contacts: updatedContacts } : prev);
    };


    // ✅ Add a menu item
    const addMenuItem = () => {
        const updatedMenu = [...facility!.menu!, { day: "", breakfast: [""], lunch: [""], dinner: [""], snacks: [""] }];
        setFacility((prev) => prev ? { ...prev, menu: updatedMenu } : prev);
    };

    // ✅ Remove a menu item
    const removeMenuItem = (index: number) => {
        const updatedMenu = facility!.menu!.filter((_, i) => i !== index);
        setFacility((prev) => prev ? { ...prev, menu: updatedMenu } : prev);
    };

    // ✅ Add a meal item to a menu category (e.g., breakfast, lunch)
    const addMealItem = (menuIndex: number, mealType: "breakfast" | "lunch" | "dinner" | "snacks") => {
        const updatedMenu = [...facility!.menu!];
        updatedMenu[menuIndex][mealType].push("");
        setFacility((prev) => prev ? { ...prev, menu: updatedMenu } : prev);
    };

    // ✅ Remove a meal item from a category
    const removeMealItem = (menuIndex: number, mealType: "breakfast" | "lunch" | "dinner" | "snacks", itemIndex: number) => {
        const updatedMenu = [...facility!.menu!];
        updatedMenu[menuIndex][mealType] = updatedMenu[menuIndex][mealType].filter((_, i) => i !== itemIndex);
        setFacility((prev) => prev ? { ...prev, menu: updatedMenu } : prev);
    };

    return (
        <Container>
            <Typography variant="h4" gutterBottom>Facility Details</Typography>

            {/* Name Field */}
            <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">Name:</Typography>
                {editField === "name" ? (
                    <>
                        <TextField value={tempValue} onChange={(e) => setTempValue(e.target.value)} sx={{ ml: 2 }} />
                        <IconButton onClick={() => handleSave("name")}><Save /></IconButton>
                        <IconButton onClick={handleCancel}><Close /></IconButton>
                    </>
                ) : (
                    <>
                        <Typography sx={{ ml: 2 }}>{facility?.name}</Typography>
                        <IconButton onClick={() => handleEdit("name")}><Edit /></IconButton>
                    </>
                )}
            </Box>

            {/* Address Field */}
            <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">Address:</Typography>
                {editField === "address" ? (
                    <>
                        <TextField value={tempValue} onChange={(e) => setTempValue(e.target.value)} sx={{ ml: 2 }} />
                        <IconButton onClick={() => handleSave("address")}><Save /></IconButton>
                        <IconButton onClick={handleCancel}><Close /></IconButton>
                    </>
                ) : (
                    <>
                        <Typography sx={{ ml: 2 }}>{facility?.address}</Typography>
                        <IconButton onClick={() => handleEdit("address")}><Edit /></IconButton>
                    </>
                )}
            </Box>

            {/* City Field */}
            <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">City:</Typography>
                {editField === "city" ? (
                    <>
                        <TextField value={tempValue} onChange={(e) => setTempValue(e.target.value)} sx={{ ml: 2 }} />
                        <IconButton onClick={() => handleSave("city")}><Save /></IconButton>
                        <IconButton onClick={handleCancel}><Close /></IconButton>
                    </>
                ) : (
                    <>
                        <Typography sx={{ ml: 2 }}>{facility?.city}</Typography>
                        <IconButton onClick={() => handleEdit("city")}><Edit /></IconButton>
                    </>
                )}
            </Box>

            {/* Add more fields here (state, zipcode, managerName, aboutUs, etc.) using the same pattern */}

            <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">State:</Typography>
                {editField === "state" ? (
                    <>
                        <TextField value={tempValue} onChange={(e) => setTempValue(e.target.value)} sx={{ ml: 2 }} />
                        <IconButton onClick={() => handleSave("state")}><Save /></IconButton>
                        <IconButton onClick={handleCancel}><Close /></IconButton>
                    </>
                ) : (
                    <>
                        <Typography sx={{ ml: 2 }}>{facility?.state}</Typography>
                        <IconButton onClick={() => handleEdit("state")}><Edit /></IconButton>
                    </>
                )}
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">Zipcode:</Typography>
                {editField === "zipcode" ? (
                    <>
                        <TextField value={tempValue} onChange={(e) => setTempValue(e.target.value)} sx={{ ml: 2 }} />
                        <IconButton onClick={() => handleSave("zipcode")}><Save /></IconButton>
                        <IconButton onClick={handleCancel}><Close /></IconButton>
                    </>
                ) : (
                    <>
                        <Typography sx={{ ml: 2 }}>{facility?.zipcode}</Typography>
                        <IconButton onClick={() => handleEdit("zipcode")}><Edit /></IconButton>
                    </>
                )}
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">Manager Name:</Typography>
                {editField === "managerName" ? (
                    <>
                        <TextField value={tempValue} onChange={(e) => setTempValue(e.target.value)} sx={{ ml: 2 }} />
                        <IconButton onClick={() => handleSave("managerName")}><Save /></IconButton>
                        <IconButton onClick={handleCancel}><Close /></IconButton>
                    </>
                ) : (
                    <>
                        <Typography sx={{ ml: 2 }}>{facility?.managerName}</Typography>
                        <IconButton onClick={() => handleEdit("managerName")}><Edit /></IconButton>
                    </>
                )}
            </Box>


            <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">Max Occupancy:</Typography>
                {editField === "maxOccupancy" ? (
                    <>
                        <TextField type="number" value={tempValue} onChange={(e) => setTempValue(e.target.value)} sx={{ ml: 2 }} />
                        <IconButton onClick={() => handleSave("maxOccupancy")}><Save /></IconButton>
                        <IconButton onClick={handleCancel}><Close /></IconButton>
                    </>
                ) : (
                    <>
                        <Typography sx={{ ml: 2 }}>{facility?.maxOccupancy}</Typography>
                        <IconButton onClick={() => handleEdit("maxOccupancy")}><Edit /></IconButton>
                    </>
                )}
            </Box>


            <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">Available Beds:</Typography>
                {editField === "availableBeds" ? (
                    <>
                        <TextField type="number" value={tempValue} onChange={(e) => setTempValue(e.target.value)} sx={{ ml: 2 }} />
                        <IconButton onClick={() => handleSave("availableBeds")}><Save /></IconButton>
                        <IconButton onClick={handleCancel}><Close /></IconButton>
                    </>
                ) : (
                    <>
                        <Typography sx={{ ml: 2 }}>{facility?.availableBeds}</Typography>
                        <IconButton onClick={() => handleEdit("availableBeds")}><Edit /></IconButton>
                    </>
                )}
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="h6">About Us:</Typography>
                {editField === "aboutUs" ? (
                    <>
                        <TextField multiline rows={3} type="text" value={tempValue} onChange={(e) => setTempValue(e.target.value)} sx={{ ml: 2 }} fullWidth />
                        <IconButton onClick={() => handleSave("aboutUs")}><Save /></IconButton>
                        <IconButton onClick={handleCancel}><Close /></IconButton>
                    </>
                ) : (
                    <>
                        <Typography sx={{ ml: 2 }}>{facility?.aboutUs}</Typography>
                        <IconButton onClick={() => handleEdit("aboutUs")}><Edit /></IconButton>
                    </>
                )}
            </Box>

            {/* Facility Logo */}
            <Box mt={3} display="flex" alignItems="center" gap={2}>
                {facility!.logo === '' ? (
                    <Button variant="contained" color="primary" startIcon={<UploadFile />} component="label">
                        Upload Facility Logo
                        <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                    </Button>
                ) : (
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar src={facility!.logo} sx={{ width: 100, height: 100 }} />
                        <IconButton color="error" onClick={removeLogo}>
                            <Delete />
                        </IconButton>
                    </Box>
                )}
            </Box>

            {/* Facility Pictures */}
            <Box mt={3} >
                <Button variant="contained" color="primary" startIcon={<UploadFile />} component="label">
                    Upload Facility Pictures
                    <input type="file" hidden multiple accept="image/*" onChange={handlePicturesUpload} />
                </Button>
                <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
                    {facility?.pictures!.map((picture, index) => (
                        <Box key={index} position="relative">
                            <Avatar src={picture} variant="rounded" sx={{ width: 120, height: 120 }} />
                            <IconButton
                                sx={{
                                    position: "absolute",
                                    top: 5,
                                    right: 5,
                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                    color: "white",
                                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
                                }}
                                onClick={() => removePicture(index)}
                            >
                                <Delete />
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box mt={3}>
                <Typography variant="h6">Services</Typography>
                {/* Services */}
                {facility?.services?.length ? (
                    facility.services.map((service, index) => (
                        <Box key={index} display="flex" alignItems="center" mt={1}>
                            <TextField
                                fullWidth
                                value={service}
                                onChange={(e) => {
                                    const updated = [...facility.services];
                                    updated[index] = e.target.value;
                                    setFacility((prev) => prev ? { ...prev, services: updated } : prev);
                                }}
                            />
                            <IconButton onClick={() => removeService(index)}>
                                <Delete />
                            </IconButton>
                        </Box>
                    ))
                ) : (
                    <Typography>No services added yet.</Typography>
                )}

                <Button startIcon={<Add />} onClick={addService}>Add Service</Button>
            </Box>
            <Box mt={3}>
                <Typography variant="h6">Daily Activities</Typography>
                {/* Daily Activities */}
                {facility?.dailyActivities?.length ? (
                    facility.dailyActivities.map((da, index) => (
                        <Box key={index} display="flex" alignItems="center" mt={1}>
                            <TextField
                                fullWidth
                                value={da}
                                onChange={(e) => {
                                    const updated = [...facility.dailyActivities];
                                    updated[index] = e.target.value;
                                    setFacility((prev) => prev ? { ...prev, dailyActivities: updated } : prev);
                                }}
                            />
                            <IconButton onClick={() => removeDailyActivity(index)}>
                                <Delete />
                            </IconButton>
                        </Box>
                    ))
                ) : (
                    <Typography>No daily activities added yet.</Typography>
                )}

                <Button startIcon={<Add />} onClick={addDailyActivity}>Add Daily Activity</Button>
            </Box>
            {/* Menu */}
            <Box mt={3}>
                <Typography variant="h6">Menu</Typography>
                {facility?.menu?.length ? (
                    facility?.menu!.map((menuItem, menuIndex) => (
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
                    ))
                ) : (
                    <Typography>No menu items added yet.</Typography>
                )}
                <Button startIcon={<Add />} onClick={addMenuItem}>Add Menu Day</Button>
            </Box>


            {/* Contacts */}
            <Box mt={3}>
                <Typography variant="h6">Contacts</Typography>
                {facility?.contacts.map((contact, index) => (
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
            <Typography>This Save Button is for Services, DailyActivites, Contacts and Menu Only</Typography>
            <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                onClick={() => {
                    saveChanges("services", facility!.services);
                    saveChanges("dailyActivities", facility!.dailyActivities);
                    saveChanges("contacts", facility!.contacts);
                    saveChanges("menu", facility!.menu);
                }}
            >
                Save Changes
            </Button>

        </Container>
    )
}

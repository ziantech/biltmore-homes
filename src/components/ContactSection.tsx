"use client";

import { Box, Container, Grid, Typography, TextField, Button, List, ListItem, ListItemText } from "@mui/material";

import { Facility } from "@lib/schemas/facility-schema";
import dynamic from "next/dynamic";
import emailjs from "emailjs-com";
import { useNotification } from "@context/NotificationContext";
import { useState } from "react";
// ✅ Dynamically import MapFacility to avoid SSR issues
const MapFacility = dynamic(() => import("./map/Map2"), { ssr: false });
export default function ContactSection({ facility }: { facility: Facility }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const { showNotification } = useNotification()
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        console.log(formData)
        if (formData.email === "" || formData.message === "" || formData.name === "" || formData.phone === "") {
            showNotification("All fields are required", "error");
            return;
        }
        try {
            const formDataToParse = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: formData.message,
                facility: facility.name,
                facility_email: facility.contacts.find(contact => contact.type === "Email")?.value || ""
            };

            const response = await emailjs.send("service_0b2tw7y", "template_bkljvvq", formDataToParse, "6V7mYv_tBaYkap01C");
            if (response.status === 200) {
                showNotification("Message Successfully Sent. Someone will contact you shorthly", "success");
                setFormData({ name: "", email: "", phone: "", message: "" });
            }
        } catch (error) {
            console.error("EmailJS Error:", error);
            alert("Error sending message.");
        }
    }

    return (
        <Box id="contact" sx={{ width: "100%", mt: 6, px: 2 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" fontWeight="bold" gutterBottom color="primary" textAlign="center">
                    Contact Us
                </Typography>

                <Grid container spacing={4} alignItems="center">
                    {/* Left Side: Map */}
                    {/* Left Side: Map */}
                    <Grid item xs={12} md={6} sx={{ minHeight: "300px" }}>
                        <Box sx={{ width: "100%", height: "100%", minHeight: "300px", borderRadius: "8px", overflow: "hidden" }}>
                            <MapFacility facility={facility} />
                        </Box>
                    </Grid>


                    {/* Right Side: Contact Info & Form */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" fontWeight="bold">
                            Give us a call! Schedule a tour.
                        </Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
                            Manager: {facility.managerName}
                        </Typography>

                        {/* Contact Details List */}
                        <List>
                            {facility.contacts.map((contact, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={`${contact.type}: ${contact.value}`} />
                                </ListItem>
                            ))}
                        </List>

                        {/* Contact Form */}
                        <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>
                            Send us a message
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>

                            <Grid item xs={12} sm={6}>
                                <TextField label="Name" name="name" fullWidth variant="outlined" onChange={(e) => handleChange(e)} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Phone" name="phone" fullWidth variant="outlined" onChange={(e) => handleChange(e)} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Email" name="email" fullWidth variant="outlined" onChange={(e) => handleChange(e)} />

                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Message" name="message" fullWidth multiline rows={4} variant="outlined" onChange={(e) => handleChange(e)} />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
                                    Send Message
                                </Button>
                            </Grid>

                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Facility } from "@lib/schemas/facility-schema";
import { Avatar, Box, Container, Divider, Grid, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material";
import Navbar from "@components/FacilityNavbar";
import Gallery from "@components/Gallery";
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FacilityMenu from "@components/TableMenu";
import FAQSection from "@components/FAQSection";
import ContactSection from "@components/ContactSection";


export default function FacilityDetails() {
    const { facilityId } = useParams();
    const [facility, setFacility] = useState<Facility | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFacility = async () => {
            try {
                const res = await fetch(`/api/facility/${facilityId}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch facility details.");
                }

                setFacility(data.facility);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        if (facilityId) {
            fetchFacility();
        }
    }, [facilityId]);

    if (loading) return <p>Loading facility details...</p>;
    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
    if (!facility) return <p>No facility found.</p>;

    // 🔥 Extract phone contact (First "Phone" contact found)
    const phoneContact = facility.contacts.find(contact => contact.type === "Phone")?.value || "N/A";

    // ✅ Function to format phone number (US format)
    const formatPhoneNumber = (phone: string) => {
        const cleaned = phone.replace(/\D/g, ""); // Remove non-numeric chars
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };
    const handleScroll = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };


    return (
        <>
            {/* 🔥 Top Contact Bar */}
            <Box
                sx={{
                    width: "100%",
                    backgroundColor: "#B8860B", // Darker elegant yellow
                    color: "white",
                    py: 1,
                    position: 'sticky'
                }}

            >
                <Box sx={{ width: "100%", bgcolor: "#b8860b", color: "white", py: 1, px: 2, textAlign: "center", fontWeight: "bold" }}>
                    Call {facility?.managerName}: <strong>{formatPhoneNumber(phoneContact)}</strong> | Schedule your tour today!
                </Box>

            </Box>
            <Navbar facilityName={facility.name} hasMenu={facility.menu!.length > 0} onNavigate={handleScroll} />
            {/* Facility Content */}
            <Container maxWidth={false} sx={{ width: "100%", margin: 0, padding: "0 24px" }}>
                <Gallery images={facility.pictures} />
                <Box id="about-us" sx={{ width: "100%", mt: 6, textAlign: "center", px: 2 }}>
                    {/* Facility Logo */}
                    {facility.logo && (
                        <Avatar
                            src={facility.logo}
                            alt={facility.name}
                            sx={{
                                width: 220,
                                height: 220,
                                mx: "auto",
                                mb: 2,
                                border: "4px solid #B8860B", // Stylish border
                                boxShadow: 3,
                            }}
                        />
                    )}

                    {/* Welcome Heading */}
                    <Typography variant="h4" fontWeight="bold" color="primary" mb={2}>
                        Welcome to {facility.name}
                    </Typography>

                    {/* About Us Text */}
                    <Typography variant="body1" color="textSecondary" sx={{ maxWidth: "800px", mx: "auto", textAlign: "justify", lineHeight: 1.8 }}>
                        {facility.aboutUs}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 4,
                            mt: 4,
                            flexWrap: "wrap",
                        }}
                    >
                        {/* Max Occupancy Card */}
                        <Box
                            sx={{
                                width: { xs: "100%", sm: "300px" },
                                textAlign: "center",
                                p: 3,
                                borderRadius: 2,
                                boxShadow: 2,
                                border: "2px solid #B8860B",
                            }}
                        >
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                Max Occupancy
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" color="textSecondary">
                                {facility.maxOccupancy}
                            </Typography>
                        </Box>

                        {/* Available Beds Card */}
                        <Box
                            sx={{
                                width: { xs: "100%", sm: "300px" },
                                textAlign: "center",
                                p: 3,
                                borderRadius: 2,
                                boxShadow: 2,
                                border: "2px solid #B8860B",
                            }}
                        >
                            <Typography variant="h5" fontWeight="bold" color="primary">
                                Available Beds
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" color="textSecondary">
                                {facility.availableBeds}
                            </Typography>
                        </Box>
                    </Box>

                </Box>
                <Box display="flex" alignItems="center" justifyContent="center" my={5}>
                    <Divider sx={{ flexGrow: 1, borderColor: "#aaa" }} />
                    <Typography variant="h6" sx={{ px: 2, color: "gray" }}>
                        ✦ ✦ ✦
                    </Typography>
                    <Divider sx={{ flexGrow: 1, borderColor: "#aaa" }} />
                </Box>

                {/* Services Section */}
                <Box
                    id="services"
                    sx={{
                        width: "100%",
                        mt: 6,
                        px: 2,
                        py: 5, // Add padding for spacing
                        backgroundColor: "rgba(184, 134, 11, 0.1)", // Elegant transparent yellow
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <Container maxWidth="lg">
                        <Grid container spacing={4} alignItems="center">
                            {/* Left Side: Title & Description */}
                            <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <Typography variant="h4" fontWeight="bold" gutterBottom>
                                    Our Services
                                </Typography>
                                <Typography variant="body1" color="textSecondary">
                                    At <strong>{facility.name}</strong>, we are dedicated to providing exceptional assisted living services tailored to the unique needs of every resident. We understand that transitioning to an assisted living facility is a significant step, and our compassionate team is committed to creating a warm, secure, and enriching environment that feels just like home.
                                    <br />
                                    Our services are designed to promote dignity, independence, and quality of life, ensuring that each resident receives the personalized attention they deserve. From 24/7 professional caregiving to engaging social activities, we strive to foster a sense of community, comfort, and well-being.
                                    <br />
                                    We take pride in offering a holistic approach to care, focusing not just on physical health but also on emotional, social, and mental well-being. Our dedicated professionals are trained to assist with daily activities, medication management, and specialized care plans while maintaining a respectful and nurturing atmosphere.
                                    <br />
                                    At <strong>{facility.name}</strong>, we go beyond basic care – we create a supportive and engaging lifestyle where residents can thrive with confidence, security, and a renewed sense of purpose. Our commitment to excellence ensures that families have peace of mind, knowing their loved ones are in caring and capable hands.
                                </Typography>
                            </Grid>

                            {/* Right Side: List of Services */}
                            <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <List sx={{ width: "100%", maxWidth: 400 }}>
                                    {facility.services.length > 0 ? (
                                        facility.services.map((service, index) => (
                                            <ListItem key={index} sx={{ py: 0.5 }}>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primary={service} />
                                            </ListItem>
                                        ))
                                    ) : (
                                        <Typography variant="body1" color="textSecondary">
                                            No services listed at the moment.
                                        </Typography>
                                    )}
                                </List>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>


                <Box id="daily-activities" sx={{ width: "100%", py: 5, px: 3 }}>
                    <Container maxWidth="lg">
                        <Grid container spacing={4} alignItems="center">
                            {/* Left Side: Title & Description */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h4" fontWeight="bold" gutterBottom>
                                    Daily Activities
                                </Typography>
                                <Typography variant="h6" fontWeight={"bold"} gutterBottom>
                                    Engaging Daily Activities for a Fulfilling Life
                                </Typography>
                                <Typography variant="body1" color="textSecondary">

                                    <br />
                                    At <strong>{facility.name}</strong>, we believe that staying active—both physically and mentally—is essential for a happy and fulfilling life. Our daily activities are designed to enrich the mind, body, and spirit, helping residents stay engaged, social, and independent while enjoying their golden years.
                                    <br />
                                    We offer a carefully curated selection of recreational, social, and wellness activities, ensuring that every resident can participate in something they truly enjoy. Whether it’s gentle exercise classes, music therapy, arts and crafts, or engaging group discussions, there is always an opportunity to stay connected and inspired.
                                    <br />
                                    Our goal is to create a vibrant and supportive community where residents can explore new hobbies, strengthen friendships, and maintain an active and fulfilling lifestyle. Whether it’s a morning stretch, an afternoon of gardening, or an evening of games and storytelling, every day at {facility.name} is filled with joy, connection, and meaningful engagement.
                                    <br />
                                    Because here, every moment matters.
                                </Typography>
                            </Grid>

                            {/* Right Side: List of Services */}
                            <Grid item xs={12} md={6}>
                                <List>
                                    {facility.dailyActivities.length > 0 ? (
                                        facility.dailyActivities.map((service, index) => (
                                            <ListItem key={index} sx={{ py: 0.5 }}>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="primary" />
                                                </ListItemIcon>
                                                <ListItemText primary={service} />
                                            </ListItem>
                                        ))
                                    ) : (
                                        <Typography variant="body1" color="textSecondary">
                                            No services listed at the moment.
                                        </Typography>
                                    )}
                                </List>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                <Box display="flex" alignItems="center" justifyContent="center" my={5}>
                    <Divider sx={{ flexGrow: 1, borderColor: "#aaa" }} />
                    <Typography variant="h6" sx={{ px: 2, color: "gray" }}>
                        ✦ ✦ ✦
                    </Typography>
                    <Divider sx={{ flexGrow: 1, borderColor: "#aaa" }} />
                </Box>

                <FacilityMenu menu={facility.menu} />

                <Box display="flex" alignItems="center" justifyContent="center" my={5}>
                    <Divider sx={{ flexGrow: 1, borderColor: "#aaa" }} />
                    <Typography variant="h6" sx={{ px: 2, color: "gray" }}>
                        ✦ ✦ ✦
                    </Typography>
                    <Divider sx={{ flexGrow: 1, borderColor: "#aaa" }} />
                </Box>

                <FAQSection />

                <Box display="flex" alignItems="center" justifyContent="center" my={5}>
                    <Divider sx={{ flexGrow: 1, borderColor: "#aaa" }} />
                    <Typography variant="h6" sx={{ px: 2, color: "gray" }}>
                        ✦ ✦ ✦
                    </Typography>
                    <Divider sx={{ flexGrow: 1, borderColor: "#aaa" }} />
                </Box>

                <ContactSection facility={facility} />


            </Container>
            <Box component="footer" sx={{ bgcolor: "#2C3E50", color: "white", py: 4, mt: 6 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={3} justifyContent="center" textAlign="center">
                        {/* Left Side: Branding */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" fontWeight="bold">
                                {facility.name}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                                © {new Date().getFullYear()} {facility.name}. All Rights Reserved.
                            </Typography>
                        </Grid>

                        {/* Right Side: Quick Contact */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" fontWeight="bold">
                                Contact Us
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                                Have questions? Need more info?
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Call us at: <strong>{formatPhoneNumber(phoneContact)}</strong>
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
}

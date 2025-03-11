"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Card, CardContent, CardMedia, Typography, Button, Grid } from "@mui/material";

interface Facility {
    id: number;
    name: string;
    logo: string;
}

export default function DashboardHome() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await fetch("/api/facility");
                const data = await res.json();

                if (res.ok) {
                    setFacilities(data.facilities);
                } else {
                    console.error("Error fetching facilities:", data.error);
                }
            } catch (error) {
                console.error("Failed to fetch facilities", error);
            }
        };

        fetchFacilities();
    }, []);

    return (
        <Box p={3}>
            <Typography variant="h4" mb={3}>List of All Facilities</Typography>

            <Grid container spacing={3}>
                {facilities.map((facility) => (
                    <Grid item xs={12} sm={6} md={4} key={facility.id}>
                        <Card sx={{ cursor: "pointer", transition: "0.3s", "&:hover": { boxShadow: 6 } }}>
                            <CardMedia
                                component="img"
                                height="140"
                                image={facility.logo || "/default-placeholder.png"} // Fallback if no logo
                                alt={facility.name}
                            />
                            <CardContent>
                                <Typography variant="h6" gutterBottom>{facility.name}</Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => router.push(`/dashboard/${facility.id}`)}
                                >
                                    Go To
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

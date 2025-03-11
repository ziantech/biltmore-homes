"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Container, Grid, Card, CardContent, Typography, Button, Box } from "@mui/material";
import './page.module.css';
import { Facility } from "@lib/schemas/facility-schema";

// ✅ Import Leaflet Map dynamically (to prevent SSR issues)
const Map = dynamic(() => import("@components/map/Map"), { ssr: false });

export default function Home() {
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    const fetchFacilities = async () => {
      const res = await fetch("/api/facilities");

      const data = await res.json();


      if (res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedFacilities = data.facilities.map((facility: any) => ({
          id: facility.id,
          name: facility.name,
          logo: facility.logo || "",
          address: facility.address,
          city: facility.city,
          state: facility.state,
          zipcode: facility.zipcode,
          maxOccupancy: facility.max_occupancy ?? 0, // Ensure number type
          availableBeds: facility.available_beds ?? 0, // Ensure number type
          pictures: facility.pictures || [],

        }));

        setFacilities(formattedFacilities);
      }
    };

    fetchFacilities();
  }, []);

  return (
    <Box width="100%" display="flex" flexDirection="column" alignItems="center">
      {/* ✅ Logo */}
      <Box display="flex" justifyContent="center" my={4}>
        <Image src="/logo.png" alt="Biltmore Care Home" width={250} height={250} />
      </Box>

      {/* ✅ Facilities Section */}
      <Container maxWidth="lg">
        <Typography variant="h4" textAlign="center" gutterBottom>
          Our Facilities
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {facilities.map((facility) => (
            <Grid item xs={12} sm={6} md={4} key={facility.id}>
              <Card>
                <Image
                  src={facility.pictures?.[0] || "/placeholder.jpg"}
                  alt={facility.name}
                  width={400}
                  height={250}
                  style={{ objectFit: "cover", width: "100%" }}
                />
                <CardContent>
                  <Typography variant="h6">{facility.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {facility.address}, {facility.city}, {facility.state} {facility.zipcode}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Max Occupancy:</strong> {facility.maxOccupancy} | <strong>Available Beds:</strong> {facility.availableBeds}
                  </Typography>
                  <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} component={Link} href={`/${facility.id}`}>
                    View Facility
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ✅ Short Description */}
        <Box textAlign="center" my={5}>
          <Typography variant="h5" fontWeight="bold">
            A Home Where Our Residents Thrive
          </Typography>
          <Typography variant="body1" mt={2} color="textSecondary">
            At <strong>Biltmore Care Homes</strong>, we believe that home is more than just a place—it’s a feeling of warmth, security, and belonging. Our community is designed to provide a nurturing, supportive, and engaging environment, ensuring that every resident experiences comfort, fulfillment, and peace of mind.

            We prioritize health, safety, and happiness through personalized care and compassionate support, tailoring our services to meet the unique needs of each individual. Our dedicated team is committed to fostering independence, dignity, and well-being, offering assistance whenever needed while encouraging a sense of autonomy.

            Beyond care, we provide a vibrant social atmosphere, where residents can build lasting friendships, participate in enriching activities, and enjoy a lifestyle that promotes joy, purpose, and connection. Whether it’s sharing a meal with friends, taking part in wellness programs, or simply enjoying the tranquility of our inviting spaces, every day at <strong>Biltmore Care Homes</strong> is an opportunity to thrive.

            Because here, we don’t just provide care—we create a home filled with warmth, love, and a true sense of community.
          </Typography>
        </Box>
      </Container>

      {/* ✅ Map Section */}
      <Box width="100%" maxWidth="lg" px={2} my={3}>
        <Typography variant="h4" textAlign="center" my={3}>
          Our Locations
        </Typography>
        <Box height={400}>
          <Map facilities={facilities} />
        </Box>
      </Box>


      <Box component="footer" width="100%" textAlign="center" py={3} mt={5} bgcolor="#f4f4f4">
        <Typography variant="body2">
          © {new Date().getFullYear()} Biltmore Care Homes. All Rights Reserved.
        </Typography>
        <Typography variant="body2" mt={1}>
          {facilities.map((facility) => (
            <Link
              key={facility.id}
              href={`/${facility.id}`}
              style={{ margin: "0 10px", textDecoration: "none", color: "blue" }}
            >
              {facility.name}
            </Link>
          ))}
        </Typography>
      </Box>
    </Box>
  );
}

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Facility } from "@lib/schemas/facility-schema";
import FacilityMarker from "./FacilityMarker";


const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });

export default function MapFacility({ facility }: { facility: Facility }) {
    const [location, setLocation] = useState<{ lat: number; lon: number }>({ lat: 0, lon: 0 });

    useEffect(() => {
        const fetchCoordinates = async () => {
            let updatedLocation: { lat: number; lon: number } = { lat: 0, lon: 0 };

            const address = `${facility.address}, ${facility.city}, ${facility.state}, ${facility.zipcode}`;
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
            );
            const data = await response.json();

            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                updatedLocation = { lat, lon }
            }

            setLocation(updatedLocation);
        };

        fetchCoordinates();
    }, [facility]);


    function SetViewOnChange({ center }: { center: [number, number] }) {
        const map = useMap();
        map.setView(center);
        map.setZoom(10);
        return null;
    }

    return (
        <MapContainer style={{ height: "100%", minHeight: "600px", width: "100%" }}>
            <SetViewOnChange center={[location.lat, location.lon]} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <FacilityMarker key={facility.id} facility={facility} position={[location.lat, location.lon]} />


        </MapContainer>
    );
}
